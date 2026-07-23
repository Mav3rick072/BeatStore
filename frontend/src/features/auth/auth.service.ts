import type { AuthResponse, LoginCredentials, Usuario } from '../../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (credentials.usuario.toLowerCase() === 'admin' && credentials.password_hash === '123456') {
      const mockUser: Usuario = {
        id: 1,
        nombre: 'Daphne (Administrador)',
        usuario: 'admin',
        rol: 'ADMIN',
      };

      return {
        token: 'mock-jwt-token-123456789',
        usuario: mockUser,
      };
    }

    throw {
      response: {
        data: {
          message: 'Credenciales incorrectas. Usa admin / 123456',
        },
      },
    };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: (): Usuario | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};