// Sinh Postman collection + environment (JSON, schema v2.1) từ MỘT nguồn duy nhất.
//   npm run postman:generate   ->  postman/*.json
// Collection chạy tuần tự được (Collection Runner / newman), chạy lại nhiều lần không hỏng
// và tự lưu token / id vào biến collection. Yêu cầu DB đã seed: npm run seed:admin && npm run seed:demo.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

// Lấy tài khoản/cổng từ .env để Postman luôn khớp với seed (không phải sửa tay). Thiếu thì dùng mặc định của seed.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}
const env = (key, fallback) => process.env[key]?.trim() || fallback;

// Id CỐ ĐỊNH: import lại vào Postman sẽ GHI ĐÈ bản cũ thay vì tạo thêm bản trùng tên (dễ chọn nhầm bản cũ).
const COLLECTION_ID = '6f1d2c3a-4b5e-4f60-8a71-9b8c7d6e5f40';
const ENVIRONMENT_ID = '0a9b8c7d-6e5f-4a3b-9c2d-1e0f2a3b4c5d';

const API = ['api', 'v1'];

// Tài khoản do Admin cấp ngay trong collection: MỘT nơi duy nhất, mọi request dùng lại các hằng này.
// Khớp dữ liệu mẫu db/schema.sql: GVCN lớp 10A2 là "Lê Thị Mai", HS005 học 10A2; HS001 học 10A1 (lớp khác).
const CLASS = '10A2';
const OTHER_CLASS = '10A1';
const TEACHER = 'gv.mai';
const TEACHER_NAME = 'Lê Thị Mai';
const STUDENT = 'HS005';
const PARENT = `${STUDENT}-PH`;
const OTHER_STUDENT = 'HS001';
const RESET_STUDENT = 'HS003'; // dùng riêng cho luồng quên mật khẩu
const NEW_PASSWORD = '{{newUserPassword}}';
const BASE_URL = '{{baseUrl}}';

// ---------- helpers dựng request ----------
const bearer = (variable) => ({
  type: 'bearer',
  bearer: [{ key: 'token', value: `{{${variable}}}`, type: 'string' }],
});
const NO_AUTH = { type: 'noauth' };

const script = (listen, lines) =>
  lines.length > 0 ? [{ listen, script: { type: 'text/javascript', exec: lines } }] : [];

const asJson = (value) => JSON.stringify(value, null, 2);

function url(path, query = {}, { api = true } = {}) {
  const segments = path.split('/').filter(Boolean);
  const full = api ? [...API, ...segments] : segments;
  const entries = Object.entries(query);
  const qs = entries.length > 0 ? `?${entries.map(([k, v]) => `${k}=${v}`).join('&')}` : '';
  return {
    raw: `${BASE_URL}/${full.join('/')}${qs}`,
    host: [BASE_URL],
    path: full,
    ...(entries.length > 0
      ? { query: entries.map(([key, value]) => ({ key, value: String(value) })) }
      : {}),
  };
}

/**
 * @param {{ name: string, method?: string, path: string, query?: object, body?: object,
 *           auth?: string | null, tests?: string[], pre?: string[], description?: string, api?: boolean }} spec
 */
function request(spec) {
  const {
    name,
    method = 'GET',
    path,
    query,
    body,
    auth = null,
    tests = [],
    pre = [],
    description,
    api = true,
  } = spec;
  return {
    name,
    event: [...script('prerequest', pre), ...script('test', tests)],
    request: {
      method,
      header: body === undefined ? [] : [{ key: 'Content-Type', value: 'application/json' }],
      ...(body === undefined
        ? {}
        : { body: { mode: 'raw', raw: asJson(body), options: { raw: { language: 'json' } } } }),
      auth: auth ? bearer(auth) : NO_AUTH,
      url: url(path, query, { api }),
      ...(description ? { description } : {}),
    },
    response: [],
  };
}

const folder = (name, description, item) => ({ name, description, item });

// ---------- snippet test dùng chung ----------
const json = 'const body = pm.response.json();';
const status = (code) => `pm.test('HTTP ${code}', () => pm.response.to.have.status(${code}));`;
const statusIn = (...codes) =>
  `pm.test('HTTP ${codes.join(' hoặc ')}', () => pm.expect([${codes.join(', ')}]).to.include(pm.response.code));`;
const ok = (code = 200) => [
  status(code),
  json,
  "pm.test('success = true', () => pm.expect(body.success).to.eql(true));",
  'pm.test(\'không lộ password / hash\', () => pm.expect(pm.response.text()).to.not.match(/"password(Hash)?"\\s*:|\\$2[aby]\\$/));',
];
const fail = (code, errorCode) => [
  status(code),
  json,
  "pm.test('success = false', () => pm.expect(body.success).to.eql(false));",
  `pm.test('error.code = ${errorCode}', () => pm.expect(body.error.code).to.eql('${errorCode}'));`,
  "pm.test('có requestId', () => pm.expect(body.requestId).to.be.a('string').and.not.empty);",
];
const save = (variable, expr) => `pm.collectionVariables.set('${variable}', String(${expr}));`;

const SCORES = { scoreOral: 9, score15m: 8.5, score1Hour: 8, scoreMidTerm: 9, scoreFinalTerm: 9.5 };
const TERM = { semester: 'HK1', schoolYear: '2025-2026' };
const gradeBody = (subjectName) => ({
  studentId: '{{studentId}}',
  subjectName,
  ...TERM,
  ...SCORES,
});
const bulkBody = (subjectName, score) => ({
  classId: '{{classId}}',
  subjectName,
  ...TERM,
  entries: [{ studentId: '{{studentId}}', scoreMidTerm: score, scoreFinalTerm: score }],
});
// Postman thay {{studentId}} thành chuỗi "1" trong body JSON -> server cần số. Ép số bằng pre-request.
const numeric = (...vars) =>
  vars.map(
    (v) =>
      `pm.request.body.raw = pm.request.body.raw.replace(/"\\{\\{${v}\\}\\}"/g, pm.collectionVariables.get('${v}'));`,
  );

