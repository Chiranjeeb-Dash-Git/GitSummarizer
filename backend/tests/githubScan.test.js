import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost/test';
process.env.JWT_SECRET = '01234567890123456789012345678901';
process.env.GEMINI_API_KEY = 'test';
const { getOverviewFiles, getRepositoryTree } = await import('../src/services/github.service.js');

test('scan selects bounded manifests and source files without fetching secrets or generated files', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    requests.push(new URL(input));
    return new Response('sample content');
  });
  const entries = [
    { path: 'package.json', type: 'blob', size: 10 },
    ...['a', 'b', 'c', 'd'].map((name) => ({ path: `${name}/package.json`, type: 'blob', size: 10 })),
    ...['app', 'index', 'server', 'util'].map((name) => ({ path: `src/${name}.js`, type: 'blob', size: 10 })),
    { path: '.env', type: 'blob', size: 10 },
    { path: 'dist/app.js', type: 'blob', size: 10 },
    { path: 'src/huge.js', type: 'blob', size: 100000 },
    { path: 'src/link.js', type: 'blob', mode: '120000', size: 10 },
    { path: 'src/unknown.js', type: 'blob' },
  ];
  const files = await getOverviewFiles('example', 'quota-test', 'abc1234', entries);
  assert.equal(files.length, 6);
  assert.equal(files.filter((f) => f.path.endsWith('package.json')).length, 3);
  assert.ok(files.some((f) => f.path === 'package.json'));
  assert.equal(files.filter((f) => f.path.startsWith('src/')).length, 3);
  assert.ok(requests.every((url) => url.searchParams.get('ref') === 'abc1234'));
  assert.ok(files.every((f) => !['.env', 'dist/app.js', 'src/huge.js', 'src/link.js', 'src/unknown.js'].includes(f.path)));
});

test('oversized raw file responses are discarded without being cached', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests++;
    return new Response('x'.repeat(60_001));
  });
  const entries = [{ path: 'src/app.js', type: 'blob', mode: '100644', size: 10 }];
  assert.deepEqual(await getOverviewFiles('example', 'oversized-test', 'main', entries), []);
  assert.deepEqual(await getOverviewFiles('example', 'oversized-test', 'main', entries), []);
  assert.equal(requests, 2);
});

test('tree scan preserves symlink modes', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ tree: [{ path: 'src/app.js', type: 'blob', mode: '120000', size: 8 }] }));
  const tree = await getRepositoryTree('example', 'symlink-test', 'main');
  assert.equal(tree.entries[0].mode, '120000');
  assert.deepEqual(await getOverviewFiles('example', 'symlink-test', 'main', tree.entries), []);
});

test('missing trees produce an empty listing for the overview', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }));
  assert.deepEqual(await getRepositoryTree('example', 'missing-tree-test', 'main'), { entries: [], truncated: true });
});
