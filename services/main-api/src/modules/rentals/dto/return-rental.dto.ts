import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ReturnRentalDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  lateFeeInCents?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
