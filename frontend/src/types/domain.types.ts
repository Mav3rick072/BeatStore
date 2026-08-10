export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  taxId?: string;
  isActive: boolean;
}

export type CashRegisterStatus = 'OPEN' | 'CLOSED';

export interface CashRegisterSession {
  id: string;
  _id?: string;
  openedBy: string;
  closedBy?: string;
  openingAmountInCents: number;
  closingAmountInCents?: number;
  expectedAmountInCents: number;
  differenceInCents?: number;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export type RentalStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';

export interface Rental {
  id: string;
  _id?: string;
  productId: string;
  productName: string;
  clientId: string;
  userId: string;
  quantity: number;
  dailyRateInCents: number;
  depositInCents: number;
  startDate: string;
  dueDate: string;
  returnedDate?: string;
  lateFeeInCents?: number;
  status: RentalStatus;
  notes?: string;
}

export interface SaleReturn {
  id: string;
  _id?: string;
  saleId: string;
  userId: string;
  items: { productId: string; quantity: number; refundedAmountInCents: number }[];
  totalRefundedInCents: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  id: string;
  _id?: string;
  clientId: string;
  points: number;
}
