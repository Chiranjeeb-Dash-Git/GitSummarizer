import { query } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

const SAVED_SELECT = `
  ss.id, ss.note, ss.tags, ss.created_at, ss.updated_at,
  s.id AS summary_id, s.kind, s.audience, s.title,
  r.owner, r.name, r.avatar_url, r.language, r.stars`;

const FROM = `
  FROM saved_summaries ss
  JOIN summaries s ON s.id = ss.summary_id
  JOIN repositories r ON r.id = s.repository_id`;

const toItem = (row) => ({
  id: row.id,
  note: row.note,
  tags: row.tags,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  summaryId: row.summary_id,
  kind: row.kind,
  audience: row.audience,
  title: row.title,
  repository: {
    owner: row.owner,
    name: row.name,
    fullName: `${row.owner}/${row.name}`,
    avatarUrl: row.avatar_url,
    language: row.language,
    stars: row.stars,
  },
});

const dedupe = (tags) => [...new Set(tags)];
const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

async function getOne(userId, id) {
  const { rows } = await query(`SELECT ${SAVED_SELECT} ${FROM} WHERE ss.id = $1 AND ss.user_id = $2`, [id, userId]);
  return rows[0] ? toItem(rows[0]) : null;
}

export async function list(userId, { q, tag }) {
  const like = q ? `%${escapeLike(q)}%` : null;
  const { rows } = await query(
    `SELECT ${SAVED_SELECT} ${FROM}
      WHERE ss.user_id = $1
        AND ($2::text IS NULL OR r.owner ILIKE $2 OR r.name ILIKE $2 OR ss.note ILIKE $2 OR s.title ILIKE $2)
        AND ($3::text IS NULL OR $3 = ANY (ss.tags))
      ORDER BY ss.created_at DESC
      LIMIT 200`,
    [userId, like, tag ?? null],
  );
  return rows.map(toItem);
}

export async function tagsFor(userId) {
  const { rows } = await query(
    'SELECT t AS tag, count(*)::int AS uses FROM saved_summaries, unnest(tags) AS t WHERE user_id = $1 GROUP BY t ORDER BY uses DESC, t',
    [userId],
  );
  return rows.map((r) => r.tag);
}

export async function findBySummary(userId, summaryId) {
  const { rows } = await query(
    'SELECT id, note, tags FROM saved_summaries WHERE user_id = $1 AND summary_id = $2',
    [userId, summaryId],
  );
  return rows[0] ?? null;
}

export async function upsert(userId, { summaryId, note, tags }) {
  try {
    const { rows } = await query(
      `INSERT INTO saved_summaries (user_id, summary_id, note, tags)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, summary_id) DO UPDATE SET note = EXCLUDED.note, tags = EXCLUDED.tags
       RETURNING id`,
      [userId, summaryId, note, dedupe(tags)],
    );
    return getOne(userId, rows[0].id);
  } catch (err) {
    if (err.code === '23503') throw new AppError(404, 'NOT_FOUND', 'That summary does not exist.');
    throw err;
  }
}

export async function update(userId, id, { note, tags }) {
  const { rowCount } = await query(
    `UPDATE saved_summaries
        SET note = COALESCE($3, note), tags = COALESCE($4, tags)
      WHERE id = $1 AND user_id = $2`,
    [id, userId, note ?? null, tags ? dedupe(tags) : null],
  );
  return rowCount ? getOne(userId, id) : null;
}

export async function remove(userId, id) {
  const { rowCount } = await query('DELETE FROM saved_summaries WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount > 0;
}

