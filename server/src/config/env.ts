import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'cost-calculator-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cost_calculator_db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  FRONTEND_URL: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://hutty.in' : 'http://localhost:3000'),
  BACKEND_URL: process.env.BACKEND_URL || 'https://hutty-api-st46.onrender.com',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CASHFREE_APP_ID: (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_KEY_ID || process.env.CASHFREE_API_KEY || '').trim(),
  CASHFREE_SECRET_KEY: (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET || process.env.CASHFREE_API_SECRET || '').trim(),
  CASHFREE_WEBHOOK_SECRET: (process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '').trim(),
  CASHFREE_ENV: (process.env.CASHFREE_ENV || 'TEST').toUpperCase(),
  CASHFREE_API_VERSION: process.env.CASHFREE_API_VERSION || '2023-08-01',
  DB_INIT_SECRET: process.env.DB_INIT_SECRET || '',
  MSG91_AUTH_KEY: (process.env.MSG91_AUTH_KEY || '').trim(),
  MSG91_TEMPLATE_ID: (process.env.MSG91_TEMPLATE_ID || '').trim(),
  MSG91_OTP_EXPIRY_MINUTES: Number(process.env.MSG91_OTP_EXPIRY_MINUTES) || 5,
  MSG91_OTP_LENGTH: Number(process.env.MSG91_OTP_LENGTH) || 6,
};
