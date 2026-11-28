/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/server.js
 * Vai trò: Điểm Khởi Động & Gốc Cấu Thành Hệ Thống (Composition Root)
 * Kiến trúc: Clean Architecture - Tầng Ngoại Vi (Frameworks & Drivers)
 * Cổng lắng nghe mặc định: 8081
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày cập nhật: 13/11/2026 (Bổ sung cổng 4173 cho vite preview vào danh sách CORS)
 * Mô tả:
 *   - Khởi tạo ứng dụng Express.js, thiết lập CORS và trình phân tích JSON.
 *   - Đăng ký toàn bộ các tuyến đường RESTful API cho 8 phân hệ học vụ.
 *   - Cung cấp bộ lọc ghi vết nhật ký yêu cầu HTTP thời gian thực.
 *   - Bắt và xử lý lỗi tập trung (Global 404 & Global 500 Error Handler).
 *   - Tự động kiểm tra, khởi tạo bảng CSDL và nạp 45 học sinh mẫu khi khởi động.
 * ==============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabaseSchema } from './src/config/db.js';
import { seedDemoData } from './src/seeders/dataInitializer.js';

// Nạp các Bộ điều khiển (Controllers) tương ứng với các phân hệ nghiệp vụ
import { AuthController } from './src/controllers/AuthController.js';
import { StudentController } from './src/controllers/StudentController.js';
import { GradeBookController } from './src/controllers/GradeBookController.js';
import { AttendanceController } from './src/controllers/AttendanceController.js';
import { LeaveRequestController } from './src/controllers/LeaveRequestController.js';
import { TuitionController } from './src/controllers/TuitionController.js';
import { ClassController } from './src/controllers/ClassController.js';
import { SubjectController } from './src/controllers/SubjectController.js';
import { DashboardController } from './src/controllers/DashboardController.js';
import { ScheduleController } from './src/controllers/ScheduleController.js';
import { ReportController } from './src/controllers/ReportController.js';
import { UserController } from './src/controllers/UserController.js';
import { CommunicationController } from './src/controllers/CommunicationController.js';
import { SettingsController } from './src/controllers/SettingsController.js';
import { ClosureController } from './src/controllers/ClosureController.js';
import { NotificationController } from './src/controllers/NotificationController.js';
import { AuditLogger } from './src/utils/AuditLogger.js';
import { authenticateToken } from './src/middleware/authMiddleware.js';
import { resolveGvcnClass } from './src/middleware/dataAccessMiddleware.js';
import { forgotPasswordLimiter, resetPasswordLimiter } from './src/middleware/rateLimiters.js';
dotenv.config();

