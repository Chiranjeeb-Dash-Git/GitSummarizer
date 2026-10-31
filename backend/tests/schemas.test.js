import test from 'node:test';
import assert from 'node:assert/strict';
import { summaryRequestSchema, savedPatchSchema, registerSchema } from '../src/validators/schemas.js';

test('summary defaults remain populated when options are absent or empty', () => {
  for (const options of [undefined, {}]) {
    assert.deepEqual(summaryRequestSchema.parse({ input: 'a/b', options }), {
      input: 'a/b', kind: 'overview', audience: 'learner', options: { limit: 30, refresh: false },
    });
  }
  assert.equal(summaryRequestSchema.safeParse({ input: 'a/b', options: { limit: 1000 } }).success, false);
});

test('validation preserves field errors, normalization and patch requirements', () => {
  const invalid = registerSchema.safeParse({ email: 'invalid', password: '', displayName: '' });
  assert.ok(invalid.error.flatten().fieldErrors.email);
  assert.equal(savedPatchSchema.safeParse({}).success, false);
  assert.deepEqual(savedPatchSchema.parse({ note: '  hello  ' }), { note: 'hello' });
});
