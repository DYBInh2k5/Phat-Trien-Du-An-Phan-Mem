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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middlewares
app.use(cors());
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

// Auth Routes
app.post('/api/auth/login', AuthController.login);

// Students Routes
app.get('/api/students', StudentController.getStudents);
app.get('/api/students/:id', StudentController.getStudentById);
app.post('/api/students', StudentController.createStudent);
app.put('/api/students/:id', StudentController.updateStudent);
app.post('/api/students/:id/calculate-gpa', StudentController.calculateGPA);

// GradeBook Routes
app.get('/api/gradebook', GradeBookController.getGradeBook);
app.post('/api/gradebook/save', GradeBookController.saveGrades);
app.post('/api/gradebook/lock', GradeBookController.lockGradeSheet);
app.post('/api/gradebook/unlock', GradeBookController.unlockGradeSheet);

// Attendance Routes
app.get('/api/attendance', AttendanceController.getAttendance);
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

  await initDatabaseSchema();
  await seedDemoData();
});
