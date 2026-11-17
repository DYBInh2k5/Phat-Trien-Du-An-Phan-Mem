import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_PROVISIONED_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  ROLES,
  SELF_REGISTER_ROLES,
  hasPermission,
} from '../../src/common/auth/permissions.js';
import { can } from '../../src/common/middleware/can.js';

// Ma trận kỳ vọng viết tay, độc lập với PERMISSIONS: nếu ai đó sửa quyền, test này báo ngay.
const EXPECTED = {
  'user:manage': ['ADMIN'],
  'grade:read': ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  'grade:write': ['ADMIN', 'TEACHER'],
  'grade:delete': ['ADMIN', 'TEACHER'],
  'grade:restore': ['ADMIN'],
  'grade:lock': ['ADMIN', 'TEACHER'],
  'grade:unlock': ['ADMIN'],
  'conduct:read': ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  'class:manage': ['ADMIN'],
};

test('ma trận quyền khớp kỳ vọng cho từng role', () => {
  assert.deepEqual(Object.keys(PERMISSIONS).sort(), Object.keys(EXPECTED).sort());
  for (const [permission, allowed] of Object.entries(EXPECTED)) {
    for (const role of ALL_ROLES) {
      assert.equal(
        hasPermission(role, permission),
        allowed.includes(role),
        `${role} ${permission}`,
      );
    }
  }
});

test('role lạ không có quyền nào; permission không tồn tại thì ném lỗi', () => {
  assert.equal(hasPermission('HACKER', 'grade:read'), false);
  assert.throws(() => hasPermission('ADMIN', 'grade:fly'), /Permission không tồn tại/);
});

test('quy tắc cấp tài khoản: không ai tự đăng ký, mọi role do Admin cấp', () => {
  assert.deepEqual([...SELF_REGISTER_ROLES], []);
  assert.deepEqual([...ADMIN_PROVISIONED_ROLES].sort(), [...ALL_ROLES].sort());
});

test('hằng quyền bị đóng băng (không sửa được lúc chạy)', () => {
  assert.throws(() => {
    'use strict';
    PERMISSIONS['grade:write'].push('STUDENT');
  }, TypeError);
  assert.equal(Object.isFrozen(ROLES), true);
});

test('can(): gõ sai tên permission là lỗi ngay lúc khởi động', () => {
  assert.throws(() => can('grade:khong-co'), /Permission không tồn tại/);
});

test('can(): cho qua / chặn / chặn khi chưa đăng nhập', () => {
  const run = (req) => {
    let received;
    can('grade:write')(req, {}, (error) => {
      received = error;
    });
    return received;
  };
  assert.equal(run({ user: { role: 'TEACHER' } }), undefined);
  assert.equal(run({ user: { role: 'STUDENT' } }).code, 'FORBIDDEN');
  assert.equal(run({}).code, 'FORBIDDEN');
});
