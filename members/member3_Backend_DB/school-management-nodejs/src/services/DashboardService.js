import { DashboardRepository } from '../repositories/DashboardRepository.js';

/**
 * DashboardService — Tầng business logic cho Dashboard BGH.
 * Tổng hợp dữ liệu từ Repository, tính toán và trả về DTO sạch cho Controller.
 */
export class DashboardService {
  static ATTENDANCE_THRESHOLD = 80; // % chuyên cần tối thiểu
  static GPA_THRESHOLD = 5.0;       // GPA tối thiểu đạt học lực

  /**
   * Lấy toàn bộ dữ liệu cho Dashboard BGH.
   * @returns {Promise<DashboardBGHDto>}
   */
  static async getBGHSummary() {
    // Chạy song song các truy vấn độc lập để tối ưu thời gian phản hồi
    const [
      totalStudents,
      totalTeachers,
      attendanceSummary,
      passingSummary,
      classSummaries,
      rawLowGpaStudents,
      rawTrend,
    ] = await Promise.all([
      DashboardRepository.countActiveStudents(),
      DashboardRepository.countTeachers(),
      DashboardRepository.getOverallAttendanceSummary(),
      DashboardRepository.getOverallPassingSummary(),
      DashboardRepository.getAttendanceSummaryByClass(),
      DashboardRepository.findStudentsBelowGpa(this.GPA_THRESHOLD),
      DashboardRepository.getAttendanceTrendByWeek(5),
    ]);

    // ── Tỉ lệ chuyên cần toàn trường ──────────────────────────────────────
    const attendanceRate =
      attendanceSummary && attendanceSummary.total > 0
        ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
        : null;

    // ── Tỉ lệ đạt học lực toàn trường ─────────────────────────────────────
    const passingRate =
      passingSummary && passingSummary.total > 0
        ? Math.round((passingSummary.passing / passingSummary.total) * 100)
        : null;

    // ── Lớp có tỉ lệ chuyên cần dưới ngưỡng ──────────────────────────────
    const lowAttendanceClasses = classSummaries
      .map((cls) => ({
        classId: cls.className,
        className: cls.className,
        gvcnName: cls.gvcnName,
        tileChuyenCan: Math.round((cls.present / cls.total) * 100),
        soHSduoiNguong: cls.total - cls.present,
      }))
      .filter((cls) => cls.tileChuyenCan < this.ATTENDANCE_THRESHOLD)
      .sort((a, b) => a.tileChuyenCan - b.tileChuyenCan);

    // ── Học sinh học lực yếu ───────────────────────────────────────────────
    const lowGpaStudents = rawLowGpaStudents.map((s) => ({
      id: s.id,
      studentCode: s.student_code,
      name: s.full_name,
      className: s.class_name,
      gpa: parseFloat(s.gpa),
      academicRank: s.academic_rank,
    }));

    // ── Xu hướng chuyên cần (từ mới → cũ, đảo lại thành cũ → mới) ────────
    const attendanceTrend = rawTrend
      .reverse()
      .map((row) => ({
        week: `T.${row.weekStart}`,
        rate:
          row.total > 0
            ? Math.round((row.present / row.total) * 100)
            : 0,
      }));

    return {
      totalStudents,
      totalTeachers,
      attendanceRate,
      passingRate,
      lowAttendanceClasses,
      lowGpaStudents,
      attendanceTrend,
    };
  }

  /**
   * Lấy toàn bộ dữ liệu cho Dashboard GVCN.
   * @param {number} gvcnUserId - user.id từ JWT (trusted) của GVCN đang đăng nhập
   */
  static async getGVCNSummary(gvcnUserId) {
    // Bước 1: lấy thông tin lớp + học sinh qua homeroom_teacher_id FK
    const { classInfo, students } = await DashboardRepository.getHomeroomClassByGvcnId(gvcnUserId);

    if (!classInfo) {
      return {
        classInfo:        null,
        students:         [],
        todayAttendance:  null,
        pendingLeaves:    [],
        conductSummary:   [],
      };
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Bước 2: fetch song song điểm danh hôm nay, đơn nghỉ, hạnh kiểm
    const [todayAttendance, pendingLeaves, rawConduct] = await Promise.all([
      DashboardRepository.getTodayAttendance(classInfo.id, today),
      DashboardRepository.getPendingLeaveRequests(classInfo.id),
      DashboardRepository.getConductSummary(classInfo.id),
    ]);

    // Tính tỉ lệ chuyên cần hôm nay
    const totalStudents = students.length;
    let attendanceRate  = null;
    if (todayAttendance && todayAttendance.total > 0) {
      attendanceRate = Math.round((todayAttendance.present / todayAttendance.total) * 100);
    }

    // Phân bố hạnh kiểm dưới dạng map { Tốt: n, Khá: n, ... }
    const conductMap = {};
    for (const item of rawConduct) {
      conductMap[item.rank] = item.count;
    }
    const goodCount = conductMap['Giỏi'] ?? 0 + (conductMap['Khá'] ?? 0);
    const conductPct = totalStudents > 0
      ? Math.round(((conductMap['Giỏi'] ?? 0) / totalStudents) * 100)
      : 0;

    return {
      classInfo,
      students,
      todayAttendance: todayAttendance
        ? { ...todayAttendance, totalStudents, attendanceRate }
        : { total: 0, present: 0, absentNoPermit: 0, absentWithPermit: 0, totalStudents, attendanceRate: null },
      pendingLeaves,
      conductSummary: rawConduct,
      conductPct,
    };
  }
}
