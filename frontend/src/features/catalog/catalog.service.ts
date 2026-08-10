import apiClient from '../../api/axios.client';
import type { Brand, Category, Product, Supplier } from '../../types/catalog.types';

export const catalogService = {
  async searchProducts(params: { q?: string; categoryId?: string; rentable?: boolean } = {}) {
    const { data } = await apiClient.get<Product[]>('/catalog/products', { params });
    return data;
  },

  async getProduct(id: string) {
    const { data } = await apiClient.get<Product>(`/catalog/products/${id}`);
    return data;
  },

  async getByBarcode(barcode: string) {
    const { data } = await apiClient.get<Product>(`/catalog/products/barcode/${barcode}`);
    return data;
  },

  async createProduct(payload: Record<string, unknown>) {
    const { data } = await apiClient.post<Product>('/catalog/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch<Product>(`/catalog/products/${id}`, payload);
    return data;
  },

  async lowStock() {
    const { data } = await apiClient.get<Product[]>('/catalog/products/low-stock');
    return data;
  },

  async listCategories() {
    const { data } = await apiClient.get<Category[]>('/catalog/categories');
    return data;
  },

  async createCategory(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post<Category>('/catalog/categories', payload);
    return data;
  },

  async listBrands() {
    const { data } = await apiClient.get<Brand[]>('/catalog/brands');
    return data;
  },

  async createBrand(payload: { name: string }) {
    const { data } = await apiClient.post<Brand>('/catalog/brands', payload);
    return data;
  },

  async listSuppliers() {
    const { data } = await apiClient.get<Supplier[]>('/catalog/suppliers');
    return data;
  },
};
