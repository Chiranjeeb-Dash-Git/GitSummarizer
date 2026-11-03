import { query } from '../db/pool.js';

export async function create({ email, passwordHash, displayName }) {
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, displayName],
  );
  return rows[0];
}

export async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function upsertNeonUser({ id, email, displayName }) {
  const { rows } = await query(
    `INSERT INTO users (id, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = COALESCE(EXCLUDED.display_name, users.display_name),
       updated_at = NOW()
     RETURNING *`,
    [id, email, 'neon_managed_auth', displayName || email.split('@')[0]],
  );
  return rows[0];
}
