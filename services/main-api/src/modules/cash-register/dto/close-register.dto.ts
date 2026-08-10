import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CloseRegisterDto {
  @IsInt()
  @Min(0)
  closingAmountInCents!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
