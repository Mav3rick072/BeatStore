import apiClient from '../../api/axios.client';
import type { CreateSalePayload, Sale } from '../../types/sales.types';

export const salesService = {
  async create(payload: CreateSalePayload): Promise<Sale> {
    const { data } = await apiClient.post<Sale>('/sales', payload);
    return data;
  },

  async findAll(params: { from?: string; to?: string; status?: string } = {}): Promise<Sale[]> {
    const { data } = await apiClient.get<Sale[]>('/sales', { params });
    return data;
  },

  async findOne(id: string): Promise<Sale> {
    const { data } = await apiClient.get<Sale>(`/sales/${id}`);
    return data;
  },
};
