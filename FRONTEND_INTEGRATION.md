# Frontend Integration Setup Instructions

## ⚠️ Important: Google Maps API Key Required

Before the map features will work, you need to add your Google Maps API Key.

### Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Street View Static API
4. Go to "Credentials" and create an API Key
5. (Optional but recommended) Restrict the key to:
   - HTTP referrers: `http://localhost:3000/*`
   - APIs: Maps JavaScript API, Street View Static API

### Add Your API Key

Edit `frontend/lib/maps.js` and replace the placeholder:

```javascript
// Line 7:
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

## Running the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npx http-server -p 3000 -c-1
# Frontend runs on http://localhost:3000
```

### 3. Open in Browser
Visit: http://localhost:3000

## Features

### Home Page (`index.html`)
- Landing page with navigation to main features
- Links to Map Browse, Rate, and Leaderboard

### Map Browse (`map-browse.html`) ✨ NEW
- Interactive Google Map centered on Boulder, CO
- Shows all rated roads as clickable markers
- Marker info windows display:
  - Road name
  - Average rating with star visualization
  - Rating count
  - "View Details" button
- Grid view of all roads below the map
- Real-time data from backend API

### Road Detail (`road-detail.html`) ✨ NEW
- Comprehensive road information page
- **Google Street View** panorama of the road location
- Current average rating and total rating count
- **Interactive Rating Form:**
  - Click-to-select star rating (1-5)
  - Optional comment field (max 500 chars)
  - Character counter
  - Form validation
  - Success/error feedback
  - Optimistic UI updates
- **All User Ratings:**
  - List of all previous ratings
  - Shows stars, comment, user, and date
  - Updates in real-time after new submission

## API Integration

The frontend communicates with the backend using `frontend/lib/api.js`:

### Endpoints Used
- `GET /roads` - Fetch all roads with aggregate ratings
- `GET /roads/:id` - Fetch single road details
- `GET /ratings/:segmentId` - Fetch all ratings for a road
- `POST /ratings` - Submit a new rating

### CORS
Backend is configured to accept requests from `http://localhost:3000`

## File Structure

```
frontend/
├── index.html              # Home page (updated with map link)
├── map-browse.html         # NEW: Map view with all roads
├── road-detail.html        # NEW: Individual road details & rating
├── rate.html               # Original rating page
├── leaderboard.html        # Leaderboard
├── lib/
│   ├── api.js              # NEW: API client helpers
│   └── maps.js             # NEW: Google Maps integration
├── package.json            # NEW: Frontend dependencies
├── README.md               # NEW: Frontend documentation
└── .env.example            # NEW: Environment config template
```

## Testing the Integration

1. ✅ **Home page** - Navigate to map browse
2. ✅ **Map browse** - Loads map with road markers from API
3. ✅ **Click marker** - Shows info window with road preview
4. ✅ **View details** - Opens road detail page
5. ✅ **Street View** - Displays panorama for road location
6. ✅ **Submit rating** - Posts to API and updates display
7. ✅ **View ratings** - Shows all user ratings from database

## Known Issues

- Google Maps API key needs to be manually added to `frontend/lib/maps.js`
- User authentication not yet implemented (using placeholder user IDs)
- No error handling for missing Street View at location

## Next Steps

1. Add authentication system
2. Implement user profiles
3. Add road search and filtering
4. Mobile responsive improvements
5. Add loading skeletons for better UX
