import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  InventoryBrand,
  InventoryCategory,
  InventoryEnvelope,
  InventoryHealthResponse,
  InventoryProduct,
  InventorySupplier,
  ReservationItem,
  StockReservation,
} from '../interfaces/inventory-health.interface';

@Injectable()
export class InventoryApiClient {
  private readonly logger = new Logger(InventoryApiClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private baseUrl(): string {
    return this.configService.get<string>(
      'app.inventoryApi.baseUrl',
      'http://inventory-api:8001',
    );
  }

  private timeout(): number {
    return this.configService.get<number>('app.inventoryApi.timeoutMs', 5000);
  }

  private async request<T>(
    method: 'get' | 'post' | 'patch' | 'delete',
    path: string,
    data?: unknown,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.request<InventoryEnvelope<T>>({
          method,
          url: `${this.baseUrl()}${path}`,
          data,
          timeout: this.timeout(),
        }),
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;

      // Errores de negocio del inventory-api (404, 409, 422) se reenvían tal cual
      if (axiosError.response) {
        const rawData = axiosError.response.data;
        const isPlainObject =
        rawData !== null &&
        typeof rawData === 'object' &&
        !Array.isArray(rawData);

        const safeBody = isPlainObject
        ? rawData
        : { message: 'Inventory API devolvió una respuesta inesperada' };
        
        const logSnippet = JSON.stringify(safeBody).slice(0, 300);
        this.logger.warn(
          `Inventory API respondió ${axiosError.response.status} en ${path}: ${logSnippet}`,
        );
        throw new HttpException(safeBody, axiosError.response.status);
      }

      this.logger.error(`Inventory API is unavailable: ${axiosError.message}`);
      throw new ServiceUnavailableException({
        code: 'INVENTORY_API_UNAVAILABLE',
        message: 'El servicio de inventario no está disponible',
      });
    }
  }

  async checkHealth(): Promise<InventoryHealthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<InventoryHealthResponse>(
          `${this.baseUrl()}/api/health/`,
          { timeout: this.timeout() },
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

  // --- Catálogo (lectura) ---------------------------------------------

  async searchProducts(params: {
    q?: string;
    categoryId?: string;
    rentable?: boolean;
  }): Promise<InventoryProduct[]> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.rentable) query.set('rentable', 'true');
    return this.request<InventoryProduct[]>(
      'get',
      `/api/products/?${query.toString()}`,
    );
  }

  async getProduct(productId: string): Promise<InventoryProduct> {
    return this.request<InventoryProduct>('get', `/api/products/${productId}`);
  }

  async getProductByBarcode(barcode: string): Promise<InventoryProduct> {
    return this.request<InventoryProduct>(
      'get',
      `/api/products/barcode/${barcode}`,
    );
  }

  async lowStockAlerts(): Promise<InventoryProduct[]> {
    return this.request<InventoryProduct[]>(
      'get',
      '/api/inventory/alerts/low-stock',
    );
  }

  async createProduct(payload: Record<string, unknown>): Promise<InventoryProduct> {
    return this.request<InventoryProduct>('post', '/api/products/', payload);
  }

  async updateProduct(
    productId: string,
    payload: Record<string, unknown>,
  ): Promise<InventoryProduct> {
    return this.request<InventoryProduct>(
      'patch',
      `/api/products/${productId}`,
      payload,
    );
  }

  async deactivateProduct(productId: string): Promise<void> {
    await this.request<void>('delete', `/api/products/${productId}`);
  }

  // --- Categorías, marcas y proveedores --------------------------------

  async listCategories(): Promise<InventoryCategory[]> {
    return this.request<InventoryCategory[]>('get', '/api/categories/');
  }

  async createCategory(
    payload: Record<string, unknown>,
  ): Promise<InventoryCategory> {
    return this.request<InventoryCategory>('post', '/api/categories/', payload);
  }

  async listBrands(): Promise<InventoryBrand[]> {
    return this.request<InventoryBrand[]>('get', '/api/brands/');
  }

  async createBrand(payload: Record<string, unknown>): Promise<InventoryBrand> {
    return this.request<InventoryBrand>('post', '/api/brands/', payload);
  }

  async listSuppliers(): Promise<InventorySupplier[]> {
    return this.request<InventorySupplier[]>('get', '/api/suppliers/');
  }

  async createSupplier(
    payload: Record<string, unknown>,
  ): Promise<InventorySupplier> {
    return this.request<InventorySupplier>('post', '/api/suppliers/', payload);
  }

  // --- Reservas de stock (flujo de venta) ------------------------------

  async createReservation(
    idempotencyKey: string,
    items: ReservationItem[],
  ): Promise<StockReservation> {
    return this.request<StockReservation>('post', '/api/inventory/reservations', {
      idempotencyKey,
      items,
      ttlSeconds: 600,
    });
  }

  async confirmReservation(
    reservationId: string,
    referenceId: string,
  ): Promise<StockReservation> {
    return this.request<StockReservation>(
      'post',
      `/api/inventory/reservations/${reservationId}/confirm`,
      { referenceId },
    );
  }

  async releaseReservation(reservationId: string): Promise<StockReservation> {
    return this.request<StockReservation>(
      'post',
      `/api/inventory/reservations/${reservationId}/release`,
    );
  }

  // --- Devoluciones y alquileres ---------------------------------------

  async registerReturn(
    productId: string,
    quantity: number,
    referenceId: string,
  ): Promise<InventoryProduct> {
    return this.request<InventoryProduct>('post', '/api/inventory/returns', {
      productId,
      quantity,
      referenceId,
    });
  }

  async rentalCheckout(
    productId: string,
    quantity: number,
    referenceId: string,
  ): Promise<InventoryProduct> {
    return this.request<InventoryProduct>(
      'post',
      '/api/inventory/rentals/checkout',
      { productId, quantity, referenceId },
    );
  }

  async rentalCheckin(
    productId: string,
    quantity: number,
    referenceId: string,
  ): Promise<InventoryProduct> {
    return this.request<InventoryProduct>(
      'post',
      '/api/inventory/rentals/checkin',
      { productId, quantity, referenceId },
    );
  }
}
