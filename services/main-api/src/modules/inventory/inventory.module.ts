import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { InventoryApiClient } from './clients/inventory-api.client';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [HttpModule],
  controllers: [InventoryController],
  providers: [InventoryApiClient, InventoryService],
  exports: [InventoryApiClient, InventoryService],
})
export class InventoryModule {}
