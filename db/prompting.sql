-- Get user from username

SELECT *
FROM users
WHERE username = '${username}';

-- Get all user's ratings from id

SELECT ratings.*
FROM users
INNER JOIN ratings
ON ratings.user_id = users.id
WHERE users.username = '${username}';

-- Get all ratings from a road

SELECT ratings.*
FROM roads
INNER JOIN ratings
ON ratings.road_id = roads.id
WHERE roads.id = '${road_id}';

-- Get top 5 rated roads

SELECT roads.*, AVG(ratings.rating)
FROM roads
INNER JOIN ratings
ON ratings.segment_id = roads.id
GROUP BY roads.id
ORDER BY AVG(ratings.rating) DESC
LIMIT 5;

-- New rating for given username, road_id

INSERT INTO ratings (user_id, road_id, rating, created_at)
VALUES (${userid}, ${roadid}, ${ratingnum}, GETDATE());

-- Delete rating (Make sure user has correct credentials)

DELETE FROM ratings
WHERE user_id = '${user_id}' AND road_id = '${road_id}';

-- OR

DELETE FROM ratings
WHERE id = '${rating_id}';

-- Edit rating

UPDATE ratings
SET rating = ${rating}
WHERE id = '${rating_id}'