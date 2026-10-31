import test from 'node:test';
import assert from 'node:assert/strict';
import { GoogleGenerativeAI } from '@google/generative-ai';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost/test';
process.env.JWT_SECRET = '01234567890123456789012345678901';
process.env.GEMINI_API_KEY = 'test';
process.env.OPENAI_API_KEY = 'test';
const { streamGemini } = await import('../src/services/ai/gemini.provider.js');
const { streamOpenAI } = await import('../src/services/ai/openai.provider.js');

test('Gemini never retries after emitting partial text', async (t) => {
  let attempts = 0;
  t.mock.method(GoogleGenerativeAI.prototype, 'getGenerativeModel', () => ({
    generateContentStream: async () => {
      attempts++;
      return {
        stream: (async function* () { yield { text: () => 'partial' }; throw new Error('disconnected'); })(),
        response: Promise.reject(new Error('response aggregation disconnected')),
      };
    },
  }));
  const chunks = [];
  await assert.rejects(streamGemini({ system: 's', user: 'u', onText: (s) => chunks.push(s) }), /disconnected/);
  assert.equal(attempts, 1);
  assert.deepEqual(chunks, ['partial']);
});

test('Gemini cancellation reaches the SDK request', async (t) => {
  const controller = new AbortController();
  t.mock.method(GoogleGenerativeAI.prototype, 'getGenerativeModel', () => ({
    generateContentStream: async (_body, { signal }) => {
      assert.equal(signal, controller.signal);
      controller.abort();
      signal.throwIfAborted();
    },
  }));
  await assert.rejects(streamGemini({ system: 's', user: 'u', signal: controller.signal, onText: () => {} }), { name: 'AbortError' });
});

test('upgraded OpenAI SDK preserves streaming content and usage', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.stream, true);
    assert.equal(body.max_completion_tokens, 100);
    return new Response('data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":3,"completion_tokens":2}}\n\ndata: [DONE]\n\n', {
      headers: { 'content-type': 'text/event-stream' },
    });
  });
  const chunks = [];
  const result = await streamOpenAI({ system: 's', user: 'u', maxTokens: 100, onText: (s) => chunks.push(s) });
  assert.equal(result.text, 'hello');
  assert.deepEqual(chunks, ['hello']);
  assert.deepEqual(result.usage, { input: 3, output: 2 });
});
