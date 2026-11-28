import { query, querySafe, withTransaction } from '../config/db.js';

/**
 * Dữ liệu lớp học dự phòng trong bộ nhớ (In-Memory Fallback).
 * Dùng khi PostgreSQL chưa kết nối — đảm bảo StudentListPage và các trang
 * lọc theo lớp vẫn hoạt động bình thường ở môi trường dev local.
 */
const memClasses = [
  { id: 1, class_name: '10A1', className: '10A1', grade_level: 10, gvcn_name: null, homeroom_teacher_id: null },
  { id: 2, class_name: '10A2', className: '10A2', grade_level: 10, gvcn_name: null, homeroom_teacher_id: null },
  { id: 3, class_name: '10A3', className: '10A3', grade_level: 10, gvcn_name: null, homeroom_teacher_id: null },
  { id: 4, class_name: '11A1', className: '11A1', grade_level: 11, gvcn_name: null, homeroom_teacher_id: null },
  { id: 5, class_name: '11A2', className: '11A2', grade_level: 11, gvcn_name: null, homeroom_teacher_id: null },
  { id: 6, class_name: '11B1', className: '11B1', grade_level: 11, gvcn_name: null, homeroom_teacher_id: null },
  { id: 7, class_name: '12A1', className: '12A1', grade_level: 12, gvcn_name: null, homeroom_teacher_id: null },
  { id: 8, class_name: '12A2', className: '12A2', grade_level: 12, gvcn_name: null, homeroom_teacher_id: null },
  { id: 9, class_name: '12B1', className: '12B1', grade_level: 12, gvcn_name: null, homeroom_teacher_id: null },
];

export class ClassRepository {
  /**
   * Lấy toàn bộ danh sách lớp học, sắp xếp theo tên lớp.
   * Fallback sang memClasses khi PostgreSQL chưa sẵn sàng.
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const res = await querySafe('SELECT * FROM school_classes ORDER BY class_name ASC');
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return memClasses;
  }

  /** Tìm lớp theo tên GVCN — dùng cho phân quyền dữ liệu GVCN. */
  static async findByGvcnName(gvcnName) {
    const res = await querySafe(
      'SELECT * FROM school_classes WHERE gvcn_name = $1 LIMIT 1',
      [gvcnName]
    );
    if (res && res.rows) return res.rows[0] ?? null;
    return memClasses.find(c => c.gvcn_name === gvcnName) ?? null;
  }

  /** Tìm lớp theo homeroom_teacher_id FK — dùng cho phân quyền GVCN an toàn. */
  static async findByHomeroomTeacherId(userId) {
    const res = await querySafe(
      'SELECT * FROM school_classes WHERE homeroom_teacher_id = $1 LIMIT 1',
      [userId]
    );
    if (res && res.rows) return res.rows[0] ?? null;
    return memClasses.find(c => c.homeroom_teacher_id === userId) ?? null;
  }

  static async create(sc) {
    const res = await query(
      'INSERT INTO school_classes (class_name, grade_level, gvcn_name) VALUES ($1, $2, $3) RETURNING *',
      [sc.className, sc.gradeLevel, sc.gvcnName]
    );
    return res.rows[0];
  }

  /**
   * Gán lớp chủ nhiệm cho GVCN trong một transaction nguyên tử:
   * 1. Kiểm tra lớp tồn tại.
   * 2. Xóa phân công cũ của userId khỏi mọi lớp.
   * 3. Gán userId vào lớp mới.
   * Nếu bất kỳ bước nào thất bại, rollback toàn bộ — userId không mất lớp cũ.
   */
  static async assignHomeroom(className, userId, gvcnName) {
    return withTransaction(async (client) => {
      // Bước 1: kiểm tra lớp tồn tại trước khi xóa phân công cũ
      const checkRes = await client.query(
        'SELECT id FROM school_classes WHERE class_name = $1',
        [className]
      );
      if (checkRes.rowCount === 0) return null;

      // Bước 2: xóa phân công cũ của user này (an toàn vì đã xác nhận lớp mới tồn tại)
      await client.query(
        'UPDATE school_classes SET homeroom_teacher_id = NULL, gvcn_name = NULL WHERE homeroom_teacher_id = $1',
        [userId]
      );

      // Bước 3: gán lớp mới
      const res = await client.query(
        'UPDATE school_classes SET homeroom_teacher_id = $2, gvcn_name = $3 WHERE class_name = $1 RETURNING *',
        [className, userId, gvcnName]
      );
      return res.rows[0] ?? null;
    });
  }

  /** Xóa phân công chủ nhiệm của một user khỏi TẤT CẢ lớp (dùng khi đổi role ra khỏi GVCN). */
  static async removeHomeroom(userId) {
    // Dùng query thuần (ném lỗi) thay vì querySafe — cascade cleanup phải thành công hoặc rollback
    await query(
      'UPDATE school_classes SET homeroom_teacher_id = NULL, gvcn_name = NULL WHERE homeroom_teacher_id = $1',
      [userId]
    );
  }

  /**
   * Kiểm tra lớp có tồn tại không.
   * Dùng cho removeHomeroom để phân biệt 404 (lớp không có) vs 200 idempotent (lớp có nhưng chưa phân công).
   */
  static async classExists(className) {
    const res = await query(
      'SELECT 1 FROM school_classes WHERE class_name = $1 LIMIT 1',
      [className]
    );
    return (res?.rowCount ?? 0) > 0;
  }

  /**
   * Xóa phân công chủ nhiệm của một lớp cụ thể.
   * Trả về true nếu có hàng bị cập nhật, false nếu lớp không tồn tại hoặc chưa có phân công.
   */
  static async removeHomeroomByClass(className) {
    // Dùng query thuần (ném lỗi) — bước cleanup không được fail-silent
    const res = await query(
      'UPDATE school_classes SET homeroom_teacher_id = NULL, gvcn_name = NULL WHERE class_name = $1 RETURNING id',
      [className]
    );
    return (res?.rowCount ?? 0) > 0;
  }
}

