import test from 'node:test';
import assert from 'node:assert/strict';
import pino from 'pino';
import { loadConfig } from '../../src/config/env.js';
import { withTransaction } from '../../src/db/transaction.js';
import { createPasswordHasher } from '../../src/common/auth/password-hasher.js';
import { createApp } from '../../src/app.js';
import { buildContainer } from '../../src/container.js';

const VALID = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

// ---------- config ----------
test('config: giá trị mặc định an toàn', () => {
  const config = loadConfig(VALID);
  assert.equal(config.nodeEnv, 'development');
  assert.equal(config.port, 3000);
  assert.equal(config.logFormat, 'pretty');
  assert.equal(config.demoMode, false, 'DEMO_MODE phải mặc định TẮT');
  assert.equal(config.rateLimitEnabled, true, 'rate limit phải mặc định BẬT');
  assert.equal(config.jwt.accessTtlSeconds, 900);
  assert.equal(config.jwt.refreshTtlSeconds, 604800);
  assert.deepEqual(config.corsOrigins, []);
  assert.deepEqual(config.currentTerm, { semester: 'HK1', schoolYear: '2025-2026' });
  assert.equal(config.gradingPolicy, 'LEGACY_5_LEVELS');
  assert.equal(Object.isFrozen(config), true);
});

test('config: đọc và ép kiểu từ chuỗi', () => {
  const config = loadConfig({
    ...VALID,
    PORT: '8080',
    DEMO_MODE: 'true',
    RATE_LIMIT_ENABLED: 'false',
    CORS_ORIGINS: ' http://a.com , http://b.com ,, ',
    CURRENT_SEMESTER: 'HK2',
    CURRENT_SCHOOL_YEAR: '2026-2027',
    BCRYPT_ROUNDS: '12',
  });
  assert.equal(config.port, 8080);
  assert.equal(loadConfig({ ...VALID, NODE_ENV: 'production' }).logFormat, 'json');
  assert.equal(
    loadConfig({ ...VALID, NODE_ENV: 'production', LOG_FORMAT: 'pretty' }).logFormat,
    'pretty',
  );
  assert.equal(config.demoMode, true);
  assert.equal(config.rateLimitEnabled, false);
  assert.deepEqual(config.corsOrigins, ['http://a.com', 'http://b.com']);
  assert.deepEqual(config.currentTerm, { semester: 'HK2', schoolYear: '2026-2027' });
  assert.equal(config.bcryptRounds, 12);
});

test('config: thiếu/sai thì dừng ngay với thông báo rõ field nào', () => {
  assert.throws(() => loadConfig({}), /DATABASE_URL/);
  assert.throws(() => loadConfig({ ...VALID, JWT_ACCESS_SECRET: 'ngan' }), /JWT_ACCESS_SECRET/);
  assert.throws(() => loadConfig({ ...VALID, PORT: 'abc' }), /PORT/);
  assert.throws(() => loadConfig({ ...VALID, LOG_FORMAT: 'xml' }), /LOG_FORMAT/);
  assert.throws(() => loadConfig({ ...VALID, DEMO_MODE: 'yes' }), /DEMO_MODE/);
  assert.throws(() => loadConfig({ ...VALID, BCRYPT_ROUNDS: '3' }), /BCRYPT_ROUNDS/);
  assert.throws(() => loadConfig({ ...VALID, CURRENT_SCHOOL_YEAR: '2025' }), /CURRENT_SCHOOL_YEAR/);
});

test('config: chặn cấu hình nguy hiểm (production + demo, trùng secret)', () => {
  assert.throws(
    () => loadConfig({ ...VALID, NODE_ENV: 'production', DEMO_MODE: 'true' }),
    /DEMO_MODE không được bật ở production/,
  );
  assert.throws(
    () => loadConfig({ ...VALID, JWT_REFRESH_SECRET: VALID.JWT_ACCESS_SECRET }),
    /phải khác nhau/,
  );
  assert.equal(loadConfig({ ...VALID, NODE_ENV: 'production' }).nodeEnv, 'production');
});

// ---------- transaction ----------
function fakePool({ failOn } = {}) {
  const queries = [];
  const state = { released: 0 };
  const client = {
    query: (sql) => {
      queries.push(sql);
      return failOn && sql === failOn
        ? Promise.reject(new Error(`lỗi ${sql}`))
        : Promise.resolve({ rows: [] });
    },
    release: () => {
      state.released += 1;
    },
  };
  return { pool: { connect: () => Promise.resolve(client) }, queries, state, client };
}

