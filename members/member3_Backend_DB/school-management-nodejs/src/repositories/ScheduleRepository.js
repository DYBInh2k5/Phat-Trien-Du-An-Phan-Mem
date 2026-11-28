import { querySafe as query } from '../config/db.js';

/**
 * ScheduleRepository — Tầng truy cập dữ liệu cho thời khóa biểu.
 * Chỉ chứa SQL thuần, không có business logic.
 */

/**
 * Kho nhớ tạm thời cho schedules (in-memory fallback khi DB offline).
 * Export để ScheduleRepository.findConflicts() dùng được khi DB lỗi.
 */
export const memSchedules = [];
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
   * Kiểm tra xung đột giáo viên hoặc phòng học tại cùng (week_start, day_of_week, period).
   * Loại trừ chính lớp đang lưu (class_id != currentClassId) để tránh false-positive khi upsert.
   *
   * Trả về mảng các slot bị xung đột (rỗng = không có xung đột).
   *
   * @param {Object} opts
   * @param {string}      opts.weekStart      - 'YYYY-MM-DD'
   * @param {number}      opts.dayOfWeek      - 1-7
   * @param {number}      opts.period         - Tiết học (1-10)
   * @param {string}      opts.teacherName    - Tên giáo viên
   * @param {string}      opts.room           - Phòng học ('' = không kiểm tra)
   * @param {string}      opts.currentClassId - Lớp đang được lưu (loại trừ khỏi kết quả)
   * @returns {Promise<Array<{ class_id, teacher_name, room, subject_name }>>}
   */
  static async findConflicts({ weekStart, dayOfWeek, period, teacherName, room, currentClassId }) {
    // ── PostgreSQL: truy vấn tìm xung đột giáo viên hoặc phòng học ──────────
    const params = [weekStart, dayOfWeek, period, currentClassId];
    const orConditions = [];

    // Luôn kiểm tra giáo viên trùng (teacher_name không rỗng)
    if (teacherName) {
      params.push(teacherName);
      orConditions.push(`teacher_name = $${params.length}`);
    }
    // Chỉ kiểm tra phòng trùng khi phòng được điền (tránh null = null)
    if (room && room.trim()) {
      params.push(room.trim());
      orConditions.push(`room = $${params.length}`);
    }

    if (orConditions.length === 0) return [];

    const res = await query(
      `SELECT class_id, teacher_name, room, subject_name
       FROM schedules
       WHERE week_start = $1
         AND day_of_week = $2
         AND period = $3
         AND class_id != $4
         AND (${orConditions.join(' OR ')})`,
      params
    );

    if (res && res.rows) return res.rows;

    // ── Fallback in-memory khi DB chưa sẵn sàng ─────────────────────────────
    return memSchedules.filter(s =>
      s.week_start  === weekStart &&
      s.day_of_week === dayOfWeek &&
      s.period      === period &&
      s.class_id    !== currentClassId &&
      (
        (teacherName && s.teacher_name === teacherName) ||
        (room && room.trim() && s.room === room.trim())
      )
    );
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
    if (!res) {
      // ── Fallback in-memory upsert ──
      const idx = memSchedules.findIndex(s =>
        s.class_id    === slot.classId &&
        s.week_start  === slot.weekStart &&
        s.day_of_week === slot.dayOfWeek &&
        s.period      === slot.period
      );
      const newRow = {
        id:           idx >= 0 ? memSchedules[idx].id : memSchedules.length + 1,
        class_id:     slot.classId,
        week_start:   slot.weekStart,
        day_of_week:  slot.dayOfWeek,
        period:       slot.period,
        subject_name: slot.subjectName,
        teacher_name: slot.teacherName,
        room:         slot.room,
        time_range:   slot.timeRange || '',
      };
      if (idx >= 0) memSchedules[idx] = newRow;
      else memSchedules.push(newRow);
      return newRow;
    }
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
