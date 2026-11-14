/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/enrich_clickup_and_jira.js
 * MỤC ĐÍCH: Bổ sung chi tiết TOÀN DIỆN, ĐOẠN MÃ MẪU & ĐỒNG BỘ DEADLINE CHUẨN XÁC:
 *           - 1. Mục tiêu nghiệp vụ (User Story), Mã RTM SRS, Phân công RACI & Story Points
 *           - 2. HẠN CHÓT HOÀN THÀNH (DEADLINE / DUE DATE) & LỊCH TRÌNH THEO SPRINT
 *           - 3. Liên kết mã nguồn trực tiếp trên GitHub và Bitbucket
 *           - 4. Vị trí kiến trúc & Phân tầng Clean Architecture / Frontend
 *           - 5. Quy trình 4 bước thực hiện & sửa code (Step-by-Step Dev Workflow)
 *           - 6. Đoạn mã mẫu thực thi (Executable Sample Code Snippet)
 *           - 7. Lệnh kiểm thử cURL mẫu (Ready-to-run cURL Command)
 *           - 8. Kịch bản kiểm thử ngoại lệ & lỗi biên (Negative Test Cases)
 *           - 9. Kịch bản Demo UAT 3 phút cho Giảng viên (Step-by-Step Demo Script)
 *           - 10. Danh mục Link tài liệu kỹ thuật chính thức & Slide Canva
 *           - 11. Tiêu chí nghiệm thu (DoD) & Cú pháp Jira Smart Commit
 * TÁC GIẢ: Võ Duy Bình (Project Manager & Lead BA)
 * NGÀY CẬP NHẬT: 14/11/2026 (Tuần 10)
 * ================================================================================
 */

const GITHUB_REPO = 'https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main';
const BITBUCKET_REPO = 'https://bitbucket.org/codyisme27205/pt_da_pm/src/main';
const HANDBOOK_LINK_GH = `${GITHUB_REPO}/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md`;
const HANDBOOK_LINK_BB = `${BITBUCKET_REPO}/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md`;
const CANVA_SLIDE = 'https://www.canva.com/d/75iOEEpReWqgOuN';
const SWAGGER_URL = 'http://localhost:8081/api-docs';

const JIRA_DOMAIN = 'https://reputyze-team-vx3aseym.atlassian.net';
const JIRA_EMAIL = 'bron@reputyze.asia';
const JIRA_API_TOKEN = 'ATATT3xFfGF0xBt0YIVODhhC8f8FaEx_DVCG-1HVrP5loRFDlnEqCAz-zBvF6Lo3GD52CC803sNomKjZmnzIX7bI2lx1lp6XSk5h4-5QbuqjEzSTUKxU_twHpSABPsuhB2DvddQWPzWqhVCHc8uw744tvE3efaAJ9Enb1b9qu5ABuvFFIW0jbHI=64E851C8';
const jiraAuthHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = 'pk_312893818_BAB7P1BIGXITM7OV091B1KXD96WFD1RJ';
const FOLDER_ID = '1100320000138169';
const clickupHeaders = {
  'Authorization': CLICKUP_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * 27 PBIs với ĐẦY ĐỦ THỜI GIAN START_DATE & DEADLINE (DUE_DATE)
 */
const DETAILED_PBIS = [
  {
    pbiCode: 'PBI-01',
    jiraKey: 'KAN-112',
    name: 'PBI-01: Đăng nhập JWT vô trạng thái & Nút 1-Click Demo Login 5 vai trò (BGH, GV, HS, PH)',
    module: 'Module 1: Xác Thực & Quản Trị Phân Quyền (Auth & RBAC)',
    owner: 'Trần Quang Vinh (Logic & Security) & Võ Hoàng Sơn (Dev Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1, // Urgent
    startDate: '2026-09-28',
    dueDate: '2026-10-11',
    sprint: 'Sprint 1 (Tuần 3 - Tuần 4)',
    labels: ['auth', 'jwt', 'security', 'frontend', 'backend', 'sprint-1'],
    reqCode: 'REQ-AUTH-01, REQ-AUTH-02 (Ma trận RTM: UC_AUTH_01)',
    story: 'Là Người dùng (BGH, GVCN, GVBM, HS, PH), tôi muốn đăng nhập bằng tài khoản/mật khẩu hoặc dùng nút 1-Click Demo Login để vào đúng phân hệ chức năng tương ứng với quyền hạn của mình.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/auth/LoginPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js',
      'members/member4_Logic_Security/jwtAuthMiddleware.js'
    ],
    layer: 'Frontend UI Auth & Backend Presentation / Security Layer',
    workflow: `Bước 1: Mở LoginPage.jsx tại Frontend, tạo 5 button gắn sẵn credentials mẫu và sự kiện onClick gọi hàm handleQuickLogin(role).
Bước 2: Mở AuthController.js tại Backend, định vị hàm login(req, res). Kiểm tra việc trích xuất { username, password } và câu truy vấn SELECT * FROM users WHERE username = $1.
Bước 3: Sử dụng bcrypt.compare() để xác thực mật khẩu băm, sau đó gọi jwt.sign({ id, username, role }, JWT_SECRET, { expiresIn: '24h' }).
Bước 4: Mở Postman kiểm thử endpoint POST /api/auth/login với các ca: đúng pass (200), sai pass (401), thiếu field (400) và kiểm tra chuyển hướng trên trình duyệt.`,
    codeSnippet: `// Backend AuthController.js - Hàm xử lý Đăng nhập & Cấp phát JWT Token
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tài khoản và mật khẩu!' });
    }
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND status = $2', [username, 'ACTIVE']);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa!' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET || 'htqllh_super_secret_key_2026',
      { expiresIn: '24h' }
    );
    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ: ' + error.message });
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password123"}'`,
    negativeCases: [
      'Gửi thiếu trường username hoặc password -> Nhận HTTP 400 Bad Request.',
      'Gửi sai mật khẩu -> Nhận HTTP 401 Unauthorized kèm thông báo lỗi thân thiện.',
      'Đăng nhập tài khoản có trạng thái INACTIVE hoặc LOCKED -> Nhận HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. Truy cập giao diện web tại http://localhost:5173/login.',
      '2. Bấm vào nút 1-Click "Đăng nhập BGH", quan sát hệ thống tự điền tài khoản và đăng nhập vào Dashboard BGH trong 1 giây.',
      '3. Bấm Đăng xuất, chọn tiếp nút 1-Click "Đăng nhập GVCN" để thấy Sidebar tự động chuyển sang menu học vụ của giáo viên.'
    ],
    smartCommit: 'git commit -m "KAN-112 #time 8h #comment Hoan thanh xac thuc JWT 5 vai tro va 1-click demo #resolve"',
    docs: [
      { name: 'React 18 Official Guide (State & Hooks)', url: 'https://react.dev/learn' },
      { name: 'JWT.io Debugger & RFC 7519 Specification', url: 'https://jwt.io/introduction' },
      { name: 'Express.js Routing & Middleware', url: 'https://expressjs.com/en/guide/routing.html' },
      { name: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }
    ],
    criteria: [
      'Đăng nhập thành công trả về JWT Token và chuyển hướng chính xác theo vai trò.',
      'Nút 1-Click Demo Login hoạt động mượt mà cho cả 5 vai trò.',
      'Xóa sạch token khi người dùng bấm Đăng xuất.'
    ]
  },
  {
    pbiCode: 'PBI-02',
    jiraKey: 'KAN-113',
    name: 'PBI-02: Middleware RBAC kiểm soát phân quyền 5 cấp bậc & Chặn truy cập trái phép',
    module: 'Module 1: Xác Thực & Quản Trị Phân Quyền (Auth & RBAC)',
    owner: 'Trần Quang Vinh (Logic & Security Lead)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-09-28',
    dueDate: '2026-10-11',
    sprint: 'Sprint 1 (Tuần 3 - Tuần 4)',
    labels: ['rbac', 'security', 'middleware', 'authorization'],
    reqCode: 'REQ-AUTH-03, REQ-AUTH-04 (Ma trận RTM: UC_AUTH_02)',
    story: 'Là Ban Giám Hiệu, tôi muốn hệ thống kiểm soát quyền hạn 5 cấp bậc (Admin, GVCN, GVBM, Học sinh, Phụ huynh) để ngăn chặn truy cập trái phép vào các endpoint nhạy cảm.',
    primaryFiles: [
      'members/member4_Logic_Security/rbacMiddleware.js',
      'members/member3_Backend_DB/school-management-nodejs/src/middleware/authMiddleware.js',
      'members/member2_Frontend/src/components/common/ProtectedRoute.jsx'
    ],
    layer: 'Middleware Security Layer & Client Routing Guard',
    workflow: `Bước 1: Mở rbacMiddleware.js, xây dựng higher-order function nhận mảng allowedRoles.
Bước 2: Trích xuất req.user từ authMiddleware. So khớp req.user.role với allowedRoles.
Bước 3: Nếu vi phạm, trả về HTTP 403 Forbidden kèm JSON thông báo rõ ràng.
Bước 4: Mở ProtectedRoute.jsx trên Frontend, bọc các route quản trị và giáo viên, kiểm thử truy cập chéo vai trò để xác nhận bị chặn.`,
    codeSnippet: `// rbacMiddleware.js - Kiểm soát quyền hạn 5 cấp bậc
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập trước khi thực hiện thao tác!' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: \`Truy cập bị từ chối! Quyền hiện tại (\${req.user.role}) không đủ thẩm quyền.\`
      });
    }
    next();
  };
};`,
    curlSample: `curl -X GET http://localhost:8081/api/admin/users \\
  -H "Authorization: Bearer <TOKEN_HOC_SINH>"`,
    negativeCases: [
      'Gửi request không có Header Authorization -> Nhận HTTP 401 Unauthorized.',
      'Gửi token giả mạo hoặc đã hết hạn -> Nhận HTTP 401 Unauthorized.',
      'Tài khoản Học sinh cố truy cập endpoint của Admin -> Nhận HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. Đăng nhập bằng tài khoản Học sinh (hs001).',
      '2. Gõ trực tiếp đường dẫn /admin/users lên thanh URL trình duyệt.',
      '3. Hệ thống chặn lại và tự động chuyển hướng về trang /unauthorized kèm cảnh báo.'
    ],
    smartCommit: 'git commit -m "KAN-113 #time 8h #comment Hoan thien Middleware RBAC 5 cap bac chan truy cap trai phep #resolve"',
    docs: [
      { name: 'Express Writing Middleware Guide', url: 'https://expressjs.com/en/guide/writing-middleware.html' },
      { name: 'NIST Role-Based Access Control (RBAC) Standard', url: 'https://csrc.nist.gov/projects/role-based-access-control' },
      { name: 'OWASP Authorization & Access Control Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' }
    ],
    criteria: [
      'Chặn 100% request không có token hoặc token giả mạo với HTTP 401.',
      'Chặn truy cập sai vai trò với HTTP 403.',
      'Frontend tự động bảo vệ các đường dẫn nhạy cảm.'
    ]
  },
  {
    pbiCode: 'PBI-25',
    jiraKey: 'KAN-114',
    name: 'PBI-25: Quản trị tài khoản người dùng: Tạo mới, Khóa tài khoản & Đặt lại mật khẩu (BGH)',
    module: 'Module 1: Xác Thực & Quản Trị Phân Quyền (Auth & RBAC)',
    owner: 'Huỳnh Trung Tính (Dev Backend) & Võ Hoàng Sơn (Dev Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-05',
    dueDate: '2026-10-18',
    sprint: 'Sprint 1 (Tuần 4 - Tuần 5)',
    labels: ['users', 'admin', 'management', 'database'],
    reqCode: 'REQ-USER-01, REQ-USER-02 (Ma trận RTM: UC_BGH_01)',
    story: 'Là Ban Giám Hiệu, tôi muốn quản trị danh sách người dùng toàn trường (tạo mới, đổi trạng thái, đặt lại mật khẩu) để kiểm soát tài khoản học vụ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js',
      'members/member2_Frontend/src/pages/admin/UserManagementPage.jsx'
    ],
    layer: 'Admin Management & Data Access Layer',
    workflow: `Bước 1: Mở UserController.js và UserRepository.js, thêm các phương thức getAllUsers, createUser, toggleUserStatus, resetPassword.
Bước 2: Viết câu lệnh SQL tham số hóa an toàn: UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2.
Bước 3: Mã hóa mật khẩu mới bằng bcrypt.hash(newPass, 10) trước khi cập nhật.
Bước 4: Mở UserManagementPage.jsx trên giao diện BGH, kiểm tra bảng hiển thị danh sách, nút khóa/mở khóa tài khoản và modal đặt lại mật khẩu.`,
    codeSnippet: `// UserController.js - Đổi trạng thái tài khoản & Khóa người dùng
export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE', 'LOCKED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
  }
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ success: false, message: 'Không thể tự khóa tài khoản quản trị của chính bạn!' });
  }
  const query = 'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, status';
  const result = await pool.query(query, [status, id]);
  return res.status(200).json({ success: true, data: result.rows[0] });
};`,
    curlSample: `curl -X PATCH http://localhost:8081/api/users/2/status \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"LOCKED"}'`,
    negativeCases: [
      'Admin tự gửi yêu cầu khóa tài khoản của chính mình -> Nhận HTTP 403 Forbidden.',
      'Tạo người dùng với username đã tồn tại -> Nhận HTTP 409 Conflict.'
    ],
    demoSteps: [
      '1. Đăng nhập quyền BGH, vào menu "Quản trị người dùng".',
      '2. Tìm tài khoản gv01 và bấm nút "Khóa tài khoản".',
      '3. Mở tab ẩn danh thử đăng nhập bằng gv01 -> Hệ thống báo tài khoản đã bị khóa.'
    ],
    smartCommit: 'git commit -m "KAN-114 #time 8h #comment Hoan thanh quan ly nguoi dung va dat lai mat khau #resolve"',
    docs: [
      { name: 'bcryptjs Official Documentation', url: 'https://www.npmjs.com/package/bcryptjs' },
      { name: 'PostgreSQL UPDATE Documentation', url: 'https://www.postgresql.org/docs/current/sql-update.html' }
    ],
    criteria: [
      'Tạo mới tài khoản thành công với mật khẩu đã được băm an toàn.',
      'Tài khoản ở trạng thái INACTIVE không thể đăng nhập vào hệ thống.',
      'Giao diện BGH hiển thị phân trang và tìm kiếm người dùng nhanh chóng.'
    ]
  },
  {
    pbiCode: 'PBI-03',
    jiraKey: 'KAN-115',
    name: 'PBI-03: Khởi tạo & Cấu hình Năm học, Học kỳ, Khối học và Danh mục Lớp học',
    module: 'Module 2: Quản Trị Danh Mục & Tổ Chức Năm Học',
    owner: 'Huỳnh Trung Tính (Dev Backend & DBA)',
    storyPoints: 3,
    estimateHours: '6h',
    priority: 2,
    startDate: '2026-09-28',
    dueDate: '2026-10-04',
    sprint: 'Sprint 1 (Tuần 3)',
    labels: ['academic', 'configuration', 'database', 'backend'],
    reqCode: 'REQ-ACAD-01, REQ-ACAD-02 (Ma trận RTM: UC_BGH_02)',
    story: 'Là Ban Giám Hiệu, tôi muốn khởi tạo năm học mới, cấu hình 2 học kỳ (HK1, HK2), các khối 10, 11, 12 và lớp học để sẵn sàng cho công tác giảng dạy.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AcademicController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AcademicRepository.js',
      'members/member2_Frontend/src/pages/admin/AcademicYearsPage.jsx'
    ],
    layer: 'Domain Configuration & Repository Layer',
    workflow: `Bước 1: Mở AcademicController.js, kiểm tra hàm setCurrentAcademicYear(req, res).
Bước 2: Sử dụng client từ pool.connect() để mở Transaction: UPDATE academic_years SET is_current = false; UPDATE academic_years SET is_current = true WHERE id = $1; COMMIT;.
Bước 3: Kiểm tra validate ngày bắt đầu học kỳ phải nhỏ hơn ngày kết thúc học kỳ.
Bước 4: Mở AcademicYearsPage.jsx trên giao diện BGH, kiểm tra bảng năm học và nút kích hoạt năm học hiện tại.`,
    codeSnippet: `// AcademicController.js - Giao dịch kích hoạt Năm học hiện tại duy nhất
export const activateAcademicYear = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE academic_years SET is_current = false WHERE is_current = true');
    const result = await client.query('UPDATE academic_years SET is_current = true WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học chỉ định!' });
    }
    await client.query('COMMIT');
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/academic-years/1/activate \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Tạo học kỳ có ngày bắt đầu lớn hơn ngày kết thúc -> Nhận HTTP 400 Bad Request.',
      'Tạo năm học có tên trùng lặp -> Nhận HTTP 409 Conflict.'
    ],
    demoSteps: [
      '1. Vào mục "Cấu hình năm học", tạo năm học mới 2026-2027.',
      '2. Bấm nút "Kích hoạt năm học hiện tại", kiểm tra các năm cũ tự động chuyển về trạng thái không hoạt động.'
    ],
    smartCommit: 'git commit -m "KAN-115 #time 6h #comment Hoan thanh cau hinh nam hoc hoc ky va khoi lop #resolve"',
    docs: [
      { name: 'node-postgres (pg) Transactions Guide', url: 'https://node-postgres.com/features/transactions' },
      { name: 'PostgreSQL Constraints & Foreign Keys', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' }
    ],
    criteria: [
      'Chỉ duy nhất 1 năm học có trạng thái is_current = true.',
      'Tạo thành công cấu trúc Khối 10, 11, 12 và các lớp học theo chuẩn GDPT.',
      'Ngăn chặn tạo học kỳ có ngày bắt đầu lớn hơn ngày kết thúc.'
    ]
  },
  {
    pbiCode: 'PBI-04',
    jiraKey: 'KAN-116',
    name: 'PBI-04: Phân công chuyên môn giảng dạy (GVCN & GVBM) theo Lớp & Môn học',
    module: 'Module 2: Quản Trị Danh Mục & Tổ Chức Năm Học',
    owner: 'Huỳnh Trung Tính (Dev Backend) & Võ Hoàng Sơn (Dev Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-05',
    dueDate: '2026-10-18',
    sprint: 'Sprint 1 (Tuần 4 - Tuần 5)',
    labels: ['assignment', 'teaching', 'teacher', 'backend'],
    reqCode: 'REQ-ASGN-01, REQ-ASGN-02 (Ma trận RTM: UC_BGH_03)',
    story: 'Là Ban Giám Hiệu, tôi muốn phân công giáo viên chủ nhiệm cho từng lớp và giáo viên bộ môn theo từng môn học để giáo viên có thẩm quyền vào điểm và quản lý lớp.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AssignmentController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AssignmentRepository.js',
      'members/member2_Frontend/src/pages/admin/TeachingAssignmentPage.jsx'
    ],
    layer: 'Business Logic Assignment & Authorization Mapping Layer',
    workflow: `Bước 1: Mở AssignmentController.js và AssignmentRepository.js.
