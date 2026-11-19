import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionStore } from '../../src/common/auth/session-store.js';
import { createTokenService } from '../../src/common/auth/token-service.js';
import { createAuthenticate } from '../../src/common/middleware/authenticate.js';
import { createAuthService } from '../../src/modules/auth/auth.service.js';

const tokenService = createTokenService({
  accessSecret: 'a'.repeat(40),
  refreshSecret: 'b'.repeat(40),
  accessTtlSeconds: 900,
  refreshTtlSeconds: 3600,
});

const USERS = [
  { id: 1, username: 'admin', fullName: 'Admin', role: 'ADMIN', passwordHash: 'ok:Admin@123' },
  {
    id: 2,
    username: 'gv.an',
    fullName: 'Nguyễn Văn An',
    role: 'TEACHER',
    passwordHash: 'ok:Teacher@123',
  },
  { id: 3, username: 'HS001', fullName: 'Ánh', role: 'STUDENT', passwordHash: 'ok:Student@123' },
  { id: 4, username: 'HS001-PH', fullName: 'Hương', role: 'PARENT', passwordHash: 'ok:Parent@123' },
];

function setup({ demoMode = false, users = USERS } = {}) {
  const audits = [];
  const calls = { dummy: 0, updated: [] };
  const sessionStore = createSessionStore();
  const usersRepository = {
    findById: async (id) => users.find((u) => u.id === id),
    findByUsername: async (name) =>
      users.find((u) => u.username.toLowerCase() === name.toLowerCase()),
    findFirstByRole: async (role) => users.find((u) => u.role === role),
    updatePassword: async (id, hash) => calls.updated.push({ id, hash }),
  };
  const studentsRepository = {
    findByCode: async (code) => (code === 'HS001' ? { id: 10, studentCode: 'HS001' } : undefined),
    listClassesByGvcn: async (name) =>
      name === 'Nguyễn Văn An' ? [{ id: 1, className: '10A1' }] : [],
  };
  const passwordHasher = {
    hash: async (plain) => `ok:${plain}`,
    verify: async (plain, hash) => hash === `ok:${plain}`,
    verifyDummy: async () => {
      calls.dummy += 1;
      return false;
    },
  };
  const service = createAuthService({
    config: { demoMode },
    usersRepository,
    studentsRepository,
    passwordHasher,
    tokenService,
    sessionStore,
    audit: { record: (actor, action, detail) => audits.push({ actor, action, detail }) },
  });
  const actorOf = (user, extra = {}) => ({ ...user, sid: 'sid-1', impersonatedBy: null, ...extra });
  return { service, sessionStore, audits, calls, actorOf };
}

const code = async (promise) => {
  try {
    await promise;
  } catch (error) {
    return error.code;
  }
  return 'KHÔNG-LỖI';
};

test('login: đúng => cặp token + user công khai (không có passwordHash)', async () => {
  const { service, audits } = setup();
  const result = await service.login(
    { username: 'ADMIN', password: 'Admin@123' },
    { ip: '1.1.1.1' },
  );
  assert.equal(result.tokenType, 'Bearer');
  assert.equal(result.expiresIn, 900);
  assert.ok(result.accessToken && result.refreshToken);
  assert.equal(result.user.username, 'admin');
  assert.equal('passwordHash' in result.user, false);
  assert.equal(tokenService.verifyAccess(result.accessToken).userId, 1);
  assert.equal(
    tokenService.verifyRefresh(result.refreshToken).sid,
    tokenService.verifyAccess(result.accessToken).sid,
  );
  assert.deepEqual(
    audits.map((a) => a.action),
    ['LOGIN'],
  );
});

test('login: user không tồn tại vẫn tốn thời gian băm (verifyDummy) và trả cùng lỗi', async () => {
  const { service, calls, audits } = setup();
  assert.equal(
    await code(service.login({ username: 'ghost', password: 'x' }, { ip: 'ip' })),
    'INVALID_CREDENTIALS',
  );
  assert.equal(calls.dummy, 1);
  assert.equal(
    await code(service.login({ username: 'admin', password: 'sai' }, { ip: 'ip' })),
    'INVALID_CREDENTIALS',
  );
  assert.equal(calls.dummy, 1, 'user có thật thì không dùng dummy');
  assert.deepEqual(
    audits.map((a) => a.action),
    ['LOGIN_FAILED', 'LOGIN_FAILED'],
  );
});

test('refresh: xoay vòng, giữ nguyên sid, token cũ dùng lại => thu hồi cả phiên', async () => {
  const { service } = setup();
  const first = await service.login({ username: 'HS001', password: 'Student@123' }, {});
  const second = await service.refresh({ refreshToken: first.refreshToken });
  assert.equal(
    tokenService.verifyAccess(second.accessToken).sid,
    tokenService.verifyRefresh(first.refreshToken).sid,
  );
  assert.notEqual(second.refreshToken, first.refreshToken);
  assert.equal(
    await code(service.refresh({ refreshToken: first.refreshToken })),
    'REFRESH_TOKEN_INVALID',
  );
  assert.equal(
    await code(service.refresh({ refreshToken: second.refreshToken })),
    'REFRESH_TOKEN_INVALID',
  );
});

