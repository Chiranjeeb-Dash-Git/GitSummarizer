import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('production email delivery requires an explicit sender', () => {
  const config = {
    NODE_ENV: 'production', DATABASE_URL: 'postgresql://localhost/test',
    JWT_SECRET: '01234567890123456789012345678901', GEMINI_API_KEY: 'test', RESEND_API_KEY: 'test',
  };
  const script = `import ${JSON.stringify(new URL('../src/config/env.js', import.meta.url).href)}`;
  const invalid = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env: config, encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /EMAIL_FROM/);
  const valid = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...config, EMAIL_FROM: 'GitSummarizer <hello@example.com>' }, encoding: 'utf8',
  });
  assert.equal(valid.status, 0, valid.stderr);
});