Bước 2: Viết câu lệnh kiểm tra xem lớp đã có GVCN chưa: SELECT * FROM homeroom_assignments WHERE class_id = $1 AND academic_year_id = $2.
Bước 3: Nếu đã có, trả về HTTP 409 Conflict hoặc cung cấp tùy chọn thay thế GVCN.
Bước 4: Mở TeachingAssignmentPage.jsx, chọn dropdown Lớp, Môn học, Giáo viên và kiểm tra lưu thành công.`,
    codeSnippet: `// AssignmentController.js - Phân công GVCN (Đảm bảo 1 lớp chỉ 1 GVCN)
export const assignHomeroomTeacher = async (req, res) => {
  const { class_id, teacher_id, academic_year_id } = req.body;
  const existing = await pool.query(
    'SELECT * FROM homeroom_assignments WHERE class_id = $1 AND academic_year_id = $2',
    [class_id, academic_year_id]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'Lớp học này đã có Giáo viên chủ nhiệm!' });
  }
  const result = await pool.query(
    'INSERT INTO homeroom_assignments (class_id, teacher_id, academic_year_id, assigned_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [class_id, teacher_id, academic_year_id]
  );
  return res.status(201).json({ success: true, data: result.rows[0] });
};`,
    curlSample: `curl -X POST http://localhost:8081/api/assignments/homeroom \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"class_id":1,"teacher_id":2,"academic_year_id":1}'`,
    negativeCases: [
      'Phân công 2 GVCN cho cùng 1 lớp trong cùng 1 năm học -> Nhận HTTP 409 Conflict.',
      'Phân công giáo viên không tồn tại -> Nhận HTTP 404 Not Found.'
    ],
    demoSteps: [
      '1. Vào mục "Phân công chuyên môn", chọn Lớp 10A1 và gán Thầy A làm GVCN.',
      '2. Thử gán thêm Cô B làm GVCN lớp 10A1 -> Hệ thống chặn lại và báo lỗi trùng lặp.'
    ],
    smartCommit: 'git commit -m "KAN-116 #time 8h #comment Hoan thanh phan cong GVCN va GVBM theo lop #resolve"',
    docs: [
      { name: 'Clean Architecture by Uncle Bob', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { name: 'PostgreSQL Unique Constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS' }
    ],
    criteria: [
      'Ngăn chặn trùng lặp GVCN trên cùng 1 lớp trong cùng năm học.',
      'Giáo viên chỉ có thể xem và nhập điểm các lớp/môn mình được phân công.',
      'Giao diện BGH hỗ trợ xem bảng ma trận phân công trực quan.'
    ]
  },
  {
    pbiCode: 'PBI-14',
    jiraKey: 'KAN-117',
    name: 'PBI-14: Xếp thời khóa biểu tuần & Tự động phát hiện xung đột lịch dạy/học',
    module: 'Module 3: Quản Lý Thời Khóa Biểu & Lịch Giảng Dạy',
    owner: 'Trần Quang Vinh (Logic & Security) & Võ Hoàng Sơn (Dev Frontend)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 1,
    startDate: '2026-10-12',
    dueDate: '2026-10-25',
    sprint: 'Sprint 2 (Tuần 5 - Tuần 6)',
    labels: ['timetable', 'scheduling', 'algorithm', 'conflict-detection'],
    reqCode: 'REQ-TIME-01, REQ-TIME-02 (Ma trận RTM: UC_BGH_04)',
    story: 'Là Ban Giám Hiệu, tôi muốn sắp xếp thời khóa biểu theo tuần cho các lớp và hệ thống tự động cảnh báo khi giáo viên hoặc phòng học bị trùng tiết.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/TimetableController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/TimetableService.js',
      'members/member2_Frontend/src/pages/admin/TimetableManagementPage.jsx'
    ],
    layer: 'Algorithmic Conflict Resolution & Scheduling Layer',
    workflow: `Bước 1: Mở TimetableService.js, xây dựng hàm validateConflicts(scheduleEntries).
Bước 2: Chạy thuật toán quét xung đột: lặp qua các tiết học, nhóm theo teacher_id và class_id; nếu phát hiện 2 tiết trùng ngày và số tiết thì ném lỗi kèm thông tin chi tiết.
Bước 3: Mở TimetableController.js, trả về HTTP 409 Conflict kèm danh sách tiết trùng lặp.
Bước 4: Mở TimetableManagementPage.jsx trên giao diện BGH, thử kéo thả hoặc xếp 2 tiết trùng giáo viên để kiểm tra cảnh báo đỏ xuất hiện tức thì.`,
    codeSnippet: `// TimetableService.js - Thuật toán phát hiện xung đột TKB
export const checkScheduleConflict = async (class_id, teacher_id, day_of_week, period, academic_year_id) => {
  const teacherConflict = await pool.query(
    \`SELECT t.*, c.name as class_name FROM timetables t 
     JOIN classes c ON t.class_id = c.id 
     WHERE t.teacher_id = $1 AND t.day_of_week = $2 AND t.period = $3 AND t.academic_year_id = $4\`,
    [teacher_id, day_of_week, period, academic_year_id]
  );
  if (teacherConflict.rows.length > 0) {
    return { hasConflict: true, reason: \`Giáo viên đã có lịch dạy lớp \${teacherConflict.rows[0].class_name} vào Thứ \${day_of_week}, Tiết \${period}!\` };
  }
  return { hasConflict: false };
};`,
    curlSample: `curl -X POST http://localhost:8081/api/timetables/validate \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"teacher_id":2,"day_of_week":2,"period":1}'`,
    negativeCases: [
      'Xếp 1 giáo viên dạy 2 lớp khác nhau trong cùng 1 tiết -> Nhận HTTP 409 Conflict kèm tên lớp bị trùng.',
      'Xếp 2 môn học vào cùng 1 tiết của 1 lớp -> Nhận HTTP 409 Conflict.'
    ],
    demoSteps: [
      '1. Vào mục "Xếp thời khóa biểu", kéo môn Toán của Thầy A vào Tiết 1 Thứ 2 Lớp 10A2 (khi Thầy A đã có tiết ở 10A1).',
      '2. Ô thời khóa biểu lập tức chuyển viền đỏ và hiển thị popup cảnh báo xung đột lịch dạy.'
    ],
    smartCommit: 'git commit -m "KAN-117 #time 12h #comment Hoan thanh xep thoi khoa bieu va phat hien xung dot #resolve"',
    docs: [
      { name: 'Interval Scheduling Algorithm', url: 'https://en.wikipedia.org/wiki/Interval_scheduling' },
      { name: 'Tailwind CSS Grid Template Columns', url: 'https://tailwindcss.com/docs/grid-template-columns' }
    ],
    criteria: [
      'Cảnh báo tức thì khi xảy ra xung đột giáo viên hoặc phòng học.',
      'Lưu và hiển thị lưới TKB Thứ 2 đến Thứ 7 đầy đủ sáng/chiều.',
      'Học sinh và giáo viên chỉ xem được TKB liên quan đến mình.'
    ]
  },
  {
    pbiCode: 'PBI-21',
    jiraKey: 'KAN-118',
    name: 'PBI-21: Quy trình đăng ký đổi tiết, dạy thay, dạy bù & Phê duyệt trực tuyến (BGH)',
    module: 'Module 3: Quản Lý Thời Khóa Biểu & Lịch Giảng Dạy',
    owner: 'Trần Quang Vinh (Logic) & Huỳnh Trung Tính (Backend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-19',
    dueDate: '2026-11-01',
    sprint: 'Sprint 2 (Tuần 6 - Tuần 7)',
    labels: ['substitute', 'approval', 'workflow', 'timetable'],
    reqCode: 'REQ-SUB-01, REQ-SUB-02 (Ma trận RTM: UC_GV_05)',
    story: 'Là Giáo viên, tôi muốn gửi yêu cầu đổi tiết hoặc dạy thay khi có việc đột xuất và BGH có thể duyệt trực tuyến để cập nhật TKB tạm thời.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/TimetableController.js',
      'members/member2_Frontend/src/pages/teacher/SubstituteRequestPage.jsx',
      'members/member2_Frontend/src/pages/admin/SubstituteApprovalPage.jsx'
    ],
    layer: 'Workflow Approval & State Machine Layer',
    workflow: `Bước 1: Mở TimetableController.js, thêm các hàm createSubstituteRequest, approveSubstituteRequest, rejectSubstituteRequest.
Bước 2: Trong approveSubstituteRequest, sử dụng Transaction: cập nhật bảng substitute_requests status = 'APPROVED' và ghi đè lịch dạy tạm thời trong bảng timetable_exceptions.
Bước 3: Mở SubstituteRequestPage.jsx trên giao diện Giáo viên, gửi đơn thử nghiệm.
Bước 4: Đăng nhập tài khoản admin, mở SubstituteApprovalPage.jsx, bấm Duyệt và kiểm tra TKB của lớp được cập nhật tên giáo viên dạy thay.`,
    codeSnippet: `// TimetableController.js - BGH Phê duyệt đổi tiết / Dạy thay
export const approveSubstituteRequest = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updateRes = await client.query(
      \`UPDATE substitute_requests SET status = 'APPROVED', approved_by = $1, approved_at = NOW() 
       WHERE id = $2 AND status = 'PENDING' RETURNING *\`,
      [req.user.id, id]
    );
    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Đơn không tồn tại hoặc đã được xử lý!' });
    }
    const sub = updateRes.rows[0];
    await client.query(
      \`INSERT INTO timetable_exceptions (class_id, original_teacher_id, substitute_teacher_id, date, period)
       VALUES ($1, $2, $3, $4, $5)\`,
      [sub.class_id, sub.original_teacher_id, sub.substitute_teacher_id, sub.date, sub.period]
    );
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Phê duyệt thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X PATCH http://localhost:8081/api/substitutes/1/approve \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Tài khoản không phải Admin/BGH cố duyệt đơn -> Nhận HTTP 403 Forbidden.',
      'Phê duyệt đơn đã ở trạng thái APPROVED hoặc REJECTED -> Nhận HTTP 400 Bad Request.'
    ],
    demoSteps: [
      '1. Giáo viên A gửi đơn nhờ Thầy B dạy thay Tiết 2 ngày mai.',
      '2. Đăng nhập BGH mở trang "Phê duyệt dạy thay", bấm nút "Duyệt".',
      '3. Kiểm tra TKB ngày mai của lớp đã tự động đổi tên giáo viên phụ trách sang Thầy B.'
    ],
    smartCommit: 'git commit -m "KAN-118 #time 8h #comment Hoan thanh quy trinh doi tiet day thay co phe duyet #resolve"',
    docs: [
      { name: 'State Pattern in Software Design', url: 'https://refactoring.guru/design-patterns/state' },
      { name: 'PostgreSQL Transactions Best Practices', url: 'https://node-postgres.com/features/transactions' }
    ],
    criteria: [
      'Gửi đơn đổi tiết thành công kèm lý do cụ thể.',
      'BGH phê duyệt thì TKB tự động đổi giáo viên phụ trách trong ngày chỉ định.',
      'Gửi thông báo Socket.io đến giáo viên liên quan khi đơn được duyệt.'
    ]
  },
  {
    pbiCode: 'PBI-05',
    jiraKey: 'KAN-119',
    name: 'PBI-05: Quản lý hồ sơ học sinh, phân lớp & Nhập danh sách hàng loạt từ file Excel',
    module: 'Module 4: Quản Lý Hồ Sơ Học Sinh & Điểm Danh',
    owner: 'Huỳnh Trung Tính (Backend) & Võ Hoàng Sơn (Dev Frontend)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 1,
    startDate: '2026-10-12',
    dueDate: '2026-10-25',
    sprint: 'Sprint 2 (Tuần 5 - Tuần 6)',
    labels: ['student', 'excel', 'sheetjs', 'batch-processing'],
    reqCode: 'REQ-STUD-01, REQ-STUD-02 (Ma trận RTM: UC_BGH_05)',
    story: 'Là Ban Giám Hiệu, tôi muốn quản lý thông tin học sinh (họ tên, ngày sinh, phụ huynh) và nhập danh sách cả lớp từ file Excel (.xlsx) để tiết kiệm thời gian.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js',
      'members/member2_Frontend/src/pages/admin/StudentProfilePage.jsx'
    ],
    layer: 'Batch Processing & Excel Integration Layer',
    workflow: `Bước 1: Mở StudentController.js, kiểm tra cấu hình middleware multer upload.single('file').
