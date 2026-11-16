export function openSSE(req, res) {
  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const controller = new AbortController();

  const abort = () => controller.abort();
  const cleanup = () => {
    clearInterval(heartbeat);
    req.off('aborted', abort);
    res.off('close', abort);
  };

  const send = (event, data) => {
    if (!controller.signal.aborted && !res.writableEnded && !res.destroyed) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };
  const heartbeat = setInterval(() => {
    if (!controller.signal.aborted && !res.writableEnded && !res.destroyed) res.write(': ping\n\n');
  }, 15_000);

  req.once('aborted', abort);
  res.once('close', abort);

  const close = () => {
    cleanup();
    if (!res.writableEnded) res.end();
  };

  return { send, close, signal: controller.signal };
}

