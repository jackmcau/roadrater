import express from 'express';
import pool from '../db/connect.js';

const router = express.Router();

// Validation helper
const validateRating = (data) => {
  const errors = [];
  
  if (!data.segmentId || !Number.isInteger(Number(data.segmentId))) {
    errors.push('segmentId is required and must be an integer');
  }
  
  if (!data.rating || !Number.isInteger(Number(data.rating)) || data.rating < 1 || data.rating > 5) {
    errors.push('rating is required and must be between 1 and 5');
  }
  
  if (data.comment && typeof data.comment !== 'string') {
    errors.push('comment must be a string');
  }
  
  return errors;
};

// POST /ratings - Create a new rating
router.post('/', async (req, res) => {
  try {
    const { segmentId, userId, rating, comment } = req.body;
    
    // Validate input
    const errors = validateRating(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    // Check if road segment exists
    const segmentCheck = await pool.query(
      'SELECT id FROM road_segments WHERE id = $1',
      [segmentId]
    );
    
    if (segmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Road segment not found' });
    }
    
    // Insert rating
    const result = await pool.query(
      'INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [segmentId, userId || 'anonymous', rating, comment || null]
    );
    
    res.status(201).json({
      success: true,
      rating: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// GET /ratings/:segmentId - Get all ratings for a road segment
router.get('/:segmentId', async (req, res) => {
  try {
    const { segmentId } = req.params;
    
    if (!Number.isInteger(Number(segmentId))) {
      return res.status(400).json({ error: 'segmentId must be an integer' });
    }
    
    // Check if road segment exists
    const segmentCheck = await pool.query(
      'SELECT id, name FROM road_segments WHERE id = $1',
      [segmentId]
    );
    
    if (segmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Road segment not found' });
    }
    
    // Get ratings for segment
    const result = await pool.query(
      'SELECT id, segment_id, user_id, rating, comment, created_at FROM ratings WHERE segment_id = $1 ORDER BY created_at DESC',
      [segmentId]
    );
    
    // Calculate average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating)::numeric(10,2) as average FROM ratings WHERE segment_id = $1',
      [segmentId]
    );
    
    res.json({
      segment: segmentCheck.rows[0],
      averageRating: avgResult.rows[0].average || 0,
      totalRatings: result.rows.length,
      ratings: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

export default router;
