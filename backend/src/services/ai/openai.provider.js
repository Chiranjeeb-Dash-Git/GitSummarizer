import OpenAI from 'openai';
import { env } from '../../config/env.js';

let client;

export async function streamOpenAI({ system, user, maxTokens, signal, onText }) {
  client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const stream = await client.chat.completions.create(
    {
      model: env.OPENAI_MODEL,
      stream: true,
      stream_options: { include_usage: true },
      max_completion_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    },
    { signal },
  );

  let text = '';
  let usage = null;
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) {
      text += delta;
      onText(delta);
    }
    if (chunk.usage) usage = chunk.usage;
  }

  return {
    text,
    provider: 'openai',
    model: env.OPENAI_MODEL,
    usage: { input: usage?.prompt_tokens ?? null, output: usage?.completion_tokens ?? null },
  };
}

