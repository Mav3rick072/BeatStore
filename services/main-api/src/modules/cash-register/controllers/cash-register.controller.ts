import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { CloseRegisterDto } from '../dto/close-register.dto';
import { OpenRegisterDto } from '../dto/open-register.dto';
import { CashRegisterService } from '../services/cash-register.service';

@ApiTags('Cash register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Get('current')
  current() {
    return this.cashRegisterService.getOpenSession();
  }

  @Get()
  findAll() {
    return this.cashRegisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashRegisterService.findOne(id);
  }

  @Post('open')
  open(@CurrentUser() user: AuthenticatedUser, @Body() dto: OpenRegisterDto) {
    return this.cashRegisterService.open(user.userId, dto);
  }

  @Post('close')
  close(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CloseRegisterDto,
  ) {
    return this.cashRegisterService.close(user.userId, dto);
  }
}
