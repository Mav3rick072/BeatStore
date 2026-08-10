import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { CashRegisterStatus } from '../enums/cash-register-status.enum';

export type CashRegisterSessionDocument = HydratedDocument<CashRegisterSession>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class CashRegisterSession {
  @Prop({ required: true })
  openedBy!: string; // userId

  @Prop()
  closedBy?: string; // userId

  @Prop({ required: true })
  openingAmountInCents!: number;

  @Prop()
  closingAmountInCents?: number;

  @Prop({ default: 0 })
  expectedAmountInCents!: number;

  @Prop()
  differenceInCents?: number;

  @Prop({
    type: String,
    enum: CashRegisterStatus,
    default: CashRegisterStatus.OPEN,
  })
  status!: CashRegisterStatus;

  @Prop({ required: true })
  openedAt!: Date;

  @Prop()
  closedAt?: Date;

  @Prop()
  notes?: string;
}

export const CashRegisterSessionSchema = SchemaFactory.createForClass(
  CashRegisterSession,
);
