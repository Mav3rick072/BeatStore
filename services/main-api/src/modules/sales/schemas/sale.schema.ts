import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { PaymentMethod } from '../enums/payment-method.enum';
import { SaleStatus } from '../enums/sale-status.enum';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({ _id: false })
export class SaleItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  unitPriceInCents!: number;

  @Prop({ required: true })
  subtotalInCents!: number;

  @Prop({ default: 0 })
  returnedQuantity!: number;
}
export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ _id: false })
export class SalePayment {
  @Prop({ type: String, enum: PaymentMethod, required: true })
  method!: PaymentMethod;

  @Prop({ required: true })
  amountInCents!: number;
}
export const SalePaymentSchema = SchemaFactory.createForClass(SalePayment);

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
export class Sale {
  @Prop({ required: true, unique: true })
  idempotencyKey!: string;

  @Prop()
  clientId?: string;

  @Prop({ required: true })
  cashRegisterSessionId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ type: [SaleItemSchema], required: true })
  items!: SaleItem[];

  @Prop({ type: [SalePaymentSchema], required: true })
  payments!: SalePayment[];

  @Prop({ required: true })
  subtotalInCents!: number;

  @Prop({ default: 0 })
  discountInCents!: number;

  @Prop({ required: true })
  totalInCents!: number;

  @Prop()
  reservationId?: string;

  @Prop({ type: String, enum: SaleStatus, default: SaleStatus.PENDING })
  status!: SaleStatus;

  @Prop({ default: 0 })
  loyaltyPointsEarned!: number;

  @Prop()
  failureReason?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ status: 1 });
