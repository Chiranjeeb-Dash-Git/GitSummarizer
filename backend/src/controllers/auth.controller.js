import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { toPublicUser } from '../utils/mappers.js';
import { setSession, clearSession } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import * as users from '../repositories/users.repo.js';

// Step 1: Initiate registration -> generates OTP and dispatches email
export const register = asyncHandler(async (req, res) => {
  const result = await authService.initiateRegistration(req.body);
  res.status(200).json({
    data: {
      status: 'pending_verification',
      email: result.email,
      expiresAt: result.expiresAt,
      code: result.code,
      resendBlocked: result.resendBlocked,
      message: result.resendBlocked
        ? 'Resend testing domain only delivers to the owner email. The code has been provided for quick testing.'
        : 'Verification code sent to your email.',
    },
  });
});

// Step 2: Verify OTP code -> creates user account and creates session cookie
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    throw new AppError(400, 'BAD_REQUEST', 'Email and verification code are required.');
  }
  const user = await authService.verifyRegistrationOtp({ email, code });
  setSession(res, user.id);
  res.status(201).json({ data: { user: toPublicUser(user) } });
});

// Resend OTP code
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError(400, 'BAD_REQUEST', 'Email is required.');
  const result = await authService.resendVerificationOtp({ email });
  res.json({
    data: {
      status: 'pending_verification',
      email: result.email,
      expiresAt: result.expiresAt,
      code: result.code,
      resendBlocked: result.resendBlocked,
      message: result.resendBlocked
        ? 'Resend testing domain only delivers to the owner email. The code has been provided for quick testing.'
        : 'A fresh verification code has been sent.',
    },
  });
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
