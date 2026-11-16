/** Ánh xạ cột điểm: tên DTO (camelCase) <-> khóa domain <-> cột DB (snake_case). Một nguồn sự thật duy nhất. */
export const SCORE_FIELDS = Object.freeze([
  Object.freeze({ dto: 'scoreOral', key: 'oral', column: 'score_oral' }),
  Object.freeze({ dto: 'score15m', key: 'quarterHour', column: 'score_15m' }),
  Object.freeze({ dto: 'score1Hour', key: 'oneHour', column: 'score_1hour' }),
  Object.freeze({ dto: 'scoreMidTerm', key: 'midTerm', column: 'score_mid_term' }),
  Object.freeze({ dto: 'scoreFinalTerm', key: 'finalTerm', column: 'score_final_term' }),
]);

export const GRADE_STATUS = Object.freeze({
  APPROVED: 'APPROVED',
  LOCKED: 'LOCKED', // sổ đã chốt (dùng cột status có sẵn, không đổi schema)
  DELETED: 'DELETED', // xóa mềm (dùng cột status có sẵn)
});

const num = (value) => (value === null || value === undefined ? null : Number(value));

export function toGrade(row) {
  if (!row) {
    return undefined;
  }
  return {
    id: row.id,
    studentId: row.student_id,
    studentCode: row.student_code,
    studentName: row.student_name,
    className: row.class_name,
    subjectName: row.subject_name,
    semester: row.semester,
    schoolYear: row.school_year,
    scoreOral: num(row.score_oral),
    score15m: num(row.score_15m),
    score1Hour: num(row.score_1hour),
    scoreMidTerm: num(row.score_mid_term),
    scoreFinalTerm: num(row.score_final_term),
    averageScore: num(row.average_score),
    gradeLetter: row.grade_letter,
    status: row.status,
    isLocked: row.status === GRADE_STATUS.LOCKED,
    isDeleted: row.status === GRADE_STATUS.DELETED,
  };
}

/** Lấy 5 cột điểm từ DTO/patch sang khóa domain (giữ undefined = "không đổi"). */
export function toDomainScores(source) {
  const scores = {};
  for (const { dto, key } of SCORE_FIELDS) {
    scores[key] = source[dto];
  }
  return scores;
}
