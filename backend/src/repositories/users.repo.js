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