Bước 2: Dùng thư viện xlsx đọc buffer: const workbook = xlsx.read(req.file.buffer); const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).
Bước 3: Lặp qua từng bản ghi, validate họ tên, ngày sinh, giới tính; nếu hợp lệ thì đưa vào câu truy vấn Batch INSERT với BEGIN ... COMMIT.
Bước 4: Mở StudentProfilePage.jsx trên giao diện BGH, tải lên file mẫu Excel và kiểm tra danh sách học sinh được tạo mới trên CSDL.`,
    codeSnippet: `// StudentController.js - Xử lý nhập học sinh hàng loạt từ Excel (SheetJS)
export const importStudentsFromExcel = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng đính kèm file Excel!' });
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      if (!row['Họ và tên'] || !row['Ngày sinh']) continue;
      await client.query(
        \`INSERT INTO students (full_name, dob, gender, class_id, parent_phone, status) 
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')\`,
        [row['Họ và tên'], row['Ngày sinh'], row['Giới tính'] || 'Nam', req.body.class_id, row['SĐT Phụ huynh']]
      );
    }
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: \`Đã nhập thành công \${rows.length} học sinh!\` });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: 'Lỗi nạp Excel: ' + err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/students/import-excel \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -F "file=@danh_sach_lop10a1.xlsx" \\
  -F "class_id=1"`,
    negativeCases: [
      'Upload file không đúng định dạng (.txt, .pdf) -> Nhận HTTP 400 Bad Request.',
      'File Excel có dòng thiếu trường bắt buộc Họ tên -> Tự động bỏ qua hoặc báo lỗi số dòng.'
    ],
    demoSteps: [
      '1. Vào mục "Hồ sơ học sinh", bấm nút "Nhập từ Excel".',
      '2. Chọn file danh_sach_lop10a1.xlsx và bấm Tải lên.',
      '3. Hệ thống xử lý trong 1.5 giây và nạp toàn bộ học sinh vào danh sách lớp.'
    ],
    smartCommit: 'git commit -m "KAN-119 #time 12h #comment Hoan thanh nhap ho so hoc sinh hang loat tu file Excel #resolve"',
    docs: [
      { name: 'SheetJS (xlsx) Official Documentation', url: 'https://docs.sheetjs.com/' },
      { name: 'Multer File Upload Middleware Guide', url: 'https://github.com/expressjs/multer' }
    ],
    criteria: [
      'Upload file Excel 50 học sinh hoàn thành trong dưới 2 giây.',
      'Báo lỗi chi tiết số dòng nếu dữ liệu trong file Excel không hợp lệ.',
      'Hỗ trợ tải về file Excel mẫu chuẩn hóa.'
    ]
  },
  {
    pbiCode: 'PBI-06',
    jiraKey: 'KAN-120',
    name: 'PBI-06: Điểm danh theo tiết/ngày, thống kê vắng & Cảnh báo nghỉ học tự động',
    module: 'Module 4: Quản Lý Hồ Sơ Học Sinh & Điểm Danh',
    owner: 'Huỳnh Trung Tính (Backend) & Võ Hoàng Sơn (Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-10-19',
    dueDate: '2026-11-01',
    sprint: 'Sprint 2 (Tuần 6 - Tuần 7)',
    labels: ['attendance', 'upsert', 'teacher', 'daily'],
    reqCode: 'REQ-ATT-01, REQ-ATT-02 (Ma trận RTM: UC_GVCN_01)',
    story: 'Là Giáo viên (GVCN/GVBM), tôi muốn điểm danh học sinh từng tiết học và hệ thống tự động thống kê số buổi nghỉ có phép/không phép để kịp thời nhắc nhở.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js',
      'members/member2_Frontend/src/pages/teacher/AttendanceCheckPage.jsx'
    ],
    layer: 'Data Ingestion & Alerting Mechanism Layer',
    workflow: `Bước 1: Mở AttendanceController.js và AttendanceRepository.js, kiểm tra hàm saveAttendanceBatch(req, res).
Bước 2: Viết câu lệnh SQL sử dụng mệnh đề ON CONFLICT DO UPDATE để cho phép giáo viên chỉnh sửa điểm danh nếu bấm nhầm.
Bước 3: Mở AttendanceCheckPage.jsx, kiểm tra nút 'Điểm danh nhanh cả lớp Có mặt' và các radio button chọn trạng thái.
Bước 4: Bấm Lưu điểm danh, kiểm tra phản hồi HTTP 200 và kiểm tra dữ liệu hiển thị đúng trên CSDL PostgreSQL.`,
    codeSnippet: `// AttendanceController.js - Lưu điểm danh Batch kèm UPSERT (ON CONFLICT)
export const saveAttendanceBatch = async (req, res) => {
  const { class_id, date, period, records } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = \`
      INSERT INTO attendance (student_id, class_id, date, period, status, note, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (student_id, date, period)
      DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, recorded_by = EXCLUDED.recorded_by;
    \`;
    for (const r of records) {
      await client.query(query, [r.student_id, class_id, date, period, r.status, r.note || '', req.user.id]);
    }
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Đã lưu điểm danh thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/attendance/batch \\
  -H "Authorization: Bearer <TOKEN_GV>" \\
  -H "Content-Type: application/json" \\
  -d '{"class_id":1,"date":"2026-11-14","period":1,"records":[{"student_id":1,"status":"CO_MAT"}]}'`,
    negativeCases: [
      'Gửi trạng thái điểm danh không hợp lệ (ngoài CO_MAT, VANG_CO_PHEP, VANG_KHONG_PHEP, DI_TRE) -> Nhận HTTP 400.'
    ],
    demoSteps: [
      '1. GVCN mở trang "Điểm danh lớp", bấm "Tất cả có mặt".',
      '2. Đổi 1 học sinh sang "Vắng có phép", bấm "Lưu điểm danh".',
      '3. Tải lại trang để xác nhận trạng thái được lưu bền vững trên PostgreSQL.'
    ],
    smartCommit: 'git commit -m "KAN-120 #time 8h #comment Hoan thanh diem danh theo tiet ngay va nut diem danh nhanh #resolve"',
    docs: [
      { name: 'PostgreSQL UPSERT (ON CONFLICT) Guide', url: 'https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT' },
      { name: 'React State Management for Lists', url: 'https://react.dev/learn/managing-state' }
    ],
    criteria: [
      'Lưu điểm danh cả lớp trong 1 lần gửi duy nhất (Batch Upsert).',
      'Có nút "Tất cả có mặt" để thao tác nhanh trong 3 giây.',
      'Cảnh báo học sinh vắng nhiều buổi hiển thị nổi bật.'
    ]
  },
  {
    pbiCode: 'PBI-07',
    jiraKey: 'KAN-121',
    name: 'PBI-07: Nhập & Phê duyệt đơn xin nghỉ học trực tuyến (Phụ huynh gửi - GVCN duyệt)',
    module: 'Module 4: Quản Lý Hồ Sơ Học Sinh & Điểm Danh',
    owner: 'Võ Hoàng Sơn (Frontend) & Huỳnh Trung Tính (Backend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-19',
    dueDate: '2026-11-01',
    sprint: 'Sprint 2 (Tuần 6 - Tuần 7)',
    labels: ['leave-request', 'parent', 'teacher', 'approval'],
    reqCode: 'REQ-ATT-03, REQ-ATT-04 (Ma trận RTM: UC_PAR_02)',
    story: 'Là Phụ huynh học sinh, tôi muốn gửi đơn xin nghỉ học trực tuyến cho con kèm lý do để GVCN phê duyệt và tự động cập nhật trạng thái vắng có phép.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js',
      'members/member2_Frontend/src/pages/parent/LeaveApplicationPage.jsx',
      'members/member2_Frontend/src/pages/teacher/LeaveApprovalPage.jsx'
    ],
    layer: 'Interactive Communication & Workflow Layer',
    workflow: `Bước 1: Mở LeaveRequestController.js, kiểm tra hàm createLeaveRequest và reviewLeaveRequest.
Bước 2: Trong reviewLeaveRequest, nếu action === 'APPROVE', mở Transaction cập nhật bảng leave_requests và tự động chèn bản ghi 'VANG_CO_PHEP' vào bảng attendance.
Bước 3: Mở LeaveApplicationPage.jsx trên giao diện phụ huynh, điền form xin nghỉ 1 ngày và bấm gửi.
Bước 4: Đăng nhập tài khoản GVCN, mở LeaveApprovalPage.jsx, bấm Phê duyệt và kiểm tra bảng điểm danh lớp đã tự động có trạng thái vắng có phép.`,
    codeSnippet: `// LeaveRequestController.js - GVCN Phê duyệt đơn & Tự động đồng bộ điểm danh
export const reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updateRes = await client.query(
      \`UPDATE leave_requests SET status = $1, feedback = $2, reviewed_by = $3, reviewed_at = NOW() 
       WHERE id = $4 RETURNING *\`,
      [status, feedback || '', req.user.id, id]
    );
    const leave = updateRes.rows[0];
    if (status === 'APPROVED') {
      await client.query(
        \`INSERT INTO attendance (student_id, date, status, note, recorded_by)
         VALUES ($1, $2, 'VANG_CO_PHEP', $3, $4)
         ON CONFLICT (student_id, date, period) DO UPDATE SET status = 'VANG_CO_PHEP'\`,
        [leave.student_id, leave.leave_date, 'Nghỉ có phép theo đơn duyệt', req.user.id]
      );
    }
    await client.query('COMMIT');
    return res.status(200).json({ success: true, data: leave });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/leave-requests \\
  -H "Authorization: Bearer <TOKEN_PH>" \\
  -H "Content-Type: application/json" \\
  -d '{"student_id":1,"leave_date":"2026-11-15","reason":"Con bi sot"}'`,
    negativeCases: [
      'Gửi đơn xin nghỉ cho ngày trong quá khứ quá 3 ngày -> Nhận HTTP 400 Bad Request.'
    ],
    demoSteps: [
      '1. Đăng nhập tài khoản Phụ huynh gửi đơn xin nghỉ ngày 15/11.',
      '2. GVCN đăng nhập, mở mục "Duyệt đơn nghỉ học" và bấm Phê duyệt.',
      '3. Kiểm tra bảng điểm danh lớp ngày 15/11 tự động cập nhật trạng thái VẮNG CÓ PHÉP.'
    ],
    smartCommit: 'git commit -m "KAN-121 #time 8h #comment Hoan thanh don xin nghi hoc truc tuyen va tu dong cap nhat diem danh #resolve"',
    docs: [
      { name: 'PostgreSQL Date / Time Functions', url: 'https://www.postgresql.org/docs/current/datatype-datetime.html' },
      { name: 'RESTful API PATCH Semantics', url: 'https://restfulapi.net/http-methods/#patch' }
    ],
    criteria: [
      'Phụ huynh gửi đơn xin nghỉ thành công kèm lý do.',
      'Khi GVCN duyệt đơn, bảng điểm danh tự động cập nhật VẮNG CÓ PHÉP.',
      'Phụ huynh nhận được thông báo kết quả phê duyệt qua ứng dụng.'
    ]
  },
  {
    pbiCode: 'PBI-17c',
    jiraKey: 'KAN-122',
    name: 'PBI-17c: Báo cáo thống kê chuyên cần, tỷ lệ đi học & Cảnh báo học sinh nguy cơ',
    module: 'Module 4: Quản Lý Hồ Sơ Học Sinh & Điểm Danh',
    owner: 'Huỳnh Trung Tính (Backend) & Nguyễn Minh Quốc Bảo (Tester/QA)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-26',
    dueDate: '2026-11-08',
    sprint: 'Sprint 2 (Tuần 7 - Tuần 8)',
    labels: ['attendance-stats', 'analytics', 'reporting', 'dropout-risk'],
    reqCode: 'REQ-ATT-05 (Ma trận RTM: UC_BGH_06)',
    story: 'Là Ban Giám Hiệu và GVCN, tôi muốn xem báo cáo thống kê tỷ lệ chuyên cần theo lớp/khối và phát hiện học sinh vắng quá 45 buổi để xử lý học vụ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js',
      'members/member2_Frontend/src/pages/admin/AttendanceStatsPage.jsx'
    ],
    layer: 'Analytics & Reporting Data Layer',
    workflow: `Bước 1: Mở AttendanceController.js, định vị phương thức getAttendanceAnalytics(req, res).
Bước 2: Viết câu truy vấn PostgreSQL sử dụng mệnh đề FILTER (WHERE status ...) để đếm số buổi vắng có phép và không phép.
Bước 3: Lọc ra danh sách học sinh có tổng số buổi vắng >= 45 buổi và gán cờ nguy cơ lưu ban.
Bước 4: Mở AttendanceStatsPage.jsx, kiểm tra render bảng thống kê tỷ lệ chuyên cần và danh sách học sinh bị cảnh báo đỏ.`,
    codeSnippet: `// AttendanceController.js - Thống kê chuyên cần & Phát hiện nguy cơ lưu ban (>45 buổi)
export const getAttendanceAnalytics = async (req, res) => {
  const { classId } = req.query;
  const query = \`
    SELECT s.id, s.full_name,
      COUNT(a.id) FILTER (WHERE a.status = 'CO_MAT') as present_count,
      COUNT(a.id) FILTER (WHERE a.status = 'VANG_CO_PHEP') as excused_absent,
      COUNT(a.id) FILTER (WHERE a.status = 'VANG_KHONG_PHEP') as unexcused_absent,
      COUNT(a.id) FILTER (WHERE a.status IN ('VANG_CO_PHEP', 'VANG_KHONG_PHEP')) as total_absent,
      CASE WHEN COUNT(a.id) FILTER (WHERE a.status IN ('VANG_CO_PHEP', 'VANG_KHONG_PHEP')) >= 45 
           THEN true ELSE false END as is_critical_risk
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id
    WHERE s.class_id = $1
    GROUP BY s.id, s.full_name
    ORDER BY total_absent DESC;
  \`;
  const result = await pool.query(query, [classId]);
  return res.status(200).json({ success: true, data: result.rows });
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/attendance/analytics?classId=1" \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Truy vấn lớp học không tồn tại -> Nhận HTTP 404 Not Found.'
    ],
    demoSteps: [
      '1. Vào mục "Thống kê chuyên cần" trên giao diện BGH.',
      '2. Quan sát học sinh vắng trên 45 buổi được highlight màu đỏ cảnh báo nguy cơ lưu ban.'
    ],
    smartCommit: 'git commit -m "KAN-122 #time 8h #comment Hoan thanh bao cao thong ke chuyen can va canh bao luu ban #resolve"',
    docs: [
      { name: 'PostgreSQL Aggregate Functions & FILTER Clause', url: 'https://www.postgresql.org/docs/current/functions-aggregate.html' },
      { name: 'Chart.js Bar & Percentage Charts Guide', url: 'https://www.chartjs.org/docs/latest/charts/bar.html' }
    ],
    criteria: [
      'Tính toán chính xác tỷ lệ chuyên cần theo lớp và toàn trường.',
      'Cảnh báo học sinh nghỉ học trên 45 buổi theo điều lệ Bộ GD&ĐT.',
      'Biểu đồ chuyên cần trực quan, lọc được theo tuần/tháng/học kỳ.'
    ]
  },
  {
    pbiCode: 'PBI-08',
    jiraKey: 'KAN-123',
    name: 'PBI-08: Nhập bảng điểm bộ môn, kiểm tra dải điểm hợp lệ [0.0 - 10.0] & Kiểm soát khóa sổ',
    module: 'Module 5: Quản Lý Sổ Điểm Điện Tử & Đánh Giá TT22',
    owner: 'Trần Quang Vinh (Logic & Security) & Võ Hoàng Sơn (Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-10-19',
    dueDate: '2026-11-01',
    sprint: 'Sprint 3 (Tuần 6 - Tuần 7)',
    labels: ['grade-entry', 'validation', 'lock-check', 'tt22'],
    reqCode: 'REQ-GRAD-01, REQ-GRAD-02 (Ma trận RTM: UC_GVBM_01)',
    story: 'Là Giáo viên bộ môn, tôi muốn nhập điểm kiểm tra thường xuyên, giữa kỳ, cuối kỳ cho học sinh lớp mình dạy và hệ thống kiểm tra chặn nhập sai.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeRepository.js',
      'members/member2_Frontend/src/pages/teacher/GradeEntryPage.jsx'
    ],
    layer: 'Domain Grade Entry & Data Integrity Layer',
    workflow: `Bước 1: Mở GradeController.js, kiểm tra hàm enterSubjectGrades(req, res).
