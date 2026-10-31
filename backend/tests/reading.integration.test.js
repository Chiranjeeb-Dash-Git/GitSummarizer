import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

test('repository reading streams a detailed scan and reuses the saved result', { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = '01234567890123456789012345678901';
  process.env.GEMINI_API_KEY = 'synthetic';
  process.env.LOG_LEVEL = 'silent';
  const db = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const { pool } = await import('../src/db/pool.js');
  t.mock.method(pool, 'query', db.query.bind(db));
  t.mock.method(pool, 'connect', db.connect.bind(db));
  const originalFetch = globalThis.fetch;
  const firstRepoName = `reading-${Date.now()}`;
  let repoName = firstRepoName;
  let prefix = `/repos/example/${repoName}`;
  let treeRequested = false;
  let failSample = 0;
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(input);
    assert.equal(url.hostname, 'api.github.com');
    const path = url.pathname;
    let data;
    if (path === prefix) data = { owner: { login: 'example', avatar_url: '' }, name: repoName, full_name: `example/${repoName}`, html_url: `https://github.com/example/${repoName}`, default_branch: 'main', stargazers_count: 1, forks_count: 0, private: false };
    else if (path === `${prefix}/readme`) return new Response('# Sample readme');
    else if (path === `${prefix}/contents`) data = [{ name: 'src', type: 'dir' }, { name: 'package.json', type: 'file' }];
    else if (path === `${prefix}/languages`) data = { JavaScript: 100 };
    else if (path === `${prefix}/commits`) data = [{ sha: 'a'.repeat(40), commit: { message: 'Add feature', author: { name: 'test' } }, parents: [] }];
    else if (path === `${prefix}/git/trees/${'a'.repeat(40)}`) {
      treeRequested = true;
      data = { truncated: false, tree: [{ path: 'src/server.js', type: 'blob', size: 45 }, { path: 'package.json', type: 'blob', size: 30 }, { path: '.env', type: 'blob', size: 10 }] };
    } else if (path === `${prefix}/contents/src/server.js`) return failSample ? new Response(null, { status: failSample, headers: { 'x-ratelimit-remaining': '0' } }) : new Response('export const feature = "nested source";');
    else if (path === `${prefix}/contents/package.json`) return new Response('{"name":"sample"}');
    else throw new Error(`Unexpected GitHub request: ${path}`);
    return Response.json(data);
  });
  let generated = 0;
  t.mock.method(GoogleGenerativeAI.prototype, 'getGenerativeModel', () => ({
    generateContentStream: async (payload) => {
      generated++;
      const prompt = payload.contents[0].parts[0].text;
      assert.match(prompt, /src\/server\.js/);
      if (failSample) assert.match(prompt, /No selected source files were available/);
      else assert.match(prompt, /nested source/);
      assert.doesNotMatch(prompt, /### \.env/);
      const text = `# Sample repository\n\n## Key features\n${'Detailed feature. '.repeat(20)}`;
      return { stream: (async function* () { yield { text: () => text }; })(), response: Promise.resolve({ usageMetadata: {} }) };
    },
  }));
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/v1/summaries/stream`;
  const read = async (refresh = false) => {
    const response = await originalFetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ input: `example/${repoName}`, kind: 'overview', options: { refresh } }) });
    assert.equal(response.status, 200);
    return (await response.text()).split('\n\n').filter((frame) => frame.startsWith('event: ')).map((frame) => {
      const lines = frame.split('\n');
      return { event: lines[0].slice(7), data: JSON.parse(lines[1].slice(6)) };
    });
  };
  try {
    const first = await read();
    assert.ok(treeRequested);
    assert.ok(first.some((f) => f.event === 'delta' && f.data.text.includes('Detailed feature')));
    assert.equal(first.find((f) => f.event === 'done').data.cached, false);
    const second = await read();
    assert.equal(second.find((f) => f.event === 'done').data.cached, true);
    assert.equal(generated, 1);
    // Use distinct repositories so the GitHub response cache cannot mask failures.
    repoName = `${firstRepoName}-unavailable`;
    prefix = `/repos/example/${repoName}`;
    failSample = 502;
    const partial = await read();
    assert.equal(partial.find((f) => f.event === 'done').data.cached, false);
    repoName = `${firstRepoName}-limited`;
    prefix = `/repos/example/${repoName}`;
    failSample = 429;
    const limited = await read();
    assert.equal(limited.find((f) => f.event === 'error').data.code, 'GITHUB_RATE_LIMITED');
    assert.equal(generated, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await db.query('DELETE FROM repositories WHERE full_name = ANY($1::text[])', [[`example/${firstRepoName}`, `example/${firstRepoName}-unavailable`, `example/${firstRepoName}-limited`]]);
    await db.end();
  }
});
