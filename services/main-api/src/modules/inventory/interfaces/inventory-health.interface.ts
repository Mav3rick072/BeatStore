export interface InventoryHealthResponse {
  success: boolean;
  service?: string;
  database?: string;
  message?: string;
}

export interface InventoryEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brandId?: string;
  priceInCents: number;
  isRentable: boolean;
  rentalPriceInCents?: number;
  stock: { quantity: number; reserved: number; minStock: number };
  isActive: boolean;
}

export interface ReservationItem {
  productId: string;
  quantity: number;
}

export interface StockReservation {
  id: string;
  idempotencyKey: string;
  items: ReservationItem[];
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED';
  expiresAt: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryBrand {
  id: string;
  name: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}
