import { ScheduleRepository } from '../repositories/ScheduleRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import { SubjectRepository } from '../repositories/SubjectRepository.js';

/**
 * ScheduleService — Business logic cho thời khóa biểu.
 * Không chứa SQL, chỉ gọi Repository và xử lý dữ liệu.
 */
export class ScheduleService {
  /**
   * Lấy dữ liệu đầy đủ để render trang ScheduleAdmin:
   *   - slots của lớp được chọn trong tuần
   *   - toàn bộ slots trong tuần (để detect conflict)
   *   - danh sách lớp, môn học, tên giáo viên
   *
   * @param {string} classId
   * @param {string} weekStart - YYYY-MM-DD
   * @returns {{ slots, allWeekSlots, classes, subjects, teacherNames }}
   */
  static async getSchedulePageData(classId, weekStart) {
    const [rawSlots, rawAllWeek, rawClasses, rawSubjects, teacherNames] =
      await Promise.all([
        ScheduleRepository.findByClassAndWeek(classId, weekStart),
        ScheduleRepository.findByWeek(weekStart),
        ClassRepository.findAll(),
        SubjectRepository.findAll(),
        ScheduleRepository.findTeacherNames(),
      ]);

    // Normalize DB row → frontend DTO
    const toDto = (row) => ({
      id:          row.id,
      classId:     row.class_id,
      weekStart:   row.week_start,
      dayOfWeek:   row.day_of_week,
      period:      row.period,
      subjectName: row.subject_name,
      teacherName: row.teacher_name,
      room:        row.room,
      timeRange:   row.time_range || '',
    });

    const classes = rawClasses.map((c) => ({
      id:   c.class_name,
      name: c.class_name,
    }));

    const subjects = rawSubjects.map((s) => ({
      id:   s.code,
      name: s.name,
    }));

    return {
      slots:        rawSlots.map(toDto),
      allWeekSlots: rawAllWeek.map(toDto),
      classes,
      subjects,
      teacherNames,
    };
  }

  /**
   * Lưu (upsert) một slot. Kiểm tra xung đột giáo viên / phòng học trước khi lưu.
   * Ném lỗi với code 'CONFLICT_409' nếu phát hiện trùng, trả chi tiết lớp bị xung đột.
   * Đồng thời sync vào schedule_templates (lịch cố định hàng tuần).
   *
   * @param {object} slot
   * @throws {{ message, code:'CONFLICT_409', conflicts: Array }} khi xung đột
   */
  static async saveSlot(slot) {
    // ── Kiểm tra xung đột giáo viên / phòng học ─────────────────────────────
    const conflicts = await ScheduleRepository.findConflicts({
      weekStart:      slot.weekStart,
      dayOfWeek:      slot.dayOfWeek,
      period:         slot.period,
      teacherName:    slot.teacherName || '',
      room:           slot.room        || '',
      currentClassId: slot.classId,
    });

    if (conflicts.length > 0) {
      // Xây thông báo chi tiết: liệt kê từng lớp bị trùng và lý do
      const details = conflicts.map(c => {
        const reasons = [];
        if (slot.teacherName && c.teacher_name === slot.teacherName)
          reasons.push(`giáo viên "${c.teacher_name}" đang dạy lớp ${c.class_id}`);
        if (slot.room && slot.room.trim() && c.room === slot.room.trim())
          reasons.push(`phòng học "${c.room}" đang được lớp ${c.class_id} sử dụng`);
        return reasons.join(' và ');
      });

      const err = new Error(
        `Xung đột thời khóa biểu: ${details.join('; ')}. ` +
        `Vui lòng chọn giáo viên hoặc phòng học khác.`
      );
      err.code = 'CONFLICT_409';
      err.conflicts = conflicts;
      throw err;
    }

    // ── Lưu slot sau khi đã qua kiểm tra ─────────────────────────────────────
    const saved = await ScheduleRepository.upsert(slot);
    if (!saved) throw new Error('Không thể lưu tiết học. Vui lòng kiểm tra kết nối DB.');

    // Sync vào schedule_templates (lịch cố định hàng tuần)
    await ScheduleRepository.upsertTemplate({
      classId:     slot.classId,
      dayOfWeek:   slot.dayOfWeek,
      period:      slot.period,
      subjectName: slot.subjectName,
      teacherName: slot.teacherName,
      room:        slot.room,
    });

    return {
      id:          saved.id,
      classId:     saved.class_id,
      weekStart:   saved.week_start,
      dayOfWeek:   saved.day_of_week,
      period:      saved.period,
      subjectName: saved.subject_name,
      teacherName: saved.teacher_name,
      room:        saved.room,
      timeRange:   saved.time_range || '',
    };
  }

  /**
   * Lấy lịch cố định hàng tuần (schedule_templates) của một lớp.
   * @param {string} classId
   */
  static async getTemplatesByClass(classId) {
    const rows = await ScheduleRepository.findTemplatesByClass(classId);
    return rows.map((row) => ({
      id:          row.id,
      classId:     row.class_id,
      dayOfWeek:   row.day_of_week,
      period:      row.period,
      subjectName: row.subject_name,
      teacherName: row.teacher_name,
      room:        row.room,
    }));
  }

  /**
   * Xóa một slot.
   * Đồng thời xóa khỏi schedule_templates để TimetablePage đồng bộ.
   */
  static async deleteSlot(classId, weekStart, dayOfWeek, period) {
    const count = await ScheduleRepository.deleteSlot(classId, weekStart, dayOfWeek, period);
    if (count === 0) throw new Error('Không tìm thấy tiết học để xóa.');

    // Xóa khỏi schedule_templates để đồng bộ với TimetablePage
    await ScheduleRepository.deleteTemplateSlot(classId, dayOfWeek, period);
  }
}
