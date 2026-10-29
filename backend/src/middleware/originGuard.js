import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originGuard(req, _res, next) {
  if (SAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients such as curl
  if (env.clientOrigins.includes(origin)) return next();
  try {
    if (new URL(origin).host === req.get('host')) return next(); // same-origin deployment
  } catch {
    // malformed Origin header falls through to the rejection below
  }
  return next(new AppError(403, 'ORIGIN_DENIED', 'This origin is not allowed.'));
}

