-- RoadRater Database Schema (canonical)

-- Drop existing tables (order matters because of FK constraints)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS road_segments CASCADE;

-- User accounts for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- Road segments table with optional geolocation metadata
CREATE TABLE road_segments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_road_segments_location ON road_segments(lat, lng);

-- Ratings authored by (optional) users for segments
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    segment_id INT NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ratings_segment_id ON ratings(segment_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
