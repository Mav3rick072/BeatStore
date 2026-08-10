import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  APP_NAME: Joi.string().trim().min(1).default('BeatStore Main API'),

  PORT: Joi.number().port().default(3000),

  API_PREFIX: Joi.string().trim().min(1).default('api'),

  API_VERSION: Joi.string().trim().pattern(/^\d+$/).default('1'),

  CORS_ORIGINS: Joi.string().trim().default('http://localhost:5173'),

  INVENTORY_API_BASE_URL: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .default('http://inventory-api:8001'),

  INVENTORY_API_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(30000)
    .default(5000),

  INVENTORY_API_RETRY_COUNT: Joi.number().integer().min(0).max(3).default(2),

  MONGODB_URI: Joi.string()
    .trim()
    .default('mongodb://mongodb:27017/beatstore'),

  JWT_SECRET: Joi.string().trim().min(8).default('change_this_value'),

  JWT_EXPIRES_IN: Joi.string().trim().default('8h'),
});
