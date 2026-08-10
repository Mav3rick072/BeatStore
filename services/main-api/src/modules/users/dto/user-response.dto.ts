import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserResponseDto {
  @ApiProperty({
    example: '66b0326f152918695023bc11',
    description: 'Identificador único del usuario',
  })
  id!: string;

  @ApiProperty({
    example: 'Carlos',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez Salvador',
  })
  lastName!: string;

  @ApiProperty({
    example: 'carlos@beatstore.com',
  })
  email!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CASHIER,
  })
  role!: UserRole;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiPropertyOptional({
    example: 'EMP-0001',
  })
  employeeNumber?: string;

  @ApiPropertyOptional({
    example: '7712345678',
  })
  phone?: string;

  @ApiProperty({
    example: '2026-08-02T22:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-02T22:00:00.000Z',
  })
  updatedAt!: Date;
}
