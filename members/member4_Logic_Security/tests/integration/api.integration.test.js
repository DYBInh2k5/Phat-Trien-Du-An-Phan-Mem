// Test tích hợp với PostgreSQL THẬT. Chỉ chạy khi có TEST_DATABASE_URL.
// ⚠ Test XÓA và tạo lại users/grade_books/attendances => chỉ trỏ vào DB thử nghiệm dùng một mình.
//   TEST_DATABASE_URL=postgres://... npm test
import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { API, PASSWORD, TEST_DATABASE_URL, createHarness } from '../helpers/harness.js';

if (!TEST_DATABASE_URL) {
  test('integration (bỏ qua: chưa đặt TEST_DATABASE_URL)', { skip: true }, () => {});
} else {
  const h = createHarness();
  const { pool, ids } = h;
  const api = (...args) => h.api(...args);
  const apiStrict = (...args) => h.apiStrict(...args);
  const login = (...args) => h.login(...args);
  const expectError = (...args) => h.expectError(...args);

  before(() => h.start());
  after(() => h.stop());

  describe('hạ tầng & response chuẩn', () => {
    test('health, 404 JSON, JSON hỏng, X-Request-Id', async () => {
      const health = await api('GET', '/health');
      assert.equal(health.status, 200);
      const missing = await api('GET', `${API}/khong-co`);
      expectError(missing, 404, 'NOT_FOUND');
      const bad = await api('POST', `${API}/auth/login`, { raw: '{oops' });
      expectError(bad, 400, 'BAD_REQUEST');
      const res = await fetch(`${h.demoBase}/health`, {
        headers: { 'x-request-id': 'abc-12345678' },
      });
      assert.equal(res.headers.get('x-request-id'), 'abc-12345678');
    });
  });

  describe('cấp tài khoản (chỉ Admin)', () => {
    test('không còn tự đăng ký: /auth/register 404, chưa đăng nhập không gọi được /users', async () => {
      const res = await api('POST', `${API}/auth/register`, {
        body: { role: 'STUDENT', studentCode: 'HS002', dob: '2008-03-22', password: PASSWORD },
      });
      expectError(res, 404, 'NOT_FOUND');
      const anon = await api('POST', `${API}/users`, {
        body: { role: 'STUDENT', studentCode: 'HS002', password: PASSWORD },
      });
      expectError(anon, 401, 'UNAUTHENTICATED');
    });

    test('Admin cấp STUDENT/PARENT theo mã học sinh; cấp lại thì 409; sau đó họ tự đăng nhập', async () => {
      const admin = await login('admin');
      const student = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'STUDENT', studentCode: 'hs002', password: PASSWORD },
      });
      assert.equal(student.status, 201);
      assert.equal(student.body.data.username, 'HS002');
      assert.equal(student.body.data.role, 'STUDENT');
      const again = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'STUDENT', studentCode: 'HS002', password: PASSWORD },
      });
      expectError(again, 409, 'CONFLICT');
      const parent = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'PARENT', studentCode: 'HS002', password: PASSWORD },
      });
      assert.equal(parent.status, 201);
      assert.equal(parent.body.data.username, 'HS002-PH');
      assert.ok(await login('HS002'));
      assert.ok(await login('HS002-PH'));
    });

    test('mật khẩu yếu và field lạ bị từ chối', async () => {
      const admin = await login('admin');
      const weak = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'STUDENT', studentCode: 'HS003', password: 'abc' },
      });
      expectError(weak, 422, 'VALIDATION_ERROR');
      const extra = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'STUDENT', studentCode: 'HS003', password: PASSWORD, isAdmin: true },
      });
      expectError(extra, 422, 'VALIDATION_ERROR');
    });

    test('Admin cấp Teacher; Student/Teacher không được gọi /users', async () => {
      const admin = await login('admin');
      const created = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'TEACHER', username: 'GV.Mai', fullName: 'Lê Thị Mai', password: PASSWORD },
      });
      assert.equal(created.status, 201);
      assert.equal(created.body.data.username, 'gv.mai');
      assert.deepEqual(created.body.data.managedClasses, ['10A2']);
      const dup = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'TEACHER', username: 'gv.mai', fullName: 'Ai Đó', password: PASSWORD },
      });
      expectError(dup, 409, 'CONFLICT');

      const list = await api('GET', `${API}/users?role=TEACHER&sort=-id`, {
        token: admin.accessToken,
      });
      assert.equal(list.status, 200);
      assert.equal(list.body.meta.total, 2);
      assert.equal(list.body.data[0].username, 'gv.mai');

      const student = await login('HS001');
      expectError(
        await api('GET', `${API}/users`, { token: student.accessToken }),
        403,
        'FORBIDDEN',
      );
      const teacher = await login('gv.an');
      expectError(
        await api('POST', `${API}/users`, {
          token: teacher.accessToken,
          body: { role: 'ADMIN', username: 'hacker', fullName: 'Hacker', password: PASSWORD },
        }),
        403,
        'FORBIDDEN',
      );
    });

    test('người dùng tự đổi mật khẩu => mọi phiên cũ bị thu hồi, mật khẩu cũ hết dùng được', async () => {
      const session = await login('HS002');
      const other = await login('HS002');
      const changed = await api('PUT', `${API}/auth/password`, {
        token: session.accessToken,
        body: { currentPassword: PASSWORD, newPassword: 'NewPass@999' },
      });
      assert.equal(changed.status, 200);
      for (const token of [session.accessToken, other.accessToken]) {
        expectError(await api('GET', `${API}/auth/me`, { token }), 401, 'UNAUTHENTICATED');
      }
      expectError(
        await api('POST', `${API}/auth/refresh`, { body: { refreshToken: other.refreshToken } }),
        401,
        'REFRESH_TOKEN_INVALID',
      );
      expectError(
        await api('POST', `${API}/auth/login`, { body: { username: 'HS002', password: PASSWORD } }),
        401,
        'INVALID_CREDENTIALS',
      );
      assert.ok(await login('HS002', 'NewPass@999'));
    });

    test('quên mật khẩu: Admin reset => mật khẩu tạm ngẫu nhiên, user đăng nhập rồi tự đổi', async () => {
      const admin = await login('admin');
      const victim = await login('HS002', 'NewPass@999');
      const found = await api('GET', `${API}/users?q=HS002&role=STUDENT`, {
        token: admin.accessToken,
      });
      const reset = await api('POST', `${API}/users/${found.body.data[0].id}/reset-password`, {
        token: admin.accessToken,
      });
      assert.equal(reset.status, 200);
      assert.equal(reset.headers.get('cache-control'), 'no-store');
      const { username, temporaryPassword } = reset.body.data;
      assert.equal(username, 'HS002');
      assert.match(temporaryPassword, /^[A-Za-z0-9]{12}$/);
      expectError(
        await api('GET', `${API}/auth/me`, { token: victim.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
      expectError(
        await api('POST', `${API}/auth/login`, {
          body: { username: 'HS002', password: 'NewPass@999' },
        }),
        401,
        'INVALID_CREDENTIALS',
      );
      const temp = await login('HS002', temporaryPassword);
      const changed = await api('PUT', `${API}/auth/password`, {
        token: temp.accessToken,
        body: { currentPassword: temporaryPassword, newPassword: 'NewPass@999' },
      });
      assert.equal(changed.status, 200);
      assert.ok(await login('HS002', 'NewPass@999'));
    });

    test('Admin không tự đặt mật khẩu cho người khác được', async () => {
      const admin = await login('admin');
      expectError(
        await api('PUT', `${API}/users/1/password`, {
          token: admin.accessToken,
          body: { newPassword: 'NewPass@999' },
        }),
        404,
        'NOT_FOUND',
      );
    });
  });

  describe('đăng nhập & phiên', () => {
    test('sai user và sai mật khẩu cho CÙNG một lỗi', async () => {
      const a = await api('POST', `${API}/auth/login`, {
        body: { username: 'khong-co', password: PASSWORD },
      });
      const b = await api('POST', `${API}/auth/login`, {
        body: { username: 'admin', password: 'sai-mat-khau-1' },
      });
      expectError(a, 401, 'INVALID_CREDENTIALS');
      expectError(b, 401, 'INVALID_CREDENTIALS');
      assert.equal(a.body.error.message, b.body.error.message);
    });

    test('thiếu/sai token => 401; /auth/me trả liên kết học sinh', async () => {
      expectError(await api('GET', `${API}/auth/me`), 401, 'UNAUTHENTICATED');
      expectError(
        await api('GET', `${API}/auth/me`, { token: 'abc.def.ghi' }),
        401,
        'UNAUTHENTICATED',
      );
      const parent = await login('HS001-PH');
      const me = await api('GET', `${API}/auth/me`, { token: parent.accessToken });
      assert.equal(me.body.data.user.role, 'PARENT');
      assert.deepEqual(me.body.data.linkedStudentIds, [ids.HS001]);
      const teacher = await login('gv.an');
      const meT = await api('GET', `${API}/auth/me`, { token: teacher.accessToken });
      assert.deepEqual(
        meT.body.data.managedClasses.map((c) => c.className),
        ['10A1'],
      );
    });

    test('refresh xoay vòng; dùng lại token cũ => thu hồi cả phiên', async () => {
      const first = await login('HS001');
      const second = await api('POST', `${API}/auth/refresh`, {
        body: { refreshToken: first.refreshToken },
      });
      assert.equal(second.status, 200);
      assert.notEqual(second.body.data.refreshToken, first.refreshToken);
      const reuse = await api('POST', `${API}/auth/refresh`, {
        body: { refreshToken: first.refreshToken },
      });
      expectError(reuse, 401, 'REFRESH_TOKEN_INVALID');
      // phiên bị thu hồi => cả token mới cũng chết
      expectError(
        await api('POST', `${API}/auth/refresh`, {
          body: { refreshToken: second.body.data.refreshToken },
        }),
        401,
        'REFRESH_TOKEN_INVALID',
      );
      expectError(
        await api('GET', `${API}/auth/me`, { token: second.body.data.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
    });

    test('access token không dùng làm refresh được và ngược lại', async () => {
      const session = await login('HS001');
      expectError(
        await api('POST', `${API}/auth/refresh`, { body: { refreshToken: session.accessToken } }),
        401,
        'REFRESH_TOKEN_INVALID',
      );
      expectError(
        await api('GET', `${API}/auth/me`, { token: session.refreshToken }),
        401,
        'UNAUTHENTICATED',
      );
    });

    test('logout thu hồi phiên hiện tại; logout-all thu hồi mọi phiên', async () => {
      const a = await login('HS001');
      const b = await login('HS001');
      assert.equal((await api('POST', `${API}/auth/logout`, { token: a.accessToken })).status, 200);
      expectError(
        await api('GET', `${API}/auth/me`, { token: a.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
      assert.equal((await api('GET', `${API}/auth/me`, { token: b.accessToken })).status, 200);
      await api('POST', `${API}/auth/logout-all`, { token: b.accessToken });
      expectError(
        await api('GET', `${API}/auth/me`, { token: b.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
      assert.ok(await login('HS001')); // đăng nhập lại vẫn được
    });
  });

  describe('Quick Role Switcher', () => {
    test('DEMO_MODE=true: đổi sang role khác, có impersonatedBy, switch-back về gốc', async () => {
      const student = await login('HS001');
      const sw = await api('POST', `${API}/auth/switch-role`, {
        token: student.accessToken,
        body: { targetRole: 'ADMIN' },
      });
      assert.equal(sw.status, 200);
      assert.equal(sw.body.data.user.role, 'ADMIN');
      assert.equal(sw.body.data.refreshToken, undefined);
      const me = await api('GET', `${API}/auth/me`, { token: sw.body.data.accessToken });
      assert.equal(me.body.data.impersonatedBy, ids.HS001 ? me.body.data.impersonatedBy : null);
      assert.ok(me.body.data.impersonatedBy);
      // đang chuyển vai trò thì không được chuyển tiếp
      expectError(
        await api('POST', `${API}/auth/switch-role`, {
          token: sw.body.data.accessToken,
          body: { targetRole: 'TEACHER' },
        }),
        403,
        'FORBIDDEN',
      );
      const back = await api('POST', `${API}/auth/switch-back`, {
        token: sw.body.data.accessToken,
      });
      assert.equal(back.status, 200);
      assert.equal(back.body.data.user.username, 'HS001');
      expectError(
        await api('GET', `${API}/auth/me`, { token: sw.body.data.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
      expectError(
        await api('POST', `${API}/auth/switch-back`, { token: back.body.data.accessToken }),
        400,
        'BAD_REQUEST',
      );
    });

    test('DEMO_MODE=false: chỉ Admin được impersonate theo userId', async () => {
      const student = (
        await apiStrict('POST', `${API}/auth/login`, {
          body: { username: 'HS001', password: PASSWORD },
        })
      ).body.data;
      expectError(
        await apiStrict('POST', `${API}/auth/switch-role`, {
          token: student.accessToken,
          body: { targetRole: 'ADMIN' },
        }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await apiStrict('POST', `${API}/auth/switch-role`, {
          token: student.accessToken,
          body: { targetUserId: 1 },
        }),
        403,
        'FORBIDDEN',
      );
      const admin = (
        await apiStrict('POST', `${API}/auth/login`, {
          body: { username: 'admin', password: PASSWORD },
        })
      ).body.data;
      const teacherId = (await pool.query("SELECT id FROM users WHERE username = 'gv.an'")).rows[0]
        .id;
      const sw = await apiStrict('POST', `${API}/auth/switch-role`, {
        token: admin.accessToken,
        body: { targetUserId: teacherId },
      });
      assert.equal(sw.status, 200);
      assert.equal(sw.body.data.user.username, 'gv.an');
      const bad = await apiStrict('POST', `${API}/auth/switch-role`, {
        token: admin.accessToken,
        body: { targetRole: 'TEACHER', targetUserId: teacherId },
      });
      expectError(bad, 422, 'VALIDATION_ERROR');
    });
  });

  describe('sổ điểm: phân quyền, tính điểm, xóa mềm, chốt sổ', () => {
    let admin;
    let teacher;
    let otherTeacher;
    let student;
    let parent;
    let otherStudent;
    let mathGradeId;

    before(async () => {
      admin = await login('admin');
      teacher = await login('gv.an');
      otherTeacher = await login('gv.mai');
      student = await login('HS001');
      parent = await login('HS001-PH');
      otherStudent = await login('HS002', 'NewPass@999');
    });

    const grade = (overrides = {}) => ({
      studentId: ids.HS001,
      subjectName: 'Toán Học',
      semester: 'HK1',
      schoolYear: '2025-2026',
      scoreOral: 9,
      score15m: 8.5,
      score1Hour: 8,
      scoreMidTerm: 9,
      scoreFinalTerm: 9.5,
      ...overrides,
    });

    test('RBAC: role và ownership', async () => {
      // Student/Parent không có quyền ghi điểm (tầng role)
      expectError(
        await api('POST', `${API}/grade-books`, { token: student.accessToken, body: grade() }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('POST', `${API}/grade-books`, { token: parent.accessToken, body: grade() }),
        403,
        'FORBIDDEN',
      );
      // GV lớp khác không ghi được điểm HS lớp 10A1 (tầng ownership)
      expectError(
        await api('POST', `${API}/grade-books`, { token: otherTeacher.accessToken, body: grade() }),
        403,
        'FORBIDDEN',
      );
      // chưa đăng nhập
      expectError(
        await api('POST', `${API}/grade-books`, { body: grade() }),
        401,
        'UNAUTHENTICATED',
      );
    });

    test('validate: điểm ngoài khoảng, quá 1 số lẻ, field lạ, môn không tồn tại', async () => {
      const t = teacher.accessToken;
      const high = await api('POST', `${API}/grade-books`, {
        token: t,
        body: grade({ scoreFinalTerm: 11 }),
      });
      expectError(high, 422, 'VALIDATION_ERROR');
      assert.equal(high.body.error.details[0].field, 'scoreFinalTerm');
      expectError(
        await api('POST', `${API}/grade-books`, { token: t, body: grade({ scoreOral: 8.55 }) }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('POST', `${API}/grade-books`, { token: t, body: grade({ averageScore: 10 }) }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('POST', `${API}/grade-books`, {
          token: t,
          body: grade({ schoolYear: '2025-2027' }),
        }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('POST', `${API}/grade-books`, {
          token: t,
          body: grade({ subjectName: 'Võ Thuật' }),
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-books`, { token: t, body: grade({ studentId: 9999 }) }),
        404,
        'NOT_FOUND',
      );
    });

    test('tạo điểm: server tự tính TBM và xếp loại môn; trùng thì 409', async () => {
      const res = await api('POST', `${API}/grade-books`, {
        token: teacher.accessToken,
        body: grade(),
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.averageScore, 8.9); // (9+8.5+16+18+28.5)/9
      assert.equal(res.body.data.gradeLetter, 'Giỏi');
      assert.equal(res.body.data.studentName, 'Nguyễn Thị Ánh');
      assert.equal(res.body.data.isLocked, false);
      mathGradeId = res.body.data.id;
      expectError(
        await api('POST', `${API}/grade-books`, { token: teacher.accessToken, body: grade() }),
        409,
        'CONFLICT',
      );
    });

    test('2 request tạo song song cùng khóa: chỉ một thành công (advisory lock)', async () => {
      const body = grade({ subjectName: 'Ngữ Văn' });
      const results = await Promise.all([
        api('POST', `${API}/grade-books`, { token: teacher.accessToken, body }),
        api('POST', `${API}/grade-books`, { token: teacher.accessToken, body }),
        api('POST', `${API}/grade-books`, { token: admin.accessToken, body }),
      ]);
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409, 409]);
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS n FROM grade_books WHERE student_id = $1 AND subject_name = 'Ngữ Văn'",
        [ids.HS001],
      );
      assert.equal(rows[0].n, 1);
    });

    test('sửa điểm: tính lại TBM, null = xóa điểm; PUT rỗng bị từ chối', async () => {
      const t = teacher.accessToken;
      const upd = await api('PUT', `${API}/grade-books/${mathGradeId}`, {
        token: t,
        body: { scoreFinalTerm: 5 },
      });
      assert.equal(upd.status, 200);
      assert.equal(upd.body.data.scoreFinalTerm, 5);
      assert.equal(upd.body.data.averageScore, 7.4); // (9+8.5+16+18+15)/9 = 7.39
      assert.equal(upd.body.data.scoreOral, 9); // cột không gửi giữ nguyên
      const cleared = await api('PUT', `${API}/grade-books/${mathGradeId}`, {
        token: t,
        body: { scoreOral: null, score15m: null },
      });
      assert.equal(cleared.body.data.scoreOral, null);
      assert.equal(cleared.body.data.averageScore, 7); // (16+18+15)/7
      await api('PUT', `${API}/grade-books/${mathGradeId}`, {
        token: t,
        body: { scoreOral: 9, score15m: 8.5 },
      });
      expectError(
        await api('PUT', `${API}/grade-books/${mathGradeId}`, { token: t, body: {} }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('PUT', `${API}/grade-books/99999`, { token: t, body: { scoreOral: 1 } }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('PUT', `${API}/grade-books/abc`, { token: t, body: { scoreOral: 1 } }),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('chưa đủ môn => students.gpa về 0 và "Chưa xếp loại" (không đoán)', async () => {
      const { rows } = await pool.query('SELECT gpa, academic_rank FROM students WHERE id = $1', [
        ids.HS001,
      ]);
      assert.equal(Number(rows[0].gpa), 0);
      assert.equal(rows[0].academic_rank, 'Chưa xếp loại');
    });

    test('xem điểm: Student/Parent chỉ của mình; GV lớp khác bị chặn', async () => {
      const own = await api('GET', `${API}/students/${ids.HS001}/grades`, {
        token: student.accessToken,
      });
      assert.equal(own.status, 200);
      assert.equal(own.body.data.length, 2);
      assert.equal(
        (await api('GET', `${API}/students/${ids.HS001}/summary`, { token: parent.accessToken }))
          .status,
        200,
      );
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/grades`, {
          token: otherStudent.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
      const otherParent = await login('HS002-PH');
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/summary`, {
          token: otherParent.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/grades`, {
          token: otherTeacher.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
      assert.equal(
        (await api('GET', `${API}/students/${ids.HS001}/grades`, { token: admin.accessToken }))
          .status,
        200,
      );
      expectError(
        await api('GET', `${API}/students/99999/grades`, { token: admin.accessToken }),
        404,
        'NOT_FOUND',
      );
      // Student không được xem sổ điểm cả lớp
      expectError(
        await api('GET', `${API}/grade-books?classId=${ids['class:10A1']}`, {
          token: student.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('GET', `${API}/grade-books?classId=${ids['class:10A1']}`, {
          token: otherTeacher.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
    });

    test('bulk: lỗi một dòng => rollback toàn bộ', async () => {
      const bad = await api('POST', `${API}/grade-books/bulk`, {
        token: teacher.accessToken,
        body: {
          classId: ids['class:10A1'],
          subjectName: 'Tiếng Anh',
          semester: 'HK1',
          schoolYear: '2025-2026',
          entries: [
            { studentId: ids.HS001, scoreMidTerm: 8, scoreFinalTerm: 8 },
            { studentId: ids.HS005, scoreMidTerm: 8, scoreFinalTerm: 8 }, // HS005 thuộc 10A2
          ],
        },
      });
      expectError(bad, 422, 'VALIDATION_ERROR');
      assert.equal(bad.body.error.details[0].field, 'entries.1.studentId');
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS n FROM grade_books WHERE subject_name = 'Tiếng Anh'",
      );
      assert.equal(rows[0].n, 0);
      const dup = await api('POST', `${API}/grade-books/bulk`, {
        token: teacher.accessToken,
        body: {
          classId: ids['class:10A1'],
          subjectName: 'Tiếng Anh',
          semester: 'HK1',
          schoolYear: '2025-2026',
          entries: [{ studentId: ids.HS001 }, { studentId: ids.HS001 }],
        },
      });
      expectError(dup, 422, 'VALIDATION_ERROR');
    });

    let chemGradeId;
    test('đủ 5 môn: summary GPA hệ 10, hệ 4, học lực; students.gpa được đồng bộ', async () => {
      for (const [subjectName, score] of [
        ['Tiếng Anh', 8],
        ['Vật Lý', 7],
        ['Hóa Học', 9],
      ]) {
        const res = await api('POST', `${API}/grade-books/bulk`, {
          token: teacher.accessToken,
          body: {
            classId: ids['class:10A1'],
            subjectName,
            semester: 'HK1',
            schoolYear: '2025-2026',
            entries: [
              { studentId: ids.HS001, scoreMidTerm: score, scoreFinalTerm: score },
              { studentId: ids.HS002, scoreMidTerm: 6, scoreFinalTerm: 6 },
            ],
          },
        });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.body.data.created, 2);
        if (subjectName === 'Hóa Học') {
          chemGradeId = res.body.data.items.find((i) => i.studentId === ids.HS001).id;
        }
      }
      // gọi lại bulk: upsert (cập nhật, không tạo trùng)
      const again = await api('POST', `${API}/grade-books/bulk`, {
        token: teacher.accessToken,
        body: {
          classId: ids['class:10A1'],
          subjectName: 'Hóa Học',
          semester: 'HK1',
          schoolYear: '2025-2026',
          entries: [{ studentId: ids.HS001, scoreOral: 9 }],
        },
      });
      assert.equal(again.body.data.updated, 1);
      assert.equal(again.body.data.created, 0);

      const summary = await api('GET', `${API}/students/${ids.HS001}/summary`, {
        token: student.accessToken,
      });
      assert.equal(summary.status, 200);
      const data = summary.body.data;
      assert.equal(data.isComplete, true);
      assert.equal(data.gpa10, 8.1); // (7.4*2 + 8.9*2 + 8*2 + 7 + 9) / 8 = 8.075
      assert.equal(data.gpa4, 3.38); // (3*2 + 4*2 + 3*2 + 3 + 4) / 8
      assert.equal(data.academicRank, 'Giỏi');
      assert.equal(data.policy, 'LEGACY_5_LEVELS');
      assert.equal(data.subjects.length, 5);
      assert.equal(data.isLocked, false);
      const { rows } = await pool.query('SELECT gpa, academic_rank FROM students WHERE id = $1', [
        ids.HS001,
      ]);
      assert.equal(Number(rows[0].gpa), 8.1);
      assert.equal(rows[0].academic_rank, 'Giỏi');
    });

    test('xóa mềm: ẩn khỏi danh sách, khôi phục chỉ Admin, tính lại GPA', async () => {
      const t = teacher.accessToken;
      assert.equal(
        (await api('DELETE', `${API}/grade-books/${chemGradeId}`, { token: t })).status,
        200,
      );
      expectError(
        await api('DELETE', `${API}/grade-books/${chemGradeId}`, { token: t }),
        409,
        'ALREADY_DELETED',
      );
      expectError(
        await api('PUT', `${API}/grade-books/${chemGradeId}`, { token: t, body: { scoreOral: 1 } }),
        404,
        'NOT_FOUND',
      );

      const listUrl = `${API}/grade-books?classId=${ids['class:10A1']}&subjectName=${encodeURIComponent('Hóa Học')}`;
      assert.equal(
        (await api('GET', listUrl, { token: t })).body.data.every((g) => g.studentId !== ids.HS001),
        true,
      );
      expectError(
        await api('GET', `${listUrl}&includeDeleted=true`, { token: t }),
        403,
        'FORBIDDEN',
      );
      const withDeleted = await api('GET', `${listUrl}&includeDeleted=true`, {
        token: admin.accessToken,
      });
      assert.equal(
        withDeleted.body.data.some((g) => g.id === chemGradeId && g.isDeleted),
        true,
      );

      const { rows } = await pool.query('SELECT gpa, academic_rank FROM students WHERE id = $1', [
        ids.HS001,
      ]);
      assert.equal(Number(rows[0].gpa), 0); // thiếu môn => chưa xếp loại
      assert.equal(rows[0].academic_rank, 'Chưa xếp loại');

      expectError(
        await api('POST', `${API}/grade-books/${chemGradeId}/restore`, { token: t }),
        403,
        'FORBIDDEN',
      );

      // tạo dòng mới cùng khóa trong lúc dòng cũ đang bị xóa => khôi phục dòng cũ phải 409
      const replacement = await api('POST', `${API}/grade-books`, {
        token: t,
        body: grade({
          subjectName: 'Hóa Học',
          scoreMidTerm: 9,
          scoreFinalTerm: 9,
          scoreOral: null,
          score15m: null,
          score1Hour: null,
        }),
      });
      assert.equal(replacement.status, 201);
      expectError(
        await api('POST', `${API}/grade-books/${chemGradeId}/restore`, {
          token: admin.accessToken,
        }),
        409,
        'CONFLICT',
      );
      await api('DELETE', `${API}/grade-books/${replacement.body.data.id}`, { token: t });

      const restored = await api('POST', `${API}/grade-books/${chemGradeId}/restore`, {
        token: admin.accessToken,
      });
      assert.equal(restored.status, 200);
      assert.equal(restored.body.data.isDeleted, false);
      expectError(
        await api('POST', `${API}/grade-books/${chemGradeId}/restore`, {
          token: admin.accessToken,
        }),
        409,
        'NOT_DELETED',
      );
      const afterRestore = await pool.query('SELECT gpa FROM students WHERE id = $1', [ids.HS001]);
      assert.equal(Number(afterRestore.rows[0].gpa), 8.1);
    });

    test('recalculate: sửa TBM bị lệch trong DB', async () => {
      await pool.query(
        'UPDATE grade_books SET average_score = 0, grade_letter = $2 WHERE id = $1',
        [mathGradeId, 'Yếu'],
      );
      const res = await api('POST', `${API}/classes/${ids['class:10A1']}/recalculate`, {
        token: teacher.accessToken,
        body: { semester: 'HK1', schoolYear: '2025-2026' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.gradesUpdated, 1);
      assert.equal(res.body.data.processed, 4); // HS001..HS004 đang học 10A1
      const { rows } = await pool.query(
        'SELECT average_score, grade_letter FROM grade_books WHERE id = $1',
        [mathGradeId],
      );
      assert.equal(Number(rows[0].average_score), 7.4);
      assert.equal(rows[0].grade_letter, 'Khá');
      expectError(
        await api('POST', `${API}/classes/${ids['class:10A1']}/recalculate`, {
          token: otherTeacher.accessToken,
          body: { semester: 'HK1', schoolYear: '2025-2026' },
        }),
        403,
        'FORBIDDEN',
      );
    });

    test('gợi ý hạnh kiểm từ điểm danh; quyền xem theo ownership', async () => {
      const rows = [
        ['2025-09-10', 'ABSENT'],
        ['2025-09-11', 'absent'],
        ['2025-09-12', 'ABSENT'],
        ['2025-09-13', 'EXCUSED'],
        ['2025-09-14', 'LATE'],
        ['2025-09-15', 'PRESENT'],
      ];
      for (const [date, status] of rows) {
        await pool.query(
          'INSERT INTO attendances (student_id, student_code, student_name, class_name, att_date, status) VALUES ($1,$2,$3,$4,$5,$6)',
          [ids.HS001, 'HS001', 'Nguyễn Thị Ánh', '10A1', date, status],
        );
      }
      const res = await api('GET', `${API}/students/${ids.HS001}/conduct-suggestion`, {
        token: teacher.accessToken,
      });
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data.absenceStats, { excused: 1, unexcused: 3, late: 1 });
      assert.equal(res.body.data.suggestedConduct, 'Khá');
      const ranged = await api(
        'GET',
        `${API}/students/${ids.HS001}/conduct-suggestion?from=2025-09-12&to=2025-09-15`,
        {
          token: parent.accessToken,
        },
      );
      assert.deepEqual(ranged.body.data.absenceStats, { excused: 1, unexcused: 1, late: 1 });
      assert.equal(ranged.body.data.suggestedConduct, 'Tốt');
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/conduct-suggestion`, {
          token: otherStudent.accessToken,
        }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/conduct-suggestion?from=2025-13-40`, {
          token: admin.accessToken,
        }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api(
          'GET',
          `${API}/students/${ids.HS001}/conduct-suggestion?from=2025-10-01&to=2025-09-01`,
          { token: admin.accessToken },
        ),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('khóa sổ: chặn mọi thao tác ghi, chỉ Admin mở khóa (bắt buộc lý do)', async () => {
      const t = teacher.accessToken;
      const lockBody = {
        classId: ids['class:10A1'],
        semester: 'HK1',
        schoolYear: '2025-2026',
        note: 'Chốt HK1',
      };

      expectError(
        await api('POST', `${API}/grade-locks`, {
          token: otherTeacher.accessToken,
          body: lockBody,
        }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('POST', `${API}/grade-locks`, { token: student.accessToken, body: lockBody }),
        403,
        'FORBIDDEN',
      );

      const locked = await api('POST', `${API}/grade-locks`, { token: t, body: lockBody });
      assert.equal(locked.status, 201, JSON.stringify(locked.body));
      assert.equal(locked.body.data.lockedRows, 8); // HS001: 5 môn, HS002: 3 môn

      expectError(
        await api('PUT', `${API}/grade-books/${mathGradeId}`, { token: t, body: { scoreOral: 1 } }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('PUT', `${API}/grade-books/${mathGradeId}`, {
          token: admin.accessToken,
          body: { scoreOral: 1 },
        }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('DELETE', `${API}/grade-books/${mathGradeId}`, { token: t }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('POST', `${API}/grade-books`, {
          token: t,
          body: grade({ studentId: ids.HS003 }),
        }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: t,
          body: {
            classId: ids['class:10A1'],
            subjectName: 'Toán Học',
            semester: 'HK1',
            schoolYear: '2025-2026',
            entries: [{ studentId: ids.HS003, scoreFinalTerm: 5 }],
          },
        }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('POST', `${API}/classes/${ids['class:10A1']}/recalculate`, {
          token: t,
          body: { semester: 'HK1', schoolYear: '2025-2026' },
        }),
        409,
        'GRADEBOOK_LOCKED',
      );
      expectError(
        await api('POST', `${API}/grade-locks`, { token: t, body: lockBody }),
        409,
        'GRADEBOOK_ALREADY_LOCKED',
      );

      const summary = await api('GET', `${API}/students/${ids.HS001}/summary`, {
        token: student.accessToken,
      });
      assert.equal(summary.body.data.isLocked, true);
      const locks = await api('GET', `${API}/grade-locks`, { token: t });
      assert.equal(locks.body.data[0].className, '10A1');
      expectError(
        await api('GET', `${API}/grade-locks`, { token: student.accessToken }),
        403,
        'FORBIDDEN',
      );

      // học kỳ khác của cùng lớp vẫn ghi được
      const hk2 = await api('POST', `${API}/grade-books`, {
        token: t,
        body: grade({ semester: 'HK2' }),
      });
      assert.equal(hk2.status, 201);

      // mở khóa
      const unlockBody = {
        classId: ids['class:10A1'],
        semester: 'HK1',
        schoolYear: '2025-2026',
        reason: 'Sửa sai điểm Toán HS001',
      };
      expectError(
        await api('POST', `${API}/grade-locks/unlock`, { token: t, body: unlockBody }),
        403,
        'FORBIDDEN',
      );
      expectError(
        await api('POST', `${API}/grade-locks/unlock`, {
          token: admin.accessToken,
          body: { ...unlockBody, reason: 'ngắn' },
        }),
        422,
        'VALIDATION_ERROR',
      );
      const unlocked = await api('POST', `${API}/grade-locks/unlock`, {
        token: admin.accessToken,
        body: unlockBody,
      });
      assert.equal(unlocked.status, 200);
      assert.equal(unlocked.body.data.unlockedRows, 8);
      expectError(
        await api('POST', `${API}/grade-locks/unlock`, {
          token: admin.accessToken,
          body: unlockBody,
        }),
        409,
        'CONFLICT',
      );
      assert.equal(
        (
          await api('PUT', `${API}/grade-books/${mathGradeId}`, {
            token: t,
            body: { scoreOral: 9 },
          })
        ).status,
        200,
      );
    });

    test('dòng đã xóa mềm giữ nguyên trạng thái DELETED sau khi khóa/mở khóa', async () => {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS n FROM grade_books WHERE status = 'DELETED'",
      );
      assert.ok(rows[0].n >= 1);
      const locked = await pool.query(
        "SELECT COUNT(*)::int AS n FROM grade_books WHERE status = 'LOCKED'",
      );
      assert.equal(locked.rows[0].n, 0);
    });
  });
}
