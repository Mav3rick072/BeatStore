import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { CreateReturnDto } from '../dto/create-return.dto';
import { ReturnsService } from '../services/returns.service';

@ApiTags('Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll() {
    return this.returnsService.findAll();
  }

  @Get('by-sale/:saleId')
  findBySale(@Param('saleId') saleId: string) {
    return this.returnsService.findBySale(saleId);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(user.userId, dto);
  }
}
