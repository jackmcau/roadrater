import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  // Database connection - support multiple env var formats
  POSTGRES_HOST: z.string().optional(),
  PGHOST: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().int().optional(),
  PGPORT: z.coerce.number().int().optional(),
  POSTGRES_DB: z.string().optional(),
  PGDATABASE: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  PGUSER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  // Legacy support
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().int().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[config] Invalid environment configuration');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

const parseOrigins = (value) =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const config = {
  env: raw.NODE_ENV,
  port: raw.PORT,
  jwtSecret: raw.JWT_SECRET,
  corsOrigins: parseOrigins(raw.CORS_ORIGIN),
  database: {
    url: raw.DATABASE_URL,
    host: raw.POSTGRES_HOST || raw.PGHOST || raw.DB_HOST || 'localhost',
    port: raw.POSTGRES_PORT || raw.PGPORT || raw.DB_PORT || 5432,
    name: raw.POSTGRES_DB || raw.PGDATABASE,
    user: raw.POSTGRES_USER || raw.PGUSER,
    password: raw.POSTGRES_PASSWORD || raw.PGPASSWORD,
  },
};

export default config;