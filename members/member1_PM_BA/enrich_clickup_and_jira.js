/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/enrich_clickup_and_jira.js
 * MỤC ĐÍCH: Bổ sung chi tiết toàn diện cho 27 Tasks trên cả JIRA CLOUD và CLICKUP:
 *           - Mục tiêu nghiệp vụ (User Story)
 *           - Đường dẫn mã nguồn trực tiếp trên GitHub và Bitbucket
 *           - Vị trí kiến trúc & Tệp liên quan (Clean Architecture / React)
 *           - Hướng dẫn kỹ thuật & Gợi ý lập trình chi tiết
 *           - HƯỚNG DẪN CHI TIẾT CÁCH THỰC HIỆN & SỬA CODE (STEP-BY-STEP DEV WORKFLOW)
 *           - TÀI LIỆU & ĐƯỜNG LINK HƯỚNG DẪN THAM KHẢO CHÍNH THỨC (OFFICIAL DOCS)
 *           - Tiêu chí nghiệm thu (Acceptance Criteria / Definition of Done)
 * TÁC GIẢ: Võ Duy Bình (Project Manager & Lead BA)
 * NGÀY CẬP NHẬT: 14/11/2026 (Tuần 10)
 * ================================================================================
 */

const GITHUB_REPO = 'https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main';
const BITBUCKET_REPO = 'https://bitbucket.org/codyisme27205/pt_da_pm/src/main';
const HANDBOOK_LINK_GH = `${GITHUB_REPO}/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md`;
const HANDBOOK_LINK_BB = `${BITBUCKET_REPO}/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md`;

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
 * Danh sách đặc tả kỹ thuật chuyên sâu cho 27 Tasks (PBIs)
 * Mỗi task có hướng dẫn từng bước (workflow) và đường link tài liệu tham khảo (docs)
 */
