import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { AppError, Errors } from '../../src/common/errors/app-error.js';
import { createErrorHandler } from '../../src/common/middleware/error-handler.js';
import { notFoundHandler } from '../../src/common/middleware/not-found.js';
import { requestId } from '../../src/common/middleware/request-id.js';
import { validate } from '../../src/common/middleware/validate.js';
import { created, done, ok } from '../../src/common/http/response.js';
import {
  MAX_LIMIT,
  buildMeta,
  paginationShape,
  parseSort,
  sortSchema,
  toOffset,
} from '../../src/common/http/pagination.js';
import {
  dateStringSchema,
  idParamSchema,
  passwordSchema,
  schoolYearSchema,
  scoreSchema,
} from '../../src/common/http/schemas.js';
import { createAuditLogger } from '../../src/common/auth/audit-logger.js';

function fakeRes() {
  const res = { statusCode: 200, headers: {}, payload: undefined };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.payload = body;
    return res;
  };
  res.setHeader = (name, value) => {
    res.headers[name] = value;
  };
  return res;
}

// ---------- response ----------
test('ok / created / done dựng đúng khung response', () => {
  const a = fakeRes();
  ok(a, { id: 1 });
  assert.deepEqual([a.statusCode, a.payload], [200, { success: true, data: { id: 1 } }]);

  const b = fakeRes();
  ok(b, [1], { page: 1, limit: 20, total: 1, totalPages: 1 });
  assert.deepEqual(b.payload.meta, { page: 1, limit: 20, total: 1, totalPages: 1 });

  const c = fakeRes();
  created(c, { id: 2 });
  assert.equal(c.statusCode, 201);

  const d = fakeRes();
  done(d);
  assert.deepEqual(d.payload, { success: true, data: null });
});

// ---------- errors ----------
test('Errors.*: status + code đúng bảng mã lỗi chung', () => {
  const table = [
    [Errors.badRequest('x'), 400, 'BAD_REQUEST'],
    [Errors.unauthenticated(), 401, 'UNAUTHENTICATED'],
    [Errors.tokenExpired(), 401, 'TOKEN_EXPIRED'],
    [Errors.invalidCredentials(), 401, 'INVALID_CREDENTIALS'],
    [Errors.refreshTokenInvalid(), 401, 'REFRESH_TOKEN_INVALID'],
    [Errors.forbidden(), 403, 'FORBIDDEN'],
    [Errors.notFound('Lớp'), 404, 'NOT_FOUND'],
    [Errors.conflict('x'), 409, 'CONFLICT'],
    [Errors.gradebookLocked(), 409, 'GRADEBOOK_LOCKED'],
    [Errors.gradebookAlreadyLocked(), 409, 'GRADEBOOK_ALREADY_LOCKED'],
    [Errors.alreadyDeleted(), 409, 'ALREADY_DELETED'],
    [Errors.notDeleted(), 409, 'NOT_DELETED'],
    [Errors.validation([]), 422, 'VALIDATION_ERROR'],
    [Errors.tooManyRequests(), 429, 'TOO_MANY_REQUESTS'],
  ];
  for (const [error, status, code] of table) {
    assert.ok(error instanceof AppError);
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    assert.ok(error.message.length > 0);
  }
  assert.equal(Errors.notFound('Lớp học').message, 'Lớp học không tồn tại');
});

// ---------- error handler ----------
const makeHandler = (isProduction) => {
  const logged = [];
  const handler = createErrorHandler({
    logger: { error: (...args) => logged.push(args) },
    isProduction,
  });
  const run = (err) => {
    const res = fakeRes();
    handler(err, { id: 'req-1' }, res, () => {});
    return res;
  };
  return { run, logged };
};

test('error handler: AppError giữ nguyên status/code/details và kèm requestId', () => {
  const { run } = makeHandler(true);
  const res = run(Errors.validation([{ in: 'body', field: 'a', message: 'sai' }]));
  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.payload, {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu không hợp lệ',
      details: [{ in: 'body', field: 'a', message: 'sai' }],
    },
    requestId: 'req-1',
  });
  assert.equal('details' in run(Errors.forbidden()).payload.error, false);
});

