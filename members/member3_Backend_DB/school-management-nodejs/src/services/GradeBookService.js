import { GradeBookRepository } from '../repositories/GradeBookRepository.js';

export class GradeBookService {
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
