import { describe, expect, it, vi } from 'vitest';

describe('config/env', () => {
  it('parses typed environment variables and multiple origins', async () => {
    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      PORT: '4100',
      CORS_ORIGIN: 'http://one.test,http://two.test',
      JWT_SECRET: 'super-secret-value',
      DB_HOST: 'localhost',
      DB_PORT: '5433',
      POSTGRES_DB: 'roadrater_test',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
    };

    const { config } = await import('../config/env.js');

    expect(config.port).toBe(4100);
    expect(config.corsOrigins).toEqual(['http://one.test', 'http://two.test']);
    expect(config.database.host).toBe('localhost');
    expect(config.env).toBe('test');
  });
});