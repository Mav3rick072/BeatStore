export interface LoginCredentials {
  usuario: string;
  password_hash: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}