// ---------- 0. Health ----------
const health = folder('0. Health', 'Kiểm tra server và kết nối database.', [
  request({
    name: 'GET /health',
    path: 'health',
    api: false,
    tests: [
      status(200),
      json,
      "pm.test('status ok', () => pm.expect(body.data.status).to.eql('ok'));",
    ],
  }),
]);

// ---------- 1. Auth ----------
const login = (label, username, password, prefix, extraTests = []) =>
  request({
    name: `Đăng nhập ${label}`,
    method: 'POST',
    path: 'auth/login',
    body: { username, password },
    description:
      'Public. Rate limit 5 lần/phút theo (IP + username). Lưu accessToken/refreshToken vào biến collection.',
    tests: [
      ...ok(200),
      "pm.test('có accessToken và refreshToken', () => { pm.expect(body.data.accessToken).to.be.a('string'); pm.expect(body.data.refreshToken).to.be.a('string'); });",
      save(`${prefix}Token`, 'body.data.accessToken'),
      save(`${prefix}RefreshToken`, 'body.data.refreshToken'),
      save(`${prefix}UserId`, 'body.data.user.id'),
      ...extraTests,
    ],
  });

const auth = folder(
  '1. Auth: Admin cấp tài khoản, đăng nhập, phiên',
  'Không có tự đăng ký: Admin đăng nhập rồi cấp tài khoản TEACHER / STUDENT / PARENT, ba tài khoản đó tự đăng nhập. Sau đó: refresh xoay vòng, role switcher, logout.',
  [
    request({
      name: 'Không có tự đăng ký (/auth/register => 404)',
      method: 'POST',
      path: 'auth/register',
      body: {
        role: 'STUDENT',
        studentCode: 'HS002',
        dob: '2008-03-22',
        password: '{{newUserPassword}}',
      },
      description: 'Mọi tài khoản (ADMIN/TEACHER/STUDENT/PARENT) chỉ do Admin cấp qua POST /users.',
      tests: fail(404, 'NOT_FOUND'),
    }),
    login('ADMIN', '{{adminUsername}}', '{{adminPassword}}', 'admin', [
      "pm.test('role = ADMIN', () => pm.expect(body.data.user.role).to.eql('ADMIN'));",
    ]),
    request({
      name: 'Đăng nhập sai mật khẩu',
      method: 'POST',
      path: 'auth/login',
      body: { username: '{{adminUsername}}', password: 'sai-mat-khau-123' },
      description: 'Sai user và sai mật khẩu trả cùng một lỗi INVALID_CREDENTIALS.',
      tests: fail(401, 'INVALID_CREDENTIALS'),
    }),
    request({
      name: `Admin cấp tài khoản TEACHER (${TEACHER})`,
      method: 'POST',
      path: 'users',
      auth: 'adminToken',
      body: { role: 'TEACHER', username: TEACHER, fullName: TEACHER_NAME, password: NEW_PASSWORD },
      description: `Họ tên trùng school_classes.gvcn_name thì người này là GVCN của lớp đó (${TEACHER_NAME} = GVCN ${CLASS}). 201 lần đầu, 409 nếu đã tồn tại.`,
      tests: [
        statusIn(201, 409),
        json,
        `if (pm.response.code === 201) { pm.test('là GVCN ${CLASS}', () => pm.expect(body.data.managedClasses).to.eql(['${CLASS}'])); }`,
      ],
    }),
    request({
      name: `Admin cấp tài khoản STUDENT (${STUDENT})`,
      method: 'POST',
      path: 'users',
      auth: 'adminToken',
      body: { role: 'STUDENT', studentCode: STUDENT, password: NEW_PASSWORD },
      description:
        'Username = mã học sinh (không tự đặt được), họ tên lấy từ bảng students. 201 lần đầu, 409 nếu đã tồn tại.',
      tests: [
        statusIn(201, 409),
        json,
        `if (pm.response.code === 201) { pm.test('username = ${STUDENT}', () => pm.expect(body.data.username).to.eql('${STUDENT}')); }`,
      ],
    }),
    request({
      name: `Admin cấp tài khoản PARENT (${PARENT})`,
      method: 'POST',
      path: 'users',
      auth: 'adminToken',
      body: { role: 'PARENT', studentCode: STUDENT, password: NEW_PASSWORD },
      description: 'Username = <mã HS>-PH. fullName không bắt buộc (mặc định lấy parent_name).',
      tests: [
        statusIn(201, 409),
        json,
        `if (pm.response.code === 201) { pm.test('username = ${PARENT}', () => pm.expect(body.data.username).to.eql('${PARENT}')); }`,
      ],
    }),
    login(`TEACHER (${TEACHER}, GVCN ${CLASS})`, TEACHER, NEW_PASSWORD, 'teacher', [
      "pm.test('role = TEACHER', () => pm.expect(body.data.user.role).to.eql('TEACHER'));",
    ]),
    login(`STUDENT (${STUDENT})`, STUDENT, NEW_PASSWORD, 'student', [
      "pm.test('role = STUDENT', () => pm.expect(body.data.user.role).to.eql('STUDENT'));",
    ]),
    login(`PARENT (${PARENT})`, PARENT, NEW_PASSWORD, 'parent', [
      "pm.test('role = PARENT', () => pm.expect(body.data.user.role).to.eql('PARENT'));",
    ]),
    request({
      name: `Me: TEACHER (lấy classId lớp ${CLASS})`,
      path: 'auth/me',
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        `pm.test('chủ nhiệm ${CLASS}', () => pm.expect(body.data.managedClasses.map((c) => c.className)).to.include('${CLASS}'));`,
        save('classId', `body.data.managedClasses.find((c) => c.className === '${CLASS}').id`),
      ],
    }),
    request({
      name: `Me: STUDENT (lấy studentId của ${STUDENT})`,
      path: 'auth/me',
      auth: 'studentToken',
      tests: [
        ...ok(200),
        "pm.test('liên kết đúng 1 học sinh', () => pm.expect(body.data.linkedStudentIds).to.have.lengthOf(1));",
        save('studentId', 'body.data.linkedStudentIds[0]'),
      ],
    }),
    request({
      name: 'Me: PARENT',
      path: 'auth/me',
      auth: 'parentToken',
      tests: [
        ...ok(200),
        "pm.test('con của phụ huynh = studentId', () => pm.expect(String(body.data.linkedStudentIds[0])).to.eql(pm.collectionVariables.get('studentId')));",
      ],
    }),
    request({
      name: 'Tự đổi mật khẩu thất bại: sai mật khẩu hiện tại',
      method: 'PUT',
      path: 'auth/password',
      auth: 'studentToken',
      body: { currentPassword: 'sai-mat-khau-1', newPassword: '{{newUserPassword}}' },
      description:
        'Mỗi người tự đổi mật khẩu của mình (Admin không đổi hộ). Đổi thành công => mọi phiên bị thu hồi, phải đăng nhập lại; collection không chạy ca thành công để giữ nguyên token cho các request sau.',
      tests: fail(400, 'BAD_REQUEST'),
    }),
    request({
      name: 'Tự đổi mật khẩu thất bại: mật khẩu mới yếu',
      method: 'PUT',
      path: 'auth/password',
      auth: 'studentToken',
      body: { currentPassword: NEW_PASSWORD, newPassword: 'yeu' },
      tests: fail(422, 'VALIDATION_ERROR'),
    }),
    request({
      name: 'Refresh token (xoay vòng)',
      method: 'POST',
      path: 'auth/refresh',
      body: { refreshToken: '{{teacherRefreshToken}}' },
      description: 'Mỗi refresh token chỉ dùng 1 lần. Dùng lại token cũ sẽ thu hồi cả phiên.',
      tests: [
        ...ok(200),
        "pm.test('refresh token mới khác token cũ', () => pm.expect(body.data.refreshToken).to.not.eql(pm.collectionVariables.get('teacherRefreshToken')));",
        save('teacherToken', 'body.data.accessToken'),
        save('teacherRefreshToken', 'body.data.refreshToken'),
      ],
    }),
    request({
      name: 'Quick Role Switcher: Admin đăng nhập thay TEACHER (impersonate)',
      method: 'POST',
      path: 'auth/switch-role',
      auth: 'adminToken',
      body: { targetUserId: '{{teacherUserId}}' },
      description:
        'Chỉ Admin thật. Token trả về chỉ có access (15 phút), mang claim impersonatedBy.',
      pre: numeric('teacherUserId'),
      tests: [
        ...ok(200),
        "pm.test('đang là TEACHER và không có refresh token', () => { pm.expect(body.data.user.role).to.eql('TEACHER'); pm.expect(body.data.refreshToken).to.be.undefined; });",
        save('impersonateToken', 'body.data.accessToken'),
      ],
    }),
    request({
      name: 'Me khi đang impersonate',
      path: 'auth/me',
      auth: 'impersonateToken',
      tests: [
        ...ok(200),
        "pm.test('impersonatedBy = id Admin', () => pm.expect(String(body.data.impersonatedBy)).to.eql(pm.collectionVariables.get('adminUserId')));",
      ],
    }),
    request({
      name: 'Switch-back về tài khoản gốc',
      method: 'POST',
      path: 'auth/switch-back',
      auth: 'impersonateToken',
      tests: [
        ...ok(200),
        "pm.test('về lại ADMIN', () => pm.expect(body.data.user.role).to.eql('ADMIN'));",
      ],
    }),
    request({
      name: 'Quick Role Switcher (DEMO_MODE): STUDENT đổi sang ADMIN',
      method: 'POST',
      path: 'auth/switch-role',
      auth: 'studentToken',
      body: { targetRole: 'ADMIN' },
      description: '200 khi DEMO_MODE=true; 403 khi tắt (mặc định). Cả hai đều là hành vi đúng.',
      tests: [
        statusIn(200, 403),
        json,
        "if (pm.response.code === 403) { pm.test('DEMO_MODE tắt => FORBIDDEN', () => pm.expect(body.error.code).to.eql('FORBIDDEN')); }",
        "if (pm.response.code === 200) { pm.test('đổi sang ADMIN', () => pm.expect(body.data.user.role).to.eql('ADMIN')); }",
      ],
    }),
    request({
      name: 'Phiên tạm 1: đăng nhập PARENT',
      method: 'POST',
      path: 'auth/login',
      body: { username: PARENT, password: NEW_PASSWORD },
      tests: [...ok(200), save('tmpRefreshToken', 'body.data.refreshToken')],
    }),
    request({
      name: 'Phiên tạm 1: refresh lần đầu (ok)',
      method: 'POST',
      path: 'auth/refresh',
      body: { refreshToken: '{{tmpRefreshToken}}' },
      pre: [
        "pm.collectionVariables.set('tmpOldRefreshToken', pm.collectionVariables.get('tmpRefreshToken'));",
      ],
      tests: [...ok(200), save('tmpRefreshToken', 'body.data.refreshToken')],
    }),
    request({
      name: 'Phiên tạm 1: dùng lại refresh token cũ (bị phát hiện, thu hồi cả phiên)',
      method: 'POST',
      path: 'auth/refresh',
      body: { refreshToken: '{{tmpOldRefreshToken}}' },
      tests: fail(401, 'REFRESH_TOKEN_INVALID'),
    }),
    request({
      name: 'Phiên tạm 2: đăng nhập STUDENT',
      method: 'POST',
      path: 'auth/login',
      body: { username: STUDENT, password: NEW_PASSWORD },
      tests: [...ok(200), save('tmpToken', 'body.data.accessToken')],
    }),
    request({
      name: 'Phiên tạm 2: logout',
      method: 'POST',
      path: 'auth/logout',
      auth: 'tmpToken',
      tests: [...ok(200), "pm.test('data = null', () => pm.expect(body.data).to.eql(null));"],
    }),
    request({
      name: 'Phiên tạm 2: token sau logout bị từ chối',
      path: 'auth/me',
      auth: 'tmpToken',
      tests: fail(401, 'UNAUTHENTICATED'),
    }),
  ],
);

