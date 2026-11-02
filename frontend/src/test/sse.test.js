import { describe, expect, it } from 'vitest';
import { drainFrames } from '../lib/sse.ts';

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

  it('parses CRLF frames and multiline data across chunks', () => {
    const first = drainFrames('event: delta\r\ndata: {"text":\r\n');
    const second = drainFrames(`${first.rest}data: "Hello"}\r\n\r\n`);
    expect(second.frames).toEqual([{ event: 'delta', data: { text: 'Hello' } }]);
    expect(second.rest).toBe('');
  });

  it('reports invalid stream data clearly', () => {
    expect(() => drainFrames('event: delta\ndata: not-json\n\n')).toThrow('The server sent an invalid response.');
  });

  it('ignores heartbeat comments', () => {
    expect(drainFrames(': ping\n\n').frames).toEqual([]);
  });
});
