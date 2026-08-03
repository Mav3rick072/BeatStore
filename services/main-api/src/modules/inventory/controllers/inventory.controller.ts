import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';

@ApiTags('Inventory integration')
@Controller({
  path: 'inventory',
  version: '1',
})
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Consultar la disponibilidad del servicio de inventario',
  })
  @ApiResponse({
    status: 200,
    description: 'FastAPI y su base de datos están disponibles.',
  })
  @ApiResponse({
    status: 503,
    description: 'El servicio de inventario no está disponible.',
  })
  async health() {
    return this.inventoryService.checkHealth();
  }
}
