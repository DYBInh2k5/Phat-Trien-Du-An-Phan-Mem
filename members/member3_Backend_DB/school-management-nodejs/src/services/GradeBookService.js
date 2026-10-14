import { GradeBookRepository } from '../repositories/GradeBookRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { SubjectRepository } from '../repositories/SubjectRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';

export class GradeBookService {
  /**
   * Lấy toàn bộ dữ liệu cần thiết cho trang GradebookPage:
   *   - classes, subjects, students trong lớp, gradeRows
   * @param {string} className
   * @param {string} semester  - 'HK1' | 'HK2'
   * @param {string} schoolYear
   */
  static async getGradebookPageData(className, semester, schoolYear) {
    const [rawClasses, rawSubjects, rawStudents, rawGrades] = await Promise.all([
      ClassRepository.findAll(),
      SubjectRepository.findAll(),
      StudentRepository.findByClassName(className),
      GradeBookRepository.findByClassNameAndSemester(className, semester, schoolYear),
    ]);

    const classes = rawClasses.map((c) => ({
      id:   c.class_name,
      name: c.class_name,
    }));

    const subjects = rawSubjects.map((s) => ({
      id:   s.code || s.name,
      name: s.name,
    }));

    const students = rawStudents.map((s) => ({
      id:        s.student_code || s.studentCode,
      name:      s.full_name    || s.fullName,
      classId:   s.class_name   || s.className,
      code:      s.student_code || s.studentCode,
    }));

    // Build gradeRows: flat array dễ dùng ở frontend
    const gradeRows = rawGrades.map((g) => ({
      id:            g.id,
      studentCode:   g.student_code || g.studentCode,
      studentName:   g.student_name || g.studentName,
      className:     g.class_name   || g.className,
      subjectName:   g.subject_name || g.subjectName,
      subjectId:     g.subject_name || g.subjectName, // dùng name làm id cho đồng nhất
      semester:      g.semester,
      schoolYear:    g.school_year  || g.schoolYear,
      scoreOral:     g.score_oral   != null ? parseFloat(g.score_oral)   : null,
      score15m:      g.score_15m    != null ? parseFloat(g.score_15m)    : null,
      score1Hour:    g.score_1hour  != null ? parseFloat(g.score_1hour)  : null,
      scoreMidTerm:  g.score_mid_term  != null ? parseFloat(g.score_mid_term)  : null,
      scoreFinalTerm:g.score_final_term!= null ? parseFloat(g.score_final_term): null,
      averageScore:  g.average_score   != null ? parseFloat(g.average_score)   : null,
      status:        g.status,
    }));

    return { classes, subjects, students, gradeRows };
  }

  /**
   * Lưu hàng loạt grades từ spreadsheet.
   * Mỗi item: { studentCode, studentName, className, subjectId (=subjectName),
   *             semester, schoolYear, scoreOral, score15m, score1Hour,
   *             scoreMidTerm, scoreFinalTerm }
   */
  static async saveGradesFromSpreadsheet(items) {
    const results = [];
    for (const item of items) {
      const gb = {
        studentCode:    item.studentCode,
        studentName:    item.studentName,
        className:      item.className,
        subjectName:    item.subjectId, // subjectId is subjectName on this page
        semester:       item.semester,
        schoolYear:     item.schoolYear,
        scoreOral:      item.scoreOral,
        score15m:       item.score15m,
        score1Hour:     item.score1Hour,
        scoreMidTerm:   item.scoreMidTerm,
        scoreFinalTerm: item.scoreFinalTerm,
        status:         'APPROVED',
      };
      const saved = await this.saveGrade(gb);
      results.push(saved);
    }
    return results;
  }

  static async getGrades({ studentCode, className, subjectName }) {
    if (studentCode) {
      return await GradeBookRepository.findByStudentCode(studentCode);
    }
    if (className && subjectName) {
      return await GradeBookRepository.findByClassNameAndSubjectName(className, subjectName);
    }
    if (className) {
      return await GradeBookRepository.findByClassName(className);
    }
    return await GradeBookRepository.findAll();
  }

  static async saveGrade(gradeBook) {
    if (gradeBook.id) {
      const existing = await GradeBookRepository.findById(gradeBook.id);
      if (existing && existing.status === 'LOCKED') {
        throw new Error('Grade sheet is locked by BGH and cannot be edited.');
      }
    }

    const calculated = this.calculateTBM(gradeBook);
    return await GradeBookRepository.save(calculated);
  }

  static async saveAllGrades(gradeBooks) {
    const savedList = [];
    for (const gb of gradeBooks) {
      if (gb.id) {
        const existing = await GradeBookRepository.findById(gb.id);
        if (existing && existing.status === 'LOCKED') {
          throw new Error(`Grade entry for student ${gb.studentCode || gb.student_code} is locked.`);
        }
      }
      const calculated = this.calculateTBM(gb);
      const saved = await GradeBookRepository.save(calculated);
      savedList.push(saved);
    }
    return savedList;
  }

  static async lockGradeSheet(className, subjectName) {
    await GradeBookRepository.updateStatusByClassAndSubject(className, subjectName, 'LOCKED');
  }

  static async unlockGradeSheet(className, subjectName) {
    await GradeBookRepository.updateStatusByClassAndSubject(className, subjectName, 'APPROVED');
  }

  static calculateTBM(gb) {
    const oral = parseFloat(gb.scoreOral || gb.score_oral || 0);
    const m15 = parseFloat(gb.score15m || gb.score_15m || 0);
    const h1 = parseFloat(gb.score1Hour || gb.score_1hour || 0);
    const mid = parseFloat(gb.scoreMidTerm || gb.score_mid_term || 0);
    const fin = parseFloat(gb.scoreFinalTerm || gb.score_final_term || 0);

    if (oral > 0 && m15 > 0 && h1 > 0 && mid > 0 && fin > 0) {
      const total = oral + m15 + (h1 * 2) + (mid * 2) + (fin * 3);
      const avg = Math.round((total / 9.0) * 10) / 10;
      gb.averageScore = avg;
      gb.average_score = avg;

      if (avg >= 9.0) gb.gradeLetter = 'Xuất sắc';
      else if (avg >= 8.0) gb.gradeLetter = 'Giỏi';
      else if (avg >= 6.5) gb.gradeLetter = 'Khá';
      else if (avg >= 5.0) gb.gradeLetter = 'Trung bình';
      else gb.gradeLetter = 'Yếu';
      gb.grade_letter = gb.gradeLetter;
    }
    return gb;
  }
}
