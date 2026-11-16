import { createApp } from './app.js';
import { createLogger } from './common/logging/create-logger.js';
import { loadConfig } from './config/env.js';
import { createPool } from './db/pool.js';

const config = loadConfig();
const logger = await createLogger(config);
const pool = createPool(config.databaseUrl);
const app = createApp({ config, pool, logger });

const server = app.listen(config.port, () => {
  const routes = logger.child({ context: 'RoutesResolver' });
  for (const { method, path } of app.locals.routes) {
    routes.info(`Mapped {${path}, ${method}} route`);
  }
  const url = `http://localhost:${config.port}`;
  const boot = logger.child({ context: 'Bootstrap' });
  boot.info(
    { port: config.port, demoMode: config.demoMode, nodeEnv: config.nodeEnv },
    `API đang chạy (${config.nodeEnv}, demoMode=${config.demoMode})`,
  );
  boot.info(`Application is running on: ${url}`);
  boot.info(`Health check: ${url}/health`);
});

function shutdown(signal) {
  logger.info({ signal, context: 'Bootstrap' }, `đang tắt server (${signal})`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'unhandledRejection');
  process.exit(1);
});
