import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

const configuredOrigins = (ENV.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Wildcard enabled
      if (configuredOrigins.includes('*')) return callback(null, true);

      // Explicitly allow Hutty production Vercel frontend and any Vercel preview branch
      if (
        origin === 'https://cost-calculator-ten-kappa.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        configuredOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Local development origins
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes under /api/v1
app.use('/api/v1', apiRoutes);

// Serve frontend static build in production if present
const clientDistPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`[Cost Calculator API Engine] Running at http://localhost:${ENV.PORT}/api/v1/health`);
  });
}

export default app;
