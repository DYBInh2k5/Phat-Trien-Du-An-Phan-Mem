export const UNRANKED_LABEL = 'Chưa xếp loại';

/**
 * Quy chế xếp loại học lực 5 mức (đúng đề bài: Xuất sắc, Giỏi, Khá, Trung bình, Yếu).
 * Mỗi mức đạt khi: GPA >= minAverage, môn thấp nhất >= minLowest, và (nếu có) Toán hoặc Văn >= minCore.
 * ⚠ Ngưỡng là giá trị mặc định cần đối chiếu với quy chế/văn bản gốc của trường trước khi nộp.
 * Muốn thêm quy chế khác (vd Thông tư 22: Tốt/Khá/Đạt/Chưa đạt) => thêm một policy cùng hình dạng.
 */
export const LEGACY_5_POLICY = Object.freeze({
  code: 'LEGACY_5_LEVELS',
  coreSubjectCodes: Object.freeze(['MATH', 'LIT']),
  levels: Object.freeze([
    Object.freeze({ label: 'Xuất sắc', minAverage: 9.0, minLowest: 8.0, minCore: null }),
    Object.freeze({ label: 'Giỏi', minAverage: 8.0, minLowest: 6.5, minCore: 8.0 }),
    Object.freeze({ label: 'Khá', minAverage: 6.5, minLowest: 5.0, minCore: 6.5 }),
    Object.freeze({ label: 'Trung bình', minAverage: 5.0, minLowest: 3.5, minCore: 5.0 }),
  ]),
  fallback: 'Yếu',
});

export const POLICIES = Object.freeze({ [LEGACY_5_POLICY.code]: LEGACY_5_POLICY });
export const DEFAULT_POLICY = LEGACY_5_POLICY;
