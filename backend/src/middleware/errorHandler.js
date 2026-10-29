import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  let e = err;
  if (err instanceof ZodError) {
    e = new AppError(422, 'VALIDATION_ERROR', 'Some fields need attention.', err.flatten().fieldErrors);
  } else if (err?.type === 'entity.too.large') {
    e = new AppError(413, 'PAYLOAD_TOO_LARGE', 'That request is too large.');
  } else if (err?.type === 'entity.parse.failed') {
    e = new AppError(400, 'BAD_JSON', 'The request body is not valid JSON.');
  } else if (!(err instanceof AppError)) {
    logger.error({ err, requestId: req.id }, 'unhandled error');
    e = new AppError(500, 'INTERNAL', 'Something went wrong on our side.');
  }
  if (res.headersSent) return res.end();
  return res.status(e.status).json({
    error: { code: e.code, message: e.message, details: e.details, requestId: req.id },
  });
}

