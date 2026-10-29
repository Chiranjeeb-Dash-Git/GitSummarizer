import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => logger.error({ err }, 'idle database client error'));

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
