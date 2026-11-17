import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Errors } from '../errors/app-error.js';

const ALGORITHM = 'HS256';
const TYPE = Object.freeze({ ACCESS: 'access', REFRESH: 'refresh' });

/**
 * Claims access : sub (userId), sid (sessionId), typ, imp? (id admin đang impersonate), ims (issuedAtMs)
 * Claims refresh: sub, sid, typ, jti
 * KHÔNG nhét role vào token: role luôn đọc từ DB mỗi request để đổi role có hiệu lực ngay.
 */
export function createTokenService({
  accessSecret,
  refreshSecret,
  accessTtlSeconds,
  refreshTtlSeconds,
}) {
  function verify(token, secret, expectedType, onExpired) {
    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw onExpired();
      }
      throw expectedType === TYPE.ACCESS ? Errors.unauthenticated() : Errors.refreshTokenInvalid();
    }
    if (payload.typ !== expectedType || typeof payload.sid !== 'string') {
      throw expectedType === TYPE.ACCESS ? Errors.unauthenticated() : Errors.refreshTokenInvalid();
    }
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      throw expectedType === TYPE.ACCESS ? Errors.unauthenticated() : Errors.refreshTokenInvalid();
    }
    return { ...payload, userId };
  }

  return {
    accessTtlSeconds,
    refreshTtlSeconds,
    newSessionId: () => randomUUID(),

    signAccess({ userId, sid, impersonatedBy }) {
      const claims = { typ: TYPE.ACCESS, sid, ims: Date.now() };
      if (impersonatedBy) {
        claims.imp = impersonatedBy;
      }
      return jwt.sign(claims, accessSecret, {
        algorithm: ALGORITHM,
        subject: String(userId),
        expiresIn: accessTtlSeconds,
      });
    },

    signRefresh({ userId, sid }) {
      return jwt.sign({ typ: TYPE.REFRESH, sid, ims: Date.now() }, refreshSecret, {
        algorithm: ALGORITHM,
        subject: String(userId),
        expiresIn: refreshTtlSeconds,
        jwtid: randomUUID(),
      });
    },

    verifyAccess: (token) => verify(token, accessSecret, TYPE.ACCESS, Errors.tokenExpired),
    verifyRefresh: (token) =>
      verify(token, refreshSecret, TYPE.REFRESH, Errors.refreshTokenInvalid),
  };
}
