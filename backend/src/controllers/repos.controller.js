import { asyncHandler } from '../utils/asyncHandler.js';
import { parseGitHubInput } from '../utils/urlParser.js';
import * as github from '../services/github.service.js';

export const preview = asyncHandler(async (req, res) => {
  const parsed = parseGitHubInput(req.validatedQuery.input);
  const repository = await github.getRepository(parsed.owner, parsed.repo);
  res.json({
    data: {
      repository,
      parsed: {
        type: parsed.type,
        sha: parsed.sha ?? null,
        base: parsed.base ?? null,
        head: parsed.head ?? null,
        ref: parsed.ref ?? null,
      },
    },
  });
});

export const details = asyncHandler(async (req, res) => {
  const parsed = parseGitHubInput(req.validatedQuery.input);
  const { owner, repo } = parsed;

  const [
    repository,
    languages,
    contributors,
    releases,
    commits,
    pullRequests,
    rootEntries,
    packageJson,
    commitActivity,
  ] = await Promise.all([
    github.getRepository(owner, repo),
    github.getLanguages(owner, repo),
    github.getContributors(owner, repo),
    github.getReleases(owner, repo),
    github.listCommits(owner, repo, { limit: 30 }),
    github.getPullRequests(owner, repo),
    github.getRootEntries(owner, repo),
    github.getPackageJson(owner, repo),
    github.getCommitActivity(owner, repo),
  ]);

  res.json({
    data: {
      repository,
      languages,
      contributors,
      releases,
      commits,
      pullRequests,
      rootEntries,
      packageJson,
      commitActivity,
    },
  });
});
