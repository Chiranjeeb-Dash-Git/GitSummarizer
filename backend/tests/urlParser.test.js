import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubInput, InvalidGitHubUrlError } from '../src/utils/urlParser.js';

test('parses full repository URL', () => {
  assert.deepEqual(parseGitHubInput('https://github.com/vitejs/vite'), { type: 'repo', owner: 'vitejs', repo: 'vite' });
});

test('parses shorthand, trailing slash and .git suffix', () => {
  assert.equal(parseGitHubInput('vitejs/vite').repo, 'vite');
  assert.equal(parseGitHubInput('github.com/vitejs/vite/').repo, 'vite');
  assert.equal(parseGitHubInput('https://github.com/vitejs/vite.git').repo, 'vite');
});

test('parses ssh remotes', () => {
  assert.equal(parseGitHubInput('git@github.com:vitejs/vite.git').owner, 'vitejs');
});

test('parses branch links', () => {
  const r = parseGitHubInput('https://github.com/vitejs/vite/tree/main/packages');
  assert.equal(r.ref, 'main');
  assert.equal(r.type, 'repo');
});

test('parses commit links and lowercases the sha', () => {
  const r = parseGitHubInput('https://github.com/vitejs/vite/commit/A3F9C21');
  assert.equal(r.type, 'commit');
  assert.equal(r.sha, 'a3f9c21');
});

test('parses compare links', () => {
  const r = parseGitHubInput('https://github.com/vitejs/vite/compare/v5.0.0...v5.1.0');
  assert.deepEqual([r.type, r.base, r.head], ['compare', 'v5.0.0', 'v5.1.0']);
});

test('keeps dots inside repository names', () => {
  assert.equal(parseGitHubInput('vercel/next.js').repo, 'next.js');
});

test('rejects other hosts, missing repo and bad characters', () => {
  assert.throws(() => parseGitHubInput('https://gitlab.com/a/b'), InvalidGitHubUrlError);
  assert.throws(() => parseGitHubInput('https://github.com/vitejs'), InvalidGitHubUrlError);
  assert.throws(() => parseGitHubInput('https://github.com/-bad-/repo'), InvalidGitHubUrlError);
  assert.throws(() => parseGitHubInput('   '), InvalidGitHubUrlError);
  assert.throws(() => parseGitHubInput('a/b/commit/not-a-sha'), InvalidGitHubUrlError);
});

