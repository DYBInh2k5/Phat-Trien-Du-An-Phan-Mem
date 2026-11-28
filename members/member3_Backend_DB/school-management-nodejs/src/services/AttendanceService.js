import { AttendanceRepository } from '../repositories/AttendanceRepository.js';

export class AttendanceService {
  static ATTENDANCE_THRESHOLD = 80;

  /**
   * Lấy điểm danh, hỗ trợ filter thêm period (UAT-06).
   * @param {{ className?, attDate?, studentCode?, period? }} params
   */
  static async getAttendance({ className, attDate, studentCode, period }) {
    if (studentCode) {
      return await AttendanceRepository.findByStudentCode(studentCode);
    }
    if (className && attDate) {
      // Nếu có period cụ thể → lấy theo tiết; không có → lấy tất cả tiết của ngày
      if (period != null && period !== '') {
        return await AttendanceRepository.findByClassDatePeriod(className, attDate, Number(period));
      }
      return await AttendanceRepository.findByClassNameAndDate(className, attDate);
    }
    return await AttendanceRepository.findAll();
  }

  /**
   * Tổng hợp chuyên cần theo lớp để BGH giám sát.
   */
  static async getAttendanceSummaryForBGH({ dateFrom, dateTo, className } = {}) {
    const [rawSummaries, classNames] = await Promise.all([
      AttendanceRepository.getSummaryByClass(
        dateFrom || null,
        dateTo   || null,
        className && className !== 'all' ? className : null
      ),
      AttendanceRepository.getDistinctClassNames(),
    ]);

    const summaries = rawSummaries.map((row) => {
      const total    = parseInt(row.total_records, 10);
      const present  = parseInt(row.present_count, 10);
      const students = parseInt(row.total_students, 10);
      const rate     = total > 0 ? Math.round((present / total) * 100) : 0;
      const below    = total - present;
      return {
        classId:        row.class_name,
        className:      row.class_name,
        gvcnName:       row.gvcn_name || 'Chưa phân công',
        totalStudents:  students,
        tileChuyenCan:  rate,
        soHSduoiNguong: below < 0 ? 0 : below,
      };
    });
    return { summaries, classNames };
  }

  /**
   * Lưu một bản ghi điểm danh — chuẩn hóa field + thêm period/subjectName/recordedBy/lateMinutes.
   * @param {Object} attendance
   * @param {string} [attendance.studentCode]
   * @param {string} [attendance.studentName]
   * @param {string} [attendance.className]
   * @param {string} [attendance.attDate]
   * @param {number} [attendance.period=0]       - 0=GVCN đầu giờ, 1..10=GVBM theo tiết
   * @param {string} [attendance.subjectName]    - tên môn (period>0)
   * @param {string} [attendance.recordedBy]     - username từ JWT (Controller tự điền)
   * @param {number} [attendance.lateMinutes=0]  - phút đi trễ
   * @param {string} [attendance.status]
   * @param {string} [attendance.note]
   */
  static async saveAttendance(attendance) {
    const normalized = {
      studentCode:  attendance.studentCode  || attendance.student_code,
      studentName:  attendance.studentName  || attendance.student_name  || '',
      className:    attendance.className    || attendance.class_name,
      attDate:      attendance.attDate      || attendance.att_date,
      period:       attendance.period       != null ? Number(attendance.period) : 0,
      subjectName:  attendance.subjectName  || attendance.subject_name  || null,
      recordedBy:   attendance.recordedBy   || attendance.recorded_by   || null,
      lateMinutes:  attendance.lateMinutes  != null ? Number(attendance.lateMinutes) : 0,
      status:       (attendance.status      || 'present').toUpperCase(),
      note:         attendance.note         || null,
    };

    if (!normalized.studentCode) {
      throw new Error(`Thiếu studentCode. Dữ liệu nhận được: ${JSON.stringify(attendance)}`);
    }
    // Khi status không phải LATE → đặt lại lateMinutes = 0
    if (normalized.status !== 'LATE') normalized.lateMinutes = 0;

    return await AttendanceRepository.upsert(normalized);
  }

  static async saveAllAttendance(attendanceList) {
    const results = [];
    for (const att of attendanceList) {
      const saved = await AttendanceService.saveAttendance(att);
      results.push(saved);
    }
    return results;
  }
}
