import { HttpService } from '@nestjs/axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { InventoryApiClient } from './inventory-api.client';
import { InventoryHealthResponse } from '../interfaces/inventory-health.interface';

describe('InventoryApiClient', () => {
  let client: InventoryApiClient;
  let httpService: {
    get: jest.Mock;
  };

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    };

    const configService = {
      get: jest.fn((key: string, defaultValue: unknown) => {
        const values: Record<string, unknown> = {
          'app.inventoryApi.baseUrl': 'http://inventory-api:8001',
          'app.inventoryApi.timeoutMs': 5000,
        };

        return values[key] ?? defaultValue;
      }),
    };

    client = new InventoryApiClient(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
    );
  });

  it('should return the Inventory API health response', async () => {
    const healthResponse: InventoryHealthResponse = {
      status: 'ok',
      service: 'inventory-api',
      database: 'connected',
    };

    const axiosResponse = {
      data: healthResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<InventoryHealthResponse>;

    httpService.get.mockReturnValue(of(axiosResponse));

    await expect(client.checkHealth()).resolves.toEqual(healthResponse);

    expect(httpService.get).toHaveBeenCalledWith(
      'http://inventory-api:8001/internal/v1/health/ready',
      {
        timeout: 5000,
      },
    );
  });

  it('should throw ServiceUnavailableException when Inventory API fails', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('Connection refused')),
    );

    await expect(client.checkHealth()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