test('refresh: phiên đã logout, token rác, user đã bị xóa => REFRESH_TOKEN_INVALID', async () => {
  const { service, sessionStore } = setup();
  const session = await service.login({ username: 'HS001', password: 'Student@123' }, {});
  sessionStore.revokeSession(tokenService.verifyRefresh(session.refreshToken).sid, 60);
  assert.equal(
    await code(service.refresh({ refreshToken: session.refreshToken })),
    'REFRESH_TOKEN_INVALID',
  );
  assert.equal(await code(service.refresh({ refreshToken: 'rac' })), 'REFRESH_TOKEN_INVALID');

  const ghostToken = tokenService.signRefresh({ userId: 999, sid: 'x' });
  assert.equal(await code(service.refresh({ refreshToken: ghostToken })), 'REFRESH_TOKEN_INVALID');
});

test('logout / logoutAll thu hồi đúng phạm vi', async () => {
  const { service, sessionStore, actorOf } = setup();
  const actor = actorOf(USERS[0]);
  assert.equal(service.logout(actor), null);
  assert.equal(sessionStore.isRevoked({ sid: 'sid-1', userId: 1, issuedAtMs: Date.now() }), true);
  assert.equal(service.logoutAll(actor), null);
  assert.equal(
    sessionStore.isRevoked({ sid: 'khac', userId: 1, issuedAtMs: Date.now() - 1000 }),
    true,
  );
});

test('me: liên kết học sinh theo role', async () => {
  const { service, actorOf } = setup();
  assert.deepEqual((await service.me(actorOf(USERS[2]))).linkedStudentIds, [10]);
  assert.deepEqual((await service.me(actorOf(USERS[3]))).linkedStudentIds, [10]);
  const teacher = await service.me(actorOf(USERS[1]));
  assert.deepEqual(teacher.managedClasses, [{ id: 1, className: '10A1' }]);
  assert.deepEqual(teacher.linkedStudentIds, []);
  const admin = await service.me(actorOf(USERS[0]));
  assert.deepEqual([admin.linkedStudentIds, admin.managedClasses], [[], []]);
  // tài khoản học sinh nhưng mã không còn trong bảng students
  const orphan = { id: 9, username: 'HS999', fullName: 'X', role: 'STUDENT' };
  assert.deepEqual((await service.me(actorOf(orphan))).linkedStudentIds, []);
  assert.equal((await service.me(actorOf(USERS[0]))).sessionId, 'sid-1');
});

test('switchRole: Admin impersonate theo userId (không có refresh token, có claim imp)', async () => {
  const { service, actorOf, audits } = setup();
  const result = await service.switchRole(actorOf(USERS[0]), { targetUserId: 3 });
  assert.equal(result.user.username, 'HS001');
  assert.equal(result.refreshToken, undefined);
  assert.equal(result.impersonatedBy, 1);
  assert.equal(tokenService.verifyAccess(result.accessToken).imp, 1);
  assert.equal(audits.at(-1).action, 'SWITCH_ROLE');
  assert.equal(
    await code(service.switchRole(actorOf(USERS[0]), { targetUserId: 999 })),
    'NOT_FOUND',
  );
});

test('switchRole: non-admin không được impersonate; đang impersonate không được chuyển tiếp', async () => {
  const { service, actorOf } = setup({ demoMode: true });
  assert.equal(await code(service.switchRole(actorOf(USERS[1]), { targetUserId: 1 })), 'FORBIDDEN');
  assert.equal(
    await code(
      service.switchRole(actorOf(USERS[0], { impersonatedBy: 5 }), { targetRole: 'TEACHER' }),
    ),
    'FORBIDDEN',
  );
});

test('switchRole theo targetRole: chỉ khi DEMO_MODE bật, và phải có tài khoản role đó', async () => {
  const off = setup({ demoMode: false });
  assert.equal(
    await code(off.service.switchRole(off.actorOf(USERS[2]), { targetRole: 'ADMIN' })),
    'FORBIDDEN',
  );

  const on = setup({ demoMode: true });
  const result = await on.service.switchRole(on.actorOf(USERS[2]), { targetRole: 'ADMIN' });
  assert.equal(result.user.role, 'ADMIN');
  assert.equal(result.impersonatedBy, 3);

  const noTeacher = setup({ demoMode: true, users: USERS.filter((u) => u.role !== 'TEACHER') });
  assert.equal(
    await code(
      noTeacher.service.switchRole(noTeacher.actorOf(USERS[2]), { targetRole: 'TEACHER' }),
    ),
    'NOT_FOUND',
  );
});

