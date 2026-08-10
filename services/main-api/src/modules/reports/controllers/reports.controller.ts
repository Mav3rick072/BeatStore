import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  salesSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.salesSummary({ from, to });
  }

  @Get('sales-by-day')
  salesByDay(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.salesByDay({ from, to });
  }

  @Get('top-products')
  topProducts(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.topProducts({ from, to }, limit ? Number(limit) : 10);
  }

  @Get('payment-methods')
  paymentMethods(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.paymentMethodBreakdown({ from, to });
  }
}
