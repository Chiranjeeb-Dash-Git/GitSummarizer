import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { toPublicUser } from '../utils/mappers.js';
import { setSession, clearSession } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import * as users from '../repositories/users.repo.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  setSession(res, user.id);
  res.status(201).json({ data: { user: toPublicUser(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  setSession(res, user.id);
  res.json({ data: { user: toPublicUser(user) } });
});

export const logout = (_req, res) => {
  clearSession(res);
  res.status(204).end();
};

export const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.json({ data: { user: null } });
  const user = await users.findById(req.user.id);
  if (!user) {
    clearSession(res);
    throw new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  }
  return res.json({ data: { user: toPublicUser(user) } });
});

