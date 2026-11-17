export const CONDUCT_LABELS = Object.freeze({
  GOOD: 'Tốt',
  FAIR: 'Khá',
  AVERAGE: 'Trung bình',
  POOR: 'Yếu',
});

/**
 * Nhóm trạng thái điểm danh. ⚠ Cần đối chiếu với giá trị thực tế module Điểm danh của member khác đang lưu.
 */
export const ATTENDANCE_STATUS_GROUPS = Object.freeze({
  excused: Object.freeze(['EXCUSED', 'ABSENT_EXCUSED', 'CO_PHEP']),
  unexcused: Object.freeze(['ABSENT', 'ABSENT_UNEXCUSED', 'UNEXCUSED', 'KHONG_PHEP']),
  late: Object.freeze(['LATE']),
});

/** Ngưỡng gợi ý hạnh kiểm (cấu hình được). Duyệt từ trên xuống, mức đầu tiên thỏa cả hai điều kiện. */
export const CONDUCT_RULES = Object.freeze([
  Object.freeze({ label: CONDUCT_LABELS.GOOD, maxUnexcused: 2, maxLate: 3 }),
  Object.freeze({ label: CONDUCT_LABELS.FAIR, maxUnexcused: 5, maxLate: 8 }),
  Object.freeze({ label: CONDUCT_LABELS.AVERAGE, maxUnexcused: 10, maxLate: 15 }),
]);

/** @param {{ status: string, total: number }[]} rows */
export function summarizeAttendance(rows) {
  const summary = { excused: 0, unexcused: 0, late: 0 };
  for (const { status, total } of rows) {
    const key = status.toUpperCase();
    for (const group of Object.keys(summary)) {
      if (ATTENDANCE_STATUS_GROUPS[group].includes(key)) {
        summary[group] += total;
      }
    }
  }
  return summary;
}

/**
 * GỢI Ý hạnh kiểm từ chuyên cần. Hạnh kiểm chính thức do GVCN quyết định;
 * hệ thống chỉ đưa ra mức đề xuất.
 */
export function suggestConduct({ unexcused, late }, rules = CONDUCT_RULES) {
  const matched = rules.find((rule) => unexcused <= rule.maxUnexcused && late <= rule.maxLate);
  return matched ? matched.label : CONDUCT_LABELS.POOR;
}
