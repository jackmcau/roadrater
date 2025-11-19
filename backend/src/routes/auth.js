import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connect.js';
import { HttpError } from '../utils/httpError.js';
import { validateUsername, validatePassword } from '../utils/validateUser.js';

const router = Router();

// Register a new user
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

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
    if (err.code === '23505') { // Unique violation
      return next(new HttpError(409, 'Username already exists'));
    }
    next(new HttpError(500, 'Server error during registration', err.message));
  }
});

// Login a user
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    next(new HttpError(500, 'Server error during login', err.message));
  }
});

export default router;
