import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../services/auth.service.js';

const baseCookie = () => ({
  httpOnly: true,
  secure: env.isProd || env.COOKIE_SAMESITE === 'none',
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/',
});

export const setSession = (res, userId) =>
  res.cookie(env.COOKIE_NAME, signToken(userId), { ...baseCookie(), maxAge: 7 * 24 * 60 * 60 * 1000 });

export const clearSession = (res) => res.clearCookie(env.COOKIE_NAME, baseCookie());

export function attachUser(req, _res, next) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = { id: payload.sub };
    } catch {
      // expired or tampered token: treat as a guest
    }
  }
  next();
}

export const requireAuth = (req, _res, next) =>
  req.user ? next() : next(new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.'));

