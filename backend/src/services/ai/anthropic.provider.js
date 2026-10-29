import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';

let client;

export async function streamAnthropic({ system, user, maxTokens, signal, onText }) {
  client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream(
    {
      model: env.ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      temperature: 0.3,
      system,
      messages: [{ role: 'user', content: user }],
    },
    { signal },
  );
  stream.on('text', (t) => onText(t));

  const final = await stream.finalMessage();
  const text = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');

  return {
    text,
    provider: 'anthropic',
    model: env.ANTHROPIC_MODEL,
    usage: { input: final.usage?.input_tokens ?? null, output: final.usage?.output_tokens ?? null },
  };
}

