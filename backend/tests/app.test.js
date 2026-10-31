import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost/test';
process.env.JWT_SECRET = '01234567890123456789012345678901';
process.env.GEMINI_API_KEY = 'test';
delete process.env.RESEND_API_KEY;

const { default: app } = await import('../src/app.js');
const { sendVerificationOtp } = await import('../src/services/email.service.js');
const { env } = await import('../src/config/env.js');

test('application starts and validates verification requests', async () => {
  const server = app.listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/v1`;
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    const response = await fetch(`${base}/auth/verify-email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 42, code: [] }),
    });
    assert.equal(response.status, 422);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
});

test('reports missing email configuration without exposing a code', async () => {
  await assert.rejects(sendVerificationOtp({ email: 'test@example.com', code: '123456' }),
    (err) => err.code === 'EMAIL_UNAVAILABLE' && !err.message.includes('123456'));
});

test('a testing-domain rejection fails delivery without returning the OTP', async (t) => {
  const oldKey = env.RESEND_API_KEY;
  env.RESEND_API_KEY = 're_synthetic_test';
  t.after(() => { env.RESEND_API_KEY = oldKey; });
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    name: 'validation_error', message: 'You can only send testing emails to your own email address.',
  }), { status: 403, headers: { 'content-type': 'application/json' } }));
  await assert.rejects(sendVerificationOtp({ email: 'unowned@example.com', code: '123456' }),
    (err) => err.code === 'EMAIL_UNAVAILABLE' && !err.message.includes('123456'));
});

test('email delivery uses a bounded timeout and reports timeout failure', async (t) => {
  const oldKey = env.RESEND_API_KEY;
  env.RESEND_API_KEY = 're_synthetic_test';
  t.after(() => { env.RESEND_API_KEY = oldKey; });
  t.mock.method(AbortSignal, 'timeout', (ms) => {
    assert.equal(ms, 15_000);
    return AbortSignal.abort(new DOMException('Timed out', 'TimeoutError'));
  });
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => {
    assert.ok(signal);
    signal.throwIfAborted();
  });
  await assert.rejects(sendVerificationOtp({ email: 'test@example.com', code: '123456' }),
    (err) => err.code === 'EMAIL_UNAVAILABLE');
});
