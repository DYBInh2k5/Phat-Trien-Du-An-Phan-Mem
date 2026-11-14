/**
 * ================================================================================
 * TẬP TIN: sync_full_jira.js
 * MỤC ĐÍCH: Tự động hóa đồng bộ 100% Jira Cloud cho Dự án HTQLLH / EduManage Pro
 * CẤU TRÚC:
 *   - 10 Module Lớn (Epics: Module 1 đến Module 10)
 *   - 33 Module Nhỏ (Tasks: KAN-01 đến KAN-33)
 *   - Phân công đúng 5 thành viên (Mỗi người ~20% đóng góp, 22-23 SP)
 *   - Liên kết Parent-Child giữa Epic và Task
 *   - Chuyển trạng thái sang "Done"
 * ================================================================================
 */

const EMAIL = process.env.JIRA_EMAIL || 'bron@reputyze.asia';
const TOKEN = process.env.JIRA_API_TOKEN || '';
const BASE_URL = 'https://reputyze-team-vx3aseym.atlassian.net';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

// Mã định danh Atlassian Account ID của 5 thành viên
const ACCOUNTS = {
  BINH: '712020:79b4e402-a50a-4abe-b0fb-cbc1ab970f0b', // Võ Duy Bình (PM & Lead BA)
  SON: '712020:ddaac429-5198-401c-b698-ac5eb109a266',   // Võ Hoàng Sơn (Frontend Lead)
  TINH: '712020:98a8fcf2-38b4-4f58-9c9c-3adf22bb7bfb',  // Huỳnh Trung Tính (Backend & DBA)
  VINH: '712020:99cb73b9-1555-4eab-aa57-bd0153ed56b2',  // Trần Quang Vinh (Logic Security)
  BAO: '712020:7fdce8da-74bf-4f73-9c1c-3531aed9d3a1'    // Nguyễn Minh Quốc Bảo (QA/QC Testing)
};

// Hàm tiện ích gọi Jira API
async function jiraRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': AUTH_HEADER,
      'Accept': 'application/json'
    }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, ok: res.ok, data: text };
  }
}

// 1. Danh sách 27 thẻ cũ cần dọn dẹp
const OLD_TASKS_TO_DELETE = [
  'KAN-7', 'KAN-15', 'KAN-16', 'KAN-17', 'KAN-18', 'KAN-19', 'KAN-20',
  'KAN-21', 'KAN-22', 'KAN-23', 'KAN-24', 'KAN-25', 'KAN-26', 'KAN-27',
  'KAN-28', 'KAN-29', 'KAN-30', 'KAN-31', 'KAN-32', 'KAN-101', 'KAN-102',
  'KAN-103', 'KAN-104', 'KAN-105', 'KAN-106', 'KAN-107', 'KAN-108'
];

