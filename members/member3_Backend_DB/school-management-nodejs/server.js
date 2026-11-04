import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabaseSchema } from './src/config/db.js';
import { seedDemoData } from './src/seeders/dataInitializer.js';

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
import { authenticateToken } from './src/middleware/authMiddleware.js';
import { resolveGvcnClass } from './src/middleware/dataAccessMiddleware.js';
import { forgotPasswordLimiter, resetPasswordLimiter } from './src/middleware/rateLimiters.js';
dotenv.config();

const requireBGH = (req, res, next) => {
  if (req.user?.role !== 'BGH') {
    return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Hiệu mới có quyền thực hiện thao tác này.' });
  }
  return next();
};

const app = express();
const PORT = process.env.PORT || 8081;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default
    'http://localhost:5174',  // Vite alternate
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[HTTP API] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'HTQLLH Node.js Express Backend', timestamp: new Date().toISOString() });
});

// Auth Routes (public)
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
app.post('/api/auth/reset-password', resetPasswordLimiter, AuthController.resetPassword);
// Auth - restore session (protected)
app.get('/api/auth/me', authenticateToken, AuthController.me);

// Students Routes
app.get('/api/students',      authenticateToken, resolveGvcnClass, StudentController.getStudents);
app.get('/api/students/:id',  authenticateToken, resolveGvcnClass, StudentController.getStudentById);
app.post('/api/students',     authenticateToken, resolveGvcnClass, StudentController.createStudent);
app.put('/api/students/:id',  authenticateToken, resolveGvcnClass, StudentController.updateStudent);
app.put('/api/students/:id/conduct', authenticateToken, resolveGvcnClass, StudentController.updateConduct);
app.post('/api/students/:id/calculate-gpa', authenticateToken, StudentController.calculateGPA);

// GradeBook Closure & Unlock Routes (MUST be before generic /api/gradebook routes)
app.get('/api/gradebook/closure',                authenticateToken, ClosureController.getStatus);
app.post('/api/gradebook/closure/submit',        authenticateToken, ClosureController.submitClosure);
app.post('/api/gradebook/closure/request-unlock', authenticateToken, ClosureController.requestUnlock);

// GradeBook Review Request Routes (MUST be before generic routes to avoid conflict)
app.post('/api/gradebook/review-request',  authenticateToken, GradeBookController.submitReviewRequest);
app.get('/api/gradebook/review-requests',  authenticateToken, GradeBookController.getReviewRequests);

// GradeBook Routes
app.get('/api/gradebook',               authenticateToken, resolveGvcnClass, GradeBookController.getGradeBook);
app.get('/api/gradebook/page-data',     authenticateToken, resolveGvcnClass, GradeBookController.getPageData);
app.post('/api/gradebook/save',         authenticateToken, resolveGvcnClass, GradeBookController.saveGrades);
app.post('/api/gradebook/save-spreadsheet', authenticateToken, resolveGvcnClass, GradeBookController.saveSpreadsheet);
app.post('/api/gradebook/lock',         authenticateToken, GradeBookController.lockGradeSheet);
app.post('/api/gradebook/unlock',       authenticateToken, GradeBookController.unlockGradeSheet);

// Attendance Routes
app.get('/api/attendance', authenticateToken, resolveGvcnClass, AttendanceController.getAttendance);
app.get('/api/attendance/summary', authenticateToken, AttendanceController.getAttendanceSummary);
app.post('/api/attendance/save', authenticateToken, resolveGvcnClass, AttendanceController.saveAttendance);

// Leave Requests Routes
app.get('/api/leave-requests', LeaveRequestController.getLeaveRequests);
app.post('/api/leave-requests', authenticateToken, LeaveRequestController.submitLeaveRequest);
app.put('/api/leave-requests/:id/approve', LeaveRequestController.approveLeaveRequest);

// Tuition Routes
app.get('/api/tuition', authenticateToken, TuitionController.getTuitions);
app.post('/api/tuition/pay', authenticateToken, TuitionController.payTuition);

// Class & Subject Routes
app.get('/api/classes', ClassController.getClasses);
app.post('/api/classes', ClassController.createClass);
app.put('/api/classes/:className/homeroom',    authenticateToken, requireBGH, ClassController.assignHomeroom);
app.delete('/api/classes/:className/homeroom', authenticateToken, requireBGH, ClassController.removeHomeroom);
app.get('/api/subjects', SubjectController.getSubjects);
app.post('/api/subjects', SubjectController.createSubject);

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

// Communication Routes (Sổ liên lạc)
app.get('/api/communication/contacts',     authenticateToken, CommunicationController.getContacts);
app.get('/api/communication/page-data',    authenticateToken, CommunicationController.getPageData);
app.get('/api/communication/students',     authenticateToken, CommunicationController.getStudents);
app.get('/api/communication/messages',     authenticateToken, CommunicationController.getThread);
app.post('/api/communication/notifications', authenticateToken, CommunicationController.sendNotification);
app.post('/api/communication/messages',    authenticateToken, CommunicationController.sendMessage);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server
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
    console.error('[SERVER ERROR] Kiểm tra cấu hình DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD trong .env');
    console.error('[SERVER ERROR] Server tiếp tục chạy nhưng chức năng đăng nhập sẽ không hoạt động cho đến khi DB sẵn sàng.');
  }
});