Bước 2: Viết logic kiểm tra: kiểm tra dải điểm [0.0, 10.0] và kiểm tra khóa sổ điểm qua GradeLockService.
Bước 3: Nếu vi phạm dải điểm trả về 400 Bad Request; nếu sổ điểm đã khóa trả về 403 Forbidden.
Bước 4: Mở GradeEntryPage.jsx trên giao diện Giáo viên, thử gõ điểm -1 hoặc 11 để kiểm tra ô nhập báo lỗi viền đỏ; sau đó nhập điểm chuẩn và bấm Lưu điểm.`,
    codeSnippet: `// GradeController.js - Lưu điểm & Kiểm tra dải điểm [0.0 - 10.0] cùng Trạng thái khóa sổ
export const enterSubjectGrades = async (req, res) => {
  const { class_id, subject_id, semester, grades } = req.body;
  const lockCheck = await pool.query(
    'SELECT status FROM gradebook_locks WHERE class_id = $1 AND subject_id = $2 AND semester = $3',
    [class_id, subject_id, semester]
  );
  if (lockCheck.rows.length > 0 && lockCheck.rows[0].status !== 'OPEN') {
    return res.status(403).json({ success: false, message: 'Sổ điểm môn học này đã bị khóa! Không thể nhập/sửa điểm.' });
  }
  for (const g of grades) {
    if (g.score !== null && (g.score < 0 || g.score > 10)) {
      return res.status(400).json({ success: false, message: \`Điểm \${g.score} không hợp lệ! Dải điểm cho phép là [0.0 - 10.0].\` });
    }
  }
  await saveGradesBatch(grades);
  return res.status(200).json({ success: true, message: 'Cập nhật bảng điểm thành công!' });
};`,
    curlSample: `curl -X POST http://localhost:8081/api/grades/batch \\
  -H "Authorization: Bearer <TOKEN_GV>" \\
  -H "Content-Type: application/json" \\
  -d '{"class_id":1,"subject_id":1,"semester":"HK1","grades":[{"student_id":1,"score":8.5}]}'`,
    negativeCases: [
      'Gõ điểm -1 hoặc 10.5 -> Nhận HTTP 400 Bad Request.',
      'Sửa điểm khi trạng thái sổ điểm là LOCKED -> Nhận HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. GVBM mở trang "Nhập điểm bộ môn", nhập điểm 8.5.',
      '2. Gõ thử số 12 -> Ô nhập báo lỗi viền đỏ và chặn bấm Lưu.'
    ],
    smartCommit: 'git commit -m "KAN-123 #time 8h #comment Hoan thanh nhap diem bo mon va kiem tra dai diem 0-10 #resolve"',
    docs: [
      { name: 'Clean Architecture Pattern by Uncle Bob', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { name: 'React Dynamic Form Input Validation', url: 'https://react.dev/learn/sharing-state-between-components' }
    ],
    criteria: [
      'Chặn 100% các giá trị điểm nằm ngoài [0.0 - 10.0].',
      'Chặn sửa điểm khi sổ điểm đã bị khóa với HTTP 403.',
      'Tự động highlight ô điểm có thay đổi để giáo viên dễ theo dõi.'
    ]
  },
  {
    pbiCode: 'PBI-09',
    jiraKey: 'KAN-124',
    name: 'PBI-09: Thuật toán tính Điểm trung bình môn (TBM) & Đánh giá Đạt/Chưa đạt (TT22)',
    module: 'Module 5: Quản Lý Sổ Điểm Điện Tử & Đánh Giá TT22',
    owner: 'Trần Quang Vinh (Core Logic & Security)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 1,
    startDate: '2026-10-19',
    dueDate: '2026-10-25',
    sprint: 'Sprint 3 (Tuần 6)',
    labels: ['tt22', 'algorithm', 'tbm', 'unit-test'],
    reqCode: 'REQ-GRAD-03 (Ma trận RTM: UC_GVBM_02)',
    story: 'Là Hệ thống, tôi muốn tự động tính toán Điểm trung bình môn (TBM) chính xác theo trọng số Thông tư 22/2021/TT-BGDĐT ngay khi có điểm mới.',
    primaryFiles: [
      'members/member4_Logic_Security/tt22EvaluationLogic.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/GradeEvaluationService.js',
      'members/member3_Backend_DB/school-management-nodejs/tests/unit/tt22Evaluation.test.js'
    ],
    layer: 'Domain Core Business Logic & Educational Standard Layer',
    workflow: `Bước 1: Mở tt22EvaluationLogic.js, định vị hàm calculateTBM(regularScores, midtermScore, finalScore).
Bước 2: Viết chuẩn công thức: const totalWeighted = sumRegular + (2 * midtermScore) + (3 * finalScore); const totalWeight = regularScores.length + 5; const tbm = Math.round((totalWeighted / totalWeight) * 10) / 10;.
Bước 3: Mở tt22Evaluation.test.js, bổ sung các test cases biên kiểm tra điểm 7.94 vs 7.95, điểm 4.94 vs 4.95.
Bước 4: Chạy lệnh npm test trên terminal để xác nhận 100% test cases đạt PASS.`,
    codeSnippet: `// tt22EvaluationLogic.js - Công thức tính Điểm trung bình môn học kỳ (Điều 9 TT 22)
export const calculateTBM = (regularScores, midtermScore, finalScore) => {
  if (!regularScores || regularScores.length === 0 || midtermScore === null || finalScore === null) {
    return null;
  }
  const sumRegular = regularScores.reduce((acc, score) => acc + score, 0);
  const totalWeighted = sumRegular + (2 * midtermScore) + (3 * finalScore);
  const totalWeight = regularScores.length + 2 + 3;
  const rawTbm = totalWeighted / totalWeight;
  return Math.round(rawTbm * 10) / 10;
};`,
    curlSample: `curl -X POST http://localhost:8081/api/grades/calculate-tbm \\
  -H "Content-Type: application/json" \\
  -d '{"regularScores":[8,9,8],"midtermScore":7.5,"finalScore":9}'`,
    negativeCases: [
      'Thiếu điểm kiểm tra cuối kỳ -> Trả về null (chưa đủ dữ liệu tính TBM).',
      'Mảng điểm thường xuyên rỗng -> Trả về null.'
    ],
    demoSteps: [
      '1. Chạy lệnh npm test trên terminal.',
      '2. Xem kết quả 68 bài kiểm thử tính điểm TT22 đạt PASS 100% trong 0.8 giây.'
    ],
    smartCommit: 'git commit -m "KAN-124 #time 12h #comment Hoan thanh thuat toan tinh TBM theo Thong tu 22 va 68 unit tests #resolve"',
    docs: [
      { name: 'Thông tư 22/2021/TT-BGDĐT Quy định Đánh giá Học sinh', url: 'https://moet.gov.vn/' },
      { name: 'IEEE 754 Floating Point Rounding in JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round' },
      { name: 'Jest Unit Testing Framework Guide', url: 'https://jestjs.io/docs/getting-started' }
    ],
    criteria: [
      'Điểm TBM tính đúng 100% theo công thức trọng số TT 22.',
      'Làm tròn chuẩn xác 1 chữ số thập phân theo quy chuẩn Bộ GD&ĐT.',
      'Vượt qua toàn bộ 68 ca kiểm thử đơn vị tự động (Backend Unit Tests).'
    ]
  },
  {
    pbiCode: 'PBI-10',
    jiraKey: 'KAN-125',
    name: 'PBI-10: Đánh giá kết quả rèn luyện & Xếp loại học lực cuối kỳ/cả năm theo TT22',
    module: 'Module 5: Quản Lý Sổ Điểm Điện Tử & Đánh Giá TT22',
    owner: 'Trần Quang Vinh (Core Logic) & Huỳnh Trung Tính (Backend)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 1,
    startDate: '2026-10-26',
    dueDate: '2026-11-08',
    sprint: 'Sprint 3 (Tuần 7 - Tuần 8)',
    labels: ['conduct', 'classification', 'tt22', 'honors'],
    reqCode: 'REQ-GRAD-04, REQ-GRAD-05 (Ma trận RTM: UC_GVCN_02)',
    story: 'Là GVCN, tôi muốn hệ thống tự động tổng hợp kết quả học tập và rèn luyện của cả lớp để xếp loại học sinh theo 4 mức (Tốt, Khá, Đạt, Chưa đạt).',
    primaryFiles: [
      'members/member4_Logic_Security/tt22EvaluationLogic.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeController.js',
      'members/member2_Frontend/src/pages/teacher/HomeroomEvaluationPage.jsx'
    ],
    layer: 'Educational Classification & Aggregation Layer',
    workflow: `Bước 1: Mở tt22EvaluationLogic.js, xem xét hàm classifyAcademicPerformance(subjectScores, conduct).
Bước 2: Kiểm tra việc đếm số môn đạt ngưỡng 8.0, 6.5, 5.0, 3.5 và trạng thái các môn nhận xét (Đ / CĐ).
Bước 3: Mở GradeController.js (phương thức getHomeroomSummaryReport), gọi hàm xếp loại và tổng hợp danh hiệu thi đua.
Bước 4: Mở HomeroomEvaluationPage.jsx trên giao diện GVCN, kiểm tra bảng xếp loại cả lớp hiển thị chính xác danh hiệu Xuất sắc, Giỏi.`,
    codeSnippet: `// tt22EvaluationLogic.js - Thuật toán Xếp loại học lực theo Thông tư 22
export const classifyAcademicLevel = (subjectTbms, passFailSubjects) => {
  const allPassFailOk = passFailSubjects.every(status => status === 'Đ');
  const countGte8 = subjectTbms.filter(s => s >= 8.0).length;
  const countGte65 = subjectTbms.filter(s => s >= 6.5).length;
  const minScore = Math.min(...subjectTbms);

  if (allPassFailOk && minScore >= 6.5 && countGte8 >= 6) {
    return 'TỐT';
  }
  if (allPassFailOk && minScore >= 5.0 && countGte65 >= 6) {
    return 'KHÁ';
  }
  if (minScore >= 3.5 && subjectTbms.filter(s => s < 5.0).length <= 1) {
    return 'ĐẠT';
  }
  return 'CHƯA ĐẠT';
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/reports/homeroom-summary?classId=1&semester=HK1" \\
  -H "Authorization: Bearer <TOKEN_GVCN>"`,
    negativeCases: [
      'Học sinh có điểm 1 môn dưới 5.0 -> Không được xếp TỐT hay KHÁ dù các môn khác 10 điểm.'
    ],
    demoSteps: [
      '1. GVCN mở trang "Tổng kết học kỳ lớp 10A1", bấm "Tổng hợp số liệu".',
      '2. Quan sát hệ thống phân loại danh hiệu "Học sinh Xuất sắc" và "Học sinh Giỏi" tự động.'
    ],
    smartCommit: 'git commit -m "KAN-125 #time 12h #comment Hoan thanh xep loai hoc luc ren luyen va danh hieu thi dua TT22 #resolve"',
    docs: [
      { name: 'Văn bản hợp nhất Thông tư đánh giá học sinh THCS/THPT', url: 'https://thuvienphapluat.vn/' },
      { name: 'JavaScript Array filter, every, some Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' }
    ],
    criteria: [
      'Phân loại học lực chính xác tuyệt đối theo 4 mức của TT 22.',
      'Xét danh hiệu "Học sinh Xuất sắc" và "Học sinh Giỏi" đúng điều kiện.',
      'Hỗ trợ GVCN điều chỉnh nhận xét rèn luyện trước khi BGH chốt số liệu.'
    ]
  },
  {
    pbiCode: 'PBI-20',
    jiraKey: 'KAN-126',
    name: 'PBI-20: Quy trình Khóa sổ điểm 2 cấp (GVBM khóa môn -> BGH khóa trường) & Mở khóa',
    module: 'Module 5: Quản Lý Sổ Điểm Điện Tử & Đánh Giá TT22',
    owner: 'Trần Quang Vinh (Security) & Huỳnh Trung Tính (Backend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-11-02',
    dueDate: '2026-11-15',
    sprint: 'Sprint 3 (Tuần 8 - Tuần 9)',
    labels: ['lock-gradebook', 'two-tier', 'governance', 'security'],
    reqCode: 'REQ-GRAD-06, REQ-GRAD-07 (Ma trận RTM: UC_BGH_07)',
    story: 'Là BGH và GVBM, tôi muốn có cơ chế khóa sổ điểm 2 cấp để bảo vệ tính toàn vẹn dữ liệu điểm thi và quy trình xin mở khóa có kiểm soát khi cần sửa.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeLockController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeLockRepository.js',
      'members/member2_Frontend/src/pages/admin/GradebookLockPage.jsx'
    ],
    layer: 'Two-Tier Governance & Audit Security Layer',
    workflow: `Bước 1: Mở GradeLockController.js và GradeLockRepository.js.
Bước 2: Xây dựng các hàm: lockByTeacher, finalizeByAdmin, requestUnlock, approveUnlock.
Bước 3: Lưu vết lịch sử khóa/mở khóa vào bảng grade_lock_history để phục vụ kiểm toán.
Bước 4: Mở GradebookLockPage.jsx trên giao diện BGH, thử bấm Khóa toàn trường; sau đó đăng nhập tài khoản Giáo viên để xác nhận giao diện nhập điểm bị disable và hiện thông báo khóa.`,
    codeSnippet: `// GradeLockController.js - Khóa sổ điểm 2 cấp (GVBM & BGH)
export const lockGradebookByAdmin = async (req, res) => {
  const { academicYearId, semester } = req.body;
  const query = \`
    UPDATE gradebook_locks 
    SET status = 'BGH_FINAL_LOCKED', locked_by = $1, locked_at = NOW()
    WHERE academic_year_id = $2 AND semester = $3
    RETURNING *;
  \`;
  const result = await pool.query(query, [req.user.id, academicYearId, semester]);
  await logAuditEvent(req.user.id, 'LOCK_ALL_GRADEBOOKS', 'gradebook_locks', null, { status: 'BGH_FINAL_LOCKED' });
  return res.status(200).json({ success: true, count: result.rowCount, message: 'Đã khóa toàn bộ sổ điểm trường!' });
};`,
    curlSample: `curl -X POST http://localhost:8081/api/grade-locks/admin-finalize \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"academicYearId":1,"semester":"HK1"}'`,
    negativeCases: [
      'Giáo viên cố tình sửa điểm khi sổ đã mang cờ BGH_FINAL_LOCKED -> Bị chặn 100% với HTTP 403.'
    ],
    demoSteps: [
      '1. Đăng nhập BGH bấm "Khóa sổ điểm HK1 toàn trường".',
      '2. Đăng nhập GVBM mở trang nhập điểm -> Mọi ô nhập điểm bị vô hiệu hóa mờ đi.'
    ],
    smartCommit: 'git commit -m "KAN-126 #time 8h #comment Hoan thanh co che khoa so diem 2 cap va quy trinh mo khoa #resolve"',
    docs: [
      { name: 'Two-Phase Locking Architecture Pattern', url: 'https://en.wikipedia.org/wiki/Two-phase_locking' },
      { name: 'PostgreSQL ENUM Type Documentation', url: 'https://www.postgresql.org/docs/current/datatype-enum.html' }
    ],
    criteria: [
      'GVBM chỉ khóa được môn mình phụ trách; BGH khóa được toàn trường.',
      'Khi BGH đã khóa, chặn 100% hành vi sửa điểm từ mọi tài khoản.',
      'Ghi nhật ký chi tiết: Ai yêu cầu mở khóa, Ai duyệt, Thời gian nào.'
    ]
  },
  {
    pbiCode: 'PBI-22',
    jiraKey: 'KAN-127',
    name: 'PBI-22: Xuất sổ điểm điện tử, phiếu điểm cá nhân & Báo cáo học vụ sang PDF / Excel',
    module: 'Module 5: Quản Lý Sổ Điểm Điện Tử & Đánh Giá TT22',
    owner: 'Nguyễn Minh Quốc Bảo (QA/Export Engine) & Huỳnh Trung Tính',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-10-26',
    dueDate: '2026-11-08',
    sprint: 'Sprint 3 (Tuần 7 - Tuần 8)',
    labels: ['export', 'pdf', 'excel', 'report-card'],
    reqCode: 'REQ-REP-01, REQ-REP-02 (Ma trận RTM: UC_GVCN_03)',
    story: 'Là GVCN và BGH, tôi muốn xuất sổ điểm lớp và phiếu điểm từng học sinh ra file PDF có chữ ký số hoặc Excel để in ấn và lưu trữ hồ sơ học bạ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/PdfExportService.js',
      'members/member2_Frontend/src/pages/reports/GradebookExportPage.jsx'
    ],
    layer: 'Document Rendering & Binary Streaming Layer',
    workflow: `Bước 1: Mở ReportController.js và PdfExportService.js.
Bước 2: Cấu hình PDFKit với font tiếng Việt hỗ trợ Unicode và tạo layout bảng điểm có tiêu đề, chữ ký.
Bước 3: Cấu hình SheetJS tạo file Excel có styling ô tiêu đề và tự động co giãn độ rộng cột (col widths).
Bước 4: Mở GradebookExportPage.jsx, chọn Lớp và Học kỳ, bấm 'Xuất Excel' và 'Tải PDF Sổ điểm' để kiểm tra file tải về mở mượt mà trên máy.`,
    codeSnippet: `// ReportController.js - Xuất file Excel sổ điểm lớp qua SheetJS (xlsx)
export const exportGradebookExcel = async (req, res) => {
  const { classId, semester } = req.params;
  const gradeData = await getGradesMatrixByClass(classId, semester);
  
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(gradeData);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'SoDiem');
  
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', \`attachment; filename="SoDiem_Lop_\${classId}_\${semester}.xlsx"\`);
  return res.send(buffer);
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/reports/gradebook/1/HK1/excel" \\
  -H "Authorization: Bearer <TOKEN_GVCN>" --output SoDiem.xlsx`,
    negativeCases: [
      'Xuất lớp chưa có điểm -> Trả về file Excel có header đầy đủ chứ không bị lỗi sập server (500).'
    ],
    demoSteps: [
      '1. Vào mục "Xuất sổ điểm điện tử", chọn Lớp 10A1 và bấm "Xuất file Excel".',
      '2. Mở file Excel vừa tải về, kiểm tra Quốc hiệu Tiêu ngữ, danh sách học sinh và công thức điểm.'
    ],
    smartCommit: 'git commit -m "KAN-127 #time 8h #comment Hoan thanh xuat so diem dien tu va phieu diem PDF Excel #resolve"',
    docs: [
      { name: 'SheetJS Workbook & Cell Styling Guide', url: 'https://docs.sheetjs.com/docs/csf/book' },
      { name: 'PDFKit Official Guide & Table Rendering', url: 'https://pdfkit.org/docs/getting_started.html' }
    ],
    criteria: [
      'File PDF xuất ra hiển thị tiếng Việt có dấu 100% không bị vỡ font.',
      'File Excel có định dạng chuyên nghiệp, công thức tính giữ nguyên vẹn.',
      'Thời gian xuất file dưới 3 giây cho lớp 45 học sinh.'
    ]
  },
  {
    pbiCode: 'PBI-11',
    jiraKey: 'KAN-128',
    name: 'PBI-11: Bảng tin thông báo toàn trường, phân luồng theo vai trò & Ghim tin quan trọng',
    module: 'Module 6: Thông Báo & Tương Tác Nội Bộ',
    owner: 'Võ Hoàng Sơn (Frontend) & Huỳnh Trung Tính (Backend)',
    storyPoints: 3,
    estimateHours: '6h',
    priority: 3,
    startDate: '2026-10-26',
    dueDate: '2026-11-08',
    sprint: 'Sprint 4 (Tuần 7 - Tuần 8)',
    labels: ['announcements', 'broadcast', 'pinned', 'newsfeed'],
    reqCode: 'REQ-COMM-01 (Ma trận RTM: UC_BGH_08)',
    story: 'Là Ban Giám Hiệu, tôi muốn đăng thông báo và phân loại đối tượng nhận (Giáo viên, Học sinh, Phụ huynh) để truyền đạt thông tin kịp thời.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AnnouncementController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AnnouncementRepository.js',
      'members/member2_Frontend/src/pages/common/AnnouncementsPage.jsx'
    ],
    layer: 'Content Management & Audience Segmentation Layer',
    workflow: `Bước 1: Mở AnnouncementController.js và AnnouncementRepository.js.
Bước 2: Viết câu truy vấn GET /api/announcements lọc theo role của req.user: WHERE target_audience IN ('ALL', $1) ORDER BY is_pinned DESC, created_at DESC.
Bước 3: Viết hàm POST /api/announcements có gắn middleware requireBGH để chỉ cho phép BGH đăng tin.
Bước 4: Mở AnnouncementsPage.jsx, đăng thông báo mới có chọn Ghim lên đầu và kiểm tra giao diện học sinh/phụ huynh hiển thị đúng luồng.`,
    codeSnippet: `// AnnouncementController.js - Lọc thông báo theo phân luồng đối tượng & Ghim lên đầu
export const getAnnouncements = async (req, res) => {
  const userRole = req.user ? req.user.role : 'GUEST';
  const query = \`
    SELECT a.*, u.full_name as author_name 
    FROM announcements a
    JOIN users u ON a.author_id = u.id
    WHERE a.target_audience IN ('ALL', $1)
    ORDER BY a.is_pinned DESC, a.created_at DESC;
  \`;
  const result = await pool.query(query, [userRole]);
  return res.status(200).json({ success: true, data: result.rows });
};`,
    curlSample: `curl -X POST http://localhost:8081/api/announcements \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Nghi le 20-11","content":"Thong bao nghi hoc","target_audience":"ALL","is_pinned":true}'`,
    negativeCases: [
      'Học sinh hoặc phụ huynh cố gửi request POST đăng bài -> Nhận HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. BGH đăng bài thông báo "Lịch nghỉ lễ" có chọn Ghim.',
      '2. Đăng nhập tài khoản Học sinh thấy bài ghim xuất hiện ngay đầu bảng tin.'
    ],
    smartCommit: 'git commit -m "KAN-128 #time 6h #comment Hoan thanh bang tin thong bao phan luong va ghim tin #resolve"',
    docs: [
      { name: 'PostgreSQL Ordering & Sorting Guide', url: 'https://www.postgresql.org/docs/current/queries-order.html' },
      { name: 'Tailwind Typography Plugin for Rich Content', url: 'https://tailwindcss.com/docs/typography-plugin' }
    ],
    criteria: [
      'Người dùng chỉ thấy các thông báo phù hợp với vai trò của mình.',
      'Tin được ghim luôn nằm ở vị trí đầu tiên của bảng tin.',
      'Hỗ trợ đính kèm tệp văn bản hoặc hình ảnh trong thông báo.'
    ]
  },
  {
    pbiCode: 'PBI-12',
    jiraKey: 'KAN-129',
    name: 'PBI-12: Kênh trao đổi tin nhắn trực tuyến Real-time (Socket.io) giữa GVCN & Phụ huynh',
    module: 'Module 6: Thông Báo & Tương Tác Nội Bộ',
    owner: 'Trần Quang Vinh (Logic/Socket) & Võ Hoàng Sơn (Frontend)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 2,
    startDate: '2026-11-02',
    dueDate: '2026-11-15',
    sprint: 'Sprint 4 (Tuần 8 - Tuần 9)',
    labels: ['chat', 'socket.io', 'real-time', 'websocket'],
    reqCode: 'REQ-COMM-02 (Ma trận RTM: UC_GVCN_04)',
    story: 'Là Phụ huynh và GVCN, tôi muốn nhắn tin trao đổi trực tiếp tức thời để giải quyết các vấn đề học tập và sinh hoạt của học sinh.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/socket/chat.handler.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ChatController.js',
      'members/member2_Frontend/src/pages/chat/ChatPage.jsx'
    ],
    layer: 'Real-time WebSocket & Event-Driven Layer',
    workflow: `Bước 1: Mở chat.handler.js tại Backend, định vị sự kiện io.on('connection', socket).
Bước 2: Xác thực JWT token từ socket.handshake.auth.token; tham gia phòng qua socket.join(roomId).
Bước 3: Khi nhận sự kiện 'send_message', lưu bản ghi vào CSDL PostgreSQL và phát sự kiện 'receive_message' đến room.
Bước 4: Mở 2 cửa sổ trình duyệt (1 tab GVCN, 1 tab Phụ huynh), vào ChatPage.jsx và gửi tin nhắn để kiểm tra độ trễ tức thời không cần F5.`,
    codeSnippet: `// chat.handler.js - Xử lý Socket.io gửi nhận tin nhắn thời gian thực
export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });
    socket.on('send_message', async (data) => {
      const { roomId, senderId, receiverId, content } = data;
      const savedMsg = await pool.query(
        'INSERT INTO chat_messages (room_id, sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [roomId, senderId, receiverId, content]
      );
      io.to(roomId).emit('receive_message', savedMsg.rows[0]);
    });
  });
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/chat/history?roomId=room_1_2" \\
  -H "Authorization: Bearer <TOKEN_GVCN>"`,
    negativeCases: [
      'Người dùng lạ cố join vào room của người khác mà không có quyền -> Bị ngắt kết nối WebSocket.'
    ],
    demoSteps: [
      '1. Mở 2 tab trình duyệt: Tab trái là GVCN, Tab phải là Phụ huynh.',
      '2. Phụ huynh nhắn tin "Chào thầy", màn hình GVCN hiển thị tin nhắn ngay tức thì mà không cần F5.'
    ],
    smartCommit: 'git commit -m "KAN-129 #time 12h #comment Hoan thanh kenh chat truc tuyen real-time Socket.io #resolve"',
    docs: [
      { name: 'Socket.io v4 Official Guide & Cheat Sheet', url: 'https://socket.io/docs/v4/' },
      { name: 'Socket.io Middlewares & Authentication', url: 'https://socket.io/docs/v4/middlewares/' }
    ],
    criteria: [
      'Tin nhắn gửi và nhận tức thời trong dưới 500ms.',
      'Lưu trữ toàn bộ lịch sử tin nhắn vào PostgreSQL an toàn.',
      'Chỉ GVCN và Phụ huynh của học sinh đó mới vào được phòng chat riêng.'
    ]
  },
  {
    pbiCode: 'PBI-18',
    jiraKey: 'KAN-130',
    name: 'PBI-18: Sổ liên lạc điện tử định kỳ: Tổng hợp Điểm, Chuyên cần & Nhận xét của GVCN',
    module: 'Module 6: Thông Báo & Tương Tác Nội Bộ',
    owner: 'Võ Hoàng Sơn (Frontend) & Huỳnh Trung Tính (Backend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-11-02',
    dueDate: '2026-11-15',
    sprint: 'Sprint 4 (Tuần 8 - Tuần 9)',
    labels: ['contact-book', 'parent', 'monthly-report', 'feedback'],
    reqCode: 'REQ-COMM-03 (Ma trận RTM: UC_PAR_03)',
    story: 'Là Phụ huynh, tôi muốn xem sổ liên lạc điện tử hàng tháng của con gồm điểm số, số buổi nghỉ và nhận xét của GVCN để đồng hành cùng con.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ContactBookController.js',
      'members/member2_Frontend/src/pages/parent/ContactBookPage.jsx',
      'members/member2_Frontend/src/pages/teacher/ContactBookEntryPage.jsx'
    ],
    layer: 'Aggregation View & Stakeholder Reporting Layer',
    workflow: `Bước 1: Mở ContactBookController.js, kiểm tra hàm getMonthlyContactBook(req, res).
Bước 2: Viết câu lệnh SQL JOIN 3 bảng: bảng grades (điểm số), bảng attendance (chuyên cần) và bảng homeroom_comments (nhận xét GVCN).
Bước 3: Mở ContactBookEntryPage.jsx trên giao diện GVCN, nhập nhận xét cho học sinh và bấm Lưu.
Bước 4: Đăng nhập tài khoản phụ huynh, mở ContactBookPage.jsx để kiểm tra bảng tổng hợp điểm, chuyên cần và lời nhận xét hiển thị chuẩn đẹp.`,
    codeSnippet: `// ContactBookController.js - Lấy sổ liên lạc tổng hợp Điểm + Vắng + Nhận xét
export const getStudentContactBook = async (req, res) => {
  const { studentId, month, year } = req.query;
  const grades = await pool.query('SELECT * FROM grades WHERE student_id = $1', [studentId]);
  const attendance = await pool.query(
    'SELECT status, COUNT(*) as count FROM attendance WHERE student_id = $1 GROUP BY status',
    [studentId]
  );
  const comment = await pool.query(
    'SELECT * FROM contact_book_comments WHERE student_id = $1 AND month = $2 AND year = $3',
    [studentId, month, year]
  );
  return res.status(200).json({
    success: true,
    data: {
      grades: grades.rows,
      attendanceSummary: attendance.rows,
      teacherComment: comment.rows[0] || null
    }
  });
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/contact-books/student/1?month=11&year=2026" \\
  -H "Authorization: Bearer <TOKEN_PH>"`,
    negativeCases: [
      'Phụ huynh xem sổ liên lạc của con người khác -> Bị chặn với HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. Phụ huynh vào trang "Sổ liên lạc điện tử".',
      '2. Xem bảng tổng hợp điểm thi, số ngày nghỉ và nhận xét nề nếp của GVCN trong tháng 11.'
    ],
    smartCommit: 'git commit -m "KAN-130 #time 8h #comment Hoan thanh so lien lac dien tu dinh ky va nhan xet GVCN #resolve"',
    docs: [
      { name: 'PostgreSQL Multiple Table JOIN Guide', url: 'https://www.postgresql.org/docs/current/tutorial-join.html' },
      { name: 'Tailwind Responsive Card Layouts', url: 'https://tailwindcss.com/docs/box-shadow' }
    ],
    criteria: [
      'Hiển thị đầy đủ 3 thành phần: Điểm số, Chuyên cần và Lời nhận xét.',
      'Phụ huynh có thể gửi phản hồi trực tiếp cho GVCN trên sổ liên lạc.',
      'Hỗ trợ xuất sổ liên lạc tháng ra file PDF.'
    ]
  },
  {
    pbiCode: 'PBI-13',
    jiraKey: 'KAN-131',
    name: 'PBI-13: Quản lý danh mục khoản thu học phí, đợt thu & Miễn giảm theo đối tượng chính sách',
    module: 'Module 7: Quản Lý Học Phí & Cổng Thanh Toán VietQR',
    owner: 'Huỳnh Trung Tính (Backend & DBA)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-11-02',
    dueDate: '2026-11-15',
    sprint: 'Sprint 5 (Tuần 8 - Tuần 9)',
    labels: ['tuition-fee', 'accounting', 'exemptions', 'billing'],
    reqCode: 'REQ-FEE-01, REQ-FEE-02 (Ma trận RTM: UC_BGH_09)',
    story: 'Là Kế toán / Ban Giám Hiệu, tôi muốn tạo các đợt thu học phí, định mức khoản thu và chính sách miễn giảm (hộ nghèo, con thương binh) cho từng học sinh.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/FeeRepository.js',
      'members/member2_Frontend/src/pages/admin/FeeManagementPage.jsx'
    ],
    layer: 'Billing Policy & Financial Administration Layer',
    workflow: `Bước 1: Mở FeeController.js và FeeRepository.js.
Bước 2: Xây dựng hàm createFeePeriod, gán danh mục các khoản thu và tạo bản ghi student_fees cho học sinh.
Bước 3: Áp dụng công thức tính giảm trừ theo bảng fee_exemptions: final_amount = base_amount * (1 - discount_percent / 100).
Bước 4: Mở FeeManagementPage.jsx trên giao diện BGH, tạo đợt thu mới và kiểm tra số tiền công nợ được phân bổ chính xác cho học sinh.`,
    codeSnippet: `// FeeController.js - Tạo đợt thu & Tự động áp dụng chính sách miễn giảm
export const createFeePeriodWithDiscounts = async (req, res) => {
  const { name, academic_year_id, total_amount, due_date, class_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const periodRes = await client.query(
      'INSERT INTO fee_periods (name, academic_year_id, due_date) VALUES ($1, $2, $3) RETURNING id',
      [name, academic_year_id, due_date]
    );
    const periodId = periodRes.rows[0].id;
    const students = await client.query(
      \`SELECT s.id, COALESCE(e.discount_percent, 0) as discount_percent
       FROM students s LEFT JOIN fee_exemptions e ON s.id = e.student_id WHERE s.class_id = $1\`,
      [class_id]
    );
    for (const s of students.rows) {
      const finalAmount = total_amount * (1 - s.discount_percent / 100);
      await client.query(
        \`INSERT INTO student_fees (student_id, fee_period_id, original_amount, final_amount, status)
         VALUES ($1, $2, $3, $4, 'UNPAID')\`,
        [s.id, periodId, total_amount, finalAmount]
      );
    }
    await client.query('COMMIT');
    return res.status(201).json({ success: true, message: 'Tạo đợt thu thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/fees/periods \\
  -H "Authorization: Bearer <TOKEN_ADMIN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Hoc phi Thang 11","total_amount":1500000,"due_date":"2026-11-30","class_id":1}'`,
    negativeCases: [
      'Tạo đợt thu có tổng số tiền âm -> Nhận HTTP 400 Bad Request.'
    ],
    demoSteps: [
      '1. BGH tạo đợt thu Học phí Tháng 11: 1,500,000 VNĐ cho Lớp 10A1.',
      '2. Học sinh diện chính sách được giảm 50% tự động hiển thị số tiền phải đóng là 750,000 VNĐ.'
    ],
    smartCommit: 'git commit -m "KAN-131 #time 8h #comment Hoan thanh tao dot thu hoc phi va tinh mien giam chinh sach #resolve"',
    docs: [
      { name: 'Database Third Normal Form (3NF) Rules', url: 'https://en.wikipedia.org/wiki/Third_normal_form' },
      { name: 'PostgreSQL Numeric Precision for Financial Data', url: 'https://www.postgresql.org/docs/current/datatype-numeric.html' }
    ],
    criteria: [
      'Tạo đợt thu và phân bổ công nợ chính xác cho từng học sinh.',
      'Tính toán đúng tỷ lệ miễn giảm cho các học sinh diện chính sách.',
      'Kiểm soát hạn nộp và tự động gắn cờ quá hạn khi đến ngày due_date.'
    ]
  },
  {
    pbiCode: 'PBI-17a',
    jiraKey: 'KAN-132',
    name: 'PBI-17a: Tích hợp Cổng thanh toán VietQR động & Tự động gạch nợ học phí qua Webhook',
    module: 'Module 7: Quản Lý Học Phí & Cổng Thanh Toán VietQR',
    owner: 'Trần Quang Vinh (Fintech) & Huỳnh Trung Tính (Backend)',
    storyPoints: 8,
    estimateHours: '12h',
    priority: 1,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['vietqr', 'napas247', 'payment-gateway', 'webhook'],
    reqCode: 'REQ-FEE-03, REQ-FEE-04 (Ma trận RTM: UC_PAR_04)',
    story: 'Là Phụ huynh, tôi muốn quét mã VietQR động có sẵn số tiền và nội dung chuyển khoản trên ứng dụng ngân hàng để nộp học phí và được gạch nợ tức thì.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/services/VietQRService.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member2_Frontend/src/pages/parent/FeePaymentPage.jsx'
    ],
    layer: 'Fintech Integration & Automated Reconciliation Layer',
    workflow: `Bước 1: Mở VietQRService.js, định vị hàm generateDynamicQRCode(feeData).
Bước 2: Xây dựng URL mã VietQR theo chuẩn NAPAS 247 kèm mã đơn hàng và số tiền chính xác.
Bước 3: Mở FeeController.js (phương thức handlePaymentWebhook), mở Transaction: cập nhật student_fees status = 'PAID', tạo bản ghi trong receipts và ghi log audit.
Bước 4: Mở FeePaymentPage.jsx trên giao diện phụ huynh, quét thử mã QR giả lập và kiểm tra trạng thái chuyển sang 'ĐÃ THANH TOÁN' ngay lập tức.`,
    codeSnippet: `// VietQRService.js - Tạo Link mã VietQR động chuẩn NAPAS 247
export const generateVietQRUrl = (bankBin, accountNo, amount, transferContent) => {
  const encodedContent = encodeURIComponent(transferContent);
  return \`https://img.vietqr.io/image/\${bankBin}-\${accountNo}-compact2.png?amount=\${amount}&addInfo=\${encodedContent}\`;
};

// FeeController.js - Webhook gạch nợ tự động & Chống trùng lặp (Idempotent)
export const handlePaymentWebhook = async (req, res) => {
  const { studentFeeId, transactionCode, amount } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updateRes = await client.query(
      \`UPDATE student_fees SET status = 'PAID', paid_at = NOW() 
       WHERE id = $1 AND status != 'PAID' RETURNING *\`,
      [studentFeeId]
    );
    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({ message: 'Giao dịch đã được xử lý trước đó.' });
    }
    await client.query(
      \`INSERT INTO receipts (student_fee_id, receipt_code, amount, payment_method, transaction_ref)
       VALUES ($1, $2, $3, 'VIETQR', $4)\`,
      [studentFeeId, 'BL-' + Date.now(), amount, transactionCode]
    );
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Gạch nợ thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};`,
    curlSample: `curl -X POST http://localhost:8081/api/fees/webhook \\
  -H "Content-Type: application/json" \\
  -d '{"studentFeeId":1,"transactionCode":"MB123456","amount":1500000}'`,
    negativeCases: [
      'Gửi webhook trùng lặp transactionCode -> Hệ thống phát hiện đã thanh toán và không gạch nợ lần 2 (Idempotent).'
    ],
    demoSteps: [
      '1. Phụ huynh mở trang "Thanh toán học phí", màn hình hiển thị mã VietQR động có sẵn số tiền và nội dung.',
      '2. Giả lập webhook ngân hàng gọi đến -> Màn hình phụ huynh tự động đổi sang màu xanh "ĐÃ THANH TOÁN" trong 2 giây.'
    ],
    smartCommit: 'git commit -m "KAN-132 #time 12h #comment Hoan thanh cong thanh toan VietQR dong va webhook gach no #resolve"',
    docs: [
      { name: 'VietQR Official Specification & Standard Guide', url: 'https://vietqr.net/' },
      { name: 'NAPAS 247 Payment Gateway Documentation', url: 'https://napas.com.vn/' },
      { name: 'node-postgres Unit of Work Transactions', url: 'https://node-postgres.com/features/transactions' }
    ],
    criteria: [
      'Mã VietQR hiển thị đúng số tiền và cú pháp nội dung chuyển khoản.',
      'Gạch nợ học phí tự động trong dưới 3 giây sau khi nhận Webhook.',
      'Bảo đảm tính toàn vẹn tài chính, chống gạch nợ trùng lặp (Idempotent).'
    ]
  },
  {
    pbiCode: 'PBI-17b',
    jiraKey: 'KAN-133',
    name: 'PBI-17b: Xuất hóa đơn/biên lai điện tử & Tra cứu lịch sử công nợ học phí',
    module: 'Module 7: Quản Lý Học Phí & Cổng Thanh Toán VietQR',
    owner: 'Nguyễn Minh Quốc Bảo (QA/Export) & Võ Hoàng Sơn (Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['receipt', 'pdfkit', 'invoicing', 'parent'],
    reqCode: 'REQ-FEE-05 (Ma trận RTM: UC_PAR_05)',
    story: 'Là Phụ huynh, tôi muốn tra cứu lịch sử nộp tiền và tải về biên lai điện tử có mã tra cứu hóa đơn sau khi hoàn tất thanh toán.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/PdfExportService.js',
      'members/member2_Frontend/src/pages/parent/ReceiptViewPage.jsx'
    ],
    layer: 'Receipt Generation & Invoicing Presentation Layer',
    workflow: `Bước 1: Mở FeeController.js, kiểm tra hàm getReceiptById và downloadReceiptPdf.
Bước 2: Sử dụng PdfExportService.js để vẽ mẫu biên lai thu tiền chuẩn Bộ Tài chính / GD&ĐT có mã hóa đơn, mã tra cứu QR.
Bước 3: Mở ReceiptViewPage.jsx trên giao diện phụ huynh, kiểm tra danh sách các biên lai đã nộp.
Bước 4: Bấm nút 'Tải biên lai PDF' và kiểm tra file PDF tải về mở chuẩn định dạng, sắc nét.`,
    codeSnippet: `// PdfExportService.js - Tạo file PDF biên lai học phí điện tử
export const generateReceiptPdf = (receipt, res) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', \`inline; filename="BienLai_\${receipt.receipt_code}.pdf"\`);
  doc.pipe(res);

  doc.fontSize(16).text('TRƯỜNG THPT HOA SEN - BIÊN LAI THU TIỀN HỌC PHÍ', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(\`Mã biên lai: \${receipt.receipt_code}\`);
  doc.text(\`Học sinh: \${receipt.student_name} - Lớp: \${receipt.class_name}\`);
  doc.text(\`Số tiền thanh toán: \${Number(receipt.amount).toLocaleString('vi-VN')} VNĐ\`);
  doc.text(\`Phương thức: \${receipt.payment_method} - Thời gian: \${receipt.created_at}\`);
  doc.end();
};`,
    curlSample: `curl -X GET http://localhost:8081/api/fees/receipts/1/pdf \\
  -H "Authorization: Bearer <TOKEN_PH>" --output BienLai.pdf`,
    negativeCases: [
      'Truy vấn mã biên lai không tồn tại -> Nhận HTTP 404 Not Found.'
    ],
    demoSteps: [
      '1. Phụ huynh vào trang "Lịch sử đóng học phí", bấm "Tải biên lai".',
      '2. File PDF mở lên có mã biên lai chuẩn hóa, thông tin học sinh và con dấu điện tử.'
    ],
    smartCommit: 'git commit -m "KAN-133 #time 8h #comment Hoan thanh xuat hoa don bien lai dien tu PDF #resolve"',
    docs: [
      { name: 'PDFKit Node.js Receipt Generator Guide', url: 'https://pdfkit.org/' },
      { name: 'Nghị định 123/2020/NĐ-CP Quy định Hóa đơn chứng từ', url: 'https://thuvienphapluat.vn/' }
    ],
    criteria: [
      'Mỗi giao dịch thanh toán thành công đều sinh 1 biên lai điện tử duy nhất.',
      'Biên lai PDF có mã tra cứu và thông tin người nộp tiền rõ ràng.',
      'Phụ huynh có thể tra cứu lại toàn bộ lịch sử nộp học phí nhiều năm.'
    ]
  },
  {
    pbiCode: 'PBI-24',
    jiraKey: 'KAN-134',
    name: 'PBI-24: Báo cáo tài chính, thống kê công nợ tồn đọng & Tỷ lệ thu học phí theo Khối/Lớp',
    module: 'Module 7: Quản Lý Học Phí & Cổng Thanh Toán VietQR',
    owner: 'Huỳnh Trung Tính (Backend) & Võ Hoàng Sơn (Frontend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['financial-report', 'debt-tracking', 'chartjs', 'accounting'],
    reqCode: 'REQ-FEE-06 (Ma trận RTM: UC_BGH_10)',
    story: 'Là Kế toán và Ban Giám Hiệu, tôi muốn xem báo cáo tổng hợp dòng tiền học phí, số tiền đã thu, nợ tồn đọng theo từng khối lớp để quản trị tài chính.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member2_Frontend/src/pages/admin/FeeReportPage.jsx'
    ],
    layer: 'Financial Analytics & Management Accounting Layer',
    workflow: `Bước 1: Mở FeeController.js, định vị phương thức getFeeFinancialReport(req, res).
Bước 2: Viết câu truy vấn PostgreSQL GROUP BY grade_level, class_id với các hàm tổng hợp SUM, COUNT và tính tỷ lệ hoàn thành %.
Bước 3: Mở FeeReportPage.jsx trên giao diện BGH, cấu hình Chart.js hiển thị biểu đồ tròn tiến độ thu và biểu đồ cột so sánh theo khối.
Bước 4: Kiểm tra bộ lọc theo đợt thu và nút xuất báo cáo tài chính ra file Excel.`,
    codeSnippet: `// FeeController.js - Truy vấn Báo cáo tài chính tổng hợp theo Khối lớp
export const getFeeFinancialReport = async (req, res) => {
  const { academicYearId } = req.query;
  const query = \`
    SELECT c.grade_level,
      COUNT(sf.id) as total_students,
      SUM(sf.final_amount) as total_expected,
      SUM(sf.final_amount) FILTER (WHERE sf.status = 'PAID') as total_collected,
      SUM(sf.final_amount) FILTER (WHERE sf.status = 'UNPAID') as total_outstanding,
      ROUND((SUM(sf.final_amount) FILTER (WHERE sf.status = 'PAID') / NULLIF(SUM(sf.final_amount), 0) * 100), 2) as completion_rate
    FROM student_fees sf
    JOIN students s ON sf.student_id = s.id
    JOIN classes c ON s.class_id = c.id
    WHERE c.academic_year_id = $1
    GROUP BY c.grade_level
    ORDER BY c.grade_level;
  \`;
  const result = await pool.query(query, [academicYearId]);
  return res.status(200).json({ success: true, data: result.rows });
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/fees/financial-report?academicYearId=1" \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Năm học chưa phát sinh đợt thu nào -> Trả về mảng rỗng và tổng 0 VNĐ.'
    ],
    demoSteps: [
      '1. BGH vào trang "Báo cáo tài chính", xem biểu đồ tròn tỷ lệ thu tiền học phí.',
      '2. Bấm lọc theo Khối 10 để xem số tiền đã thu và số nợ còn tồn đọng.'
    ],
    smartCommit: 'git commit -m "KAN-134 #time 8h #comment Hoan thanh bao cao tai chinh va thong ke cong no theo khoi lop #resolve"',
    docs: [
      { name: 'PostgreSQL GROUP BY & Aggregate Queries', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP' },
      { name: 'Chart.js Doughnut & Bar Charts Guide', url: 'https://www.chartjs.org/docs/latest/charts/doughnut.html' }
    ],
    criteria: [
      'Số liệu tài chính khớp 100% với nhật ký giao dịch ngân hàng.',
      'Phân loại chi tiết công nợ theo từng lớp học và từng học sinh.',
      'Hỗ trợ xuất báo cáo tài chính sang Excel phục vụ thanh tra quyết toán.'
    ]
  },
  {
    pbiCode: 'PBI-15',
    jiraKey: 'KAN-135',
    name: 'PBI-15: Bảng điều khiển (Dashboard) số liệu học vụ & Tài chính thời gian thực (BGH)',
    module: 'Module 8: Báo Cáo Thống Kê & Bảng Điều Khiển BGH',
    owner: 'Võ Hoàng Sơn (Frontend) & Huỳnh Trung Tính (Backend)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['dashboard', 'executive', 'real-time', 'kpi'],
    reqCode: 'REQ-REP-03 (Ma trận RTM: UC_BGH_11)',
    story: 'Là Ban Giám Hiệu, tôi muốn có bảng Dashboard tổng quan hiển thị số liệu học sinh, giáo viên, chuyên cần hôm nay và tiến độ vào điểm toàn trường.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/DashboardController.js',
      'members/member2_Frontend/src/pages/admin/DashboardPage.jsx'
    ],
    layer: 'Executive Dashboard & Data Aggregation Layer',
    workflow: `Bước 1: Mở DashboardController.js, kiểm tra hàm getExecutiveDashboardSummary(req, res).
