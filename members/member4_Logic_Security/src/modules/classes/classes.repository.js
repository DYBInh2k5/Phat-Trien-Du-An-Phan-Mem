/**
 * GHI vào students.class_name và school_classes.gvcn_name (phân lớp / phân GVCN do Admin làm).
 * Schema giữ nguyên: học sinh nối lớp qua class_name, GVCN nối giáo viên qua HỌ TÊN (gvcn_name).
 */
const escapeLike = (value) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

const toClassRow = (row) => ({
  id: row.id,
  className: row.class_name,
  gradeLevel: row.grade_level,
  gvcnName: row.gvcn_name,
  studentCount: row.student_count,
});

const toStudentRow = (row) => ({
  id: row.id,
  studentCode: row.student_code,
  fullName: row.full_name,
  className: row.class_name,
  status: row.status,
});

export function createClassesRepository(pool) {
  const exec = (client) => client ?? pool;
  return {
    /** Mọi lớp + sĩ số (chỉ đếm học sinh ACTIVE). */
    async listClasses(client) {
      const { rows } = await exec(client).query(
        `SELECT c.id, c.class_name, c.grade_level, c.gvcn_name,
                COUNT(s.id) FILTER (WHERE s.status = 'ACTIVE')::int AS student_count
         FROM school_classes c
         LEFT JOIN students s ON s.class_name = c.class_name
         GROUP BY c.id
         ORDER BY c.grade_level, c.class_name`,
      );
      return rows.map(toClassRow);
    },

    /** classId: lọc theo lớp; unassigned: chỉ học sinh chưa có lớp; q: mã hoặc họ tên. */
    async listStudents({ classId, unassigned, q, limit, offset }, client) {
      const { rows } = await exec(client).query(
        `SELECT s.id, s.student_code, s.full_name, s.class_name, s.status,
                COUNT(*) OVER()::int AS total
         FROM students s
         LEFT JOIN school_classes c ON c.class_name = s.class_name
         WHERE ($1::int IS NULL OR c.id = $1)
           AND ($2::boolean IS NOT TRUE OR s.class_name IS NULL)
           AND ($3::text IS NULL OR s.student_code ILIKE $3 ESCAPE '\\' OR s.full_name ILIKE $3 ESCAPE '\\')
         ORDER BY s.student_code
         LIMIT $4 OFFSET $5`,
        [classId ?? null, unassigned ?? null, q ? `%${escapeLike(q)}%` : null, limit, offset],
      );
      return { items: rows.map(toStudentRow), total: rows[0]?.total ?? 0 };
    },

    async setStudentClass(studentId, className, client) {
      await exec(client).query('UPDATE students SET class_name = $2 WHERE id = $1', [
        studentId,
        className,
      ]);
    },

    async setClassGvcn(classId, gvcnName, client) {
      await exec(client).query('UPDATE school_classes SET gvcn_name = $2 WHERE id = $1', [
        classId,
        gvcnName,
      ]);
    },
  };
}
