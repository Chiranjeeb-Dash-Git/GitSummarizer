import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../utils/AppError.js';
import { streamOpenAI } from './openai.provider.js';
import { streamAnthropic } from './anthropic.provider.js';
import { streamGemini } from './gemini.provider.js';

export async function generate(opts) {
  try {
    if (env.AI_PROVIDER === 'gemini') return await streamGemini(opts);
    if (env.AI_PROVIDER === 'openai') return await streamOpenAI(opts);
    return await streamAnthropic(opts);
  } catch (err) {
    if (opts.signal?.aborted || err?.name === 'AbortError' || err?.name === 'APIUserAbortError') throw err;
    logger.error({ err: { message: err.message, status: err.status } }, 'AI provider failure');
    if (err.status === 429) {
      throw new AppError(503, 'AI_RATE_LIMITED', 'The summary engine is busy. Try again in a minute.');
    }
    throw new AppError(502, 'AI_UNAVAILABLE', 'The summary engine is unavailable right now. Try again shortly.');
  }
}

