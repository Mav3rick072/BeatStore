import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserStatus } from '../users/enums/user-status.enum';
import { UsersService } from '../users/services/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'El usuario se encuentra inactivo o bloqueado',
      );
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.configService.get<string>(
      'app.jwt.expiresIn',
      '8h',
    );

    return {
      accessToken,
      expiresIn: this.parseExpiresInSeconds(expiresIn),
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        employeeNumber: user.employeeNumber,
        phone: user.phone,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      },
    };
  }

  private parseExpiresInSeconds(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) return 28800; // 8h por defecto

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * multipliers[unit];
  }
}
