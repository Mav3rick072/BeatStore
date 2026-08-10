import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'gerente@beatstore.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'BeatStore123' })
  @IsString()
  @MinLength(6)
  password!: string;
}
