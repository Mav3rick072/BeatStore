import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InventoryModule } from '../inventory/inventory.module';
import { RentalsController } from './controllers/rentals.controller';
import { Rental, RentalSchema } from './schemas/rental.schema';
import { RentalsService } from './services/rentals.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rental.name, schema: RentalSchema }]),
    InventoryModule,
  ],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
