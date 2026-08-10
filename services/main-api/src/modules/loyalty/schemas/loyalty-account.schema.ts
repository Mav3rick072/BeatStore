import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LoyaltyAccountDocument = HydratedDocument<LoyaltyAccount>;

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
export class LoyaltyAccount {
  @Prop({ required: true, unique: true })
  clientId!: string;

  @Prop({ default: 0 })
  points!: number;
}

export const LoyaltyAccountSchema = SchemaFactory.createForClass(LoyaltyAccount);