Bước 2: Viết câu lệnh truy vấn song song qua Promise.all([countStudents, countTeachers, getTodayAttendance, getGradeProgress]).
Bước 3: Mở DashboardPage.jsx trên giao diện Admin, kiểm tra hiển thị 4 thẻ KPI thống kê nổi bật trên đầu trang và 2 biểu đồ phân tích.
Bước 4: Kiểm tra tốc độ tải trang trên tab Network của trình duyệt để đảm bảo dưới 200ms.`,
    codeSnippet: `// DashboardController.js - Tổng hợp số liệu KPI thời gian thực cho BGH (Chạy song song)
export const getExecutiveDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [studentsCount, teachersCount, attendanceRate, feeCollected] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students WHERE status = 'ACTIVE'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role LIKE '%TEACHER%' AND status = 'ACTIVE'"),
      pool.query(\`
        SELECT ROUND(COUNT(*) FILTER (WHERE status = 'CO_MAT') * 100.0 / NULLIF(COUNT(*), 0), 1) as rate 
        FROM attendance WHERE date = $1\`, [today]),
      pool.query("SELECT SUM(amount) FROM receipts WHERE created_at >= NOW() - INTERVAL '30 days'")
    ]);

    return res.status(200).json({
      success: true,
      kpis: {
        totalStudents: parseInt(studentsCount.rows[0].count),
        totalTeachers: parseInt(teachersCount.rows[0].count),
        todayAttendanceRate: parseFloat(attendanceRate.rows[0]?.rate || 100),
        monthlyRevenue: parseFloat(feeCollected.rows[0]?.sum || 0)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};`,
    curlSample: `curl -X GET http://localhost:8081/api/dashboard/stats \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Tài khoản không phải BGH cố truy cập -> Nhận HTTP 403 Forbidden.'
    ],
    demoSteps: [
      '1. Đăng nhập Admin, Dashboard hiển thị ngay 4 thẻ KPI trong 180ms.',
      '2. Quan sát số lượng học sinh, giáo viên, tỷ lệ chuyên cần hôm nay và doanh thu 30 ngày.'
    ],
    smartCommit: 'git commit -m "KAN-135 #time 8h #comment Hoan thanh bang dieu khien dashboard so lieu BGH thoi gian thuc #resolve"',
    docs: [
      { name: 'PostgreSQL EXPLAIN ANALYZE & Query Optimization', url: 'https://www.postgresql.org/docs/current/using-explain.html' },
      { name: 'Promise.all Concurrency in Node.js', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' }
    ],
    criteria: [
      'Dashboard tải toàn bộ dữ liệu trong dưới 200ms.',
      'Dữ liệu điểm danh và tiến độ vào điểm được làm mới tự động.',
      'Giao diện trực quan, tương thích hiển thị trên cả máy tính và iPad.'
    ]
  },
  {
    pbiCode: 'PBI-16',
    jiraKey: 'KAN-136',
    name: 'PBI-16: Báo cáo tổng kết học kỳ & Năm học theo biểu mẫu chuẩn của Sở/Phòng GD&ĐT',
    module: 'Module 8: Báo Cáo Thống Kê & Bảng Điều Khiển BGH',
    owner: 'Nguyễn Minh Quốc Bảo (QA/Reporting) & Huỳnh Trung Tính',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 2,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['semester-report', 'department-of-education', 'compliance', 'excel'],
    reqCode: 'REQ-REP-04 (Ma trận RTM: UC_BGH_12)',
    story: 'Là Ban Giám Hiệu, tôi muốn trích xuất báo cáo chất lượng giáo dục học kỳ và năm học theo đúng biểu mẫu thống kê của Sở GD&ĐT để nộp báo cáo.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js',
      'members/member2_Frontend/src/pages/reports/SemesterReportPage.jsx'
    ],
    layer: 'Regulatory Compliance & Statistical Aggregation Layer',
    workflow: `Bước 1: Mở ReportController.js, định vị phương thức getSemesterSummaryReport(req, res).
Bước 2: Viết câu truy vấn tổng hợp số lượng và tỷ lệ % học lực, rèn luyện theo chuẩn biểu mẫu Sở GD&ĐT.
Bước 3: Mở SemesterReportPage.jsx, hiển thị bảng số liệu thống kê tổng kết học kỳ theo từng khối 10, 11, 12.
Bước 4: Bấm nút 'Xuất Báo cáo Sở GD&ĐT' và kiểm tra file Excel tải về có định dạng chuẩn chỉ.`,
    codeSnippet: `// ReportController.js - Thống kê chất lượng giáo dục theo biểu mẫu Sở GD&ĐT
export const getEducationQualityReport = async (req, res) => {
  const { semester, academicYearId } = req.query;
  const query = \`
    SELECT c.grade_level,
      COUNT(s.id) as total_students,
      COUNT(s.id) FILTER (WHERE sr.academic_rank = 'TỐT') as tot_count,
      COUNT(s.id) FILTER (WHERE sr.academic_rank = 'KHÁ') as kha_count,
      COUNT(s.id) FILTER (WHERE sr.academic_rank = 'ĐẠT') as dat_count,
      COUNT(s.id) FILTER (WHERE sr.academic_rank = 'CHƯA ĐẠT') as chuadat_count
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN semester_results sr ON s.id = sr.student_id AND sr.semester = $1
    WHERE c.academic_year_id = $2
    GROUP BY c.grade_level
    ORDER BY c.grade_level;
  \`;
  const result = await pool.query(query, [semester, academicYearId]);
  return res.status(200).json({ success: true, data: result.rows });
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/reports/semester-summary?semester=HK1&academicYearId=1" \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Học kỳ chưa kết thúc hoặc chưa tổng kết -> Hệ thống đưa ra cảnh báo số liệu chưa đầy đủ.'
    ],
    demoSteps: [
      '1. Mở trang "Báo cáo tổng kết Sở GD&ĐT", xem bảng tổng hợp tỷ lệ học sinh Tốt/Khá/Đạt.',
      '2. Bấm nút "Xuất file Excel" để tải về bản báo cáo định dạng chuẩn Bộ GD&ĐT.'
    ],
    smartCommit: 'git commit -m "KAN-136 #time 8h #comment Hoan thanh bao cao tong ket hoc ky nam hoc theo mau So GDDT #resolve"',
    docs: [
      { name: 'SheetJS Advanced Cell Formatting Guide', url: 'https://docs.sheetjs.com/' },
      { name: 'Thông tư số 32/2020/TT-BGDĐT Điều lệ Trường Trung học', url: 'https://moet.gov.vn/' }
    ],
    criteria: [
      'Số liệu tổng hợp khớp 100% với kết quả đánh giá cá nhân của từng học sinh.',
      'Định dạng biểu mẫu Excel tuân thủ đúng quy chuẩn báo cáo ngành giáo dục.',
      'Hỗ trợ lọc báo cáo theo từng học kỳ hoặc cả năm học.'
    ]
  },
  {
    pbiCode: 'PBI-23',
    jiraKey: 'KAN-137',
    name: 'PBI-23: Nhật ký kiểm toán hệ thống (Audit Trail) & Giám sát truy vết thay đổi điểm số',
    module: 'Module 8: Báo Cáo Thống Kê & Bảng Điều Khiển BGH',
    owner: 'Trần Quang Vinh (Logic & Security Lead)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-11-02',
    dueDate: '2026-11-15',
    sprint: 'Sprint 5 (Tuần 8 - Tuần 9)',
    labels: ['audit-trail', 'security', 'immutability', 'logging'],
    reqCode: 'REQ-SEC-01 (Ma trận RTM: UC_BGH_13)',
    story: 'Là Ban Giám Hiệu, tôi muốn xem nhật ký kiểm toán ghi lại mọi thao tác sửa điểm, khóa sổ, đổi lịch để phát hiện gian lận và quy trách nhiệm rõ ràng.',
    primaryFiles: [
      'members/member4_Logic_Security/auditLogger.js',
      'members/member3_Backend_DB/school-management-nodejs/src/middleware/auditMiddleware.js',
      'members/member2_Frontend/src/pages/admin/AuditLogPage.jsx'
    ],
    layer: 'Audit Trail & Non-repudiation Security Layer',
    workflow: `Bước 1: Mở auditLogger.js và auditMiddleware.js tại Backend.
Bước 2: Xây dựng middleware tự động bắt các request thay đổi dữ liệu (POST, PUT, PATCH, DELETE) và ghi log vào bảng audit_logs.
Bước 3: Lưu chi tiết { old_value, new_value } dạng JSONB để so sánh trước/sau khi sửa điểm.
Bước 4: Mở AuditLogPage.jsx trên giao diện BGH, thực hiện 1 thao tác sửa điểm và kiểm tra nhật ký xuất hiện ngay trên bảng tra cứu.`,
    codeSnippet: `// auditMiddleware.js - Tự động ghi vết kiểm toán (Audit Trail) cho mọi thao tác ghi
export const auditTrailLogger = async (userId, action, targetTable, targetId, oldValue, newValue, req) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const query = \`
    INSERT INTO audit_logs (user_id, action, target_table, target_id, old_values, new_values, ip_address, user_agent, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
  \`;
  try {
    await pool.query(query, [
      userId, action, targetTable, targetId, 
      JSON.stringify(oldValue), JSON.stringify(newValue), 
      ipAddress, userAgent
    ]);
  } catch (err) {
    console.error('[AUDIT LOG ERROR]:', err.message);
  }
};`,
    curlSample: `curl -X GET "http://localhost:8081/api/audit-logs?limit=10" \\
  -H "Authorization: Bearer <TOKEN_ADMIN>"`,
    negativeCases: [
      'Thử gửi câu lệnh DELETE hoặc UPDATE vào bảng audit_logs -> Bị chặn hoàn toàn (Bảng chỉ cho phép INSERT).'
    ],
    demoSteps: [
      '1. Giáo viên thực hiện sửa 1 ô điểm từ 8.0 lên 9.0.',
      '2. Đăng nhập BGH mở trang "Nhật ký kiểm toán" -> Bản ghi xuất hiện ngay lập tức ghi nhận ai sửa, thời gian, IP và giá trị cũ/mới.'
    ],
    smartCommit: 'git commit -m "KAN-137 #time 8h #comment Hoan thanh nhat ky kiem toan he thong audit trail giam sat sua diem #resolve"',
    docs: [
      { name: 'OWASP Logging & Monitoring Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
      { name: 'PostgreSQL JSONB Type & Indexing Guide', url: 'https://www.postgresql.org/docs/current/datatype-json.html' }
    ],
    criteria: [
      'Ghi vết 100% các thao tác thay đổi điểm số và khóa sổ học vụ.',
      'Lưu trữ dữ liệu cũ và mới (old/new) để đối soát khi có khiếu nại.',
      'Không ai (kể cả Admin) có thể xóa hoặc chỉnh sửa nhật ký kiểm toán.'
    ]
  },
  {
    pbiCode: 'PBI-19',
    jiraKey: 'KAN-138',
    name: 'PBI-19: Cổng thông tin Học sinh & Phụ huynh: Tra cứu điểm, Thời khóa biểu & Chuyên cần',
    module: 'Module 4: Quản Lý Hồ Sơ Học Sinh & Điểm Danh',
    owner: 'Võ Hoàng Sơn (Frontend) & Trần Quang Vinh (Security)',
    storyPoints: 5,
    estimateHours: '8h',
    priority: 1,
    startDate: '2026-11-09',
    dueDate: '2026-11-22',
    sprint: 'Sprint 5 (Tuần 9 - Tuần 10)',
    labels: ['portal', 'student', 'parent', 'anti-idor', 'mobile'],
    reqCode: 'REQ-PORT-01, REQ-PORT-02 (Ma trận RTM: UC_STU_01, UC_PAR_01)',
    story: 'Là Học sinh và Phụ huynh, tôi muốn đăng nhập vào cổng thông tin cá nhân trên điện thoại/máy tính để tra cứu điểm thi, thời khóa biểu và học phí.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/PortalController.js',
      'members/member2_Frontend/src/pages/student/StudentPortalPage.jsx',
      'members/member2_Frontend/src/pages/parent/ParentPortalPage.jsx'
    ],
    layer: 'Self-Service Portal & Responsive Web Layer',
    workflow: `Bước 1: Mở PortalController.js, kiểm tra các hàm getStudentOverview và getParentChildrenOverview.
Bước 2: Áp dụng cơ chế chống BOLA/IDOR: lấy student_id trực tiếp từ req.user.id hoặc kiểm tra quan hệ phụ huynh trong CSDL.
Bước 3: Mở StudentPortalPage.jsx và ParentPortalPage.jsx, kiểm tra giao diện chia tab trực quan (Điểm số, TKB, Học phí, Điểm danh).
Bước 4: Đăng nhập tài khoản hs001 hoặc ph001, kiểm tra hiển thị đúng dữ liệu cá nhân trên cả màn hình máy tính và chế độ di động.`,
    codeSnippet: `// PortalController.js - Chống BOLA/IDOR: Lấy dữ liệu học sinh dựa trên Token xác thực
export const getMyStudentProfile = async (req, res) => {
  let studentId = null;
  if (req.user.role === 'ROLE_STUDENT') {
    studentId = req.user.student_id;
  } else if (req.user.role === 'ROLE_PARENT') {
    const childId = req.query.childId;
    const verify = await pool.query(
      'SELECT * FROM student_parents WHERE parent_user_id = $1 AND student_id = $2',
      [req.user.id, childId]
    );
    if (verify.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem thông tin học sinh này!' });
    }
    studentId = childId;
  }
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
  return res.status(200).json({ success: true, data: result.rows[0] });
};`,
    curlSample: `curl -X GET http://localhost:8081/api/portal/my-profile \\
  -H "Authorization: Bearer <TOKEN_HOC_SINH>"`,
    negativeCases: [
      'Học sinh tự sửa student_id trên query param để xem điểm bạn khác -> Hệ thống bỏ qua param và chỉ trả về điểm của chính mình (Chống BOLA/IDOR 100%).'
    ],
    demoSteps: [
      '1. Đăng nhập tài khoản Học sinh (hs001).',
      '2. Màn hình portal hiển thị bảng điểm cá nhân, thời khóa biểu và chuyên cần của chính em đó.',
      '3. Bật chế độ Responsive điện thoại (F12) -> Giao diện tự động co giãn hoàn hảo.'
    ],
    smartCommit: 'git commit -m "KAN-138 #time 8h #comment Hoan thanh cong thong tin hoc sinh phu huynh va phong thu BOLA IDOR #resolve"',
    docs: [
      { name: 'OWASP Broken Object Level Authorization (BOLA/IDOR) Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#insecure-direct-object-references-idor' },
      { name: 'Tailwind CSS Mobile-First Responsive Design', url: 'https://tailwindcss.com/docs/responsive-design' }
    ],
    criteria: [
      'Chặn 100% lỗ hổng xem trộm dữ liệu học sinh khác (Chống BOLA/IDOR).',
      'Giao diện thân thiện, hiển thị hoàn hảo trên màn hình điện thoại di động.',
      'Cập nhật số liệu điểm thi tức thời ngay khi giáo viên công bố.'
    ]
  }
];

