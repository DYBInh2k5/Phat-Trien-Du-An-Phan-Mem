import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionStore } from '../../src/common/auth/session-store.js';
import { createUsersService } from '../../src/modules/users/users.service.js';

const STUDENTS = {
  HS001: {
    id: 1,
    studentCode: 'HS001',
    fullName: 'Nguyễn Thị Ánh',
    dob: '2008-05-12',
    parentName: 'Nguyễn Thị Hương',
    parentPhone: '0901234567',
    status: 'ACTIVE',
  },
  HS002: {
    id: 2,
    studentCode: 'HS002',
    fullName: 'Trần Văn Bảo',
    dob: '2008-03-22',
    parentName: null,
    parentPhone: '0907654321',
    status: 'ACTIVE',
  },
  HS009: {
    id: 9,
    studentCode: 'HS009',
    fullName: 'Đã Nghỉ',
    dob: '2008-01-01',
    parentName: 'PH',
    parentPhone: '0900000009',
    status: 'INACTIVE',
  },
};

function setup() {
  const created = [];
  const audits = [];
  const updated = [];
  const sessionStore = createSessionStore();
  const usersRepository = {
    findByUsername: async (name) =>
      created.find((u) => u.username.toLowerCase() === name.toLowerCase()),
    findById: async (id) => (id === 77 ? { id: 77, username: 'x' } : undefined),
    create: async (data) => {
      const user = {
        id: created.length + 100,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...data,
      };
      created.push(user);
      return user;
    },
    updatePassword: async (id, hash) => updated.push({ id, hash }),
    list: async (args) => ({
      items: [
        {
          id: 1,
          username: 'a',
          fullName: 'A',
          role: 'ADMIN',
          passwordHash: 'SECRET',
          createdAt: new Date(0),
        },
      ],
      total: 41,
      args,
    }),
  };
  const studentsRepository = {
    findByCode: async (code) => STUDENTS[code.toUpperCase()],
    listClassesByGvcn: async (name) => (name === 'Nguyễn Văn An' ? [{ className: '10A1' }] : []),
  };
  const passwordHasher = { hash: async (plain) => `hash(${plain})` };
  const service = createUsersService({
    usersRepository,
    studentsRepository,
    passwordHasher,
    sessionStore,
    generatePassword: () => 'Tmp12345abcd',
    audit: { record: (actor, action) => audits.push(action) },
  });
  return { service, created, audits, updated, sessionStore };
}

const code = async (promise) => {
  try {
    await promise;
  } catch (error) {
    return error.code;
  }
  return 'KHÔNG-LỖI';
};

test('createByAdmin: đủ 4 role, username STUDENT/PARENT suy ra từ mã học sinh', async () => {
  const { service, audits } = setup();
  const admin = { id: 1 };
  const teacher = await service.createByAdmin(admin, {
    role: 'TEACHER',
    username: 'gv.an',
    fullName: 'Nguyễn Văn An',
    password: 'Abcdef12',
  });
  assert.deepEqual(teacher.managedClasses, ['10A1']);
  const noClass = await service.createByAdmin(admin, {
    role: 'TEACHER',
    username: 'gv.moi',
    fullName: 'Người Mới',
    password: 'Abcdef12',
  });
  assert.deepEqual(noClass.managedClasses, []);
  const second = await service.createByAdmin(admin, {
    role: 'ADMIN',
    username: 'admin2',
    fullName: 'Admin Hai',
    password: 'Abcdef12',
  });
  assert.equal(second.managedClasses, undefined);
  const student = await service.createByAdmin(admin, {
    role: 'STUDENT',
    studentCode: 'hs002',
    password: 'Abcdef12',
  });
  assert.equal(student.username, 'HS002');
  const parent = await service.createByAdmin(admin, {
    role: 'PARENT',
    studentCode: 'HS002',
    password: 'Abcdef12',
    fullName: 'Bố Bảo',
  });
  assert.deepEqual([parent.username, parent.fullName], ['HS002-PH', 'Bố Bảo']);
  const parent2 = await service.createByAdmin(admin, {
    role: 'PARENT',
    studentCode: 'HS001',
    password: 'Abcdef12',
  });
  assert.equal(parent2.fullName, 'Nguyễn Thị Hương');
  assert.equal(audits.filter((a) => a === 'USER_CREATE').length, 6);
});

test('createByAdmin: học sinh không tồn tại/đã nghỉ => NOT_FOUND; trùng username (không phân biệt hoa thường) => CONFLICT', async () => {
  const { service } = setup();
  assert.equal(
    await code(
      service.createByAdmin(
        { id: 1 },
        { role: 'STUDENT', studentCode: 'HS404', password: 'Abcdef12' },
      ),
    ),
    'NOT_FOUND',
  );
  assert.equal(
    await code(
      service.createByAdmin(
        { id: 1 },
        { role: 'PARENT', studentCode: 'HS009', password: 'Abcdef12' },
      ),
    ),
    'NOT_FOUND',
  );
  await service.createByAdmin(
    { id: 1 },
    { role: 'ADMIN', username: 'boss', fullName: 'Boss', password: 'Abcdef12' },
  );
  assert.equal(
    await code(
      service.createByAdmin(
        { id: 1 },
        { role: 'ADMIN', username: 'BOSS', fullName: 'Boss 2', password: 'Abcdef12' },
      ),
    ),
    'CONFLICT',
  );
});

test('list: tính offset, không rò passwordHash, trả meta', async () => {
  const { service } = setup();
  const result = await service.list({ page: 3, limit: 20, sort: 'id', role: 'ADMIN', q: 'a' });
  assert.equal(result.items.length, 1);
  assert.ok(!JSON.stringify(result).includes('SECRET'));
  assert.deepEqual(result.meta, { page: 3, limit: 20, total: 41, totalPages: 3 });
});

test('resetPassword: sinh mật khẩu tạm, chỉ lưu hash, thu hồi mọi phiên; user không tồn tại => NOT_FOUND', async () => {
  const { service, updated, sessionStore, audits } = setup();
  const before = Date.now() - 5;
  const result = await service.resetPassword({ id: 1 }, 77);
  assert.deepEqual(result, { userId: 77, username: 'x', temporaryPassword: 'Tmp12345abcd' });
  assert.deepEqual(updated, [{ id: 77, hash: 'hash(Tmp12345abcd)' }]);
  assert.equal(sessionStore.isRevoked({ sid: 'old', userId: 77, issuedAtMs: before }), true);
  assert.deepEqual(audits, ['USER_PASSWORD_RESET']);
  assert.equal(await code(service.resetPassword({ id: 1 }, 404)), 'NOT_FOUND');
});
