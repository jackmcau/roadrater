-- Seed data for RoadRater

-- Insert sample users
INSERT INTO users (username, password) VALUES
    ('demo_user', '$2a$10$cXMdTmthBTOmZS80zpFX2ufwEzUNhEMdSFQdNi1Y2YQKVdiMYqYR6'),
    ('roadfan', '$2a$10$cXMdTmthBTOmZS80zpFX2ufwEzUNhEMdSFQdNi1Y2YQKVdiMYqYR6'),
    ('cyclist123', '$2a$10$cXMdTmthBTOmZS80zpFX2ufwEzUNhEMdSFQdNi1Y2YQKVdiMYqYR6')
ON CONFLICT (username) DO NOTHING;

-- Insert sample road segments
INSERT INTO road_segments (name, lat, lng) VALUES 
    ('Main Street Downtown', 37.7749, -122.4194),
    ('Highway 101 North', 37.8044, -122.2712),
    ('Oak Avenue Residential', 37.7599, -122.4148);

-- Insert sample ratings for Main Street
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (1, (SELECT id FROM users WHERE username = 'demo_user'), 5, 'Smooth pavement, well maintained!'),
    (1, (SELECT id FROM users WHERE username = 'roadfan'), 4, 'Good condition overall, minor potholes near intersection'),
    (1, (SELECT id FROM users WHERE username = 'cyclist123'), 5, 'Excellent road quality');

-- Insert sample ratings for Highway 101
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (2, (SELECT id FROM users WHERE username = 'demo_user'), 3, 'Some rough patches, needs repair'),
    (2, (SELECT id FROM users WHERE username = 'roadfan'), 3, 'Average condition, could be better');

-- Insert sample ratings for Oak Avenue
INSERT INTO ratings (segment_id, user_id, rating, comment) VALUES
    (3, (SELECT id FROM users WHERE username = 'cyclist123'), 4, 'Nice quiet street, well paved'),
    (3, (SELECT id FROM users WHERE username = 'demo_user'), 5, 'Perfect for cycling'),
    (3, (SELECT id FROM users WHERE username = 'roadfan'), 4, 'Good surface quality');
