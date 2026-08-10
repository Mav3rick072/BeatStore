import apiClient from '../../api/axios.client';
import type { CashRegisterSession } from '../../types/domain.types';

export const cashRegisterService = {
  async current(): Promise<CashRegisterSession> {
    const { data } = await apiClient.get<CashRegisterSession>('/cash-register/current');
    return data;
  },

  async isOpen(): Promise<CashRegisterSession | null> {
    try {
      return await this.current();
    } catch {
      return null;
    }
  },

  async open(openingAmountInCents: number, notes?: string): Promise<CashRegisterSession> {
    const { data } = await apiClient.post<CashRegisterSession>('/cash-register/open', {
      openingAmountInCents,
      notes,
    });
    return data;
  },

  async close(closingAmountInCents: number, notes?: string): Promise<CashRegisterSession> {
    const { data } = await apiClient.post<CashRegisterSession>('/cash-register/close', {
      closingAmountInCents,
      notes,
    });
    return data;
  },

  async history(): Promise<CashRegisterSession[]> {
    const { data } = await apiClient.get<CashRegisterSession[]>('/cash-register');
    return data;
  },
};
