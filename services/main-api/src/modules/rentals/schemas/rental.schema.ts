import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RentalStatus } from '../enums/rental-status.enum';

export type RentalDocument = HydratedDocument<Rental>;

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
export class Rental {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  productName!: string;

  @Prop({ required: true })
  clientId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, default: 1 })
  quantity!: number;

  @Prop({ required: true })
  dailyRateInCents!: number;

  @Prop({ required: true })
  depositInCents!: number;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop()
  returnedDate?: Date;

  @Prop()
  lateFeeInCents?: number;

  @Prop({ type: String, enum: RentalStatus, default: RentalStatus.ACTIVE })
  status!: RentalStatus;

  @Prop()
  notes?: string;
}

export const RentalSchema = SchemaFactory.createForClass(Rental);
RentalSchema.index({ status: 1 });
RentalSchema.index({ dueDate: 1 });
