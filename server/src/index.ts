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

      // In non-production, allow wildcard if configured
      if (ENV.NODE_ENV !== 'production' && configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Explicitly allow Hutty production domains, Vercel frontend, and configured origins
      const isAllowedDomain =
        origin === 'https://hutty.in' ||
        origin === 'https://www.hutty.in' ||
        origin === 'https://cost-calculator-ten-kappa.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        configuredOrigins.includes(origin);

      if (isAllowedDomain) {
        return callback(null, true);
      }

      // Local development origins
      if (
        ENV.NODE_ENV !== 'production' &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature', 'X-Idempotency-Key'],
  })
);
app.use(
  express.json({
    limit: '2mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

// Serve uploaded images statically
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch {}
}
app.use('/uploads', express.static(uploadsDir));

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