// ---------- 2. Users ----------
const users = folder(
  '2. Quản lý user và mật khẩu (Admin)',
  'Toàn bộ /users chỉ Admin; đây là đường DUY NHẤT để tạo tài khoản (3 tài khoản chính đã cấp ở nhóm 1). Nhóm này: danh sách user và luồng quên mật khẩu (Admin reset, người dùng tự đổi).',
  [
    request({
      name: 'Danh sách user (lọc role, phân trang)',
      path: 'users',
      query: { role: 'TEACHER', page: 1, limit: 5, sort: 'username' },
      auth: 'adminToken',
      tests: [
        ...ok(200),
        "pm.test('có meta phân trang', () => { pm.expect(body.meta).to.have.all.keys('page', 'limit', 'total', 'totalPages'); });",
        "pm.test('chỉ role TEACHER', () => body.data.forEach((u) => pm.expect(u.role).to.eql('TEACHER')));",
      ],
    }),
    request({
      name: `Admin cấp tài khoản STUDENT (${RESET_STUDENT}, dùng cho luồng quên mật khẩu)`,
      method: 'POST',
      path: 'users',
      auth: 'adminToken',
      body: { role: 'STUDENT', studentCode: RESET_STUDENT, password: NEW_PASSWORD },
      description: 'Username suy ra từ mã học sinh, không tự đặt được.',
      tests: [
        statusIn(201, 409),
        json,
        `if (pm.response.code === 201) { pm.test('username = ${RESET_STUDENT}', () => pm.expect(body.data.username).to.eql('${RESET_STUDENT}')); }`,
      ],
    }),
    request({
      name: `Tìm user ${RESET_STUDENT} (lấy id)`,
      path: 'users',
      query: { q: RESET_STUDENT, role: 'STUDENT' },
      auth: 'adminToken',
      tests: [
        ...ok(200),
        "pm.test('tìm thấy', () => pm.expect(body.data).to.have.lengthOf(1));",
        save('otherUserId', 'body.data[0].id'),
      ],
    }),
    request({
      name: 'Quên mật khẩu 1/5: Admin reset => mật khẩu tạm ngẫu nhiên',
      method: 'POST',
      path: 'users/{{otherUserId}}/reset-password',
      auth: 'adminToken',
      description:
        'Người dùng quên mật khẩu thì liên hệ Admin. Server sinh mật khẩu tạm ngẫu nhiên, chỉ trả về 1 lần; Admin không tự đặt được. Mọi phiên cũ của user bị thu hồi.',
      tests: [
        ...ok(200),
        "pm.test('có mật khẩu tạm 12 ký tự', () => pm.expect(body.data.temporaryPassword).to.match(/^[A-Za-z0-9]{12}$/));",
        "pm.test('không cache', () => pm.expect(pm.response.headers.get('Cache-Control')).to.eql('no-store'));",
        save('tempPassword', 'body.data.temporaryPassword'),
      ],
    }),
    request({
      name: `Quên mật khẩu 2/5: ${RESET_STUDENT} đăng nhập bằng mật khẩu tạm`,
      method: 'POST',
      path: 'auth/login',
      body: { username: RESET_STUDENT, password: '{{tempPassword}}' },
      tests: [...ok(200), save('otherToken', 'body.data.accessToken')],
    }),
    request({
      name: `Quên mật khẩu 3/5: ${RESET_STUDENT} tự đổi mật khẩu`,
      method: 'PUT',
      path: 'auth/password',
      auth: 'otherToken',
      body: { currentPassword: '{{tempPassword}}', newPassword: NEW_PASSWORD },
      description:
        'Phải nhập đúng mật khẩu hiện tại. Đổi xong mọi phiên bị thu hồi (kể cả phiên đang dùng) => đăng nhập lại.',
      tests: [...ok(200), "pm.test('data = null', () => pm.expect(body.data).to.eql(null));"],
    }),
    request({
      name: 'Quên mật khẩu 4/5: token cũ bị thu hồi',
      path: 'auth/me',
      auth: 'otherToken',
      tests: fail(401, 'UNAUTHENTICATED'),
    }),
    request({
      name: 'Quên mật khẩu 5/5: đăng nhập bằng mật khẩu mới',
      method: 'POST',
      path: 'auth/login',
      body: { username: RESET_STUDENT, password: NEW_PASSWORD },
      tests: [...ok(200), save('otherToken', 'body.data.accessToken')],
    }),
    request({
      name: 'Đăng xuất mọi thiết bị (logout-all)',
      method: 'POST',
      path: 'auth/logout-all',
      auth: 'otherToken',
      tests: ok(200),
    }),
    request({
      name: 'Sau logout-all token bị từ chối',
      path: 'auth/me',
      auth: 'otherToken',
      tests: fail(401, 'UNAUTHENTICATED'),
    }),
    request({
      name: 'STUDENT gọi /users bị chặn',
      path: 'users',
      auth: 'studentToken',
      tests: fail(403, 'FORBIDDEN'),
    }),
    request({ name: 'Không có token', path: 'users', tests: fail(401, 'UNAUTHENTICATED') }),
    request({
      name: 'Tham số sai: sort ngoài whitelist',
      path: 'users',
      query: { sort: 'password' },
      auth: 'adminToken',
      tests: fail(422, 'VALIDATION_ERROR'),
    }),
  ],
);

