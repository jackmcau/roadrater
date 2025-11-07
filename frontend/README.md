# RoadRater Frontend

Vanilla HTML/CSS/JavaScript frontend with Google Maps integration.

## Setup

1. **Set your Google Maps API Key:**
   ```bash
   # Edit frontend/lib/maps.js and replace YOUR_API_KEY_HERE with your actual key
   ```

2. **Start a local server:**
   ```bash
   # Option 1: Using Python
   python3 -m http.server 3000
   
   # Option 2: Using Node.js http-server
   npx http-server -p 3000
   
   # Option 3: Using PHP
   php -S localhost:3000
   ```

3. **Open in browser:**
   - Visit http://localhost:3000
   - Make sure the backend is running on http://localhost:3001

## Features

### Map Browse (`map-browse.html`)
- Interactive Google Map centered on Boulder, CO
- Shows all rated road segments as markers
- Click markers to see road preview with ratings
- Navigate to detailed road view

### Road Details (`road-detail.html`)
- Displays road name and aggregate ratings
- Shows Google Street View panorama
- Interactive rating form (1-5 stars)
- Lists all user ratings with comments
- Real-time updates after submission

### API Integration
- All data fetched from backend API at http://localhost:3001
- Endpoints used:
  - `GET /roads` - List all roads
  - `GET /roads/:id` - Single road details
  - `GET /ratings/:segmentId` - Ratings for a road
  - `POST /ratings` - Submit new rating

## File Structure

```
frontend/
├── index.html              # Home page
├── map-browse.html         # Map view with all roads
├── road-detail.html        # Individual road details
├── rate.html               # Rating page
├── leaderboard.html        # Leaderboard
├── lib/
│   ├── api.js              # API client helpers
│   └── maps.js             # Google Maps integration
└── .env.example            # Environment config template
```

## API Client (`lib/api.js`)

Simple fetch-based API client with methods:
- `api.getRoads()` - Get all roads
- `api.getRoad(id)` - Get single road
- `api.getRatings(segmentId)` - Get ratings for road
- `api.submitRating(data)` - Submit new rating

## Maps Module (`lib/maps.js`)

Google Maps functionality:
- `loadGoogleMapsAPI()` - Load Maps script
- `initMap(element, options)` - Initialize map
- `addRoadMarkers(roads, callback)` - Add road markers
- `initStreetView(element, lat, lng)` - Initialize Street View

## Development Notes

- Uses ES6 modules (`type="module"`)
- No build step required
- CORS must be enabled on backend for http://localhost:3000
- Tailwind CSS loaded from CDN
- Google Maps API loaded dynamically

## Environment Variables

Create a `.env.local` file (not committed):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

Note: For vanilla JS, you'll need to manually set these in the code files.
