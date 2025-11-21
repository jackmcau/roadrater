import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connect.js';
import { HttpError } from '../utils/httpError.js';
import { validateUsername, validatePassword } from '../utils/validateUser.js';

const router = Router();

const normalizeUsername = (value) => (typeof value === 'string' ? value.trim() : value);

const isDbMissingTableError = (err) => err?.code === '42P01';

const handleMissingJwtSecret = (next) => {
  if (!process.env.JWT_SECRET) {
    console.error('[auth] JWT_SECRET is not configured');
    next(new HttpError(500, 'Authentication service misconfigured'));
    return true;
  }
  return false;
};

// Register a new user
router.post('/register', async (req, res, next) => {
  const { username: rawUsername, password } = req.body || {};
  const username = normalizedUsername(rawUsername);

  if (!username || !password) {
    return next(new HttpError(400, 'Username and password are required'));
  }

  // Use validators and return structured JSON error responses
  const usernameErr = validateUsername(username);
  if (usernameErr) {
    return res.status(400).json({ error: usernameErr, field: 'username' });
  }
  const passwordErr = validatePassword(password);
  if (passwordErr) {
    return res.status(400).json({ error: passwordErr, field: 'password' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    res.status(201).json({
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

    if (handleMissingJwtSecret(next)) {
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error('[auth] Error during login:', err);
    if (isDbMissingTableError(err)) {
      return next(new HttpError(500, 'User table has not been initialized'));
    }
    next(new HttpError(500, 'Server error during login', err.message));
  }
});

export default router;
