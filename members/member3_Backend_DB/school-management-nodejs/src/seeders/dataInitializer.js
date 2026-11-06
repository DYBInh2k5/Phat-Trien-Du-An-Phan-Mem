/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js
 * Vị trí: Tầng Khởi tạo Dữ liệu (Database Seeder Layer)
 * Mô tả:
 *   - Khởi tạo đầy đủ dữ liệu mẫu ban đầu cho toàn bộ hệ thống HTQLLH.
 *   - Hỗ trợ 5 nhóm vai trò: BGH, GVCN, GV, HS, PH.
 *   - Đảm bảo idempotency (chạy lại an toàn không duplicate nhờ ON CONFLICT).
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * Khởi tạo dữ liệu mẫu cho hệ thống nếu CSDL chưa có hoặc cập nhật thêm.
 * @async
 * @function seedDemoData
 * @returns {Promise<void>}
 */
export async function seedDemoData() {
  console.log('[SEEDER] Seeding initial HTQLLH demo data into PostgreSQL...');

  try {
    const hashedPass = await bcrypt.hash('123456', 10);
    const demoPassAdmin = await bcrypt.hash('admin123', 10);
    const demoPassGvcn = await bcrypt.hash('gvcn123', 10);
    const demoPassGv = await bcrypt.hash('gv123', 10);
    const demoPassHs = await bcrypt.hash('hs123', 10);
    const demoPassPh = await bcrypt.hash('ph123', 10);

    // 1. Users
    const users = [
      { username: 'admin', password: demoPassAdmin, fullName: 'Hiệu trưởng Trần Quốc Bảo', role: 'BGH', email: 'admin@hsu.edu.vn' },
      { username: 'bgh.admin', password: hashedPass, fullName: 'Hiệu phó Nguyễn Văn Minh', role: 'BGH', email: 'minh.nv@hsu.edu.vn' },
      { username: 'gvcn01', password: demoPassGvcn, fullName: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.lm@hsu.edu.vn' },
      { username: 'gvcn.10a1', password: hashedPass, fullName: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.le@hsu.edu.vn' },
      { username: 'gvcn.10a2', password: hashedPass, fullName: 'Phạm Thị Dung (GVCN 10A2)', role: 'GVCN', email: 'dung.pt@hsu.edu.vn' },
      { username: 'gv01', password: demoPassGv, fullName: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.nv@hsu.edu.vn' },
      { username: 'gv.an', password: hashedPass, fullName: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.toan@hsu.edu.vn' },
      { username: 'gv.mai', password: hashedPass, fullName: 'Trần Thị Mai (GV Văn)', role: 'GV', email: 'mai.tt@hsu.edu.vn' },
      { username: 'hs001', password: demoPassHs, fullName: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.nt@student.hsu.edu.vn' },
      { username: 'hs.anh', password: hashedPass, fullName: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.hs001@student.hsu.edu.vn' },
      { username: 'ph001', password: demoPassPh, fullName: 'Nguyễn Thị Hương (PH em Ánh)', role: 'PH', email: 'huong.ph@gmail.com' },
      { username: 'ph.hs0001', password: hashedPass, fullName: 'Nguyễn Thị Hương (PH HS001)', role: 'PH', email: 'huong.parent@gmail.com' },
      { username: 'ph.hs0002', password: hashedPass, fullName: 'Trần Văn Hùng (PH HS002)', role: 'PH', email: 'hung.tran@gmail.com' }
    ];

    for (const u of users) {
      await query(`
        INSERT INTO users (username, password, full_name, role, email)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          email = EXCLUDED.email
      `, [u.username, u.password, u.fullName, u.role, u.email]);
    }

    // 2. Classes
    const classes = [
      { className: '10A1', gradeLevel: 10, gvcnName: 'Lê Minh Châu', gvcnUsername: 'gvcn01' },
      { className: '10A2', gradeLevel: 10, gvcnName: 'Phạm Thị Dung', gvcnUsername: 'gvcn.10a2' },
      { className: '11B1', gradeLevel: 11, gvcnName: 'Hoàng Văn Em', gvcnUsername: 'gv01' }
    ];

    for (const c of classes) {
      await query(`
        INSERT INTO school_classes (class_name, grade_level, gvcn_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (class_name) DO UPDATE SET
          grade_level = EXCLUDED.grade_level,
          gvcn_name = EXCLUDED.gvcn_name
      `, [c.className, c.gradeLevel, c.gvcnName]);

      await query(`
        UPDATE school_classes
        SET homeroom_teacher_id = (SELECT id FROM users WHERE username = $1 LIMIT 1)
        WHERE class_name = $2
      `, [c.gvcnUsername, c.className]);
    }

    // 3. Subjects
    const subjects = [
      { code: 'TOAN', name: 'Toán', credits: 2 },
      { code: 'VAN',  name: 'Ngữ văn', credits: 2 },
      { code: 'ANH',  name: 'Tiếng Anh', credits: 2 },
      { code: 'LY',   name: 'Vật lý', credits: 1 },
      { code: 'HOA',  name: 'Hóa học', credits: 1 },
      { code: 'SINH', name: 'Sinh học', credits: 1 },
      { code: 'SU',   name: 'Lịch sử', credits: 1 },
      { code: 'DIA',  name: 'Địa lý', credits: 1 },
      { code: 'GDCD', name: 'GDKT & Pháp luật', credits: 1 },
      { code: 'TIN',  name: 'Tin học', credits: 1 }
    ];

    for (const s of subjects) {
      await query(`
        INSERT INTO subjects (code, name, credits)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credits = EXCLUDED.credits
      `, [s.code, s.name, s.credits]);
    }

    // 4. Students
    const students = [
      { code: 'HS001', name: 'Nguyễn Thị Ánh', gender: 'Nữ', dob: '2008-05-12', class: '10A1', parent: 'Nguyễn Thị Hương', phone: '0901234567', gpa: 8.8, rank: 'Giỏi', status: 'ACTIVE' },
      { code: 'HS002', name: 'Trần Văn Bảo', gender: 'Nam', dob: '2008-03-22', class: '10A1', parent: 'Trần Văn Hùng', phone: '0907654321', gpa: 7.2, rank: 'Khá', status: 'ACTIVE' },
      { code: 'HS003', name: 'Lê Thị Cẩm', gender: 'Nữ', dob: '2008-11-10', class: '10A1', parent: 'Lê Văn Tâm', phone: '0912345678', gpa: 5.6, rank: 'Trung bình', status: 'ACTIVE' },
      { code: 'HS004', name: 'Phạm Hữu Dũng', gender: 'Nam', dob: '2008-01-15', class: '10A1', parent: 'Phạm Thị Lan', phone: '0922334455', gpa: 8.5, rank: 'Giỏi', status: 'ACTIVE' },
      { code: 'HS005', name: 'Đặng Thị Giang', gender: 'Nữ', dob: '2008-07-08', class: '10A1', parent: 'Đặng Văn Nam', phone: '0933445566', gpa: 7.8, rank: 'Khá', status: 'ACTIVE' },
      { code: 'HS006', name: 'Vũ Hoàng Hải', gender: 'Nam', dob: '2008-09-30', class: '10A1', parent: 'Vũ Quốc Khánh', phone: '0944556677', gpa: 9.1, rank: 'Xuất sắc', status: 'ACTIVE' },
      { code: 'HS007', name: 'Bùi Thị Kim', gender: 'Nữ', dob: '2008-12-04', class: '10A1', parent: 'Bùi Văn Long', phone: '0955667788', gpa: 6.9, rank: 'Khá', status: 'ACTIVE' },
      { code: 'HS008', name: 'Ngô Minh Khôi', gender: 'Nam', dob: '2008-04-18', class: '10A1', parent: 'Ngô Thanh Sơn', phone: '0966778899', gpa: 8.2, rank: 'Giỏi', status: 'ACTIVE' },
      { code: 'HS009', name: 'Lý Quốc Luân', gender: 'Nam', dob: '2008-08-25', class: '10A2', parent: 'Lý Văn Hải', phone: '0977889900', gpa: 7.5, rank: 'Khá', status: 'ACTIVE' },
      { code: 'HS010', name: 'Dương Thảo My', gender: 'Nữ', dob: '2008-02-14', class: '10A2', parent: 'Dương Văn Toàn', phone: '0988990011', gpa: 8.6, rank: 'Giỏi', status: 'ACTIVE' },
      { code: 'HS011', name: 'Hồ Quang Nam', gender: 'Nam', dob: '2008-06-19', class: '10A2', parent: 'Hồ Văn Định', phone: '0911223344', gpa: 6.4, rank: 'Trung bình', status: 'ACTIVE' },
      { code: 'HS012', name: 'Mai Phương Oanh', gender: 'Nữ', dob: '2007-10-05', class: '11B1', parent: 'Mai Văn Quân', phone: '0922446688', gpa: 8.9, rank: 'Giỏi', status: 'ACTIVE' }
    ];

    for (const st of students) {
      await query(`
        INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (student_code) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          gender = EXCLUDED.gender,
          dob = EXCLUDED.dob,
          class_name = EXCLUDED.class_name,
          parent_name = EXCLUDED.parent_name,
          parent_phone = EXCLUDED.parent_phone,
          gpa = EXCLUDED.gpa,
          academic_rank = EXCLUDED.academic_rank,
          status = EXCLUDED.status
      `, [st.code, st.name, st.gender, st.dob, st.class, st.parent, st.phone, st.gpa, st.rank, st.status]);
    }

    // 5. Parent-Student links
    await query(`
      INSERT INTO parent_students (parent_user_id, student_code, relationship)
      SELECT u.id, 'HS001', 'Mẹ' FROM users u WHERE u.username IN ('ph001', 'ph.hs0001')
      ON CONFLICT (parent_user_id, student_code) DO NOTHING
    `);
    await query(`
      INSERT INTO parent_students (parent_user_id, student_code, relationship)
      SELECT u.id, 'HS002', 'Bố' FROM users u WHERE u.username IN ('ph.hs0002')
      ON CONFLICT (parent_user_id, student_code) DO NOTHING
    `);

    console.log('[SEEDER] Initial demo data seeded successfully.');
  } catch (err) {
    console.warn('[SEEDER WARNING] Seeder skipped - DB may be unavailable:', err.message);
  }
}
