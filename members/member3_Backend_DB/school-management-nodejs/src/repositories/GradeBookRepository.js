import { query } from '../config/db.js';

let memGrades = [
  { id: 1, student_id: 1, studentId: 1, student_code: 'HS001', studentCode: 'HS001', student_name: 'Nguyễn Thị Ánh', studentName: 'Nguyễn Thị Ánh', class_name: '10A1', className: '10A1', subject_name: 'Toán', subjectName: 'Toán', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 9.0, scoreOral: 9.0, score_15m: 8.5, score15m: 8.5, score_1hour: 8.0, score1Hour: 8.0, score_mid_term: 8.5, scoreMidTerm: 8.5, score_final_term: 9.0, scoreFinalTerm: 9.0, average_score: 8.7, averageScore: 8.7, grade_letter: 'Giỏi', gradeLetter: 'Giỏi', status: 'APPROVED' },
  { id: 2, student_id: 1, studentId: 1, student_code: 'HS001', studentCode: 'HS001', student_name: 'Nguyễn Thị Ánh', studentName: 'Nguyễn Thị Ánh', class_name: '10A1', className: '10A1', subject_name: 'Ngữ văn', subjectName: 'Ngữ văn', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 8.0, scoreOral: 8.0, score_15m: 8.0, score15m: 8.0, score_1hour: 7.5, score1Hour: 7.5, score_mid_term: 8.0, scoreMidTerm: 8.0, score_final_term: 8.5, scoreFinalTerm: 8.5, average_score: 8.1, averageScore: 8.1, grade_letter: 'Giỏi', gradeLetter: 'Giỏi', status: 'APPROVED' },
  { id: 3, student_id: 2, studentId: 2, student_code: 'HS002', studentCode: 'HS002', student_name: 'Trần Văn Bảo', studentName: 'Trần Văn Bảo', class_name: '10A1', className: '10A1', subject_name: 'Toán', subjectName: 'Toán', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 6.0, scoreOral: 6.0, score_15m: 6.5, score15m: 6.5, score_1hour: 7.0, score1Hour: 7.0, score_mid_term: 6.5, scoreMidTerm: 6.5, score_final_term: 7.0, scoreFinalTerm: 7.0, average_score: 6.7, averageScore: 6.7, grade_letter: 'Khá', gradeLetter: 'Khá', status: 'APPROVED' }
];

export class GradeBookRepository {
  static async findAll() {
    const res = await query('SELECT * FROM grade_books ORDER BY id ASC');
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return memGrades;
  }

  static async findById(id) {
    const res = await query('SELECT * FROM grade_books WHERE id = $1', [id]);
    if (res && res.rows && res.rows.length > 0) return res.rows[0];
    return memGrades.find(g => g.id === parseInt(id, 10)) || null;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM grade_books WHERE student_code = $1', [studentCode]);
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return memGrades.filter(g => g.student_code === studentCode || g.studentCode === studentCode);
  }

  static async findByClassName(className) {
    const res = await query('SELECT * FROM grade_books WHERE class_name = $1', [className]);
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return memGrades.filter(g => g.class_name === className || g.className === className);
  }

  static async findByClassNameAndSubjectName(className, subjectName) {
    const res = await query('SELECT * FROM grade_books WHERE class_name = $1 AND subject_name = $2', [className, subjectName]);
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return memGrades.filter(g => (g.class_name === className || g.className === className) && (g.subject_name === subjectName || g.subjectName === subjectName));
  }

  static async save(gb) {
    if (gb.id) {
      const res = await query(
        `UPDATE grade_books SET score_oral = $1, score_15m = $2, score_1hour = $3, score_mid_term = $4, score_final_term = $5, average_score = $6, grade_letter = $7, status = $8
         WHERE id = $9 RETURNING *`,
        [gb.scoreOral, gb.score15m, gb.score1Hour, gb.scoreMidTerm, gb.scoreFinalTerm, gb.averageScore, gb.gradeLetter, gb.status || 'APPROVED', gb.id]
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];

      const idx = memGrades.findIndex(item => item.id === parseInt(gb.id, 10));
      if (idx !== -1) {
        memGrades[idx] = { ...memGrades[idx], ...gb };
        return memGrades[idx];
      }
      return gb;
    } else {
      const res = await query(
        `INSERT INTO grade_books (student_id, student_code, student_name, class_name, subject_name, semester, school_year, score_oral, score_15m, score_1hour, score_mid_term, score_final_term, average_score, grade_letter, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [gb.studentId, gb.studentCode, gb.studentName, gb.className, gb.subjectName, gb.semester, gb.schoolYear, gb.scoreOral, gb.score15m, gb.score1Hour, gb.scoreMidTerm, gb.scoreFinalTerm, gb.averageScore, gb.gradeLetter, gb.status || 'APPROVED']
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];

      const newObj = {
        id: memGrades.length + 1,
        ...gb
      };
      memGrades.push(newObj);
      return newObj;
    }
  }

  static async updateStatusByClassAndSubject(className, subjectName, status) {
    await query('UPDATE grade_books SET status = $1 WHERE class_name = $2 AND subject_name = $3', [status, className, subjectName]);
    memGrades.forEach(g => {
      if ((g.class_name === className || g.className === className) && (g.subject_name === subjectName || g.subjectName === subjectName)) {
        g.status = status;
      }
    });
  }
}
