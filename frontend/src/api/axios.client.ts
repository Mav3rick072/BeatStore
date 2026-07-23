import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = \Bearer \\;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo unificado de errores HTTP
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada o no autorizada
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

