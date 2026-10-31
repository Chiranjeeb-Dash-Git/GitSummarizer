import { truncate, firstLine } from '../../utils/truncate.js';

const LIMITS = {
  readme: 18_000,
  patchPerFile: 2_500,
  patchTotal: 22_000,
  files: 30,
  commitMsg: 500,
  commits: 100,
};

const NOISE =
  /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Cargo\.lock|poetry\.lock|go\.sum|composer\.lock)$|\.min\.(js|css)$|\.map$|(^|\/)(dist|build|vendor|node_modules)\//;

const neutralise = (s) => String(s ?? '').replaceAll('</repo_data', '<\\/repo_data');
const wrap = (body) => `<repo_data>\n${neutralise(body)}\n</repo_data>`;

function repoHeader(r) {
  return [
    `name: ${r.fullName}`,
    `description: ${r.description ?? 'none'}`,
    `primary language: ${r.language ?? 'unknown'}`,
    `topics: ${r.topics?.length ? r.topics.join(', ') : 'none'}`,
    `stars: ${r.stars}`,
    `license: ${r.license ?? 'none'}`,
    `default branch: ${r.defaultBranch}`,
    `last push: ${r.pushedAt ?? 'unknown'}`,
  ].join('\n');
}

function commitLine(c) {
  const msg = truncate(c.message.trim(), LIMITS.commitMsg).replace(/\s*\n+\s*/g, ' ');
  return `- ${c.shortSha} (${c.author}) ${msg}`;
}

function renderPatches(files) {
  const useful = files.filter((f) => !NOISE.test(f.filename));
  const skipped = files.length - useful.length;
  let budget = LIMITS.patchTotal;
  const blocks = [];

  for (const f of useful.slice(0, LIMITS.files)) {
    const head = `### ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`;
    let patch;
    if (!f.patch) patch = '(no text diff available)';
    else if (budget <= 0) patch = '(omitted: size budget reached)';
    else patch = truncate(f.patch, Math.min(LIMITS.patchPerFile, budget));
    budget -= patch.length;
    blocks.push(`${head}\n${patch}`);
  }

  const notes = [];
  if (useful.length > LIMITS.files) notes.push(`${useful.length - LIMITS.files} more changed files not shown.`);
  if (skipped > 0) notes.push(`${skipped} generated or lock files skipped.`);
  return [...blocks, ...notes].join('\n\n');
}

export function buildOverviewContext({ repo, readme, rootEntries, languages, commits, tree = { entries: [], truncated: false }, files = [] }) {
  const entries = tree.entries.filter((e) => typeof e.path === 'string' && !NOISE.test(e.path));
  const paths = entries.slice(0, 200).map((e) => `- ${e.path}${e.type === 'tree' ? '/' : ''}`).join('\n');
  return wrap(
    [
      '## Repository',
      repoHeader(repo),
      '',
      '## Languages (share of code)',
      languages.map((l) => `${l.name} ${l.pct}%`).join(', ') || 'unknown',
      '',
      '## Top-level files and folders',
      rootEntries.slice(0, 80).map((e) => `${e.type === 'dir' ? '[dir] ' : '[file]'} ${e.name}`).join('\n') || 'none',
      '',
      '## Repository structure (sample)',
      paths || 'No recursive file listing was available.',
      tree.truncated || entries.length > 200 ? 'The file listing is incomplete.' : '',
      '',
      '## Selected source and configuration files (sample)',
      files.length ? files.map((f) => `### ${f.path}\n${truncate(f.content, 3000)}`).join('\n\n') : 'No selected source files were available.',
      'Only selected files are included; the complete source code was not inspected.',
      '',
      '## README',
      readme ? truncate(readme, LIMITS.readme) : 'This repository has no README.',
      '',
      '## Latest commits',
      commits.slice(0, 10).map((c) => `- ${c.shortSha} ${firstLine(c.message)}`).join('\n') || 'none',
    ].join('\n'),
  );
}

export function buildReleaseContext({ repo, label, commits, files, totalCommits }) {
  const meaningful = commits.filter((c) => c.parents <= 1).slice(0, LIMITS.commits);
  const partial = totalCommits > commits.length
    ? `Note: only ${commits.length} of ${totalCommits} commits are shown.`
    : '';
  const fileList = files
    .filter((f) => !NOISE.test(f.filename))
    .slice(0, 60)
    .map((f) => `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`)
    .join('\n');

  return wrap(
    [
      '## Repository',
      repoHeader(repo),
      '',
      `## Range: ${label}`,
      partial,
      '',
      '## Commits (oldest or newest first, merge commits removed)',
      meaningful.map(commitLine).join('\n') || 'none',
      fileList ? `\n## Changed files\n${fileList}` : '',
    ].join('\n'),
  );
}

export function buildCommitContext({ repo, commit }) {
  const stats = commit.stats
    ? `${commit.stats.additions} additions, ${commit.stats.deletions} deletions, ${commit.files.length} files`
    : `${commit.files.length} files`;
  return wrap(
    [
      '## Repository',
      repoHeader(repo),
      '',
      '## Commit',
      `sha: ${commit.sha}`,
      `author: ${commit.author}`,
      `date: ${commit.date ?? 'unknown'}`,
      `size: ${stats}`,
      '',
      '### Message',
      truncate(commit.message.trim(), 2_000),
      '',
      '## Changes',
      renderPatches(commit.files) || 'No file changes were returned.',
    ].join('\n'),
  );
}

