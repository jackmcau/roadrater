import express from 'express';
import { query } from '../db/connect.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

// GET /top5 - Get the top five road segments by average rating
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        rs.id,
        rs.name,
        rs.lat,
        rs.lng,
        COUNT(r.id)::int            AS rating_count,
        AVG(r.rating)::numeric(10,2) AS average_rating
      FROM road_segments rs
      LEFT JOIN ratings r ON r.segment_id = rs.id
      GROUP BY rs.id, rs.name, rs.lat, rs.lng
  ORDER BY average_rating DESC NULLS LAST, rating_count DESC
      LIMIT 5;
    `);
    
    sendSuccess(res, {
      count: result.rows.length,
      roads: result.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;