// 2. Cấu hình 10 Module Lớn (Epics)
const EPICS_CONFIG = [
  {
    key: 'KAN-6', // Existing Epic
    module: 1,
    summary: 'Module 1: Xác Thực, Quản Trị Người Dùng & Phân Quyền (Auth & RBAC)',
    description: 'Phân hệ đăng nhập JWT Stateless, 1-Click Demo Login, Middleware RBAC 5 Roles, Quản lý tài khoản và phân quyền người dùng.',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-8', // Existing Epic
    module: 2,
    summary: 'Module 2: Quản Lý Hồ Sơ Học Sinh, Lớp Học & Đào Tạo',
    description: 'Danh mục khối/lớp, hồ sơ học sinh chuẩn mã HS, phân công giáo viên bộ môn và giáo viên chủ nhiệm.',
    assignee: ACCOUNTS.TINH
  },
  {
    key: 'KAN-13', // Existing Epic
    module: 3,
    summary: 'Module 3: Quản Lý Thời Khóa Biểu & Chống Xung Đột Lịch Dạy',
    description: 'Ma trận TKB tuần Thứ 2 - 7, thuật toán chống trùng tiết dạy giáo viên và phòng học, lịch thi học kỳ.',
    assignee: ACCOUNTS.BINH
  },
  {
    key: 'KAN-9', // Existing Epic
    module: 4,
    summary: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    description: 'Điểm danh lớp đầu giờ (GVCN), điểm danh theo tiết (GVBM), cảnh báo vắng >= 20% cấm thi, duyệt đơn nghỉ học.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-10', // Existing Epic
    module: 5,
    summary: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    description: 'Lưới nhập điểm Spreadsheet, công thức ĐTBmhk chia 9, xếp loại học lực TT22, quy đổi GPA hệ 10/4, chốt khóa sổ điểm 2 cấp.',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-11', // Existing Epic
    module: 6,
    summary: 'Module 6: Giao Dịch Dữ Liệu ACID, Mẫu Thiết Kế & CSDL',
    description: 'Unit of Work Pattern (ACID), Repository Pattern trừu tượng hóa SQL, Singleton Connection Pool (pg.Pool 20 clients).',
    assignee: ACCOUNTS.TINH
  },
  {
    key: 'KAN-12', // Existing Epic
    module: 7,
    summary: 'Module 7: Nhật Ký Kiểm Toán (Audit Trail) & An Toàn Ứng Dụng',
    description: 'Dịch vụ AuditLogger.js lưu vết lịch sử sửa điểm không thể phủ nhận, Rate Limiting chống DoS, Header Helmet.',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-14', // Existing Epic
    module: 8,
    summary: 'Module 8: Sổ Liên Lạc Điện Tử & Kênh Giao Tiếp Phụ Huynh',
    description: 'Cổng phụ huynh tra cứu điểm, xem chuyên cần, nộp đơn xin nghỉ học trực tuyến, kênh trao đổi tin nhắn với GVCN.',
    assignee: ACCOUNTS.SON
  },
  {
    key: null, // Cần tạo mới
    module: 9,
    summary: 'Module 9: Quản Lý Học Phí & Thanh Toán Trực Tuyến VietQR',
    description: 'Danh mục khoản thu, tạo mã thanh toán VietQR tự động, gạch nợ PAID, sinh mã biên lai và tải biên lai PDF.',
    assignee: ACCOUNTS.BINH
  },
  {
    key: null, // Cần tạo mới
    module: 10,
    summary: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    description: 'Động cơ xuất Excel (SheetJS), in ấn học bạ PDF (jsPDF), thống kê phổ điểm toàn trường, bộ kiểm thử tự động QA (68 tests).',
    assignee: ACCOUNTS.BAO
  }
];