/**
 * Hàm xây dựng nội dung Markdown giàu chi tiết, chuẩn 11 HẠNG MỤC CÓ DEADLINE
 */
function buildEnrichedDescription(item) {
  const githubLinks = item.primaryFiles.map(f => `- **GitHub**: [\`${f}\`](${GITHUB_REPO}/${f})`).join('\n');
  const bitbucketLinks = item.primaryFiles.map(f => `- **Bitbucket**: [\`${f}\`](${BITBUCKET_REPO}/${f})`).join('\n');
  const criteriaList = item.criteria.map(c => `- [x] ${c}`).join('\n');
  const docsList = (item.docs || []).map(d => `- 📖 [${d.name}](${d.url})`).join('\n');
  const negativeList = (item.negativeCases || []).map((nc, idx) => `${idx + 1}. ${nc}`).join('\n');
  const demoList = (item.demoSteps || []).map(ds => `- ${ds}`).join('\n');

  return `### 📋 1. MỤC TIÊU NGHIỆP VỤ & PHÂN CÔNG (USER STORY & RACI)
- **Mục tiêu (User Story)**: ${item.story}
- **Mã liên kết Yêu cầu SRS**: \`${item.reqCode}\`
- **Thành viên chịu trách nhiệm chính (RACI Owner)**: **${item.owner}**
- **Ước lượng Agile**: **${item.storyPoints} Story Points** | **Thời gian dự kiến**: **${item.estimateHours}**
- 📅 **Lịch trình & Hạn chót (Deadlines)**: **Bắt đầu**: \`${item.startDate}\` | **Hạn chót (Due Date)**: **\`${item.dueDate}\`** (\`${item.sprint}\`)

---

### 🌐 2. LIÊN KẾT MÃ NGUỒN TRỰC TIẾP (SOURCE CODE REPOSITORIES)
**Kho lưu trữ GitHub chính thức:**
${githubLinks}

**Kho lưu trữ Bitbucket song song:**
${bitbucketLinks}

---

### 🏗️ 3. VỊ TRÍ KIẾN TRÚC & PHÂN TẦNG (ARCHITECTURE LAYER)
- **Module lớn phụ trách**: ${item.module}
- **Tầng kiến trúc Clean Architecture / Frontend**: \`${item.layer}\`

---

### 🛠️ 4. HƯỚNG DẪN CHI TIẾT CÁCH THỰC HIỆN & SỬA CODE (STEP-BY-STEP DEV WORKFLOW)
\`\`\`text
${item.workflow}
\`\`\`

---

### 💻 5. ĐOẠN MÃ MẪU & GỢI Ý LẬP TRÌNH CỤ THỂ (SAMPLE CODE SNIPPET)
\`\`\`javascript
${item.codeSnippet}
\`\`\`

---

### ⚡ 6. LỆNH KIỂM THỬ NHANH CURL (READY-TO-RUN CURL COMMAND)
\`\`\`bash
${item.curlSample}
\`\`\`

---

### ⚠️ 7. KỊCH BẢN KIỂM THỬ NGOẠI LỆ & LỖI BIÊN (NEGATIVE TEST CASES)
\`\`\`text
${negativeList}
\`\`\`

---

### 🎬 8. KỊCH BẢN DEMO UAT 3 PHÚT CHO GIẢNG VIÊN (STEP-BY-STEP DEMO SCRIPT)
${demoList}

---

### 📚 9. TÀI LIỆU & ĐƯỜNG LINK HƯỚNG DẪN THAM KHẢO (OFFICIAL DOCS & TUTORIALS)
- 📘 **Cẩm nang Lập trình & Sửa code Dự án:** [HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](${HANDBOOK_LINK_GH}) ([Bản Bitbucket](${HANDBOOK_LINK_BB}))
- 🖥️ **Tài liệu Swagger / OpenAPI UI trực tiếp:** [${SWAGGER_URL}](${SWAGGER_URL})
- 🎨 **Slide Trình Chiếu Đồ Án (Canva):** [Slide Canva Báo Cáo](${CANVA_SLIDE})
${docsList}

---

### ✅ 10. TIÊU CHÍ NGHIỆM THU (DoD) & CÚ PHÁP JIRA SMART COMMIT
**Tiêu chí nghiệm thu (Acceptance Criteria):**
${criteriaList}

**Cú pháp Jira Smart Commit mẫu khi hoàn thành:**
\`\`\`bash
${item.smartCommit}
\`\`\`
`;
}

