import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { ERROR_CODES } from '../errors/error-codes.js';

function limiter({ enabled, windowMs, limit, keyGenerator }) {
  if (!enabled) {
    return (_req, _res, next) => next();
  }
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: { code: ERROR_CODES.TOO_MANY_REQUESTS, message: 'Thao tác quá nhanh, thử lại sau' },
        requestId: req.id,
      });
    },
  });
}

/** Login: 5 lần/phút theo (IP + username). */
export function createLoginLimiter(enabled) {
  return limiter({
    enabled,
    windowMs: 60_000,
    limit: 5,
    keyGenerator: (req) => {
      const username = String(req.body?.username ?? '')
        .toLowerCase()
        .slice(0, 50);
      return `${ipKeyGenerator(req.ip ?? '')}|${username}`;
    },
  });
}

/** Đăng ký / refresh: 10 lần/phút theo IP. */
export function createIpLimiter(enabled, limit = 10) {
  return limiter({
    enabled,
    windowMs: 60_000,
    limit,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  });
}
