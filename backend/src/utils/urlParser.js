const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_RE = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;
const SHA_RE = /^[0-9a-f]{7,40}$/i;
const REF_RE = /^[A-Za-z0-9._\-/]{1,200}$/;

export class InvalidGitHubUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidGitHubUrlError';
  }
}

function finish(result) {
  if (!OWNER_RE.test(result.owner)) throw new InvalidGitHubUrlError('That owner name does not look right.');
  if (!REPO_RE.test(result.repo)) throw new InvalidGitHubUrlError('That repository name does not look right.');
  return result;
}

export function parseGitHubInput(raw) {
  if (typeof raw !== 'string') throw new InvalidGitHubUrlError('Enter a GitHub link.');
  let s = raw.trim();
  if (!s) throw new InvalidGitHubUrlError('Enter a GitHub link.');
  if (s.length > 300) throw new InvalidGitHubUrlError('That link is too long.');

  const ssh = s.match(/^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i);
  if (ssh) return finish({ type: 'repo', owner: ssh[1], repo: ssh[2] });

  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

  if (/^github\.com(\/|$)/i.test(s)) {
    s = s.slice('github.com'.length).replace(/^\//, '');
  } else if (/^[^/]+\.[^/]+\//.test(s) || /^[^/]+\.[a-z]{2,}$/i.test(s)) {
    throw new InvalidGitHubUrlError('Only github.com links are supported.');
  }

  s = s.split(/[?#]/)[0].replace(/\/+$/, '');
  const parts = s.split('/').filter(Boolean);
  if (parts.length < 2) throw new InvalidGitHubUrlError('The link needs an owner and a repository, like vitejs/vite.');

  const [owner, repoRaw, section, ...rest] = parts;
  const repo = repoRaw.replace(/\.git$/i, '');
  const base = { owner, repo };

  if (section === 'commit' && rest[0]) {
    if (!SHA_RE.test(rest[0])) throw new InvalidGitHubUrlError('That commit hash does not look right.');
    return finish({ ...base, type: 'commit', sha: rest[0].toLowerCase() });
  }

  if (section === 'compare' && rest.length) {
    const spec = decodeURIComponent(rest.join('/'));
    const [a, b] = spec.split(/\.{2,3}/);
    if (!a || !b || !REF_RE.test(a) || !REF_RE.test(b)) {
      throw new InvalidGitHubUrlError('The compare link should look like base...head.');
    }
    return finish({ ...base, type: 'compare', base: a, head: b });
  }

  if ((section === 'tree' || section === 'commits') && rest[0]) {
    const ref = decodeURIComponent(rest[0]);
    if (REF_RE.test(ref)) return finish({ ...base, type: 'repo', ref });
  }

  return finish({ ...base, type: 'repo' });
}

