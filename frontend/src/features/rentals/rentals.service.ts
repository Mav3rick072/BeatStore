import apiClient from '../../api/axios.client';
import type { Rental, RentalStatus } from '../../types/domain.types';

export const rentalsService = {
  async findAll(status?: RentalStatus): Promise<Rental[]> {
    const { data } = await apiClient.get<Rental[]>('/rentals', { params: { status } });
    return data;
  },

  async create(payload: {
    productId: string;
    clientId: string;
    quantity?: number;
    depositInCents: number;
    dueDate: string;
    notes?: string;
  }): Promise<Rental> {
    const { data } = await apiClient.post<Rental>('/rentals', payload);
    return data;
  },

  async returnRental(id: string, payload: { lateFeeInCents?: number; notes?: string }): Promise<Rental> {
    const { data } = await apiClient.post<Rental>(`/rentals/${id}/return`, payload);
    return data;
  },
};
