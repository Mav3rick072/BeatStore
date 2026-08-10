import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReturnDocument = HydratedDocument<SaleReturn>;

@Schema({ _id: false })
export class ReturnItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  refundedAmountInCents!: number;
}
export const ReturnItemSchema = SchemaFactory.createForClass(ReturnItem);

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
export class SaleReturn {
  @Prop({ required: true })
  saleId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ type: [ReturnItemSchema], required: true })
  items!: ReturnItem[];

  @Prop({ required: true })
  totalRefundedInCents!: number;

  @Prop({ required: true })
  reason!: string;
}

export const SaleReturnSchema = SchemaFactory.createForClass(SaleReturn);
