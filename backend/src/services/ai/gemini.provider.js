import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

let genAI;

// Resilient model fallback candidate list if primary model hits deprecation/demand spikes
const CANDIDATE_MODELS = [
  env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
].filter(Boolean);

export async function streamGemini({ system, user, maxTokens, signal, onText }) {
  genAI ??= new GoogleGenerativeAI(env.GEMINI_API_KEY);

  let lastError;
  for (const modelName of CANDIDATE_MODELS) {
    signal?.throwIfAborted();
    let text = '';
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,
        },
      });

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: user }] }],
      }, { signal });
      // The SDK aggregates a second stream into this promise, which can reject independently.
      void result.response.catch(() => undefined);

      for await (const chunk of result.stream) {
        signal?.throwIfAborted();
        const chunkText = chunk.text();
        if (chunkText) {
          text += chunkText;
          onText(chunkText);
        }
      }

      if (text.trim().length < 200) {
        throw new Error(`Incomplete output from ${modelName} (${text.length} chars)`);
      }

      const response = await result.response;
      const usage = response.usageMetadata;

      return {
        text,
        provider: 'gemini',
        model: modelName,
        usage: {
          input: usage?.promptTokenCount ?? null,
          output: usage?.candidatesTokenCount ?? null,
        },
      };
    } catch (err) {
      if (signal?.aborted || text) throw err;
      lastError = err;
      console.warn(`[Gemini] model ${modelName} attempt failed or incomplete: ${err.message}. Trying fallback...`);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}