// ---------- 3. Lớp học ----------
const classes = folder(
  '3. Phân lớp và GVCN (Admin)',
  'Admin phân học sinh vào lớp (GVCN lớp đó quản lý ngay) và phân giáo viên làm GVCN. Các request trả dữ liệu về như cũ sau khi chạy.',
  [
    request({
      name: `Danh sách lớp (lấy id lớp ${OTHER_CLASS})`,
      path: 'classes',
      auth: 'adminToken',
      tests: [
        ...ok(200),
        `pm.test('có ${OTHER_CLASS} và ${CLASS}', () => pm.expect(body.data.map((c) => c.className)).to.include.members(['${OTHER_CLASS}', '${CLASS}']));`,
        `pm.test('id lớp ${CLASS} = classId của GVCN', () => pm.expect(String(body.data.find((c) => c.className === '${CLASS}').id)).to.eql(pm.collectionVariables.get('classId')));`,
        save('otherClassId', `body.data.find((c) => c.className === '${OTHER_CLASS}').id`),
      ],
    }),
    request({
      name: `Tìm học sinh ${STUDENT} (đúng học sinh đang đăng nhập)`,
      path: 'students',
      query: { q: STUDENT },
      auth: 'adminToken',
      tests: [
        ...ok(200),
        `pm.test('${STUDENT} đang ở ${CLASS}', () => pm.expect(body.data[0].className).to.eql('${CLASS}'));`,
        "pm.test('id = studentId', () => pm.expect(String(body.data[0].id)).to.eql(pm.collectionVariables.get('studentId')));",
      ],
    }),
    request({
      name: `Tìm học sinh ${OTHER_STUDENT} lớp ${OTHER_CLASS} (lấy id)`,
      path: 'students',
      query: { q: OTHER_STUDENT },
      auth: 'adminToken',
      tests: [
        ...ok(200),
        `pm.test('${OTHER_STUDENT} ở lớp ${OTHER_CLASS}', () => pm.expect(body.data[0].className).to.eql('${OTHER_CLASS}'));`,
        save('otherStudentId', 'body.data[0].id'),
      ],
    }),
    request({
      name: `Chuyển ${STUDENT} sang lớp ${OTHER_CLASS}`,
      method: 'PUT',
      path: 'students/{{studentId}}/class',
      auth: 'adminToken',
      body: { classId: '{{otherClassId}}' },
      pre: numeric('otherClassId'),
      description: `Chuyển lớp; GVCN của lớp mới quản lý học sinh ngay. classId = null để rút khỏi lớp. Request sau trả ${STUDENT} về ${CLASS}.`,
      tests: [
        ...ok(200),
        `pm.test('đã ở ${OTHER_CLASS}', () => pm.expect(body.data.className).to.eql('${OTHER_CLASS}'));`,
      ],
    }),
    request({
      name: `Trả ${STUDENT} về lớp ${CLASS}`,
      method: 'PUT',
      path: 'students/{{studentId}}/class',
      auth: 'adminToken',
      body: { classId: '{{classId}}' },
      pre: numeric('classId'),
      tests: [
        ...ok(200),
        `pm.test('đã ở ${CLASS}', () => pm.expect(body.data.className).to.eql('${CLASS}'));`,
      ],
    }),
    request({
      name: 'Học sinh chưa có lớp',
      path: 'students',
      query: { unassigned: 'true' },
      auth: 'adminToken',
      tests: [
        ...ok(200),
        "pm.test('mọi học sinh trả về đều chưa có lớp', () => body.data.forEach((s) => pm.expect(s.className).to.eql(null)));",
      ],
    }),
    request({
      name: `Phân ${TEACHER} làm GVCN lớp ${CLASS}`,
      method: 'PUT',
      path: 'classes/{{classId}}/teacher',
      auth: 'adminToken',
      body: { teacherUserId: '{{teacherUserId}}' },
      pre: numeric('teacherUserId'),
      description:
        'GVCN liên kết với tài khoản theo HỌ TÊN, nên bị từ chối (409) nếu có giáo viên khác trùng họ tên. teacherUserId = null để bỏ GVCN.',
      tests: [
        ...ok(200),
        `pm.test('GVCN = ${TEACHER}', () => pm.expect(body.data.teacher.username).to.eql('${TEACHER}'));`,
      ],
    }),
    request({
      name: 'TEACHER không được phân lớp',
      method: 'PUT',
      path: 'students/{{studentId}}/class',
      auth: 'teacherToken',
      body: { classId: null },
      tests: fail(403, 'FORBIDDEN'),
    }),
    request({
      name: 'Lớp không tồn tại',
      method: 'PUT',
      path: 'classes/999999/teacher',
      auth: 'adminToken',
      body: { teacherUserId: null },
      tests: fail(404, 'NOT_FOUND'),
    }),
  ],
);

