export function openSSE(_req, res) {
  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const controller = new AbortController();

  const send = (event, data) => {
    if (!res.writableEnded && !res.destroyed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) res.write(': ping\n\n');
  }, 15_000);

  res.on('close', () => {
    clearInterval(heartbeat);
    if (!res.writableEnded) controller.abort();
  });

  const close = () => {
    clearInterval(heartbeat);
    if (!res.writableEnded) res.end();
  };

  return { send, close, signal: controller.signal };
}

