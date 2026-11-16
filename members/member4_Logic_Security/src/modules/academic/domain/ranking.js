import { DEFAULT_POLICY, UNRANKED_LABEL } from './policies.js';

/** Xếp loại MỘT môn chỉ theo TBM (dùng cho cột grade_letter). */
export function classifySubjectAverage(average, policy = DEFAULT_POLICY) {
  if (average === null || average === undefined) {
    return UNRANKED_LABEL;
  }
  const level = policy.levels.find((item) => average >= item.minAverage);
  return level ? level.label : policy.fallback;
}

/**
 * Xếp loại học lực cả học kỳ.
 * @param {{ subjects: { code: string, average: number | null }[], gpa10: number | null }} input
 * Thiếu môn/thiếu TBM => "Chưa xếp loại" (không đoán).
 */
export function rankAcademic({ subjects, gpa10 }, policy = DEFAULT_POLICY) {
  if (gpa10 === null || subjects.length === 0 || subjects.some((s) => s.average === null)) {
    return UNRANKED_LABEL;
  }
  const averages = subjects.map((s) => s.average);
  const lowest = Math.min(...averages);
  const coreAverages = subjects
    .filter((s) => policy.coreSubjectCodes.includes(s.code))
    .map((s) => s.average);
  const bestCore = coreAverages.length > 0 ? Math.max(...coreAverages) : null;

  const passed = policy.levels.find(
    (level) =>
      gpa10 >= level.minAverage &&
      lowest >= level.minLowest &&
      (level.minCore === null || bestCore === null || bestCore >= level.minCore),
  );
  return passed ? passed.label : policy.fallback;
}
