import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { openSSE } from '../src/utils/sse.js';

test('client abort stops the stream before persistence can continue', () => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  const writes = [];
  res.status = () => res;
  res.set = () => res;
  res.flushHeaders = () => {};
  res.write = (value) => writes.push(value);
  res.end = () => { res.writableEnded = true; };
  res.writableEnded = false;
  res.destroyed = false;

  const sse = openSSE(req, res);
  try {
    sse.send('stage', { key: 'ai' });
    req.emit('aborted');
    sse.send('delta', { text: 'should not be written' });

    assert.equal(sse.signal.aborted, true);
    assert.equal(writes.length, 1);
  } finally {
    sse.close();
  }
});
