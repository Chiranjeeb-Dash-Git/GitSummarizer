import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../db/pool.js';
import * as users from '../repositories/users.repo.js';
import * as emailService from './email.service.js';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export async function initiateRegistration({ email, password, displayName }) {
  const normEmail = email.toLowerCase().trim();

  const existing = await users.findByEmail(normEmail);
  if (existing) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await query(
    `INSERT INTO email_verifications (email, code, password_hash, display_name, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code, password_hash = EXCLUDED.password_hash,
       display_name = EXCLUDED.display_name, expires_at = EXCLUDED.expires_at, created_at = now()`,
    [normEmail, code, passwordHash, displayName.trim(), expiresAt],
  );

  await emailService.sendVerificationOtp({
    email: normEmail,
    code,
    displayName: displayName.trim(),
  });

  return {
    email: normEmail,
    expiresAt,
  };
}

export async function verifyRegistrationOtp({ email, code }) {
  const normEmail = email.toLowerCase().trim();
  const cleanCode = String(code).trim();

  try {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        `DELETE FROM email_verifications
          WHERE email = $1 AND code = $2 AND expires_at > now()
          RETURNING *`,
        [normEmail, cleanCode],
      );
      if (!rows.length) {
        throw new AppError(400, 'INVALID_OTP', 'The verification code is incorrect or has expired.');
      }
      const pending = rows[0];
      const result = await client.query(
        'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING *',
        [pending.email, pending.password_hash, pending.display_name],
      );
      return result.rows[0];
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    }
    throw err;
  }
}

export async function resendVerificationOtp({ email }) {
  const normEmail = email.toLowerCase().trim();
  const { rows } = await query(
    `SELECT * FROM email_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
    [normEmail],
  );

  if (!rows.length) {
    throw new AppError(404, 'NOT_FOUND', 'No pending registration found for this email. Please register again.');
  }

  const pending = rows[0];
  const newCode = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await query(
    `UPDATE email_verifications SET code = $1, expires_at = $2 WHERE id = $3`,
    [newCode, expiresAt, pending.id],
  );

  await emailService.sendVerificationOtp({
    email: normEmail,
    code: newCode,
    displayName: pending.display_name,
  });

  return {
    email: normEmail,
    expiresAt,
  };
}

export async function login({ email, password }) {
  const user = await users.findByEmail(email);
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  return user;
}

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
