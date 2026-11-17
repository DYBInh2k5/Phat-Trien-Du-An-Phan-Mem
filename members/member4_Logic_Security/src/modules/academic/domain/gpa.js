import { round1, round2 } from './average.js';

/** Bảng quy đổi 10 -> 4.0 (cấu hình được; nhóm cần chốt theo quy định của trường). */
export const SCALE_4 = Object.freeze([
  Object.freeze({ min: 8.5, point: 4.0 }),
  Object.freeze({ min: 7.0, point: 3.0 }),
  Object.freeze({ min: 5.5, point: 2.0 }),
  Object.freeze({ min: 4.0, point: 1.0 }),
  Object.freeze({ min: 0, point: 0.0 }),
]);

export function convertTo4(score10, scale = SCALE_4) {
  if (typeof score10 !== 'number' || score10 < 0 || score10 > 10) {
    throw new RangeError(`Điểm hệ 10 không hợp lệ: ${String(score10)}`);
  }
  return scale.find((band) => score10 >= band.min).point;
}

const creditOf = (item) => (Number.isFinite(item.credits) && item.credits > 0 ? item.credits : 1);

function weightedMean(items, pick) {
  let sum = 0;
  let weight = 0;
  for (const item of items) {
    if (item.average === null || item.average === undefined) {
      continue;
    }
    sum += pick(item.average) * creditOf(item);
    weight += creditOf(item);
  }
  return weight === 0 ? null : sum / weight;
}

/** GPA hệ 10: trung bình các TBM có trọng số = số tín chỉ của môn. @param {{average: number|null, credits?: number}[]} items */
export function calcGpa10(items) {
  const mean = weightedMean(items, (average) => average);
  return mean === null ? null : round1(mean);
}

/** GPA hệ 4.0: quy đổi từng môn rồi lấy trung bình có trọng số tín chỉ (làm tròn 2 chữ số). */
export function calcGpa4(items, scale = SCALE_4) {
  const mean = weightedMean(items, (average) => convertTo4(average, scale));
  return mean === null ? null : round2(mean);
}