test('error handler: lỗi body-parser và lỗi Postgres được dịch sang mã chuẩn', () => {
  const { run } = makeHandler(true);
  assert.deepEqual(
    [
      run({ type: 'entity.parse.failed' }).statusCode,
      run({ type: 'entity.parse.failed' }).payload.error.code,
    ],
    [400, 'BAD_REQUEST'],
  );
  assert.equal(run({ type: 'entity.too.large' }).statusCode, 413);
  assert.equal(run({ type: 'entity.too.large' }).payload.error.code, 'PAYLOAD_TOO_LARGE');
  assert.equal(run({ code: '23505' }).statusCode, 409);
  assert.equal(run({ code: '23505' }).payload.error.code, 'CONFLICT');
  assert.equal(run({ code: '23503' }).statusCode, 422);
  assert.equal(run({ code: '22003' }).payload.error.code, 'VALIDATION_ERROR');
});

test('error handler: lỗi lạ => 500, production giấu chi tiết, dev hiện message, luôn log', () => {
  const prod = makeHandler(true);
  const resProd = prod.run(new Error('mật khẩu DB là hunter2'));
  assert.equal(resProd.statusCode, 500);
  assert.equal(resProd.payload.error.code, 'INTERNAL_ERROR');
  assert.equal(resProd.payload.error.message, 'Lỗi hệ thống');
  assert.ok(!JSON.stringify(resProd.payload).includes('hunter2'));
  assert.equal(prod.logged.length, 1);

  const dev = makeHandler(false);
  assert.match(dev.run(new Error('boom')).payload.error.message, /boom/);
  assert.match(dev.run(undefined).payload.error.message, /unknown/);
});

test('notFoundHandler trả JSON chuẩn có requestId', () => {
  const res = fakeRes();
  notFoundHandler({ method: 'GET', path: '/xyz', id: 'r1' }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.payload.error.code, 'NOT_FOUND');
  assert.equal(res.payload.requestId, 'r1');
});

// ---------- request id ----------
test('requestId: nhận X-Request-Id hợp lệ, thay thế giá trị nguy hiểm/không hợp lệ', () => {
  const run = (header) => {
    const req = { get: () => header };
    const res = fakeRes();
    requestId(req, res, () => {});
    return { req, res };
  };
  assert.equal(run('abc-12345678').req.id, 'abc-12345678');
  assert.equal(run('abc-12345678').res.headers['X-Request-Id'], 'abc-12345678');
  for (const bad of ['x', 'a b c d e f g h', 'ab\r\nSet-Cookie: x=1', 'a'.repeat(65), undefined]) {
    const { req } = run(bad);
    assert.match(req.id, /^[0-9a-f-]{36}$/, `phải sinh UUID mới cho: ${String(bad)}`);
  }
});

// ---------- validate ----------
test('validate: gán dữ liệu đã ép kiểu vào req.valid, không đụng req.body', () => {
  const middleware = validate({
    params: idParamSchema,
    query: z.strictObject({ page: z.coerce.number().int().default(1) }),
    body: z.strictObject({ name: z.string().trim() }),
  });
  const req = { params: { id: '5' }, query: {}, body: { name: '  An ' } };
  let error;
  middleware(req, {}, (e) => {
    error = e;
  });
  assert.equal(error, undefined);
  assert.deepEqual(req.valid, { params: { id: 5 }, query: { page: 1 }, body: { name: 'An' } });
  assert.deepEqual(req.body, { name: '  An ' });
});

test('validate: gom lỗi của cả params/query/body, báo rõ nằm ở đâu, chặn field lạ', () => {
  const middleware = validate({
    params: idParamSchema,
    query: z.strictObject({ page: z.coerce.number().int().min(1) }),
    body: z.strictObject({ name: z.string() }),
  });
  let error;
  middleware(
    { params: { id: 'abc' }, query: { page: '0' }, body: { name: 1, role: 'ADMIN' } },
    {},
    (e) => {
      error = e;
    },
  );
  assert.equal(error.code, 'VALIDATION_ERROR');
  const places = error.details.map((d) => `${d.in}:${d.field}`);
  assert.ok(places.includes('params:id'));
  assert.ok(places.includes('query:page'));
  assert.ok(places.includes('body:name'));
  assert.ok(
    error.details.some((d) => d.in === 'body' && /role/.test(d.message + d.field)),
    'field lạ phải bị chặn',
  );
});

