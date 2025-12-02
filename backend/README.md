# RoadRater Backend

Express API server for RoadRater application with PostgreSQL database integration.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
  ```bash
  cp .env.example .env
  # Edit .env with your database credentials if needed
  ```
  This same `backend/.env` file is mounted by `docker-compose`, so the Postgres
  container and the API always agree on credentials and secrets.

3. **Database Setup:**

   **First time setup:**
   ```bash
   # Create database (if it doesn't exist)
   createdb roadrater
   
  # Apply schema (creates tables with proper structure)
  psql -d roadrater -f db/schema.sql
   
   # Seed database with sample data
   psql -d roadrater -f db/seed.sql
   ```
   
   **Migration from v1 to v2:**
   ```bash
  # This will drop and recreate tables with new schema
  psql -d roadrater -f db/schema.sql
   psql -d roadrater -f db/seed.sql
   ```
   
   **Using specific PostgreSQL user:**
   ```bash
  psql -U postgres -d roadrater -f db/schema.sql
   psql -U postgres -d roadrater -f db/seed.sql
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Execute automated tests:**
  ```bash
  npm test
  ```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- **GET** `/health`
  - Response: `{ "ok": true, "timestamp": "...", "service": "roadrater-backend" }`

### Auth
- **POST** `/auth/register`
  - Registers a new account. Usernames must be alphanumeric and at least 8 characters.
- **POST** `/auth/login`
  - Returns a JWT access token on successful authentication.
  - Response: `{ "success": true, "data": { "token": "..." } }`
- **GET** `/auth/me`
  - Requires `Authorization: Bearer <token>` header and returns the authenticated user profile.

### Roads
- **GET** `/roads`
  - Get road segments with aggregated ratings (supports `?page=` and `?limit=` params; default 25 per page, max 100)
  - Response:
    ```json
    {
      "success": true,
      "count": 3,
      "roads": [
        {
          "id": 1,
          "name": "Main Street Downtown",
          "lat": 37.7749,
          "lng": -122.4194,
          "rating_count": 5,
          "average_rating": 4.5
        }
      ]
    }
    ```

- **GET** `/roads/:id`
  - Get single road segment with detailed statistics
  - Response:
    ```json
    {
      "success": true,
      "road": {
        "id": 1,
        "name": "Main Street Downtown",
        "lat": 37.7749,
        "lng": -122.4194,
        "total_ratings": 5,
        "average_rating": 4.5,
        "last_rated": "2025-11-07T..."
      }
    }
    ```

### Ratings
- **POST** `/ratings`
  - Create a new rating for a road segment (requires `Authorization: Bearer <token>` header)
  - Body:
    ```json
    {
      "segmentId": 1,
      "rating": 5,
      "comment": "Excellent road condition!"
    }
    ```
  - Fields:
    - `segmentId` (required): Integer, ID of the road segment
    - `rating` (required): Integer 1-5
    - `comment` (optional): String, max 500 characters
    - `userId` is derived from the authenticated token
  - Response:
    ```json
    {
      "success": true,
      "rating": { "id": 1, "segment_id": 1, "rating": 5, ... },
      "segment": { "id": 1, "name": "Main Street" },
      "newAverage": 4.5
    }
    ```

- **GET** `/ratings/:segmentId`
  - Get all ratings for a specific road segment
  - Response:
    ```json
    {
      "success": true,
      "segment": { "id": 1, "name": "Main Street Downtown", ... },
      "statistics": {
        "total_ratings": 5,
        "average_rating": 4.5,
        "min_rating": 3,
        "max_rating": 5
      },
      "ratings": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Great!",
          "user_id": 7,
          "created_at": "2025-11-07T..."
        }
      ]
    }
    ```

## Example API Requests

### Using cURL

**Get all roads:**
```bash
curl http://localhost:3001/roads
```

**Get specific road:**
```bash
curl http://localhost:3001/roads/1
```

**Create a rating:**
```bash
curl -X POST http://localhost:3001/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "segmentId": 1,
    "rating": 5,
    "comment": "Smooth and well-maintained road!"
  }'
```

**Get ratings for a road:**
```bash
curl http://localhost:3001/ratings/1
```

### Using JavaScript (fetch)

```javascript
// Get all roads
const roads = await fetch('http://localhost:3001/roads').then(r => r.json());

// Create a rating
const newRating = await fetch('http://localhost:3001/ratings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    segmentId: 1,
    rating: 5,
    comment: 'Excellent!'
  })
}).then(r => r.json());

// Get ratings for segment
const ratings = await fetch('http://localhost:3001/ratings/1').then(r => r.json());
```

## Database Schema

### Tables

**road_segments**
- `id` - Serial primary key
- `name` - Text, road name
- `lat` - Double precision, latitude
- `lng` - Double precision, longitude
- `created_at` - Timestamp

**ratings**
- `id` - Serial primary key
- `segment_id` - Integer, foreign key to road_segments
- `user_id` - Integer, foreign key to users (nullable for historic data)
- `rating` - Integer (1-5)
- `comment` - Text, optional
- `created_at` - Timestamp

**users**
- `id` - Serial primary key
- `username` - Unique alphanumeric identifier
- `password` - Bcrypt hashed password
- `created_at` - Timestamp

See `db/schema.sql` for the canonical schema with indexes and constraints.

## Project Structure

```
backend/
├── db/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── src/
│   ├── db/
│   │   └── connect.js      # Database connection pool
│   ├── routes/
│   │   ├── roads.js        # Road segments endpoints
│   │   └── ratings.js      # Ratings endpoints
│   ├── utils/
│   │   ├── validateRating.js   # Input validation
│   │   └── httpError.js        # Error handling utilities
│   └── index.js            # Express app entry point
├── package.json
├── .env.example
└── README.md
```

## Error Handling

The API uses consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["rating must be between 1 and 5"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Road segment not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Tech Stack

- **Node.js** + **Express** - Web framework
- **PostgreSQL** - Database (via `pg` driver)
- **CORS** - Cross-origin resource sharing
- **dotenv** / **zod** - Environment configuration + validation
- **morgan** - HTTP request logging
- **nodemon** - Development auto-reload
- **Vitest** + **Supertest** - Test harness

## Environment Variables

See `.env.example` for configuration options:
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin(s) (comma separated, default: http://localhost:3000)
- `DB_HOST` / `DB_PORT` - Database host & port (defaults match docker-compose service `db`)
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Credentials passed to PostgreSQL
- `DATABASE_URL` - Optional full connection string overriding the discrete DB fields
- `JWT_SECRET` - Secret used to sign auth tokens
- `NODE_ENV` - Environment (development/production)
