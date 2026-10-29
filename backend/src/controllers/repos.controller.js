import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { parseGitHubInput, InvalidGitHubUrlError } from '../utils/urlParser.js';
import * as github from '../services/github.service.js';

export const preview = asyncHandler(async (req, res) => {
  let parsed;
  try {
    parsed = parseGitHubInput(req.validatedQuery.input);
  } catch (err) {
    if (err instanceof InvalidGitHubUrlError) throw new AppError(400, 'INVALID_URL', err.message);
    throw err;
  }
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

