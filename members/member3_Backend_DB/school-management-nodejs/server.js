/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/server.js
 * Vai trò: Điểm Khởi Động & Gốc Cấu Thành Hệ Thống (Composition Root)
 * Kiến trúc: Clean Architecture - Tầng Ngoại Vi (Frameworks & Drivers)
 * Cổng lắng nghe mặc định: 8081
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

// Đọc cấu hình biến môi trường từ tệp .env
dotenv.config();

// Khởi tạo đối tượng ứng dụng Express
const app = express();
const PORT = process.env.PORT || 8081;

// ------------------------------------------------------------------------------
// 1. CẤU HÌNH CÁC PHẦN MỀM TRUNG GIAN (MIDDLEWARES)
// ------------------------------------------------------------------------------
// Cho phép tất cả các nguồn gốc (Cross-Origin Resource Sharing) kết nối từ Frontend Vite (port 5173)
app.use(cors());

// Tự động phân tích các tải trọng gửi lên có định dạng JSON vào đối tượng req.body
app.use(express.json());

// Middleware ghi vết nhật ký truy cập (Request Logger) hỗ trợ giám sát và gỡ lỗi
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

// ------------------------------------------------------------------------------
// 3. ĐĂNG KÝ CÁC TUYẾN ĐƯỜNG RESTFUL API THEO CHUYÊN ĐỀ
// ------------------------------------------------------------------------------

// Phân hệ 1: Xác thực & Đăng nhập người dùng (Authentication)
app.post('/api/auth/login', AuthController.login);

// Phân hệ 2: Quản lý hồ sơ học sinh (Students Management)
app.get('/api/students', StudentController.getStudents);
app.get('/api/students/:id', StudentController.getStudentById);
app.post('/api/students', StudentController.createStudent);
app.put('/api/students/:id', StudentController.updateStudent);
app.post('/api/students/:id/calculate-gpa', StudentController.calculateGPA);

// Phân hệ 3: Sổ điểm điện tử theo Thông tư 22 (GradeBook Management)
app.get('/api/gradebook', GradeBookController.getGradeBook);
app.post('/api/gradebook/save', GradeBookController.saveGrades);
app.post('/api/gradebook/lock', GradeBookController.lockGradeSheet);
app.post('/api/gradebook/unlock', GradeBookController.unlockGradeSheet);

// Phân hệ 4: Điểm danh chuyên cần học sinh (Attendance Tracking)
app.get('/api/attendance', AttendanceController.getAttendance);
app.post('/api/attendance/save', AttendanceController.saveAttendance);

// Phân hệ 5: Sổ liên lạc & Duyệt đơn xin nghỉ phép (Leave Requests & Portal)
app.get('/api/leave-requests', LeaveRequestController.getLeaveRequests);
app.post('/api/leave-requests', LeaveRequestController.submitLeaveRequest);
app.put('/api/leave-requests/:id/approve', LeaveRequestController.approveLeaveRequest);

// Phân hệ 6: Quản lý thu học phí (Tuition Management)
app.get('/api/tuition', TuitionController.getTuitions);
app.post('/api/tuition/pay', TuitionController.payTuition);

// Phân hệ 7 & 8: Danh mục Lớp học & Môn học (Classes & Subjects)
app.get('/api/classes', ClassController.getClasses);
app.post('/api/classes', ClassController.createClass);
app.get('/api/subjects', SubjectController.getSubjects);
app.post('/api/subjects', SubjectController.createSubject);

// ------------------------------------------------------------------------------
// 4. BỘ XỬ LÝ LỖI TẬP TRUNG (GLOBAL ERROR HANDLERS)
// ------------------------------------------------------------------------------

// Bắt các tuyến đường không tồn tại (HTTP 404 Not Found)
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
// ------------------------------------------------------------------------------
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`  HTQLLH Node.js Express Backend Server Running!`);
  console.log(`  URL: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);

  // Tự động kiểm tra và tạo 8 bảng CSDL nếu chưa có
  await initDatabaseSchema();
  // Nạp 45 học sinh mẫu và cấu hình điểm nếu bảng đang rỗng
  await seedDemoData();
});
