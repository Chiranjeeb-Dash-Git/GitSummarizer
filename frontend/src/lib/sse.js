import { API_BASE, ApiError } from './api.js';

/** Splits a text buffer into complete SSE frames and returns the unfinished remainder. */
export function drainFrames(buffer) {
  const frames = [];
  let rest = buffer;
  let idx;
  while ((idx = rest.indexOf('\n\n')) !== -1) {
    const raw = rest.slice(0, idx);
    rest = rest.slice(idx + 2);
    let event = 'message';
    let data = '';
    for (const line of raw.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (data) frames.push({ event, data: JSON.parse(data) });
  }
  return { frames, rest };
}

export async function streamSummary(body, { signal, onEvent }) {
  let res;
  try {
    res = await fetch(`${API_BASE}/summaries/stream`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK', 'We could not reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const e = json?.error;
    throw new ApiError(res.status, e?.code ?? 'UNKNOWN', e?.message ?? 'Something went wrong. Try again.', e?.details);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const { frames, rest } = drainFrames(buffer);
    buffer = rest;
    for (const f of frames) onEvent(f.event, f.data);
  }
}

