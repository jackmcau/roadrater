-- Seed data for RoadRater

-- Insert sample road segments
INSERT INTO road_segments (name, lat, lng) VALUES 
    ('Main Street Downtown', 37.7749, -122.4194),
    ('Highway 101 North', 37.8044, -122.2712),
    ('Oak Avenue Residential', 37.7599, -122.4148);

-- Insert sample ratings for Main Street
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (1, 'user_001', 5, 'Smooth pavement, well maintained!'),
    (1, 'user_002', 4, 'Good condition overall, minor potholes near intersection'),
    (1, 'user_003', 5, 'Excellent road quality');

-- Insert sample ratings for Highway 101
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (2, 'user_004', 3, 'Some rough patches, needs repair'),
    (2, 'user_005', 3, 'Average condition, could be better');

-- Insert sample ratings for Oak Avenue
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (3, 'user_006', 4, 'Nice quiet street, well paved'),
    (3, 'user_007', 5, 'Perfect for cycling'),
    (3, 'user_008', 4, 'Good surface quality');
