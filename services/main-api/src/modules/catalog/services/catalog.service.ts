import { Injectable } from '@nestjs/common';
import { InventoryApiClient } from '../../inventory/clients/inventory-api.client';

@Injectable()
export class CatalogService {
  constructor(private readonly inventoryClient: InventoryApiClient) {}

  searchProducts(q?: string, categoryId?: string, rentable?: boolean) {
    return this.inventoryClient.searchProducts({ q, categoryId, rentable });
  }

  getProduct(id: string) {
    return this.inventoryClient.getProduct(id);
  }

  getProductByBarcode(barcode: string) {
    return this.inventoryClient.getProductByBarcode(barcode);
  }

  createProduct(payload: Record<string, unknown>) {
    return this.inventoryClient.createProduct(payload);
  }

  updateProduct(id: string, payload: Record<string, unknown>) {
    return this.inventoryClient.updateProduct(id, payload);
  }

  deactivateProduct(id: string) {
    return this.inventoryClient.deactivateProduct(id);
  }

  lowStock() {
    return this.inventoryClient.lowStockAlerts();
  }

  listCategories() {
    return this.inventoryClient.listCategories();
  }

  createCategory(payload: Record<string, unknown>) {
    return this.inventoryClient.createCategory(payload);
  }

  listBrands() {
    return this.inventoryClient.listBrands();
  }

  createBrand(payload: Record<string, unknown>) {
    return this.inventoryClient.createBrand(payload);
  }

  listSuppliers() {
    return this.inventoryClient.listSuppliers();
  }

  createSupplier(payload: Record<string, unknown>) {
    return this.inventoryClient.createSupplier(payload);
  }
}
