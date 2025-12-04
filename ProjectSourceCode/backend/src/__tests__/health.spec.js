import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

let app;

describe('GET /health', () => {
  beforeAll(async () => {
    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      PORT: '3001',
      CORS_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'test-secret-value',
      DB_HOST: 'db',
      DB_PORT: '5432',
      POSTGRES_DB: 'roadrater_test',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
    };

    ({ app } = await import('../index.js'));
  });

  it('returns service heartbeat', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, service: 'roadrater-backend' });
  });
});