// ---------- 4. Sổ điểm ----------
const grades = folder(
  '4. Sổ điểm điện tử và học lực',
  'GVCN nhập điểm; server tự tính TBM, GPA hệ 10 và hệ 4, xếp loại học lực.',
  [
    request({
      name: `Tạo điểm Toán (${STUDENT}, HK1)`,
      method: 'POST',
      path: 'grade-books',
      auth: 'teacherToken',
      body: gradeBody('Toán Học'),
      description:
        'GVCN hoặc Admin. 201 lần đầu, 409 nếu đã có (chạy lại). Server tự tính averageScore và gradeLetter, client không gửi.',
      pre: numeric('studentId'),
      tests: [
        statusIn(201, 409),
        json,
        "if (pm.response.code === 201) { pm.test('TBM = 8.9, xếp loại Giỏi', () => { pm.expect(body.data.averageScore).to.eql(8.9); pm.expect(body.data.gradeLetter).to.eql('Giỏi'); }); }",
        "if (pm.response.code === 409) { pm.test('đã tồn tại', () => pm.expect(body.error.code).to.eql('CONFLICT')); }",
      ],
    }),
    request({
      name: 'Điểm của học sinh (lấy gradeId môn Toán)',
      path: 'students/{{studentId}}/grades',
      query: TERM,
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        "const math = body.data.find((g) => g.subjectName === 'Toán Học');",
        "pm.test('có dòng điểm Toán', () => pm.expect(math).to.be.an('object'));",
        "pm.collectionVariables.set('gradeId', String(math.id));",
      ],
    }),
    request({
      name: 'Sửa điểm cuối kỳ (TBM tự tính lại)',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      body: { scoreFinalTerm: 9 },
      description: 'Chỉ gửi cột cần đổi. Gửi null để xóa điểm một cột.',
      tests: [
        ...ok(200),
        "pm.test('scoreFinalTerm = 9', () => pm.expect(body.data.scoreFinalTerm).to.eql(9));",
        "pm.test('TBM là số 0-10', () => pm.expect(body.data.averageScore).to.be.within(0, 10));",
      ],
    }),
    request({
      name: 'Sửa điểm sai: 11 điểm',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      body: { scoreFinalTerm: 11 },
      tests: [
        ...fail(422, 'VALIDATION_ERROR'),
        "pm.test('chỉ rõ field sai', () => pm.expect(body.error.details[0].field).to.eql('scoreFinalTerm'));",
      ],
    }),
    request({
      name: 'Sửa điểm sai: field lạ (averageScore do server tính)',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      body: { averageScore: 10 },
      tests: fail(422, 'VALIDATION_ERROR'),
    }),
    ...[
      ['Ngữ Văn', 9],
      ['Tiếng Anh', 8],
      ['Vật Lý', 7],
      ['Hóa Học', 9],
    ].map(([subject, score]) =>
      request({
        name: `Nhập điểm hàng loạt (bulk upsert): ${subject}`,
        method: 'POST',
        path: 'grade-books/bulk',
        auth: 'teacherToken',
        body: bulkBody(subject, score),
        description:
          'Một transaction: lỗi một dòng thì rollback tất cả. Dòng chưa có thì tạo, đã có thì cập nhật.',
        pre: numeric('classId', 'studentId'),
        tests: [
          ...ok(200),
          "pm.test('created + updated = 1', () => pm.expect(body.data.created + body.data.updated).to.eql(1));",
          ...(subject === 'Hóa Học' ? [save('chemGradeId', 'body.data.items[0].id')] : []),
        ],
      }),
    ),
    request({
      name: 'Bulk sai: danh sách rỗng',
      method: 'POST',
      path: 'grade-books/bulk',
      auth: 'teacherToken',
      body: { classId: '{{classId}}', subjectName: 'Toán Học', ...TERM, entries: [] },
      pre: numeric('classId'),
      tests: fail(422, 'VALIDATION_ERROR'),
    }),
    request({
      name: 'Sổ điểm cả lớp (phân trang, sắp xếp)',
      path: 'grade-books',
      query: { classId: '{{classId}}', ...TERM, sort: '-averageScore', page: 1, limit: 10 },
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        "pm.test('có meta', () => pm.expect(body.meta.total).to.be.a('number'));",
      ],
    }),
    request({
      name: 'Tổng kết học kỳ: TBM, GPA hệ 10, hệ 4, học lực (TEACHER)',
      path: 'students/{{studentId}}/summary',
      query: TERM,
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        "pm.test('đủ 5 môn nên isComplete = true', () => { pm.expect(body.data.subjects).to.have.lengthOf(5); pm.expect(body.data.isComplete).to.eql(true); });",
        "pm.test('GPA hệ 10 trong 0-10, hệ 4 trong 0-4', () => { pm.expect(body.data.gpa10).to.be.within(0, 10); pm.expect(body.data.gpa4).to.be.within(0, 4); });",
        "pm.test('có xếp loại học lực', () => pm.expect(['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu']).to.include(body.data.academicRank));",
      ],
    }),
    request({
      name: 'Tổng kết học kỳ: STUDENT xem của mình',
      path: 'students/{{studentId}}/summary',
      query: TERM,
      auth: 'studentToken',
      tests: ok(200),
    }),
    request({
      name: 'Tổng kết học kỳ: PARENT xem của con',
      path: 'students/{{studentId}}/summary',
      query: TERM,
      auth: 'parentToken',
      tests: ok(200),
    }),
    request({
      name: 'Gợi ý hạnh kiểm từ điểm danh',
      path: 'students/{{studentId}}/conduct-suggestion',
      query: { from: '2025-09-01', to: '2026-01-31' },
      auth: 'teacherToken',
      description: 'Chỉ là gợi ý. Hạnh kiểm chính thức do GVCN quyết định (chưa có bảng lưu).',
      tests: [
        ...ok(200),
        "pm.test('có thống kê vắng/trễ', () => pm.expect(body.data.absenceStats).to.have.all.keys('excused', 'unexcused', 'late'));",
        "pm.test('có mức gợi ý', () => pm.expect(body.data.suggestedConduct).to.be.a('string'));",
      ],
    }),
    request({
      name: 'Xóa mềm điểm Hóa Học',
      method: 'DELETE',
      path: 'grade-books/{{chemGradeId}}',
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        "pm.test('trả id', () => pm.expect(String(body.data.id)).to.eql(pm.collectionVariables.get('chemGradeId')));",
      ],
    }),
    request({
      name: 'Xóa lại dòng đã xóa',
      method: 'DELETE',
      path: 'grade-books/{{chemGradeId}}',
      auth: 'teacherToken',
      tests: fail(409, 'ALREADY_DELETED'),
    }),
    request({
      name: 'TEACHER không được khôi phục',
      method: 'POST',
      path: 'grade-books/{{chemGradeId}}/restore',
      auth: 'teacherToken',
      tests: fail(403, 'FORBIDDEN'),
    }),
    request({
      name: 'Admin khôi phục điểm đã xóa',
      method: 'POST',
      path: 'grade-books/{{chemGradeId}}/restore',
      auth: 'adminToken',
      tests: [
        ...ok(200),
        "pm.test('đã khôi phục', () => pm.expect(body.data.isDeleted).to.eql(false));",
      ],
    }),
    request({
      name: 'Khôi phục lại dòng chưa xóa',
      method: 'POST',
      path: 'grade-books/{{chemGradeId}}/restore',
      auth: 'adminToken',
      tests: fail(409, 'NOT_DELETED'),
    }),
    request({
      name: 'Tính lại TBM/GPA/xếp loại cả lớp',
      method: 'POST',
      path: 'classes/{{classId}}/recalculate',
      auth: 'teacherToken',
      body: TERM,
      tests: [
        ...ok(200),
        "pm.test('có số liệu', () => { pm.expect(body.data.processed).to.be.a('number'); pm.expect(body.data.gradesUpdated).to.be.a('number'); });",
      ],
    }),
  ],
);

