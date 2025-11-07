-- RoadRater Database Schema

-- Road segments table
CREATE TABLE IF NOT EXISTS road_segments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    segment_id INT NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
    user_id TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ratings_segment_id ON ratings(segment_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- Insert sample road segments for testing
INSERT INTO road_segments (name) VALUES 
    ('Main Street'),
    ('Highway 101'),
    ('Oak Avenue')
ON CONFLICT DO NOTHING;
