import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LoyaltyMovementType } from '../enums/loyalty-movement-type.enum';
import {
  LoyaltyAccount,
  LoyaltyAccountDocument,
} from '../schemas/loyalty-account.schema';
import {
  LoyaltyMovement,
  LoyaltyMovementDocument,
} from '../schemas/loyalty-movement.schema';

// 1 punto por cada $100 MXN (10,000 centavos) en compras.
const POINTS_PER_CENTS = 1 / 10000;

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(LoyaltyAccount.name)
    private readonly accountModel: Model<LoyaltyAccountDocument>,
    @InjectModel(LoyaltyMovement.name)
    private readonly movementModel: Model<LoyaltyMovementDocument>,
  ) {}

  private async getOrCreateAccount(
    clientId: string,
  ): Promise<LoyaltyAccountDocument> {
    let account = await this.accountModel.findOne({ clientId });
    if (!account) {
      account = await this.accountModel.create({ clientId, points: 0 });
    }
    return account;
  }

  async getAccount(clientId: string) {
    return this.getOrCreateAccount(clientId);
  }

  async earnFromSale(
    clientId: string,
    totalInCents: number,
    saleId: string,
  ): Promise<number> {
    const points = Math.floor(totalInCents * POINTS_PER_CENTS);
    if (points <= 0) return 0;

    const account = await this.getOrCreateAccount(clientId);
    account.points += points;
    await account.save();

    await this.movementModel.create({
      clientId,
      type: LoyaltyMovementType.EARN,
      points,
      referenceId: saleId,
      reason: 'Puntos generados por venta',
    });

    return points;
  }

  async redeem(clientId: string, points: number, reason?: string) {
    const account = await this.getOrCreateAccount(clientId);
    if (account.points < points) {
      throw new BadRequestException(
        `El cliente solo cuenta con ${account.points} puntos disponibles`,
      );
    }

    account.points -= points;
    await account.save();

    await this.movementModel.create({
      clientId,
      type: LoyaltyMovementType.REDEEM,
      points: -points,
      reason: reason ?? 'Canje de puntos',
    });

    return account;
  }

  history(clientId: string) {
    return this.movementModel.find({ clientId }).sort({ createdAt: -1 });
  }
}
