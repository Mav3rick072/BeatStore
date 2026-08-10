import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { ReturnRentalDto } from '../dto/return-rental.dto';
import { RentalStatus } from '../enums/rental-status.enum';
import { RentalsService } from '../services/rentals.service';

@ApiTags('Rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll(@Query('status') status?: RentalStatus) {
    return this.rentalsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRentalDto) {
    return this.rentalsService.create(user.userId, dto);
  }

  @Post(':id/return')
  returnRental(@Param('id') id: string, @Body() dto: ReturnRentalDto) {
    return this.rentalsService.returnRental(id, dto);
  }
}
