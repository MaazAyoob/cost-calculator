import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

import { PrismaClient } from '@prisma/client';
import { inMemoryCustomerUsers } from '../controllers/auth.controller';

let prismaAuth: PrismaClient | null = null;
if (process.env.DATABASE_URL) {
  try {
    prismaAuth = new PrismaClient();
  } catch {
    prismaAuth = null;
  }
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required', message: 'Access token required' });
  }

  // Allow dev mock token strictly in non-production local development environments
  if (ENV.NODE_ENV !== 'production' && token === 'dev-admin-mock-token-2026') {
    req.user = {
      id: 'admin-1',
      name: 'Hutty Admin',
      email: 'admin@hutty.in',
      role: 'ADMIN',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;

    // Server-side account status check: Reject existing JWTs if account was disabled
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPERADMIN' && decoded.email !== 'admin@hutty.in') {
      // 1. Check in-memory customer accounts
      const memUser = inMemoryCustomerUsers.get(decoded.email.toLowerCase());
      if (memUser && (memUser as any).disabled) {
        return res.status(403).json({
          error: 'ACCOUNT_DISABLED',
          message: 'Your account has been disabled by an administrator. Please contact support.',
        });
      }

      // 2. Check Database if available
      if (prismaAuth) {
        try {
          const dbUser = await (prismaAuth as any).user.findUnique({
            where: { id: decoded.id },
            select: { disabled: true },
          });
          if (dbUser && dbUser.disabled) {
            return res.status(403).json({
              error: 'ACCOUNT_DISABLED',
              message: 'Your account has been disabled by an administrator. Please contact support.',
            });
          }
        } catch {
          // non-fatal database lookup fallback
        }
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token', message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  next();
}
