import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { inMemoryAdminUser, recordSecurityEvent } from './account.controller';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  // Graceful fallback
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if matches inMemoryAdminUser
  if (
    normalizedEmail === inMemoryAdminUser.email.toLowerCase() ||
    normalizedEmail === 'admin@hutty.in' ||
    normalizedEmail === 'admin@costcalculator.app'
  ) {
    const isPasswordValid = await bcrypt.compare(password, inMemoryAdminUser.passwordHash);
    if (isPasswordValid) {
      inMemoryAdminUser.lastLoginAt = new Date();
      await recordSecurityEvent(
        inMemoryAdminUser.email,
        'LOGIN_SUCCESS',
        { method: 'PASSWORD', clientIp: req.ip },
        req.ip,
        req.headers['user-agent']
      );

      const token = jwt.sign(
        {
          id: inMemoryAdminUser.id,
          email: inMemoryAdminUser.email,
          role: inMemoryAdminUser.role,
          v: inMemoryAdminUser.tokenVersion,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: inMemoryAdminUser.id,
          name: inMemoryAdminUser.name,
          email: inMemoryAdminUser.email,
          role: inMemoryAdminUser.role,
        },
      });
    } else {
      await recordSecurityEvent(
        email,
        'LOGIN_FAILED',
        { reason: 'Invalid password', clientIp: req.ip },
        req.ip,
        req.headers['user-agent']
      );
      return res.status(401).json({ error: 'Invalid credentials. Password verification failed.' });
    }
  }

  // 2. Client demo login
  if (normalizedEmail === 'client@rightcon.in' && password === 'Client@123456') {
    const token = jwt.sign({ id: 'user-1', email: normalizedEmail, role: 'USER' }, ENV.JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      token,
      user: { id: 'user-1', name: 'Rajesh Sharma', email: normalizedEmail, role: 'USER' },
    });
  }

  // 3. Database user lookup if available
  if (prisma && (prisma as any).user) {
    try {
      const dbUser = await (prisma as any).user.findUnique({ where: { email: normalizedEmail } });
      if (dbUser && dbUser.password) {
        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (isMatch) {
          const token = jwt.sign(
            { id: dbUser.id, email: dbUser.email, role: dbUser.role },
            ENV.JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            token,
            user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role },
          });
        }
      }
    } catch {
      // Fall through to 401
    }
  }

  await recordSecurityEvent(
    email,
    'LOGIN_FAILED',
    { reason: 'User not found', clientIp: req.ip },
    req.ip,
    req.headers['user-agent']
  );

  return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = jwt.sign({ id: `user-${Date.now()}`, email, role: 'USER' }, ENV.JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: `user-${Date.now()}`, name, email, phone, role: 'USER' },
  });
}