// ---------- 5. Khóa / mở chốt sổ ----------
const lockBody = (extra = {}) => ({ classId: '{{classId}}', ...TERM, ...extra });
const locks = folder(
  '5. Khóa / mở chốt sổ điểm',
  'Khóa: Admin hoặc GVCN. Mở khóa: chỉ Admin, bắt buộc lý do. Khi khóa mọi thao tác ghi bị chặn.',
  [
    request({
      name: 'Dọn trạng thái: Admin mở khóa nếu lần chạy trước còn khóa',
      method: 'POST',
      path: 'grade-locks/unlock',
      auth: 'adminToken',
      body: lockBody({ reason: 'Dọn dẹp trước khi chạy collection' }),
      pre: numeric('classId'),
      tests: [statusIn(200, 409)],
    }),
    request({
      name: 'GVCN chốt sổ HK1',
      method: 'POST',
      path: 'grade-locks',
      auth: 'teacherToken',
      body: lockBody({ note: 'Chốt điểm HK1' }),
      description:
        'Trong 1 transaction: tính lại GPA/xếp loại lần cuối rồi chuyển các dòng APPROVED sang LOCKED.',
      pre: numeric('classId'),
      tests: [
        ...ok(201),
        "pm.test('đã khóa ít nhất 1 dòng', () => pm.expect(body.data.lockedRows).to.be.above(0));",
      ],
    }),
    request({
      name: 'Sửa điểm khi đã chốt',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      body: { scoreOral: 1 },
      tests: fail(409, 'GRADEBOOK_LOCKED'),
    }),
    request({
      name: 'Admin cũng không sửa được khi đang chốt',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'adminToken',
      body: { scoreOral: 1 },
      tests: fail(409, 'GRADEBOOK_LOCKED'),
    }),
    request({
      name: 'Xóa mềm khi đã chốt',
      method: 'DELETE',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      tests: fail(409, 'GRADEBOOK_LOCKED'),
    }),
    request({
      name: 'Chốt lần nữa',
      method: 'POST',
      path: 'grade-locks',
      auth: 'teacherToken',
      body: lockBody(),
      pre: numeric('classId'),
      tests: fail(409, 'GRADEBOOK_ALREADY_LOCKED'),
    }),
    request({
      name: 'Danh sách kỳ đã chốt',
      path: 'grade-locks',
      query: { page: 1, limit: 10 },
      auth: 'teacherToken',
      tests: [
        ...ok(200),
        `pm.test('có ${CLASS} HK1', () => pm.expect(body.data.some((l) => l.className === '${CLASS}' && l.semester === 'HK1')).to.eql(true));`,
      ],
    }),
    request({
      name: 'Tổng kết báo isLocked = true',
      path: 'students/{{studentId}}/summary',
      query: TERM,
      auth: 'studentToken',
      tests: [...ok(200), "pm.test('isLocked', () => pm.expect(body.data.isLocked).to.eql(true));"],
    }),
    request({
      name: 'TEACHER không được mở khóa',
      method: 'POST',
      path: 'grade-locks/unlock',
      auth: 'teacherToken',
      body: lockBody({ reason: 'Muốn sửa điểm gấp lắm' }),
      pre: numeric('classId'),
      tests: fail(403, 'FORBIDDEN'),
    }),
    request({
      name: 'Mở khóa thiếu lý do (quá ngắn)',
      method: 'POST',
      path: 'grade-locks/unlock',
      auth: 'adminToken',
      body: lockBody({ reason: 'ngắn' }),
      pre: numeric('classId'),
      tests: fail(422, 'VALIDATION_ERROR'),
    }),
    request({
      name: 'Admin mở khóa (có lý do)',
      method: 'POST',
      path: 'grade-locks/unlock',
      auth: 'adminToken',
      body: lockBody({ reason: `Sửa sai điểm Toán ${STUDENT}` }),
      pre: numeric('classId'),
      tests: [
        ...ok(200),
        "pm.test('đã mở khóa', () => pm.expect(body.data.unlockedRows).to.be.above(0));",
      ],
    }),
    request({
      name: 'Mở khóa kỳ chưa chốt',
      method: 'POST',
      path: 'grade-locks/unlock',
      auth: 'adminToken',
      body: lockBody({ reason: 'Mở khóa lần hai' }),
      pre: numeric('classId'),
      tests: fail(409, 'CONFLICT'),
    }),
    request({
      name: 'Sửa điểm lại được sau khi mở khóa',
      method: 'PUT',
      path: 'grade-books/{{gradeId}}',
      auth: 'teacherToken',
      body: { scoreOral: 9 },
      tests: ok(200),
    }),
  ],
);

