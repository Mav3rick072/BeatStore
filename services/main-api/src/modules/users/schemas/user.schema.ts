import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  firstName!: string;

  @Prop({
    required: true,
    trim: true,
  })
  lastName!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  role!: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Prop()
  employeeNumber?: string;

  @Prop()
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
