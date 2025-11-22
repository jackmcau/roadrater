import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const BEARER_PREFIX = 'Bearer ';

const extractToken = (header) => {
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith(BEARER_PREFIX)) return null;
  return header.slice(BEARER_PREFIX.length);
};

export const requireAuth = (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return next(new HttpError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.userId };
    return next();
  } catch (error) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
};

export const attachUserIfPresent = (req, _res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.userId };
  } catch (error) {
    console.warn('[auth] Failed to attach optional user from token', error.message);
  }

  next();
};

export default {
  requireAuth,
  attachUserIfPresent,
};