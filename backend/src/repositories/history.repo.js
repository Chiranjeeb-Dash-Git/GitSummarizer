import { query } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ITEM_SELECT = `
  h.id, h.query_input, h.created_at,
  to_char(h.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_ts,
  s.id AS summary_id, s.kind, s.audience, s.title,
  r.owner, r.name, r.avatar_url, r.language, r.stars,
  EXISTS (SELECT 1 FROM saved_summaries ss WHERE ss.user_id = h.user_id AND ss.summary_id = h.summary_id) AS saved`;

const toItem = (row) => ({
  id: row.id,
  input: row.query_input,
  createdAt: row.created_at,
  summaryId: row.summary_id,
  kind: row.kind,
  audience: row.audience,
  title: row.title,
  saved: row.saved,
  repository: {
    owner: row.owner,
    name: row.name,
    fullName: `${row.owner}/${row.name}`,
    avatarUrl: row.avatar_url,
    language: row.language,
    stars: row.stars,
  },
});

// Skip a duplicate if the same user opened the same summary in the last 10 minutes.
export async function add(userId, summaryId, input) {
  await query(
    `INSERT INTO search_history (user_id, summary_id, query_input)
     SELECT $1, $2, $3
      WHERE NOT EXISTS (
        SELECT 1 FROM search_history
         WHERE user_id = $1 AND summary_id = $2 AND created_at > now() - interval '10 minutes')`,
    [userId, summaryId, input.slice(0, 300)],
  );
}

export async function list(userId, { limit, cursor }) {
  let ts = null;
  let id = null;
  if (cursor) {
    [ts, id] = Buffer.from(cursor, 'base64url').toString().split('|');
    if (!ts || Number.isNaN(Date.parse(ts)) || !UUID_RE.test(id ?? '')) {
      throw new AppError(400, 'BAD_CURSOR', 'The page cursor is not valid.');
    }
  }
  const { rows } = await query(
    `SELECT ${ITEM_SELECT}
       FROM search_history h
       JOIN summaries s ON s.id = h.summary_id
       JOIN repositories r ON r.id = s.repository_id
      WHERE h.user_id = $1
        AND ($2::timestamptz IS NULL OR (h.created_at, h.id) < ($2::timestamptz, $3::uuid))
      ORDER BY h.created_at DESC, h.id DESC
      LIMIT $4`,
    [userId, ts, id, limit + 1],
  );
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page.at(-1);
  return {
    items: page.map(toItem),
    nextCursor: hasMore ? Buffer.from(`${last.cursor_ts}|${last.id}`).toString('base64url') : null,
  };
}

export async function remove(userId, id) {
  const { rowCount } = await query('DELETE FROM search_history WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount > 0;
}

export async function clear(userId) {
  await query('DELETE FROM search_history WHERE user_id = $1', [userId]);
}

export async function stats(userId) {
  const { rows } = await query(
    `SELECT
       (SELECT count(*) FROM search_history WHERE user_id = $1)::int AS total_reads,
       (SELECT count(*) FROM search_history WHERE user_id = $1 AND created_at > now() - interval '30 days')::int AS reads_30d,
       (SELECT count(DISTINCT s.repository_id) FROM search_history h JOIN summaries s ON s.id = h.summary_id WHERE h.user_id = $1)::int AS repositories,
       (SELECT count(*) FROM saved_summaries WHERE user_id = $1)::int AS saved`,
    [userId],
  );
  const langs = await query(
    `SELECT r.language, count(*)::int AS reads
       FROM search_history h
       JOIN summaries s ON s.id = h.summary_id
       JOIN repositories r ON r.id = s.repository_id
      WHERE h.user_id = $1 AND r.language IS NOT NULL
      GROUP BY r.language ORDER BY reads DESC LIMIT 5`,
    [userId],
  );
  const r = rows[0] || {};
  return {
    totalReads: r.total_reads ?? 0,
    reads30d: r.reads_30d ?? 0,
    repositories: r.repositories ?? 0,
    saved: r.saved ?? 0,
    topLanguage: langs.rows[0]?.language ?? null,
    topLanguages: langs.rows.map((l) => ({ language: l.language, reads: l.reads })),
  };
}

