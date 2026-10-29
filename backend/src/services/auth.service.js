import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import * as users from '../repositories/users.repo.js';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

export async function register({ email, password, displayName }) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return await users.create({ email, passwordHash, displayName });
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    throw err;
  }
}

export async function login({ email, password }) {
  const user = await users.findByEmail(email);
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  return user;
}

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

