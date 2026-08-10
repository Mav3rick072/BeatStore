import apiClient from '../../api/axios.client';
import type { AuthUser } from '../../types/auth.types';

export const usersService = {
  async findAll(): Promise<AuthUser[]> {
    const { data } = await apiClient.get<AuthUser[]>('/users');
    return data;
  },

  async create(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    employeeNumber?: string;
    phone?: string;
  }): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthUser>('/users', payload);
    return data;
  },

  async setStatus(id: string, status: string): Promise<AuthUser> {
    const { data } = await apiClient.patch<AuthUser>(`/users/${id}/status`, { status });
    return data;
  },
};
