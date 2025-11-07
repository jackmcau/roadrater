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
ON ratings.road_id = roads.id
GROUP BY roads.id
ORDER BY AVG(ratings.rating) DESC
LIMIT 5;