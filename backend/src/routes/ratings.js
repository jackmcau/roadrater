import express from 'express';
import { query, withTransaction } from '../db/connect.js';
import { validateRating } from '../utils/validateRating.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { requireAuth, attachUserIfPresent } from '../middleware/auth.js';

const router = express.Router();

// POST /ratings - Create a new rating
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { segmentId, rating, comment } = req.body;
    const sanitizedBody = {
      segmentId: Number(segmentId),
      rating: Number(rating),
      comment: typeof comment === 'string' ? comment.trim() : comment,
      userId: req.user.id,
    };

    const errors = validateRating(sanitizedBody);
    if (errors.length > 0) {
      throw badRequest('Validation failed', errors);
    }
    
    const outcome = await withTransaction(async (client) => {
      const segmentCheck = await client.query(
        'SELECT id, name FROM road_segments WHERE id = $1',
        [sanitizedBody.segmentId]
      );

      if (segmentCheck.rows.length === 0) {
        throw notFound('Road segment not found');
      }

      const inserted = await client.query(
        `INSERT INTO ratings (segment_id, user_id, rating, comment) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, segment_id, user_id, rating, comment, created_at`,
        [
          sanitizedBody.segmentId,
          sanitizedBody.userId,
          sanitizedBody.rating,
          sanitizedBody.comment || null,
        ]
      );

      const avgResult = await client.query(
        'SELECT AVG(rating)::numeric(10,2) as average FROM ratings WHERE segment_id = $1',
        [sanitizedBody.segmentId]
      );

      return {
        rating: inserted.rows[0],
        segment: segmentCheck.rows[0],
        newAverage: avgResult.rows[0].average,
      };
    });

    sendCreated(res, outcome);
  } catch (error) {
    next(error);
  }
});

// GET /ratings/:segmentId - Get all ratings for a road segment
router.get('/:segmentId', attachUserIfPresent, async (req, res, next) => {
  try {
    const { segmentId } = req.params;
    const parsedId = Number.parseInt(segmentId, 10);
    
    // Validate ID
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw badRequest('segmentId must be a positive integer');
    }
    
    // Check if road segment exists and get ratings in one query
    const segmentResult = await query(
      'SELECT id, name, lat, lng FROM road_segments WHERE id = $1',
      [parsedId]
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
      [parsedId]
    );
    
    // Get aggregated statistics
    const statsResult = await query(
      `SELECT 
        COUNT(id)::int as total_ratings,
        AVG(rating)::numeric(10,2) as average_rating,
        MIN(rating)::int as min_rating,
        MAX(rating)::int as max_rating
      FROM ratings 
      WHERE segment_id = $1`,
      [parsedId]
    );
    
    sendSuccess(res, {
      segment: segmentResult.rows[0],
      statistics: statsResult.rows[0],
      ratings: ratingsResult.rows,
      requestedBy: req.user?.id ?? null,
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
