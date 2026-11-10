import { querySafe as query } from '../config/db.js';

/**
 * ScheduleRepository — Tầng truy cập dữ liệu cho thời khóa biểu.
 * Chỉ chứa SQL thuần, không có business logic.
 */
export class ScheduleRepository {
  /**
   * Lấy toàn bộ slot của một lớp trong một tuần.
   * @param {string} classId   - tên lớp (e.g. '10A1')
   * @param {string} weekStart - YYYY-MM-DD
   */
  static async findByClassAndWeek(classId, weekStart) {
    const res = await query(
      `SELECT * FROM schedules
       WHERE class_id = $1 AND week_start = $2
       ORDER BY day_of_week ASC, period ASC`,
      [classId, weekStart]
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Lấy tất cả slot trong một tuần (dùng cho conflict detection cross-class).
   * @param {string} weekStart - YYYY-MM-DD
   */
  static async findByWeek(weekStart) {
    const res = await query(
      `SELECT * FROM schedules WHERE week_start = $1`,
      [weekStart]
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Upsert một slot (INSERT hoặc UPDATE nếu đã tồn tại cùng class+week+day+period).
   * @param {object} slot
   */
  static async upsert(slot) {
    const res = await query(
      `INSERT INTO schedules (class_id, week_start, day_of_week, period, subject_name, teacher_name, room, time_range)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (class_id, week_start, day_of_week, period)
       DO UPDATE SET
         subject_name = EXCLUDED.subject_name,
         teacher_name = EXCLUDED.teacher_name,
         room         = EXCLUDED.room,
         time_range   = EXCLUDED.time_range
       RETURNING *`,
      [
        slot.classId,
        slot.weekStart,
        slot.dayOfWeek,
        slot.period,
        slot.subjectName,
        slot.teacherName,
        slot.room,
        slot.timeRange || '',
      ]
    );
    if (!res) return null;
    return res.rows[0];
  }

  /**
   * Xóa một slot cụ thể.
   */
  static async deleteSlot(classId, weekStart, dayOfWeek, period) {
    const res = await query(
      `DELETE FROM schedules
       WHERE class_id = $1 AND week_start = $2 AND day_of_week = $3 AND period = $4`,
      [classId, weekStart, dayOfWeek, period]
    );
    return res ? res.rowCount : 0;
  }

  /** Lấy danh sách teacher_name distinct từ bảng users (role GV/GVCN). */
  static async findTeacherNames() {
    const res = await query(
      `SELECT full_name FROM users WHERE role IN ('GV', 'GVCN') ORDER BY full_name ASC`
    );
    if (!res) return [];
    return res.rows.map((r) => r.full_name);
  }

  /**
   * Upsert một slot vào schedule_templates (lịch cố định, không gắn tuần).
   */
  static async upsertTemplate({ classId, dayOfWeek, period, subjectName, teacherName, room }) {
    const res = await query(
      `INSERT INTO schedule_templates (class_id, day_of_week, period, subject_name, teacher_name, room, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (class_id, day_of_week, period)
       DO UPDATE SET
         subject_name = EXCLUDED.subject_name,
         teacher_name = EXCLUDED.teacher_name,
         room         = EXCLUDED.room,
         updated_at   = NOW()
       RETURNING *`,
      [classId, dayOfWeek, period, subjectName, teacherName, room]
    );
    if (!res) return null;
    return res.rows[0];
  }

  /**
   * Lấy tất cả slots trong schedule_templates của một lớp.
   */
  static async findTemplatesByClass(classId) {
    const res = await query(
      `SELECT * FROM schedule_templates WHERE class_id = $1 ORDER BY day_of_week ASC, period ASC`,
      [classId]
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Xóa một slot trong schedule_templates.
   */
  static async deleteTemplateSlot(classId, dayOfWeek, period) {
    const res = await query(
      `DELETE FROM schedule_templates WHERE class_id = $1 AND day_of_week = $2 AND period = $3`,
      [classId, dayOfWeek, period]
    );
    return res ? res.rowCount : 0;
  }
}
