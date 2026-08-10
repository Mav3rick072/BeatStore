export type PaymentMethod = 'CASH' | 'CARD';
export type SaleStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PARTIALLY_RETURNED';

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface SalePaymentInput {
  method: PaymentMethod;
  amountInCents: number;
}

export interface SaleItem extends SaleItemInput {
  name: string;
  sku: string;
  unitPriceInCents: number;
  subtotalInCents: number;
  returnedQuantity: number;
}

export interface Sale {
  id: string;
  idempotencyKey: string;
  clientId?: string;
  cashRegisterSessionId: string;
  userId: string;
  items: SaleItem[];
  payments: SalePaymentInput[];
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
  status: SaleStatus;
  loyaltyPointsEarned: number;
  createdAt: string;
}

export interface CreateSalePayload {
  clientId?: string;
  items: SaleItemInput[];
  payments: SalePaymentInput[];
  discountInCents?: number;
  idempotencyKey?: string;
}
