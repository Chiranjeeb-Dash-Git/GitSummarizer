import rateLimit from 'express-rate-limit';

const reply = (code, message) => (req, res) =>
  res.status(429).json({ error: { code, message, requestId: req.id } });

const base = { standardHeaders: 'draft-7', legacyHeaders: false };

export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 300,
  handler: reply('RATE_LIMITED', 'Too many requests. Give it a moment.'),
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 20,
  handler: reply('RATE_LIMITED', 'Too many attempts. Try again in a few minutes.'),
});

export const guestSummaryLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 8,
  skip: (req) => Boolean(req.user),
  handler: reply('GUEST_LIMIT', 'You have used this hour\'s free reads. Create an account to keep going.'),
});

export const userSummaryLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 60,
  skip: (req) => !req.user,
  keyGenerator: (req) => `user:${req.user.id}`,
  handler: reply('USER_LIMIT', 'You have reached the hourly limit. Try again later.'),
});

