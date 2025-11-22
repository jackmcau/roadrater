import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connect.js';
import { HttpError } from '../utils/httpError.js';
import { validateUsername, validatePassword } from '../utils/validateUser.js';
import { sendCreated, sendSuccess, sendError } from '../utils/response.js';
import config from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const normalizeUsername = (value) => (typeof value === 'string' ? value.trim() : value);

const isDbMissingTableError = (err) => err?.code === '42P01';

// Register a new user
router.post('/register', async (req, res, next) => {
  const { username: rawUsername, password } = req.body || {};
  const username = normalizeUsername(rawUsername);

  if (!username || !password) {
    return next(new HttpError(400, 'Username and password are required'));
  }

  // Use validators and return structured JSON error responses
  const usernameErr = validateUsername(username);
  if (usernameErr) {
    return sendError(res, usernameErr, 400, { field: 'username' });
  }
  const passwordErr = validatePassword(password);
  if (passwordErr) {
    return sendError(res, passwordErr, 400, { field: 'password' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    sendCreated(res, {
      id: newUser.rows[0].id,
      username: newUser.rows[0].username,
    });
  } catch (err) {
    console.error('[auth] Error during registration:', err);
    if (err.code === '23505') { // Unique violation
      return next(new HttpError(409, 'Username already exists'));
    }
    if (isDbMissingTableError(err)) {
      return next(new HttpError(500, 'User table has not been initialized'));
    }
    next(new HttpError(500, 'Server error during registration', err.message));
  }
});

// Login a user
router.post('/login', async (req, res, next) => {
  const { username: rawUsername, password } = req.body || {};
  const username = normalizeUsername(rawUsername);

  if (!username || !password) {
    return next(new HttpError(400, 'Username and password are required'));
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return next(new HttpError(401, 'Invalid credentials'));
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new HttpError(401, 'Invalid credentials'));
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: '1h',
    });

    sendSuccess(res, { token });
  } catch (err) {
    console.error('[auth] Error during login:', err);
    if (isDbMissingTableError(err)) {
      return next(new HttpError(500, 'User table has not been initialized'));
    }
    next(new HttpError(500, 'Server error during login', err.message));
  }
});

// Return current user profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, username, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rowCount === 0) {
      return next(new HttpError(404, 'User not found'));
    }
    sendSuccess(res, { user: result.rows[0] });
  } catch (error) {
    next(new HttpError(500, 'Failed to fetch user profile', error.message));
  }
});

export default router;
