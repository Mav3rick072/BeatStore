import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryApiClient } from './clients/inventory-api.client';
import { InventoryHealthResponse } from './interfaces/inventory-health.interface';
import { InventoryService } from './services/inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  let inventoryApiClient: {
    checkHealth: jest.Mock<() => Promise<InventoryHealthResponse>>;
  };

  beforeEach(async () => {
    inventoryApiClient = {
      checkHealth: jest.fn<() => Promise<InventoryHealthResponse>>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryApiClient,
          useValue: inventoryApiClient,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the Inventory API health status', async () => {
    const expectedResponse: InventoryHealthResponse = {
      success: true,
      service: 'inventory-api',
      database: 'connected',
    };

    inventoryApiClient.checkHealth.mockResolvedValue(expectedResponse);

    await expect(service.checkHealth()).resolves.toEqual(expectedResponse);
    expect(inventoryApiClient.checkHealth).toHaveBeenCalledTimes(1);
  });
});
