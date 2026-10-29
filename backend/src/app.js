import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestId } from './middleware/requestId.js';
import { originGuard } from './middleware/originGuard.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(requestId);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    autoLogging: { ignore: (req) => req.url.startsWith('/api/v1/health') },
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https://avatars.githubusercontent.com'],
        'upgrade-insecure-requests': env.isProd ? [] : null,
      },
    },
  }),
);
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(
  compression({
    filter: (req, res) =>
      String(res.getHeader('Content-Type') ?? '').includes('text/event-stream')
        ? false
        : compression.filter(req, res),
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.use('/api/v1', originGuard, routes);

if (env.serveClient) {
  const dist = path.resolve(__dirname, '../../frontend/dist');
  app.use(
    express.static(dist, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

export default app;

