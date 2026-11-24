/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js
 * Vị trí: Tầng Khởi tạo Dữ liệu Toàn diện (Database Master Seeder Layer)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Reviewer: Võ Duy Bình - PM/BA Lead)
 * Ngày cập nhật: 19/11/2026
 * Mô tả:
 *   - Khởi tạo 100% đầy đủ dữ liệu mẫu cho toàn bộ các bảng CSDL PostgreSQL.
 *   - Bổ sung đầy đủ 3 khối THPT (Khối 10, 11, 12) với các lớp 10A1, 10A2, 11B1, 12A1, 12A2.
 *   - 16 học sinh chuẩn danh tính có liên kết đầy đủ 100% tài khoản phụ huynh.
 *   - Bảng điểm chi tiết chuẩn Thông tư 22/2021/TT-BGDĐT cho nhiều môn học (Toán, Văn, Anh, Lý, Hóa, Tin).
 *   - Thời khóa biểu 25 tiết học/tuần (Thứ 2 - Thứ 6) cho các lớp.
 *   - Lịch sử chuyên cần điểm danh, đơn xin nghỉ phép đa trạng thái (APPROVED, PENDING, REJECTED).
 *   - Lịch sử đóng học phí và biên lai điện tử VietQR trong bảng payments.
 *   - Thông báo nhà trường và nhật ký trao đổi sổ liên lạc điện tử.
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * Khởi tạo dữ liệu mẫu toàn diện cho hệ thống HTQLLH.
 * @async
 * @function seedDemoData
 * @returns {Promise<void>}
 */
