import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CashRegisterModule } from '../cash-register/cash-register.module';
import { InventoryModule } from '../inventory/inventory.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { SalesController } from './controllers/sales.controller';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { SalesService } from './services/sales.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    InventoryModule,
    CashRegisterModule,
    LoyaltyModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