test('switchBack: về tài khoản gốc, thu hồi phiên impersonate', async () => {
  const { service, sessionStore, actorOf } = setup();
  assert.equal(await code(service.switchBack(actorOf(USERS[0]))), 'BAD_REQUEST');
  const back = await service.switchBack(actorOf(USERS[2], { impersonatedBy: 1 }));
  assert.equal(back.user.username, 'admin');
  assert.ok(back.refreshToken);
  assert.equal(sessionStore.isRevoked({ sid: 'sid-1', userId: 3, issuedAtMs: Date.now() }), true);
  assert.equal(
    await code(service.switchBack(actorOf(USERS[2], { impersonatedBy: 999 }))),
    'UNAUTHENTICATED',
  );
});

test('changePassword: đúng mật khẩu cũ => lưu hash mới, thu hồi mọi phiên của chính user đó', async () => {
  const { service, sessionStore, audits, calls, actorOf } = setup();
  const before = Date.now() - 5;
  const result = await service.changePassword(actorOf(USERS[2]), {
    currentPassword: 'Student@123',
    newPassword: 'NewPass@999',
  });
  assert.equal(result, null);
  assert.deepEqual(calls.updated, [{ id: 3, hash: 'ok:NewPass@999' }]);
  assert.equal(sessionStore.isRevoked({ sid: 'khac', userId: 3, issuedAtMs: before }), true);
  assert.equal(sessionStore.isRevoked({ sid: 'khac', userId: 1, issuedAtMs: before }), false);
  assert.equal(audits.at(-1).action, 'PASSWORD_CHANGE');
});

test('changePassword: sai mật khẩu cũ => BAD_REQUEST; đang impersonate => FORBIDDEN; user đã xóa => UNAUTHENTICATED', async () => {
  const { service, calls, audits, actorOf } = setup();
  const wrong = { currentPassword: 'sai-roi', newPassword: 'NewPass@999' };
  assert.equal(await code(service.changePassword(actorOf(USERS[2]), wrong)), 'BAD_REQUEST');
  assert.equal(audits.at(-1).action, 'PASSWORD_CHANGE_FAILED');
  const input = { currentPassword: 'Student@123', newPassword: 'NewPass@999' };
  assert.equal(
    await code(service.changePassword(actorOf(USERS[2], { impersonatedBy: 1 }), input)),
    'FORBIDDEN',
  );
  const ghost = { id: 99, username: 'x', role: 'STUDENT' };
  assert.equal(await code(service.changePassword(actorOf(ghost), input)), 'UNAUTHENTICATED');
  assert.deepEqual(calls.updated, []);
});

// ---------- authenticate middleware ----------
function runAuthenticate({ header, users = USERS, sessionStore = createSessionStore() }) {
  const authenticate = createAuthenticate({
    tokenService,
    sessionStore,
    usersRepository: { findById: async (id) => users.find((u) => u.id === id) },
  });
  const req = { get: (name) => (name === 'authorization' ? header : undefined) };
  return new Promise((resolve) => {
    authenticate(req, {}, (error) => resolve({ error, req }));
  });
}

test('authenticate: thiếu header / sai scheme / token rác => UNAUTHENTICATED', async () => {
  for (const header of [undefined, '', 'Bearer', 'Basic abc', 'Bearer rac.rac.rac', 'bearer x']) {
    const { error } = await runAuthenticate({ header });
    assert.equal(error?.code, 'UNAUTHENTICATED', String(header));
  }
});

test('authenticate: token hợp lệ => req.user lấy role từ DB (không tin token)', async () => {
  const token = tokenService.signAccess({ userId: 2, sid: 's' });
  const { error, req } = await runAuthenticate({ header: `Bearer ${token}` });
  assert.equal(error, undefined);
  assert.deepEqual(req.user, {
    id: 2,
    username: 'gv.an',
    fullName: 'Nguyễn Văn An',
    role: 'TEACHER',
    sid: 's',
    impersonatedBy: null,
  });
  // Đổi role trong DB có hiệu lực ngay với token cũ
  const demoted = USERS.map((u) => (u.id === 2 ? { ...u, role: 'STUDENT' } : u));
  const again = await runAuthenticate({ header: `Bearer ${token}`, users: demoted });
  assert.equal(again.req.user.role, 'STUDENT');
});

test('authenticate: phiên bị thu hồi / user không còn tồn tại => UNAUTHENTICATED', async () => {
  const token = tokenService.signAccess({ userId: 2, sid: 's' });
  const store = createSessionStore();
  store.revokeSession('s', 60);
  assert.equal(
    (await runAuthenticate({ header: `Bearer ${token}`, sessionStore: store })).error.code,
    'UNAUTHENTICATED',
  );
  assert.equal(
    (await runAuthenticate({ header: `Bearer ${token}`, users: [] })).error.code,
    'UNAUTHENTICATED',
  );
});

test('authenticate: claim imp được chuyển vào req.user.impersonatedBy', async () => {
  const token = tokenService.signAccess({ userId: 3, sid: 's', impersonatedBy: 1 });
  const { req } = await runAuthenticate({ header: `Bearer ${token}` });
  assert.equal(req.user.impersonatedBy, 1);
});
