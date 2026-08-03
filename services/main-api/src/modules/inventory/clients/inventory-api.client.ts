import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { InventoryHealthResponse } from '../interfaces/inventory-health.interface';

@Injectable()
export class InventoryApiClient {
  private readonly logger = new Logger(InventoryApiClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async checkHealth(): Promise<InventoryHealthResponse> {
    const baseUrl = this.configService.get<string>(
      'app.inventoryApi.baseUrl',
      'http://inventory-api:8001',
    );

    const timeout = this.configService.get<number>(
      'app.inventoryApi.timeoutMs',
      5000,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get<InventoryHealthResponse>(
          `${baseUrl}/internal/v1/health/ready`,
          {
            timeout,
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      this.logger.error(`Inventory API is unavailable: ${axiosError.message}`);

      throw new ServiceUnavailableException({
        code: 'INVENTORY_API_UNAVAILABLE',
        message: 'El servicio de inventario no está disponible',
      });
    }
  }
}
