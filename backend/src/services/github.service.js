import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { TTLCache } from '../utils/ttlCache.js';

const BASE = 'https://api.github.com';
const cache = new TTLCache({ ttlMs: 5 * 60_000, max: 300 });

async function readRawBounded(res, maxBytes) {
  const size = Number(res.headers.get('content-length'));
  if (size > maxBytes) {
    await res.body?.cancel();
    return null;
  }
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total).toString('utf8');
}

async function gh(
  path,
  { accept = 'application/vnd.github+json', raw = false, maxBytes = null, allow404 = false, allow409 = false, notFound = null } = {},
) {
  const key = `${accept}|${maxBytes ?? 'unlimited'}|${path}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const headers = {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'GitSummarizer/1.0',
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers, signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new AppError(502, 'GITHUB_UNAVAILABLE', 'GitHub did not respond. Try again in a moment.');
  }

  if (res.ok) {
    let value;
    try {
      value = raw ? (maxBytes == null ? await res.text() : await readRawBounded(res, maxBytes)) : await res.json();
    } catch {
      throw new AppError(502, 'GITHUB_UNAVAILABLE', 'GitHub did not respond. Try again in a moment.');
    }
    if (value === null) return null;
    cache.set(key, value);
    return value;
  }

  const remaining = res.headers.get('x-ratelimit-remaining');
  const reset = res.headers.get('x-ratelimit-reset');
  if ((res.status === 403 || res.status === 429) && (remaining === '0' || res.headers.has('retry-after'))) {
    const retryAt = reset ? new Date(Number(reset) * 1000).toISOString() : null;
    throw new AppError(429, 'GITHUB_RATE_LIMITED', 'GitHub is limiting requests right now. Try again shortly.', { retryAt });
  }
  if (res.status === 404) {
    if (allow404) return null;
    throw new AppError(
      404,
      notFound?.code ?? 'REPO_NOT_FOUND',
      notFound?.message ?? 'We could not find that repository. It may be private, renamed, or misspelled.',
    );
  }
  if (res.status === 409 && allow409) return null;
  if (res.status === 451) {
    throw new AppError(451, 'REPO_UNAVAILABLE', 'GitHub has blocked access to this repository.');
  }
  throw new AppError(502, 'GITHUB_UNAVAILABLE', `GitHub returned an unexpected response (${res.status}).`);
}

const mapRepo = (r) => ({
  owner: r.owner.login,
  name: r.name,
  fullName: r.full_name,
  description: r.description,
  htmlUrl: r.html_url,
  avatarUrl: r.owner.avatar_url,
  stars: r.stargazers_count,
  forks: r.forks_count,
  language: r.language,
  topics: r.topics ?? [],
  defaultBranch: r.default_branch,
  license: r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : null,
  pushedAt: r.pushed_at,
  archived: r.archived,
});

const mapCommit = (c) => ({
  sha: c.sha,
  shortSha: c.sha.slice(0, 7),
  message: c.commit.message,
  author: c.commit.author?.name ?? c.author?.login ?? 'unknown',
  date: c.commit.author?.date ?? null,
  url: c.html_url,
  parents: c.parents?.length ?? 0,
});

const mapFile = (f) => ({
  filename: f.filename,
  status: f.status,
  additions: f.additions,
  deletions: f.deletions,
  patch: f.patch ?? null,
});

export async function getRepository(owner, repo) {
  const r = await gh(`/repos/${owner}/${repo}`);
  if (r.private) throw new AppError(403, 'REPO_PRIVATE', 'Private repositories are not supported.');
  return mapRepo(r);
}

export const getReadme = (owner, repo, ref) =>
  gh(`/repos/${owner}/${repo}/readme${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`, {
    accept: 'application/vnd.github.raw+json',
    raw: true,
    allow404: true,
  });

export async function getRootEntries(owner, repo, ref) {
  const list = await gh(`/repos/${owner}/${repo}/contents${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`, { allow404: true });
  return Array.isArray(list) ? list.map((e) => ({ name: e.name, type: e.type })) : [];
}

// GitHub may return a partial tree for very large repositories.
export async function getRepositoryTree(owner, repo, ref) {
  const data = await gh(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`, {
    allow404: true,
    allow409: true,
  });
  if (!data || !Array.isArray(data.tree)) return { entries: [], truncated: true };
  return {
    entries: data.tree.map((entry) => ({ path: entry.path, type: entry.type, mode: entry.mode, size: entry.size })),
    truncated: Boolean(data.truncated),
  };
}

const SCAN_SKIP = /(^|\/)(node_modules|vendor|dist|build|coverage|\.git|__tests__|test|tests)\/|(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.env(?:\..*)?)$|\.min\.(?:js|css)$|\.map$/i;
const MANIFEST = /(?:^|\/)(?:package\.json|pyproject\.toml|requirements\.txt|go\.mod|Cargo\.toml|pom\.xml|build\.gradle(?:\.kts)?|Gemfile|composer\.json|pubspec\.yaml)$/i;
const ENTRYPOINT = /(?:^|\/)(?:index|main|app|server|routes|router)\.(?:js|jsx|ts|tsx|py|go|rs|java|php|rb|cs|kt|swift|dart|vue|svelte)$/i;
const SOURCE = /\.(?:js|jsx|ts|tsx|py|go|rs|java|php|rb|cs|kt|swift|dart|vue|svelte|c|cc|cpp|h|hpp)$/i;
const scanPriority = (path) => MANIFEST.test(path) ? 0 : ENTRYPOINT.test(path) ? 1 : 2;

export async function getOverviewFiles(owner, repo, ref, entries) {
  const candidates = entries
    .filter((e) => e.type === 'blob' && e.mode !== '120000' && typeof e.path === 'string' && !SCAN_SKIP.test(e.path) &&
      typeof e.size === 'number' && e.size >= 0 && e.size <= 60_000 && (MANIFEST.test(e.path) || SOURCE.test(e.path)))
    .sort((a, b) => scanPriority(a.path) - scanPriority(b.path) ||
      (MANIFEST.test(a.path) && MANIFEST.test(b.path) ? a.path.split('/').length - b.path.split('/').length : 0) ||
      a.path.localeCompare(b.path));
  const selected = candidates.filter((e) => MANIFEST.test(e.path)).slice(0, 3);
  selected.push(...candidates.filter((e) => !MANIFEST.test(e.path)).slice(0, 6 - selected.length));
  if (selected.length < 6) {
    selected.push(...candidates.filter((e) => !selected.includes(e)).slice(0, 6 - selected.length));
  }
  const files = await Promise.all(selected.map(async ({ path }) => {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const content = await gh(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`, {
      accept: 'application/vnd.github.raw+json', raw: true, maxBytes: 60_000, allow404: true,
    });
    return content == null ? null : { path, content };
  }));
  return files.filter(Boolean);
}

export async function getLanguages(owner, repo) {
  const data = (await gh(`/repos/${owner}/${repo}/languages`, { allow404: true })) ?? {};
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 100) }));
}

export async function listCommits(owner, repo, { ref, limit = 30 } = {}) {
  const params = new URLSearchParams({ per_page: String(Math.min(limit, 100)) });
  if (ref) params.set('sha', ref);
  const list = await gh(`/repos/${owner}/${repo}/commits?${params}`, {
    allow409: true,
    notFound: { code: 'REF_NOT_FOUND', message: 'We could not find that branch in this repository.' },
  });
  return (list ?? []).map(mapCommit);
}

export async function getCommit(owner, repo, sha) {
  const c = await gh(`/repos/${owner}/${repo}/commits/${encodeURIComponent(sha)}`, {
    notFound: { code: 'COMMIT_NOT_FOUND', message: 'We could not find that commit in this repository.' },
  });
  return { ...mapCommit(c), stats: c.stats ?? null, files: (c.files ?? []).map(mapFile) };
}

export async function compareRefs(owner, repo, base, head) {
  const spec = `${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
  const c = await gh(`/repos/${owner}/${repo}/compare/${spec}?per_page=100`, {
    notFound: { code: 'COMPARE_NOT_FOUND', message: 'We could not compare those two references. Check that both exist.' },
  });
  const commits = (c.commits ?? []).map(mapCommit);
  return {
    totalCommits: c.total_commits,
    aheadBy: c.ahead_by,
    commits,
    files: (c.files ?? []).map(mapFile),
    headSha: commits.at(-1)?.sha ?? c.base_commit?.sha ?? 'none',
  };
}

