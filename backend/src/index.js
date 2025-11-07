import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roadsRouter from './routes/roads.js';
import ratingsRouter from './routes/ratings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use('/roads', roadsRouter);
app.use('/ratings', ratingsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`RoadRater backend running on port ${PORT}`);
});
