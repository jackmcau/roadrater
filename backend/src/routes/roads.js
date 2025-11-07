import express from 'express';
import { query } from '../db/connect.js';
import { notFound, badRequest } from '../utils/httpError.js';

const router = express.Router();

// GET /roads - Get all road segments with average ratings
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        rs.id,
        rs.name,
        rs.lat,
        rs.lng,
        rs.created_at,
        COUNT(r.id) as rating_count,
        COALESCE(AVG(r.rating)::numeric(10,2), 0) as average_rating
      FROM road_segments rs
      LEFT JOIN ratings r ON rs.id = r.segment_id
      GROUP BY rs.id, rs.name, rs.lat, rs.lng, rs.created_at
      ORDER BY rs.id
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

// GET /roads/:id - Get single road segment with details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw badRequest('Invalid road segment ID');
    }
    
    // Get road segment
    const roadResult = await query(
      'SELECT * FROM road_segments WHERE id = $1',
      [id]
    );
    
    if (roadResult.rows.length === 0) {
      throw notFound('Road segment not found');
    }
    
    // Get aggregated rating data
    const ratingResult = await query(`
      SELECT 
        COUNT(id) as total_ratings,
        AVG(rating)::numeric(10,2) as average_rating,
        MAX(created_at) as last_rated
      FROM ratings
      WHERE segment_id = $1
    `, [id]);
    
    res.json({
      success: true,
      road: {
        ...roadResult.rows[0],
        ...ratingResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
