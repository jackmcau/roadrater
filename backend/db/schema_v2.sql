-- RoadRater Database Schema V2

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS road_segments CASCADE;

-- Road segments table with geolocation
CREATE TABLE road_segments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings table with user tracking
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    segment_id INT NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ratings_segment_id ON ratings(segment_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_road_segments_location ON road_segments(lat, lng);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;
