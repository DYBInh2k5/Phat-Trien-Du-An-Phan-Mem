import { query, querySafe, withTransaction } from '../config/db.js';

export class ClassRepository {
  static async findAll() {
    const res = await query('SELECT * FROM school_classes ORDER BY class_name ASC');
    return res.rows;
  }

  /** Tìm lớp theo tên GVCN — dùng cho phân quyền dữ liệu GVCN. */
  static async findByGvcnName(gvcnName) {
    const res = await query(
      'SELECT * FROM school_classes WHERE gvcn_name = $1 LIMIT 1',
      [gvcnName]
    );
    return res?.rows[0] ?? null;
  }

  /** Tìm lớp theo homeroom_teacher_id FK — dùng cho phân quyền GVCN an toàn. */
  static async findByHomeroomTeacherId(userId) {
    const res = await query(
      'SELECT * FROM school_classes WHERE homeroom_teacher_id = $1 LIMIT 1',
      [userId]
    );
    return res?.rows[0] ?? null;
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

