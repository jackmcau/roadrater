import express from 'express';
import { query } from '../db/connect.js';
import { notFound, badRequest } from '../utils/httpError.js';

const router = express.Router();

// GET /roads - Get all road segments with average ratings
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT roads.*, AVG(ratings.rating)
      FROM roads
      INNER JOIN ratings
      ON ratings.segment_id = roads.id
      GROUP BY roads.id
      ORDER BY AVG(ratings.rating) DESC
      LIMIT 5;
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      roads: result.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;