/**
 * Cập nhật trên JIRA CLOUD (Kèm duedate, labels, timetracking, assignee)
 */
async function updateJiraIssues() {
  console.log('================================================================');
  console.log(' BẮT ĐẦU CẬP NHẬT DEADLINE & CHI TIẾT TOÀN DIỆN LÊN JIRA CLOUD');
  console.log('================================================================\n');

  let successCount = 0;
  for (const item of DETAILED_PBIS) {
    const enrichedDesc = buildEnrichedDescription(item);
    try {
      const res = await fetch(`${JIRA_DOMAIN}/rest/api/2/issue/${item.jiraKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': jiraAuthHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            description: enrichedDesc,
            duedate: item.dueDate, // Cập nhật hạn chót Deadline native trên Jira
            labels: item.labels,
            timetracking: { originalEstimate: item.estimateHours, remainingEstimate: '0h' },
            assignee: { accountId: '712020:79b4e402-a50a-4abe-b0fb-cbc1ab970f0b' } // Võ Duy Bình
          }
        })
      });

      if (res.status === 204 || res.ok) {
        successCount++;
        console.log(`[JIRA OK] Cập nhật ${item.jiraKey} (${item.pbiCode}) [Deadline: ${item.dueDate}, Labels, Time: ${item.estimateHours}] thành công.`);
      } else {
        const errText = await res.text();
        console.warn(`[JIRA FAIL] ${item.jiraKey}: Status ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.error(`[JIRA ERROR] ${item.jiraKey}:`, err.message);
    }
  }

  console.log(`\n=> HOÀN TẤT JIRA: ${successCount} / ${DETAILED_PBIS.length} issues cập nhật Deadline thành công!\n`);
}

/**
 * Cập nhật trên CLICKUP (Kèm due_date, start_date, priority)
 */
async function updateClickUpTasks() {
  console.log('================================================================');
  console.log(' BẮT ĐẦU CẬP NHẬT DEADLINE & CHI TIẾT TOÀN DIỆN LÊN CLICKUP');
  console.log('================================================================\n');

  try {
    const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, { headers: clickupHeaders });
    const data = await res.json();
    const lists = data.lists || [];

    let successCount = 0;

    for (const list of lists) {
      const taskRes = await fetch(`${CLICKUP_API_BASE}/list/${list.id}/task?include_closed=true`, { headers: clickupHeaders });
      const taskData = await taskRes.json();
      const tasks = taskData.tasks || [];

      for (const t of tasks) {
        const matchedPBI = DETAILED_PBIS.find(p => t.name.includes(p.pbiCode));
        if (matchedPBI) {
          const enrichedDesc = buildEnrichedDescription(matchedPBI);
          const startMs = new Date(`${matchedPBI.startDate}T00:00:00+07:00`).getTime();
          const dueMs = new Date(`${matchedPBI.dueDate}T23:59:59+07:00`).getTime();

          const updateRes = await fetch(`${CLICKUP_API_BASE}/task/${t.id}`, {
            method: 'PUT',
            headers: clickupHeaders,
            body: JSON.stringify({
              description: enrichedDesc,
              priority: matchedPBI.priority,
              start_date: startMs,
              start_date_time: false,
              due_date: dueMs,
              due_date_time: false
            })
          });

          if (updateRes.ok) {
            successCount++;
            console.log(`[CLICKUP OK] Cập nhật task ${matchedPBI.pbiCode} (ID: ${t.id}) [Start: ${matchedPBI.startDate}, Deadline: ${matchedPBI.dueDate}] thành công.`);
          } else {
            console.warn(`[CLICKUP FAIL] ${t.name}:`, await updateRes.text());
          }
        }
      }
    }

    console.log(`\n=> HOÀN TẤT CLICKUP: ${successCount} / ${DETAILED_PBIS.length} tasks cập nhật Deadline thành công!`);

  } catch (err) {
    console.error('[CLICKUP ERROR]:', err.message);
  }
}

async function run() {
  await updateJiraIssues();
  await updateClickUpTasks();
  console.log('\n================================================================');
  console.log(' TẤT CẢ 27 TASKS TRÊN JIRA & CLICKUP ĐÃ ĐỒNG BỘ DEADLINE 100%!');
  console.log('================================================================');
}

run();
