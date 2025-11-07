import express from 'express';
import { query } from '../db/connect.js';
import { validateRating } from '../utils/validateRating.js';
import { badRequest, notFound } from '../utils/httpError.js';

const router = express.Router();

// POST /ratings - Create a new rating
router.post('/', async (req, res, next) => {
  try {
    const { segmentId, userId, rating, comment } = req.body;
    
    // Validate input
    const errors = validateRating(req.body);
    if (errors.length > 0) {
      throw badRequest('Validation failed', errors);
    }
    
    // Check if road segment exists
    const segmentCheck = await query(
      'SELECT id, name FROM road_segments WHERE id = $1',
      [segmentId]
    );
    
    if (segmentCheck.rows.length === 0) {
      throw notFound('Road segment not found');
    }
    
    // Insert rating
    const result = await query(
      `INSERT INTO ratings (segment_id, user_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, segment_id, user_id, rating, comment, created_at`,
      [segmentId, userId || 'anonymous', rating, comment || null]
    );
    
    // Get updated average rating
    const avgResult = await query(
      'SELECT AVG(rating)::numeric(10,2) as average FROM ratings WHERE segment_id = $1',
      [segmentId]
    );
    
    res.status(201).json({
      success: true,
      rating: result.rows[0],
      segment: segmentCheck.rows[0],
      newAverage: avgResult.rows[0].average
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /ratings/:segmentId - Get all ratings for a road segment
router.get('/:segmentId', async (req, res, next) => {
  try {
    const { segmentId } = req.params;
    
    // Validate ID
    if (!Number.isInteger(Number(segmentId)) || Number(segmentId) <= 0) {
      throw badRequest('segmentId must be a positive integer');
    }
    
    // Check if road segment exists and get ratings in one query
    const segmentResult = await query(
      'SELECT id, name, lat, lng FROM road_segments WHERE id = $1',
      [segmentId]
    );
    
    if (segmentResult.rows.length === 0) {
      throw notFound('Road segment not found');
    }
    
    // Get ratings with aggregated data
    const ratingsResult = await query(
      `SELECT 
        id, 
        segment_id, 
        user_id, 
        rating, 
        comment, 
        created_at,
        created_at::date as rating_date
      FROM ratings 
      WHERE segment_id = $1 
      ORDER BY created_at DESC`,
      [segmentId]
    );
    
    // Get aggregated statistics
    const statsResult = await query(
      `SELECT 
        COUNT(id) as total_ratings,
        AVG(rating)::numeric(10,2) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM ratings 
      WHERE segment_id = $1`,
      [segmentId]
    );
    
    res.json({
      success: true,
      segment: segmentResult.rows[0],
      statistics: statsResult.rows[0],
      ratings: ratingsResult.rows
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
