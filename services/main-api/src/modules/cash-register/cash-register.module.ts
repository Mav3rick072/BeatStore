import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CashRegisterController } from './controllers/cash-register.controller';
import {
  CashRegisterSession,
  CashRegisterSessionSchema,
} from './schemas/cash-register.schema';
import { CashRegisterService } from './services/cash-register.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashRegisterSession.name, schema: CashRegisterSessionSchema },
    ]),
  ],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
