import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InventoryModule } from '../inventory/inventory.module';
import { SalesModule } from '../sales/sales.module';
import { ReturnsController } from './controllers/returns.controller';
import { SaleReturn, SaleReturnSchema } from './schemas/return.schema';
import { ReturnsService } from './services/returns.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaleReturn.name, schema: SaleReturnSchema },
    ]),
    InventoryModule,
    SalesModule,
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
