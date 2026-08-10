export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: string;
  employeeNumber?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
