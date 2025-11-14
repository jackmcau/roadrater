-- RoadRater Database Schema

-- Road segments table
CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8)
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    road_id INTEGER REFERENCES roads(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ratings_road_id ON ratings(road_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- Insert sample road segments for testing
INSERT INTO roads (name) VALUES 
    ('Main Street'),
    ('Highway 101'),
    ('Oak Avenue')
ON CONFLICT DO NOTHING;
