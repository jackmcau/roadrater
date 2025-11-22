/**
 * Validate rating input data
 * @param {Object} data - The rating data to validate
 * @returns {Array} Array of error messages (empty if valid)
 */
export const validateRating = (data) => {
  const errors = [];
  
  // Validate segmentId
  if (!data.segmentId) {
    errors.push('segmentId is required');
  } else if (!Number.isInteger(data.segmentId) || data.segmentId <= 0) {
    errors.push('segmentId must be a positive integer');
  }
  
  // Validate rating
  if (data.rating === undefined || data.rating === null) {
    errors.push('rating is required');
  } else if (!Number.isInteger(data.rating)) {
    errors.push('rating must be an integer');
  } else if (data.rating < 1 || data.rating > 5) {
    errors.push('rating must be between 1 and 5');
  }
  
  // Validate comment (optional but must be string if provided)
  if (data.comment !== undefined && data.comment !== null && typeof data.comment !== 'string') {
    errors.push('comment must be a string');
  }
  
  // Validate comment length
  if (data.comment && data.comment.length > 500) {
    errors.push('comment must be less than 500 characters');
  }
  
  // Validate userId (required for authenticated requests)
  if (data.userId === undefined || data.userId === null) {
    errors.push('userId is required');
  } else if (!Number.isInteger(data.userId) || data.userId <= 0) {
    errors.push('userId must be a positive integer');
  }
  
  return errors;
};

export default validateRating;
