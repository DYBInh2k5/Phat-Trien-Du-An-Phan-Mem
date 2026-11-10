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
    // Normalize field names: frontend gửi { studentCode, studentName, className, attDate, status }
    const normalized = {
      studentCode: attendance.studentCode || attendance.student_code,
      studentName: attendance.studentName || attendance.student_name || '',
      className:   attendance.className   || attendance.class_name,
      attDate:     attendance.attDate     || attendance.att_date,
      status:      (attendance.status || 'present').toUpperCase(),
      note:        attendance.note        || null,
    };
    console.log('[AttendanceService] saveAttendance normalized:', JSON.stringify(normalized));
    if (!normalized.studentCode) {
      console.error('[AttendanceService] MISSING studentCode! raw input:', JSON.stringify(attendance));
      throw new Error(`Thiếu studentCode. Dữ liệu nhận được: ${JSON.stringify(attendance)}`);
    }
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
