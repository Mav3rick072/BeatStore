import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SaleReturn, SaleReturnSchema } from '../returns/schemas/return.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleReturn.name, schema: SaleReturnSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
