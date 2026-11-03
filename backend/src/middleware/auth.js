import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../services/auth.service.js';
import * as usersRepo from '../repositories/users.repo.js';
import { logger } from '../config/logger.js';

let remoteJwks = null;
function getNeonJwks() {
  if (!remoteJwks && env.NEON_AUTH_JWKS_URL) {
    try {
      remoteJwks = createRemoteJWKSet(new URL(env.NEON_AUTH_JWKS_URL));
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to initialize Neon JWKS client');
    }
  }
  return remoteJwks;
}

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

export async function attachUser(req, _res, next) {
  // 1. Check Bearer Authorization header (e.g. from Neon Auth JWT or API client)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      // Try local JWT first
      try {
        const payload = jwt.verify(bearerToken, env.JWT_SECRET);
        req.user = { id: payload.sub };
        return next();
      } catch {
        // Not a local HMAC JWT; try verifying as a Neon Auth Ed25519/JWKS JWT
        const jwks = getNeonJwks();
        if (jwks) {
          try {
            const { payload } = await jwtVerify(bearerToken, jwks);
            const neonUserId = payload.sub || payload.userId || payload.id;
            const email = payload.email;
            const name = payload.name;
            if (neonUserId && email) {
              const localUser = await usersRepo.upsertNeonUser({
                id: neonUserId,
                email,
                displayName: name,
              });
              req.user = { id: localUser.id };
              return next();
            }
          } catch {
            // Invalid Bearer token
          }
        }
      }
    }
  }

  // 2. Check local cookie session
  const token = req.cookies?.[env.COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = { id: payload.sub };
      return next();
    } catch {
      // expired or tampered token: check fallback below
    }
  }

  // 3. Check Better Auth / Neon Auth session token cookie (e.g. better-auth.session_token)
  const neonSessionToken = req.cookies?.['better-auth.session_token'] || req.cookies?.['neon_auth_session'];
  if (neonSessionToken) {
    try {
      const { query } = await import('../db/pool.js');
      const { rows } = await query(
        `SELECT s.*, u.email, u.name 
         FROM neon_auth.session s 
         JOIN neon_auth.user u ON s."userId" = u.id 
         WHERE s.token = $1 AND s."expiresAt" > NOW()`,
        [neonSessionToken],
      );
      if (rows[0]) {
        const localUser = await usersRepo.upsertNeonUser({
          id: rows[0].userId,
          email: rows[0].email,
          displayName: rows[0].name,
        });
        req.user = { id: localUser.id };
        return next();
      }
    } catch (err) {
      logger.debug({ err: err.message }, 'Could not resolve Neon Auth session token');
    }
  }

  next();
}

export const requireAuth = (req, _res, next) =>
  req.user ? next() : next(new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.'));