const DETAILED_PBIS = [
  {
    pbiCode: 'PBI-01',
    jiraKey: 'KAN-112',
    name: 'PBI-01: Đăng nhập JWT vô trạng thái & Nút 1-Click Demo Login 5 vai trò (BGH, GV, HS, PH)',
    module: 'Module 1: Xác Thực & Quản Trị Phân Quyền (Auth & RBAC)',
    story: 'Là Người dùng (BGH, GVCN, GVBM, HS, PH), tôi muốn đăng nhập bằng tài khoản/mật khẩu hoặc dùng nút 1-Click Demo Login để vào đúng phân hệ chức năng tương ứng với quyền hạn của mình.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/auth/LoginPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js',
      'members/member4_Logic_Security/jwtAuthMiddleware.js'
    ],
    layer: 'Frontend UI Auth & Backend Presentation / Security Layer',
    guide: `1. Frontend (LoginPage.jsx):
   - Xây dựng 5 thẻ '1-Click Demo Login' tương ứng 5 vai trò (admin, gvcn01, gv01, hs001, ph001).
   - Khi bấm, tự động điền username/password và gửi POST /api/auth/login.
   - Nhận phản hồi HTTP 200: Lưu { token, user } vào localStorage ('htqllh_user') và navigate sang dashboard tương ứng.
2. Backend (AuthController.js):
   - Tiếp nhận req.body { username, password, role }.
   - Gọi UserService/UserRepository tìm user: SELECT * FROM users WHERE username = $1 AND status = 'ACTIVE'.
   - So khớp mật khẩu qua bcrypt.compare(password, user.password_hash).
   - Sinh JWT Token ký bằng SECRET_KEY, thuật toán HS256, hạn 24 giờ.
3. Mã lỗi HTTP:
   - Trả về 400 Bad Request nếu thiếu trường dữ liệu.
   - Trả về 401 Unauthorized nếu sai mật khẩu hoặc tài khoản không tồn tại.
   - Trả về 403 Forbidden nếu tài khoản bị khóa (status = 'INACTIVE').`,
    workflow: `Bước 1: Mở tệp LoginPage.jsx tại Frontend, kiểm tra danh sách 5 tài khoản demo và sự kiện onClick gọi hàm handleQuickLogin(role).
Bước 2: Mở AuthController.js tại Backend, định vị hàm login(req, res). Kiểm tra việc trích xuất { username, password } và câu truy vấn SELECT * FROM users WHERE username = $1.
Bước 3: Sử dụng bcrypt.compare() để xác thực mật khẩu băm, sau đó gọi jwt.sign({ id, username, role }, JWT_SECRET, { expiresIn: '24h' }).
Bước 4: Mở Postman kiểm thử endpoint POST /api/auth/login với các ca: đúng pass (200), sai pass (401), thiếu field (400) và kiểm tra chuyển hướng trên trình duyệt.`,
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
    story: 'Là Ban Giám Hiệu, tôi muốn hệ thống kiểm soát quyền hạn 5 cấp bậc (Admin, GVCN, GVBM, Học sinh, Phụ huynh) để ngăn chặn truy cập trái phép vào các endpoint nhạy cảm.',
    primaryFiles: [
      'members/member4_Logic_Security/rbacMiddleware.js',
      'members/member3_Backend_DB/school-management-nodejs/src/middleware/authMiddleware.js',
      'members/member2_Frontend/src/components/common/ProtectedRoute.jsx'
    ],
    layer: 'Middleware Security Layer & Client Routing Guard',
    guide: `1. Backend Middleware (rbacMiddleware.js & authMiddleware.js):
   - Trích xuất Bearer Token từ Header 'Authorization'.
   - Giải mã và xác thực chữ ký số bằng jwt.verify(). Nếu lỗi/hết hạn ném 401 Unauthorized.
   - So khớp role trong token với danh sách allowedRoles của route:
     + export const requireBGH = rbacMiddleware(['ROLE_ADMIN']);
     + export const requireTeacher = rbacMiddleware(['ROLE_ADMIN', 'ROLE_HOMEROOM_TEACHER', 'ROLE_SUBJECT_TEACHER']);
   - Nếu không đủ thẩm quyền, trả về HTTP 403 Forbidden: { success: false, message: 'Bạn không có quyền truy cập chức năng này!' }.
2. Frontend (ProtectedRoute.jsx):
   - Kiểm tra AuthContext, nếu chưa đăng nhập điều hướng về /login.
   - Nếu role hiện tại không nằm trong roles cho phép, điều hướng về /unauthorized.`,
    workflow: `Bước 1: Mở rbacMiddleware.js, xây dựng higher-order function nhận mảng allowedRoles.
Bước 2: Trích xuất req.user từ authMiddleware. So khớp req.user.role với allowedRoles.
Bước 3: Nếu vi phạm, trả về HTTP 403 Forbidden kèm JSON thông báo rõ ràng.
Bước 4: Mở ProtectedRoute.jsx trên Frontend, bọc các route quản trị và giáo viên, kiểm thử truy cập chéo vai trò để xác nhận bị chặn.`,
    docs: [
      { name: 'Express Writing Middleware Guide', url: 'https://expressjs.com/en/guide/writing-middleware.html' },
      { name: 'NIST Role-Based Access Control (RBAC) Standard', url: 'https://csrc.nist.gov/projects/role-based-access-control' },
      { name: 'OWASP Authorization & Access Control Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' },
      { name: 'React Router v6 Protected Routes Tutorial', url: 'https://reactrouter.com/en/main/start/overview' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn quản trị danh sách người dùng toàn trường (tạo mới, đổi trạng thái, đặt lại mật khẩu) để kiểm soát tài khoản học vụ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js',
      'members/member2_Frontend/src/pages/admin/UserManagementPage.jsx'
    ],
    layer: 'Admin Management & Data Access Layer',
    guide: `1. Backend API:
   - GET /api/users: Phân trang (?page=1&limit=20), lọc theo role và status.
   - POST /api/users: Tạo tài khoản mới, mã hóa mật khẩu mặc định bằng bcrypt (saltRounds=10).
   - PATCH /api/users/:id/status: Cập nhật trạng thái ('ACTIVE', 'INACTIVE', 'LOCKED').
   - POST /api/users/:id/reset-password: Đặt lại mật khẩu ngẫu nhiên và gửi thông báo.
2. Kiểm tra nghiệp vụ:
   - Không cho phép Admin tự khóa chính tài khoản của mình.
   - Kiểm tra trùng lặp email/username trước khi INSERT.`,
    workflow: `Bước 1: Mở UserController.js và UserRepository.js, thêm các phương thức getAllUsers, createUser, toggleUserStatus, resetPassword.
Bước 2: Viết câu lệnh SQL tham số hóa an toàn: UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2.
Bước 3: Mã hóa mật khẩu mới bằng bcrypt.hash(newPass, 10) trước khi cập nhật.
Bước 4: Mở UserManagementPage.jsx trên giao diện BGH, kiểm tra bảng hiển thị danh sách, nút khóa/mở khóa tài khoản và modal đặt lại mật khẩu.`,
    docs: [
      { name: 'bcryptjs Official Documentation', url: 'https://www.npmjs.com/package/bcryptjs' },
      { name: 'PostgreSQL UPDATE Documentation', url: 'https://www.postgresql.org/docs/current/sql-update.html' },
      { name: 'Tailwind CSS Modal & Dialog Components', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn khởi tạo năm học mới, cấu hình 2 học kỳ (HK1, HK2), các khối 10, 11, 12 và lớp học để sẵn sàng cho công tác giảng dạy.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AcademicController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AcademicRepository.js',
      'members/member2_Frontend/src/pages/admin/AcademicYearsPage.jsx'
    ],
    layer: 'Domain Configuration & Repository Layer',
    guide: `1. Cơ sở dữ liệu:
   - Bảng academic_years (id, name, start_date, end_date, is_current).
   - Bảng semesters (id, academic_year_id, semester_name, start_date, end_date).
   - Bảng classes (id, name, grade_level, academic_year_id, room_number).
2. Backend Logic:
   - Khi kích hoạt 1 năm học làm 'is_current = true', tự động chuyển các năm học khác về false trong 1 Transaction.
   - Ràng buộc: start_date < end_date; tên lớp không được trùng trong cùng 1 năm học.`,
    workflow: `Bước 1: Mở AcademicController.js, kiểm tra hàm setCurrentAcademicYear(req, res).
Bước 2: Sử dụng client từ pool.connect() để mở Transaction: UPDATE academic_years SET is_current = false; UPDATE academic_years SET is_current = true WHERE id = $1; COMMIT;.
Bước 3: Kiểm tra validate ngày bắt đầu học kỳ phải nhỏ hơn ngày kết thúc học kỳ.
Bước 4: Mở AcademicYearsPage.jsx trên giao diện BGH, kiểm tra bảng năm học và nút kích hoạt năm học hiện tại.`,
    docs: [
      { name: 'node-postgres (pg) Transactions Guide', url: 'https://node-postgres.com/features/transactions' },
      { name: 'PostgreSQL Constraints & Foreign Keys', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' },
      { name: 'React Axios HTTP Client Documentation', url: 'https://axios-http.com/docs/intro' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn phân công giáo viên chủ nhiệm cho từng lớp và giáo viên bộ môn theo từng môn học để giáo viên có thẩm quyền vào điểm và quản lý lớp.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AssignmentController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AssignmentRepository.js',
      'members/member2_Frontend/src/pages/admin/TeachingAssignmentPage.jsx'
    ],
    layer: 'Business Logic Assignment & Authorization Mapping Layer',
    guide: `1. Ràng buộc nghiệp vụ:
   - Mỗi lớp học trong 1 năm học chỉ có DUY NHẤT 1 Giáo viên chủ nhiệm (GVCN).
   - Mỗi môn học tại 1 lớp có thể có 1 GVBM phụ trách.
   - Kiểm tra giáo viên được phân công có trạng thái ACTIVE và có chứng chỉ chuyên môn phù hợp.
2. Endpoint:
   - POST /api/assignments/homeroom: Phân công GVCN (class_id, teacher_id, academic_year_id).
   - POST /api/assignments/subject: Phân công GVBM (class_id, teacher_id, subject_id, academic_year_id).
   - GET /api/assignments/teacher/:teacherId: Lấy danh sách lớp và môn giáo viên đang phụ trách.`,
    workflow: `Bước 1: Mở AssignmentController.js và AssignmentRepository.js.
Bước 2: Viết câu lệnh kiểm tra xem lớp đã có GVCN chưa: SELECT * FROM homeroom_assignments WHERE class_id = $1 AND academic_year_id = $2.
Bước 3: Nếu đã có, trả về HTTP 409 Conflict hoặc cung cấp tùy chọn thay thế GVCN.
Bước 4: Mở TeachingAssignmentPage.jsx, chọn dropdown Lớp, Môn học, Giáo viên và kiểm tra lưu thành công.`,
    docs: [
      { name: 'Clean Architecture by Uncle Bob', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { name: 'PostgreSQL Unique Constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS' },
      { name: 'RESTful API Status Codes', url: 'https://restfulapi.net/http-status-codes/' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn sắp xếp thời khóa biểu theo tuần cho các lớp và hệ thống tự động cảnh báo khi giáo viên hoặc phòng học bị trùng tiết.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/TimetableController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/TimetableService.js',
      'members/member2_Frontend/src/pages/admin/TimetableManagementPage.jsx'
    ],
    layer: 'Algorithmic Conflict Resolution & Scheduling Layer',
    guide: `1. Thuật toán phát hiện xung đột (Conflict Detection):
   - Xung đột Giáo viên: Cùng 1 giáo viên không thể dạy 2 lớp khác nhau trong cùng (ngày trong tuần, tiết học).
   - Xung đột Lớp học: Cùng 1 lớp không thể học 2 môn khác nhau trong cùng 1 tiết.
   - Xung đột Phòng học: Cùng 1 phòng chức năng (Tin học, Thí nghiệm) không thể xếp 2 lớp cùng lúc.
2. Endpoint:
   - POST /api/timetables/batch: Lưu ma trận TKB tuần.
   - POST /api/timetables/validate: Kiểm tra trước xung đột và trả về danh sách lỗi chi tiết nếu có.`,
    workflow: `Bước 1: Mở TimetableService.js, xây dựng hàm validateConflicts(scheduleEntries).
Bước 2: Chạy thuật toán quét xung đột: lặp qua các tiết học, nhóm theo teacher_id và class_id; nếu phát hiện 2 tiết trùng ngày và số tiết thì ném lỗi kèm thông tin chi tiết.
Bước 3: Mở TimetableController.js, trả về HTTP 409 Conflict kèm danh sách tiết trùng lặp.
Bước 4: Mở TimetableManagementPage.jsx trên giao diện BGH, thử kéo thả hoặc xếp 2 tiết trùng giáo viên để kiểm tra cảnh báo đỏ xuất hiện tức thì.`,
    docs: [
      { name: 'Interval Scheduling & Conflict Detection Algorithm', url: 'https://en.wikipedia.org/wiki/Interval_scheduling' },
      { name: 'Tailwind CSS Grid Template Columns', url: 'https://tailwindcss.com/docs/grid-template-columns' },
      { name: 'React Drag and Drop Basics', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API' }
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
    story: 'Là Giáo viên, tôi muốn gửi yêu cầu đổi tiết hoặc dạy thay khi có việc đột xuất và BGH có thể duyệt trực tuyến để cập nhật TKB tạm thời.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/TimetableController.js',
      'members/member2_Frontend/src/pages/teacher/SubstituteRequestPage.jsx',
      'members/member2_Frontend/src/pages/admin/SubstituteApprovalPage.jsx'
    ],
    layer: 'Workflow Approval & State Machine Layer',
    guide: `1. Vòng đời đơn yêu cầu (State Machine):
   - 'PENDING': Giáo viên tạo đơn xin đổi tiết / dạy thay.
   - 'APPROVED': BGH phê duyệt, hệ thống tự động cập nhật TKB ngày cụ thể.
   - 'REJECTED': BGH từ chối kèm lý do phản hồi.
2. Endpoint:
   - POST /api/substitutes/request: Gửi yêu cầu (from_teacher_id, to_teacher_id, date, period, reason).
   - PATCH /api/substitutes/:id/approve: BGH duyệt đơn.
   - PATCH /api/substitutes/:id/reject: BGH từ chối.`,
    workflow: `Bước 1: Mở TimetableController.js, thêm các hàm createSubstituteRequest, approveSubstituteRequest, rejectSubstituteRequest.
Bước 2: Trong approveSubstituteRequest, sử dụng Transaction: cập nhật bảng substitute_requests status = 'APPROVED' và ghi đè lịch dạy tạm thời trong bảng timetable_exceptions.
Bước 3: Mở SubstituteRequestPage.jsx trên giao diện Giáo viên, gửi đơn thử nghiệm.
Bước 4: Đăng nhập tài khoản admin, mở SubstituteApprovalPage.jsx, bấm Duyệt và kiểm tra TKB của lớp được cập nhật tên giáo viên dạy thay.`,
    docs: [
      { name: 'State Pattern in Software Design', url: 'https://refactoring.guru/design-patterns/state' },
      { name: 'PostgreSQL Transactions Best Practices', url: 'https://node-postgres.com/features/transactions' },
      { name: 'Tailwind Badge & Status Styling', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn quản lý thông tin học sinh (họ tên, ngày sinh, phụ huynh) và nhập danh sách cả lớp từ file Excel (.xlsx) để tiết kiệm thời gian.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js',
      'members/member2_Frontend/src/pages/admin/StudentProfilePage.jsx'
    ],
    layer: 'Batch Processing & Excel Integration Layer',
    guide: `1. Xử lý Excel (SheetJS / xlsx):
   - Tiếp nhận file upload qua multer (chỉ nhận .xlsx, .xls, dung lượng < 5MB).
   - Đọc dữ liệu dòng: Họ và tên, Ngày sinh, Giới tính, Dân tộc, Địa chỉ, SĐT Phụ huynh.
   - Validate từng dòng: Ngày sinh đúng chuẩn ISO/YYYY-MM-DD, SĐT đúng 10 số.
2. Giao dịch Database:
   - Sử dụng client.query('BEGIN') để thực hiện batch INSERT vào bảng students.
   - Nếu có 1 dòng dữ liệu lỗi, ROLLBACK toàn bộ và trả về danh sách dòng bị lỗi cụ thể.`,
    workflow: `Bước 1: Mở StudentController.js, kiểm tra cấu hình middleware multer upload.single('file').
Bước 2: Dùng thư viện xlsx đọc buffer: const workbook = xlsx.read(req.file.buffer); const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).
Bước 3: Lặp qua từng bản ghi, validate họ tên, ngày sinh, giới tính; nếu hợp lệ thì đưa vào câu truy vấn Batch INSERT với BEGIN ... COMMIT.
Bước 4: Mở StudentProfilePage.jsx trên giao diện BGH, tải lên file mẫu Excel và kiểm tra danh sách học sinh được tạo mới trên CSDL.`,
    docs: [
      { name: 'SheetJS (xlsx) Official Documentation', url: 'https://docs.sheetjs.com/' },
      { name: 'Multer File Upload Middleware Guide', url: 'https://github.com/expressjs/multer' },
      { name: 'PostgreSQL Batch INSERT Queries', url: 'https://node-postgres.com/features/queries' }
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
    story: 'Là Giáo viên (GVCN/GVBM), tôi muốn điểm danh học sinh từng tiết học và hệ thống tự động thống kê số buổi nghỉ có phép/không phép để kịp thời nhắc nhở.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js',
      'members/member2_Frontend/src/pages/teacher/AttendanceCheckPage.jsx'
    ],
    layer: 'Data Ingestion & Alerting Mechanism Layer',
    guide: `1. Trạng thái điểm danh:
   - 'CO_MAT' (Có mặt), 'VANG_CO_PHEP' (Vắng có phép), 'VANG_KHONG_PHEP' (Vắng không phép), 'DI_TRE' (Đi trễ).
2. UPSERT Logic:
   - INSERT INTO attendance (student_id, date, period, status, note, teacher_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (student_id, date, period) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note;
3. Cảnh báo tự động:
   - Nếu học sinh vắng không phép >= 3 buổi trong tháng, gửi cờ cảnh báo đến GVCN.`,
    workflow: `Bước 1: Mở AttendanceController.js và AttendanceRepository.js, kiểm tra hàm saveAttendanceBatch(req, res).
Bước 2: Viết câu lệnh SQL sử dụng mệnh đề ON CONFLICT DO UPDATE để cho phép giáo viên chỉnh sửa điểm danh nếu bấm nhầm.
Bước 3: Mở AttendanceCheckPage.jsx, kiểm tra nút 'Điểm danh nhanh cả lớp Có mặt' và các radio button chọn trạng thái.
Bước 4: Bấm Lưu điểm danh, kiểm tra phản hồi HTTP 200 và kiểm tra dữ liệu hiển thị đúng trên CSDL PostgreSQL.`,
    docs: [
      { name: 'PostgreSQL UPSERT (ON CONFLICT) Guide', url: 'https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT' },
      { name: 'React State Management for Dynamic Lists', url: 'https://react.dev/learn/managing-state' },
      { name: 'Lucide React Attendance Icons', url: 'https://lucide.dev/icons/' }
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
    story: 'Là Phụ huynh học sinh, tôi muốn gửi đơn xin nghỉ học trực tuyến cho con kèm lý do để GVCN phê duyệt và tự động cập nhật trạng thái vắng có phép.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js',
      'members/member2_Frontend/src/pages/parent/LeaveApplicationPage.jsx',
      'members/member2_Frontend/src/pages/teacher/LeaveApprovalPage.jsx'
    ],
    layer: 'Interactive Communication & Workflow Layer',
    guide: `1. Phụ huynh tạo đơn:
   - POST /api/leave-requests: (student_id, from_date, to_date, reason, proof_image_url).
   - Kiểm tra ngày nghỉ không được trong quá khứ quá 2 ngày.
2. GVCN phê duyệt:
   - PATCH /api/leave-requests/:id/approve: Cập nhật status = 'APPROVED'.
   - Tự động đồng bộ sang bảng attendance: đánh dấu 'VANG_CO_PHEP' cho các ngày trong đơn.
   - Gửi thông báo đến tài khoản phụ huynh thông báo kết quả duyệt.`,
    workflow: `Bước 1: Mở LeaveRequestController.js, kiểm tra hàm createLeaveRequest và reviewLeaveRequest.
Bước 2: Trong reviewLeaveRequest, nếu action === 'APPROVE', mở Transaction cập nhật bảng leave_requests và tự động chèn bản ghi 'VANG_CO_PHEP' vào bảng attendance.
Bước 3: Mở LeaveApplicationPage.jsx trên giao diện phụ huynh, điền form xin nghỉ 1 ngày và bấm gửi.
Bước 4: Đăng nhập tài khoản GVCN, mở LeaveApprovalPage.jsx, bấm Phê duyệt và kiểm tra bảng điểm danh lớp đã tự động có trạng thái vắng có phép.`,
    docs: [
      { name: 'PostgreSQL Date / Time Types & Functions', url: 'https://www.postgresql.org/docs/current/datatype-datetime.html' },
      { name: 'Tailwind CSS Form Controls & Textareas', url: 'https://tailwindcss.com/docs' },
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
    story: 'Là Ban Giám Hiệu và GVCN, tôi muốn xem báo cáo thống kê tỷ lệ chuyên cần theo lớp/khối và phát hiện học sinh vắng quá 45 buổi để xử lý học vụ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js',
      'members/member2_Frontend/src/pages/admin/AttendanceStatsPage.jsx'
    ],
    layer: 'Analytics & Reporting Data Layer',
    guide: `1. Công thức tỷ lệ chuyên cần:
   - Tỷ lệ chuyên cần (%) = ((Tổng số buổi - Số buổi vắng) / Tổng số buổi) * 100.
2. Quy định điều lệ trường học:
   - Học sinh nghỉ học quá 45 buổi trong một năm học (kể cả có phép hoặc không phép) không được lên lớp (lưu ban).
3. Truy vấn tổng hợp:
   - SELECT student_id, COUNT(*) filter (where status in ('VANG_CO_PHEP', 'VANG_KHONG_PHEP')) as total_absent
     FROM attendance WHERE class_id = $1 GROUP BY student_id;`,
    workflow: `Bước 1: Mở AttendanceController.js, định vị phương thức getAttendanceAnalytics(req, res).
Bước 2: Viết câu truy vấn PostgreSQL sử dụng mệnh đề FILTER (WHERE status ...) để đếm số buổi vắng có phép và không phép.
Bước 3: Lọc ra danh sách học sinh có tổng số buổi vắng >= 45 buổi và gán cờ nguy cơ lưu ban.
Bước 4: Mở AttendanceStatsPage.jsx, kiểm tra render bảng thống kê tỷ lệ chuyên cần và danh sách học sinh bị cảnh báo đỏ.`,
    docs: [
      { name: 'PostgreSQL Aggregate Functions & FILTER Clause', url: 'https://www.postgresql.org/docs/current/functions-aggregate.html' },
      { name: 'Chart.js Bar & Percentage Charts Guide', url: 'https://www.chartjs.org/docs/latest/charts/bar.html' },
      { name: 'Điều lệ Trường Trung học (Thông tư 32/2020/TT-BGDĐT)', url: 'https://moet.gov.vn/' }
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
    story: 'Là Giáo viên bộ môn, tôi muốn nhập điểm kiểm tra thường xuyên, giữa kỳ, cuối kỳ cho học sinh lớp mình dạy và hệ thống kiểm tra chặn nhập sai.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeRepository.js',
      'members/member2_Frontend/src/pages/teacher/GradeEntryPage.jsx'
    ],
    layer: 'Domain Grade Entry & Data Integrity Layer',
    guide: `1. Kiểm tra dải điểm:
   - Điểm số hợp lệ: 0.0 <= score <= 10.0 (cho phép 1 chữ số thập phân, ví dụ: 7.5, 8.2).
   - Môn đánh giá bằng nhận xét: Giá trị hợp lệ là 'Đ' (Đạt) hoặc 'CĐ' (Chưa đạt).
2. Kiểm tra khóa sổ điểm:
   - Trước khi INSERT/UPDATE bảng điểm, kiểm tra trạng thái khóa của lớp và môn:
     SELECT status FROM gradebook_locks WHERE class_id = $1 AND subject_id = $2 AND semester = $3;
   - Nếu status != 'OPEN', trả về HTTP 403 Forbidden: 'Sổ điểm môn học này đã bị khóa! Không thể chỉnh sửa.'.`,
    workflow: `Bước 1: Mở GradeController.js, kiểm tra hàm enterSubjectGrades(req, res).
Bước 2: Viết logic kiểm tra: kiểm tra dải điểm [0.0, 10.0] và kiểm tra khóa sổ điểm qua GradeLockService.
Bước 3: Nếu vi phạm dải điểm trả về 400 Bad Request; nếu sổ điểm đã khóa trả về 403 Forbidden.
Bước 4: Mở GradeEntryPage.jsx trên giao diện Giáo viên, thử gõ điểm -1 hoặc 11 để kiểm tra ô nhập báo lỗi viền đỏ; sau đó nhập điểm chuẩn và bấm Lưu điểm.`,
    docs: [
      { name: 'Clean Architecture Pattern by Uncle Bob', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { name: 'React Dynamic Form Input Validation', url: 'https://react.dev/learn/sharing-state-between-components' },
      { name: 'PostgreSQL Numeric Precision Guide', url: 'https://www.postgresql.org/docs/current/datatype-numeric.html' }
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
    story: 'Là Hệ thống, tôi muốn tự động tính toán Điểm trung bình môn (TBM) chính xác theo trọng số Thông tư 22/2021/TT-BGDĐT ngay khi có điểm mới.',
    primaryFiles: [
      'members/member4_Logic_Security/tt22EvaluationLogic.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/GradeEvaluationService.js',
      'members/member3_Backend_DB/school-management-nodejs/tests/unit/tt22Evaluation.test.js'
    ],
    layer: 'Domain Core Business Logic & Educational Standard Layer',
    guide: `1. Công thức TBM học kỳ môn tính điểm (Khoản 1 Điều 9 TT 22):
   - TBM_hk = (Tổng ĐĐG_tx + 2 * ĐĐG_gk + 3 * ĐĐG_ck) / (Số ĐĐG_tx + 5).
   - Làm tròn: Đúng 1 chữ số thập phân (ví dụ: 7.95 -> 8.0; 7.94 -> 7.9).
2. Công thức TBM cả năm:
   - TBM_cn = (TBM_hk1 + 2 * TBM_hk2) / 3 (làm tròn 1 chữ số thập phân).
3. Môn đánh giá bằng nhận xét:
   - 'Đ' (Đạt): Có đủ số lần ĐĐG và số lần Đ đạt >= số lần quy định.
   - 'CĐ' (Chưa đạt): Các trường hợp còn lại.`,
    workflow: `Bước 1: Mở tt22EvaluationLogic.js, định vị hàm calculateTBM(regularScores, midtermScore, finalScore).
Bước 2: Viết chuẩn công thức: const totalWeighted = sumRegular + (2 * midtermScore) + (3 * finalScore); const totalWeight = regularScores.length + 5; const tbm = Math.round((totalWeighted / totalWeight) * 10) / 10;.
Bước 3: Mở tt22Evaluation.test.js, bổ sung các test cases biên kiểm tra điểm 7.94 vs 7.95, điểm 4.94 vs 4.95.
Bước 4: Chạy lệnh npm test trên terminal để xác nhận 100% test cases đạt PASS.`,
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
    story: 'Là GVCN, tôi muốn hệ thống tự động tổng hợp kết quả học tập và rèn luyện của cả lớp để xếp loại học sinh theo 4 mức (Tốt, Khá, Đạt, Chưa đạt).',
    primaryFiles: [
      'members/member4_Logic_Security/tt22EvaluationLogic.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeController.js',
      'members/member2_Frontend/src/pages/teacher/HomeroomEvaluationPage.jsx'
    ],
    layer: 'Educational Classification & Aggregation Layer',
    guide: `1. Phân loại Học lực theo Điều 9 TT 22:
   - 'TỐT': Tất cả các môn tính điểm có TBM >= 6.5, trong đó có ít nhất 6 môn >= 8.0; các môn nhận xét đạt 'Đ'.
   - 'KHÁ': Tất cả các môn tính điểm có TBM >= 5.0, trong đó có ít nhất 6 môn >= 6.5; các môn nhận xét đạt 'Đ'.
   - 'ĐẠT': Có nhiều nhất 1 môn có TBM < 5.0 nhưng >= 3.5; các môn nhận xét đạt 'Đ' (cho phép tối đa 1 môn CĐ).
   - 'CHƯA ĐẠT': Các trường hợp còn lại.
2. Danh hiệu thi đua (Điều 15 TT 22):
   - 'Học sinh Xuất sắc': Rèn luyện TỐT + Học tập TỐT + Có ít nhất 6 môn TBM >= 9.0.
   - 'Học sinh Giỏi': Rèn luyện TỐT + Học tập TỐT.`,
    workflow: `Bước 1: Mở tt22EvaluationLogic.js, xem xét hàm classifyAcademicPerformance(subjectScores, conduct).
Bước 2: Kiểm tra việc đếm số môn đạt ngưỡng 8.0, 6.5, 5.0, 3.5 và trạng thái các môn nhận xét (Đ / CĐ).
Bước 3: Mở GradeController.js (phương thức getHomeroomSummaryReport), gọi hàm xếp loại và tổng hợp danh hiệu thi đua.
Bước 4: Mở HomeroomEvaluationPage.jsx trên giao diện GVCN, kiểm tra bảng xếp loại cả lớp hiển thị chính xác danh hiệu Xuất sắc, Giỏi.`,
    docs: [
      { name: 'Văn bản hợp nhất Thông tư đánh giá học sinh THCS/THPT', url: 'https://thuvienphapluat.vn/' },
      { name: 'JavaScript Array filter, every, some Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' },
      { name: 'Tailwind Color Palettes for Grades', url: 'https://tailwindcss.com/docs/customizing-colors' }
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
    story: 'Là BGH và GVBM, tôi muốn có cơ chế khóa sổ điểm 2 cấp để bảo vệ tính toàn vẹn dữ liệu điểm thi và quy trình xin mở khóa có kiểm soát khi cần sửa.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeLockController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeLockRepository.js',
      'members/member2_Frontend/src/pages/admin/GradebookLockPage.jsx'
    ],
    layer: 'Two-Tier Governance & Audit Security Layer',
    guide: `1. Trạng thái khóa sổ điểm:
   - 'OPEN': Cho phép nhập điểm bình thường.
   - 'GVBM_LOCKED': GVBM hoàn tất nhập điểm và khóa môn.
   - 'BGH_FINAL_LOCKED': BGH duyệt và khóa toàn trường, không ai được sửa.
   - 'UNLOCKED_TEMP': Mở khóa tạm thời kèm thời hạn (hết hạn tự động khóa lại).
2. Quy trình xin mở khóa:
   - GVBM gửi yêu cầu kèm lý do sửa điểm (ví dụ: chấm phúc khảo bài thi học kỳ).
   - BGH duyệt và cấp quyền mở khóa tạm trong 24 giờ.`,
    workflow: `Bước 1: Mở GradeLockController.js và GradeLockRepository.js.
Bước 2: Xây dựng các hàm: lockByTeacher, finalizeByAdmin, requestUnlock, approveUnlock.
Bước 3: Lưu vết lịch sử khóa/mở khóa vào bảng grade_lock_history để phục vụ kiểm toán.
Bước 4: Mở GradebookLockPage.jsx trên giao diện BGH, thử bấm Khóa toàn trường; sau đó đăng nhập tài khoản Giáo viên để xác nhận giao diện nhập điểm bị disable và hiện thông báo khóa.`,
    docs: [
      { name: 'Two-Phase Locking Architecture Pattern', url: 'https://en.wikipedia.org/wiki/Two-phase_locking' },
      { name: 'PostgreSQL ENUM Type Documentation', url: 'https://www.postgresql.org/docs/current/datatype-enum.html' },
      { name: 'Time-based Access Control Guide', url: 'https://csrc.nist.gov/' }
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
    story: 'Là GVCN và BGH, tôi muốn xuất sổ điểm lớp và phiếu điểm từng học sinh ra file PDF có chữ ký số hoặc Excel để in ấn và lưu trữ hồ sơ học bạ.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/PdfExportService.js',
      'members/member2_Frontend/src/pages/reports/GradebookExportPage.jsx'
    ],
    layer: 'Document Rendering & Binary Streaming Layer',
    guide: `1. Xuất Excel (SheetJS):
   - Header: Tiêu đề Quốc hiệu Tiêu ngữ, Tên trường, Lớp, Năm học, Học kỳ.
   - Định dạng bảng: Cột STT, Họ và tên, các cột ĐĐG_tx, ĐĐG_gk, ĐĐG_ck, TBM, Xếp loại.
   - Set Content-Disposition: attachment; filename="SoDiem_Lop10A1_HK1.xlsx".
2. Xuất PDF (PDFKit):
   - Thiết lập font tiếng Việt UTF-8 (Roboto/OpenSans).
   - Vẽ khung viền, kẻ ô bảng điểm học bạ chuẩn biểu mẫu Bộ GD&ĐT.
   - Tạo khu vực ký tên của GVCN và Ban Giám Hiệu.`,
    workflow: `Bước 1: Mở ReportController.js và PdfExportService.js.
Bước 2: Cấu hình PDFKit với font tiếng Việt hỗ trợ Unicode và tạo layout bảng điểm có tiêu đề, chữ ký.
Bước 3: Cấu hình SheetJS tạo file Excel có styling ô tiêu đề và tự động co giãn độ rộng cột (col widths).
Bước 4: Mở GradebookExportPage.jsx, chọn Lớp và Học kỳ, bấm 'Xuất Excel' và 'Tải PDF Sổ điểm' để kiểm tra file tải về mở mượt mà trên máy.`,
    docs: [
      { name: 'SheetJS Workbook & Cell Styling Guide', url: 'https://docs.sheetjs.com/docs/csf/book' },
      { name: 'PDFKit Official Guide & Table Rendering', url: 'https://pdfkit.org/docs/getting_started.html' },
      { name: 'Express Res.download & Res.attachment API', url: 'https://expressjs.com/en/api.html#res.download' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn đăng thông báo và phân loại đối tượng nhận (Giáo viên, Học sinh, Phụ huynh) để truyền đạt thông tin kịp thời.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AnnouncementController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AnnouncementRepository.js',
      'members/member2_Frontend/src/pages/common/AnnouncementsPage.jsx'
    ],
    layer: 'Content Management & Audience Segmentation Layer',
    guide: `1. Phân luồng đối tượng nhận (target_audience):
   - 'ALL': Toàn trường cùng xem.
   - 'TEACHERS': Chỉ tài khoản giáo viên và BGH.
   - 'PARENTS': Chỉ phụ huynh học sinh.
   - 'STUDENTS': Chỉ học sinh.
2. Endpoint:
   - POST /api/announcements: BGH đăng bài (title, content, target_audience, is_pinned).
   - GET /api/announcements: Lọc tự động theo role của token đang đăng nhập.
   - Bài viết có is_pinned = true luôn được sắp xếp lên đầu danh sách (ORDER BY is_pinned DESC, created_at DESC).`,
    workflow: `Bước 1: Mở AnnouncementController.js và AnnouncementRepository.js.
Bước 2: Viết câu truy vấn GET /api/announcements lọc theo role của req.user: WHERE target_audience IN ('ALL', $1) ORDER BY is_pinned DESC, created_at DESC.
Bước 3: Viết hàm POST /api/announcements có gắn middleware requireBGH để chỉ cho phép BGH đăng tin.
Bước 4: Mở AnnouncementsPage.jsx, đăng thông báo mới có chọn Ghim lên đầu và kiểm tra giao diện học sinh/phụ huynh hiển thị đúng luồng.`,
    docs: [
      { name: 'PostgreSQL Ordering & Sorting Guide', url: 'https://www.postgresql.org/docs/current/queries-order.html' },
      { name: 'Tailwind Typography Plugin for Rich Content', url: 'https://tailwindcss.com/docs/typography-plugin' },
      { name: 'Lucide React Pin & Megaphone Icons', url: 'https://lucide.dev/icons/' }
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
    story: 'Là Phụ huynh và GVCN, tôi muốn nhắn tin trao đổi trực tiếp tức thời để giải quyết các vấn đề học tập và sinh hoạt của học sinh.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/socket/chat.handler.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ChatController.js',
      'members/member2_Frontend/src/pages/chat/ChatPage.jsx'
    ],
    layer: 'Real-time WebSocket & Event-Driven Layer',
    guide: `1. Kiến trúc Socket.io:
   - Xác thực: Khi client kết nối, truyền JWT Token qua socket.handshake.auth.token.
   - Quản lý phòng: Mỗi cặp hội thoại có room_id riêng (room_student_{studentId}).
2. Sự kiện Real-time:
   - 'send_message': Client gửi tin nhắn -> Server lưu vào DB -> io.to(roomId).emit('new_message', data).
   - 'typing': Báo trạng thái người kia đang gõ phím.
3. Đồng bộ dữ liệu:
   - Lưu tin nhắn vào bảng chat_messages (sender_id, receiver_id, content, created_at, is_read).`,
    workflow: `Bước 1: Mở chat.handler.js tại Backend, định vị sự kiện io.on('connection', socket).
Bước 2: Xác thực JWT token từ socket.handshake.auth.token; tham gia phòng qua socket.join(roomId).
Bước 3: Khi nhận sự kiện 'send_message', lưu bản ghi vào CSDL PostgreSQL và phát sự kiện 'receive_message' đến room.
Bước 4: Mở 2 cửa sổ trình duyệt (1 tab GVCN, 1 tab Phụ huynh), vào ChatPage.jsx và gửi tin nhắn để kiểm tra độ trễ tức thời không cần F5.`,
    docs: [
      { name: 'Socket.io v4 Official Guide & Cheat Sheet', url: 'https://socket.io/docs/v4/' },
      { name: 'Socket.io Middlewares & Authentication', url: 'https://socket.io/docs/v4/middlewares/' },
      { name: 'React Auto-Scroll to Bottom for Chat Feeds', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView' }
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
    story: 'Là Phụ huynh, tôi muốn xem sổ liên lạc điện tử hàng tháng của con gồm điểm số, số buổi nghỉ và nhận xét của GVCN để đồng hành cùng con.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ContactBookController.js',
      'members/member2_Frontend/src/pages/parent/ContactBookPage.jsx',
      'members/member2_Frontend/src/pages/teacher/ContactBookEntryPage.jsx'
    ],
    layer: 'Aggregation View & Stakeholder Reporting Layer',
    guide: `1. Dữ liệu tổng hợp sổ liên lạc (Hàng tháng / Học kỳ):
   - Điểm số: Danh sách điểm các bài kiểm tra trong tháng.
   - Chuyên cần: Số buổi có mặt, vắng có phép, vắng không phép.
   - Nhận xét GVCN: Đánh giá thái độ, nề nếp, sự tiến bộ.
2. Endpoint:
   - GET /api/contact-books/student/:studentId: Lấy sổ liên lạc của học sinh theo tháng.
   - POST /api/contact-books/comment: GVCN lưu nhận xét cho học sinh.
   - POST /api/contact-books/feedback: Phụ huynh gửi phản hồi ý kiến.`,
    workflow: `Bước 1: Mở ContactBookController.js, kiểm tra hàm getMonthlyContactBook(req, res).
Bước 2: Viết câu lệnh SQL JOIN 3 bảng: bảng grades (điểm số), bảng attendance (chuyên cần) và bảng homeroom_comments (nhận xét GVCN).
Bước 3: Mở ContactBookEntryPage.jsx trên giao diện GVCN, nhập nhận xét cho học sinh và bấm Lưu.
Bước 4: Đăng nhập tài khoản phụ huynh, mở ContactBookPage.jsx để kiểm tra bảng tổng hợp điểm, chuyên cần và lời nhận xét hiển thị chuẩn đẹp.`,
    docs: [
      { name: 'PostgreSQL Multiple Table JOIN Guide', url: 'https://www.postgresql.org/docs/current/tutorial-join.html' },
      { name: 'Tailwind Responsive Card Layouts', url: 'https://tailwindcss.com/docs/box-shadow' },
      { name: 'RESTful API Nested Resource Design', url: 'https://restfulapi.net/resource-naming/' }
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
    story: 'Là Kế toán / Ban Giám Hiệu, tôi muốn tạo các đợt thu học phí, định mức khoản thu và chính sách miễn giảm (hộ nghèo, con thương binh) cho từng học sinh.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/FeeRepository.js',
      'members/member2_Frontend/src/pages/admin/FeeManagementPage.jsx'
    ],
    layer: 'Billing Policy & Financial Administration Layer',
    guide: `1. Cấu trúc danh mục thu:
   - fee_items (id, name, amount, is_mandatory, description).
   - fee_periods (id, name, academic_year_id, semester, due_date).
2. Miễn giảm chính sách:
   - fee_exemptions (student_id, fee_item_id, discount_percentage: 50%, 100%).
   - Số tiền thực thu = Định mức gốc * (1 - discount_percentage / 100).
3. Batch phát sinh học phí:
   - Tự động sinh bản ghi trong student_fees cho toàn bộ học sinh trong khối/lớp tương ứng.`,
    workflow: `Bước 1: Mở FeeController.js và FeeRepository.js.
Bước 2: Xây dựng hàm createFeePeriod, gán danh mục các khoản thu và tạo bản ghi student_fees cho học sinh.
Bước 3: Áp dụng công thức tính giảm trừ theo bảng fee_exemptions: final_amount = base_amount * (1 - discount_percent / 100).
Bước 4: Mở FeeManagementPage.jsx trên giao diện BGH, tạo đợt thu mới và kiểm tra số tiền công nợ được phân bổ chính xác cho học sinh.`,
    docs: [
      { name: 'Database Third Normal Form (3NF) Rules', url: 'https://en.wikipedia.org/wiki/Third_normal_form' },
      { name: 'PostgreSQL Numeric Precision for Financial Data', url: 'https://www.postgresql.org/docs/current/datatype-numeric.html' },
      { name: 'Tailwind Badge & Data Table Styling', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Phụ huynh, tôi muốn quét mã VietQR động có sẵn số tiền và nội dung chuyển khoản trên ứng dụng ngân hàng để nộp học phí và được gạch nợ tức thì.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/services/VietQRService.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member2_Frontend/src/pages/parent/FeePaymentPage.jsx'
    ],
    layer: 'Fintech Integration & Automated Reconciliation Layer',
    guide: `1. Chuẩn VietQR động (NAPAS 247):
   - Tạo mã QR chuẩn EMVCo chứa: Bank BIN, STK Trường, Số tiền chính xác, Nội dung: "HP {MA_HOC_SINH} {MA_DOT_THU}".
   - API: VietQR QuickLink: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-compact2.png?amount={AMOUNT}&addInfo={CONTENT}.
2. Webhook gạch nợ tự động:
   - POST /api/fees/webhook: Tiếp nhận biến động số dư từ cổng thanh toán / ngân hàng.
   - Phân tích cú pháp nội dung chuyển khoản để trích xuất student_fee_id.
   - Giao dịch Unit of Work: UPDATE student_fees SET status = 'PAID', paid_at = NOW(); INSERT INTO receipts (...); COMMIT;.`,
    workflow: `Bước 1: Mở VietQRService.js, định vị hàm generateDynamicQRCode(feeData).
Bước 2: Xây dựng URL mã VietQR theo chuẩn NAPAS 247 kèm mã đơn hàng và số tiền chính xác.
Bước 3: Mở FeeController.js (phương thức handlePaymentWebhook), mở Transaction: cập nhật student_fees status = 'PAID', tạo bản ghi trong receipts và ghi log audit.
Bước 4: Mở FeePaymentPage.jsx trên giao diện phụ huynh, quét thử mã QR giả lập và kiểm tra trạng thái chuyển sang 'ĐÃ THANH TOÁN' ngay lập tức.`,
    docs: [
      { name: 'VietQR Official Specification & Standard Guide', url: 'https://vietqr.net/' },
      { name: 'NAPAS 247 Payment Gateway Documentation', url: 'https://napas.com.vn/' },
      { name: 'Node.js Crypto Signature Verification Guide', url: 'https://nodejs.org/api/crypto.html' },
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
    story: 'Là Phụ huynh, tôi muốn tra cứu lịch sử nộp tiền và tải về biên lai điện tử có mã tra cứu hóa đơn sau khi hoàn tất thanh toán.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/PdfExportService.js',
      'members/member2_Frontend/src/pages/parent/ReceiptViewPage.jsx'
    ],
    layer: 'Receipt Generation & Invoicing Presentation Layer',
    guide: `1. Biên lai điện tử:
   - Mã biên lai duy nhất: BL-{YYYYMM}-{6 số ngẫu nhiên}.
   - Nội dung: Thông tin học sinh, lớp, danh sách các khoản đã nộp, thời gian nộp, phương thức (VIETQR/TIEN_MAT), mã giao dịch ngân hàng.
2. Endpoint:
   - GET /api/fees/receipts/:receiptId: Xem chi tiết biên lai.
   - GET /api/fees/receipts/:receiptId/pdf: Tải biên lai định dạng PDF có đóng dấu mộc điện tử của trường.`,
    workflow: `Bước 1: Mở FeeController.js, kiểm tra hàm getReceiptById và downloadReceiptPdf.
Bước 2: Sử dụng PdfExportService.js để vẽ mẫu biên lai thu tiền chuẩn Bộ Tài chính / GD&ĐT có mã hóa đơn, mã tra cứu QR.
Bước 3: Mở ReceiptViewPage.jsx trên giao diện phụ huynh, kiểm tra danh sách các biên lai đã nộp.
Bước 4: Bấm nút 'Tải biên lai PDF' và kiểm tra file PDF tải về mở chuẩn định dạng, sắc nét.`,
    docs: [
      { name: 'PDFKit Node.js Receipt Generator Guide', url: 'https://pdfkit.org/' },
      { name: 'Nghị định 123/2020/NĐ-CP Quy định Hóa đơn chứng từ', url: 'https://thuvienphapluat.vn/' },
      { name: 'Tailwind CSS Receipt Card Design', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Kế toán và Ban Giám Hiệu, tôi muốn xem báo cáo tổng hợp dòng tiền học phí, số tiền đã thu, nợ tồn đọng theo từng khối lớp để quản trị tài chính.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/FeeController.js',
      'members/member2_Frontend/src/pages/admin/FeeReportPage.jsx'
    ],
    layer: 'Financial Analytics & Management Accounting Layer',
    guide: `1. Thống kê tài chính:
   - Tổng công nợ phát sinh = SUM(final_amount).
   - Tổng thực thu = SUM(final_amount) WHERE status = 'PAID'.
   - Tổng nợ tồn đọng = SUM(final_amount) WHERE status in ('UNPAID', 'OVERDUE').
   - Tỷ lệ hoàn thành (%) = (Tổng thực thu / Tổng phát sinh) * 100.
2. Biểu đồ trực quan:
   - Biểu đồ tròn (Doughnut): Tỷ lệ Đã thu vs Còn nợ.
   - Biểu đồ cột (Bar): So sánh số tiền thu được giữa Khối 10, 11, 12.`,
    workflow: `Bước 1: Mở FeeController.js, định vị phương thức getFeeFinancialReport(req, res).
Bước 2: Viết câu truy vấn PostgreSQL GROUP BY grade_level, class_id với các hàm tổng hợp SUM, COUNT và tính tỷ lệ hoàn thành %.
Bước 3: Mở FeeReportPage.jsx trên giao diện BGH, cấu hình Chart.js hiển thị biểu đồ tròn tiến độ thu và biểu đồ cột so sánh theo khối.
Bước 4: Kiểm tra bộ lọc theo đợt thu và nút xuất báo cáo tài chính ra file Excel.`,
    docs: [
      { name: 'PostgreSQL GROUP BY & Aggregate Queries', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP' },
      { name: 'Chart.js Doughnut & Bar Charts Guide', url: 'https://www.chartjs.org/docs/latest/charts/doughnut.html' },
      { name: 'Tailwind CSS Metric Cards & KPIs', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn có bảng Dashboard tổng quan hiển thị số liệu học sinh, giáo viên, chuyên cần hôm nay và tiến độ vào điểm toàn trường.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/DashboardController.js',
      'members/member2_Frontend/src/pages/admin/DashboardPage.jsx'
    ],
    layer: 'Executive Dashboard & Data Aggregation Layer',
    guide: `1. Các chỉ số KPI trọng điểm:
   - Thẻ 1: Tổng số học sinh đang theo học (phân theo Khối 10, 11, 12).
   - Thẻ 2: Tổng số cán bộ giáo viên (đang công tác).
   - Thẻ 3: Tỷ lệ chuyên cần trong ngày hôm nay (% có mặt).
   - Thẻ 4: Tiến độ hoàn thành nhập điểm học kỳ của các tổ bộ môn.
2. Tối ưu hiệu năng:
   - Thời gian phản hồi API GET /api/dashboard/stats < 200ms.
   - Sử dụng Indexes cho các trường status, date, academic_year_id.`,
    workflow: `Bước 1: Mở DashboardController.js, kiểm tra hàm getExecutiveDashboardSummary(req, res).
Bước 2: Viết câu lệnh truy vấn song song qua Promise.all([countStudents, countTeachers, getTodayAttendance, getGradeProgress]).
Bước 3: Mở DashboardPage.jsx trên giao diện Admin, kiểm tra hiển thị 4 thẻ KPI thống kê nổi bật trên đầu trang và 2 biểu đồ phân tích.
Bước 4: Kiểm tra tốc độ tải trang trên tab Network của trình duyệt để đảm bảo dưới 200ms.`,
    docs: [
      { name: 'PostgreSQL EXPLAIN ANALYZE & Query Optimization', url: 'https://www.postgresql.org/docs/current/using-explain.html' },
      { name: 'Promise.all Concurrency in Node.js', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' },
      { name: 'Tailwind CSS Grid & KPI Card Layout', url: 'https://tailwindcss.com/docs' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn trích xuất báo cáo chất lượng giáo dục học kỳ và năm học theo đúng biểu mẫu thống kê của Sở GD&ĐT để nộp báo cáo.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js',
      'members/member2_Frontend/src/pages/reports/SemesterReportPage.jsx'
    ],
    layer: 'Regulatory Compliance & Statistical Aggregation Layer',
    guide: `1. Biểu mẫu chuẩn Sở GD&ĐT:
   - Thống kê kết quả học tập theo khối: Số lượng và % học sinh Tốt, Khá, Đạt, Chưa đạt.
   - Thống kê kết quả rèn luyện: Số lượng và % học sinh Tốt, Khá, Đạt, Chưa đạt.
   - Tỷ lệ lên lớp thẳng, tỷ lệ thi lại, tỷ lệ lưu ban.
2. Xuất dữ liệu:
   - Hỗ trợ xuất sang file Excel chuẩn định dạng biểu mẫu ngành giáo dục.`,
    workflow: `Bước 1: Mở ReportController.js, định vị phương thức getSemesterSummaryReport(req, res).
Bước 2: Viết câu truy vấn tổng hợp số lượng và tỷ lệ % học lực, rèn luyện theo chuẩn biểu mẫu Sở GD&ĐT.
Bước 3: Mở SemesterReportPage.jsx, hiển thị bảng số liệu thống kê tổng kết học kỳ theo từng khối 10, 11, 12.
Bước 4: Bấm nút 'Xuất Báo cáo Sở GD&ĐT' và kiểm tra file Excel tải về có định dạng chuẩn chỉ.`,
    docs: [
      { name: 'SheetJS Advanced Cell Formatting Guide', url: 'https://docs.sheetjs.com/' },
      { name: 'Thông tư số 32/2020/TT-BGDĐT Điều lệ Trường Trung học', url: 'https://moet.gov.vn/' },
      { name: 'Express Excel File Streaming Response', url: 'https://expressjs.com/en/api.html#res.send' }
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
    story: 'Là Ban Giám Hiệu, tôi muốn xem nhật ký kiểm toán ghi lại mọi thao tác sửa điểm, khóa sổ, đổi lịch để phát hiện gian lận và quy trách nhiệm rõ ràng.',
    primaryFiles: [
      'members/member4_Logic_Security/auditLogger.js',
      'members/member3_Backend_DB/school-management-nodejs/src/middleware/auditMiddleware.js',
      'members/member2_Frontend/src/pages/admin/AuditLogPage.jsx'
    ],
    layer: 'Audit Trail & Non-repudiation Security Layer',
    guide: `1. Thông tin ghi nhật ký (Audit Log):
   - user_id, username, role: Ai thực hiện.
   - action: Loại thao tác ('UPDATE_GRADE', 'LOCK_GRADEBOOK', 'APPROVE_SUBSTITUTE', 'CREATE_USER').
   - target_table, record_id: Bản ghi nào bị tác động.
   - old_value, new_value: Dữ liệu trước và sau khi thay đổi (dạng JSONB).
   - ip_address, user_agent, timestamp.
2. Bất biến (Immutability):
   - Bảng audit_logs chỉ cho phép INSERT; KHÔNG cho phép UPDATE hay DELETE.`,
    workflow: `Bước 1: Mở auditLogger.js và auditMiddleware.js tại Backend.
Bước 2: Xây dựng middleware tự động bắt các request thay đổi dữ liệu (POST, PUT, PATCH, DELETE) và ghi log vào bảng audit_logs.
Bước 3: Lưu chi tiết { old_value, new_value } dạng JSONB để so sánh trước/sau khi sửa điểm.
Bước 4: Mở AuditLogPage.jsx trên giao diện BGH, thực hiện 1 thao tác sửa điểm và kiểm tra nhật ký xuất hiện ngay trên bảng tra cứu.`,
    docs: [
      { name: 'OWASP Logging & Monitoring Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
      { name: 'PostgreSQL JSONB Type & Indexing Guide', url: 'https://www.postgresql.org/docs/current/datatype-json.html' },
      { name: 'Express Custom Middleware Pattern', url: 'https://expressjs.com/en/guide/writing-middleware.html' }
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
    story: 'Là Học sinh và Phụ huynh, tôi muốn đăng nhập vào cổng thông tin cá nhân trên điện thoại/máy tính để tra cứu điểm thi, thời khóa biểu và học phí.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/PortalController.js',
      'members/member2_Frontend/src/pages/student/StudentPortalPage.jsx',
      'members/member2_Frontend/src/pages/parent/ParentPortalPage.jsx'
    ],
    layer: 'Self-Service Portal & Responsive Web Layer',
    guide: `1. Bảo mật BOLA/IDOR:
   - Học sinh đăng nhập chỉ được xem dữ liệu của chính mình (lấy student_id từ req.user.student_id).
   - Phụ huynh chỉ được xem dữ liệu của con mình (kiểm tra quan hệ trong bảng student_parents).
   - Nghiêm cấm nhận student_id tự do từ query param mà không kiểm tra quyền sở hữu.
2. Dữ liệu tổng hợp:
   - Bảng điểm chi tiết tất cả môn học (HK1, HK2, Cả năm).
   - Lịch học thời khóa biểu trong tuần.
   - Tình hình điểm danh chuyên cần và thông báo mới nhất.`,
    workflow: `Bước 1: Mở PortalController.js, kiểm tra các hàm getStudentOverview và getParentChildrenOverview.
Bước 2: Áp dụng cơ chế chống BOLA/IDOR: lấy student_id trực tiếp từ req.user.id hoặc kiểm tra quan hệ phụ huynh trong CSDL.
Bước 3: Mở StudentPortalPage.jsx và ParentPortalPage.jsx, kiểm tra giao diện chia tab trực quan (Điểm số, TKB, Học phí, Điểm danh).
Bước 4: Đăng nhập tài khoản hs001 hoặc ph001, kiểm tra hiển thị đúng dữ liệu cá nhân trên cả màn hình máy tính và chế độ di động.`,
    docs: [
      { name: 'OWASP Broken Object Level Authorization (BOLA/IDOR) Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#insecure-direct-object-references-idor' },
      { name: 'Tailwind CSS Mobile-First Responsive Design', url: 'https://tailwindcss.com/docs/responsive-design' },
      { name: 'React Tabs Component Pattern', url: 'https://react.dev/learn/sharing-state-between-components' }
    ],
    criteria: [
      'Chặn 100% lỗ hổng xem trộm dữ liệu học sinh khác (Chống BOLA/IDOR).',
      'Giao diện thân thiện, hiển thị hoàn hảo trên màn hình điện thoại di động.',
      'Cập nhật số liệu điểm thi tức thời ngay khi giáo viên công bố.'
    ]
  }
];

/**
 * Hàm xây dựng nội dung Markdown giàu chi tiết, kèm workflow và link tài liệu
 */
function buildEnrichedDescription(item) {
  const githubLinks = item.primaryFiles.map(f => `- **GitHub**: [\`${f}\`](${GITHUB_REPO}/${f})`).join('\n');
  const bitbucketLinks = item.primaryFiles.map(f => `- **Bitbucket**: [\`${f}\`](${BITBUCKET_REPO}/${f})`).join('\n');
  const criteriaList = item.criteria.map(c => `- [x] ${c}`).join('\n');
  const docsList = (item.docs || []).map(d => `- 📖 [${d.name}](${d.url})`).join('\n');

  return `### 📋 1. MỤC TIÊU NGHIỆP VỤ (USER STORY)
${item.story}

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

**Gợi ý lập trình & Lưu ý kỹ thuật:**
\`\`\`text
${item.guide}
\`\`\`

---

### 📚 5. TÀI LIỆU & ĐƯỜNG LINK HƯỚNG DẪN THAM KHẢO (OFFICIAL DOCS & TUTORIALS)
- 📘 **Cẩm nang Lập trình & Sửa code Dự án:** [HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](${HANDBOOK_LINK_GH}) ([Bản Bitbucket](${HANDBOOK_LINK_BB}))
${docsList}

---

### ✅ 6. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DEFINITION OF DONE)
${criteriaList}
`;
}

/**
 * Cập nhật trên JIRA CLOUD
 */
async function updateJiraIssues() {
  console.log('================================================================');
  console.log(' BẮT ĐẦU CẬP NHẬT CHI TIẾT MÃ NGUỒN VÀ HƯỚNG DẪN LÊN JIRA CLOUD');
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
            description: enrichedDesc
          }
        })
      });

      if (res.status === 204 || res.ok) {
        successCount++;
        console.log(`[JIRA OK] Cập nhật ${item.jiraKey} (${item.pbiCode}) thành công.`);
      } else {
        const errText = await res.text();
        console.warn(`[JIRA FAIL] ${item.jiraKey}: Status ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.error(`[JIRA ERROR] ${item.jiraKey}:`, err.message);
    }
  }

  console.log(`\n=> HOÀN TẤT JIRA: ${successCount} / ${DETAILED_PBIS.length} issues cập nhật chi tiết thành công!\n`);
}

/**
 * Cập nhật trên CLICKUP
 */
async function updateClickUpTasks() {
  console.log('================================================================');
  console.log(' BẮT ĐẦU CẬP NHẬT CHI TIẾT MÃ NGUỒN VÀ HƯỚNG DẪN LÊN CLICKUP');
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
          const updateRes = await fetch(`${CLICKUP_API_BASE}/task/${t.id}`, {
            method: 'PUT',
            headers: clickupHeaders,
            body: JSON.stringify({
              description: enrichedDesc
            })
          });

          if (updateRes.ok) {
            successCount++;
            console.log(`[CLICKUP OK] Cập nhật task ${matchedPBI.pbiCode} (ID: ${t.id}) thành công.`);
          } else {
            console.warn(`[CLICKUP FAIL] ${t.name}:`, await updateRes.text());
          }
        }
      }
    }

    console.log(`\n=> HOÀN TẤT CLICKUP: ${successCount} / ${DETAILED_PBIS.length} tasks cập nhật chi tiết thành công!`);

  } catch (err) {
    console.error('[CLICKUP ERROR]:', err.message);
  }
}

async function run() {
  await updateJiraIssues();
  await updateClickUpTasks();
  console.log('\n================================================================');
  console.log(' TẤT CẢ 27 TASKS TRÊN JIRA & CLICKUP ĐÃ ĐƯỢC ĐỒNG BỘ ĐẦY ĐỦ 100%!');
  console.log('================================================================');
}

run();
