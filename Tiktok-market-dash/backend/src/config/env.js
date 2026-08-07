import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const jwtSecret =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'dev_jwt_secret_change_me_min_32_chars';

const jwtExpiresIn =
  process.env.JWT_EXPIRES_IN ||
  process.env.JWT_ACCESS_EXPIRES_IN ||
  '15m';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: toInt(process.env.PORT, 5000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/nexora?schema=public'
  ),
  clientUrl: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    accessSecret: jwtSecret,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me_32chars',
    accessExpiresIn: jwtExpiresIn,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    get clientId() {
      return process.env.GOOGLE_CLIENT_ID || '';
    },
    get clientSecret() {
      return process.env.GOOGLE_CLIENT_SECRET || '';
    },
    get callbackUrl() {
      return (
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:5000/api/v1/auth/google/callback'
      );
    },
    get isConfigured() {
      return Boolean(this.clientId && this.clientSecret);
    },
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: toInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 5),
  },
};
