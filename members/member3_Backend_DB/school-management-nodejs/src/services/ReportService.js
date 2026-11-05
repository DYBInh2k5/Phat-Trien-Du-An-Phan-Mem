import { ReportRepository } from '../repositories/ReportRepository.js';

/**
 * ReportService — Business logic cho trang Báo cáo BGH.
 * Không chứa SQL, chỉ gọi Repository và transform dữ liệu thành DTO.
 */
export class ReportService {

  // Thứ tự cố định của dải điểm để hiển thị đúng
  static SCORE_RANGES = ['0 – 2', '2 – 4', '4 – 5', '5 – 6.5', '6.5 – 8', '8 – 10'];

  // Mapping academic_rank tiếng Việt → key ngắn
  static RANK_KEY_MAP = {
    'Xuất sắc': 'gioi',
    'Giỏi':     'gioi',
    'Khá':      'kha',
    'Trung bình': 'tb',
    'Yếu':      'yeu',
    'Kém':      'kem',
  };

  /**
   * Lấy toàn bộ dữ liệu cho trang báo cáo BGH.
   * @param {string} semester   - 'HK1' | 'HK2'
   * @param {string} schoolYear - '2024-2025'
   */
  static async getReportData(semester, schoolYear) {
    // Đảm bảo có bản ghi closure cho mọi lớp
    await ReportRepository.ensureClosuresForAllClasses(semester, schoolYear);

    const [
      rawClosures,
      rawRankByGrade,
      rawAvgBySubject,
      rawSubmission,
      rawDistribution,
    ] = await Promise.all([
      ReportRepository.findClosures(semester, schoolYear),
      ReportRepository.getAcademicRankByGrade(semester, schoolYear),
      ReportRepository.getAvgScoreBySubjectAndClass(semester, schoolYear),
      ReportRepository.getSubmissionRateByTeacher(semester, schoolYear),
      ReportRepository.getScoreDistribution(semester, schoolYear),
    ]);

    // ── 1. Grade book closures DTO ────────────────────────────────────────
    const gradeBookList = rawClosures.map((row) => ({
      classId:     row.class_id,
      className:   row.class_name,
      gvcnName:    row.gvcn_name || 'Chưa phân công',
      status:      row.status,
      submittedAt: row.submitted_at || null,
      approvedAt:  row.approved_at  || null,
    }));

    // ── 2. Học lực theo khối ─────────────────────────────────────────────
    // Gom: { gradeLevel → { gioi, kha, tb, yeu, kem, total } }
    const gradeMap = {};
    for (const row of rawRankByGrade) {
      const gl  = row.grade_level;
      const key = this.RANK_KEY_MAP[row.academic_rank] ?? 'tb';
      const cnt = parseInt(row.cnt, 10);
      if (!gradeMap[gl]) gradeMap[gl] = { gioi: 0, kha: 0, tb: 0, yeu: 0, kem: 0, total: 0 };
      gradeMap[gl][key]  += cnt;
      gradeMap[gl].total += cnt;
    }

    const totalCounts = { gioi: 0, kha: 0, tb: 0, yeu: 0, kem: 0, total: 0 };
    const hoclucByGrade = Object.entries(gradeMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([gl, counts]) => {
        Object.keys(totalCounts).forEach((k) => { totalCounts[k] += counts[k]; });
        const pct = (key) =>
          counts.total > 0 ? Math.round((counts[key] / counts.total) * 100) : 0;
        return {
          grade: `Khối ${gl}`,
          gioi: pct('gioi'), kha: pct('kha'), tb: pct('tb'),
          yeu:  pct('yeu'),  kem: pct('kem'),
        };
      });

    // Hàng tổng toàn trường
    const toPct = (key) =>
      totalCounts.total > 0 ? Math.round((totalCounts[key] / totalCounts.total) * 100) : 0;
    hoclucByGrade.push({
      grade: 'Toàn trường',
      gioi: toPct('gioi'), kha: toPct('kha'), tb: toPct('tb'),
      yeu:  toPct('yeu'),  kem: toPct('kem'),
    });

    // ── 3. Điểm TB theo môn & lớp ────────────────────────────────────────
    // Lấy danh sách tất cả lớp xuất hiện trong kết quả
    const classSet = [...new Set(rawAvgBySubject.map((r) => r.class_name))].sort();

    // Gom: { subjectName → { className: avgScore } }
    const subjectMap = {};
    for (const row of rawAvgBySubject) {
      if (!subjectMap[row.subject_name]) subjectMap[row.subject_name] = {};
      subjectMap[row.subject_name][row.class_name] = parseFloat(row.avg_score);
    }

    const avgBySubject = Object.entries(subjectMap).map(([subject, classScores]) => ({
      subject,
      ...classScores,
    }));

    // ── 4. Tỉ lệ nộp điểm theo GV ───────────────────────────────────────
    const submissionRate = rawSubmission.map((row) => {
      const onTime = parseInt(row.on_time, 10);
      const total  = parseInt(row.total, 10);
      return {
        teacher:     row.teacher_name || 'Không rõ',
        subject:     row.subject_name || '—',
        onTime,
        total,
        rate:        total > 0 ? Math.round((onTime / total) * 100) : 0,
      };
    });

    // ── 5. Phân phối điểm ────────────────────────────────────────────────
    const distMap = Object.fromEntries(rawDistribution.map((r) => [r.range_label, parseInt(r.cnt, 10)]));
    const totalScores = Object.values(distMap).reduce((s, v) => s + v, 0);

    const scoreDistribution = this.SCORE_RANGES.map((range) => {
      const count = distMap[range] ?? 0;
      return {
        range,
        count,
        pct: totalScores > 0 ? Math.round((count / totalScores) * 100) : 0,
      };
    });

    return {
      gradeBookList,
      hoclucByGrade,
      classNames: classSet,
      avgBySubject,
      submissionRate,
      scoreDistribution,
    };
  }

  /** Duyệt sổ điểm một lớp. */
  static async approveClass(classId, semester, schoolYear) {
    const updated = await ReportRepository.approveClass(classId, semester, schoolYear);
    if (!updated) throw new Error(`Không tìm thấy bản ghi closure cho lớp ${classId}`);
    return {
      classId:   updated.class_id,
      className: updated.class_name,
      status:    updated.status,
      approvedAt: updated.approved_at,
    };
  }

  /** Khóa sổ toàn trường (chỉ các lớp đã approved). */
  static async lockAll(semester, schoolYear) {
    const count = await ReportRepository.lockAll(semester, schoolYear);
    return { lockedCount: count };
  }
}
