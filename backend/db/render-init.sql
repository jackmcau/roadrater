-- RoadRater Production Database Initialization
-- This script initializes the Render PostgreSQL database with all required tables and seed data
-- Safe to run multiple times (idempotent) - uses DROP TABLE IF EXISTS

-- Drop existing tables in correct order (handles foreign key constraints)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS road_segments CASCADE;

-- Create Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_username ON users(username);

-- Create Road Segments table with Boulder coordinates
CREATE TABLE road_segments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for road_segments table
CREATE INDEX idx_road_segments_location ON road_segments(lat, lng);

-- Create Ratings table with foreign key constraints
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    segment_id INT NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ratings table
CREATE INDEX idx_ratings_segment_id ON ratings(segment_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Insert Boulder road segments (23 roads with coordinates)
INSERT INTO road_segments (name, lat, lng) VALUES
  ('Pearl Street Downtown',          40.0170, -105.2817),
  ('Walnut Street Downtown',         40.0162, -105.2810),
  ('Spruce Street Downtown',         40.0190, -105.2795),
  ('Canyon Boulevard Central',       40.0154, -105.2760),

  ('Broadway North',                 40.0275, -105.2790),
  ('Broadway South',                 40.0005, -105.2790),
  ('28th Street North',              40.0300, -105.2590),
  ('28th Street South',              40.0000, -105.2585),

  ('Colorado Avenue Campus',         40.0060, -105.2620),
  ('Colorado Avenue East',           40.0050, -105.2480),
  ('Baseline Road West',             40.0007, -105.2650),
  ('Baseline Road Residential',      40.0007, -105.2273),

  ('Arapahoe Avenue West',           40.0145, -105.2900),
  ('Arapahoe Avenue East',           40.0145, -105.2500),
  ('Folsom Street Corridor',         40.0175, -105.2600),
  ('30th Street Tech Hub',           40.0195, -105.2525),

  ('Foothills Parkway North',        40.0400, -105.2400),
  ('Foothills Parkway South',        40.0000, -105.2390),
  ('US-36 to Denver',                39.9142, -105.0609),
  ('Table Mesa Drive',               39.9865, -105.2520),
  ('South Boulder Road',             39.9870, -105.2330),
  ('Valmont Road East',              40.0290, -105.2300),
  ('Valmont Road West',              40.0290, -105.2700);

-- Insert sample ratings to populate the app with initial data
INSERT INTO ratings (segment_id, rating, comment) VALUES
  (1, 5, 'Smooth pavement and well-marked lanes.'),
  (1, 4, 'Great overall but busy at rush hour.'),
  (2, 3, 'Some rough patches and moderate traffic.'),
  (3, 4, 'Nice road with decent bike lanes.'),
  (4, 2, 'Several potholes, avoid in bad weather.'),
  (5, 5, 'Very clean and well maintained.'),
  (6, 4, 'Good visibility and clear signage.');

-- Verify the data was inserted correctly
SELECT 
    (SELECT COUNT(*) FROM road_segments) as road_count,
    (SELECT COUNT(*) FROM ratings) as rating_count,
    (SELECT COUNT(*) FROM users) as user_count;