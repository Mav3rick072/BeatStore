import apiClient from '../../api/axios.client';
import type { Client } from '../../types/domain.types';

export const clientsService = {
  async findAll(search?: string): Promise<Client[]> {
    const { data } = await apiClient.get<Client[]>('/clients', { params: { search } });
    return data;
  },

  async findOne(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`/clients/${id}`);
    return data;
  },

  async create(payload: Partial<Client>): Promise<Client> {
    const { data } = await apiClient.post<Client>('/clients', payload);
    return data;
  },

  async update(id: string, payload: Partial<Client>): Promise<Client> {
    const { data } = await apiClient.patch<Client>(`/clients/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },
};