// ---------- 6. Bảo mật / phân quyền ----------
const security = folder('6. Kiểm tra phân quyền và bảo mật', 'Các trường hợp PHẢI bị từ chối.', [
  request({
    name: 'STUDENT tạo điểm',
    method: 'POST',
    path: 'grade-books',
    auth: 'studentToken',
    body: gradeBody('Toán Học'),
    pre: numeric('studentId'),
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: 'PARENT sửa điểm',
    method: 'PUT',
    path: 'grade-books/{{gradeId}}',
    auth: 'parentToken',
    body: { scoreFinalTerm: 10 },
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: 'STUDENT xem sổ điểm cả lớp',
    path: 'grade-books',
    query: { classId: '{{classId}}' },
    auth: 'studentToken',
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: 'PARENT chốt sổ',
    method: 'POST',
    path: 'grade-locks',
    auth: 'parentToken',
    body: lockBody(),
    pre: numeric('classId'),
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: 'STUDENT khôi phục điểm',
    method: 'POST',
    path: 'grade-books/{{chemGradeId}}/restore',
    auth: 'studentToken',
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: `STUDENT xem điểm học sinh khác (${OTHER_STUDENT})`,
    path: 'students/{{otherStudentId}}/summary',
    query: TERM,
    auth: 'studentToken',
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: `GVCN ${CLASS} xem học sinh lớp ${OTHER_CLASS} (${OTHER_STUDENT})`,
    path: 'students/{{otherStudentId}}/grades',
    query: TERM,
    auth: 'teacherToken',
    tests: fail(403, 'FORBIDDEN'),
  }),
  request({
    name: 'Không token',
    path: 'students/{{studentId}}/grades',
    tests: fail(401, 'UNAUTHENTICATED'),
  }),
  request({
    name: 'Token rác',
    path: 'auth/me',
    auth: 'invalidToken',
    tests: fail(401, 'UNAUTHENTICATED'),
  }),
  request({
    name: 'Refresh token dùng làm access token',
    path: 'auth/me',
    auth: 'teacherRefreshToken',
    tests: fail(401, 'UNAUTHENTICATED'),
  }),
  request({
    name: 'id sai kiểu',
    path: 'students/abc/grades',
    auth: 'adminToken',
    tests: fail(422, 'VALIDATION_ERROR'),
  }),
  request({
    name: 'Học sinh không tồn tại',
    path: 'students/999999/summary',
    auth: 'adminToken',
    tests: fail(404, 'NOT_FOUND'),
  }),
  request({
    name: 'Đường dẫn không tồn tại',
    path: 'khong-co-duong-nay',
    tests: fail(404, 'NOT_FOUND'),
  }),
]);

