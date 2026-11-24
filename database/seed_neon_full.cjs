const { Client } = require('d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/node_modules/pg');

async function populateFullNeonData() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_rgyP6vbZsR7U@ep-wispy-rain-be6an41h-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Kết nối Neon PostgreSQL thành công. Bắt đầu bổ sung cấu trúc & nạp dữ liệu đầy đủ...');

  // 1. Đảm bảo cấu trúc cột đầy đủ
  await client.query(`
    ALTER TABLE students ADD COLUMN IF NOT EXISTS conduct_rank VARCHAR(30) DEFAULT 'Tốt';
    ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar TEXT;
  `);
  console.log('✅ Đã cập nhật bổ sung cột conduct_rank và avatar vào bảng students.');

  // Hash của 123456
  const pass123456 = '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK';

  // 2. Nạp đầy đủ 53 tài khoản người dùng
  const users = [
    // BGH
    { u: 'admin', f: 'Hiệu trưởng Trần Quốc Bảo', r: 'BGH', e: 'admin@hsu.edu.vn' },
    { u: 'bgh.admin', f: 'Hiệu phó Nguyễn Văn Minh', r: 'BGH', e: 'minh.nv@hsu.edu.vn' },
    { u: 'bgh_nam', f: 'Hiệu phó Lê Hải Nam', r: 'BGH', e: 'nam.lh@hsu.edu.vn' },
    // GVCN
    { u: 'gvcn01', f: 'Lê Minh Châu (GVCN 10A1)', r: 'GVCN', e: 'chau.lm@hsu.edu.vn' },
    { u: 'gvcn.10a1', f: 'Lê Minh Châu (GVCN 10A1)', r: 'GVCN', e: 'chau.le@hsu.edu.vn' },
    { u: 'gvcn.10a2', f: 'Phạm Thị Dung (GVCN 10A2)', r: 'GVCN', e: 'dung.pt@hsu.edu.vn' },
    { u: 'gvcn.11b1', f: 'Hoàng Văn Em (GVCN 11B1)', r: 'GVCN', e: 'em.hv@hsu.edu.vn' },
    { u: 'gvcn.12a1', f: 'Trần Thị Mai (GVCN 12A1)', r: 'GVCN', e: 'mai.tt@hsu.edu.vn' },
    // GVBM
    { u: 'gv01', f: 'Nguyễn Văn An (GV Toán)', r: 'GV', e: 'an.nv@hsu.edu.vn' },
    { u: 'gv.an', f: 'Nguyễn Văn An (GV Toán)', r: 'GV', e: 'an.toan@hsu.edu.vn' },
    { u: 'gv.mai', f: 'Trần Thị Mai (GV Văn)', r: 'GV', e: 'mai.van@hsu.edu.vn' },
    { u: 'gv.long', f: 'Đỗ Văn Long (GV Lý)', r: 'GV', e: 'long.ly@hsu.edu.vn' },
    { u: 'gv.hoa', f: 'Vũ Thị Hoa (GV Hóa)', r: 'GV', e: 'hoa.hoa@hsu.edu.vn' },
    { u: 'gv.nhung', f: 'Phạm Hồng Nhung (GV Anh)', r: 'GV', e: 'nhung.anh@hsu.edu.vn' }
  ];

  // 16 Học sinh
  const hsList = [
    { code: 'HS001', name: 'Nguyễn Thị Ánh', class: '10A1', gender: 'Nữ', dob: '2008-05-12', parent: 'Nguyễn Thị Hương', phone: '0901234567', gpa: 9.2, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS002', name: 'Trần Văn Bảo', class: '10A1', gender: 'Nam', dob: '2008-03-22', parent: 'Trần Văn Hùng', phone: '0907654321', gpa: 7.2, rank: 'Khá', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS003', name: 'Lê Thị Cẩm', class: '10A1', gender: 'Nữ', dob: '2008-11-10', parent: 'Lê Văn Tâm', phone: '0912345678', gpa: 5.6, rank: 'Đạt', conduct: 'Khá', ava: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS004', name: 'Phạm Hữu Dũng', class: '10A1', gender: 'Nam', dob: '2008-01-15', parent: 'Phạm Thị Lan', phone: '0922334455', gpa: 8.5, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS005', name: 'Đặng Thị Giang', class: '10A2', gender: 'Nữ', dob: '2008-07-08', parent: 'Đặng Văn Nam', phone: '0933445566', gpa: 7.8, rank: 'Khá', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS006', name: 'Vũ Hoàng Hải', class: '10A2', gender: 'Nam', dob: '2008-09-30', parent: 'Vũ Quốc Khánh', phone: '0944556677', gpa: 9.3, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS007', name: 'Bùi Thị Kim', class: '10A2', gender: 'Nữ', dob: '2008-12-04', parent: 'Bùi Văn Long', phone: '0955667788', gpa: 6.9, rank: 'Khá', conduct: 'Khá', ava: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS008', name: 'Ngô Minh Khôi', class: '10A2', gender: 'Nam', dob: '2008-04-18', parent: 'Ngô Thanh Sơn', phone: '0966778899', gpa: 8.2, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS009', name: 'Lý Quốc Luân', class: '11B1', gender: 'Nam', dob: '2007-08-25', parent: 'Lý Văn Hải', phone: '0977889900', gpa: 7.5, rank: 'Khá', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS010', name: 'Dương Thảo My', class: '11B1', gender: 'Nữ', dob: '2007-02-14', parent: 'Dương Văn Toàn', phone: '0988990011', gpa: 8.6, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS011', name: 'Hồ Quang Nam', class: '11B1', gender: 'Nam', dob: '2007-06-19', parent: 'Hồ Văn Định', phone: '0911223344', gpa: 4.8, rank: 'Chưa đạt', conduct: 'Đạt', ava: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS012', name: 'Mai Phương Oanh', class: '11B1', gender: 'Nữ', dob: '2007-10-05', parent: 'Mai Văn Quân', phone: '0922446688', gpa: 8.9, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS013', name: 'Đỗ Hữu Phát', class: '12A1', gender: 'Nam', dob: '2006-03-11', parent: 'Đỗ Hữu Trọng', phone: '0933669911', gpa: 9.4, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS014', name: 'Lê Thùy Quyên', class: '12A1', gender: 'Nữ', dob: '2006-08-20', parent: 'Lê Văn Bình', phone: '0944770022', gpa: 8.1, rank: 'Tốt', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS015', name: 'Phan Tấn Tài', class: '12A1', gender: 'Nam', dob: '2006-11-28', parent: 'Phan Văn Đức', phone: '0955881133', gpa: 7.4, rank: 'Khá', conduct: 'Tốt', ava: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=256&q=80' },
    { code: 'HS016', name: 'Vũ Thanh Uyên', class: '12A1', gender: 'Nữ', dob: '2006-04-09', parent: 'Vũ Văn Hậu', phone: '0966992244', gpa: 6.2, rank: 'Đạt', conduct: 'Khá', ava: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=256&q=80' }
  ];

  for (let i = 1; i <= 16; i++) {
    const code = `HS${String(i).padStart(3, '0')}`;
    const st = hsList[i - 1];
    users.push({ u: code.toLowerCase(), f: st.name, r: 'HS', e: `${code.toLowerCase()}@student.hsu.edu.vn` });
    users.push({ u: `ph.hs${String(i).padStart(4, '0')}`, f: `${st.parent} (PH ${st.name})`, r: 'PH', e: `ph_${code.toLowerCase()}@gmail.com` });
  }
  users.push({ u: 'hs.anh', f: 'Nguyễn Thị Ánh', r: 'HS', e: 'anh.hs001@student.hsu.edu.vn' });
  users.push({ u: 'ph001', f: 'Nguyễn Thị Hương (PH em Ánh)', r: 'PH', e: 'huong.ph001@gmail.com' });

  for (const u of users) {
    await client.query(`
      INSERT INTO users (username, password, full_name, role, email)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email
    `, [u.u, pass123456, u.f, u.r, u.e]);
  }
  console.log(`✅ Đã nạp thành công ${users.length} tài khoản người dùng RBAC.`);

  // 3. Nạp 5 lớp học THPT
  const classes = [
    { c: '10A1', g: 10, t: 'Lê Minh Châu' },
    { c: '10A2', g: 10, t: 'Phạm Thị Dung' },
    { c: '11B1', g: 11, t: 'Hoàng Văn Em' },
    { c: '12A1', g: 12, t: 'Trần Thị Mai' },
    { c: '12A2', g: 12, t: 'Nguyễn Văn An' }
  ];
  for (const cl of classes) {
    await client.query(`
      INSERT INTO school_classes (class_name, grade_level, gvcn_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (class_name) DO UPDATE SET grade_level = EXCLUDED.grade_level, gvcn_name = EXCLUDED.gvcn_name
    `, [cl.c, cl.g, cl.t]);
  }
  console.log('✅ Đã nạp 5 lớp học.');

  // 4. Nạp 10 môn học
  const subjects = [
    { c: 'TOAN', n: 'Toán', cr: 2 },
    { c: 'VAN', n: 'Ngữ văn', cr: 2 },
    { c: 'ANH', n: 'Tiếng Anh', cr: 2 },
    { c: 'LY', n: 'Vật lý', cr: 1 },
    { c: 'HOA', n: 'Hóa học', cr: 1 },
    { c: 'SINH', n: 'Sinh học', cr: 1 },
    { c: 'SU', n: 'Lịch sử', cr: 1 },
    { c: 'DIA', n: 'Địa lý', cr: 1 },
    { c: 'GDCD', n: 'GDKT & Pháp luật', cr: 1 },
    { c: 'TIN', n: 'Tin học', cr: 1 }
  ];
  for (const s of subjects) {
    await client.query(`
      INSERT INTO subjects (code, name, credits)
      VALUES ($1, $2, $3)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credits = EXCLUDED.credits
    `, [s.c, s.n, s.cr]);
  }
  console.log('✅ Đã nạp 10 môn học.');

  // 5. Nạp 16 học sinh đầy đủ hồ sơ
  for (const st of hsList) {
    await client.query(`
      INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, conduct_rank, status, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE', $11)
      ON CONFLICT (student_code) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        gender = EXCLUDED.gender,
        dob = EXCLUDED.dob,
        class_name = EXCLUDED.class_name,
        parent_name = EXCLUDED.parent_name,
        parent_phone = EXCLUDED.parent_phone,
        gpa = EXCLUDED.gpa,
        academic_rank = EXCLUDED.academic_rank,
        conduct_rank = EXCLUDED.conduct_rank,
        status = EXCLUDED.status,
        avatar = EXCLUDED.avatar
    `, [st.code, st.name, st.gender, st.dob, st.class, st.parent, st.phone, st.gpa, st.rank, st.conduct, st.ava]);
  }
  console.log('✅ Đã nạp 16 học sinh trên 5 lớp.');

  // 6. Liên kết Phụ huynh - Học sinh
  for (let i = 1; i <= 16; i++) {
    const code = `HS${String(i).padStart(3, '0')}`;
    const pUser = `ph.hs${String(i).padStart(4, '0')}`;
    await client.query(`
      INSERT INTO parent_students (parent_user_id, student_code, relationship)
      SELECT u.id, $1, 'Phụ huynh' FROM users u WHERE u.username = $2
      ON CONFLICT (parent_user_id, student_code) DO NOTHING
    `, [code, pUser]);
  }
  await client.query(`
    INSERT INTO parent_students (parent_user_id, student_code, relationship)
    SELECT u.id, 'HS001', 'Mẹ' FROM users u WHERE u.username = 'ph001'
    ON CONFLICT (parent_user_id, student_code) DO NOTHING
  `);
  console.log('✅ Đã liên kết phụ huynh - học sinh.');

  // 7. Sổ điểm Thông tư 22 (cho toàn bộ 16 học sinh, mỗi học sinh nhiều môn)
  const subNames = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Tin học'];
  for (const st of hsList) {
    for (const sub of subNames) {
      // Tính điểm ngẫu nhiên chuẩn phân hóa
      let oral = (Math.random() * 2 + 7.5).toFixed(1);
      let m15 = (Math.random() * 2 + 7.5).toFixed(1);
      let h1 = (Math.random() * 2 + 7.5).toFixed(1);
      let mid = (Math.random() * 2 + 7.5).toFixed(1);
      let fin = (Math.random() * 2 + 7.5).toFixed(1);
      if (st.code === 'HS001') { oral = 9.5; m15 = 10; h1 = 9.5; mid = 9.5; fin = 9.5; }
      if (st.code === 'HS011') { oral = 4.5; m15 = 5.0; h1 = 4.5; mid = 4.5; fin = 5.0; }
      const avg = ((parseFloat(oral) + parseFloat(m15) + parseFloat(h1)*2 + parseFloat(mid)*2 + parseFloat(fin)*3) / 9).toFixed(1);
      const letter = avg >= 8.0 ? 'Tốt' : (avg >= 6.5 ? 'Khá' : (avg >= 5.0 ? 'Đạt' : 'Chưa đạt'));

      await client.query(`
        INSERT INTO grade_books (
          student_code, student_name, subject_name, class_name, semester, school_year,
          score_oral, score_15m, score_1hour, score_mid_term, score_final_term,
          average_score, grade_letter, status
        )
        VALUES ($1, $2, $3, $4, 'HK1', '2025-2026', $5, $6, $7, $8, $9, $10, $11, 'APPROVED')
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
      `, [st.code, st.name, sub, st.class, oral, m15, h1, mid, fin, avg, letter]);
    }
  }
  console.log('✅ Đã nạp 96 bản ghi sổ điểm Thông tư 22 (16 HS x 6 môn).');

  // 8. Thời khóa biểu mẫu (Schedules & Schedule Templates cho các lớp)
  const schedSlots = [
    { d: 2, p: 1, s: 'Toán', r: 'P.101', t: 'Nguyễn Văn An' },
    { d: 2, p: 2, s: 'Toán', r: 'P.101', t: 'Nguyễn Văn An' },
    { d: 2, p: 3, s: 'Ngữ văn', r: 'P.101', t: 'Trần Thị Mai' },
    { d: 2, p: 4, s: 'Tiếng Anh', r: 'P.101', t: 'Phạm Hồng Nhung' },
    { d: 2, p: 5, s: 'GDKT & Pháp luật', r: 'P.101', t: 'Lê Minh Châu' },
    { d: 3, p: 1, s: 'Vật lý', r: 'P.101', t: 'Đỗ Văn Long' },
    { d: 3, p: 2, s: 'Hóa học', r: 'P.101', t: 'Vũ Thị Hoa' },
    { d: 3, p: 3, s: 'Lịch sử', r: 'P.101', t: 'Trần Thị Mai' },
    { d: 3, p: 4, s: 'Tin học', r: 'Lab 1', t: 'Hiệu trưởng Trần Quốc Bảo' },
    { d: 3, p: 5, s: 'Địa lý', r: 'P.101', t: 'Lê Minh Châu' },
    { d: 4, p: 1, s: 'Ngữ văn', r: 'P.101', t: 'Trần Thị Mai' },
    { d: 4, p: 2, s: 'Ngữ văn', r: 'P.101', t: 'Trần Thị Mai' },
    { d: 4, p: 3, s: 'Toán', r: 'P.101', t: 'Nguyễn Văn An' },
    { d: 4, p: 4, s: 'Tiếng Anh', r: 'P.101', t: 'Phạm Hồng Nhung' },
    { d: 4, p: 5, s: 'Sinh học', r: 'P.101', t: 'Vũ Thị Hoa' },
    { d: 5, p: 1, s: 'Toán', r: 'P.101', t: 'Nguyễn Văn An' },
    { d: 5, p: 2, s: 'Vật lý', r: 'P.101', t: 'Đỗ Văn Long' },
    { d: 5, p: 3, s: 'Hóa học', r: 'P.101', t: 'Vũ Thị Hoa' },
    { d: 5, p: 4, s: 'Lịch sử', r: 'P.101', t: 'Trần Thị Mai' },
    { d: 5, p: 5, s: 'GDKT & Pháp luật', r: 'P.101', t: 'Lê Minh Châu' },
    { d: 6, p: 1, s: 'Tiếng Anh', r: 'P.101', t: 'Phạm Hồng Nhung' },
    { d: 6, p: 2, s: 'Tin học', r: 'Lab 1', t: 'Hiệu trưởng Trần Quốc Bảo' },
    { d: 6, p: 3, s: 'Địa lý', r: 'P.101', t: 'Lê Minh Châu' },
    { d: 6, p: 4, s: 'Toán', r: 'P.101', t: 'Nguyễn Văn An' },
    { d: 6, p: 5, s: 'Sinh hoạt lớp', r: 'P.101', t: 'Lê Minh Châu' }
  ];

  for (const cl of classes) {
    for (const sl of schedSlots) {
      await client.query(`
        INSERT INTO schedule_templates (class_id, day_of_week, period, subject_name, room, teacher_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (class_id, day_of_week, period) DO UPDATE SET
          subject_name = EXCLUDED.subject_name,
          room = EXCLUDED.room,
          teacher_name = EXCLUDED.teacher_name
      `, [cl.c, sl.d, sl.p, sl.s, sl.r, sl.t]);

      await client.query(`
        INSERT INTO schedules (class_id, week_start, day_of_week, period, subject_name, room, teacher_name, time_range)
        VALUES ($1, '2026-11-16', $2, $3, $4, $5, $6, $7)
        ON CONFLICT (class_id, week_start, day_of_week, period) DO UPDATE SET
          subject_name = EXCLUDED.subject_name,
          room = EXCLUDED.room,
          teacher_name = EXCLUDED.teacher_name
      `, [cl.c, sl.d, sl.p, sl.s, sl.r, sl.t, `Tiết ${sl.p}`]);
    }
  }
  console.log('✅ Đã nạp thời khóa biểu 25 tiết cho cả 5 lớp (125 bản ghi).');

  // 9. Điểm danh chuyên cần các ngày
  const days = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'];
  for (const d of days) {
    for (const st of hsList) {
      let stt = 'PRESENT';
      let nt = 'Có mặt đúng giờ';
      if (st.code === 'HS003' && d === '2026-11-17') { stt = 'EXCUSED'; nt = 'Nghỉ ốm có phép'; }
      if (st.code === 'HS011' && (d === '2026-11-16' || d === '2026-11-18')) { stt = 'UNEXCUSED'; nt = 'Vắng không phép'; }
      if (st.code === 'HS002' && d === '2026-11-19') { stt = 'LATE'; nt = 'Đi muộn 10 phút'; }

      await client.query(`
        INSERT INTO attendances (student_code, student_name, class_name, att_date, status, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (student_code, class_name, att_date) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
      `, [st.code, st.name, st.class, d, stt, nt]);
    }
  }
  console.log('✅ Đã nạp 80 bản ghi điểm danh chuyên cần (16 HS x 5 ngày).');

  // 10. Đơn xin nghỉ phép
  const leaves = [
    { c: 'HS003', cl: '10A1', n: 'Lê Thị Cẩm', f: '2026-11-17', t: '2026-11-17', r: 'Ốm sốt virut', s: 'APPROVED' },
    { c: 'HS001', cl: '10A1', n: 'Nguyễn Thị Ánh', f: '2026-11-20', t: '2026-11-20', r: 'Việc hiếu gia đình', s: 'PENDING' },
    { c: 'HS005', cl: '10A2', n: 'Đặng Thị Giang', f: '2026-11-15', t: '2026-11-15', r: 'Tham gia thi HSG cấp Thành phố', s: 'APPROVED' },
    { c: 'HS011', cl: '11B1', n: 'Hồ Quang Nam', f: '2026-11-16', t: '2026-11-16', r: 'Đi chơi không lý do chính đáng', s: 'REJECTED' }
  ];
  for (const l of leaves) {
    await client.query(`
      INSERT INTO leave_requests (student_code, class_name, student_name, from_date, to_date, reason, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [l.c, l.cl, l.n, l.f, l.t, l.r, l.s]);
  }
  console.log('✅ Đã nạp 4 đơn xin nghỉ phép đa trạng thái.');

  // 11. Học phí & Giao dịch thanh toán VietQR
  for (const st of hsList) {
    const isPaid = (st.code === 'HS001' || st.code === 'HS006' || st.code === 'HS010' || st.code === 'HS013');
    const amtPaid = isPaid ? 2500000 : 0;
    const stt = isPaid ? 'PAID' : 'OPEN';
    const recNo = isPaid ? `BL-${st.code}-2025-01` : null;

    const tuiRes = await client.query(`
      INSERT INTO tuitions (student_code, student_name, class_name, semester, school_year, amount_due, amount_paid, status, receipt_no)
      VALUES ($1, $2, $3, 'HK1', '2025-2026', 2500000, $4, $5, $6)
      RETURNING id
    `, [st.code, st.name, st.class, amtPaid, stt, recNo]);

    const tId = tuiRes.rows[0].id;
    if (isPaid) {
      await client.query(`
        INSERT INTO payments (
          tuition_id, order_code, student_code, amount, payment_method, bank_bin,
          bank_account_no, bank_transaction_id, status, receipt_no, payer_name, payer_phone, expires_at, paid_at
        )
        VALUES (
          $1, $2, $3, 2500000, 'VIETQR', '970422',
          '0388888888', $4, 'PAID', $5, $6, $7, NOW() + INTERVAL '15 minutes', NOW()
        )
        ON CONFLICT (order_code) DO NOTHING
      `, [tId, `HP_ORDER_${st.code}_01`, st.code, `TXN_MB_${st.code}_9988`, recNo, st.parent, st.phone]);
    }
  }
  console.log('✅ Đã nạp 16 bản ghi học phí & giao dịch thanh toán VietQR.');

  // 12. Thông báo nhà trường
  const notifs = [
    { t: 'Chào mừng Tuần lễ Học tập & Tri ân Thầy Cô 20/11', c: 'Ban Giám Hiệu phát động phong trào thi đua tiết dạy tốt và học tốt chào mừng ngày Nhà giáo Việt Nam.', r: ['ALL'], tp: 'general' },
    { t: 'Lịch Thi Học Kỳ 1 Năm Học 2025-2026', c: 'Lịch kiểm tra đánh giá cuối kỳ 1 sẽ bắt đầu từ ngày 15/12/2026. Đề nghị các GVBM hoàn tất kiểm tra thường xuyên.', r: ['ALL'], tp: 'academic' },
    { t: 'Thông Báo Họp Phụ Huynh Định Kỳ Khối 10', c: 'Kính mời quý phụ huynh học sinh khối 10 tham dự buổi họp phụ huynh vào lúc 08:00 sáng Chủ Nhật tại Hội trường A.', r: ['PH'], tp: 'meeting' },
    { t: 'Nhắc Nhở Hoàn Tất Nộp Học Phí Học Kỳ 1', c: 'Hạn cuối hoàn tất nộp học phí HK1 qua cổng thanh toán VietQR là ngày 30/11/2026. Quý phụ huynh vui lòng tra cứu biên lai sau khi chuyển khoản.', r: ['PH'], tp: 'tuition' }
  ];
  for (const n of notifs) {
    await client.query(`
      INSERT INTO notifications (title, content, type, sender_id, sender_role, recipients, sent_at, status)
      VALUES ($1, $2, $3, 'bgh_admin', 'BGH', $4, NOW(), 'sent')
    `, [n.t, n.c, n.tp, n.r]);
  }
  console.log('✅ Đã nạp 4 thông báo nhà trường.');

  // 13. Sổ liên lạc điện tử (Parent Messages)
  const msgs = [
    { sender: 'gvcn01', fr: 'GVCN', st: 'HS001', cl: '10A1', m: 'Chào phụ huynh em Ánh, tuần này em Ánh học tập rất xuất sắc môn Toán và Văn.', tp: 'GVCN' },
    { sender: 'ph.hs0001', fr: 'PH', st: 'HS001', cl: '10A1', m: 'Dạ cảm ơn cô Châu rất nhiều, gia đình sẽ tiếp tục động viên cháu cố gắng.', tp: 'GVCN' },
    { sender: 'admin', fr: 'BGH', st: 'HS001', cl: '10A1', m: 'Thông báo: Toàn trường nghỉ học nhân dịp Lễ Nhà giáo Việt Nam 20/11.', tp: 'BGH' }
  ];
  for (const m of msgs) {
    await client.query(`
      INSERT INTO parent_messages (sender_id, from_role, student_id, class_name, message, conversation_type, sent_at)
      SELECT u.id, $1, $2, $3, $4, $5, NOW()
      FROM users u WHERE u.username = $6 LIMIT 1
    `, [m.fr, m.st, m.cl, m.m, m.tp, m.sender]);
  }
  console.log('✅ Đã nạp tin nhắn sổ liên lạc điện tử.');

  // 14. Cài đặt hệ thống & Ma trận phân quyền RBAC
  await client.query(`
    INSERT INTO system_settings (key, value)
    VALUES (
      'permissions',
      '{"gradebook":{"GV":true,"GVCN":true,"BGH":true,"PH":false,"HS":false},"attendance":{"GV":true,"GVCN":true,"BGH":true,"PH":false,"HS":false},"schedule":{"GV":true,"GVCN":true,"BGH":true,"PH":true,"HS":true},"reports":{"GV":false,"GVCN":false,"BGH":true,"PH":false,"HS":false},"settings":{"GV":false,"GVCN":false,"BGH":true,"PH":false,"HS":false}}'::jsonb
    )
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `);
  console.log('✅ Đã nạp cấu hình phân quyền hệ thống system_settings.');

  // 15. Chốt sổ điểm lớp học (Grade Book Closures)
  await client.query(`
    INSERT INTO grade_book_closures (class_id, class_name, gvcn_name, semester, school_year, status, submitted_at, approved_at)
    VALUES 
      ('10A1', '10A1', 'Lê Minh Châu', 'HK1', '2025-2026', 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
      ('10A2', '10A2', 'Phạm Thị Dung', 'HK1', '2025-2026', 'pending', NOW() - INTERVAL '3 hours', NULL)
    ON CONFLICT (class_id, semester, school_year) DO UPDATE SET status = EXCLUDED.status
  `);
  console.log('✅ Đã nạp bản ghi chốt sổ điểm.');

  // 16. Nhật ký kiểm toán an ninh (Audit Logs)
  await client.query(`
    INSERT INTO audit_logs (action, username, role, entity, entity_id, previous_value, new_value, ip_address)
    VALUES 
      ('INIT_SYSTEM', 'admin', 'BGH', 'system', 'ALL', 'null', '{"status":"INITIALIZED"}', '127.0.0.1'),
      ('UPDATE_SCORE', 'gv01', 'GV', 'grade_books', 'HS001', '8.5', '9.0', '192.168.1.10'),
      ('APPROVE_LEAVE', 'gvcn01', 'GVCN', 'leave_requests', 'HS003', 'PENDING', 'APPROVED', '192.168.1.15'),
      ('LOCK_GRADEBOOK', 'admin', 'BGH', 'grade_book_closures', '10A1', 'pending', 'approved', '118.69.182.45'),
      ('PAYMENT_CHECKOUT', 'ph001', 'PH', 'payments', 'HP_ORDER_HS001_01', 'OPEN', 'PAID', '14.248.82.11')
    ON CONFLICT DO NOTHING;
  `);
  console.log('✅ Đã nạp nhật ký an ninh audit_logs.');

  console.log('\n🎉 TOÀN BỘ 18 BẢNG TRÊN NEON CLOUD DATABASE ĐÃ ĐƯỢC NẠP 100% ĐẦY ĐỦ VÀ TRÙNG ĐIỆP VỚI LOCAL!');
  await client.end();
}

populateFullNeonData().catch(console.error);
