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
import { authenticateToken } from './src/middleware/authMiddleware.js';
import { forgotPasswordLimiter, resetPasswordLimiter } from './src/middleware/rateLimiters.js';
dotenv.config();

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.get('/api/students', StudentController.getStudents);
app.get('/api/students/:id', StudentController.getStudentById);
app.post('/api/students', StudentController.createStudent);
app.put('/api/students/:id', StudentController.updateStudent);
app.post('/api/students/:id/calculate-gpa', StudentController.calculateGPA);

// GradeBook Routes
app.get('/api/gradebook',               GradeBookController.getGradeBook);
app.get('/api/gradebook/page-data',     authenticateToken, GradeBookController.getPageData);
app.post('/api/gradebook/save',         GradeBookController.saveGrades);
app.post('/api/gradebook/save-spreadsheet', authenticateToken, GradeBookController.saveSpreadsheet);
app.post('/api/gradebook/lock',         GradeBookController.lockGradeSheet);
app.post('/api/gradebook/unlock',       GradeBookController.unlockGradeSheet);

// Attendance Routes
app.get('/api/attendance', AttendanceController.getAttendance);
app.get('/api/attendance/summary', AttendanceController.getAttendanceSummary);
app.post('/api/attendance/save', AttendanceController.saveAttendance);

// Leave Requests Routes
app.get('/api/leave-requests', LeaveRequestController.getLeaveRequests);
app.post('/api/leave-requests', LeaveRequestController.submitLeaveRequest);
app.put('/api/leave-requests/:id/approve', LeaveRequestController.approveLeaveRequest);

// Tuition Routes
app.get('/api/tuition', TuitionController.getTuitions);
app.post('/api/tuition/pay', TuitionController.payTuition);

// Class & Subject Routes
app.get('/api/classes', ClassController.getClasses);
app.post('/api/classes', ClassController.createClass);
app.get('/api/subjects', SubjectController.getSubjects);
app.post('/api/subjects', SubjectController.createSubject);

// Dashboard Routes
app.get('/api/dashboard/bgh', authenticateToken, DashboardController.getBGHDashboard);

// Schedule Routes
app.get('/api/schedules',    authenticateToken, ScheduleController.getSchedulePageData);
app.post('/api/schedules',   authenticateToken, ScheduleController.saveSlot);
app.delete('/api/schedules', authenticateToken, ScheduleController.deleteSlot);

// Report Routes (BGH)
app.get('/api/reports/bgh',             authenticateToken, ReportController.getReportData);
app.post('/api/reports/bgh/approve',    authenticateToken, ReportController.approveClass);
app.post('/api/reports/bgh/lock-all',   authenticateToken, ReportController.lockAll);

// User Management Routes (Settings)
app.get('/api/users',                   authenticateToken, UserController.getUsers);
app.post('/api/users',                  authenticateToken, UserController.createUser);
app.put('/api/users/:id',               authenticateToken, UserController.updateUser);
app.patch('/api/users/:id/deactivate',  authenticateToken, UserController.deactivateUser);
app.delete('/api/users/:id',            authenticateToken, UserController.deleteUser);

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
