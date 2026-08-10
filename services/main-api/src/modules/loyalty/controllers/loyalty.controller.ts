import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { LoyaltyService } from '../services/loyalty.service';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get(':clientId')
  getAccount(@Param('clientId') clientId: string) {
    return this.loyaltyService.getAccount(clientId);
  }

  @Get(':clientId/history')
  history(@Param('clientId') clientId: string) {
    return this.loyaltyService.history(clientId);
  }

  @Post(':clientId/redeem')
  redeem(@Param('clientId') clientId: string, @Body() dto: RedeemPointsDto) {
    return this.loyaltyService.redeem(clientId, dto.points, dto.reason);
  }
}