// ---------- collection ----------
const variable = (key, value) => ({ key, value, type: 'string' });
const credentialVariables = [
  variable('baseUrl', `http://localhost:${env('PORT', '3000')}`),
  variable('adminUsername', env('ADMIN_USERNAME', 'admin').toLowerCase()),
  variable('adminPassword', env('ADMIN_PASSWORD', 'ChangeMe@12345')),
  // Mật khẩu Admin đặt cho mọi tài khoản cấp trong collection
  variable('newUserPassword', 'Passw0rd2026'),
];
const runtimeVariables = [
  'adminToken',
  'adminRefreshToken',
  'adminUserId',
  'teacherToken',
  'teacherRefreshToken',
  'teacherUserId',
  'studentToken',
  'studentRefreshToken',
  'studentUserId',
  'parentToken',
  'parentRefreshToken',
  'parentUserId',
  'impersonateToken',
  'tmpToken',
  'tmpRefreshToken',
  'tmpOldRefreshToken',
  'classId',
  'studentId',
  'gradeId',
  'chemGradeId',
  'otherUserId',
  'otherToken',
  'tempPassword',
  'otherClassId',
  'otherStudentId',
].map((key) => variable(key, ''));
runtimeVariables.push(variable('invalidToken', 'abc.def.ghi'));

const collection = {
  info: {
    _postman_id: COLLECTION_ID,
    name: 'HTQLLH – Member 4: Auth, RBAC và Sổ điểm',
    description: [
      '# HTQLLH – Auth, RBAC, Sổ điểm điện tử',
      '',
      'Collection chạy **tuần tự từ trên xuống** (Collection Runner hoặc `newman`). Token và id được lưu tự động vào biến collection; request sau dùng kết quả của request trước nên **không chạy lẻ từng nhóm**.',
      '',
      '## Chuẩn bị',
      '1. `docker compose up -d`, `npm run seed:admin`, `npm run dev`. Không cần seed:demo: collection tự cấp tài khoản.',
      '2. `npm run postman:generate` để baseUrl và tài khoản Admin khớp `.env` (PORT, ADMIN_USERNAME, ADMIN_PASSWORD).',
      '3. Import collection và environment `HTQLLH-Local`, chọn environment đó, chạy toàn bộ bằng Collection Runner. Hoặc dòng lệnh: `npm run postman:run`.',
      '',
      '## Chạy lại',
      '- Chạy lại nhiều lần không hỏng: request tạo dữ liệu chấp nhận 201 hoặc 409, phân lớp được trả về như cũ, sổ điểm được mở khóa lại, HS003 luôn kết thúc với mật khẩu `newUserPassword`.',
      '- Rate limit: đăng nhập 5 lần/phút theo (IP + username); refresh và đổi mật khẩu 10 lần/phút theo IP. Hai lần chạy liên tiếp nên cách nhau khoảng 1 phút (hoặc đặt `RATE_LIMIT_ENABLED=false` khi dev).',
      '',
      '## Nhóm request',
      '0. Health · 1. Auth và cấp tài khoản · 2. User và mật khẩu · 3. Phân lớp và GVCN · 4. Sổ điểm · 5. Khóa sổ · 6. Phân quyền và bảo mật',
      '',
      '## Quy ước',
      '- Mọi body là JSON (`Content-Type: application/json`). Không có endpoint form-data.',
      '- Response: `{ success, data, meta? }` hoặc `{ success:false, error:{ code, message, details? }, requestId }`.',
      '- Role: ADMIN, TEACHER, STUDENT, PARENT. Mọi tài khoản do Admin cấp (`POST /users`), người dùng tự đăng nhập và tự đổi mật khẩu.',
      `- Admin: \`{{adminUsername}}\` / \`{{adminPassword}}\` (lấy từ .env). Admin cấp trong nhóm 1: \`${TEACHER}\` (GVCN ${CLASS}), \`${STUDENT}\` (lớp ${CLASS}), \`${PARENT}\`; nhóm 2 cấp thêm \`${RESET_STUDENT}\`. Tất cả dùng mật khẩu \`{{newUserPassword}}\`.`,
    ].join('\n'),
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          "pm.test('Response là JSON', () => pm.expect(pm.response.headers.get('Content-Type') || '').to.include('application/json'));",
          "pm.test('Có header X-Request-Id', () => pm.expect(pm.response.headers.has('X-Request-Id')).to.eql(true));",
          "pm.test('Phản hồi dưới 3 giây', () => pm.expect(pm.response.responseTime).to.be.below(3000));",
        ],
      },
    },
  ],
  item: [health, auth, users, classes, grades, locks, security],
  variable: [...credentialVariables, ...runtimeVariables],
};

const environment = {
  id: ENVIRONMENT_ID,
  name: 'HTQLLH-Local',
  values: credentialVariables.map(({ key, value }) => ({
    key,
    value,
    type: /password/i.test(key) ? 'secret' : 'default',
    enabled: true,
  })),
  _postman_variable_scope: 'environment',
  _postman_exported_using: 'scripts/generate-postman.js',
};

mkdirSync('postman', { recursive: true });
writeFileSync('postman/HTQLLH.postman_collection.json', `${JSON.stringify(collection, null, 2)}\n`);
writeFileSync(
  'postman/HTQLLH-Local.postman_environment.json',
  `${JSON.stringify(environment, null, 2)}\n`,
);

const count = (items) => items.reduce((n, i) => n + (i.item ? count(i.item) : 1), 0);
console.log(`Đã tạo postman/ (${count(collection.item)} request, ${collection.item.length} nhóm)`);
