import { describe, expect, it } from 'vitest';
import { drainFrames } from '../lib/sse.js';

describe('drainFrames', () => {
  it('parses complete frames and keeps the remainder', () => {
    const buf = 'event: stage\ndata: {"key":"parse"}\n\nevent: delta\ndata: {"te';
    const { frames, rest } = drainFrames(buf);
    expect(frames).toEqual([{ event: 'stage', data: { key: 'parse' } }]);
    expect(rest).toBe('event: delta\ndata: {"te');
  });

  it('completes a frame split across chunks', () => {
    const first = drainFrames('event: delta\ndata: {"text":"Hel');
    const second = drainFrames(`${first.rest}lo"}\n\n`);
    expect(second.frames).toEqual([{ event: 'delta', data: { text: 'Hello' } }]);
  });

  it('ignores heartbeat comments', () => {
    expect(drainFrames(': ping\n\n').frames).toEqual([]);
  });
});

