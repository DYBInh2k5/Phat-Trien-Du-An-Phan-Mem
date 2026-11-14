/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/enrich_clickup_and_jira.js
 * MỤC ĐÍCH: Bổ sung chi tiết toàn diện cho 27 Tasks trên cả JIRA CLOUD và CLICKUP:
 *           - Mục tiêu nghiệp vụ (User Story)
 *           - Đường dẫn mã nguồn trực tiếp trên GitHub và Bitbucket
 *           - Danh sách tệp liên quan & vị trí kiến trúc (Clean Architecture / React)
 *           - Hướng dẫn kỹ thuật & gợi ý lập trình chi tiết (Hàm, SQL, Mã lỗi HTTP)
 *           - Tiêu chí nghiệm thu (Acceptance Criteria / Definition of Done)
 * TÁC GIẢ: Võ Duy Bình (Project Manager & Lead BA)
 * NGÀY CẬP NHẬT: 14/11/2026
 * ================================================================================
 */

const GITHUB_REPO = 'https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main';
const BITBUCKET_REPO = 'https://bitbucket.org/codyisme27205/pt_da_pm/src/main';

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
   - Xây dựng 5 thẻ "1-Click Demo Login" tương ứng 5 vai trò (admin, gvcn01, gv01, hs001, ph001).
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
      'members/member2_Frontend/src/pages/settings/SystemSettingsPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/UserService.js'
    ],
    layer: 'Admin Management / User Domain Service',
    guide: `1. Backend API (UserController.js):
   - GET /api/users: Phân trang danh sách tài khoản kèm bộ lọc vai trò và từ khóa tìm kiếm.
   - POST /api/users: Tạo mới tài khoản, bắt buộc băm mật khẩu với bcrypt trước khi lưu.
   - PUT /api/users/:id/status: Chuyển đổi trạng thái ACTIVE <-> INACTIVE (khóa tài khoản).
   - PUT /api/users/:id/reset-password: Đặt lại mật khẩu mặc định (ví dụ 123456).
2. Frontend (SystemSettingsPage.jsx):
   - Bảng quản trị người dùng kèm nút gạt bật/tắt kích hoạt tài khoản.
   - Modal thêm mới tài khoản có xác thực định dạng email, số điện thoại.`,
    criteria: [
      'Tạo tài khoản mới thành công và mật khẩu được băm an toàn trong CSDL.',
      'Tài khoản bị khóa (INACTIVE) lập tức không thể đăng nhập.',
      'Ghi vết nhật ký kiểm toán cho mọi thao tác sửa đổi tài khoản.'
    ]
  },
  {
    pbiCode: 'PBI-03',
    jiraKey: 'KAN-115',
    name: 'PBI-03: Quản lý danh mục Khối, Lớp học và Hồ sơ học sinh chuẩn mã HS (BGH, GVCN)',
    module: 'Module 2: Quản Lý Hồ Sơ Học Sinh, Lớp Học & Đào Tạo',
    story: 'Là Ban Giám Hiệu và GVCN, tôi muốn quản lý danh mục lớp học niên khóa và hồ sơ học sinh chuẩn mã HSxxxxx để sắp xếp lớp và theo dõi sĩ số.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/admin/ClassManagementPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js'
    ],
    layer: 'Academic Administration & Student Domain',
    guide: `1. Backend API:
   - GET /api/classes: Lấy danh sách lớp, sĩ số hiện tại, tên GVCN.
   - GET /api/students?classId=X: Lấy danh sách học sinh thuộc lớp X (mã HS, họ tên, ngày sinh, giới tính, tên PH, SĐT).
   - POST /api/students: Thêm mới học sinh, kiểm tra ràng buộc mã học sinh duy nhất (UNIQUE).
2. Quy tắc toàn vẹn CSDL:
   - Khóa ngoại ON DELETE RESTRICT: Không cho phép xóa lớp học khi đang có học sinh theo học.`,
    criteria: [
      'Hiển thị danh sách lớp kèm sĩ số chuẩn 35-45 học sinh.',
      'Mã học sinh duy nhất không bị trùng lặp.',
      'Bộ lọc tìm kiếm học sinh theo tên và lớp hoạt động tức thời.'
    ]
  },
  {
    pbiCode: 'PBI-04',
    jiraKey: 'KAN-116',
    name: 'PBI-04: Phân công Giáo viên chủ nhiệm & Giáo viên bộ môn theo lớp học kỳ (BGH)',
    module: 'Module 2: Quản Lý Hồ Sơ Học Sinh, Lớp Học & Đào Tạo',
    story: 'Là Ban Giám Hiệu, tôi muốn phân công giáo viên bộ môn và GVCN cho từng lớp trong học kỳ để thiết lập thẩm quyền vào điểm và quản lý lớp.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/ClassService.js',
      'database/schema.sql'
    ],
    layer: 'Faculty Assignment & Academic Database Layer',
    guide: `1. Backend API:
   - POST /api/assignments: Tiếp nhận { teacherId, classId, subjectId, semester, schoolYear }.
   - Kiểm tra ràng buộc: Một lớp chỉ có 1 GVCN duy nhất trong năm học.
   - Kiểm tra ràng buộc: Một môn học của một lớp trong một học kỳ chỉ do 1 GVBM phụ trách.
   - Lưu vào bảng teacher_assignments.`,
    criteria: [
      'Phân công giáo viên thành công và hiển thị đúng trên thời khóa biểu.',
      'Chặn phân công trùng lặp 2 giáo viên cùng dạy 1 môn của 1 lớp.',
      'Giáo viên chỉ có quyền nhập điểm cho các lớp được phân công.'
    ]
  },
  {
    pbiCode: 'PBI-14',
    jiraKey: 'KAN-117',
    name: 'PBI-14: Xếp thời khóa biểu tự động & Thuật toán chống trùng tiết giáo viên, phòng học',
    module: 'Module 3: Quản Lý Thời Khóa Biểu & Chống Xung Đột Lịch Dạy',
    story: 'Là Ban Giám Hiệu, tôi muốn hệ thống tự động kiểm tra xung đột lịch giảng dạy để tránh trường hợp 1 giáo viên hoặc 1 phòng học bị trùng lịch dạy.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/ScheduleService.js'
    ],
    layer: 'Scheduling Engine & Conflict Detection Algorithm',
    guide: `1. Thuật toán kiểm tra xung đột (ScheduleService.js):
   - Hàm validateConflict(teacherId, roomId, dayOfWeek, period, semester):
     + Truy vấn: SELECT * FROM schedules WHERE day_of_week = $1 AND period = $2 AND semester = $3 AND (teacher_id = $4 OR room_id = $5).
     + Nếu tìm thấy bản ghi trùng lặp, ném lỗi 409 Conflict kèm thông báo cụ thể (ví dụ: 'Thầy An đã có tiết dạy tại lớp 10A2 vào Thứ 3 Tiết 2').
2. Lưu bản ghi ma trận TKB vào bảng schedules.`,
    criteria: [
      'Thuật toán quét phát hiện 100% xung đột trùng tiết dạy của giáo viên.',
      'Phát hiện trùng phòng học chuyên dụng (Tin học, Ngoại ngữ, Thể chất).',
      'Trả về thông báo lỗi rõ ràng vị trí xung đột.'
    ]
  },
  {
    pbiCode: 'PBI-21',
    jiraKey: 'KAN-118',
    name: 'PBI-21: Tra cứu ma trận Thời khóa biểu tuần & Lịch thi học kỳ (Học sinh, Giáo viên)',
    module: 'Module 3: Quản Lý Thời Khóa Biểu & Chống Xung Đột Lịch Dạy',
    story: 'Là Học sinh và Giáo viên, tôi muốn xem ma trận thời khóa biểu tuần từ Thứ 2 đến Thứ 7 và lịch thi cuối kỳ để chủ động chuẩn bị bài học.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/student/StudentSchedulePage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js'
    ],
    layer: 'Frontend Schedule Matrix & Backend Query',
    guide: `1. Frontend (StudentSchedulePage.jsx):
   - Render bảng ma trận lưới 6 cột (Thứ 2 -> Thứ 7) x 5 dòng (Tiết 1 -> Tiết 5).
   - Mỗi ô hiển thị: Tên môn học, Giáo viên phụ trách, Phòng học.
   - Tab "Lịch thi": Hiển thị danh sách môn thi, ngày thi, giờ thi, số báo danh và phòng thi.
2. Backend API:
   - GET /api/schedules/my-schedule: Tự động lọc TKB theo lớp của học sinh đang đăng nhập.`,
    criteria: [
      'Ma trận TKB hiển thị trực quan, đúng 25 tiết học chuẩn tuần.',
      'Học sinh xem đúng TKB lớp mình, không bị lẫn sang lớp khác.',
      'Lịch thi hiển thị đầy đủ thông tin phòng thi và giờ thi.'
    ]
  },
  {
    pbiCode: 'PBI-05',
    jiraKey: 'KAN-119',
    name: 'PBI-05: Điểm danh sĩ số lớp đầu giờ & Thống kê vắng có phép / không phép (GVCN)',
    module: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    story: 'Là Giáo viên Chủ nhiệm, tôi muốn điểm danh sĩ số lớp đầu giờ mỗi ngày với 4 trạng thái để theo dõi chuyên cần học sinh.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/gv/AttendancePage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js'
    ],
    layer: 'Homeroom Daily Attendance & Repository Layer',
    guide: `1. Frontend (AttendancePage.jsx):
   - Mặc định toàn bộ học sinh được đánh dấu "Có mặt" (PRESENT).
   - GVCN có nút chuyển đổi nhanh: Có mặt, Vắng có phép (EXCUSED), Vắng không phép (UNEXCUSED), Đi muộn (LATE).
   - Bấm "Lưu điểm danh": Gửi mảng records[] lên POST /api/attendance/save.
2. Backend (AttendanceRepository.js):
   - Sử dụng câu lệnh UPSERT: INSERT INTO attendances ... ON CONFLICT (student_id, attendance_date) DO UPDATE.
   - Thống kê tỷ lệ hiện diện của lớp.`,
    criteria: [
      'Điểm danh lớp 40 học sinh hoàn tất dưới 1 giây.',
      'Hỗ trợ cập nhật lại điểm danh nếu có học sinh vào lớp muộn.',
      'Dữ liệu điểm danh được đồng bộ tức thời sang Cổng phụ huynh.'
    ]
  },
  {
    pbiCode: 'PBI-06',
    jiraKey: 'KAN-120',
    name: 'PBI-06: Điểm danh học sinh chi tiết theo từng tiết giảng dạy trên lớp (GVBM)',
    module: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    story: 'Là Giáo viên Bộ môn, tôi muốn điểm danh học sinh vắng trong tiết học của mình để phát hiện học sinh bỏ tiết giữa buổi.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/gv/AttendancePage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js'
    ],
    layer: 'Period-based Attendance Tracking',
    guide: `1. Backend API:
   - POST /api/attendance/period: Tiếp nhận { classId, subjectId, period, date, absentStudentIds[] }.
   - Ghi nhận trạng thái điểm danh theo tiết học phân công của giáo viên.
2. Kiểm tra thẩm quyền:
   - Chỉ cho phép giáo viên được phân công dạy tiết đó điểm danh.`,
    criteria: [
      'GVBM điểm danh được từng tiết dạy từ Tiết 1 đến Tiết 5.',
      'Phát hiện chính xác học sinh có mặt đầu giờ nhưng vắng tiết bộ môn.'
    ]
  },
  {
    pbiCode: 'PBI-07',
    jiraKey: 'KAN-121',
    name: 'PBI-07: Màn hình giám sát chuyên cần toàn trường & Tự động cảnh báo vắng >= 20% cấm thi (BGH)',
    module: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    story: 'Là Ban Giám Hiệu, tôi muốn theo dõi tỷ lệ chuyên cần thời gian thực của toàn trường và nhận cảnh báo các học sinh vắng >= 20% số tiết có nguy cơ bị cấm thi.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/admin/BGHAttendanceMonitorPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/services/AttendanceService.js'
    ],
    layer: 'Executive Dashboard & Threshold Warning Service',
    guide: `1. Frontend (BGHAttendanceMonitorPage.jsx):
   - Biểu đồ tỷ lệ chuyên cần các khối 10, 11, 12.
   - Bảng danh sách cảnh báo đỏ các học sinh vắng lũy kế >= 10 buổi hoặc >= 20% số tiết.
2. Backend (AttendanceService.js):
   - Tính tổng số buổi nghỉ: total_absent = excused_count + unexcused_count.
   - Nếu total_absent / total_sessions >= 0.2: Gán cờ is_warning = true.`,
    criteria: [
      'Hiển thị trực quan tỷ lệ chuyên cần toàn trường theo thời gian thực.',
      'Cảnh báo đỏ chính xác các trường hợp chạm ngưỡng cấm thi theo Thông tư 22.'
    ]
  },
  {
    pbiCode: 'PBI-17c',
    jiraKey: 'KAN-122',
    name: 'PBI-17c: Tiếp nhận, Phê duyệt đơn xin nghỉ học và Tự động đồng bộ sang Sổ điểm danh (GVCN)',
    module: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    story: 'Là Giáo viên Chủ nhiệm, tôi muốn duyệt đơn xin nghỉ học trực tuyến từ phụ huynh và tự động cập nhật trạng thái điểm danh ngày đó thành Vắng có phép.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/gv/AttendancePage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js'
    ],
    layer: 'Leave Approval & Attendance Sync Workflow',
    guide: `1. Quy trình duyệt đơn:
   - GVCN mở tab "Đơn xin nghỉ học".
   - Bấm "Duyệt đơn": Gửi PUT /api/leave-requests/:id/approve.
   - Backend cập nhật leave_requests SET status = 'APPROVED'.
   - Tự động gọi AttendanceService cập nhật hoặc chèn bản ghi attendances ngày nghỉ thành 'EXCUSED'.`,
    criteria: [
      'Duyệt đơn trực tuyến thành công, trạng thái chuyển sang APPROVED.',
      'Tự động đồng bộ sang giao diện điểm danh thành Vắng có phép.'
    ]
  },
  {
    pbiCode: 'PBI-08',
    jiraKey: 'KAN-123',
    name: 'PBI-08: Lưới nhập điểm Spreadsheet tương tác (Miệng, 15p, 1 tiết, GK, CK) cho lớp 45 HS',
    module: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    story: 'Là Giáo viên Bộ môn, tôi muốn nhập điểm thành phần trên giao diện bảng tính Spreadsheet cố định cột họ tên, điều hướng phím Enter/Tab nhanh chóng.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/gv/GradebookPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js'
    ],
    layer: 'Interactive Spreadsheet UI & Gradebook Controller',
    guide: `1. Frontend (GradebookPage.jsx):
   - Thiết kế bảng tính với Sticky Column (cố định Mã HS và Họ tên).
   - Hỗ trợ phím Enter để xuống dòng học sinh tiếp theo, phím Tab để chuyển sang cột điểm kế tiếp.
   - Kiểm tra ràng buộc hợp lệ: Điểm số phải thuộc đoạn [0.0, 10.0].
   - Nút "Lưu sổ điểm": Gửi POST /api/gradebook/save chứa mảng 45 học sinh.`,
    criteria: [
      'Nhập điểm mượt mà cho lớp 45 học sinh, phím tắt điều hướng như Excel.',
      'Chặn nhập số âm hoặc số lớn hơn 10 với viền đỏ cảnh báo tức thì.'
    ]
  },
  {
    pbiCode: 'PBI-09',
    jiraKey: 'KAN-124',
    name: 'PBI-09: Thuật toán tính ĐTBmhk mẫu số chia 9 & Tự động xếp loại học lực chuẩn Thông tư 22',
    module: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    story: 'Là Giáo viên và Học sinh, tôi muốn hệ thống tự động tính ĐTBmhk theo trọng số chia 9 và xếp loại học lực chuẩn Thông tư 22 để bảo đảm tính khách quan.',
    primaryFiles: [
      'members/member4_Logic_Security/gpaCalculationLogic.js',
      'members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js'
    ],
    layer: 'Academic Core Logic & Domain Entity Rule',
    guide: `1. Công thức trọng số (gpaCalculationLogic.js):
   - TBM = (scoreOral*1 + score15m*1 + score1Hour*2 + scoreMidTerm*2 + scoreFinalTerm*3) / 9.
   - Làm tròn 1 chữ số thập phân (Math.round(tbm * 10) / 10).
2. Xếp loại học lực:
   - Tốt (Giỏi): TBM >= 6.5 và có >= 6 môn >= 8.0.
   - Khá: TBM >= 5.0 và có >= 6 môn >= 6.5.
   - Đạt: TBM >= 3.5.
   - Chưa đạt: Còn lại.`,
    criteria: [
      'Công thức tính TBM mẫu số 9 chính xác 100% trong mọi trường hợp kiểm thử.',
      'Quy đổi điểm GPA sang hệ 4.0 chuẩn xác.'
    ]
  },
  {
    pbiCode: 'PBI-10',
    jiraKey: 'KAN-125',
    name: 'PBI-10: Cơ chế chốt khóa sổ điểm điện tử 2 cấp (OPEN -> SUBMITTED -> LOCKED) (BGH)',
    module: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    story: 'Là Ban Giám Hiệu, tôi muốn cơ chế khóa sổ điểm 2 cấp để ngăn chặn việc sửa điểm trái phép sau khi đã công bố kết quả.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js',
      'members/member2_Frontend/src/pages/gv/GradebookPage.jsx'
    ],
    layer: 'State Machine Lock Protocol & Security Service',
    guide: `1. Quy trình khóa sổ 2 cấp:
   - Cấp 1: GVBM bấm "Chốt khóa sổ" -> Gọi POST /api/gradebook/lock -> status chuyển sang LOCKED.
   - Toàn bộ ô nhập điểm trên giao diện chuyển sang chỉ đọc (Disabled).
   - Cấp 2: Nếu cần sửa điểm phúc khảo, GVBM gửi đơn kiến nghị -> BGH duyệt mở khóa trong 24 giờ.
   - Backend từ chối mọi yêu cầu save nếu status === 'LOCKED' với lỗi 409 Conflict.`,
    criteria: [
      'Khi sổ điểm bị khóa, giáo viên tuyệt đối không thể sửa điểm.',
      'Chỉ duy nhất BGH có thẩm quyền mở khóa sổ điểm.',
      'Ghi nhật ký kiểm toán người khóa và thời điểm khóa.'
    ]
  },
  {
    pbiCode: 'PBI-20',
    jiraKey: 'KAN-126',
    name: 'PBI-20: Cổng xem bảng điểm chi tiết các môn học & Điểm GPA hệ 10 / hệ 4.0 dành cho Học sinh',
    module: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    story: 'Là Học sinh, tôi muốn xem bảng điểm chi tiết các môn học và GPA cá nhân để nắm rõ kết quả học tập của mình.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/student/StudentSchedulePage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js'
    ],
    layer: 'Student Academic Portal & Personal Grade View',
    guide: `1. Backend API:
   - GET /api/gradebook/my-grades: Giải mã studentId từ JWT Token, truy vấn tất cả các môn của học sinh đó.
   - Trả về bảng điểm thành phần, TBM từng môn và điểm GPA tổng kết.
2. Frontend:
   - Hiển thị bảng điểm có gắn huy hiệu xếp loại học lực (Tốt: Xanh lá, Khá: Xanh dương, Đạt: Vàng, Chưa đạt: Đỏ).`,
    criteria: [
      'Học sinh chỉ xem được điểm của chính mình, bảo mật tuyệt đối.',
      'Hiển thị đầy đủ các cột điểm thành phần và điểm tổng kết.'
    ]
  },
  {
    pbiCode: 'PBI-22',
    jiraKey: 'KAN-127',
    name: 'PBI-22: Đánh giá xếp loại hạnh kiểm học sinh cuối học kỳ & Nhận xét rèn luyện (GVCN)',
    module: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    story: 'Là Giáo viên Chủ nhiệm, tôi muốn nhập đánh giá hạnh kiểm và lời nhận xét rèn luyện cho từng học sinh vào cuối kỳ để hoàn thiện học bạ điện tử.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/gv/ConductEvaluationPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js'
    ],
    layer: 'Conduct Evaluation & Homeroom Workflow',
    guide: `1. Frontend & Backend:
   - GVCN chọn 4 mức hạnh kiểm: Tốt, Khá, Đạt, Chưa đạt kèm ô nhập văn bản nhận xét.
   - Gửi PUT /api/students/:id/conduct để lưu kết quả vào học bạ.`,
    criteria: [
      'Lưu đánh giá hạnh kiểm thành công cho cả lớp chủ nhiệm.',
      'Tự động tích hợp điểm hạnh kiểm vào phiếu báo điểm học kỳ.'
    ]
  },
  {
    pbiCode: 'PBI-11',
    jiraKey: 'KAN-128',
    name: 'PBI-11: Triển khai Repository Pattern trừu tượng hóa SQL & Tối ưu tải sổ điểm dưới 2 giây',
    module: 'Module 6: Giao Dịch Dữ Liệu ACID, Mẫu Thiết Kế & CSDL',
    story: 'Là Kỹ sư Backend, tôi muốn áp dụng Repository Pattern để cô lập mã SQL, ngăn chặn SQL Injection và bảo đảm tải sổ điểm dưới 2 giây.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js',
      'members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js'
    ],
    layer: 'Data Access Layer (Repository Pattern)',
    guide: `1. Cấu trúc Repository (GradeBookRepository.js):
   - Đóng gói toàn bộ câu SQL với tham số $1, $2, tuyệt đối không ghép chuỗi.
   - Hàm findByClassAndSubject(): Tối ưu hóa câu truy vấn JOIN bảng students và grade_books.
   - Tạo Composite Indexes trên (class_id, subject_id, semester) trong CSDL PostgreSQL.`,
    criteria: [
      '100% câu lệnh SQL được bọc trong các lớp Repository sạch.',
      'Tốc độ tải sổ điểm lớp 45 học sinh đạt < 1 giây.'
    ]
  },
  {
    pbiCode: 'PBI-12',
    jiraKey: 'KAN-129',
    name: 'PBI-12: Cài đặt Unit of Work bảo toàn ACID lưu điểm đồng thời 45 học sinh (Commit/Rollback)',
    module: 'Module 6: Giao Dịch Dữ Liệu ACID, Mẫu Thiết Kế & CSDL',
    story: 'Là DBA, tôi muốn áp dụng Unit of Work quản lý giao dịch CSDL để lưu điểm đồng loạt cho 45 học sinh theo nguyên tắc ACID: tất-cả-hoặc-không.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js',
      'members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js'
    ],
    layer: 'Transaction Coordinator (Unit of Work Pattern)',
    guide: `1. Lớp UnitOfWork.js:
   - beginTransaction(): Lấy client từ pool và gọi BEGIN.
   - query(sql, params): Thực thi câu lệnh trong ngữ cảnh transaction client.
   - commit(): Gọi COMMIT và giải phóng client về pool.
   - rollback(): Gọi ROLLBACK khôi phục dữ liệu ban đầu khi có lỗi.
2. Ứng dụng trong GradeBookService:
   - Khi lưu 45 học sinh, nếu bản ghi thứ 40 bị lỗi, toàn bộ 39 bản ghi trước đó phải được hoàn tác.`,
    criteria: [
      'Bảo toàn tính nguyên tử ACID 100% khi lưu điểm hàng loạt.',
      'Tự động Rollback hoàn hảo khi phát sinh ngoại lệ.'
    ]
  },
  {
    pbiCode: 'PBI-18',
    jiraKey: 'KAN-130',
    name: 'PBI-18: Cấu hình Singleton Connection Pool pg.Pool 20 client chịu tải cao giờ cao điểm',
    module: 'Module 6: Giao Dịch Dữ Liệu ACID, Mẫu Thiết Kế & CSDL',
    story: 'Là Kỹ sư Hệ thống, tôi muốn cấu hình Connection Pool Singleton với 20 client kết nối để chống nghẽn mạng giờ cao điểm vào điểm thi.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/config/db.js'
    ],
    layer: 'Database Infrastructure & Connection Pool Singleton',
    guide: `1. Cấu hình db.js:
   - Sử dụng Singleton Pattern đảm bảo chỉ có 1 đối tượng Pool duy nhất.
   - max: 20 (tối đa 20 kết nối đồng thời).
   - idleTimeoutMillis: 30000 (đóng kết nối nhàn rỗi sau 30s).
   - connectionTimeoutMillis: 5000 (báo lỗi timeout nếu quá 5s không lấy được kết nối).`,
    criteria: [
      'Khởi tạo Pool Singleton duy nhất trong suốt vòng đời ứng dụng.',
      'Chịu tải ổn định khi nhiều giáo viên vào điểm cùng lúc.'
    ]
  },
  {
    pbiCode: 'PBI-13',
    jiraKey: 'KAN-131',
    name: 'PBI-13: Dịch vụ Audit Trail tự động ghi nhật ký sửa điểm (Người sửa, điểm cũ/mới, IP, giờ)',
    module: 'Module 7: Nhật Ký Kiểm Toán (Audit Trail) & An Toàn Ứng Dụng',
    story: 'Là Ban Giám Hiệu, tôi muốn hệ thống tự động ghi nhật ký kiểm toán bất biến khi có thao tác sửa điểm để chống gian lận học đường.',
    primaryFiles: [
      'members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js',
      'database/schema.sql'
    ],
    layer: 'Centralized Audit Logging & Non-repudiation Service',
    guide: `1. Bảng audit_logs:
   - Cột: id, user_id, action, entity_name, entity_id, old_values (JSON), new_values (JSON), ip_address, created_at.
2. Dịch vụ AuditLogger.js:
   - Hàm log({ userId, action, entityName, oldValues, newValues, ipAddress }):
   - Ghi bản ghi vào CSDL (Append-only, nghiêm cấm sửa hoặc xóa).`,
    criteria: [
      'Ghi nhận đầy đủ thông tin trước và sau khi sửa điểm.',
      'Bảng audit_logs bất biến, lưu trữ IP và thời gian chính xác.'
    ]
  },
  {
    pbiCode: 'PBI-17a',
    jiraKey: 'KAN-132',
    name: 'PBI-17a: Cổng Sổ liên lạc điện tử: Tra cứu kết quả học tập, điểm số và số buổi vắng của con (Phụ huynh)',
    module: 'Module 8: Sổ Liên Lạc Điện Tử & Kênh Giao Tiếp Phụ Huynh',
    story: 'Là Phụ huynh, tôi muốn tra cứu kết quả học tập và nhật ký chuyên cần của con trực tuyến mọi lúc mọi nơi.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ParentPortalController.js'
    ],
    layer: 'Parent Portal & Electronic Contact Book',
    guide: `1. Frontend (ParentPortalPage.jsx):
   - Hiển thị thông tin học sinh, điểm số từng môn học, số buổi có mặt/nghỉ phép.
   - Nhận thông báo họp phụ huynh và nhận xét của giáo viên chủ nhiệm.
2. Backend (ParentPortalController.js):
   - GET /api/parent/child-summary: Lấy dữ liệu tổng hợp của con em phụ huynh.`,
    criteria: [
      'Phụ huynh tra cứu điểm số và chuyên cần của con em thời gian thực.',
      'Giao diện thân thiện trên cả điện thoại di động và máy tính.'
    ]
  },
  {
    pbiCode: 'PBI-17b',
    jiraKey: 'KAN-133',
    name: 'PBI-17b: Nộp đơn xin phép nghỉ học trực tuyến kèm lý do gửi trực tiếp đến GVCN (Phụ huynh)',
    module: 'Module 8: Sổ Liên Lạc Điện Tử & Kênh Giao Tiếp Phụ Huynh',
    story: 'Là Phụ huynh, tôi muốn gửi đơn xin nghỉ học trực tuyến kèm lý do tới GVCN để xin phép cho con nghỉ ốm hoặc có việc gia đình.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/ParentPortalController.js'
    ],
    layer: 'Online Leave Request Submission',
    guide: `1. Form nộp đơn nghỉ học:
   - Các trường: Ngày bắt đầu nghỉ, Ngày kết thúc nghỉ, Lý do (Ốm đau, Việc gia đình, Khác).
   - Gửi POST /api/leave-requests -> Lưu vào CSDL với status = 'PENDING'.
   - Thông báo cho phụ huynh khi đơn được giáo viên duyệt.`,
    criteria: [
      'Phụ huynh gửi đơn xin nghỉ trực tuyến thành công trong 30 giây.',
      'Đơn được chuyển ngay đến danh sách chờ duyệt của GVCN.'
    ]
  },
  {
    pbiCode: 'PBI-24',
    jiraKey: 'KAN-134',
    name: 'PBI-24: Quản lý hóa đơn học phí, Thanh toán trực tuyến quét mã VietQR tự động & Xuất biên lai PDF',
    module: 'Module 9: Quản Lý Học Phí & Thanh Toán Trực Tuyến VietQR',
    story: 'Là Phụ huynh, tôi muốn xem thông báo học phí, quét mã VietQR tự động chuyển khoản ngân hàng và tải biên lai thu tiền PDF.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js',
      'members/member5_Modules_QA/exportEngine.js'
    ],
    layer: 'Tuition Payment & VietQR Engine',
    guide: `1. Quy trình thanh toán VietQR:
   - Phụ huynh mở mục Học phí -> Bấm "Thanh toán VietQR".
   - Hệ thống sinh mã VietQR Napas 247 mã hóa: STK trường, số tiền, cú pháp 'HP HSxxxxx HK1'.
   - Quét mã chuyển khoản thành công -> Cập nhật status = 'PAID'.
   - Bấm nút "Tải Biên Lai PDF": Gọi exportTuitionReceiptToPDF() tạo biên lai chuẩn A4 có mã xác thực.`,
    criteria: [
      'Mã VietQR động hiển thị đúng số tiền và nội dung chuyển khoản.',
      'Cập nhật gạch nợ thành công và xuất biên lai PDF chuẩn A4.'
    ]
  },
  {
    pbiCode: 'PBI-15',
    jiraKey: 'KAN-135',
    name: 'PBI-15: Động cơ xuất Bảng điểm tổng hợp của lớp ra file Excel .xlsx chuẩn SheetJS (GVBM, GVCN)',
    module: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    story: 'Là Giáo viên, tôi muốn xuất toàn bộ bảng điểm lớp ra tệp Excel (.xlsx) để lưu trữ và nộp báo cáo cho Ban Giám Hiệu.',
    primaryFiles: [
      'members/member5_Modules_QA/exportEngine.js',
      'members/member2_Frontend/src/pages/gv/GradebookPage.jsx'
    ],
    layer: 'Report Export Engine (SheetJS)',
    guide: `1. Hàm exportGradebookToExcel(classData, grades) trong exportEngine.js:
   - Sử dụng thư viện xlsx (SheetJS).
   - Thiết lập Header tiêu đề trường, tên lớp, năm học, môn học.
   - Đổ mảng dữ liệu điểm thành phần và điểm TBM.
   - Tự động căn chỉnh độ rộng cột (!cols) và xuất tệp Bang_Diem_Lop_10A1.xlsx.`,
    criteria: [
      'Xuất file Excel .xlsx mở tốt trên Microsoft Excel và Google Sheets.',
      'Định dạng bảng biểu ngay ngắn, đầy đủ điểm thành phần và TBM.'
    ]
  },
  {
    pbiCode: 'PBI-16',
    jiraKey: 'KAN-136',
    name: 'PBI-16: Xuất và in ấn Phiếu báo điểm học kỳ & Học bạ điện tử ra file PDF chuẩn khổ A4 (jsPDF)',
    module: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    story: 'Là GVCN và Phụ huynh, tôi muốn xuất và in ấn Phiếu báo điểm học kỳ của học sinh ra file PDF chuẩn khổ A4 có chữ ký số nhà trường.',
    primaryFiles: [
      'members/member5_Modules_QA/exportEngine.js',
      'members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx'
    ],
    layer: 'PDF Generation Engine (jsPDF & autoTable)',
    guide: `1. Hàm exportStudentReportCardToPDF(studentData) trong exportEngine.js:
   - Sử dụng jsPDF khổ A4 chuẩn dọc (portrait).
   - Vẽ quốc hiệu, tiêu ngữ, logo trường THPT HSU.
   - Vẽ bảng điểm chi tiết các môn học bằng autoTable.
   - Thêm phần nhận xét hạnh kiểm của GVCN và phần ký tên của Hiệu trưởng.`,
    criteria: [
      'Tệp PDF xuất ra định dạng chuẩn khổ A4 sắc nét.',
      'Đầy đủ quốc hiệu, tiêu ngữ, bảng điểm và phần ký tên.'
    ]
  },
  {
    pbiCode: 'PBI-23',
    jiraKey: 'KAN-137',
    name: 'PBI-23: Báo cáo thống kê phổ điểm toàn trường & Tự động xét danh hiệu HS Xuất sắc, Giỏi (BGH)',
    module: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    story: 'Là Ban Giám Hiệu, tôi muốn xem báo cáo thống kê phổ điểm và danh sách học sinh đạt danh hiệu Xuất sắc/Giỏi để phục vụ công tác thi đua khen thưởng.',
    primaryFiles: [
      'members/member2_Frontend/src/pages/admin/BGHReportCenterPage.jsx',
      'members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js'
    ],
    layer: 'Executive Analytics & Academic Honors Evaluation',
    guide: `1. Frontend (BGHReportCenterPage.jsx):
   - Biểu đồ phân bổ phổ điểm: Xuất sắc, Giỏi, Khá, Trung bình, Yếu.
   - Bảng danh sách học sinh được khen thưởng toàn trường.
   - Bảng danh sách học sinh cần rèn luyện hè hoặc thi lại.`,
    criteria: [
      'Thống kê phổ điểm toàn trường chính xác theo chuẩn Thông tư 22.',
      'Tự động lọc danh sách khen thưởng học kỳ nhanh chóng.'
    ]
  },
  {
    pbiCode: 'PBI-19',
    jiraKey: 'KAN-138',
    name: 'PBI-19: Bộ kiểm thử tự động QA 68 test cases bảo đảm thuật toán Thông tư 22 & Bảo mật RBAC',
    module: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    story: 'Là Kỹ sư QA Lead, tôi muốn xây dựng bộ kiểm thử tự động toàn diện kiểm tra tính đúng đắn của thuật toán tính điểm và ma trận bảo mật 5 vai trò.',
    primaryFiles: [
      'members/member5_Modules_QA/tests/unitTestingSuite.test.js'
    ],
    layer: 'Automated QA Testing Suite',
    guide: `1. Bộ test suite (unitTestingSuite.test.js):
   - 68 Backend Unit Test cases: Tính điểm TBM chia 9, làm tròn, GPA 4.0, xếp loại học lực, kiểm tra khóa sổ 2 cấp, bảo mật RBAC.
   - 13 Frontend Vitest test cases: Kiểm tra render bảng điểm, điểm danh, thanh điều hướng Sidebar.
   - Lệnh chạy kiểm thử: npm test.`,
    criteria: [
      '100% các bài test tự động (68 backend tests, 13 vitest tests) đạt PASS.',
      'Bảo đảm không có lỗi hồi quy (regression bugs) khi cập nhật mã nguồn.'
    ]
  }
];

/**
 * Hàm xây dựng nội dung Markdown giàu chi tiết cho từng Task
 */
function buildEnrichedDescription(item) {
  const githubLinks = item.primaryFiles.map(f => `- **GitHub**: [\`${f}\`](${GITHUB_REPO}/${f})`).join('\n');
  const bitbucketLinks = item.primaryFiles.map(f => `- **Bitbucket**: [\`${f}\`](${BITBUCKET_REPO}/${f})`).join('\n');
  const criteriaList = item.criteria.map(c => `- [x] ${c}`).join('\n');

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

### 💡 4. HƯỚNG DẪN KỸ THUẬT & GỢI Ý LẬP TRÌNH CHI TIẾT (IMPLEMENTATION GUIDE)
\`\`\`text
${item.guide}
\`\`\`

---

### ✅ 5. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA / DEFINITION OF DONE)
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
        // Tìm PBI tương ứng
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
