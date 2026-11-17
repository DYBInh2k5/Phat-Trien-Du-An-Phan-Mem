/**
 * TRUY CẬP ĐỌC các bảng students / school_classes / subjects / attendances (thuộc member khác).
 * Ngoại lệ GHI duy nhất: updateAcademicResult (gpa, academic_rank) - phần dẫn xuất của Member 4.
 */
const STUDENT_SELECT = `
  SELECT s.id, s.student_code, s.full_name, s.dob, s.class_name, s.parent_name, s.parent_phone,
         s.status, s.gpa, s.academic_rank, c.id AS class_id, c.gvcn_name
  FROM students s
  LEFT JOIN school_classes c ON c.class_name = s.class_name`;

const toStudent = (row) =>
  row && {
    id: row.id,
    studentCode: row.student_code,
    fullName: row.full_name,
    dob: row.dob,
    className: row.class_name,
    classId: row.class_id,
    gvcnName: row.gvcn_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    status: row.status,
    gpa: row.gpa === null ? null : Number(row.gpa),
    academicRank: row.academic_rank,
  };

const toClass = (row) =>
  row && {
    id: row.id,
    className: row.class_name,
    gradeLevel: row.grade_level,
    gvcnName: row.gvcn_name,
  };

export function createStudentsRepository(pool) {
  const exec = (client) => client ?? pool;
  return {
    async findById(id, client) {
      const { rows } = await exec(client).query(`${STUDENT_SELECT} WHERE s.id = $1`, [id]);
      return toStudent(rows[0]);
    },
    async findByCode(code, client) {
      const { rows } = await exec(client).query(
        `${STUDENT_SELECT} WHERE upper(s.student_code) = upper($1)`,
        [code],
      );
      return toStudent(rows[0]);
    },
    async listActiveByClassName(className, client) {
      const { rows } = await exec(client).query(
        `${STUDENT_SELECT} WHERE s.class_name = $1 AND s.status = 'ACTIVE' ORDER BY s.student_code`,
        [className],
      );
      return rows.map(toStudent);
    },
    async findClassById(id, client) {
      const { rows } = await exec(client).query(
        'SELECT id, class_name, grade_level, gvcn_name FROM school_classes WHERE id = $1',
        [id],
      );
      return toClass(rows[0]);
    },
    async listClassesByGvcn(fullName, client) {
      const { rows } = await exec(client).query(
        `SELECT id, class_name, grade_level, gvcn_name FROM school_classes
         WHERE lower(trim(gvcn_name)) = lower(trim($1)) ORDER BY class_name`,
        [fullName],
      );
      return rows.map(toClass);
    },
    async findSubjectByName(name, client) {
      const { rows } = await exec(client).query(
        'SELECT id, code, name, credits FROM subjects WHERE name = $1',
        [name],
      );
      return (
        rows[0] && {
          id: rows[0].id,
          code: rows[0].code,
          name: rows[0].name,
          credits: rows[0].credits,
        }
      );
    },
    async listSubjects(client) {
      const { rows } = await exec(client).query(
        'SELECT id, code, name, credits FROM subjects ORDER BY id',
      );
      return rows.map((r) => ({ id: r.id, code: r.code, name: r.name, credits: r.credits }));
    },
    /** Đếm điểm danh theo trạng thái trong khoảng ngày (att_date là VARCHAR 'YYYY-MM-DD' nên so sánh chuỗi đúng thứ tự). */
    async countAttendanceByStatus(studentId, { from, to }, client) {
      const { rows } = await exec(client).query(
        `SELECT upper(status) AS status, COUNT(*)::int AS total
         FROM attendances
         WHERE student_id = $1
           AND ($2::text IS NULL OR att_date >= $2)
           AND ($3::text IS NULL OR att_date <= $3)
         GROUP BY upper(status)`,
        [studentId, from ?? null, to ?? null],
      );
      return rows.map((r) => ({ status: r.status, total: r.total }));
    },
    async updateAcademicResult(studentId, { gpa, academicRank }, client) {
      await exec(client).query('UPDATE students SET gpa = $2, academic_rank = $3 WHERE id = $1', [
        studentId,
        gpa,
        academicRank,
      ]);
    },
  };
}
