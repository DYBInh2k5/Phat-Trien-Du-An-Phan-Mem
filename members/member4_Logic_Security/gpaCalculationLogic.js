/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member4_Logic_Security/gpaCalculationLogic.js
 * Vai trò: Facade Module Nghiệp Vụ Tính Điểm & Xếp Loại Học Lực (Thông tư 22/2021/TT-BGDĐT)
 * Kiến trúc: Clean Architecture - Domain Logic Export Adapter
 * Tác giả: Trần Quang Vinh (Logic & Security Lead)
 * Ngày cập nhật: 17/11/2026
 * Mô tả:
 *   - Tính điểm trung bình môn có trọng số (Miệng: 1, 15m: 1, 1 Tiết: 2, Giữa kỳ: 2, Cuối kỳ: 3).
 *   - Đánh giá xếp loại học lực chuẩn Thông tư 22 (Tốt, Khá, Đạt, Chưa đạt).
 *   - Quy đổi điểm học lực thang 10 sang thang 4 theo chuẩn tín chỉ quốc gia.
 * ==============================================================================
 */

/**
 * Tính điểm trung bình môn học có trọng số (hệ số chia 9 chuẩn hóa)
 * @param {Object} scores - Đối tượng điểm gồm { oral, m15, h1, mid, final }
 * @returns {number} Điểm trung bình môn làm tròn 1 chữ số thập phân
 */
export function calculateAverageSubjectScore(scores = {}) {
  const oral = parseFloat(scores.oral ?? scores.scoreOral ?? 0);
  const m15 = parseFloat(scores.m15 ?? scores.score15m ?? 0);
  const h1 = parseFloat(scores.h1 ?? scores.score1Hour ?? 0);
  const mid = parseFloat(scores.mid ?? scores.scoreMidTerm ?? 0);
  const finalScore = parseFloat(scores.final ?? scores.scoreFinalTerm ?? 0);

  // Trọng số chuẩn: Miệng x 1 + 15' x 1 + 1 Tiết x 2 + Giữa kỳ x 2 + Cuối kỳ x 3 = Mẫu số 9
  const weightedSum = oral * 1 + m15 * 1 + h1 * 2 + mid * 2 + finalScore * 3;
  const average = weightedSum / 9;
  return Math.round(average * 10) / 10;
}

/**
 * Đánh giá xếp loại kết quả học tập theo Thông tư 22/2021/TT-BGDĐT
 * @param {number} gpa - Điểm trung bình học kỳ / năm học
 * @returns {string} 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'
 */
export function evaluateAcademicRank(gpa) {
  if (gpa >= 8.0) return 'Tốt';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5.0) return 'Đạt';
  return 'Chưa đạt';
}

/**
 * Quy đổi điểm học lực thang điểm 10 sang thang điểm 4
 * @param {number} gpa10 - Điểm trung bình hệ 10
 * @returns {number} Điểm hệ 4 tương ứng
 */
export function convertGPA10To4(gpa10) {
  if (gpa10 >= 8.5) return 4.0;
  if (gpa10 >= 7.0) return 3.0;
  if (gpa10 >= 5.5) return 2.0;
  if (gpa10 >= 4.0) return 1.0;
  return 0.0;
}
