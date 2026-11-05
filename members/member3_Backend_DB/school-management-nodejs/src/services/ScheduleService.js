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
   * Lưu (upsert) một slot. Trả về slot đã lưu dưới dạng DTO.
   * Đồng thời sync vào schedule_templates (lịch cố định hàng tuần).
   * @param {object} slot
   */
  static async saveSlot(slot) {
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
