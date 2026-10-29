import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { pool } from './db/pool.js';

const server = app.listen(env.PORT, () => {
  logger.info(`GitSummarizer API listening on :${env.PORT} (${env.NODE_ENV})`);
});

// Keep connections open slightly longer than typical proxy idle timeouts.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

function shutdown(signal) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
process.on('unhandledRejection', (err) => logger.error({ err }, 'unhandled rejection'));