test('validate: bỏ qua phần không khai báo schema và chịu được req.body undefined', () => {
  const middleware = validate({ body: z.strictObject({}) });
  const req = { params: {}, query: {} };
  let error;
  middleware(req, {}, (e) => {
    error = e;
  });
  assert.equal(error, undefined);
  assert.deepEqual(req.valid, { body: {} });
});

// ---------- pagination ----------
test('phân trang: mặc định, giới hạn tối đa, offset, meta', () => {
  const schema = z.strictObject(paginationShape);
  assert.deepEqual(schema.parse({}), { page: 1, limit: 20 });
  assert.deepEqual(schema.parse({ page: '3', limit: '50' }), { page: 3, limit: 50 });
  for (const bad of [
    { page: '0' },
    { limit: '0' },
    { limit: String(MAX_LIMIT + 1) },
    { page: '1.5' },
    { page: 'x' },
  ]) {
    assert.equal(schema.safeParse(bad).success, false, JSON.stringify(bad));
  }
  assert.equal(toOffset({ page: 3, limit: 20 }), 40);
  assert.deepEqual(buildMeta({ page: 2, limit: 20 }, 41), {
    page: 2,
    limit: 20,
    total: 41,
    totalPages: 3,
  });
  assert.equal(buildMeta({ page: 1, limit: 20 }, 0).totalPages, 1);
});

test('sort: chỉ nhận field trong whitelist và map sang cột an toàn (chống SQL injection)', () => {
  const schema = sortSchema(['name', 'createdAt'], 'name');
  assert.equal(schema.parse(undefined), 'name');
  assert.equal(schema.parse('-createdAt'), '-createdAt');
  assert.equal(schema.safeParse('password').success, false);
  assert.equal(schema.safeParse('name; DROP TABLE users').success, false);
  assert.equal(schema.safeParse('--name').success, false);
  const columns = { name: 'full_name', createdAt: 'created_at' };
  assert.deepEqual(parseSort('-createdAt', columns), { column: 'created_at', direction: 'DESC' });
  assert.deepEqual(parseSort('name', columns), { column: 'full_name', direction: 'ASC' });
});

// ---------- schemas ----------
test('schemas dùng chung: schoolYear, ngày, điểm, mật khẩu', () => {
  assert.equal(schoolYearSchema.safeParse('2025-2026').success, true);
  for (const bad of ['2025-2027', '2025', '25-26', '2026-2025', '2025/2026']) {
    assert.equal(schoolYearSchema.safeParse(bad).success, false, bad);
  }
  assert.equal(dateStringSchema.safeParse('2026-02-28').success, true);
  for (const bad of ['2026-13-01', '2026-2-3', '28/02/2026', '2026-02-30x', '']) {
    assert.equal(dateStringSchema.safeParse(bad).success, false, bad);
  }
  for (const good of [0, 10, 7.5, 0.1]) {
    assert.equal(scoreSchema.safeParse(good).success, true, String(good));
  }
  for (const bad of [-0.1, 10.1, 7.25, '8', null, NaN]) {
    assert.equal(scoreSchema.safeParse(bad).success, false, String(bad));
  }
  assert.equal(passwordSchema.safeParse('Abcdef12').success, true);
  for (const bad of ['Ab1', 'abcdefgh', '12345678', 'a1'.repeat(40)]) {
    assert.equal(passwordSchema.safeParse(bad).success, false, bad);
  }
  assert.equal(idParamSchema.safeParse({ id: '0' }).success, false);
  assert.equal(idParamSchema.safeParse({ id: '12', extra: 1 }).success, false);
});

// ---------- audit ----------
test('audit logger ghi đủ actor / hành động / chi tiết, mặc định impersonatedBy = null', () => {
  const calls = [];
  const audit = createAuditLogger({ info: (...args) => calls.push(args) });
  audit.record({ id: 5 }, 'GRADE_UPDATE', {
    entity: 'grade_books',
    entityId: 9,
    before: 1,
    after: 2,
  });
  audit.record({ id: 5, impersonatedBy: 1 }, 'SWITCH_ROLE', { entity: 'users' });
  assert.deepEqual(calls[0][0].audit, {
    actorId: 5,
    impersonatedBy: null,
    action: 'GRADE_UPDATE',
    entity: 'grade_books',
    entityId: 9,
    before: 1,
    after: 2,
  });
  assert.equal(calls[1][0].audit.impersonatedBy, 1);
  assert.match(calls[0][1], /GRADE_UPDATE/);
});
