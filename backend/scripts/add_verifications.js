import { query } from '../src/db/pool.js';

async function main() {
  await query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
  `);
  console.log('Created email_verifications table successfully');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
