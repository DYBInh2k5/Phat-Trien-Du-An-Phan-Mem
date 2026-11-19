import { parseSort } from '../../common/http/pagination.js';
import { GRADE_STATUS, SCORE_FIELDS, toGrade } from './grade.mapper.js';

const COLUMNS = `id, student_id, student_code, student_name, class_name, subject_name, semester, school_year,
  score_oral, score_15m, score_1hour, score_mid_term, score_final_term, average_score, grade_letter, status`;

/** Điều kiện "chưa bị xóa mềm". Mọi truy vấn ĐỌC đều dùng hằng này. */
const NOT_DELETED = `status <> '${GRADE_STATUS.DELETED}'`;

const SORT_COLUMNS = {
  studentCode: 'student_code',
  studentName: 'student_name',
  averageScore: 'average_score',
  subjectName: 'subject_name',
  id: 'id',
};

export function createGradesRepository(pool) {
  const exec = (client) => client ?? pool;
  return {
    /** Khóa tư vấn theo khóa nghiệp vụ: chống 2 request song song cùng tạo trùng (schema không có UNIQUE). */
    async lockKey(client, key) {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [key]);
    },

    async findById(id, { client, forUpdate = false } = {}) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM grade_books WHERE id = $1${forUpdate ? ' FOR UPDATE' : ''}`,
        [id],
      );
      return toGrade(rows[0]);
    },

    async findActiveByKey({ studentId, subjectName, semester, schoolYear }, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM grade_books
         WHERE student_id = $1 AND subject_name = $2 AND semester = $3 AND school_year = $4 AND ${NOT_DELETED}
         ORDER BY id LIMIT 1`,
        [studentId, subjectName, semester, schoolYear],
      );
      return toGrade(rows[0]);
    },

    async list({
      className,
      subjectName,
      semester,
      schoolYear,
      includeDeleted,
      sort,
      limit,
      offset,
    }) {
      const { column, direction } = parseSort(sort, SORT_COLUMNS);
      const { rows } = await pool.query(
        `SELECT ${COLUMNS}, COUNT(*) OVER()::int AS total
         FROM grade_books
         WHERE class_name = $1 AND semester = $2 AND school_year = $3
           AND ($4::text IS NULL OR subject_name = $4)
           AND ($5::boolean OR ${NOT_DELETED})
         ORDER BY ${column} ${direction}, id
         LIMIT $6 OFFSET $7`,
        [className, semester, schoolYear, subjectName ?? null, includeDeleted, limit, offset],
      );
      return { items: rows.map(toGrade), total: rows[0]?.total ?? 0 };
    },

    async listByStudent(studentId, { semester, schoolYear }, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM grade_books
         WHERE student_id = $1 AND ${NOT_DELETED}
           AND ($2::text IS NULL OR semester = $2) AND ($3::text IS NULL OR school_year = $3)
         ORDER BY school_year, semester, subject_name`,
        [studentId, semester ?? null, schoolYear ?? null],
      );
      return rows.map(toGrade);
    },

    async listActiveByClassTerm({ className, semester, schoolYear }, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM grade_books
         WHERE class_name = $1 AND semester = $2 AND school_year = $3 AND ${NOT_DELETED} ORDER BY id`,
        [className, semester, schoolYear],
      );
      return rows.map(toGrade);
    },

    async insert(fields, client) {
      const { rows } = await exec(client).query(
        `INSERT INTO grade_books
           (student_id, student_code, student_name, class_name, subject_name, semester, school_year,
            score_oral, score_15m, score_1hour, score_mid_term, score_final_term,
            average_score, grade_letter, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'${GRADE_STATUS.APPROVED}')
         RETURNING ${COLUMNS}`,
        [
          fields.studentId,
          fields.studentCode,
          fields.studentName,
          fields.className,
          fields.subjectName,
          fields.semester,
          fields.schoolYear,
          fields.scores.oral,
          fields.scores.quarterHour,
          fields.scores.oneHour,
          fields.scores.midTerm,
          fields.scores.finalTerm,
          fields.averageScore,
          fields.gradeLetter,
        ],
      );
      return toGrade(rows[0]);
    },

    /** Ghi đè 5 cột điểm + TBM + xếp loại (truyền đủ giá trị đã merge). */
    async updateScores(id, { scores, averageScore, gradeLetter }, client) {
      const sets = SCORE_FIELDS.map(({ column }, index) => `${column} = $${index + 2}`);
      const values = SCORE_FIELDS.map(({ key }) => scores[key]);
      const { rows } = await exec(client).query(
        `UPDATE grade_books SET ${sets.join(', ')}, average_score = $7, grade_letter = $8
         WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, ...values, averageScore, gradeLetter],
      );
      return toGrade(rows[0]);
    },

    async setStatus(id, status, client) {
      const { rows } = await exec(client).query(
        `UPDATE grade_books SET status = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, status],
      );
      return toGrade(rows[0]);
    },

    /** Kỳ đã chốt = tồn tại ít nhất một dòng LOCKED của (lớp, học kỳ, năm học). */
    async isPeriodLocked({ className, semester, schoolYear }, client) {
      const { rows } = await exec(client).query(
        `SELECT EXISTS (
           SELECT 1 FROM grade_books
           WHERE class_name IS NOT DISTINCT FROM $1 AND semester = $2 AND school_year = $3
             AND status = '${GRADE_STATUS.LOCKED}'
         ) AS locked`,
        [className, semester, schoolYear],
      );
      return rows[0].locked;
    },

    async countPeriodByStatus({ className, semester, schoolYear }, client) {
      const { rows } = await exec(client).query(
        `SELECT status, COUNT(*)::int AS total FROM grade_books
         WHERE class_name = $1 AND semester = $2 AND school_year = $3 GROUP BY status`,
        [className, semester, schoolYear],
      );
      return Object.fromEntries(rows.map((row) => [row.status, row.total]));
    },

    async transitionPeriod({ className, semester, schoolYear, from, to }, client) {
      const { rowCount } = await exec(client).query(
        `UPDATE grade_books SET status = $5
         WHERE class_name = $1 AND semester = $2 AND school_year = $3 AND status = $4`,
        [className, semester, schoolYear, from, to],
      );
      return rowCount;
    },

    async listLockedPeriods({ limit, offset }) {
      const { rows } = await pool.query(
        `SELECT class_name, semester, school_year, COUNT(*)::int AS locked_rows,
                COUNT(*) OVER()::int AS total
         FROM grade_books WHERE status = '${GRADE_STATUS.LOCKED}'
         GROUP BY class_name, semester, school_year
         ORDER BY school_year DESC, semester, class_name
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return {
        items: rows.map((r) => ({
          className: r.class_name,
          semester: r.semester,
          schoolYear: r.school_year,
          lockedRows: r.locked_rows,
        })),
        total: rows[0]?.total ?? 0,
      };
    },
  };
}
