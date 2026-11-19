import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessStudent, canManageClass } from '../../src/common/auth/access-policy.js';
import {
  linkedStudentCode,
  normalizeCode,
  normalizeName,
  normalizePhone,
  parentUsername,
  studentUsername,
} from '../../src/common/auth/account-links.js';

const student = { studentCode: 'HS001', gvcnName: 'Nguyễn Văn An' };
const user = (role, username, fullName = 'Ai Đó') => ({ role, username, fullName });

test('canAccessStudent: ma trận role x quan hệ', () => {
  const cases = [
    ['ADMIN xem được mọi học sinh', user('ADMIN', 'admin'), student, true],
    ['TEACHER là GVCN', user('TEACHER', 'gv.an', 'Nguyễn Văn An'), student, true],
    [
      'TEACHER GVCN lệch hoa thường/khoảng trắng',
      user('TEACHER', 'gv.an', '  nguyễn   văn an '),
      student,
      true,
    ],
    ['TEACHER lớp khác', user('TEACHER', 'gv.mai', 'Lê Thị Mai'), student, false],
    [
      'TEACHER khi lớp chưa có GVCN',
      user('TEACHER', 'gv.an', 'Nguyễn Văn An'),
      { ...student, gvcnName: null },
      false,
    ],
    ['STUDENT chính mình', user('STUDENT', 'HS001'), student, true],
    ['STUDENT username viết thường', user('STUDENT', 'hs001'), student, true],
    ['STUDENT học sinh khác', user('STUDENT', 'HS002'), student, false],
    ['PARENT con mình', user('PARENT', 'HS001-PH'), student, true],
    ['PARENT con người khác', user('PARENT', 'HS002-PH'), student, false],
    ['STUDENT không dùng username phụ huynh', user('STUDENT', 'HS001-PH'), student, false],
    ['PARENT không dùng username học sinh', user('PARENT', 'HS001'), student, false],
    ['role lạ', user('HACKER', 'HS001'), student, false],
  ];
  for (const [name, actor, target, expected] of cases) {
    assert.equal(canAccessStudent(actor, target), expected, name);
  }
});

test('canManageClass: chỉ Admin hoặc GVCN', () => {
  const klass = { gvcnName: 'Nguyễn Văn An' };
  assert.equal(canManageClass(user('ADMIN', 'a'), klass), true);
  assert.equal(canManageClass(user('TEACHER', 'x', 'Nguyễn Văn An'), klass), true);
  assert.equal(canManageClass(user('TEACHER', 'x', 'Người Khác'), klass), false);
  assert.equal(canManageClass(user('TEACHER', 'x', 'Nguyễn Văn An'), { gvcnName: null }), false);
  assert.equal(canManageClass(user('STUDENT', 'HS001', 'Nguyễn Văn An'), klass), false);
  assert.equal(canManageClass(user('PARENT', 'HS001-PH', 'Nguyễn Văn An'), klass), false);
});

test('account-links: chuẩn hóa mã, tên, SĐT và quy ước username', () => {
  assert.equal(normalizeCode('  hs001 '), 'HS001');
  assert.equal(studentUsername('hs001'), 'HS001');
  assert.equal(parentUsername('hs001'), 'HS001-PH');
  assert.equal(normalizeName('  Nguyễn   Văn  AN '), 'nguyễn văn an');
  assert.equal(normalizeName(null), '');
  assert.equal(normalizePhone('0907 654-321'), '0907654321');
  assert.equal(normalizePhone('(+84) 907.654.321'), '84907654321');
  assert.equal(normalizePhone(undefined), '');
});

test('normalizeName: chuẩn hóa Unicode (NFD vs NFC cho cùng một tên)', () => {
  const nfd = 'Nguyễn Văn An'.normalize('NFD');
  assert.equal(normalizeName(nfd), normalizeName('Nguyễn Văn An'.normalize('NFC')));
});

test('linkedStudentCode: suy ra mã học sinh theo role', () => {
  assert.equal(linkedStudentCode({ role: 'STUDENT', username: 'hs001' }), 'HS001');
  assert.equal(linkedStudentCode({ role: 'PARENT', username: 'HS001-PH' }), 'HS001');
  assert.equal(linkedStudentCode({ role: 'PARENT', username: 'phu.huynh.x' }), null);
  assert.equal(linkedStudentCode({ role: 'TEACHER', username: 'gv.an' }), null);
  assert.equal(linkedStudentCode({ role: 'ADMIN', username: 'admin' }), null);
});
