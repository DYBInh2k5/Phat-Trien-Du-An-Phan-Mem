import { UserRepository } from '../repositories/UserRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { GradeBookRepository } from '../repositories/GradeBookRepository.js';
import { AttendanceRepository } from '../repositories/AttendanceRepository.js';
import { LeaveRequestRepository } from '../repositories/LeaveRequestRepository.js';
import { TuitionRepository } from '../repositories/TuitionRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import { SubjectRepository } from '../repositories/SubjectRepository.js';
import bcrypt from 'bcryptjs';

export async function seedDemoData() {
  console.log('[SEEDER] Seeding initial HTQLLH demo data into PostgreSQL...');

  try {
    // 1. Users
    const existingUsers = await UserRepository.findAll();
    if (existingUsers.length === 0) {
      const hashedPass = await bcrypt.hash('123456', 10);
      await UserRepository.create({ username: 'bgh.admin', password: hashedPass, fullName: 'Hiệu trưởng Trần Quốc Bảo', role: 'BGH' });
      await UserRepository.create({ username: 'gvcn.10a1', password: hashedPass, fullName: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN' });
      await UserRepository.create({ username: 'gv.an', password: hashedPass, fullName: 'Nguyễn Văn An (GV Toán)', role: 'GV' });
      await UserRepository.create({ username: 'hs.anh', password: hashedPass, fullName: 'Nguyễn Thị Ánh', role: 'HS' });
      await UserRepository.create({ username: 'ph.hs0001', password: hashedPass, fullName: 'Nguyễn Thị Hương (PH HS001)', role: 'PH' });
      console.log('[SEEDER] 5 Role accounts created.');
    }

    // 2. Classes
    const existingClasses = await ClassRepository.findAll();
    if (existingClasses.length === 0) {
      await ClassRepository.create({ className: '10A1', gradeLevel: 10, gvcnName: 'Lê Minh Châu' });
      await ClassRepository.create({ className: '10A2', gradeLevel: 10, gvcnName: 'Phạm Thị Dung' });
      await ClassRepository.create({ className: '11B1', gradeLevel: 11, gvcnName: 'Hoàng Văn Em' });
    }

    // 3. Subjects
    const existingSubjects = await SubjectRepository.findAll();
    if (existingSubjects.length === 0) {
      await SubjectRepository.create({ code: 'TOAN', name: 'Toán', credits: 2 });
      await SubjectRepository.create({ code: 'VAN', name: 'Ngữ văn', credits: 2 });
      await SubjectRepository.create({ code: 'ANH', name: 'Tiếng Anh', credits: 2 });
      await SubjectRepository.create({ code: 'LY', name: 'Vật lý', credits: 1 });
      await SubjectRepository.create({ code: 'HOA', name: 'Hóa học', credits: 1 });
    }

    // 4. Students
    const existingStudents = await StudentRepository.findAll();
    if (existingStudents.length === 0) {
      await StudentRepository.create({ studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', gender: 'Nữ', dob: '2008-05-12', className: '10A1', parentName: 'Nguyễn Thị Hương', parentPhone: '0901234567', gpa: 8.7, academicRank: 'Giỏi', status: 'ACTIVE' });
      await StudentRepository.create({ studentCode: 'HS002', fullName: 'Trần Văn Bảo', gender: 'Nam', dob: '2008-03-22', className: '10A1', parentName: 'Trần Văn Hùng', parentPhone: '0907654321', gpa: 6.8, academicRank: 'Khá', status: 'ACTIVE' });
      await StudentRepository.create({ studentCode: 'HS003', fullName: 'Lê Thị Cẩm', gender: 'Nữ', dob: '2008-11-10', className: '10A1', parentName: 'Lê Văn Tâm', parentPhone: '0912345678', gpa: 4.5, academicRank: 'Yếu', status: 'ACTIVE' });
      await StudentRepository.create({ studentCode: 'HS004', fullName: 'Phạm Hữu Dũng', gender: 'Nam', dob: '2008-01-15', className: '10A1', parentName: 'Phạm Thị Lan', parentPhone: '0922334455', gpa: 8.5, academicRank: 'Giỏi', status: 'ACTIVE' });
      await StudentRepository.create({ studentCode: 'HS005', fullName: 'Đặng Thị Giang', gender: 'Nữ', dob: '2008-07-08', className: '10A2', parentName: 'Đặng Văn Nam', parentPhone: '0933445566', gpa: 7.2, academicRank: 'Khá', status: 'ACTIVE' });
    }

    // 5. GradeBooks
    const existingGrades = await GradeBookRepository.findAll();
    if (existingGrades.length === 0) {
      await GradeBookRepository.save({ studentId: 1, studentCode: 'HS001', studentName: 'Nguyễn Thị Ánh', className: '10A1', subjectName: 'Toán', semester: 'HK1', schoolYear: '2024-2025', scoreOral: 9.0, score15m: 8.5, score1Hour: 8.0, scoreMidTerm: 8.5, scoreFinalTerm: 9.0, averageScore: 8.7, gradeLetter: 'Giỏi', status: 'APPROVED' });
      await GradeBookRepository.save({ studentId: 1, studentCode: 'HS001', studentName: 'Nguyễn Thị Ánh', className: '10A1', subjectName: 'Ngữ văn', semester: 'HK1', schoolYear: '2024-2025', scoreOral: 8.0, score15m: 8.0, score1Hour: 7.5, scoreMidTerm: 8.0, scoreFinalTerm: 8.5, averageScore: 8.1, gradeLetter: 'Giỏi', status: 'APPROVED' });
      await GradeBookRepository.save({ studentId: 2, studentCode: 'HS002', studentName: 'Trần Văn Bảo', className: '10A1', subjectName: 'Toán', semester: 'HK1', schoolYear: '2024-2025', scoreOral: 6.0, score15m: 6.5, score1Hour: 7.0, scoreMidTerm: 6.5, scoreFinalTerm: 7.0, averageScore: 6.7, gradeLetter: 'Khá', status: 'APPROVED' });
    }

    // 6. Attendances
    const existingAtt = await AttendanceRepository.findAll();
    if (existingAtt.length === 0) {
      await AttendanceRepository.save({ studentId: 1, studentCode: 'HS001', studentName: 'Nguyễn Thị Ánh', className: '10A1', attDate: '2024-11-14', status: 'PRESENT', note: 'Đúng giờ' });
      await AttendanceRepository.save({ studentId: 3, studentCode: 'HS003', studentName: 'Lê Thị Cẩm', className: '10A1', attDate: '2024-11-14', status: 'ABSENT_NO_PERMIT', note: 'Vắng không phép' });
    }

    // 7. LeaveRequests
    const existingLeave = await LeaveRequestRepository.findAll();
    if (existingLeave.length === 0) {
      await LeaveRequestRepository.create({ studentId: 1, studentCode: 'HS001', studentName: 'Nguyễn Thị Ánh', className: '10A1', fromDate: '2024-11-20', toDate: '2024-11-20', reason: 'Cháu bị sốt siêu vi, gia đình xin phép cho cháu nghỉ học 1 ngày.', status: 'PENDING' });
    }

    // 8. Tuitions
    const existingTuitions = await TuitionRepository.findAll();
    if (existingTuitions.length === 0) {
      await TuitionRepository.save({ studentCode: 'HS001', studentName: 'Nguyễn Thị Ánh', className: '10A1', semester: 'HK1', schoolYear: '2024-2025', amountDue: 1500000, amountPaid: 1500000, status: 'PAID', receiptNo: 'BL-2024-001' });
      await TuitionRepository.save({ studentCode: 'HS002', studentName: 'Trần Văn Bảo', className: '10A1', semester: 'HK1', schoolYear: '2024-2025', amountDue: 1500000, amountPaid: 0, status: 'UNPAID', receiptNo: null });
    }

    console.log('[SEEDER] Initial demo data seeded successfully.');
  } catch (err) {
    console.warn('[SEEDER WARNING] Seeder warning (will use in-memory data fallback if DB offline):', err.message);
  }
}
