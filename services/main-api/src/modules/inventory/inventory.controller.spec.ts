import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryHealthResponse } from './interfaces/inventory-health.interface';
import { InventoryService } from './services/inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;

  let inventoryService: {
    checkHealth: jest.Mock<() => Promise<InventoryHealthResponse>>;
  };

  beforeEach(async () => {
    inventoryService = {
      checkHealth: jest.fn<() => Promise<InventoryHealthResponse>>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: inventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the Inventory API health status', async () => {
    const expectedResponse: InventoryHealthResponse = {
      success: true,
      service: 'inventory-api',
      database: 'connected',
    };

    inventoryService.checkHealth.mockResolvedValue(expectedResponse);

    await expect(controller.health()).resolves.toEqual(expectedResponse);
    expect(inventoryService.checkHealth).toHaveBeenCalledTimes(1);
  });
});
