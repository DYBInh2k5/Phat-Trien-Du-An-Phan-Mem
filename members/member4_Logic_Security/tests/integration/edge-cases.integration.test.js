// Các nhánh lỗi, bảo mật và ngoại lệ mà api.integration.test.js chưa đi qua. Cần TEST_DATABASE_URL.
import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { API, PASSWORD, TEST_DATABASE_URL, createHarness } from '../helpers/harness.js';

if (!TEST_DATABASE_URL) {
  test('integration (bỏ qua: chưa đặt TEST_DATABASE_URL)', { skip: true }, () => {});
} else {
  const h = createHarness();
  const { pool, ids } = h;
  const api = (...args) => h.api(...args);
  const login = (...args) => h.login(...args);
  const expectError = (...args) => h.expectError(...args);
  const period = { semester: 'HK1', schoolYear: '2025-2026' };

  before(async () => {
    await h.start();
    await h.createUser('gv.mai', 'Lê Thị Mai', 'TEACHER');
    await h.createUser('HS002', 'Trần Văn Bảo', 'STUDENT');
    await h.createUser('HS002-PH', 'Trần Văn Hùng', 'PARENT');
  });
  after(() => h.stop());

  describe('rate limit (bật thật)', () => {
    test('login: vượt 5 lần/phút theo (IP + username) => 429 JSON; user khác không bị ảnh hưởng', async () => {
      const base = await h.listen(h.config({ RATE_LIMIT_ENABLED: 'true' }));
      const attempt = (username) =>
        h.call(base, 'POST', `${API}/auth/login`, {
          body: { username, password: 'sai-mat-khau-1' },
        });
      const statuses = [];
      for (let i = 0; i < 7; i += 1) {
        statuses.push((await attempt('admin')).status);
      }
      assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429, 429]);
      const blocked = await attempt('admin');
      expectError(blocked, 429, 'TOO_MANY_REQUESTS');
      assert.ok(blocked.headers.get('ratelimit') || blocked.headers.get('ratelimit-policy'));
      assert.equal((await attempt('gv.an')).status, 401, 'username khác có bộ đếm riêng');
      const noBody = await h.call(base, 'POST', `${API}/auth/login`);
      expectError(noBody, 422, 'VALIDATION_ERROR'); // thiếu body không làm sập bộ đếm
      // đăng nhập đúng cũng bị chặn khi đã vượt hạn mức của chính cặp (IP, username) đó
      const correct = await h.call(base, 'POST', `${API}/auth/login`, {
        body: { username: 'admin', password: PASSWORD },
      });
      expectError(correct, 429, 'TOO_MANY_REQUESTS');
    });

    test('refresh: giới hạn theo IP', async () => {
      const base = await h.listen(h.config({ RATE_LIMIT_ENABLED: 'true' }));
      const statuses = [];
      for (let i = 0; i < 12; i += 1) {
        statuses.push(
          (
            await h.call(base, 'POST', `${API}/auth/refresh`, {
              body: { refreshToken: 'x'.repeat(30) },
            })
          ).status,
        );
      }
      assert.equal(statuses.filter((s) => s === 429).length, 2);
      assert.equal(
        statuses.slice(0, 10).every((s) => s === 401),
        true,
      );
    });
  });

  describe('phiên & tài khoản bị xóa', () => {
    test('user bị xóa khỏi DB: access token và refresh token đều mất hiệu lực', async () => {
      await h.createUser('tam.thoi', 'Người Tạm', 'TEACHER');
      const session = await login('tam.thoi');
      assert.equal(
        (await api('GET', `${API}/auth/me`, { token: session.accessToken })).status,
        200,
      );
      await pool.query("DELETE FROM users WHERE username = 'tam.thoi'");
      expectError(
        await api('GET', `${API}/auth/me`, { token: session.accessToken }),
        401,
        'UNAUTHENTICATED',
      );
      expectError(
        await api('POST', `${API}/auth/refresh`, { body: { refreshToken: session.refreshToken } }),
        401,
        'REFRESH_TOKEN_INVALID',
      );
    });

    test('đổi role trong DB có hiệu lực ngay với token đang dùng', async () => {
      await h.createUser('thang.chuc', 'Thăng Chức', 'STUDENT');
      const session = await login('thang.chuc');
      expectError(
        await api('GET', `${API}/users`, { token: session.accessToken }),
        403,
        'FORBIDDEN',
      );
      await pool.query("UPDATE users SET role = 'ADMIN' WHERE username = 'thang.chuc'");
      assert.equal((await api('GET', `${API}/users`, { token: session.accessToken })).status, 200);
      await pool.query("UPDATE users SET role = 'STUDENT' WHERE username = 'thang.chuc'");
      expectError(
        await api('GET', `${API}/users`, { token: session.accessToken }),
        403,
        'FORBIDDEN',
      );
    });

    test('username không phân biệt hoa thường khi đăng nhập', async () => {
      assert.equal(
        (
          await api('POST', `${API}/auth/login`, {
            body: { username: 'GV.AN', password: PASSWORD },
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api('POST', `${API}/auth/login`, {
            body: { username: 'hs001', password: PASSWORD },
          })
        ).status,
        200,
      );
    });
  });

  describe('quản lý user (Admin)', () => {
    let admin;
    before(async () => {
      admin = await login('admin');
      for (let i = 1; i <= 5; i += 1) {
        await h.createUser(`bulk.user${i}`, `Người Dùng ${i}`, 'TEACHER');
      }
    });

    test('phân trang, sắp xếp, lọc role, tìm kiếm', async () => {
      const page1 = await api(
        'GET',
        `${API}/users?role=TEACHER&q=bulk.user&limit=2&page=1&sort=username`,
        { token: admin.accessToken },
      );
      assert.equal(page1.status, 200);
      assert.deepEqual(page1.body.meta, { page: 1, limit: 2, total: 5, totalPages: 3 });
      assert.deepEqual(
        page1.body.data.map((u) => u.username),
        ['bulk.user1', 'bulk.user2'],
      );
      const page3 = await api(
        'GET',
        `${API}/users?role=TEACHER&q=bulk.user&limit=2&page=3&sort=-username`,
        { token: admin.accessToken },
      );
      assert.deepEqual(
        page3.body.data.map((u) => u.username),
        ['bulk.user1'],
      );
      const byName = await api('GET', `${API}/users?q=${encodeURIComponent('Người Dùng 3')}`, {
        token: admin.accessToken,
      });
      assert.deepEqual(
        byName.body.data.map((u) => u.username),
        ['bulk.user3'],
      );
      const beyond = await api('GET', `${API}/users?page=99`, { token: admin.accessToken });
      assert.deepEqual(beyond.body.data, []);
    });

    test('tham số xấu bị từ chối: limit quá lớn, sort ngoài whitelist, role lạ, query lạ', async () => {
      for (const query of [
        'limit=101',
        'limit=0',
        'page=0',
        'sort=password',
        'role=GOD',
        'unknown=1',
        'sort=id;drop',
      ]) {
        expectError(
          await api('GET', `${API}/users?${query}`, { token: admin.accessToken }),
          422,
          'VALIDATION_ERROR',
        );
      }
    });

    test('ký tự đặc biệt của LIKE / SQL injection trong q được xử lý như chữ thường', async () => {
      const percent = await api('GET', `${API}/users?q=${encodeURIComponent('%')}`, {
        token: admin.accessToken,
      });
      assert.equal(percent.body.data.length, 0, '% không được khớp mọi thứ');
      const underscore = await api('GET', `${API}/users?q=_`, { token: admin.accessToken });
      assert.equal(underscore.body.data.length, 0);
      const injection = await api(
        'GET',
        `${API}/users?q=${encodeURIComponent("'; DROP TABLE users; --")}`,
        { token: admin.accessToken },
      );
      assert.equal(injection.status, 200);
      assert.equal(injection.body.data.length, 0);
      assert.ok(
        (await pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n > 5,
        'bảng users còn nguyên',
      );
    });

    test('Admin cấp tài khoản STUDENT/PARENT: username suy ra từ mã học sinh', async () => {
      const student = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'STUDENT', studentCode: 'hs003', password: PASSWORD },
      });
      assert.equal(student.status, 201);
      assert.equal(student.body.data.username, 'HS003');
      assert.equal(student.body.data.fullName, 'Lê Thị Cẩm');
      const parent = await api('POST', `${API}/users`, {
        token: admin.accessToken,
        body: { role: 'PARENT', studentCode: 'HS003', password: PASSWORD },
      });
      assert.equal(parent.body.data.username, 'HS003-PH');
      assert.equal(parent.body.data.fullName, 'Lê Văn Tâm');
      expectError(
        await api('POST', `${API}/users`, {
          token: admin.accessToken,
          body: { role: 'STUDENT', studentCode: 'HS999', password: PASSWORD },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/users`, {
          token: admin.accessToken,
          body: { role: 'STUDENT', studentCode: 'HS003', password: PASSWORD },
        }),
        409,
        'CONFLICT',
      );
      // role STUDENT không được tự đặt username
      expectError(
        await api('POST', `${API}/users`, {
          token: admin.accessToken,
          body: { role: 'STUDENT', studentCode: 'HS004', username: 'tuy-y', password: PASSWORD },
        }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('POST', `${API}/users`, {
          token: admin.accessToken,
          body: { role: 'TEACHER', username: 'Có Dấu!', fullName: 'X Y', password: PASSWORD },
        }),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('tự đổi mật khẩu: sai mật khẩu cũ / mật khẩu yếu / trùng mật khẩu cũ / đang impersonate', async () => {
      const own = (await login('gv.mai')).accessToken;
      const change = (token, body) => api('PUT', `${API}/auth/password`, { token, body });
      expectError(
        await change(own, { currentPassword: 'sai-mat-khau-1', newPassword: 'NewPass@999' }),
        400,
        'BAD_REQUEST',
      );
      expectError(
        await change(own, { currentPassword: PASSWORD, newPassword: 'yeu' }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await change(own, { currentPassword: PASSWORD, newPassword: PASSWORD }),
        422,
        'VALIDATION_ERROR',
      );
      const users = await api('GET', `${API}/users?q=gv.mai`, { token: admin.accessToken });
      const imp = await api('POST', `${API}/auth/switch-role`, {
        token: admin.accessToken,
        body: { targetUserId: users.body.data[0].id },
      });
      expectError(
        await change(imp.body.data.accessToken, {
          currentPassword: PASSWORD,
          newPassword: 'NewPass@999',
        }),
        403,
        'FORBIDDEN',
      );
      assert.ok(await login('gv.mai'), 'mật khẩu không đổi sau các lần thất bại');
    });

    test('reset mật khẩu: user không tồn tại / id sai kiểu', async () => {
      expectError(
        await api('POST', `${API}/users/99999/reset-password`, { token: admin.accessToken }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/users/abc/reset-password`, { token: admin.accessToken }),
        422,
        'VALIDATION_ERROR',
      );
    });
  });

  describe('ma trận RBAC: mọi endpoint x 5 loại người gọi', () => {
    const KEY = { admin: 'admin', teacher: 'gv.an', student: 'HS001', parent: 'HS001-PH' };
    const tokens = {};
    before(async () => {
      for (const [role, username] of Object.entries(KEY)) {
        tokens[role] = (await login(username)).accessToken;
      }
    });

    // Gọi bằng dữ liệu "chưa hợp lệ" để KHÔNG gây tác dụng phụ: role bị cấm => 403 (can() chạy trước validate),
    // role được phép => vượt qua tầng role và dừng ở 422/404 (validate hoặc không tìm thấy).
    const BAD = {};
    const MISSING = 999999;
    const endpoints = [
      ['POST', '/users', BAD, ['admin']],
      ['GET', '/users?limit=0', undefined, ['admin']],
      ['PUT', '/auth/password', BAD, ['admin', 'teacher', 'student', 'parent']],
      ['POST', `/users/${MISSING}/reset-password`, undefined, ['admin']],
      ['GET', '/grade-books', undefined, ['admin', 'teacher']],
      ['POST', '/grade-books', BAD, ['admin', 'teacher']],
      ['POST', '/grade-books/bulk', BAD, ['admin', 'teacher']],
      ['PUT', '/grade-books/1', BAD, ['admin', 'teacher']],
      ['DELETE', `/grade-books/${MISSING}`, undefined, ['admin', 'teacher']],
      ['POST', `/grade-books/${MISSING}/restore`, undefined, ['admin']],
      ['GET', `/students/${MISSING}/grades`, undefined, ['admin', 'teacher', 'student', 'parent']],
      ['GET', `/students/${MISSING}/summary`, undefined, ['admin', 'teacher', 'student', 'parent']],
      [
        'GET',
        `/students/${MISSING}/conduct-suggestion`,
        undefined,
        ['admin', 'teacher', 'student', 'parent'],
      ],
      ['POST', '/classes/1/recalculate', BAD, ['admin', 'teacher']],
      ['GET', '/grade-locks?limit=0', undefined, ['admin', 'teacher']],
      ['POST', '/grade-locks', BAD, ['admin', 'teacher']],
      ['POST', '/grade-locks/unlock', BAD, ['admin']],
    ];

    for (const [method, path, body, allowed] of endpoints) {
      test(`${method} ${path.split('?')[0].replace(String(MISSING), ':id')}`, async () => {
        const anonymous = await api(method, `${API}${path}`, { body });
        expectError(anonymous, 401, 'UNAUTHENTICATED');
        for (const role of Object.keys(KEY)) {
          const res = await api(method, `${API}${path}`, { token: tokens[role], body });
          if (allowed.includes(role)) {
            assert.ok(
              [404, 422].includes(res.status),
              `${role} được phép nên phải qua tầng role (nhận ${res.status} ${JSON.stringify(res.body?.error)})`,
            );
          } else {
            expectError(res, 403, 'FORBIDDEN');
          }
        }
      });
    }
  });

  describe('sổ điểm: nhánh lỗi và biên', () => {
    let admin;
    let teacher;
    let otherTeacher;
    const NOT_A_CLASS = 99999;

    before(async () => {
      admin = (await login('admin')).accessToken;
      teacher = (await login('gv.an')).accessToken;
      otherTeacher = (await login('gv.mai')).accessToken;
    });

    test('lớp / học sinh / bản ghi không tồn tại => 404', async () => {
      expectError(
        await api('GET', `${API}/grade-books?classId=${NOT_A_CLASS}`, { token: admin }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/classes/${NOT_A_CLASS}/recalculate`, {
          token: admin,
          body: period,
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-locks`, {
          token: admin,
          body: { classId: NOT_A_CLASS, ...period },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-locks/unlock`, {
          token: admin,
          body: { classId: NOT_A_CLASS, ...period, reason: 'Lý do đủ dài rồi' },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: admin,
          body: {
            classId: NOT_A_CLASS,
            subjectName: 'Toán Học',
            ...period,
            entries: [{ studentId: 1 }],
          },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('DELETE', `${API}/grade-books/${NOT_A_CLASS}`, { token: admin }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-books/${NOT_A_CLASS}/restore`, { token: admin }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('GET', `${API}/students/${NOT_A_CLASS}/summary`, { token: admin }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('GET', `${API}/students/${NOT_A_CLASS}/conduct-suggestion`, { token: admin }),
        404,
        'NOT_FOUND',
      );
    });

    test('bulk: môn không tồn tại => 404, GV lớp khác => 403', async () => {
      const base = {
        classId: ids['class:10A1'],
        ...period,
        entries: [{ studentId: ids.HS001, scoreFinalTerm: 5 }],
      };
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: teacher,
          body: { ...base, subjectName: 'Võ Thuật' },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: otherTeacher,
          body: { ...base, subjectName: 'Toán Học' },
        }),
        403,
        'FORBIDDEN',
      );
      const tooMany = Array.from({ length: 101 }, (_, i) => ({ studentId: i + 1 }));
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: teacher,
          body: { ...base, subjectName: 'Toán Học', entries: tooMany },
        }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('POST', `${API}/grade-books/bulk`, {
          token: teacher,
          body: { ...base, subjectName: 'Toán Học', entries: [] },
        }),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('chốt sổ khi chưa có điểm => 404; mở khóa kỳ chưa chốt => 409; lớp khác không chốt được', async () => {
      expectError(
        await api('POST', `${API}/grade-locks`, {
          token: teacher,
          body: { classId: ids['class:10A1'], ...period },
        }),
        404,
        'NOT_FOUND',
      );
      expectError(
        await api('POST', `${API}/grade-locks/unlock`, {
          token: admin,
          body: { classId: ids['class:10A1'], ...period, reason: 'Mở khóa thử nghiệm' },
        }),
        409,
        'CONFLICT',
      );
      expectError(
        await api('POST', `${API}/grade-locks`, {
          token: otherTeacher,
          body: { classId: ids['class:10A1'], ...period },
        }),
        403,
        'FORBIDDEN',
      );
    });

    test('học sinh đã nghỉ học không được ghi điểm; học sinh chưa có lớp chỉ Admin ghi được', async () => {
      await pool.query(
        `INSERT INTO students (student_code, full_name, class_name, status) VALUES
           ('TEST-NGHI', 'Học Sinh Nghỉ', '10A1', 'INACTIVE'),
           ('TEST-NOCLASS', 'Chưa Có Lớp', NULL, 'ACTIVE')`,
      );
      const { rows } = await pool.query(
        "SELECT id, student_code FROM students WHERE student_code LIKE 'TEST-%'",
      );
      const byCode = Object.fromEntries(rows.map((r) => [r.student_code, r.id]));
      const grade = (studentId) => ({
        studentId,
        subjectName: 'Toán Học',
        ...period,
        scoreFinalTerm: 8,
      });

      expectError(
        await api('POST', `${API}/grade-books`, {
          token: teacher,
          body: grade(byCode['TEST-NGHI']),
        }),
        409,
        'CONFLICT',
      );
      expectError(
        await api('POST', `${API}/grade-books`, {
          token: teacher,
          body: grade(byCode['TEST-NOCLASS']),
        }),
        403,
        'FORBIDDEN',
      );
      const created = await api('POST', `${API}/grade-books`, {
        token: admin,
        body: grade(byCode['TEST-NOCLASS']),
      });
      assert.equal(created.status, 201);
      assert.equal(created.body.data.className, null);
      assert.equal(created.body.data.averageScore, 8);
      const summary = await api('GET', `${API}/students/${byCode['TEST-NOCLASS']}/summary`, {
        token: admin,
      });
      assert.equal(summary.status, 200);
      assert.equal(summary.body.data.isComplete, false);
      assert.equal(summary.body.data.academicRank, 'Chưa xếp loại');
      assert.equal(summary.body.data.subjects.length, 5);
      assert.equal(
        summary.body.data.subjects.find((s) => s.subjectName === 'Toán Học').averageScore,
        8,
      );
      assert.equal(
        summary.body.data.subjects.find((s) => s.subjectName === 'Ngữ Văn').averageScore,
        null,
      );
    });

    test('recalculate: sửa lại GPA/học lực bị lệch trong bảng students (dữ liệu mẫu cũ)', async () => {
      await pool.query(
        "UPDATE students SET gpa = 8.7, academic_rank = 'Giỏi' WHERE student_code = 'HS003'",
      );
      const res = await api('POST', `${API}/classes/${ids['class:10A1']}/recalculate`, {
        token: teacher,
        body: period,
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.studentsUpdated, 1);
      const { rows } = await pool.query(
        "SELECT gpa, academic_rank FROM students WHERE student_code = 'HS003'",
      );
      assert.equal(Number(rows[0].gpa), 0);
      assert.equal(rows[0].academic_rank, 'Chưa xếp loại');
      const again = await api('POST', `${API}/classes/${ids['class:10A1']}/recalculate`, {
        token: teacher,
        body: period,
      });
      assert.equal(again.body.data.studentsUpdated, 0, 'chạy lại không còn gì để sửa (idempotent)');
    });

    test('danh sách sổ điểm: lọc theo môn, sắp xếp, phân trang, mặc định học kỳ hiện hành', async () => {
      for (const [code, score] of [
        ['HS001', 5],
        ['HS002', 9],
        ['HS003', 7],
      ]) {
        const res = await api('POST', `${API}/grade-books`, {
          token: teacher,
          body: {
            studentId: ids[code],
            subjectName: 'Vật Lý',
            ...period,
            scoreMidTerm: score,
            scoreFinalTerm: score,
          },
        });
        assert.equal(res.status, 201);
      }
      const url = (extra) =>
        `${API}/grade-books?classId=${ids['class:10A1']}&subjectName=${encodeURIComponent('Vật Lý')}${extra}`;
      const asc = await api('GET', url('&sort=averageScore'), { token: teacher });
      assert.deepEqual(
        asc.body.data.map((g) => g.averageScore),
        [5, 7, 9],
      );
      const desc = await api('GET', url('&sort=-averageScore&limit=2'), { token: teacher });
      assert.deepEqual(
        desc.body.data.map((g) => g.averageScore),
        [9, 7],
      );
      assert.deepEqual(desc.body.meta, { page: 1, limit: 2, total: 3, totalPages: 2 });
      const byCode = await api('GET', url('&sort=-studentCode'), { token: admin });
      assert.deepEqual(
        byCode.body.data.map((g) => g.studentCode),
        ['HS003', 'HS002', 'HS001'],
      );
      const otherTerm = await api('GET', url('&semester=HK2'), { token: teacher });
      assert.equal(otherTerm.body.data.length, 0);
      expectError(
        await api('GET', url('&sort=studentId'), { token: teacher }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('GET', url('&semester=HK3'), { token: teacher }),
        422,
        'VALIDATION_ERROR',
      );
      expectError(
        await api('GET', `${API}/grade-books`, { token: teacher }),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('danh sách điểm theo học sinh: lọc kỳ; summary mặc định theo học kỳ hiện hành', async () => {
      const all = await api('GET', `${API}/students/${ids.HS001}/grades`, { token: admin });
      assert.ok(all.body.data.length >= 1);
      const hk2 = await api('GET', `${API}/students/${ids.HS001}/grades?semester=HK2`, {
        token: admin,
      });
      assert.deepEqual(hk2.body.data, []);
      const summary = await api('GET', `${API}/students/${ids.HS001}/summary`, { token: admin });
      assert.deepEqual(
        [summary.body.data.semester, summary.body.data.schoolYear],
        ['HK1', '2025-2026'],
      );
      expectError(
        await api('GET', `${API}/students/${ids.HS001}/grades?semester=XX`, { token: admin }),
        422,
        'VALIDATION_ERROR',
      );
    });

    test('phân trang danh sách khóa sổ', async () => {
      const lock = await api('POST', `${API}/grade-locks`, {
        token: teacher,
        body: { classId: ids['class:10A1'], ...period },
      });
      assert.equal(lock.status, 201);
      assert.equal(lock.body.data.note, null);
      const list = await api('GET', `${API}/grade-locks?limit=1`, { token: admin });
      assert.deepEqual(list.body.meta, { page: 1, limit: 1, total: 1, totalPages: 1 });
      assert.deepEqual(
        {
          className: list.body.data[0].className,
          semester: list.body.data[0].semester,
          schoolYear: list.body.data[0].schoolYear,
        },
        { className: '10A1', ...period },
      );
      const empty = await api('GET', `${API}/grade-locks?page=2&limit=1`, { token: admin });
      assert.deepEqual(empty.body.data, []);
      await api('POST', `${API}/grade-locks/unlock`, {
        token: admin,
        body: { classId: ids['class:10A1'], ...period, reason: 'Dọn dẹp sau khi test' },
      });
    });

    test('điểm 0 hợp lệ khác với chưa nhập; TBM làm tròn half-up', async () => {
      const res = await api('POST', `${API}/grade-books`, {
        token: teacher,
        body: {
          studentId: ids.HS004,
          subjectName: 'Hóa Học',
          ...period,
          scoreOral: 0,
          scoreFinalTerm: 0,
        },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.scoreOral, 0);
      assert.equal(res.body.data.score15m, null);
      assert.equal(res.body.data.averageScore, 0);
      assert.equal(res.body.data.gradeLetter, 'Yếu');
      const rounding = await api('POST', `${API}/grade-books`, {
        token: teacher,
        body: {
          studentId: ids.HS004,
          subjectName: 'Toán Học',
          ...period,
          scoreOral: 8,
          scoreMidTerm: 8,
          scoreFinalTerm: 9,
        },
      });
      assert.equal(rounding.body.data.averageScore, 8.5); // (8 + 16 + 27) / 6 = 8.5
      const empty = await api('POST', `${API}/grade-books`, {
        token: teacher,
        body: { studentId: ids.HS004, subjectName: 'Ngữ Văn', ...period },
      });
      assert.equal(empty.body.data.averageScore, null);
      assert.equal(empty.body.data.gradeLetter, 'Chưa xếp loại');
    });
  });

  describe('bảo mật: IDOR và rò rỉ dữ liệu', () => {
    test('Student/Parent không đọc được dữ liệu học sinh khác bằng bất kỳ endpoint đọc nào', async () => {
      const student = (await login('HS002')).accessToken;
      const parent = (await login('HS002-PH')).accessToken;
      for (const token of [student, parent]) {
        for (const path of [
          `/students/${ids.HS001}/grades`,
          `/students/${ids.HS001}/summary`,
          `/students/${ids.HS001}/conduct-suggestion`,
        ]) {
          expectError(await api('GET', `${API}${path}`, { token }), 403, 'FORBIDDEN');
        }
      }
      for (const path of ['grades', 'summary']) {
        assert.equal(
          (await api('GET', `${API}/students/${ids.HS002}/${path}`, { token: student })).status,
          200,
        );
        assert.equal(
          (await api('GET', `${API}/students/${ids.HS002}/${path}`, { token: parent })).status,
          200,
        );
      }
    });

    test('response không rò mật khẩu / secret và có header bảo mật', async () => {
      const admin = (await login('admin')).accessToken;
      const users = await h.call(h.demoBase, 'GET', `${API}/users?limit=100`, { token: admin });
      const text = JSON.stringify(users.body);
      assert.ok(!/\$2[aby]\$/.test(text), 'không được có bcrypt hash');
      assert.ok(!/passwordHash|"password"/.test(text));
      assert.equal(users.headers.get('x-powered-by'), null);
      assert.equal(users.headers.get('x-content-type-options'), 'nosniff');
      assert.match(users.headers.get('content-type'), /application\/json/);
    });

    test('body quá lớn bị chặn bằng 413; JSON hỏng => 400', async () => {
      const big = JSON.stringify({ username: 'a'.repeat(2 * 1024 * 1024), password: 'x' });
      const res = await h.call(h.demoBase, 'POST', `${API}/auth/login`, { raw: big });
      expectError(res, 413, 'PAYLOAD_TOO_LARGE');
      expectError(
        await h.call(h.demoBase, 'POST', `${API}/auth/login`, { raw: '[1,2,' }),
        400,
        'BAD_REQUEST',
      );
    });

    test('body không phải object (mảng, chuỗi, null) bị từ chối gọn gàng', async () => {
      for (const raw of ['[]', '"abc"', 'null', '123']) {
        const res = await h.call(h.demoBase, 'POST', `${API}/auth/login`, { raw });
        assert.ok([400, 422].includes(res.status), `raw=${raw} status=${res.status}`);
        assert.equal(res.body.success, false);
      }
    });
  });

  describe('script seed admin', () => {
    const run = (extraEnv, args = []) =>
      spawnSync(process.execPath, ['scripts/seed-admin.js', ...args], {
        env: {
          PATH: process.env.PATH,
          DATABASE_URL: TEST_DATABASE_URL,
          BCRYPT_ROUNDS: '4',
          ...extraEnv,
        },
        encoding: 'utf8',
      });

    test('tạo admin, chạy lại không tạo trùng, mật khẩu được băm', async () => {
      const env = {
        ADMIN_USERNAME: 'seed.admin',
        ADMIN_PASSWORD: 'Seed@12345',
        ADMIN_FULL_NAME: 'Seed Admin',
      };
      const first = run(env);
      assert.equal(first.status, 0, first.stderr);
      assert.match(first.stdout, /\+ ADMIN\s+seed\.admin đã tạo/);
      const second = run(env);
      assert.equal(second.status, 0, second.stderr);
      assert.match(second.stdout, /= ADMIN\s+seed\.admin đã tồn tại/);
      const { rows } = await pool.query(
        "SELECT role, password FROM users WHERE username = 'seed.admin'",
      );
      assert.equal(rows.length, 1);
      assert.equal(rows[0].role, 'ADMIN');
      assert.match(rows[0].password, /^\$2[aby]\$/);
      assert.equal(
        (
          await api('POST', `${API}/auth/login`, {
            body: { username: 'seed.admin', password: 'Seed@12345' },
          })
        ).status,
        200,
      );
    });

    test('--demo thêm giáo viên / học sinh / phụ huynh khớp dữ liệu mẫu', async () => {
      const result = run(
        { ADMIN_USERNAME: 'seed.admin', ADMIN_PASSWORD: 'Seed@12345', DEMO_PASSWORD: 'Demo@12345' },
        ['--demo'],
      );
      assert.equal(result.status, 0, result.stderr);
      const { rows } = await pool.query(
        "SELECT username, role FROM users WHERE username IN ('gv.an','HS001','HS001-PH') ORDER BY username",
      );
      assert.deepEqual(
        rows.map((r) => `${r.username}:${r.role}`).sort(),
        ['HS001-PH:PARENT', 'HS001:STUDENT', 'gv.an:TEACHER'].sort(),
      );
    });

    test('từ chối mật khẩu mặc định ở production và mật khẩu yếu', () => {
      const prod = run({ NODE_ENV: 'production', ADMIN_USERNAME: 'prod.admin' });
      assert.equal(prod.status, 1);
      assert.match(prod.stderr, /production/);
      const weak = run({ ADMIN_USERNAME: 'weak.admin', ADMIN_PASSWORD: 'abc' });
      assert.notEqual(weak.status, 0);
    });
  });
}
