import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InventoryApiClient } from '../../inventory/clients/inventory-api.client';
import { SaleStatus } from '../../sales/enums/sale-status.enum';
import { SalesService } from '../../sales/services/sales.service';
import { CreateReturnDto } from '../dto/create-return.dto';
import { SaleReturn, ReturnDocument } from '../schemas/return.schema';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(SaleReturn.name)
    private readonly returnModel: Model<ReturnDocument>,
    private readonly salesService: SalesService,
    private readonly inventoryClient: InventoryApiClient,
  ) {}

  async create(userId: string, dto: CreateReturnDto): Promise<ReturnDocument> {
    const sale = await this.salesService.findOneOrFail(dto.saleId);

    if (sale.status !== SaleStatus.COMPLETED && sale.status !== SaleStatus.PARTIALLY_RETURNED) {
      throw new BadRequestException(
        'Solo se pueden devolver artículos de una venta completada',
      );
    }

    let totalRefundedInCents = 0;
    const returnItems: {
      productId: string;
      quantity: number;
      refundedAmountInCents: number;
    }[] = [];

    for (const requested of dto.items) {
      const saleItem = sale.items.find((i) => i.productId === requested.productId);
      if (!saleItem) {
        throw new BadRequestException(
          `El producto '${requested.productId}' no forma parte de la venta '${dto.saleId}'`,
        );
      }

      const availableToReturn = saleItem.quantity - saleItem.returnedQuantity;
      if (requested.quantity > availableToReturn) {
        throw new BadRequestException(
          `Solo se pueden devolver ${availableToReturn} unidades de '${saleItem.name}'`,
        );
      }

      const refundedAmountInCents = saleItem.unitPriceInCents * requested.quantity;
      totalRefundedInCents += refundedAmountInCents;

      returnItems.push({
        productId: requested.productId,
        quantity: requested.quantity,
        refundedAmountInCents,
      });

      saleItem.returnedQuantity += requested.quantity;
    }

    const saleReturn = await this.returnModel.create({
      saleId: dto.saleId,
      userId,
      items: returnItems,
      totalRefundedInCents,
      reason: dto.reason,
    });

    // Devolvemos el stock en inventory-api por cada producto.
    for (const item of returnItems) {
      await this.inventoryClient.registerReturn(
        item.productId,
        item.quantity,
        saleReturn._id.toString(),
      );
    }

    const fullyReturned = sale.items.every(
      (i) => i.returnedQuantity >= i.quantity,
    );
    sale.status = fullyReturned
      ? SaleStatus.RETURNED
      : SaleStatus.PARTIALLY_RETURNED;
    await sale.save();

    return saleReturn;
  }

  findAll() {
    return this.returnModel.find().sort({ createdAt: -1 });
  }

  findBySale(saleId: string) {
    return this.returnModel.find({ saleId }).sort({ createdAt: -1 });
  }
}
