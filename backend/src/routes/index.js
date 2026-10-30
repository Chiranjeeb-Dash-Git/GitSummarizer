import { Router } from 'express';
import { attachUser, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, guestSummaryLimiter, userSummaryLimiter } from '../middleware/rateLimit.js';
import * as s from '../validators/schemas.js';
import * as health from '../controllers/health.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as repos from '../controllers/repos.controller.js';
import * as summaries from '../controllers/summaries.controller.js';
import * as lib from '../controllers/library.controller.js';

const r = Router();
r.use(attachUser);

r.get('/health', health.live);
r.get('/health/ready', health.ready);

r.post('/auth/register', authLimiter, validate(s.registerSchema), auth.register);
r.post('/auth/verify-email', authLimiter, auth.verifyEmail);
r.post('/auth/resend-code', authLimiter, auth.resendOtp);
r.post('/auth/login', authLimiter, validate(s.loginSchema), auth.login);
r.post('/auth/logout', auth.logout);
r.get('/auth/me', auth.me);

r.get('/repos/preview', validate(s.previewQuerySchema, 'query'), repos.preview);

r.post(
  '/summaries/stream',
  guestSummaryLimiter,
  userSummaryLimiter,
  validate(s.summaryRequestSchema),
  summaries.streamSummary,
);
r.get('/summaries/:id', validate(s.uuidParamSchema, 'params'), summaries.getSummary);

r.get('/history', requireAuth, validate(s.historyQuerySchema, 'query'), lib.listHistory);
r.delete('/history', requireAuth, lib.clearHistory);
r.delete('/history/:id', requireAuth, validate(s.uuidParamSchema, 'params'), lib.deleteHistoryItem);

r.get('/saved', requireAuth, validate(s.savedQuerySchema, 'query'), lib.listSaved);
r.post('/saved', requireAuth, validate(s.saveBodySchema), lib.createSaved);
r.patch('/saved/:id', requireAuth, validate(s.uuidParamSchema, 'params'), validate(s.savedPatchSchema), lib.updateSaved);
r.delete('/saved/:id', requireAuth, validate(s.uuidParamSchema, 'params'), lib.deleteSaved);

r.get('/me/stats', requireAuth, lib.stats);

export default r;
