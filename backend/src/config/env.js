import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  DB_HOST: z.string().default('db'),
  DB_PORT: z.coerce.number().int().default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  DATABASE_URL: z.string().optional(),
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
    host: raw.DB_HOST,
    port: raw.DB_PORT,
    name: raw.POSTGRES_DB,
    user: raw.POSTGRES_USER,
    password: raw.POSTGRES_PASSWORD,
  },
};

export default config;