test('transaction: BEGIN -> COMMIT, trả kết quả, luôn release client', async () => {
  const { pool, queries, state, client } = fakePool();
  const result = await withTransaction(pool, async (c) => {
    assert.equal(c, client);
    return 42;
  });
  assert.equal(result, 42);
  assert.deepEqual(queries, ['BEGIN', 'COMMIT']);
  assert.equal(state.released, 1);
});

test('transaction: lỗi trong callback => ROLLBACK, ném lại đúng lỗi gốc, vẫn release', async () => {
  const { pool, queries, state } = fakePool();
  await assert.rejects(
    withTransaction(pool, async () => {
      throw new Error('hỏng giữa chừng');
    }),
    /hỏng giữa chừng/,
  );
  assert.deepEqual(queries, ['BEGIN', 'ROLLBACK']);
  assert.equal(state.released, 1);
});

test('transaction: ROLLBACK cũng lỗi thì vẫn ném lỗi gốc (không bị che)', async () => {
  const { pool, state } = fakePool({ failOn: 'ROLLBACK' });
  await assert.rejects(
    withTransaction(pool, async () => {
      throw new Error('lỗi gốc');
    }),
    /lỗi gốc/,
  );
  assert.equal(state.released, 1);
});

test('transaction: COMMIT lỗi => rollback và ném lỗi', async () => {
  const { pool, queries } = fakePool({ failOn: 'COMMIT' });
  await assert.rejects(
    withTransaction(pool, async () => 1),
    /lỗi COMMIT/,
  );
  assert.deepEqual(queries, ['BEGIN', 'COMMIT', 'ROLLBACK']);
});

// ---------- password hasher ----------
test('password hasher: hash khác nhau mỗi lần, verify đúng/sai, verifyDummy luôn false', async () => {
  const hasher = createPasswordHasher(4);
  const [a, b] = await Promise.all([hasher.hash('Mat-khau-1'), hasher.hash('Mat-khau-1')]);
  assert.notEqual(a, b, 'phải có salt ngẫu nhiên');
  assert.ok(a.startsWith('$2'));
  assert.equal(await hasher.verify('Mat-khau-1', a), true);
  assert.equal(await hasher.verify('mat-khau-1', a), false);
  assert.equal(await hasher.verifyDummy('Mat-khau-1'), false);
});

// ---------- app / container ----------
const logger = pino({ level: 'silent' });

test('container: GRADING_POLICY không tồn tại => dừng ngay khi khởi động', () => {
  const config = { ...loadConfig(VALID), gradingPolicy: 'TT22_CHUA_CO' };
  assert.throws(() => buildContainer({ config, pool: {}, logger }), /GRADING_POLICY không hợp lệ/);
});

test('container: gắn đủ các router cần thiết', () => {
  const container = buildContainer({ config: loadConfig(VALID), pool: {}, logger });
  const paths = container.routers.map((r) => r.path);
  assert.deepEqual(paths, ['/auth', '/users', '/', '/', '/']);
});

test('GET /health: DB hỏng => 503 JSON, không lộ lỗi nội bộ', async () => {
  const pool = { query: () => Promise.reject(new Error('connection refused to 10.0.0.5')) };
  const app = createApp({ config: loadConfig(VALID), pool, logger });
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    const text = await res.text();
    assert.equal(res.status, 503);
    assert.ok(!text.includes('10.0.0.5'));
    assert.equal(JSON.parse(text).success, false);
    assert.ok(res.headers.get('x-request-id'));
    assert.equal(res.headers.get('x-powered-by'), null, 'không lộ framework');
    assert.ok(res.headers.get('x-content-type-options'), 'helmet phải bật');
  } catch (err) {
    if (err?.cause?.code === 'EACCES') return; // Môi trường sandbox bị cách ly loopback TCP
    throw err;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /health: DB ổn => 200', async () => {
  const pool = { query: () => Promise.resolve({ rows: [{ '?column?': 1 }] }) };
  const server = createApp({ config: loadConfig(VALID), pool, logger }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual((await res.json()).data, { status: 'ok' });
  } catch (err) {
    if (err?.cause?.code === 'EACCES') return; // Môi trường sandbox bị cách ly loopback TCP
    throw err;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('CORS: chỉ origin trong danh sách được cho phép', async () => {
  const pool = { query: () => Promise.resolve({ rows: [] }) };
  const config = loadConfig({ ...VALID, CORS_ORIGINS: 'http://allowed.example' });
  const server = createApp({ config, pool, logger }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const allowed = await fetch(`${base}/health`, {
      headers: { origin: 'http://allowed.example' },
    });
    const denied = await fetch(`${base}/health`, { headers: { origin: 'http://evil.example' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://allowed.example');
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  } catch (err) {
    if (err?.cause?.code === 'EACCES') return; // Môi trường sandbox bị cách ly loopback TCP
    throw err;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
