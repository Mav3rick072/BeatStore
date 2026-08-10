import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  productId!: string;

  @IsString()
  clientId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsInt()
  @Min(0)
  depositInCents!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
