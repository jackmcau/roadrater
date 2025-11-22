import { describe, expect, it, vi } from 'vitest';
import { sendSuccess, sendError } from '../utils/response.js';

const createMockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('response helpers', () => {
  it('sends success payloads with defaults', () => {
    const res = createMockRes();
    sendSuccess(res, { hello: 'world' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { hello: 'world' } });
  });

  it('sends structured errors', () => {
    const res = createMockRes();
    sendError(res, 'Oops', 422, ['detail']);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Oops', details: ['detail'] });
  });
});