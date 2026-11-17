/**
 * Tính điểm trung bình môn (TBM). HÀM THUẦN: không import DB / HTTP.
 * Hệ số mặc định (cấu hình được, nhóm cần chốt với giáo viên): miệng 1, 15' 1, 1 tiết 2, giữa kỳ 2, cuối kỳ 3.
 */
export const SCORE_KEYS = Object.freeze(['oral', 'quarterHour', 'oneHour', 'midTerm', 'finalTerm']);

export const SCORE_WEIGHTS = Object.freeze({
  oral: 1,
  quarterHour: 1,
  oneHour: 2,
  midTerm: 2,
  finalTerm: 3,
});

/** Một môn được coi là "đủ điểm" khi có các cột bắt buộc này. */
export const REQUIRED_SCORE_KEYS = Object.freeze(['midTerm', 'finalTerm']);

/** Làm tròn half-up 1 chữ số thập phân, tránh lỗi nhị phân (8.45 -> 8.5). */
export function round1(value) {
  return Math.round(Number((value * 10).toFixed(6))) / 10;
}

export function round2(value) {
  return Math.round(Number((value * 100).toFixed(6))) / 100;
}

function assertScore(key, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10) {
    throw new RangeError(`Điểm "${key}" phải là số từ 0 đến 10, nhận được: ${String(value)}`);
  }
}

/**
 * Cột null/undefined (chưa nhập) bị bỏ khỏi cả tử số và mẫu số.
 * @param {Partial<Record<'oral'|'quarterHour'|'oneHour'|'midTerm'|'finalTerm', number | null>>} scores
 * @returns {number | null} null nếu chưa có cột điểm nào
 */
export function calcSubjectAverage(scores, weights = SCORE_WEIGHTS) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const key of SCORE_KEYS) {
    const value = scores[key];
    if (value === null || value === undefined) {
      continue;
    }
    assertScore(key, value);
    weightedSum += value * weights[key];
    totalWeight += weights[key];
  }
  return totalWeight === 0 ? null : round1(weightedSum / totalWeight);
}

export function isSubjectComplete(scores) {
  return REQUIRED_SCORE_KEYS.every((key) => scores[key] !== null && scores[key] !== undefined);
}
