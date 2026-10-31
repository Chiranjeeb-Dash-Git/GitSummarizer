import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';

test('registration, code consumption, login, and library persist correctly', { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = '01234567890123456789012345678901';
  process.env.GEMINI_API_KEY = 'test';
  process.env.LOG_LEVEL = 'silent';
  assert.ok(process.env.RESEND_BASE_URL, 'A local Resend emulator must be configured');
  assert.ok(process.env.RESEND_API_KEY, 'A synthetic Resend emulator key must be configured');
  const db = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  // Exercise production SQL against local PostgreSQL; Neon WebSocket transport is not under test.
  const { pool } = await import('../src/db/pool.js');
  t.mock.method(pool, 'query', db.query.bind(db));
  t.mock.method(pool, 'connect', db.connect.bind(db));
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const email = `integration-${Date.now()}@example.com`;
  const password = 'integration-password';
  let repositoryId;
  const request = (path, body, cookie, method = 'POST') => fetch(`${base}${path}`, {
    method, headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  try {
    const registration = await request('/auth/register', { email, password, displayName: 'Test User' });
    assert.equal(registration.status, 200);
    const response = await registration.json();
    assert.equal(response.data.code, undefined);
    assert.equal(response.data.resendBlocked, undefined);
    const resent = await request('/auth/resend-code', { email });
    assert.equal(resent.status, 200);
    assert.equal((await resent.json()).data.code, undefined);
    const inbox = await fetch(`${process.env.RESEND_BASE_URL}/emails`, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    }).then((r) => r.json());
    const deliveries = inbox.data.filter((m) => m.to.includes(email));
    assert.equal(deliveries.length, 2);
    const pending = await db.query('SELECT code FROM email_verifications WHERE email = $1', [email]);
    const code = pending.rows[0].code;
    assert.ok(deliveries.some((m) => m.text.includes(code)));
    const attempts = await Promise.all([
      request('/auth/verify-email', { email, code }), request('/auth/verify-email', { email, code }),
    ]);
    assert.deepEqual(attempts.map((r) => r.status).sort(), [201, 400]);
    const verified = attempts.find((r) => r.status === 201);
    const user = (await verified.json()).data.user;
    assert.equal(user.email, email);
    assert.equal((await db.query('SELECT * FROM email_verifications WHERE email = $1', [email])).rowCount, 0);
    const login = await request('/auth/login', { email, password });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const repo = await db.query("INSERT INTO repositories (owner,name,full_name,html_url,avatar_url) VALUES ('test',$1,$2,'https://github.com/test/repo','') RETURNING id", [user.id, `test/${user.id}`]);
    repositoryId = repo.rows[0].id;
    const summary = await db.query("INSERT INTO summaries (repository_id,kind,audience,ref,head_sha,title,content_md,provider,model,prompt_version) VALUES ($1,'overview','learner','main','abc','Example','Example content','test','test','v1') RETURNING id", [repositoryId]);
    const summaryId = summary.rows[0].id;
    const saved = await request('/saved', { summaryId, note: 'Keep this', tags: ['test'] }, cookie);
    assert.equal(saved.status, 201);
    const savedId = (await saved.json()).data.id;
    const library = await request('/saved', undefined, cookie, 'GET').then((r) => r.json());
    assert.equal(library.data[0].summaryId, summaryId);
    assert.deepEqual(library.tags, ['test']);
    await db.query('INSERT INTO search_history (user_id,summary_id,query_input) VALUES ($1,$2,$3),($1,$2,$3)', [user.id, summaryId, 'test/repo']);
    const history = await request('/history?limit=1', undefined, cookie, 'GET').then((r) => r.json());
    assert.equal(history.data.length, 1);
    assert.ok(history.nextCursor);
    const next = await request(`/history?limit=1&cursor=${encodeURIComponent(history.nextCursor)}`, undefined, cookie, 'GET').then((r) => r.json());
    assert.equal(next.data.length, 1);
    assert.notEqual(history.data[0].id, next.data[0].id);
    assert.equal((await request(`/saved/${savedId}`, undefined, cookie, 'DELETE')).status, 204);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await db.query('DELETE FROM users WHERE email = $1', [email]);
    await db.query('DELETE FROM email_verifications WHERE email = $1', [email]);
    if (repositoryId) await db.query('DELETE FROM repositories WHERE id = $1', [repositoryId]);
    await db.end();
  }
});
