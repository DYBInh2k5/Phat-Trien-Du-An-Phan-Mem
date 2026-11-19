import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createTokenService } from '../../src/common/auth/token-service.js';

const ACCESS_SECRET = 'a'.repeat(40);
const REFRESH_SECRET = 'b'.repeat(40);
const service = createTokenService({
  accessSecret: ACCESS_SECRET,
  refreshSecret: REFRESH_SECRET,
  accessTtlSeconds: 900,
  refreshTtlSeconds: 604800,
});

const thrown = (fn) => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  assert.fail('Lẽ ra phải ném lỗi');
};

test('access token: ký rồi verify ra đúng userId, sid, không chứa role', () => {
  const sid = service.newSessionId();
  const token = service.signAccess({ userId: 7, sid });
  const claims = service.verifyAccess(token);
  assert.equal(claims.userId, 7);
  assert.equal(claims.sid, sid);
  assert.equal(claims.typ, 'access');
  assert.equal(claims.role, undefined);
  assert.equal(claims.imp, undefined);
  assert.ok(claims.exp - claims.iat === 900);
});

test('access token impersonate mang claim imp', () => {
  const token = service.signAccess({ userId: 7, sid: 's1', impersonatedBy: 1 });
  assert.equal(service.verifyAccess(token).imp, 1);
});

test('mỗi phiên có sid khác nhau; mỗi refresh token có jti khác nhau', () => {
  assert.notEqual(service.newSessionId(), service.newSessionId());
  const a = service.verifyRefresh(service.signRefresh({ userId: 1, sid: 's' }));
  const b = service.verifyRefresh(service.signRefresh({ userId: 1, sid: 's' }));
  assert.notEqual(a.jti, b.jti);
});

test('access token hết hạn => TOKEN_EXPIRED (client biết phải refresh)', () => {
  const expired = jwt.sign({ typ: 'access', sid: 's' }, ACCESS_SECRET, {
    algorithm: 'HS256',
    subject: '1',
    expiresIn: -10,
  });
  const error = thrown(() => service.verifyAccess(expired));
  assert.equal(error.code, 'TOKEN_EXPIRED');
  assert.equal(error.status, 401);
});

test('refresh token hết hạn => REFRESH_TOKEN_INVALID', () => {
  const expired = jwt.sign({ typ: 'refresh', sid: 's' }, REFRESH_SECRET, {
    algorithm: 'HS256',
    subject: '1',
    expiresIn: -10,
  });
  assert.equal(thrown(() => service.verifyRefresh(expired)).code, 'REFRESH_TOKEN_INVALID');
});

test('sai chữ ký / rác / thiếu token => UNAUTHENTICATED', () => {
  const forged = jwt.sign({ typ: 'access', sid: 's' }, 'x'.repeat(40), { subject: '1' });
  assert.equal(thrown(() => service.verifyAccess(forged)).code, 'UNAUTHENTICATED');
  assert.equal(thrown(() => service.verifyAccess('khong-phai-jwt')).code, 'UNAUTHENTICATED');
  assert.equal(thrown(() => service.verifyRefresh('khong-phai-jwt')).code, 'REFRESH_TOKEN_INVALID');
});

test('tấn công alg=none bị từ chối', () => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: '1', typ: 'access', sid: 's' })).toString(
    'base64url',
  );
  assert.equal(thrown(() => service.verifyAccess(`${header}.${payload}.`)).code, 'UNAUTHENTICATED');
});

test('token ký bằng thuật toán khác HS256 bị từ chối', () => {
  const hs512 = jwt.sign({ typ: 'access', sid: 's' }, ACCESS_SECRET, {
    algorithm: 'HS512',
    subject: '1',
  });
  assert.equal(thrown(() => service.verifyAccess(hs512)).code, 'UNAUTHENTICATED');
});

test('không dùng nhầm loại token: access làm refresh và ngược lại', () => {
  const access = service.signAccess({ userId: 1, sid: 's' });
  const refresh = service.signRefresh({ userId: 1, sid: 's' });
  assert.equal(thrown(() => service.verifyRefresh(access)).code, 'REFRESH_TOKEN_INVALID');
  assert.equal(thrown(() => service.verifyAccess(refresh)).code, 'UNAUTHENTICATED');
  // cùng secret nhưng khác typ vẫn bị chặn
  const wrongTyp = jwt.sign({ typ: 'refresh', sid: 's' }, ACCESS_SECRET, { subject: '1' });
  assert.equal(thrown(() => service.verifyAccess(wrongTyp)).code, 'UNAUTHENTICATED');
});

test('claim sub không phải số nguyên hoặc thiếu sid => từ chối', () => {
  const badSub = jwt.sign({ typ: 'access', sid: 's' }, ACCESS_SECRET, { subject: 'abc' });
  const noSid = jwt.sign({ typ: 'access' }, ACCESS_SECRET, { subject: '1' });
  assert.equal(thrown(() => service.verifyAccess(badSub)).code, 'UNAUTHENTICATED');
  assert.equal(thrown(() => service.verifyAccess(noSid)).code, 'UNAUTHENTICATED');
  const badRefresh = jwt.sign({ typ: 'refresh', sid: 's' }, REFRESH_SECRET, { subject: '1.5' });
  assert.equal(thrown(() => service.verifyRefresh(badRefresh)).code, 'REFRESH_TOKEN_INVALID');
});
