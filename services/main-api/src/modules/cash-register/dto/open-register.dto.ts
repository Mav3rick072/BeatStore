import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class OpenRegisterDto {
  @IsInt()
  @Min(0)
  openingAmountInCents!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
