# RoadRater Backend

Express API server for RoadRater application.

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

3. **Initialize database:**
   
   Make sure PostgreSQL is running, then create the database and run the schema:
   ```bash
   # Create database (if it doesn't exist)
   createdb roadrater
   
   # Run schema to create tables
   psql -d roadrater -f db/schema.sql
   ```
   
   Or if using a specific user:
   ```bash
   psql -U postgres -d roadrater -f db/schema.sql
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Health
- `GET /health` - Health check
  - Response: `{ "ok": true }`

### Roads
- `GET /roads` - List roads (placeholder data)

### Ratings
- `POST /ratings` - Create a new rating
  - Body: `{ "segmentId": 1, "userId": "user123", "rating": 5, "comment": "Great road!" }`
  - `segmentId` (required): ID of the road segment
  - `userId` (optional): User identifier (defaults to "anonymous")
  - `rating` (required): Integer 1-5
  - `comment` (optional): Text comment
  - Response: `{ "success": true, "rating": {...} }`

- `GET /ratings/:segmentId` - Get all ratings for a road segment
  - Response: `{ "segment": {...}, "averageRating": 4.5, "totalRatings": 10, "ratings": [...] }`

## Database Schema

See `db/schema.sql` for the complete schema. Tables:
- `road_segments` - Road segment information
- `ratings` - User ratings for road segments

## Tech Stack

- Node.js + Express
- PostgreSQL (via pg)
- CORS enabled for `http://localhost:3000`
