import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InventoryApiClient } from '../../inventory/clients/inventory-api.client';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { ReturnRentalDto } from '../dto/return-rental.dto';
import { RentalStatus } from '../enums/rental-status.enum';
import { Rental, RentalDocument } from '../schemas/rental.schema';

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rental.name) private readonly rentalModel: Model<RentalDocument>,
    private readonly inventoryClient: InventoryApiClient,
  ) {}

  async create(userId: string, dto: CreateRentalDto): Promise<RentalDocument> {
    const product = await this.inventoryClient.getProduct(dto.productId);

    if (!product.isRentable || !product.rentalPriceInCents) {
      throw new BadRequestException(
        `El producto '${product.name}' no está disponible para alquiler`,
      );
    }

    const quantity = dto.quantity ?? 1;
    const dueDate = new Date(dto.dueDate);
    if (dueDate <= new Date()) {
      throw new BadRequestException(
        'La fecha de devolución debe ser posterior a hoy',
      );
    }

    const rental = await this.rentalModel.create({
      productId: product.id,
      productName: product.name,
      clientId: dto.clientId,
      userId,
      quantity,
      dailyRateInCents: product.rentalPriceInCents,
      depositInCents: dto.depositInCents,
      startDate: new Date(),
      dueDate,
      status: RentalStatus.ACTIVE,
      notes: dto.notes,
    });

    // Descuenta stock disponible en inventory-api (salida por alquiler).
    await this.inventoryClient.rentalCheckout(
      product.id,
      quantity,
      rental._id.toString(),
    );

    return rental;
  }

  async findOneOrFail(id: string): Promise<RentalDocument> {
    const rental = await this.rentalModel.findById(id);
    if (!rental) {
      throw new NotFoundException(`Alquiler con id '${id}' no encontrado`);
    }
    return rental;
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  findAll(status?: RentalStatus) {
    const filter = status ? { status } : {};
    return this.rentalModel.find(filter).sort({ dueDate: 1 });
  }

  async returnRental(id: string, dto: ReturnRentalDto): Promise<RentalDocument> {
    const rental = await this.findOneOrFail(id);

    if (rental.status === RentalStatus.RETURNED) {
      throw new BadRequestException('Este alquiler ya fue devuelto');
    }

    rental.returnedDate = new Date();
    rental.status = RentalStatus.RETURNED;
    if (dto.lateFeeInCents) rental.lateFeeInCents = dto.lateFeeInCents;
    if (dto.notes) rental.notes = dto.notes;
    await rental.save();

    // Regresa el stock al inventario (entrada por devolución de alquiler).
    await this.inventoryClient.rentalCheckin(
      rental.productId,
      rental.quantity,
      rental._id.toString(),
    );

    return rental;
  }

  async markOverdue(): Promise<number> {
    const result = await this.rentalModel.updateMany(
      { status: RentalStatus.ACTIVE, dueDate: { $lt: new Date() } },
      { $set: { status: RentalStatus.OVERDUE } },
    );
    return result.modifiedCount;
  }
}
