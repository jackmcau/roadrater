TRUNCATE TABLE ratings RESTART IDENTITY CASCADE;
TRUNCATE TABLE road_segments RESTART IDENTITY CASCADE;

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

INSERT INTO ratings (segment_id, rating, comment) VALUES
  (1, 5, 'Smooth pavement and well-marked lanes.'),
  (1, 4, 'Great overall but busy at rush hour.'),
  (2, 3, 'Some rough patches and moderate traffic.'),
  (3, 4, 'Nice road with decent bike lanes.'),
  (4, 2, 'Several potholes, avoid in bad weather.'),
  (5, 5, 'Very clean and well maintained.'),
  (6, 4, 'Good visibility and clear signage.');
