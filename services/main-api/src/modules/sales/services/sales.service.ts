import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { InventoryApiClient } from '../../inventory/clients/inventory-api.client';
import { CashRegisterService } from '../../cash-register/services/cash-register.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { SaleStatus } from '../enums/sale-status.enum';
import { Sale, SaleDocument, SaleItem } from '../schemas/sale.schema';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    private readonly inventoryClient: InventoryApiClient,
    private readonly cashRegisterService: CashRegisterService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async create(userId: string, dto: CreateSaleDto): Promise<SaleDocument> {
    const idempotencyKey = dto.idempotencyKey ?? uuid();

    const existing = await this.saleModel.findOne({ idempotencyKey });
    if (existing) {
      return existing; // Idempotencia: reintentos no duplican la venta.
    }

    // 1. La caja debe estar abierta.
    const cashSession = await this.cashRegisterService.getOpenSession();

    // 2. Traemos los datos actuales de cada producto (precio, nombre, sku).
    const items: SaleItem[] = [];
    for (const item of dto.items) {
      const product = await this.inventoryClient.getProduct(item.productId);
      if (!product.isActive) {
        throw new BadRequestException(
          `El producto '${product.name}' no está disponible`,
        );
      }
      items.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPriceInCents: product.priceInCents,
        subtotalInCents: product.priceInCents * item.quantity,
        returnedQuantity: 0,
      });
    }

    const subtotalInCents = items.reduce((sum, i) => sum + i.subtotalInCents, 0);
    const discountInCents = dto.discountInCents ?? 0;
    const totalInCents = subtotalInCents - discountInCents;

    if (totalInCents < 0) {
      throw new BadRequestException(
        'El descuento no puede ser mayor al subtotal de la venta',
      );
    }

    const paidInCents = dto.payments.reduce((sum, p) => sum + p.amountInCents, 0);
    if (paidInCents !== totalInCents) {
      throw new BadRequestException(
        `El total pagado (${paidInCents}) no coincide con el total de la venta (${totalInCents})`,
      );
    }

    // 3. Reservamos stock en inventory-api (idempotente por idempotencyKey).
    const reservation = await this.inventoryClient.createReservation(
      idempotencyKey,
      dto.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );

    // 4. Creamos la venta como PENDING.
    let sale = await this.saleModel.create({
      idempotencyKey,
      clientId: dto.clientId,
      cashRegisterSessionId: (cashSession as any)._id.toString(),
      userId,
      items,
      payments: dto.payments,
      subtotalInCents,
      discountInCents,
      totalInCents,
      reservationId: reservation.id,
      status: SaleStatus.PENDING,
    });

    // 5. Confirmamos la reserva (descuenta stock definitivamente).
    try {
      await this.inventoryClient.confirmReservation(
        reservation.id,
        sale._id.toString(),
      );
    } catch (error) {
      this.logger.error(
        `No se pudo confirmar la reserva ${reservation.id} para la venta ${sale._id.toString()}, liberando.`,
      );
      await this.safeRelease(reservation.id);
      sale.status = SaleStatus.CANCELLED;
      sale.failureReason = 'No se pudo confirmar la reserva de stock';
      await sale.save();
      throw new BadRequestException(
        'No se pudo completar la venta: el inventario no pudo confirmarse',
      );
    }

    // 6. Actualizamos caja (solo el monto en efectivo afecta el arqueo).
    const cashPaid = dto.payments
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amountInCents, 0);
    if (cashPaid > 0) {
      await this.cashRegisterService.addToExpectedAmount(cashPaid);
    }

    // 7. Otorgamos puntos de fidelidad si la venta tiene cliente asociado.
    let loyaltyPointsEarned = 0;
    if (dto.clientId) {
      loyaltyPointsEarned = await this.loyaltyService.earnFromSale(
        dto.clientId,
        totalInCents,
        sale._id.toString(),
      );
    }

    sale.status = SaleStatus.COMPLETED;
    sale.loyaltyPointsEarned = loyaltyPointsEarned;
    await sale.save();

    return sale;
  }

  private async safeRelease(reservationId: string): Promise<void> {
    try {
      await this.inventoryClient.releaseReservation(reservationId);
    } catch (error) {
      this.logger.error(
        `No se pudo liberar la reserva ${reservationId}. Requiere revisión manual.`,
      );
    }
  }

  findAll(filters: { from?: string; to?: string; status?: string }) {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) (query.createdAt as any).$gte = new Date(filters.from);
      if (filters.to) (query.createdAt as any).$lte = new Date(filters.to);
    }
    return this.saleModel.find(query).sort({ createdAt: -1 });
  }

  async findOneOrFail(id: string): Promise<SaleDocument> {
    const sale = await this.saleModel.findById(id);
    if (!sale) {
      throw new NotFoundException(`Venta con id '${id}' no encontrada`);
    }
    return sale;
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }
}
