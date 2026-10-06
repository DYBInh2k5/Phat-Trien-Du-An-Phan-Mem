import { AttendanceRepository } from '../repositories/AttendanceRepository.js';

export class AttendanceService {
  static async getAttendance({ className, attDate, studentCode }) {
    if (studentCode) {
      return await AttendanceRepository.findByStudentCode(studentCode);
    }
    if (className && attDate) {
      return await AttendanceRepository.findByClassNameAndDate(className, attDate);
    }
    return await AttendanceRepository.findAll();
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
