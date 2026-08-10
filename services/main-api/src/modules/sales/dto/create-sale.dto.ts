import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaymentMethod } from '../enums/payment-method.enum';

export class SaleItemInputDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class SalePaymentInputDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsInt()
  @Min(1)
  amountInCents!: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemInputDto)
  items!: SaleItemInputDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalePaymentInputDto)
  payments!: SalePaymentInputDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  discountInCents?: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
