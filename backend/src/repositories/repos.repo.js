import { query } from '../db/pool.js';

export async function upsert(r) {
  const { rows } = await query(
    `INSERT INTO repositories
       (owner, name, full_name, description, html_url, avatar_url, stars, forks, language, topics, default_branch, license, pushed_at, last_fetched_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())
     ON CONFLICT (full_name) DO UPDATE SET
       owner = EXCLUDED.owner, name = EXCLUDED.name, description = EXCLUDED.description,
       html_url = EXCLUDED.html_url, avatar_url = EXCLUDED.avatar_url, stars = EXCLUDED.stars,
       forks = EXCLUDED.forks, language = EXCLUDED.language, topics = EXCLUDED.topics,
       default_branch = EXCLUDED.default_branch, license = EXCLUDED.license,
       pushed_at = EXCLUDED.pushed_at, last_fetched_at = now()
     RETURNING *`,
    [
      r.owner, r.name, `${r.owner}/${r.name}`.toLowerCase(), r.description, r.htmlUrl, r.avatarUrl,
      r.stars, r.forks, r.language, r.topics, r.defaultBranch, r.license, r.pushedAt,
    ],
  );
  return rows[0];
}

export async function getById(id) {
  const { rows } = await query('SELECT * FROM repositories WHERE id = $1', [id]);
  return rows[0] ?? null;
}

