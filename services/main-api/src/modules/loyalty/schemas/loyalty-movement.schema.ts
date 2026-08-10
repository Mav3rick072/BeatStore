import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LoyaltyMovementType } from '../enums/loyalty-movement-type.enum';

export type LoyaltyMovementDocument = HydratedDocument<LoyaltyMovement>;

@Schema({ timestamps: true })
export class LoyaltyMovement {
  @Prop({ required: true })
  clientId!: string;

  @Prop({ type: String, enum: LoyaltyMovementType, required: true })
  type!: LoyaltyMovementType;

  @Prop({ required: true })
  points!: number;

  @Prop()
  referenceId?: string;

  @Prop()
  reason?: string;
}

export const LoyaltyMovementSchema =
  SchemaFactory.createForClass(LoyaltyMovement);
