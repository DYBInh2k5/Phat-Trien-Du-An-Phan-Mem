import { AttendanceRepository } from '../repositories/AttendanceRepository.js';

export class AttendanceService {
  static ATTENDANCE_THRESHOLD = 80; // % chuyên cần tối thiểu

  static async getAttendance({ className, attDate, studentCode }) {
    if (studentCode) {
      return await AttendanceRepository.findByStudentCode(studentCode);
    }
    if (className && attDate) {
      return await AttendanceRepository.findByClassNameAndDate(className, attDate);
    }
    return await AttendanceRepository.findAll();
  }

  /**
   * Tổng hợp chuyên cần theo lớp để BGH giám sát.
   * @param {{ dateFrom, dateTo, className }} filters
   * @returns {{ summaries: Array, classNames: Array<string> }}
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

  static async saveAttendance(attendance) {
    return await AttendanceRepository.save(attendance);
  }

  static async saveAllAttendance(attendanceList) {
    const results = [];
    for (const att of attendanceList) {
      const saved = await AttendanceRepository.save(att);
      results.push(saved);
    }
    return results;
  }
}
