/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js
 * Vai trò: Kho Lưu Trữ Dữ Liệu Học Sinh (Student Data Access Repository)
 * Kiến trúc: Clean Architecture - Tầng Giao Tiếp Dữ Liệu (Interface Adapters / Data Access)
 * Mô tả:
 *   - Thực thi các câu lệnh SQL CRUD tác động lên bảng 'students' trong cơ sở dữ liệu PostgreSQL.
 *   - Sử dụng kỹ thuật truy vấn tham số hóa ($1, $2, ...) phòng chống triệt để SQL Injection.
 *   - Tích hợp kho nhớ tạm thời (In-Memory Fallback) khi chưa kết nối được CSDL Docker.
 *   - Hỗ trợ tra cứu theo Mã số học sinh (student_code), ID và Tên lớp (class_name).
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';

/**
 * Kho dữ liệu bộ nhớ dự phòng (In-Memory Store).
 * Đảm bảo hệ thống vẫn chạy thử nghiệm bình thường ngay cả khi chưa khởi động Docker PostgreSQL.
 */
let memStudents = [
  { id: 1, student_code: 'HS001', studentCode: 'HS001', full_name: 'Nguyễn Thị Ánh', fullName: 'Nguyễn Thị Ánh', gender: 'Nữ', dob: '2008-05-12', class_name: '10A1', className: '10A1', parent_name: 'Nguyễn Thị Hương', parentName: 'Nguyễn Thị Hương', parent_phone: '0901234567', parentPhone: '0901234567', gpa: 8.7, academic_rank: 'Giỏi', academicRank: 'Giỏi', conduct_rank: 'Tốt', conductRank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 2, student_code: 'HS002', studentCode: 'HS002', full_name: 'Trần Văn Bảo', fullName: 'Trần Văn Bảo', gender: 'Nam', dob: '2008-03-22', class_name: '10A1', className: '10A1', parent_name: 'Trần Văn Hùng', parentName: 'Trần Văn Hùng', parent_phone: '0907654321', parentPhone: '0907654321', gpa: 6.8, academic_rank: 'Khá', academicRank: 'Khá', conduct_rank: 'Tốt', conductRank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
  { id: 3, student_code: 'HS003', studentCode: 'HS003', full_name: 'Lê Thị Cẩm', fullName: 'Lê Thị Cẩm', gender: 'Nữ', dob: '2008-11-10', class_name: '10A1', className: '10A1', parent_name: 'Lê Văn Tâm', parentName: 'Lê Văn Tâm', parent_phone: '0912345678', parentPhone: '0912345678', gpa: 4.5, academic_rank: 'Yếu', academicRank: 'Yếu', conduct_rank: 'Khá', conductRank: 'Khá', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
  { id: 4, student_code: 'HS004', studentCode: 'HS004', full_name: 'Phạm Hữu Dũng', fullName: 'Phạm Hữu Dũng', gender: 'Nam', dob: '2008-01-15', class_name: '10A1', className: '10A1', parent_name: 'Phạm Thị Lan', parentName: 'Phạm Thị Lan', parent_phone: '0922334455', parentPhone: '0922334455', gpa: 8.5, academic_rank: 'Giỏi', academicRank: 'Giỏi', conduct_rank: 'Tốt', conductRank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { id: 5, student_code: 'HS005', studentCode: 'HS005', full_name: 'Đặng Thị Giang', fullName: 'Đặng Thị Giang', gender: 'Nữ', dob: '2008-07-08', class_name: '10A2', className: '10A2', parent_name: 'Đặng Văn Nam', parentName: 'Đặng Văn Nam', parent_phone: '0933445566', parentPhone: '0933445566', gpa: 7.2, academic_rank: 'Khá', academicRank: 'Khá', conduct_rank: 'Tốt', conductRank: 'Tốt', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' }
];

/**
 * Lớp StudentRepository - Thao tác dữ liệu bảng học sinh
 */
export class StudentRepository {
  /**
   * Lấy toàn bộ danh sách học sinh có trong hệ thống
   * @async
   * @returns {Promise<Array<Object>>} Mảng các bản ghi học sinh
   */
  static async findAll() {
    const res = await query('SELECT * FROM students ORDER BY id ASC');
    if (res && res.rows) return res.rows;
    return memStudents;
  }

  /**
   * Tìm kiếm thông tin học sinh theo khóa chính ID
   * @async
   * @param {number|string} id - Khóa chính học sinh
   * @returns {Promise<Object|null>} Bản ghi học sinh hoặc null nếu không thấy
   */
  static async findById(id) {
    const res = await query('SELECT * FROM students WHERE id = $1', [id]);
    if (res && res.rows) return res.rows[0] || null;
    return memStudents.find(s => s.id === parseInt(id, 10)) || null;
  }

  /**
   * Tìm kiếm thông tin học sinh theo Mã số định danh (student_code)
   * @async
   * @param {string} studentCode - Mã học sinh (ví dụ: 'HS001')
   * @returns {Promise<Object|null>} Bản ghi học sinh hoặc null
   */
  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM students WHERE student_code = $1', [studentCode]);
    if (res && res.rows) return res.rows[0] || null;
    return memStudents.find(s => s.student_code === studentCode || s.studentCode === studentCode) || null;
  }

  /**
   * Lấy danh sách học sinh theo Tên lớp học, sắp xếp theo họ tên bảng chữ cái
   * @async
   * @param {string} className - Tên lớp học (ví dụ: '10A1', '10A2')
   * @returns {Promise<Array<Object>>} Danh sách học sinh của lớp
   */
  static async findByClassName(className) {
    const res = await query('SELECT * FROM students WHERE class_name = $1 ORDER BY full_name ASC', [className]);
    if (res && res.rows) return res.rows;
    return memStudents.filter(s => s.class_name === className || s.className === className);
  }

  /**
   * Thêm mới một hồ sơ học sinh vào cơ sở dữ liệu
   * Áp dụng mệnh đề RETURNING * của PostgreSQL để lấy lại bản ghi vừa tạo kèm ID tự tăng.
   * @async
   * @param {Object} s - Dữ liệu học sinh mới
   * @returns {Promise<Object>} Bản ghi học sinh sau khi lưu
   */
  static async create(s) {
    const res = await query(
      `INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, conduct_rank, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [s.studentCode, s.fullName, s.gender, s.dob || s.dateOfBirth, s.className, s.parentName, s.parentPhone, s.gpa, s.academicRank, s.conductRank || s.conduct_rank || 'Tốt', s.status || 'ACTIVE', s.avatar || null]
    );
    if (res && res.rows && res.rows.length > 0) return res.rows[0];

    // Xử lý lưu vào kho nhớ tạm khi không có CSDL
    const newObj = {
      id: memStudents.length + 1,
      student_code: s.studentCode,
      studentCode: s.studentCode,
      full_name: s.fullName,
      fullName: s.fullName,
      gender: s.gender,
      dob: s.dob || s.dateOfBirth,
      class_name: s.className,
      className: s.className,
      parent_name: s.parentName,
      parentName: s.parentName,
      parent_phone: s.parentPhone,
      parentPhone: s.parentPhone,
      gpa: s.gpa,
      academic_rank: s.academicRank,
      academicRank: s.academicRank,
      conduct_rank: s.conductRank || s.conduct_rank || 'Tốt',
      conductRank: s.conductRank || s.conduct_rank || 'Tốt',
      status: s.status || 'ACTIVE',
      avatar: s.avatar || null
    };
    memStudents.push(newObj);
    return newObj;
  }

  /**
   * Import hàng loạt học sinh từ mảng JSON (POST /api/students/import).
   * Duyệt từng phần tử, bỏ qua dòng lỗi (mã trùng / thiếu trường), ghi nhận kết quả.
   * Dùng INSERT ... ON CONFLICT DO NOTHING để tránh crash khi mã HS đã tồn tại trong DB.
   * Fallback in-memory: kiểm tra trùng student_code trong mảng memStudents.
   *
   * @async
   * @param {Array<{ studentCode, fullName, gender, dob, className, parentName, parentPhone, status }>} rows
   * @returns {{ inserted: number, skipped: Array<{ row: number, studentCode: string, reason: string }> }}
   */
  static async bulkCreate(rows) {
    let inserted = 0;
    const skipped = [];

    for (let i = 0; i < rows.length; i++) {
      const s = rows[i];
      // Kiểm tra trường bắt buộc
      if (!s.studentCode || !s.fullName || !s.className) {
        skipped.push({ row: i + 2, studentCode: s.studentCode || '', reason: 'Thiếu mã học sinh, họ tên hoặc lớp' });
        continue;
      }

      try {
        // INSERT ... ON CONFLICT (student_code) DO NOTHING → không crash khi trùng mã
        const res = await query(
          `INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (student_code) DO NOTHING
           RETURNING id`,
          [
            s.studentCode,
            s.fullName,
            s.gender || '',
            s.dob || null,
            s.className,
            s.parentName || '',
            s.parentPhone || '',
            s.status === 'NghiHoc' || s.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
          ]
        );

        if (res && res.rows) {
          // rows rỗng = ON CONFLICT bỏ qua (trùng mã)
          if (res.rows.length === 0) {
            skipped.push({ row: i + 2, studentCode: s.studentCode, reason: 'Mã học sinh đã tồn tại trong hệ thống' });
          } else {
            inserted++;
          }
        } else {
          // ── Fallback in-memory ──
          const exists = memStudents.some(m => m.student_code === s.studentCode);
          if (exists) {
            skipped.push({ row: i + 2, studentCode: s.studentCode, reason: 'Mã học sinh đã tồn tại trong hệ thống' });
          } else {
            const newId = memStudents.length > 0 ? Math.max(...memStudents.map(m => m.id)) + 1 : 1;
            memStudents.push({
              id: newId,
              student_code: s.studentCode, studentCode: s.studentCode,
              full_name: s.fullName,       fullName: s.fullName,
              gender: s.gender || '',
              dob: s.dob || '',
              class_name: s.className,     className: s.className,
              parent_name: s.parentName || '',  parentName: s.parentName || '',
              parent_phone: s.parentPhone || '', parentPhone: s.parentPhone || '',
              gpa: null, academic_rank: '', academicRank: '',
              conduct_rank: 'Tốt', conductRank: 'Tốt',
              status: s.status === 'NghiHoc' || s.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
              avatar: null,
            });
            inserted++;
          }
        }
      } catch (rowErr) {
        // Lỗi FK (lớp không tồn tại), unique violation, hoặc lỗi DB khác cho dòng này
        skipped.push({ row: i + 2, studentCode: s.studentCode, reason: rowErr.message || 'Lỗi khi thêm dòng này' });
      }
    }

    return { inserted, skipped };
  }

  /**
   * Xóa một học sinh khỏi cơ sở dữ liệu theo ID.
   * Nếu bảng có ràng buộc khóa ngoại (attendance, gradebook, tuition, leave_requests),
   * PostgreSQL sẽ ném lỗi FK violation — tầng Service bắt và chuyển thành thông báo rõ ràng.
   * Fallback: xóa khỏi kho nhớ tạm khi không có CSDL thật.
   *
   * @async
   * @param {number|string} id - Khóa chính (id) của học sinh cần xóa
   * @returns {Promise<Object|null>} Bản ghi học sinh vừa bị xóa (RETURNING *), hoặc null nếu không tìm thấy
   * @throws {Error} PostgreSQL FK violation khi còn dữ liệu liên quan (điểm danh, điểm số, học phí...)
   */
  static async deleteById(id) {
    // Thực thi câu lệnh DELETE với RETURNING * để lấy lại bản ghi vừa xóa
    const res = await query(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [id]
    );
    if (res && res.rows) {
      // rows rỗng nghĩa là không tìm thấy học sinh với id này
      return res.rows[0] || null;
    }

    // ── Fallback: Xóa khỏi kho nhớ tạm khi PostgreSQL chưa sẵn sàng ──
    const idx = memStudents.findIndex(s => s.id === parseInt(id, 10));
    if (idx === -1) return null;
    const [removed] = memStudents.splice(idx, 1);
    return removed;
  }

  /**
   * Cập nhật thông tin hồ sơ học sinh theo ID
   * @async
   * @param {number|string} id - Khóa chính học sinh cần sửa
   * @param {Object} s - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Bản ghi học sinh sau khi cập nhật
   */
  static async update(id, s) {
    const res = await query(
      `UPDATE students SET full_name = $1, gender = $2, dob = $3, class_name = $4, parent_name = $5, parent_phone = $6, gpa = $7, academic_rank = $8, conduct_rank = $9, status = $10, avatar = $11
       WHERE id = $12 RETURNING *`,
      [
        s.fullName || s.full_name,
        s.gender,
        s.dob || s.dateOfBirth,
        s.className || s.class_name,
        s.parentName || s.parent_name,
        s.parentPhone || s.parent_phone,
        s.gpa,
        s.academicRank || s.academic_rank,
        s.conductRank || s.conduct_rank || 'Tốt',
        s.status,
        s.avatar || null,
        id
      ]
    );
    if (res && res.rows && res.rows.length > 0) return res.rows[0];

    // Cập nhật kho nhớ tạm
    const idx = memStudents.findIndex(item => item.id === parseInt(id, 10));
    if (idx !== -1) {
      memStudents[idx] = { ...memStudents[idx], ...s };
      return memStudents[idx];
    }
    return s;
  }
}
