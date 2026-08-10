import apiClient from '../../api/axios.client';
import type { LoyaltyAccount } from '../../types/domain.types';

export const loyaltyService = {
  async getAccount(clientId: string): Promise<LoyaltyAccount> {
    const { data } = await apiClient.get<LoyaltyAccount>(`/loyalty/${clientId}`);
    return data;
  },

  async redeem(clientId: string, points: number, reason?: string): Promise<LoyaltyAccount> {
    const { data } = await apiClient.post<LoyaltyAccount>(`/loyalty/${clientId}/redeem`, {
      points,
      reason,
    });
    return data;
  },
};
