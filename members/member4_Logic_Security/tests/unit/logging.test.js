import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { createLogger } from '../../src/common/logging/create-logger.js';
import { createNestFormatter } from '../../src/common/logging/nest-format.js';

const base = { pid: 42, time: Date.UTC(2026, 0, 1, 2, 3, 4) };

test('nest-format: dòng log thường, căn nhãn level, +ms so với dòng trước', () => {
  const format = createNestFormatter({ colorize: false });
  const first = format({ ...base, level: 30, context: 'Bootstrap', msg: 'xin chào' });
  assert.match(first, /^\[HTQLLH\] 42 {2}- .+ {5}LOG \[Bootstrap\] xin chào$/);
  const second = format({ ...base, time: base.time + 15, level: 40, msg: 'cảnh báo' });
  assert.match(second, / {4}WARN \[App\] cảnh báo \+15ms$/);
  assert.match(
    format({ ...base, level: 99 }),
    / {5}LOG \[App\] {2}\+/,
    'level lạ => LOG, msg rỗng',
  );
});

test('nest-format: HTTP, audit, lỗi kèm stack, màu ANSI', () => {
  const format = createNestFormatter({ colorize: false, appName: 'X' });
  const http = format({
    ...base,
    level: 30,
    req: { method: 'GET', url: '/a' },
    res: { statusCode: 200 },
    responseTime: 7,
  });
  assert.match(http, /\[HTTP\] GET \/a 200 - 7ms$/);
  assert.match(
    format({ ...base, level: 30, req: { method: 'GET', url: '/b' }, res: { statusCode: 404 } }),
    /\[HTTP\] GET \/b 404 \+0ms$/,
  );
  const audit = (detail) =>
    format({
      ...base,
      level: 30,
      audit: { action: 'LOGIN', actorId: 1, entity: 'users', ...detail },
    });
  assert.match(audit({ entityId: 5, note: '::1' }), /\[Audit\] LOGIN actor=1 users#5 \(::1\)/);
  assert.match(
    audit({ impersonatedBy: 9, entityId: null }),
    /\[Audit\] LOGIN actor=1 imp=9 users /,
  );
  const error = new Error('hỏng');
  const withStack = format({ ...base, level: 50, err: { stack: error.stack }, msg: 'lỗi' });
  assert.match(withStack, / {3}ERROR \[App\] lỗi .*\nError: hỏng/);
  assert.match(format({ ...base, level: 60, error: { stack: 'S' } }), /FATAL.*\nS$/);

  const colored = createNestFormatter()({ ...base, level: 20, msg: 'm' });
  assert.ok(colored.startsWith('\u001b[35m[HTQLLH]'));
});

function sink() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _enc, done) {
      chunks.push(chunk.toString());
      done();
    },
  });
  return { stream, text: () => chunks.join('') };
}

test('createLogger: pretty => dòng kiểu Nest, json => JSON; che header nhạy cảm', async () => {
  const pretty = sink();
  const a = await createLogger({ logLevel: 'info', logFormat: 'pretty' }, pretty.stream);
  a.child({ context: 'Test' }).info('xin chào');
  assert.match(pretty.text(), /LOG \[Test\] xin chào/);
  assert.ok(!pretty.text().includes('\u001b['), 'ghi ra stream riêng => không tô màu');

  const json = sink();
  const b = await createLogger({ logLevel: 'info', logFormat: 'json' }, json.stream);
  b.info({ req: { headers: { authorization: 'Bearer bí-mật' } } }, 'x');
  await new Promise((resolve) => setImmediate(resolve));
  const line = JSON.parse(json.text());
  assert.equal(line.msg, 'x');
  assert.equal(line.req.headers.authorization, '[Redacted]');
});
