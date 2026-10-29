import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../db/pool.js';

export const live = (_req, res) => res.json({ status: 'ok', uptime: Math.round(process.uptime()) });

export const ready = asyncHandler(async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});

