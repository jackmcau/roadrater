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

3. **Database Setup:**

   **First time setup:**
   ```bash
   # Create database (if it doesn't exist)
   createdb roadrater
   
   # Run schema v2 (creates tables with proper structure)
   psql -d roadrater -f db/schema_v2.sql
   
   # Seed database with sample data
   psql -d roadrater -f db/seed.sql
   ```
   
   **Migration from v1 to v2:**
   ```bash
   # This will drop and recreate tables with new schema
   psql -d roadrater -f db/schema_v2.sql
   psql -d roadrater -f db/seed.sql
   ```
   
   **Using specific PostgreSQL user:**
   ```bash
   psql -U postgres -d roadrater -f db/schema_v2.sql
   psql -U postgres -d roadrater -f db/seed.sql
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- **GET** `/health`
  - Response: `{ "ok": true, "timestamp": "...", "service": "roadrater-backend" }`

### Roads
- **GET** `/roads`
  - Get all road segments with aggregated ratings
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
  - Create a new rating for a road segment
  - Body:
    ```json
    {
      "segmentId": 1,
      "userId": "user123",
      "rating": 5,
      "comment": "Excellent road condition!"
    }
    ```
  - Fields:
    - `segmentId` (required): Integer, ID of the road segment
    - `rating` (required): Integer 1-5
    - `userId` (optional): String, user identifier (defaults to "anonymous")
    - `comment` (optional): String, max 500 characters
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
          "user_id": "user123",
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
  -d '{
    "segmentId": 1,
    "userId": "test-user",
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
  headers: { 'Content-Type': 'application/json' },
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
- `user_id` - Text, user identifier
- `rating` - Integer (1-5)
- `comment` - Text, optional
- `created_at` - Timestamp

See `db/schema_v2.sql` for full schema with indexes and constraints.

## Project Structure

```
backend/
├── db/
│   ├── schema_v2.sql       # Database schema
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
  "error": "Validation failed",
  "details": ["rating must be between 1 and 5"]
}
```

**404 Not Found:**
```json
{
  "error": "Road segment not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Tech Stack

- **Node.js** + **Express** - Web framework
- **PostgreSQL** - Database (via `pg` driver)
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
- **nodemon** - Development auto-reload

## Environment Variables

See `.env.example` for configuration options:
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)
