import apiClient from '../../api/axios.client';
import type { SaleReturn } from '../../types/domain.types';

export const returnsService = {
  async create(payload: {
    saleId: string;
    items: { productId: string; quantity: number }[];
    reason: string;
  }): Promise<SaleReturn> {
    const { data } = await apiClient.post<SaleReturn>('/returns', payload);
    return data;
  },

  async findAll(): Promise<SaleReturn[]> {
    const { data } = await apiClient.get<SaleReturn[]>('/returns');
    return data;
  },

  async findBySale(saleId: string): Promise<SaleReturn[]> {
    const { data } = await apiClient.get<SaleReturn[]>(`/returns/by-sale/${saleId}`);
    return data;
  },
};
