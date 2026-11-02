import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { parseGitHubInput, InvalidGitHubUrlError } from '../utils/urlParser.js';
import { toPublicRepo, toPublicSummary } from '../utils/mappers.js';
import * as github from './github.service.js';
import * as repos from '../repositories/repos.repo.js';
import * as summaries from '../repositories/summaries.repo.js';
import * as history from '../repositories/history.repo.js';
import { generate } from './ai/index.js';
import { buildOverviewContext, buildReleaseContext, buildCommitContext } from './ai/context.js';
import { buildPrompt } from './ai/prompts.js';

const extractTitle = (md) => md.match(/^#\s+(.+)$/m)?.[1]?.trim().slice(0, 200) ?? null;

export async function runSummary({ input, kind, audience, options, userId, emit, signal }) {
  const startedAt = Date.now();

  emit('stage', { key: 'parse', label: 'Reading the link' });
  let parsed;
  try {
    parsed = parseGitHubInput(input);
  } catch (err) {
    if (err instanceof InvalidGitHubUrlError) throw new AppError(400, 'INVALID_URL', err.message);
    throw err;
  }

  const effectiveKind =
    parsed.type === 'commit' ? 'commit' : parsed.type === 'compare' ? 'release_notes' : kind;
  const sha = parsed.sha ?? options.sha;
  if (effectiveKind === 'commit' && !sha) {
    throw new AppError(400, 'COMMIT_REQUIRED', 'Paste a link to a specific commit, or switch to Overview or Release notes.');
  }

  emit('stage', { key: 'github', label: 'Fetching repository details' });
  const repo = await github.getRepository(parsed.owner, parsed.repo);
  const repoRow = await repos.upsert(repo);
  emit('meta', { kind: effectiveKind, repository: toPublicRepo(repoRow) });

  const branch = parsed.ref ?? repo.defaultBranch;
  const limit = options.limit;
  const promptVersion = effectiveKind === 'overview' ? `${env.PROMPT_VERSION}:scan2` : env.PROMPT_VERSION;

  // Work out the cache reference without spending extra GitHub calls where possible.
  let commitData = null;
  let ref;
  if (effectiveKind === 'commit') {
    commitData = await github.getCommit(repo.owner, repo.name, sha);
    ref = commitData.sha;
  } else if (parsed.type === 'compare') {
    ref = `${parsed.base}...${parsed.head}`;
  } else if (effectiveKind === 'release_notes') {
    ref = `last:${limit}@${branch}`;
  } else {
    ref = branch;
  }

  if (!options.refresh) {
    const hit = await summaries.findFresh({
      repositoryId: repoRow.id,
      kind: effectiveKind,
      audience,
      ref,
      immutable: effectiveKind === 'commit',
      promptVersion,
    });
    if (hit) {
      emit('stage', { key: 'cache', label: 'Found a recent summary' });
      emit('delta', { text: hit.content_md });
      if (userId) await history.add(userId, hit.id, input);
      emit('done', { cached: true, summary: toPublicSummary(hit, repoRow) });
      return;
    }
  }

  emit('stage', { key: 'context', label: 'Reading the material' });
  let context;
  let headSha;

  if (effectiveKind === 'commit') {
    context = buildCommitContext({ repo, commit: commitData });
    headSha = commitData.sha;
  } else if (effectiveKind === 'release_notes') {
    if (parsed.type === 'compare') {
      const cmp = await github.compareRefs(repo.owner, repo.name, parsed.base, parsed.head);
      context = buildReleaseContext({
        repo,
        label: `${parsed.base}...${parsed.head}`,
        commits: cmp.commits,
        files: cmp.files,
        totalCommits: cmp.totalCommits,
      });
      headSha = cmp.headSha;
    } else {
      const commits = await github.listCommits(repo.owner, repo.name, { ref: branch, limit });
      if (!commits.length) {
        throw new AppError(422, 'NO_COMMITS', 'This repository has no commits to summarise yet.');
      }
      context = buildReleaseContext({
        repo,
        label: `the last ${commits.length} commits on ${branch}`,
        commits,
        files: [],
        totalCommits: commits.length,
      });
      headSha = commits[0].sha;
    }
  } else {
    const [readme, rootEntries, languages, commits] = await Promise.all([
      github.getReadme(repo.owner, repo.name, parsed.ref),
      github.getRootEntries(repo.owner, repo.name, parsed.ref),
      github.getLanguages(repo.owner, repo.name),
      github.listCommits(repo.owner, repo.name, { ref: branch, limit: 10 }),
    ]);
    const scanRef = commits[0]?.sha ?? branch;
    let tree = { entries: [], truncated: true };
    let files = [];
    try {
      tree = await github.getRepositoryTree(repo.owner, repo.name, scanRef);
      files = await github.getOverviewFiles(repo.owner, repo.name, scanRef, tree.entries);
    } catch (err) {
      if (!(err instanceof AppError) || err.code !== 'GITHUB_UNAVAILABLE') throw err;
      // Preserve the overview when the optional deeper scan is unavailable.
      tree = { ...tree, truncated: true };
    }
    context = buildOverviewContext({ repo, readme, rootEntries, languages, commits, tree, files });
    headSha = commits[0]?.sha ?? 'none';
  }

  emit('stage', { key: 'ai', label: 'Writing the summary' });
  const { system, user } = buildPrompt({ kind: effectiveKind, audience, context });
  const result = await generate({
    system,
    user,
    maxTokens: env.AI_MAX_OUTPUT_TOKENS,
    signal,
    onText: (text) => emit('delta', { text }),
  });

  const content = result.text.trim();
  if (!content) throw new AppError(502, 'AI_EMPTY', 'The summary engine returned nothing. Try again.');

  emit('stage', { key: 'save', label: 'Saving' });
  const saved = await summaries.upsert({
    repositoryId: repoRow.id,
    kind: effectiveKind,
    audience,
    ref,
    headSha,
    title: extractTitle(content) ?? repoRow.full_name,
    contentMd: content,
    provider: result.provider,
    model: result.model,
    promptVersion,
    tokensIn: result.usage.input,
    tokensOut: result.usage.output,
    latencyMs: Date.now() - startedAt,
  });
  if (userId) await history.add(userId, saved.id, input);

  emit('done', { cached: false, summary: toPublicSummary(saved, repoRow) });
}

