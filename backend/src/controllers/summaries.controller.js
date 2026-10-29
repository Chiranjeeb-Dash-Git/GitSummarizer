import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { openSSE } from '../utils/sse.js';
import { toPublicSummary } from '../utils/mappers.js';
import { runSummary } from '../services/summary.service.js';
import * as summaries from '../repositories/summaries.repo.js';
import * as saved from '../repositories/saved.repo.js';

export async function streamSummary(req, res) {
  const sse = openSSE(req, res);
  const { input, kind, audience, options } = req.body;
  try {
    await runSummary({
      input,
      kind,
      audience,
      options: { ...options, refresh: Boolean(req.user && options.refresh) },
      userId: req.user?.id ?? null,
      emit: sse.send,
      signal: sse.signal,
    });
  } catch (err) {
    if (!sse.signal.aborted) {
      const known = err instanceof AppError;
      if (!known) logger.error({ err, requestId: req.id }, 'summary stream failed');
      const e = known ? err : new AppError(500, 'INTERNAL', 'Something went wrong on our side.');
      sse.send('error', { code: e.code, message: e.message, details: e.details });
    }
  } finally {
    sse.close();
  }
}

export const getSummary = asyncHandler(async (req, res) => {
  const found = await summaries.getByIdWithRepo(req.params.id);
  if (!found) throw new AppError(404, 'NOT_FOUND', 'That summary does not exist.');
  const mine = req.user ? await saved.findBySummary(req.user.id, found.summary.id) : null;
  res.json({
    data: {
      summary: toPublicSummary(found.summary, found.repository),
      saved: mine ? { id: mine.id, note: mine.note, tags: mine.tags } : null,
    },
  });
});

