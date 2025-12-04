import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { queryMock, txQueryMock, withTransactionMock } = vi.hoisted(() => {
  const txQueryMock = vi.fn();
  const withTransactionMock = vi.fn(async (callback) => callback({ query: txQueryMock }));
  return {
    queryMock: vi.fn(),
    txQueryMock,
    withTransactionMock,
  };
});

vi.mock('../db/connect.js', () => ({
  __esModule: true,
  default: {},
  pool: {},
  query: queryMock,
  withTransaction: withTransactionMock,
}));

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

const authHeader = (userId = 77) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
};

describe('POST /ratings', () => {
  beforeEach(() => {
    queryMock.mockReset();
    txQueryMock.mockReset();
    withTransactionMock.mockClear();
  });

  it('creates a rating when payload and auth are valid', async () => {
    txQueryMock
      .mockResolvedValueOnce({ rows: [{ id: 8, name: 'Main St Segment' }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 99,
          segment_id: 8,
          user_id: 77,
          rating: 5,
          comment: 'Smooth ride',
          created_at: '2025-12-01T00:00:00.000Z',
        }],
      })
      .mockResolvedValueOnce({ rows: [{ average: '4.75' }] });

    const res = await request(app)
      .post('/ratings')
      .set('Authorization', authHeader())
      .send({ segmentId: 8, rating: 5, comment: 'Smooth ride' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        rating: {
          id: 99,
          segment_id: 8,
          user_id: 77,
          rating: 5,
          comment: 'Smooth ride',
        },
        segment: { id: 8, name: 'Main St Segment' },
        newAverage: '4.75',
      },
    });
    expect(withTransactionMock).toHaveBeenCalledTimes(1);
    expect(txQueryMock).toHaveBeenCalledTimes(3);
  });

  it('rejects invalid rating payloads without hitting the database', async () => {
    const res = await request(app)
      .post('/ratings')
      .set('Authorization', authHeader())
      .send({ segmentId: 0, rating: 10, comment: 12345 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Validation failed' });
    expect(withTransactionMock).not.toHaveBeenCalled();
    expect(txQueryMock).not.toHaveBeenCalled();
  });
});
