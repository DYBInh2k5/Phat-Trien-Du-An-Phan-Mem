import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { createErrorHandler } from './common/middleware/error-handler.js';
import { notFoundHandler } from './common/middleware/not-found.js';
import { requestId } from './common/middleware/request-id.js';
import { buildContainer } from './container.js';

export const API_PREFIX = '/api/v1';

/** Tạo express app (KHÔNG listen) để dễ test. */
export function createApp({ config, pool, logger }) {
  const app = express();
  const container = buildContainer({ config, pool, logger });

  app.disable('x-powered-by');
  app.set('trust proxy', config.nodeEnv === 'production' ? 1 : false);

  // Thứ tự: requestId -> log -> bảo mật -> body -> routes -> notFound -> errorHandler
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      quietReqLogger: true,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) {
          return 'error';
        }
        return res.statusCode >= 400 ? 'warn' : 'info';
      },
      serializers: { req: (req) => ({ id: req.id, method: req.method, url: req.url }) },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins.length > 0 ? config.corsOrigins : false }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ success: true, data: { status: 'ok' } });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Database không sẵn sàng' },
      });
    }
  });

  const routes = [{ method: 'GET', path: '/health' }];
  for (const { path, router } of container.routers) {
    const base = `${API_PREFIX}${path === '/' ? '' : path}`;
    app.use(base, router);
    for (const layer of router.stack.filter((item) => item.route)) {
      for (const method of Object.keys(layer.route.methods)) {
        const sub = layer.route.path === '/' ? '' : layer.route.path;
        routes.push({ method: method.toUpperCase(), path: `${base}${sub}` });
      }
    }
  }
  app.locals.routes = routes; // server.js in ra lúc khởi động (kiểu "Mapped {...} route" của Nest)

  app.use(notFoundHandler);
  app.use(createErrorHandler({ logger, isProduction: config.nodeEnv === 'production' }));
  return app;
}