/**
 * Middleware phân quyền động RBAC (Role-Based Access Control)
 * Hỗ trợ 5 nhóm vai trò người dùng: BGH, GVCN, GV, HS, PH
 * Kết nối hợp đồng kiến trúc giữa Member 4 (Logic & Security) và Member 3 (Backend API)
 * @param  {...string} allowedRoles - Danh sách các vai trò được phép truy cập
 * @returns {Function} Express Middleware kiểm soát quyền truy cập
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Lỗi truy cập: Chưa đăng nhập hệ thống.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Lỗi phân quyền: Vai trò ${req.user.role} không có quyền thực hiện chức năng này (403 Forbidden).`
      });
    }

    return next();
  };
}

// Middleware kiểm tra quyền BGH cho các endpoint nhạy cảm (tương thích ngược)
const requireBGH = (req, res, next) => {
  if (req.user?.role !== 'BGH') {
    return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Hiệu mới có quyền thực hiện thao tác này.' });
  }
  return next();
};

const app = express();
const PORT = process.env.PORT || 8081;

// HTTP Security Headers theo chuẩn OWASP Top 10 (A05: Security Misconfiguration)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// Middlewares: Cấu hình CORS cho phép các cổng Frontend phát triển và môi trường Production Vercel
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev mặc định
  'http://localhost:5174',  // Vite dev dự phòng
  'http://localhost:4173',  // Vite preview mặc định (khi chạy npm start)
  'http://localhost:3000',  // React CRA mặc định
  'http://localhost:3001',
  'http://localhost:8080',  // Nginx reverse proxy
  'http://127.0.0.1:5173',  // Vite dev qua IP loopback
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173',  // Vite preview qua IP loopback
  'https://htqllh-frontend.vercel.app', // Domain Production chính thức trên Vercel
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép các yêu cầu không có header origin (ví dụ curl, Postman, kiểm thử server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // Mở CORS cho môi trường kiểm thử và phân phối cloud
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({
  verify: (req, res, buf) => {
    // Lưu rawBody để xác thực chữ ký HMAC-SHA256 trên webhook thanh toán
    if (req.originalUrl && req.originalUrl.startsWith('/api/tuition/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use((req, res, next) => {
  console.log(`[HTTP API] ${req.method} ${req.url}`);
  next();
});

// ------------------------------------------------------------------------------
// 2. ĐIỂM KIỂM TRA SỨC KHỎE DỊCH VỤ (HEALTH CHECK ENDPOINT)
// Phục vụ Docker Compose healthcheck và công cụ giám sát tải
// ------------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'HTQLLH Node.js Express Backend',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes (public)
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
app.post('/api/auth/reset-password', resetPasswordLimiter, AuthController.resetPassword);
// Auth - restore session (protected)
app.get('/api/auth/me',      authenticateToken, AuthController.me);
app.put('/api/auth/profile', authenticateToken, AuthController.updateProfile);

// Students Routes
app.get('/api/students',           authenticateToken, resolveGvcnClass, StudentController.getStudentsPaginated);
app.get('/api/students/:id',       authenticateToken, resolveGvcnClass, StudentController.getStudentById);
// import PHẢI đứng trước POST /api/students/:id/... để Express không nhầm 'import' là :id
app.post('/api/students/import',   authenticateToken, requireBGH,       StudentController.importStudents);
app.post('/api/students',          authenticateToken, resolveGvcnClass, StudentController.createStudent);
app.put('/api/students/:id',       authenticateToken, resolveGvcnClass, StudentController.updateStudent);
app.put('/api/students/:id/conduct', authenticateToken, resolveGvcnClass, StudentController.updateConduct);
app.post('/api/students/:id/calculate-gpa', authenticateToken, StudentController.calculateGPA);
// DELETE /api/students/:id — chỉ BGH (requireBGH kiểm tra role trước khi vào controller)
app.delete('/api/students/:id',    authenticateToken, requireBGH,       StudentController.deleteStudent);

// GradeBook Closure & Unlock Routes (MUST be before generic /api/gradebook routes)
app.get('/api/gradebook/closure',                authenticateToken, ClosureController.getStatus);
app.post('/api/gradebook/closure/submit',        authenticateToken, ClosureController.submitClosure);
app.post('/api/gradebook/closure/request-unlock', authenticateToken, ClosureController.requestUnlock);

// GradeBook Review Request Routes (MUST be before generic routes to avoid conflict)
app.post('/api/gradebook/review-request',  authenticateToken, GradeBookController.submitReviewRequest);
app.get('/api/gradebook/review-requests',  authenticateToken, GradeBookController.getReviewRequests);

// GradeBook Routes
app.get('/api/gradebook',               authenticateToken, resolveGvcnClass, GradeBookController.getGradeBookPaginated);
app.get('/api/gradebook/page-data',     authenticateToken, resolveGvcnClass, GradeBookController.getPageData);
app.post('/api/gradebook/save',         authenticateToken, resolveGvcnClass, GradeBookController.saveGrades);
app.post('/api/gradebook/save-spreadsheet', authenticateToken, resolveGvcnClass, GradeBookController.saveSpreadsheet);
app.post('/api/gradebook/lock',         authenticateToken, GradeBookController.lockGradeSheet);
app.post('/api/gradebook/unlock',       authenticateToken, GradeBookController.unlockGradeSheet);
app.post('/api/gradebook/send-report-email', authenticateToken, authorizeRoles('BGH', 'GVCN'), GradeBookController.sendReportEmail);

// Attendance Routes
app.get('/api/attendance', authenticateToken, resolveGvcnClass, AttendanceController.getAttendance);
app.get('/api/attendance/summary', authenticateToken, AttendanceController.getAttendanceSummary);
app.post('/api/attendance/save', authenticateToken, resolveGvcnClass, AttendanceController.saveAttendance);

// Phân hệ 5: Sổ liên lạc & Duyệt đơn xin nghỉ phép (Leave Requests & Portal)
// PBI-31: Bắt buộc xác thực JWT và phân quyền chặt chẽ cho quản lý đơn xin nghỉ phép
app.get('/api/leave-requests', authenticateToken, LeaveRequestController.getLeaveRequests);
app.post('/api/leave-requests', authenticateToken, LeaveRequestController.submitLeaveRequest);
app.put('/api/leave-requests/:id/approve', authenticateToken, authorizeRoles('BGH', 'GVCN'), LeaveRequestController.approveLeaveRequest);

// Tuition & VietQR Payment Routes (Phân hệ Đóng học phí trực tuyến SD-04)
// Phân quyền RBAC chặt chẽ: BGH (toàn trường/duyệt), PH (xem & quét QR đóng cho con), HS (chỉ xem/biên lai); chặn GV/GVCN
app.get('/api/tuition',                            authenticateToken, authorizeRoles('BGH', 'PH', 'HS'), TuitionController.getTuitions);
app.post('/api/tuition/:id/checkout',               authenticateToken, authorizeRoles('BGH', 'PH'), TuitionController.checkout);
app.post('/api/tuition/payments/claim',             authenticateToken, authorizeRoles('BGH', 'PH'), TuitionController.claimPayment);
app.get('/api/tuition/payments/pending',           authenticateToken, authorizeRoles('BGH'), TuitionController.getPendingPayments);
app.get('/api/tuition/payments/:orderCode/status',  authenticateToken, authorizeRoles('BGH', 'PH', 'HS'), TuitionController.getPaymentStatus);
app.post('/api/tuition/payments/:id/approve',       authenticateToken, authorizeRoles('BGH'), TuitionController.approvePayment);
app.post('/api/tuition/payments/:id/reject',        authenticateToken, authorizeRoles('BGH'), TuitionController.rejectPayment);
app.post('/api/tuition/payments/simulate-success',  authenticateToken, authorizeRoles('BGH', 'PH'), TuitionController.simulateSuccess);
app.get('/api/tuition/receipt/:paymentId',          authenticateToken, authorizeRoles('BGH', 'PH', 'HS'), TuitionController.getReceipt);
app.post('/api/tuition/webhook',                    TuitionController.handleWebhook);
app.get('/api/tuition/sandbox-scan',                TuitionController.handleSandboxScan);

// Phân hệ 7 & 8: Danh mục Lớp học & Môn học (Classes & Subjects)
// PBI-31: Chỉ Ban Giám Hiệu (BGH) đã xác thực mới được phép tạo mới lớp học và môn học
app.get('/api/classes', ClassController.getClasses);
app.post('/api/classes', authenticateToken, requireBGH, ClassController.createClass);
app.put('/api/classes/:className/homeroom',    authenticateToken, requireBGH, ClassController.assignHomeroom);
app.delete('/api/classes/:className/homeroom', authenticateToken, requireBGH, ClassController.removeHomeroom);
app.get('/api/subjects', SubjectController.getSubjects);
app.post('/api/subjects', authenticateToken, requireBGH, SubjectController.createSubject);

// Dashboard Routes
app.get('/api/dashboard/bgh',  authenticateToken, DashboardController.getBGHDashboard);
app.get('/api/dashboard/gvcn', authenticateToken, DashboardController.getGVCNDashboard);
app.patch('/api/dashboard/gvcn/leave-requests/:id', authenticateToken, DashboardController.processLeaveRequest);

// Schedule Routes (templates PHẢI đứng trước base route để tránh conflict)
app.get('/api/schedules/templates', authenticateToken, ScheduleController.getTemplates);
app.get('/api/schedules',    authenticateToken, ScheduleController.getSchedulePageData);
app.post('/api/schedules',   authenticateToken, ScheduleController.saveSlot);
app.delete('/api/schedules', authenticateToken, ScheduleController.deleteSlot);

// Report Routes (BGH)
app.get('/api/reports/bgh',             authenticateToken, ReportController.getReportData);
app.post('/api/reports/bgh/approve',    authenticateToken, ReportController.approveClass);
app.post('/api/reports/bgh/lock-all',   authenticateToken, ReportController.lockAll);
app.post('/api/reports/bgh/approve-unlock', authenticateToken, requireBGH, ReportController.approveBGHUnlock);

// Notification Routes (unread-count BEFORE :id to avoid route conflict)
app.get('/api/notifications/unread-count', authenticateToken, NotificationController.getUnreadCount);
app.get('/api/notifications',              authenticateToken, NotificationController.getNotifications);
app.patch('/api/notifications/:id/read',   authenticateToken, NotificationController.markRead);

// User Management Routes (Settings)
app.get   ('/api/users',                authenticateToken, requireBGH, UserController.getUsers);
app.post  ('/api/users',                authenticateToken, requireBGH, UserController.createUser);
app.put   ('/api/users/:id',            authenticateToken, requireBGH, UserController.updateUser);
app.patch ('/api/users/:id/deactivate', authenticateToken, requireBGH, UserController.deactivateUser);
app.delete('/api/users/:id',            authenticateToken, requireBGH, UserController.deleteUser);

// Settings Routes
// GET: tất cả user đã login đều được đọc permissions (để Sidebar ẩn/hiện đúng)
// PUT: chỉ BGH mới được thay đổi
app.get('/api/settings/permissions', authenticateToken, SettingsController.getPermissions);
app.put('/api/settings/permissions', authenticateToken, requireBGH, SettingsController.savePermissions);

// Phân hệ Nhật ký Kiểm toán Tập trung (Audit Trail - Table 18 PostgreSQL)
// Dành riêng cho Ban Giám Hiệu phục vụ thanh tra và giám sát học vụ
app.get('/api/audit-logs', authenticateToken, requireBGH, async (req, res) => {
  try {
    const logs = await AuditLogger.getAuditLogsFromDB(req.query);
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Communication Routes (Sổ liên lạc)
app.get('/api/communication/contacts',     authenticateToken, CommunicationController.getContacts);
app.get('/api/communication/page-data',    authenticateToken, CommunicationController.getPageData);
app.get('/api/communication/students',     authenticateToken, CommunicationController.getStudents);
app.get('/api/communication/messages',     authenticateToken, CommunicationController.getThread);
app.post('/api/communication/notifications', authenticateToken, CommunicationController.sendNotification);
app.post('/api/communication/messages',    authenticateToken, CommunicationController.sendMessage);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn ${req.method} ${req.url} không tồn tại trên hệ thống.`
  });
});

// Bắt các lỗi ngoại lệ phát sinh không mong muốn (HTTP 500 Internal Server Error)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi xử lý nội bộ trên máy chủ'
  });
});

// ------------------------------------------------------------------------------
// 5. KHỞI CHẠY MÁY CHỦ VÀ KHỞI TẠO CƠ SỞ DỮ LIỆU TỰ ĐỘNG
// Hỗ trợ cả chế độ Server truyền thống (Node.js/Docker) và Serverless (Vercel)
// ------------------------------------------------------------------------------
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(`  HTQLLH Node.js Express Backend Server Running!`);
    console.log(`  URL: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);

    try {
      await initDatabaseSchema();
      await seedDemoData();
      console.log('[SERVER] PostgreSQL connected and schema initialized successfully.');
    } catch (err) {
      console.error('[SERVER ERROR] Không thể kết nối PostgreSQL:', err.message);
      console.error('[SERVER ERROR] Kiểm tra cấu hình DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD hoặc DATABASE_URL trong .env');
      console.error('[SERVER ERROR] Server tiếp tục chạy nhưng chức năng đăng nhập sẽ không hoạt động cho đến khi DB sẵn sàng.');
    }
  });
}

// Xuất mặc định cá thể Express app cho môi trường Serverless Function (Vercel API Handler)
export default app;
