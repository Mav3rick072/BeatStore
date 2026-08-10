export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brandId?: string;
  supplierId?: string;
  description?: string;
  priceInCents: number;
  isRentable: boolean;
  rentalPriceInCents?: number;
  attributes: Record<string, unknown>;
  images: string[];
  stock: { quantity: number; reserved: number; minStock: number };
  isActive: boolean;
}