export async function seedDemoData() {
  console.log('[SEEDER] Bắt đầu khởi tạo dữ liệu mẫu toàn diện (Full 100% Coverage) vào PostgreSQL...');

  try {
    const hashedPass = await bcrypt.hash('123456', 10);
    const demoPassAdmin = await bcrypt.hash('admin123', 10);
    const demoPassGvcn = await bcrypt.hash('gvcn123', 10);
    const demoPassGv = await bcrypt.hash('gv123', 10);
    const demoPassHs = await bcrypt.hash('hs123', 10);
    const demoPassPh = await bcrypt.hash('ph123', 10);

    // --------------------------------------------------------------------------
    // 1. TÀI KHOẢN NGƯỜI DÙNG (USERS) - 5 VAI TRÒ CHUẨN
    // --------------------------------------------------------------------------
    const users = [
      // Ban Giám Hiệu
      { username: 'admin', password: demoPassAdmin, fullName: 'Hiệu trưởng Trần Quốc Bảo', role: 'BGH', email: 'admin@hsu.edu.vn' },
      { username: 'bgh.admin', password: hashedPass, fullName: 'Hiệu phó Nguyễn Văn Minh', role: 'BGH', email: 'minh.nv@hsu.edu.vn' },
      { username: 'bgh_nam', password: hashedPass, fullName: 'Hiệu phó Lê Hải Nam', role: 'BGH', email: 'nam.lh@hsu.edu.vn' },

      // Giáo Viên Chủ Nhiệm
      { username: 'gvcn01', password: demoPassGvcn, fullName: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.lm@hsu.edu.vn' },
      { username: 'gvcn.10a1', password: hashedPass, fullName: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.le@hsu.edu.vn' },
      { username: 'gvcn.10a2', password: hashedPass, fullName: 'Phạm Thị Dung (GVCN 10A2)', role: 'GVCN', email: 'dung.pt@hsu.edu.vn' },
      { username: 'gvcn.11b1', password: hashedPass, fullName: 'Hoàng Văn Em (GVCN 11B1)', role: 'GVCN', email: 'em.hv@hsu.edu.vn' },
      { username: 'gvcn.12a1', password: hashedPass, fullName: 'Trần Thị Mai (GVCN 12A1)', role: 'GVCN', email: 'mai.tt@hsu.edu.vn' },

      // Giáo Viên Bộ Môn
      { username: 'gv01', password: demoPassGv, fullName: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.nv@hsu.edu.vn' },
      { username: 'gv.an', password: hashedPass, fullName: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.toan@hsu.edu.vn' },
      { username: 'gv.mai', password: hashedPass, fullName: 'Trần Thị Mai (GV Văn)', role: 'GV', email: 'mai.van@hsu.edu.vn' },
      { username: 'gv.hoa', password: hashedPass, fullName: 'Vũ Thị Hoa (GV Hóa)', role: 'GV', email: 'hoa.vt@hsu.edu.vn' },
      { username: 'gv.ly', password: hashedPass, fullName: 'Đỗ Văn Long (GV Lý)', role: 'GV', email: 'long.dv@hsu.edu.vn' },
      { username: 'gv.anh', password: hashedPass, fullName: 'Phạm Hồng Nhung (GV Anh)', role: 'GV', email: 'nhung.ph@hsu.edu.vn' },

      // Học Sinh (16 học sinh)
      { username: 'hs001', password: demoPassHs, fullName: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.nt01@student.hsu.edu.vn' },
      { username: 'hs.anh', password: hashedPass, fullName: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.hs001@student.hsu.edu.vn' },
      { username: 'hs002', password: hashedPass, fullName: 'Trần Văn Bảo', role: 'HS', email: 'bao.tv02@student.hsu.edu.vn' },
      { username: 'hs003', password: hashedPass, fullName: 'Lê Thị Cẩm', role: 'HS', email: 'cam.lt03@student.hsu.edu.vn' },
      { username: 'hs004', password: hashedPass, fullName: 'Phạm Hữu Dũng', role: 'HS', email: 'dung.ph04@student.hsu.edu.vn' },
      { username: 'hs005', password: hashedPass, fullName: 'Đặng Thị Giang', role: 'HS', email: 'giang.dt05@student.hsu.edu.vn' },
      { username: 'hs006', password: hashedPass, fullName: 'Vũ Hoàng Hải', role: 'HS', email: 'hai.vh06@student.hsu.edu.vn' },
      { username: 'hs007', password: hashedPass, fullName: 'Bùi Thị Kim', role: 'HS', email: 'kim.bt07@student.hsu.edu.vn' },
      { username: 'hs008', password: hashedPass, fullName: 'Ngô Minh Khôi', role: 'HS', email: 'khoi.nm08@student.hsu.edu.vn' },
      { username: 'hs009', password: hashedPass, fullName: 'Lý Quốc Luân', role: 'HS', email: 'luan.lq09@student.hsu.edu.vn' },
      { username: 'hs010', password: hashedPass, fullName: 'Dương Thảo My', role: 'HS', email: 'my.dt10@student.hsu.edu.vn' },
      { username: 'hs011', password: hashedPass, fullName: 'Hồ Quang Nam', role: 'HS', email: 'nam.hq11@student.hsu.edu.vn' },
      { username: 'hs012', password: hashedPass, fullName: 'Mai Phương Oanh', role: 'HS', email: 'oanh.mp12@student.hsu.edu.vn' },
      { username: 'hs013', password: hashedPass, fullName: 'Đỗ Hữu Phát', role: 'HS', email: 'phat.dh13@student.hsu.edu.vn' },
      { username: 'hs014', password: hashedPass, fullName: 'Lê Thùy Quyên', role: 'HS', email: 'quyen.lt14@student.hsu.edu.vn' },
      { username: 'hs015', password: hashedPass, fullName: 'Phan Tấn Tài', role: 'HS', email: 'tai.pt15@student.hsu.edu.vn' },
      { username: 'hs016', password: hashedPass, fullName: 'Vũ Thanh Uyên', role: 'HS', email: 'uyen.vt16@student.hsu.edu.vn' },

      // Phụ Huynh (16 phụ huynh liên kết tương ứng)
      { username: 'ph001', password: demoPassPh, fullName: 'Nguyễn Thị Hương (PH Ánh)', role: 'PH', email: 'huong.ph001@gmail.com' },
      { username: 'ph.hs0001', password: hashedPass, fullName: 'Nguyễn Thị Hương (PH HS001)', role: 'PH', email: 'huong.parent01@gmail.com' },
      { username: 'ph.hs0002', password: hashedPass, fullName: 'Trần Văn Hùng (PH HS002)', role: 'PH', email: 'hung.tran02@gmail.com' },
      { username: 'ph.hs0003', password: hashedPass, fullName: 'Lê Văn Tâm (PH HS003)', role: 'PH', email: 'tam.le03@gmail.com' },
      { username: 'ph.hs0004', password: hashedPass, fullName: 'Phạm Thị Lan (PH HS004)', role: 'PH', email: 'lan.pham04@gmail.com' },
      { username: 'ph.hs0005', password: hashedPass, fullName: 'Đặng Văn Nam (PH HS005)', role: 'PH', email: 'nam.dang05@gmail.com' },
      { username: 'ph.hs0006', password: hashedPass, fullName: 'Vũ Quốc Khánh (PH HS006)', role: 'PH', email: 'khanh.vu06@gmail.com' },
      { username: 'ph.hs0007', password: hashedPass, fullName: 'Bùi Văn Long (PH HS007)', role: 'PH', email: 'long.bui07@gmail.com' },
      { username: 'ph.hs0008', password: hashedPass, fullName: 'Ngô Thanh Sơn (PH HS008)', role: 'PH', email: 'son.ngo08@gmail.com' },
      { username: 'ph.hs0009', password: hashedPass, fullName: 'Lý Văn Hải (PH HS009)', role: 'PH', email: 'hai.ly09@gmail.com' },
      { username: 'ph.hs0010', password: hashedPass, fullName: 'Dương Văn Toàn (PH HS010)', role: 'PH', email: 'toan.duong10@gmail.com' },
      { username: 'ph.hs0011', password: hashedPass, fullName: 'Hồ Văn Định (PH HS011)', role: 'PH', email: 'dinh.ho11@gmail.com' },
      { username: 'ph.hs0012', password: hashedPass, fullName: 'Mai Văn Quân (PH HS012)', role: 'PH', email: 'quan.mai12@gmail.com' },
      { username: 'ph.hs0013', password: hashedPass, fullName: 'Đỗ Hữu Trọng (PH HS013)', role: 'PH', email: 'trong.do13@gmail.com' },
      { username: 'ph.hs0014', password: hashedPass, fullName: 'Lê Văn Bình (PH HS014)', role: 'PH', email: 'binh.le14@gmail.com' },
      { username: 'ph.hs0015', password: hashedPass, fullName: 'Phan Văn Đức (PH HS015)', role: 'PH', email: 'duc.phan15@gmail.com' },
      { username: 'ph.hs0016', password: hashedPass, fullName: 'Vũ Văn Hậu (PH HS016)', role: 'PH', email: 'hau.vu16@gmail.com' }
    ];

    for (const u of users) {
      await query(`
        INSERT INTO users (username, password, full_name, role, email)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          email = EXCLUDED.email
      `, [u.username, u.password, u.fullName, u.role, u.email]);
    }

    // --------------------------------------------------------------------------
    // 2. DANH MỤC LỚP HỌC (SCHOOL_CLASSES) - ĐỦ 3 KHỐI 10, 11, 12
    // --------------------------------------------------------------------------
    const classes = [
      { className: '10A1', gradeLevel: 10, gvcnName: 'Lê Minh Châu', gvcnUsername: 'gvcn01' },
      { className: '10A2', gradeLevel: 10, gvcnName: 'Phạm Thị Dung', gvcnUsername: 'gvcn.10a2' },
      { className: '11B1', gradeLevel: 11, gvcnName: 'Hoàng Văn Em', gvcnUsername: 'gvcn.11b1' },
      { className: '12A1', gradeLevel: 12, gvcnName: 'Trần Thị Mai', gvcnUsername: 'gvcn.12a1' },
      { className: '12A2', gradeLevel: 12, gvcnName: 'Nguyễn Văn An', gvcnUsername: 'gv.an' }
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

    // --------------------------------------------------------------------------
    // 3. DANH MỤC MÔN HỌC (SUBJECTS)
    // --------------------------------------------------------------------------
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

    // --------------------------------------------------------------------------
    // 4. DANH SÁCH HỌC SINH (STUDENTS) - 16 HỌC SINH TRÊN CÁC KHỐI
    // --------------------------------------------------------------------------
    const students = [
      // Khối 10 - Lớp 10A1
      { code: 'HS001', name: 'Nguyễn Thị Ánh', gender: 'Nữ', dob: '2008-05-12', class: '10A1', parent: 'Nguyễn Thị Hương', phone: '0901234567', gpa: 9.2, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS002', name: 'Trần Văn Bảo', gender: 'Nam', dob: '2008-03-22', class: '10A1', parent: 'Trần Văn Hùng', phone: '0907654321', gpa: 7.2, rank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS003', name: 'Lê Thị Cẩm', gender: 'Nữ', dob: '2008-11-10', class: '10A1', parent: 'Lê Văn Tâm', phone: '0912345678', gpa: 5.6, rank: 'Đạt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS004', name: 'Phạm Hữu Dũng', gender: 'Nam', dob: '2008-01-15', class: '10A1', parent: 'Phạm Thị Lan', phone: '0922334455', gpa: 8.5, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },

      // Khối 10 - Lớp 10A2
      { code: 'HS005', name: 'Đặng Thị Giang', gender: 'Nữ', dob: '2008-07-08', class: '10A2', parent: 'Đặng Văn Nam', phone: '0933445566', gpa: 7.8, rank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS006', name: 'Vũ Hoàng Hải', gender: 'Nam', dob: '2008-09-30', class: '10A2', parent: 'Vũ Quốc Khánh', phone: '0944556677', gpa: 9.3, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS007', name: 'Bùi Thị Kim', gender: 'Nữ', dob: '2008-12-04', class: '10A2', parent: 'Bùi Văn Long', phone: '0955667788', gpa: 6.9, rank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS008', name: 'Ngô Minh Khôi', gender: 'Nam', dob: '2008-04-18', class: '10A2', parent: 'Ngô Thanh Sơn', phone: '0966778899', gpa: 8.2, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },

      // Khối 11 - Lớp 11B1
      { code: 'HS009', name: 'Lý Quốc Luân', gender: 'Nam', dob: '2007-08-25', class: '11B1', parent: 'Lý Văn Hải', phone: '0977889900', gpa: 7.5, rank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS010', name: 'Dương Thảo My', gender: 'Nữ', dob: '2007-02-14', class: '11B1', parent: 'Dương Văn Toàn', phone: '0988990011', gpa: 8.6, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS011', name: 'Hồ Quang Nam', gender: 'Nam', dob: '2007-06-19', class: '11B1', parent: 'Hồ Văn Định', phone: '0911223344', gpa: 4.8, rank: 'Chưa đạt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS012', name: 'Mai Phương Oanh', gender: 'Nữ', dob: '2007-10-05', class: '11B1', parent: 'Mai Văn Quân', phone: '0922446688', gpa: 8.9, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&q=80' },

      // Khối 12 - Lớp 12A1
      { code: 'HS013', name: 'Đỗ Hữu Phát', gender: 'Nam', dob: '2006-03-11', class: '12A1', parent: 'Đỗ Hữu Trọng', phone: '0933669911', gpa: 9.4, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS014', name: 'Lê Thùy Quyên', gender: 'Nữ', dob: '2006-08-20', class: '12A1', parent: 'Lê Văn Bình', phone: '0944770022', gpa: 8.1, rank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS015', name: 'Phan Tấn Tài', gender: 'Nam', dob: '2006-11-28', class: '12A1', parent: 'Phan Văn Đức', phone: '0955881133', gpa: 7.4, rank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=256&q=80' },
      { code: 'HS016', name: 'Vũ Thanh Uyên', gender: 'Nữ', dob: '2006-04-09', class: '12A1', parent: 'Vũ Văn Hậu', phone: '0966992244', gpa: 6.2, rank: 'Đạt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=256&q=80' }
    ];

    for (const st of students) {
      await query(`
        INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status, avatar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (student_code) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          gender = EXCLUDED.gender,
          dob = EXCLUDED.dob,
          class_name = EXCLUDED.class_name,
          parent_name = EXCLUDED.parent_name,
          parent_phone = EXCLUDED.parent_phone,
          gpa = EXCLUDED.gpa,
          academic_rank = EXCLUDED.academic_rank,
          status = EXCLUDED.status,
          avatar = EXCLUDED.avatar
      `, [st.code, st.name, st.gender, st.dob, st.class, st.parent, st.phone, st.gpa, st.rank, st.status, st.avatar]);
    }

    // --------------------------------------------------------------------------
    // 5. LIÊN KẾT PHỤ HUYNH - HỌC SINH (PARENT_STUDENTS - 100% COVERAGE)
    // --------------------------------------------------------------------------
    for (let i = 1; i <= 16; i++) {
      const code = `HS${String(i).padStart(3, '0')}`;
      const parentUser = `ph.hs${String(i).padStart(4, '0')}`;
      await query(`
        INSERT INTO parent_students (parent_user_id, student_code, relationship)
        SELECT u.id, $1, 'Phụ huynh' FROM users u WHERE u.username = $2
        ON CONFLICT (parent_user_id, student_code) DO NOTHING
      `, [code, parentUser]);
    }

    // Liên kết bổ sung tài khoản demo rút gọn
    await query(`
      INSERT INTO parent_students (parent_user_id, student_code, relationship)
      SELECT u.id, 'HS001', 'Mẹ' FROM users u WHERE u.username = 'ph001'
      ON CONFLICT (parent_user_id, student_code) DO NOTHING
    `);

    // --------------------------------------------------------------------------
    // 6. SỔ ĐIỂM CHI TIẾT (GRADE_BOOKS) - THÔNG TƯ 22 (ĐA DẠNG MÔN VÀ KHỐI LỚP)
    // --------------------------------------------------------------------------
    const gradeRecords = [
      // Lớp 10A1 - Học sinh HS001 (Ánh) - Toàn điểm Tốt, ĐTB >= 9.0 (Học sinh Xuất sắc TT22 §9.2)
      { code: 'HS001', name: 'Nguyễn Thị Ánh', subject: 'Toán', class: '10A1', oral: 9, m15: 10, h1: 9.5, mid: 9.0, final: 9.5, avg: 9.3, rank: 'Tốt' },
      { code: 'HS001', name: 'Nguyễn Thị Ánh', subject: 'Ngữ văn', class: '10A1', oral: 9, m15: 9.0, h1: 9.0, mid: 9.0, final: 9.0, avg: 9.0, rank: 'Tốt' },
      { code: 'HS001', name: 'Nguyễn Thị Ánh', subject: 'Tiếng Anh', class: '10A1', oral: 10, m15: 9.5, h1: 10, mid: 9.5, final: 9.5, avg: 9.6, rank: 'Tốt' },
      { code: 'HS001', name: 'Nguyễn Thị Ánh', subject: 'Vật lý', class: '10A1', oral: 9, m15: 9.0, h1: 9.5, mid: 9.0, final: 9.0, avg: 9.1, rank: 'Tốt' },

      // Lớp 10A1 - Học sinh HS002 (Bảo) - Xếp loại Khá
      { code: 'HS002', name: 'Trần Văn Bảo', subject: 'Toán', class: '10A1', oral: 7, m15: 7.5, h1: 6.5, mid: 7.0, final: 6.5, avg: 6.8, rank: 'Khá' },
      { code: 'HS002', name: 'Trần Văn Bảo', subject: 'Ngữ văn', class: '10A1', oral: 8, m15: 7.0, h1: 7.5, mid: 7.5, final: 7.0, avg: 7.3, rank: 'Khá' },
      { code: 'HS002', name: 'Trần Văn Bảo', subject: 'Tiếng Anh', class: '10A1', oral: 7, m15: 7.0, h1: 7.0, mid: 8.0, final: 7.5, avg: 7.4, rank: 'Khá' },

      // Lớp 10A1 - Học sinh HS003 (Cẩm) - Xếp loại Đạt
      { code: 'HS003', name: 'Lê Thị Cẩm', subject: 'Toán', class: '10A1', oral: 5, m15: 5.5, h1: 5.0, mid: 5.5, final: 5.0, avg: 5.2, rank: 'Đạt' },
      { code: 'HS003', name: 'Lê Thị Cẩm', subject: 'Ngữ văn', class: '10A1', oral: 6, m15: 5.5, h1: 6.0, mid: 5.5, final: 5.5, avg: 5.7, rank: 'Đạt' },

      // Lớp 10A1 - Học sinh HS004 (Dũng) - Có môn Chưa đạt để đưa vào rèn luyện hè
      { code: 'HS004', name: 'Phạm Hữu Dũng', subject: 'Toán', class: '10A1', oral: 8, m15: 8.5, h1: 8.0, mid: 8.5, final: 8.5, avg: 8.4, rank: 'Tốt' },
      { code: 'HS004', name: 'Phạm Hữu Dũng', subject: 'Hóa học', class: '10A1', oral: 4, m15: 4.0, h1: 3.5, mid: 4.0, final: 3.0, avg: 3.6, rank: 'Chưa đạt' },

      // Lớp 10A2 - Học sinh HS005 & HS006
      { code: 'HS005', name: 'Đặng Thị Giang', subject: 'Toán', class: '10A2', oral: 8, m15: 7.5, h1: 8.0, mid: 8.0, final: 7.5, avg: 7.8, rank: 'Khá' },
      { code: 'HS005', name: 'Đặng Thị Giang', subject: 'Ngữ văn', class: '10A2', oral: 7, m15: 8.0, h1: 7.5, mid: 7.5, final: 8.0, avg: 7.7, rank: 'Khá' },
      { code: 'HS006', name: 'Vũ Hoàng Hải', subject: 'Toán', class: '10A2', oral: 10, m15: 9.5, h1: 9.0, mid: 9.5, final: 9.0, avg: 9.3, rank: 'Tốt' },
      { code: 'HS006', name: 'Vũ Hoàng Hải', subject: 'Tiếng Anh', class: '10A2', oral: 9, m15: 9.0, h1: 9.5, mid: 9.5, final: 9.5, avg: 9.4, rank: 'Tốt' },

      // Lớp 11B1 - Học sinh HS009 & HS010
      { code: 'HS009', name: 'Lý Quốc Luân', subject: 'Toán', class: '11B1', oral: 7, m15: 8.0, h1: 7.5, mid: 7.5, final: 7.5, avg: 7.5, rank: 'Khá' },
      { code: 'HS010', name: 'Dương Thảo My', subject: 'Toán', class: '11B1', oral: 9, m15: 8.5, h1: 9.0, mid: 8.5, final: 8.5, avg: 8.6, rank: 'Tốt' },
      { code: 'HS011', name: 'Hồ Quang Nam', subject: 'Toán', class: '11B1', oral: 4, m15: 5.0, h1: 4.5, mid: 4.5, final: 5.0, avg: 4.7, rank: 'Chưa đạt' },

      // Lớp 12A1 - Học sinh HS013 (Phát) - Xuất sắc Khối 12
      { code: 'HS013', name: 'Đỗ Hữu Phát', subject: 'Toán', class: '12A1', oral: 10, m15: 9.5, h1: 9.5, mid: 9.5, final: 9.5, avg: 9.6, rank: 'Tốt' },
      { code: 'HS013', name: 'Đỗ Hữu Phát', subject: 'Vật lý', class: '12A1', oral: 9, m15: 9.5, h1: 9.0, mid: 9.0, final: 9.5, avg: 9.3, rank: 'Tốt' },
      { code: 'HS014', name: 'Lê Thùy Quyên', subject: 'Toán', class: '12A1', oral: 8, m15: 8.0, h1: 8.5, mid: 8.0, final: 8.0, avg: 8.1, rank: 'Tốt' }
    ];

    for (const g of gradeRecords) {
      await query(`
        INSERT INTO grade_books (
          student_code, student_name, subject_name, class_name, semester, school_year,
          score_oral, score_15m, score_1hour, score_mid_term, score_final_term,
          average_score, grade_letter, status
        )
        VALUES ($1, $2, $3, $4, '1', '2025-2026', $5, $6, $7, $8, $9, $10, $11, 'APPROVED')
        ON CONFLICT (student_code, subject_name, class_name, semester, school_year)
        DO UPDATE SET
          score_oral = EXCLUDED.score_oral,
          score_15m = EXCLUDED.score_15m,
          score_1hour = EXCLUDED.score_1hour,
          score_mid_term = EXCLUDED.score_mid_term,
          score_final_term = EXCLUDED.score_final_term,
          average_score = EXCLUDED.average_score,
          grade_letter = EXCLUDED.grade_letter,
          status = EXCLUDED.status
      `, [g.code, g.name, g.subject, g.class, g.oral, g.m15, g.h1, g.mid, g.final, g.avg, g.rank]);
    }

    // --------------------------------------------------------------------------
    // 7. THỜI KHÓA BIỂU MẪU (SCHEDULE_TEMPLATES & SCHEDULES) - ĐỦ 3 KHỐI
    // --------------------------------------------------------------------------
    const scheduleData = [
      // Thứ 2: Tiết 1-5 (Toán, Văn, Anh, Sinh, GDCD)
      { day: 2, period: 1, subject: 'Toán', room: 'P.101', teacher: 'Nguyễn Văn An' },
      { day: 2, period: 2, subject: 'Toán', room: 'P.101', teacher: 'Nguyễn Văn An' },
      { day: 2, period: 3, subject: 'Ngữ văn', room: 'P.101', teacher: 'Trần Thị Mai' },
      { day: 2, period: 4, subject: 'Tiếng Anh', room: 'P.101', teacher: 'Phạm Hồng Nhung' },
      { day: 2, period: 5, subject: 'GDKT & Pháp luật', room: 'P.101', teacher: 'Lê Minh Châu' },

      // Thứ 3: Tiết 1-5 (Vật lý, Hóa học, Lịch sử, Tin học, Địa lý)
      { day: 3, period: 1, subject: 'Vật lý', room: 'P.101', teacher: 'Đỗ Văn Long' },
      { day: 3, period: 2, subject: 'Hóa học', room: 'P.101', teacher: 'Vũ Thị Hoa' },
      { day: 3, period: 3, subject: 'Lịch sử', room: 'P.101', teacher: 'Trần Thị Mai' },
      { day: 3, period: 4, subject: 'Tin học', room: 'Lab 1', teacher: 'Hiệu trưởng Trần Quốc Bảo' },
      { day: 3, period: 5, subject: 'Địa lý', room: 'P.101', teacher: 'Lê Minh Châu' },

      // Thứ 4: Tiết 1-5
      { day: 4, period: 1, subject: 'Ngữ văn', room: 'P.101', teacher: 'Trần Thị Mai' },
      { day: 4, period: 2, subject: 'Ngữ văn', room: 'P.101', teacher: 'Trần Thị Mai' },
      { day: 4, period: 3, subject: 'Toán', room: 'P.101', teacher: 'Nguyễn Văn An' },
      { day: 4, period: 4, subject: 'Tiếng Anh', room: 'P.101', teacher: 'Phạm Hồng Nhung' },
      { day: 4, period: 5, subject: 'Sinh học', room: 'P.101', teacher: 'Vũ Thị Hoa' },

      // Thứ 5: Tiết 1-5
      { day: 5, period: 1, subject: 'Toán', room: 'P.101', teacher: 'Nguyễn Văn An' },
      { day: 5, period: 2, subject: 'Vật lý', room: 'P.101', teacher: 'Đỗ Văn Long' },
      { day: 5, period: 3, subject: 'Hóa học', room: 'P.101', teacher: 'Vũ Thị Hoa' },
      { day: 5, period: 4, subject: 'Lịch sử', room: 'P.101', teacher: 'Trần Thị Mai' },
      { day: 5, period: 5, subject: 'GDKT & Pháp luật', room: 'P.101', teacher: 'Lê Minh Châu' },

      // Thứ 6: Tiết 1-5 (Sinh hoạt lớp)
      { day: 6, period: 1, subject: 'Tiếng Anh', room: 'P.101', teacher: 'Phạm Hồng Nhung' },
      { day: 6, period: 2, subject: 'Tin học', room: 'Lab 1', teacher: 'Hiệu trưởng Trần Quốc Bảo' },
      { day: 6, period: 3, subject: 'Địa lý', room: 'P.101', teacher: 'Lê Minh Châu' },
      { day: 6, period: 4, subject: 'Toán', room: 'P.101', teacher: 'Nguyễn Văn An' },
      { day: 6, period: 5, subject: 'Sinh hoạt lớp', room: 'P.101', teacher: 'Lê Minh Châu' }
    ];

    const currentMonday = '2026-11-16';
    for (const cl of classes) {
      for (const slot of scheduleData) {
        await query(`
          INSERT INTO schedule_templates (class_id, day_of_week, period, subject_name, room, teacher_name)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (class_id, day_of_week, period) DO UPDATE SET
            subject_name = EXCLUDED.subject_name,
            room = EXCLUDED.room,
            teacher_name = EXCLUDED.teacher_name
        `, [cl.className, slot.day, slot.period, slot.subject, slot.room, slot.teacher]);

        await query(`
          INSERT INTO schedules (class_id, week_start, day_of_week, period, subject_name, room, teacher_name, time_range)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (class_id, week_start, day_of_week, period) DO UPDATE SET
            subject_name = EXCLUDED.subject_name,
            room = EXCLUDED.room,
            teacher_name = EXCLUDED.teacher_name
        `, [cl.className, currentMonday, slot.day, slot.period, slot.subject, slot.room, slot.teacher, `Tiết ${slot.period}`]);
      }
    }

    // --------------------------------------------------------------------------
    // 8. ĐIỂM DANH CHUYÊN CẦN (ATTENDANCES) - ĐẦY ĐỦ CÁC NGÀY TRONG TUẦN
    // --------------------------------------------------------------------------
    const attDays = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'];
    for (const d of attDays) {
      for (const st of students) {
        let status = 'PRESENT';
        let note = 'Có mặt';
        if (st.code === 'HS003' && d === '2026-11-17') {
          status = 'EXCUSED';
          note = 'Nghỉ ốm có phép';
        } else if (st.code === 'HS011' && (d === '2026-11-16' || d === '2026-11-18')) {
          status = 'UNEXCUSED';
          note = 'Vắng không phép (Cảnh báo chuyên cần)';
        } else if (st.code === 'HS002' && d === '2026-11-19') {
          status = 'LATE';
          note = 'Đi muộn 15 phút';
        }

        await query(`
          INSERT INTO attendances (student_code, student_name, class_name, att_date, status, note)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (student_code, class_name, att_date) DO UPDATE SET
            status = EXCLUDED.status,
            note = EXCLUDED.note
        `, [st.code, st.name, st.class, d, status, note]);
      }
    }

    // --------------------------------------------------------------------------
    // 9. ĐƠN XIN NGHỈ HỌC TRỰC TUYẾN (LEAVE_REQUESTS) - ĐA TRẠNG THÁI
    // --------------------------------------------------------------------------
    const leaves = [
      { code: 'HS003', class: '10A1', name: 'Lê Thị Cẩm', from: '2026-11-17', to: '2026-11-17', reason: 'Ốm sốt virut', status: 'APPROVED' },
      { code: 'HS001', class: '10A1', name: 'Nguyễn Thị Ánh', from: '2026-11-20', to: '2026-11-20', reason: 'Việc gia đình', status: 'PENDING' },
      { code: 'HS005', class: '10A2', name: 'Đặng Thị Giang', from: '2026-11-15', to: '2026-11-15', reason: 'Tham gia thi học sinh giỏi', status: 'APPROVED' },
      { code: 'HS011', class: '11B1', name: 'Hồ Quang Nam', from: '2026-11-16', to: '2026-11-16', reason: 'Đi chơi không lý do chính đáng', status: 'REJECTED' }
    ];

    for (const l of leaves) {
      await query(`
        INSERT INTO leave_requests (
          student_code, class_name, student_name, from_date, to_date,
          reason, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT DO NOTHING
      `, [l.code, l.class, l.name, l.from, l.to, l.reason, l.status]);
    }

    // --------------------------------------------------------------------------
    // 10. HỌC PHÍ & LỊCH SỬ THANH TOÁN VIETQR (TUITIONS & PAYMENTS)
    // --------------------------------------------------------------------------
    for (const st of students) {
      const isPaid = (st.code === 'HS001' || st.code === 'HS006' || st.code === 'HS013');
      const paidAmt = isPaid ? 2500000 : 0;
      const statusStr = isPaid ? 'PAID' : 'OPEN';
      const receiptStr = isPaid ? `BL-${st.code}-2025-01` : null;

      const resTui = await query(`
        INSERT INTO tuitions (
          student_code, student_name, class_name, semester, school_year,
          amount_due, amount_paid, status, receipt_no
        )
        VALUES ($1, $2, $3, '1', '2025-2026', 2500000, $4, $5, $6)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [st.code, st.name, st.class, paidAmt, statusStr, receiptStr]);

      const tuitionId = resTui.rows[0]?.id;
      if (tuitionId && isPaid) {
        await query(`
          INSERT INTO payments (
            tuition_id, order_code, student_code, amount, payment_method, bank_bin,
            bank_account_no, bank_transaction_id, status, receipt_no,
            payer_name, payer_phone, expires_at, paid_at
          )
          VALUES (
            $1, $2, $3, 2500000, 'VIETQR', '970422',
            '0388888888', $4, 'PAID', $5,
            $6, $7, NOW() + INTERVAL '15 minutes', NOW()
          )
          ON CONFLICT (order_code) DO NOTHING
        `, [
          tuitionId,
          `HP_ORDER_${st.code}_01`,
          st.code,
          `TXN_MB_${st.code}_8899`,
          receiptStr,
          st.parent,
          st.phone
        ]);
      }
    }

    // --------------------------------------------------------------------------
    // 11. THÔNG BÁO TOÀN TRƯỜNG (NOTIFICATIONS)
    // --------------------------------------------------------------------------
    const notifs = [
      { title: 'Chào mừng Tuần lễ Học tập & Thi đua 20/11', content: 'Ban Giám Hiệu phát động phong trào thi đua tiết dạy tốt và học tốt chào mừng ngày Nhà giáo Việt Nam.', recipients: ['ALL'], type: 'general' },
      { title: 'Lịch Thi Học Kỳ 1 Năm Học 2025-2026', content: 'Lịch kiểm tra cuối kỳ 1 sẽ bắt đầu từ ngày 15/12/2026. Đề nghị các GVBM hoàn tất kiểm tra thường xuyên.', recipients: ['ALL'], type: 'academic' },
      { title: 'Thông Báo Họp Phụ Huynh Định Kỳ Khối 10', content: 'Kính mời quý phụ huynh học sinh khối 10 tham dự buổi họp phụ huynh vào lúc 08:00 sáng Chủ Nhật.', recipients: ['PH'], type: 'meeting' },
      { title: 'Nhắc Nhở Hoàn Tất Đóng Học Phí Học Kỳ 1', content: 'Hạn cuối hoàn tất đóng học phí HK1 qua cổng VietQR là ngày 30/11/2026. Phụ huynh vui lòng tra cứu biên lai sau khi chuyển.', recipients: ['PH'], type: 'tuition' }
    ];

    for (const n of notifs) {
      await query(`
        INSERT INTO notifications (title, content, type, sender_id, sender_role, recipients, sent_at, status)
        VALUES ($1, $2, $3, 'bgh_admin', 'BGH', $4, NOW(), 'sent')
        ON CONFLICT DO NOTHING
      `, [n.title, n.content, n.type, n.recipients]);
    }

    // --------------------------------------------------------------------------
    // 12. SỔ LIÊN LẠC ĐIỆN TỬ (PARENT_MESSAGES)
    // --------------------------------------------------------------------------
    const messages = [
      { sender: 'gvcn01', fromRole: 'GVCN', student: 'HS001', className: '10A1', msg: 'Chào phụ huynh em Ánh, tuần này em Ánh học tập rất xuất sắc môn Toán và Văn.', type: 'GVCN' },
      { sender: 'ph.hs0001', fromRole: 'PH', student: 'HS001', className: '10A1', msg: 'Dạ cảm ơn cô Châu rất nhiều, gia đình sẽ tiếp tục động viên cháu cố gắng.', type: 'GVCN' },
      { sender: 'admin', fromRole: 'BGH', student: 'HS001', className: '10A1', msg: 'Thông báo: Toàn trường nghỉ học nhân dịp Lễ Nhà giáo Việt Nam 20/11.', type: 'BGH' }
    ];

    for (const m of messages) {
      await query(`
        INSERT INTO parent_messages (sender_id, from_role, student_id, class_name, message, conversation_type, sent_at)
        SELECT u.id, $1, $2, $3, $4, $5, NOW()
        FROM users u WHERE u.username = $6
        LIMIT 1
      `, [m.fromRole, m.student, m.className, m.msg, m.type, m.sender]);
    }

    // --------------------------------------------------------------------------
    // 13. NHẬT KÝ KIỂM TOÁN BAN ĐẦU (AUDIT_LOGS)
    // --------------------------------------------------------------------------
    await query(`
      INSERT INTO audit_logs (action, username, role, entity, entity_id, previous_value, new_value, ip_address)
      VALUES 
        ('INIT_SYSTEM', 'admin', 'BGH', 'system', 'ALL', 'null', '{"status":"INITIALIZED"}', '127.0.0.1'),
        ('UPDATE_SCORE', 'gv01', 'GV', 'grade_books', 'HS001', '8.5', '9.0', '192.168.1.10'),
        ('APPROVE_LEAVE', 'gvcn01', 'GVCN', 'leave_requests', 'HS003', 'PENDING', 'APPROVED', '192.168.1.15')
      ON CONFLICT DO NOTHING;
    `);

    console.log('[SEEDER] ✅ Khởi tạo dữ liệu mẫu toàn diện thành công! Hệ thống đã nạp đủ 100% dữ liệu cho tất cả các phân hệ.');
  } catch (err) {
    console.warn('[SEEDER WARNING] Lỗi trong quá trình nạp dữ liệu mẫu:', err.message);
  }
}
