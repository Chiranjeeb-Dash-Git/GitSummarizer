import { query } from '../db/pool.js';
import { env } from '../config/env.js';
import * as repos from './repos.repo.js';

export async function findFresh({ repositoryId, kind, audience, ref, immutable }) {
  const { rows } = await query(
    `SELECT * FROM summaries
      WHERE repository_id = $1 AND kind = $2 AND audience = $3 AND ref = $4 AND prompt_version = $5
        AND ($6::boolean OR created_at > now() - make_interval(hours => $7::int))
      ORDER BY created_at DESC
      LIMIT 1`,
    [repositoryId, kind, audience, ref, env.PROMPT_VERSION, immutable, env.SUMMARY_TTL_HOURS],
  );
  return rows[0] ?? null;
}

export async function upsert(s) {
  const { rows } = await query(
    `INSERT INTO summaries
       (repository_id, kind, audience, ref, head_sha, title, content_md, provider, model, prompt_version, tokens_in, tokens_out, latency_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT ON CONSTRAINT summaries_cache_key DO UPDATE SET
       title = EXCLUDED.title, content_md = EXCLUDED.content_md, provider = EXCLUDED.provider,
       model = EXCLUDED.model, tokens_in = EXCLUDED.tokens_in, tokens_out = EXCLUDED.tokens_out,
       latency_ms = EXCLUDED.latency_ms, created_at = now()
     RETURNING *`,
    [
      s.repositoryId, s.kind, s.audience, s.ref, s.headSha, s.title, s.contentMd, s.provider,
      s.model, s.promptVersion, s.tokensIn, s.tokensOut, s.latencyMs,
    ],
  );
  return rows[0];
}

export async function getByIdWithRepo(id) {
  const { rows } = await query('SELECT * FROM summaries WHERE id = $1', [id]);
  const summary = rows[0];
  if (!summary) return null;
  const repository = await repos.getById(summary.repository_id);
  return { summary, repository };
}

