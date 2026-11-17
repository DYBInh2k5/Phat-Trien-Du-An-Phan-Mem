// Hạ tầng dùng chung cho test tích hợp (Postgres thật). Chỉ dùng khi có TEST_DATABASE_URL.
import assert from 'node:assert/strict';
import pino from 'pino';
import { createApp } from '../../src/app.js';
import { createPasswordHasher } from '../../src/common/auth/password-hasher.js';
import { loadConfig } from '../../src/config/env.js';
import { createPool } from '../../src/db/pool.js';
import { createUsersRepository } from '../../src/modules/users/users.repository.js';

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
export const PASSWORD = 'Test@12345';
export const API = '/api/v1';

export const BASE_ENV = Object.freeze({
  NODE_ENV: 'test',
  JWT_ACCESS_SECRET: 'test-access-secret-0123456789abcdef0123456789',
  JWT_REFRESH_SECRET: 'test-refresh-secret-0123456789abcdef012345678',
  RATE_LIMIT_ENABLED: 'false',
  LOG_LEVEL: 'silent',
  BCRYPT_ROUNDS: '4',
});

const BASE_USERS = [
  ['admin', 'Quản trị viên', 'ADMIN'],
  ['gv.an', 'Nguyễn Văn An', 'TEACHER'],
  ['HS001', 'Nguyễn Thị Ánh', 'STUDENT'],
  ['HS001-PH', 'Nguyễn Thị Hương', 'PARENT'],
];

/** Mỗi file test tích hợp tạo một harness, start() trong before và stop() trong after. */
export function createHarness() {
  const logger = pino({ level: 'silent' });
  const pool = createPool(TEST_DATABASE_URL);
  const servers = [];
  const ids = {};
  const hasher = createPasswordHasher(4);
  const users = createUsersRepository(pool);
  const harness = { pool, ids, demoBase: '', strictBase: '' };

  harness.config = (overrides = {}) =>
    loadConfig({ ...BASE_ENV, DATABASE_URL: TEST_DATABASE_URL, DEMO_MODE: 'false', ...overrides });

  harness.listen = async (config) => {
    const server = createApp({ config, pool, logger }).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    servers.push(server);
    return `http://127.0.0.1:${server.address().port}`;
  };

  harness.call = async (base, method, path, { token, body, raw, headers } = {}) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body !== undefined || raw ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    assert.ok(!/"password(Hash)?"\s*:/.test(text), `Response không được chứa password: ${path}`);
    return { status: response.status, body: json, headers: response.headers };
  };

  harness.api = (...args) => harness.call(harness.demoBase, ...args);
  harness.apiStrict = (...args) => harness.call(harness.strictBase, ...args);

  harness.login = async (username, password = PASSWORD) => {
    const res = await harness.api('POST', `${API}/auth/login`, { body: { username, password } });
    assert.equal(res.status, 200, `login ${username}: ${JSON.stringify(res.body)}`);
    return res.body.data;
  };

  harness.expectError = (res, status, code) => {
    assert.equal(res.status, status, JSON.stringify(res.body));
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, code);
    assert.ok(res.body.requestId);
  };

  harness.createUser = async (username, fullName, role, password = PASSWORD) =>
    users.create({ username, passwordHash: await hasher.hash(password), fullName, role });

  /** Xóa dữ liệu do test tạo, đưa phân lớp / GVCN về như db/schema.sql và dựng lại 4 tài khoản gốc. */
  harness.reset = async () => {
    await pool.query('DELETE FROM grade_books');
    await pool.query('DELETE FROM attendances');
    await pool.query('DELETE FROM users');
    await pool.query("DELETE FROM students WHERE student_code LIKE 'TEST%'");
    await pool.query("UPDATE students SET gpa = 0, academic_rank = 'Chưa xếp loại'");
    await pool.query(
      "UPDATE students SET class_name = CASE student_code WHEN 'HS005' THEN '10A2' ELSE '10A1' END WHERE student_code IN ('HS001', 'HS002', 'HS003', 'HS004', 'HS005')",
    );
    await pool.query(
      "UPDATE school_classes SET gvcn_name = CASE class_name WHEN '10A1' THEN 'Nguyễn Văn An' ELSE 'Lê Thị Mai' END WHERE class_name IN ('10A1', '10A2')",
    );
    for (const [username, fullName, role] of BASE_USERS) {
      await harness.createUser(username, fullName, role);
    }
  };

  harness.start = async () => {
    harness.demoBase = await harness.listen(harness.config({ DEMO_MODE: 'true' }));
    harness.strictBase = await harness.listen(harness.config({ DEMO_MODE: 'false' }));
    await harness.reset();
    const students = await pool.query('SELECT id, student_code FROM students');
    for (const row of students.rows) {
      ids[row.student_code] = row.id;
    }
    const classes = await pool.query('SELECT id, class_name FROM school_classes');
    for (const row of classes.rows) {
      ids[`class:${row.class_name}`] = row.id;
    }
  };

  harness.stop = async () => {
    await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
    await pool.end();
  };

  return harness;
}
