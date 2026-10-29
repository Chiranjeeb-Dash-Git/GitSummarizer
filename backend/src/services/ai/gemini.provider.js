import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

let genAI;

export async function streamGemini({ system, user, maxTokens, signal, onText }) {
  genAI ??= new GoogleGenerativeAI(env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: system,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  });

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: user }] }],
  });

  let text = '';
  for await (const chunk of result.stream) {
    if (signal?.aborted) throw new Error('AbortError');
    const chunkText = chunk.text();
    if (chunkText) {
      text += chunkText;
      onText(chunkText);
    }
  }

  const response = await result.response;
  const usage = response.usageMetadata;

  return {
    text,
    provider: 'gemini',
    model: env.GEMINI_MODEL,
    usage: {
      input: usage?.promptTokenCount ?? null,
      output: usage?.candidatesTokenCount ?? null,
    },
  };
}

