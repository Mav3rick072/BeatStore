import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyAccount, LoyaltyAccountSchema } from './schemas/loyalty-account.schema';
import { LoyaltyMovement, LoyaltyMovementSchema } from './schemas/loyalty-movement.schema';
import { LoyaltyService } from './services/loyalty.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyAccount.name, schema: LoyaltyAccountSchema },
      { name: LoyaltyMovement.name, schema: LoyaltyMovementSchema },
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
