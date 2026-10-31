export const KINDS = [
  { value: 'overview', label: 'Overview', hint: 'What the project does and where to start' },
  { value: 'release_notes', label: 'Release notes', hint: 'Recent commits grouped by what changed' },
  { value: 'commit', label: 'One commit', hint: 'A single change explained' },
];

export const AUDIENCES = [
  { value: 'learner', label: 'Learners', hint: 'Plain terms, jargon explained' },
  { value: 'product', label: 'Product teams', hint: 'Outcomes and user impact' },
  { value: 'maintainer', label: 'Maintainers', hint: 'Concise and technical' },
];

export const STAGES = [
  { key: 'parse', label: 'Reading the link' },
  { key: 'github', label: 'Fetching repository details' },
  { key: 'context', label: 'Reading the material' },
  { key: 'ai', label: 'Writing the summary' },
  { key: 'save', label: 'Saving' },
];

export const SAMPLES = [
  { input: 'expressjs/express', kind: 'overview', note: 'A small, widely used web framework' },
  { input: 'vitejs/vite', kind: 'release_notes', note: 'Recent changes to a fast build tool' },
  { input: 'tailwindlabs/tailwindcss', kind: 'overview', note: 'The utility-first CSS framework' },
  { input: 'facebook/react', kind: 'release_notes', note: 'What the React team shipped lately' },
];

export const TRANSLATION_ROWS = [
  { sha: 'a3f9c21', raw: 'fix: npe in auth mw when sess undefined (#482)', plain: 'Fixed a crash that signed some people out when their session had expired.' },
  { sha: 'b71e0d4', raw: 'perf(db): add idx on (user_id, created_at)', plain: 'Dashboards load noticeably faster for accounts with a long history.' },
  { sha: 'c08d5aa', raw: 'refactor: extract retry policy to lib/net', plain: 'Behind the scenes: network retries now live in one place. Nothing changes for users.' },
  { sha: 'd44c9be', raw: 'feat!: drop node 16 support', plain: 'Breaking: Node 16 no longer works. Upgrade to Node 18 or later.' },
  { sha: 'e92b7f0', raw: 'chore(deps): bump undici 5.28.2 to 5.28.4', plain: 'Security update to an internal networking dependency.' },
];

export const ERROR_HELP = {
  INVALID_URL: 'Use a link like github.com/owner/repo, or just owner/repo.',
  REPO_NOT_FOUND: 'Check the spelling. Private repositories cannot be read.',
  COMMIT_REQUIRED: 'Paste a commit link, or enter a repository and commit hash.',
  GITHUB_RATE_LIMITED: 'GitHub is limiting requests. Wait a minute and try again.',
  AI_UNAVAILABLE: 'The writing engine is not responding. Try again in a moment.',
  AI_RATE_LIMITED: 'The writing engine is busy. Try again in a minute.',
};

