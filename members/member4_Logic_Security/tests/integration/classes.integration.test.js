// Phân lớp cho học sinh và phân GVCN cho lớp (chỉ Admin). Cần TEST_DATABASE_URL.
import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { API, PASSWORD, TEST_DATABASE_URL, createHarness } from '../helpers/harness.js';

if (!TEST_DATABASE_URL) {
  test('integration (bỏ qua: chưa đặt TEST_DATABASE_URL)', { skip: true }, () => {});
} else {
  const h = createHarness();
  const { pool, ids } = h;
  const api = (...args) => h.api(...args);
  const login = (...args) => h.login(...args);
  const expectError = (...args) => h.expectError(...args);
  let admin;

  before(async () => {
    await h.start();
    admin = (await login('admin')).accessToken;
  });
  after(async () => {
    await h.reset(); // trả phân lớp / GVCN về như cũ cho các file test khác
    await h.stop();
  });

  const assignStudent = (studentId, classId, token = admin) =>
    api('PUT', `${API}/students/${studentId}/class`, { token, body: { classId } });
  const assignTeacher = (classId, teacherUserId, token = admin) =>
    api('PUT', `${API}/classes/${classId}/teacher`, { token, body: { teacherUserId } });
  const canSeeGrades = async (token, studentId) =>
    (await api('GET', `${API}/students/${studentId}/grades`, { token })).status === 200;

  describe('xem lớp và học sinh', () => {
    test('GET /classes: GVCN, tài khoản giáo viên khớp tên, sĩ số', async () => {
      const res = await api('GET', `${API}/classes`, { token: admin });
      assert.equal(res.status, 200);
      const [a1, a2] = res.body.data;
      assert.equal(a1.className, '10A1');
      assert.equal(a1.gvcnName, 'Nguyễn Văn An');
      assert.equal(a1.studentCount, 4);
      assert.deepEqual(
        a1.gvcnTeachers.map((t) => t.username),
        ['gv.an'],
      );
      assert.equal(a2.className, '10A2');
      assert.deepEqual(a2.gvcnTeachers, [], 'chưa có tài khoản giáo viên tên Lê Thị Mai');
    });

    test('GET /students: lọc theo lớp, tìm kiếm, chưa có lớp, phân trang', async () => {
      const byClass = await api('GET', `${API}/students?classId=${ids['class:10A2']}`, {
        token: admin,
      });
      assert.deepEqual(
        byClass.body.data.map((s) => s.studentCode),
        ['HS005'],
      );
      const search = await api('GET', `${API}/students?q=cẩm`, { token: admin });
      assert.deepEqual(
        search.body.data.map((s) => s.studentCode),
        ['HS003'],
      );
      const none = await api('GET', `${API}/students?unassigned=true`, { token: admin });
      assert.equal(none.body.meta.total, 0);
      const wildcard = await api('GET', `${API}/students?q=${encodeURIComponent('HS%')}`, {
        token: admin,
      });
      assert.equal(wildcard.body.meta.total, 0, '% là ký tự thường, không phải wildcard');
      const paged = await api('GET', `${API}/students?limit=2&page=2`, { token: admin });
      assert.equal(paged.body.data[0].studentCode, 'HS003');
      assert.equal(paged.body.meta.total, 5);
      expectError(
        await api('GET', `${API}/students?unassigned=yes`, { token: admin }),
        422,
        'VALIDATION_ERROR',
      );
    });
  });

  describe('phân học sinh vào lớp', () => {
    test('chuyển HS005 sang 10A1 => GVCN 10A1 quản lý ngay; rút khỏi lớp => hết quyền', async () => {
      const teacher = (await login('gv.an')).accessToken;
      assert.equal(await canSeeGrades(teacher, ids.HS005), false);

      const moved = await assignStudent(ids.HS005, ids['class:10A1']);
      assert.equal(moved.status, 200);
      assert.equal(moved.body.data.className, '10A1');
      assert.equal(moved.body.data.gvcnName, 'Nguyễn Văn An');
      assert.equal(await canSeeGrades(teacher, ids.HS005), true);

      const removed = await assignStudent(ids.HS005, null);
      assert.equal(removed.body.data.className, null);
      assert.equal(removed.body.data.classId, null);
      const none = await api('GET', `${API}/students?unassigned=true`, { token: admin });
      assert.deepEqual(
        none.body.data.map((s) => s.studentCode),
        ['HS005'],
      );
      assert.equal(await canSeeGrades(teacher, ids.HS005), false);
    });

    test('học sinh / lớp không tồn tại => 404; học sinh đã nghỉ => 400; body sai => 422', async () => {
      expectError(await assignStudent(999999, ids['class:10A1']), 404, 'NOT_FOUND');
      expectError(await assignStudent(ids.HS001, 999999), 404, 'NOT_FOUND');
      const { rows } = await pool.query(
        "INSERT INTO students (student_code, full_name, status) VALUES ('TEST-NGHI', 'Đã Nghỉ', 'INACTIVE') RETURNING id",
      );
      expectError(await assignStudent(rows[0].id, ids['class:10A1']), 400, 'BAD_REQUEST');
      expectError(await assignStudent(ids.HS001, '1'), 422, 'VALIDATION_ERROR');
      expectError(
        await api('PUT', `${API}/students/${ids.HS001}/class`, { token: admin, body: {} }),
        422,
        'VALIDATION_ERROR',
      );
    });
  });

  describe('phân GVCN cho lớp', () => {
    let binhId;

    before(async () => {
      const created = await api('POST', `${API}/users`, {
        token: admin,
        body: {
          role: 'TEACHER',
          username: 'gv.binh',
          fullName: 'Phạm Văn Bình',
          password: PASSWORD,
        },
      });
      binhId = created.body.data.id;
    });

    test('phân gv.binh làm GVCN 10A2 => quản lý được học sinh 10A2; bỏ GVCN => hết quyền', async () => {
      const binh = (await login('gv.binh')).accessToken;
      assert.equal(await canSeeGrades(binh, ids.HS004), false);

      await assignStudent(ids.HS004, ids['class:10A2']);
      const res = await assignTeacher(ids['class:10A2'], binhId);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.gvcnName, 'Phạm Văn Bình');
      assert.equal(res.body.data.teacher.username, 'gv.binh');
      assert.equal(await canSeeGrades(binh, ids.HS004), true);
      const me = await api('GET', `${API}/auth/me`, { token: binh });
      assert.deepEqual(
        me.body.data.managedClasses.map((c) => c.className),
        ['10A2'],
      );

      const cleared = await assignTeacher(ids['class:10A2'], null);
      assert.equal(cleared.body.data.gvcnName, null);
      assert.equal(cleared.body.data.teacher, null);
      assert.equal(await canSeeGrades(binh, ids.HS004), false);
    });

    test('không phải giáo viên => 400; không tồn tại => 404; trùng họ tên giáo viên khác => 409', async () => {
      const users = await api('GET', `${API}/users?q=HS001&role=STUDENT`, { token: admin });
      expectError(
        await assignTeacher(ids['class:10A2'], users.body.data[0].id),
        400,
        'BAD_REQUEST',
      );
      expectError(await assignTeacher(ids['class:10A2'], 999999), 404, 'NOT_FOUND');
      expectError(await assignTeacher(999999, binhId), 404, 'NOT_FOUND');

      await h.createUser('gv.binh2', '  phạm văn  BÌNH ', 'TEACHER');
      expectError(await assignTeacher(ids['class:10A2'], binhId), 409, 'CONFLICT');
    });
  });

  describe('chỉ Admin', () => {
    test('teacher / student bị 403, chưa đăng nhập bị 401', async () => {
      const teacher = (await login('gv.an')).accessToken;
      const student = (await login('HS001')).accessToken;
      for (const token of [teacher, student]) {
        expectError(await api('GET', `${API}/classes`, { token }), 403, 'FORBIDDEN');
        expectError(await api('GET', `${API}/students`, { token }), 403, 'FORBIDDEN');
        expectError(await assignStudent(ids.HS001, ids['class:10A2'], token), 403, 'FORBIDDEN');
        expectError(await assignTeacher(ids['class:10A1'], null, token), 403, 'FORBIDDEN');
      }
      expectError(await api('GET', `${API}/classes`), 401, 'UNAUTHENTICATED');
    });
  });
}
