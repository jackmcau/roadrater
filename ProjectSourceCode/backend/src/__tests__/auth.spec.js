import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('../db/connect.js', () => {
  const mockPool = {
    query: (...args) => queryMock(...args),
  };
  return {
    __esModule: true,
    default: mockPool,
    pool: mockPool,
    query: queryMock,
    withTransaction: vi.fn(),
  };
});

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '0';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'roadrater_test';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';

import app from '../index.js';

const buildPayload = () => ({
  username: 'freshroadie',
  password: 'Password123',
});

describe('POST /auth/register', () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it('returns 201 and user data when registration succeeds', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 42, username: 'freshroadie' }] });

    const response = await request(app)
      .post('/auth/register')
      .send(buildPayload());

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: 42, username: 'freshroadie' },
    });
    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain('INSERT INTO users');
    expect(params[0]).toBe('freshroadie');
    expect(params[1]).toMatch(/^\$2[aby]\$/i);
  });

  it('returns 409 when username already exists', async () => {
    queryMock.mockRejectedValueOnce({ code: '23505' });

    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'duplicate01', password: 'Password123' });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      success: false,
      error: 'Username already exists',
    });
  });

  it('returns 400 when validation fails', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'short', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false });
    expect(queryMock).not.toHaveBeenCalled();
  });
});