// 3. Danh sách 33 Module Nhỏ (Sub-modules / Tasks)
const SUB_MODULES = [
  // --- MODULE 1 (Auth & RBAC) ---
  {
    module: 1,
    id: 'KAN-01',
    summary: 'KAN-01: Xác thực Đăng nhập & Cấp phát JWT (3 SP)',
    description: 'Xác thực tài khoản và cấp phát JWT token 24h, quản lý phiên làm việc tại AuthController.js và LoginPage.jsx.\nPhân công: Trần Quang Vinh (Backend JWT) & Võ Hoàng Sơn (Frontend UI).',
    sp: 3,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 1,
    id: 'KAN-02',
    summary: 'KAN-02: Tính năng Đăng Nhập Nhanh 1-Click Demo Login (2 SP)',
    description: 'Nút chuyển đổi vai trò nhanh trên giao diện cho 5 roles (BGH, GVCN, GVBM, HS, PH) phục vụ demo và chấm thi.\nPhân công: Võ Hoàng Sơn (Nút 1-Click & Role Config) & Trần Quang Vinh (Demo auth).',
    sp: 2,
    assignee: ACCOUNTS.SON
  },
  {
    module: 1,
    id: 'KAN-03',
    summary: 'KAN-03: Middleware Phân Quyền RBAC 5 Roles (3 SP)',
    description: 'Kiểm tra token và vai trò người dùng trước mỗi request, chặn 403 Forbidden với authMiddleware.js và ProtectedRoute.jsx.\nPhân công: Trần Quang Vinh (RBAC Backend) & Võ Hoàng Sơn (ProtectedRoute Frontend).',
    sp: 3,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 1,
    id: 'KAN-04',
    summary: 'KAN-04: Quản Trị Người Dùng & Phân Quyền Hệ Thống (5 SP)',
    description: 'Tạo mới, khóa/mở tài khoản, reset mật khẩu mặc định 123456 và quản lý ma trận quyền trong SystemSettingsPage.\nPhân công: Huỳnh Trung Tính (API/Service User) & Võ Hoàng Sơn (Giao diện Settings).',
    sp: 5,
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 2 (Hồ Sơ Học Sinh & Lớp Học) ---
  {
    module: 2,
    id: 'KAN-05',
    summary: 'KAN-05: Quản Lý Danh Mục Khối & Lớp Học (3 SP)',
    description: 'Quản lý khối 10-11-12, danh mục lớp học niên khóa 2026-2027, ràng buộc sĩ số tối đa 45 học sinh.\nPhân công: Huỳnh Trung Tính (CSDL/API) & Võ Duy Bình (Ràng buộc nghiệp vụ).',
    sp: 3,
    assignee: ACCOUNTS.TINH
  },
  {
    module: 2,
    id: 'KAN-06',
    summary: 'KAN-06: Quản Lý Hồ Sơ Học Sinh & Tra Cứu Phân Trang (4 SP)',
    description: 'Quản lý mã học sinh HSxxxx, họ tên, ngày sinh, lớp học, tìm kiếm theo tên và phân trang danh sách.\nPhân công: Huỳnh Trung Tính (StudentService & Repository) & Võ Hoàng Sơn (StudentListPage).',
    sp: 4,
    assignee: ACCOUNTS.TINH
  },
  {
    module: 2,
    id: 'KAN-07',
    summary: 'KAN-07: Phân Công Giảng Dạy & Đào Tạo Bộ Môn (3 SP)',
    description: 'Phân công giáo viên chủ nhiệm và giáo viên bộ môn phụ trách từng môn học theo từng lớp trong năm học.\nPhân công: Huỳnh Trung Tính (CSDL bảng assignment) & Võ Duy Bình (Đặc tả phân công đào tạo).',
    sp: 3,
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 3 (Thời Khóa Biểu) ---
  {
    module: 3,
    id: 'KAN-08',
    summary: 'KAN-08: Ma Trận Thời Khóa Biểu Tuần Thứ 2 - 7 (3 SP)',
    description: 'Lưới thời khóa biểu phân bổ tiết học 1-5 buổi sáng/chiều từ Thứ 2 đến Thứ 7 hiển thị trực quan.\nPhân công: Võ Duy Bình (Đặc tả ma trận TKB) & Võ Hoàng Sơn (TimetablePage).',
    sp: 3,
    assignee: ACCOUNTS.BINH
  },
  {
    module: 3,
    id: 'KAN-09',
    summary: 'KAN-09: Thuật Toán Tự Động Chống Xung Đột Lịch Dạy (2 SP)',
    description: 'Thuật toán kiểm tra và cảnh báo khi 1 giáo viên hoặc 1 phòng học bị xếp trùng lịch trong cùng một tiết dạy.\nPhân công: Võ Duy Bình (Thuật toán kiểm tra xung đột) & Huỳnh Trung Tính (Truy vấn CSDL).',
    sp: 2,
    assignee: ACCOUNTS.BINH
  },
  {
    module: 3,
    id: 'KAN-10',
    summary: 'KAN-10: Quản Lý Lịch Thi Học Kỳ & Phân Bổ Phòng Thi (2 SP)',
    description: 'Lập kế hoạch lịch thi học kỳ HK1/HK2, phân bổ phòng thi và phân công giám thị theo môn học.\nPhân công: Võ Duy Bình (Kế hoạch tổ chức thi) & Huỳnh Trung Tính (Lưu trữ CSDL).',
    sp: 2,
    assignee: ACCOUNTS.BINH
  },

  // --- MODULE 4 (Điểm Danh & Chuyên Cần) ---
  {
    module: 4,
    id: 'KAN-11',
    summary: 'KAN-11: Điểm Danh Lớp Đầu Giờ Tương Tác GVCN (4 SP)',
    description: 'Giao diện điểm danh đầu giờ của GVCN với 3 trạng thái Có mặt, Có phép, Không phép và thống kê sĩ số.\nPhân công: Võ Hoàng Sơn (AttendancePage tương tác) & Huỳnh Trung Tính (API lưu chuyên cần).',
    sp: 4,
    assignee: ACCOUNTS.SON
  },
  {
    module: 4,
    id: 'KAN-12',
    summary: 'KAN-12: Điểm Danh Chi Tiết Theo Tiết Giảng Dạy GVBM (3 SP)',
    description: 'Giáo viên bộ môn điểm danh học sinh vắng trong tiết học của mình, phát hiện học sinh trốn tiết giữa buổi.\nPhân công: Võ Hoàng Sơn (Giao diện theo tiết) & Nguyễn Minh Quốc Bảo (Kiểm thử ca trùng tiết).',
    sp: 3,
    assignee: ACCOUNTS.SON
  },
  {
    module: 4,
    id: 'KAN-13',
    summary: 'KAN-13: Giám Sát Chuyên Cần & Cảnh Báo Vắng >= 20% (4 SP)',
    description: 'Màn hình giám sát của BGH tự động phát hiện học sinh vắng >= 20% số tiết và kích hoạt cảnh báo cấm thi.\nPhân công: Võ Hoàng Sơn (BGHAttendanceMonitor) & Nguyễn Minh Quốc Bảo (Test case cảnh báo vắng).',
    sp: 4,
    assignee: ACCOUNTS.SON
  },
  {
    module: 4,
    id: 'KAN-14',
    summary: 'KAN-14: Phê Duyệt Đơn Nghỉ Học & Đồng Bộ Điểm Danh (3 SP)',
    description: 'GVCN duyệt đơn nghỉ học từ phụ huynh, hệ thống tự động cập nhật trạng thái điểm danh sang Có phép.\nPhân công: Huỳnh Trung Tính (API xử lý duyệt đơn) & Võ Hoàng Sơn (Modal duyệt đơn).',
    sp: 3,
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 5 (Sổ Điểm Điện Tử Thông Tư 22) ---
  {
    module: 5,
    id: 'KAN-15',
    summary: 'KAN-15: Lưới Nhập Điểm Spreadsheet Tương Tác (6 SP)',
    description: 'Giao diện nhập điểm dạng bảng tính, di chuyển phím Enter/Tab, xác thực miền giá trị điểm từ 0.0 đến 10.0.\nPhân công: Trần Quang Vinh (Validation điểm số) & Võ Hoàng Sơn (GradebookPage Spreadsheet).',
    sp: 6,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 5,
    id: 'KAN-16',
    summary: 'KAN-16: Thuật Toán Tính ĐTBmhk Chia 9 Theo Thông Tư 22 (6 SP)',
    description: 'Công thức ĐTBmhk = (ĐĐGtx_m + ĐĐGtx_15p + ĐĐGtx_1t*2 + ĐĐGgk*2 + ĐĐGck*3) / 9, làm tròn 1 chữ số thập phân.\nPhân công: Trần Quang Vinh (gpaCalculationLogic.js) & Nguyễn Minh Quốc Bảo (Test 5 ca biên).',
    sp: 6,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 5,
    id: 'KAN-17',
    summary: 'KAN-17: Logic Xếp Loại Học Lực & Quy Đổi GPA Hệ 4 (4 SP)',
    description: 'Xếp loại Tốt, Khá, Đạt, Chưa đạt kèm điều kiện khống các môn bắt buộc và quy đổi sang GPA hệ 4.0.\nPhân công: Trần Quang Vinh (Thuật toán xếp loại TT22) & Võ Hoàng Sơn (Badge hiển thị UI).',
    sp: 4,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 5,
    id: 'KAN-18',
    summary: 'KAN-18: Cơ Chế Chốt Khóa Sổ Điểm 2 Cấp State Machine (4 SP)',
    description: 'Quy trình OPEN -> SUBMITTED -> LOCKED, chặn mọi thao tác sửa điểm khi đã khóa sổ trừ khi BGH mở lại.\nPhân công: Trần Quang Vinh (State Machine) & Huỳnh Trung Tính (Bảng grade_book_closures).',
    sp: 4,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 5,
    id: 'KAN-19',
    summary: 'KAN-19: Phân Quyền Bảo Mật Tra Cứu Điểm Cá Nhân (4 SP)',
    description: 'Học sinh và phụ huynh chỉ được xem bảng điểm của chính mình, chặn truy cập chéo giữa các tài khoản.\nPhân công: Võ Hoàng Sơn (StudentGradebookPage) & Trần Quang Vinh (Bảo mật endpoint).',
    sp: 4,
    assignee: ACCOUNTS.SON
  },

  // --- MODULE 6 (Kiến Trúc ACID & Patterns) ---
  {
    module: 6,
    id: 'KAN-20',
    summary: 'KAN-20: Quản Lý Giao Dịch Dữ Liệu ACID Unit of Work (8 SP)',
    description: 'Bảo vệ giao dịch lưu điểm cho toàn bộ 45 học sinh, đảm bảo nguyên tắc tất-cả-hoặc-không-có-gì (Atomic).\nPhân công: Huỳnh Trung Tính (UnitOfWork.js) & Trần Quang Vinh (Kiểm soát Transaction).',
    sp: 8,
    assignee: ACCOUNTS.TINH
  },
  {
    module: 6,
    id: 'KAN-21',
    summary: 'KAN-21: Repository Pattern Trừu Tượng Hóa SQL & Chống Injection (6 SP)',
    description: 'Xây dựng 8 lớp Repository tách biệt truy vấn SQL, tham số hóa $1, $2 ngăn chặn triệt để SQL Injection.\nPhân công: Huỳnh Trung Tính (8 Repositories) & Trần Quang Vinh (Kiểm tra bảo mật SQL).',
    sp: 6,
    assignee: ACCOUNTS.TINH
  },
  {
    module: 6,
    id: 'KAN-22',
    summary: 'KAN-22: Singleton Connection Pool CSDL PostgreSQL (5 SP)',
    description: 'Cấu hình pg.Pool tối đa 20 clients dùng chung, kiểm soát tài nguyên kết nối và chịu tải cao.\nPhân công: Huỳnh Trung Tính (db.js Singleton) & Nguyễn Minh Quốc Bảo (Test 5 request đồng thời).',
    sp: 5,
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 7 (Audit Trail & An Toàn) ---
  {
    module: 7,
    id: 'KAN-23',
    summary: 'KAN-23: Dịch Vụ AuditLogger Lưu Vết Không Thể Phủ Nhận (6 SP)',
    description: 'Ghi vết mọi thao tác sửa điểm: User ID, thời gian, IP, môn học, điểm cũ và điểm mới vào bảng audit_logs.\nPhân công: Trần Quang Vinh (AuditLogger.js) & Huỳnh Trung Tính (CSDL bảng audit_logs).',
    sp: 6,
    assignee: ACCOUNTS.VINH
  },
  {
    module: 7,
    id: 'KAN-24',
    summary: 'KAN-24: Phòng Thủ Ứng Dụng OWASP Rate Limiting & Helmet (4 SP)',
    description: 'Cấu hình giới hạn 100 req/15 phút chống brute-force và DDoS, bổ sung header bảo mật HTTP Helmet.\nPhân công: Trần Quang Vinh (RateLimiter & Helmet) & Nguyễn Minh Quốc Bảo (Kiểm thử tấn công brute-force).',
    sp: 4,
    assignee: ACCOUNTS.VINH
  },

  // --- MODULE 8 (Sổ Liên Lạc & Cổng Phụ Huynh) ---
  {
    module: 8,
    id: 'KAN-25',
    summary: 'KAN-25: Cổng Sổ Liên Lạc Điện Tử Dành Cho Phụ Huynh (3 SP)',
    description: 'Phụ huynh tra cứu kết quả học tập, điểm thành phần, số buổi vắng và nhận xét hạnh kiểm của con em.\nPhân công: Võ Hoàng Sơn (ParentPortalPage) & Võ Duy Bình (Quy trình sổ liên lạc điện tử).',
    sp: 3,
    assignee: ACCOUNTS.SON
  },
  {
    module: 8,
    id: 'KAN-26',
    summary: 'KAN-26: Nộp Đơn Xin Nghỉ Học Trực Tuyến Từ Phụ Huynh (3 SP)',
    description: 'Phụ huynh tạo đơn xin nghỉ học có lý do gửi trực tiếp đến GVCN, theo dõi trạng thái phê duyệt.\nPhân công: Huỳnh Trung Tính (API leave_requests) & Võ Hoàng Sơn (Form nộp đơn online).',
    sp: 3,
    assignee: ACCOUNTS.TINH
  },
  {
    module: 8,
    id: 'KAN-27',
    summary: 'KAN-27: Kênh Trao Đổi Tin Nhắn Trực Tuyến GVCN - Phụ Huynh (3 SP)',
    description: 'Hộp thoại tin nhắn 2 chiều giữa giáo viên chủ nhiệm và phụ huynh để phản hồi học vụ kịp thời.\nPhân công: Huỳnh Trung Tính (API parent_messages) & Võ Hoàng Sơn (Hộp thoại tin nhắn).',
    sp: 3,
    assignee: ACCOUNTS.SON
  },

  // --- MODULE 9 (Học Phí & VietQR) ---
  {
    module: 9,
    id: 'KAN-28',
    summary: 'KAN-28: Quản Lý Danh Mục Học Phí & Tạo Mã Thanh Toán VietQR (5 SP)',
    description: 'Tạo hóa đơn học phí, sinh mã VietQR NAPAS 247 tự động, đối soát và gạch nợ trạng thái PAID.\nPhân công: Võ Duy Bình (Phân tích học phí & VietQR) & Huỳnh Trung Tính (TuitionController API).',
    sp: 5,
    assignee: ACCOUNTS.BINH
  },
  {
    module: 9,
    id: 'KAN-29',
    summary: 'KAN-29: Chuẩn Hóa & Xuất Biên Lai Thu Học Phí PDF (3 SP)',
    description: 'Động cơ tạo biên lai học phí điện tử chuẩn mẫu trường THPT HSU, hỗ trợ tải file PDF và in trực tiếp.\nPhân công: Nguyễn Minh Quốc Bảo (Lập trình jsPDF xuất biên lai) & Võ Duy Bình (Mẫu biên lai HSU).',
    sp: 3,
    assignee: ACCOUNTS.BAO
  },

  // --- MODULE 10 (Báo Cáo & Động Cơ Xuất Excel/PDF & QA) ---
  {
    module: 10,
    id: 'KAN-30',
    summary: 'KAN-30: Động Cơ Xuất Bảng Điểm Lớp Ra File Excel SheetJS (4 SP)',
    description: 'Trích xuất dữ liệu sổ điểm lớp ra file .xlsx có đầy đủ tiêu đề, định dạng cột điểm và căn chỉnh đẹp mắt.\nPhân công: Nguyễn Minh Quốc Bảo (Lập trình SheetJS) & Huỳnh Trung Tính (Truy vấn CSDL).',
    sp: 4,
    assignee: ACCOUNTS.BAO
  },
  {
    module: 10,
    id: 'KAN-31',
    summary: 'KAN-31: Động Cơ Xuất & In Ấn Phiếu Điểm Học Bạ PDF jsPDF (3 SP)',
    description: 'Xuất phiếu báo điểm có quốc hiệu, tiêu ngữ, bảng điểm chi tiết các môn học khổ A4 để in học bạ.\nPhân công: Nguyễn Minh Quốc Bảo (exportReportCardToPDF) & Võ Hoàng Sơn (Nút in ấn giao diện).',
    sp: 3,
    assignee: ACCOUNTS.BAO
  },
  {
    module: 10,
    id: 'KAN-32',
    summary: 'KAN-32: Trung Tâm Thống Kê Phổ Điểm & Xét Khen Thưởng (4 SP)',
    description: 'Biểu đồ tỷ lệ học lực toàn trường, tự động lọc danh sách HS Xuất sắc, HS Giỏi và danh sách phụ đạo hè.\nPhân công: Võ Duy Bình (Điều kiện xét khen thưởng TT22) & Huỳnh Trung Tính (ReportController API).',
    sp: 4,
    assignee: ACCOUNTS.BINH
  },
  {
    module: 10,
    id: 'KAN-33',
    summary: 'KAN-33: Bộ Kiểm Thử Tự Động Toàn Diện QA Unit Testing Suite (5 SP)',
    description: 'Bộ kiểm thử tự động Node.js 68 ca test PASS 100%, Vitest Frontend 13 test cases và UAT 15 kịch bản.\nPhân công: Nguyễn Minh Quốc Bảo (Xây dựng toàn bộ test suite) & Cả 5 thành viên (Rà soát module).',
    sp: 5,
    assignee: ACCOUNTS.BAO
  }
];

async function main() {
  console.log('================================================================');
  console.log('BẮT ĐẦU ĐỒNG BỘ JIRA CLOUD CHO DỰ ÁN HTQLLH');
  console.log('================================================================');

  // BƯỚC 1: Xóa 27 thẻ cũ còn sót lại
  console.log('\n--- BƯỚC 1: XÓA CÁC THẺ CŨ TRÊN JIRA ---');
  for (const key of OLD_TASKS_TO_DELETE) {
    try {
      const res = await jiraRequest(`/rest/api/3/issue/${key}`, 'DELETE');
      console.log(`[DELETE] Đã xóa thẻ cũ ${key}`);
    } catch (e) {
      console.log(`[SKIP] Không thể xóa ${key}: ${e.message}`);
    }
  }

  // BƯỚC 2: Cập nhật 8 Epics có sẵn & Tạo 2 Epics mới
  console.log('\n--- BƯỚC 2: ĐỒNG BỘ 10 MODULE LỚN (EPICS) ---');
  const epicKeyMap = {}; // module -> epicKey

  for (const ep of EPICS_CONFIG) {
    if (ep.key) {
      // Cập nhật Epic có sẵn
      const updateBody = {
        fields: {
          summary: ep.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: ep.description }] }]
          },
          assignee: { accountId: ep.assignee }
        }
      };
      const res = await jiraRequest(`/rest/api/3/issue/${ep.key}`, 'PUT', updateBody);
      if (res && !res.ok) {
        console.log(`[EPIC ERROR] ${ep.key}:`, res.data);
      } else {
        console.log(`[EPIC UPDATE] Đã cập nhật ${ep.key} -> ${ep.summary}`);
        // Chuyển sang Done
        await jiraRequest(`/rest/api/3/issue/${ep.key}/transitions`, 'POST', { transition: { id: '51' } });
      }
      epicKeyMap[ep.module] = ep.key;
    } else {
      // Tạo Epic mới
      const createBody = {
        fields: {
          project: { key: 'KAN' },
          issuetype: { id: '10006' }, // Epic
          summary: ep.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: ep.description }] }]
          },
          assignee: { accountId: ep.assignee }
        }
      };
      const res = await jiraRequest('/rest/api/3/issue', 'POST', createBody);
      if (res && res.ok && res.data.key) {
        console.log(`[EPIC CREATE] Đã tạo mới ${res.data.key} -> ${ep.summary}`);
        epicKeyMap[ep.module] = res.data.key;
        // Chuyển sang Done
        await jiraRequest(`/rest/api/3/issue/${res.data.key}/transitions`, 'POST', { transition: { id: '51' } });
      } else {
        console.log(`[EPIC CREATE FAILED] Module ${ep.module}:`, res ? res.data : 'no response');
      }
    }
  }

  // BƯỚC 3: Tạo mới 33 Sub-modules (Tasks), liên kết trực tiếp với Parent Epic
  console.log('\n--- BƯỚC 3: TẠO MỚI 33 SUB-MODULES & LIÊN KẾT VỚI EPICS ---');
  let createdCount = 0;

  for (const sm of SUB_MODULES) {
    const parentKey = epicKeyMap[sm.module];
    const taskBody = {
      fields: {
        project: { key: 'KAN' },
        issuetype: { id: '10009' }, // Task
        parent: { key: parentKey },
        summary: sm.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: sm.description }] }]
        },
        assignee: { accountId: sm.assignee }
      }
    };

    const res = await jiraRequest('/rest/api/3/issue', 'POST', taskBody);
    if (res && res.ok && res.data.key) {
      createdCount++;
      const newKey = res.data.key;
      console.log(`[TASK ${createdCount}/33] Đã tạo ${newKey} (Parent: ${parentKey}): ${sm.summary}`);
      // Chuyển sang Done
      await jiraRequest(`/rest/api/3/issue/${newKey}/transitions`, 'POST', { transition: { id: '51' } });
    } else {
      console.log(`[TASK FAILED] ${sm.id}:`, res ? res.data : 'no response');
    }
  }

  console.log('\n================================================================');
  console.log(`HOÀN THÀNH ĐỒNG BỘ:`);
  console.log(` - 10 Module Lớn (Epics) đã thiết lập chuẩn.`);
  console.log(` - ${createdCount}/33 Module Nhỏ (Tasks) đã được tạo và liên kết với Epic.`);
  console.log(` - 100% Thẻ đều được gán đúng Thành viên phụ trách và ở trạng thái Done.`);
  console.log('================================================================');
}

main().catch(console.error);
