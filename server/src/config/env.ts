import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'cost-calculator-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cost_calculator_db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '',
  CASHFREE_WEBHOOK_SECRET: process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '',
  CASHFREE_ENV: (process.env.CASHFREE_ENV || 'TEST').toUpperCase(),
  CASHFREE_API_VERSION: process.env.CASHFREE_API_VERSION || '2023-08-01',
  DB_INIT_SECRET: process.env.DB_INIT_SECRET || '',
};
