import { API_BASE, ApiError } from './api.js';

type StreamFrame = { event: string; data: unknown };
type StreamRequest = {
  input: string;
  kind: string;
  audience: string;
  options: { limit: number; refresh?: boolean };
};
type StreamOptions = {
  signal: AbortSignal;
  onEvent: (event: string, data: unknown) => void;
};

export function drainFrames(buffer: string): { frames: StreamFrame[]; rest: string } {
  const frames: StreamFrame[] = [];
  let rest = buffer;
  let separator: RegExpExecArray | null;
  while ((separator = /\r\n\r\n|\r\n\n|\n\r\n|\n\n|\r\r/.exec(rest))) {
    const raw = rest.slice(0, separator.index);
    rest = rest.slice(separator.index + separator[0].length);
    let event = 'message';
    const data: string[] = [];
    for (const line of raw.split(/\r\n|\r|\n/)) {
      const colon = line.indexOf(':');
      const field = colon < 0 ? line : line.slice(0, colon);
      let value = colon < 0 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
    if (data.length) {
      try {
        frames.push({ event, data: JSON.parse(data.join('\n')) });
      } catch {
        throw new ApiError(0, 'INVALID_STREAM', 'The server sent an invalid response. Try again.', undefined);
      }
    }
  }
  return { frames, rest };
}

export async function streamSummary(body: StreamRequest, { signal, onEvent }: StreamOptions): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/summaries/stream`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ApiError(0, 'NETWORK', 'We could not reach the server. Check your connection and try again.', undefined);
  }

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    const error = json?.error;
    throw new ApiError(response.status, error?.code ?? 'UNKNOWN', error?.message ?? 'Something went wrong. Try again.', error?.details);
  }
  if (!response.body) {
    throw new ApiError(0, 'INVALID_STREAM', 'The server sent an empty response. Try again.', undefined);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const result = drainFrames(buffer + value);
      buffer = result.rest;
      for (const frame of result.frames) onEvent(frame.event, frame.data);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}
