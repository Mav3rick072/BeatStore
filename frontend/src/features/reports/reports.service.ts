import apiClient from '../../api/axios.client';

export interface SalesSummary {
  totalSales: number;
  totalRevenueInCents: number;
  totalDiscountInCents: number;
  totalItemsSold: number;
  totalRefundedInCents: number;
}

export interface SalesByDay {
  date: string;
  totalSales: number;
  totalRevenueInCents: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenueInCents: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  totalInCents: number;
  count: number;
}

export const reportsService = {
  async summary(params: { from?: string; to?: string } = {}) {
    const { data } = await apiClient.get<SalesSummary>('/reports/sales-summary', { params });
    return data;
  },
  async byDay(params: { from?: string; to?: string } = {}) {
    const { data } = await apiClient.get<SalesByDay[]>('/reports/sales-by-day', { params });
    return data;
  },
  async topProducts(params: { from?: string; to?: string; limit?: number } = {}) {
    const { data } = await apiClient.get<TopProduct[]>('/reports/top-products', { params });
    return data;
  },
  async paymentMethods(params: { from?: string; to?: string } = {}) {
    const { data } = await apiClient.get<PaymentMethodBreakdown[]>('/reports/payment-methods', { params });
    return data;
  },
};
