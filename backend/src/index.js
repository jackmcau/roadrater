import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import roadsRouter from './routes/roads.js';
import ratingsRouter from './routes/ratings.js';
import authRouter from './routes/auth.js';
import top5Router from './routes/top5.js';
import { errorHandler } from './utils/httpError.js';
import config from './config/env.js';

const app = express();
const PORT = config.port;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowAnyOrigin = config.corsOrigins.includes('*');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowAnyOrigin || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    service: 'roadrater-backend'
  });
});

// API Routes
app.use('/roads', roadsRouter);
app.use('/ratings', ratingsRouter);
app.use('/auth', authRouter);
app.use('/top5', top5Router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

let server;

if (config.env !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`RoadRater backend running on port ${PORT}`);
    console.log(`Environment: ${config.env}`);
  });
}

export { app, server };
export default app;
