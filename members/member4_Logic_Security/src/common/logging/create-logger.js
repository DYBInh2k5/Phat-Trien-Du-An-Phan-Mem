import pino from 'pino';
import { createNestFormatter } from './nest-format.js';

/**
 * Production (hoặc LOG_FORMAT=json): JSON thuần của pino, dành cho máy đọc/thu thập log.
 * Còn lại: in đẹp kiểu NestJS qua pino-pretty (devDependency, chỉ import khi cần).
 * @param {{ logLevel: string, logFormat: 'pretty' | 'json' }} config
 * @param {NodeJS.WritableStream} [destination] mặc định stdout
 */
export async function createLogger(config, destination) {
  const options = {
    level: config.logLevel,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  };
  if (config.logFormat === 'json') {
    return pino(options, destination);
  }
  const { default: pretty } = await import('pino-pretty');
  const format = createNestFormatter({ colorize: !destination && pretty.isColorSupported });
  const stream = pretty({
    destination,
    sync: true,
    colorize: false, // màu do nest-format tự tô
    hideObject: true,
    ignore: 'pid,hostname,time,level',
    messageFormat: (log) => format(log),
  });
  return pino(options, stream);
}
