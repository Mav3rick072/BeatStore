import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'BeatStore Main API',
  environment: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  apiVersion: process.env.API_VERSION ?? '1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  inventoryApi: {
    baseUrl: process.env.INVENTORY_API_BASE_URL ?? 'http://inventory-api:8001',
    timeoutMs: Number(process.env.INVENTORY_API_TIMEOUT_MS ?? 5000),
    retryCount: Number(process.env.INVENTORY_API_RETRY_COUNT ?? 2),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change_this_value',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  mongodb: {
    uri: process.env.MONGODB_URI ?? 'mongodb://mongodb:27017/beatstore',
  },
}));
