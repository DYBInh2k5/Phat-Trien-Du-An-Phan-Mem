/**
 * Clean Architecture - Entity Layer: GradeBook Domain Model
 */
export class GradeBook {
  constructor(data = {}) {
    this.id = data.id;
    this.studentId = data.studentId || data.student_id;
    this.student_id = this.studentId;
    this.studentCode = data.studentCode || data.student_code;
    this.student_code = this.studentCode;
    this.studentName = data.studentName || data.student_name;
    this.student_name = this.studentName;
    this.className = data.className || data.class_name;
    this.class_name = this.className;
    this.subjectName = data.subjectName || data.subject_name;
    this.subject_name = this.subjectName;
    this.semester = data.semester || 'HK1';
    this.schoolYear = data.schoolYear || data.school_year || '2025-2026';
    this.school_year = this.schoolYear;
    this.scoreOral = parseFloat(data.scoreOral || data.score_oral || 0);
    this.score_oral = this.scoreOral;
    this.score15m = parseFloat(data.score15m || data.score_15m || 0);
    this.score_15m = this.score15m;
    this.score1Hour = parseFloat(data.score1Hour || data.score_1hour || 0);
    this.score_1hour = this.score1Hour;
    this.scoreMidTerm = parseFloat(data.scoreMidTerm || data.score_mid_term || 0);
    this.score_mid_term = this.scoreMidTerm;
    this.scoreFinalTerm = parseFloat(data.scoreFinalTerm || data.score_final_term || 0);
    this.score_final_term = this.scoreFinalTerm;
    this.averageScore = parseFloat(data.averageScore || data.average_score || 0);
    this.average_score = this.averageScore;
    this.gradeLetter = data.gradeLetter || data.grade_letter || 'Chưa xếp loại';
    this.grade_letter = this.gradeLetter;
    this.status = data.status || 'APPROVED';
  }

  calculateAverage() {
    const avg = (this.scoreOral * 1 + this.score15m * 1 + this.score1Hour * 2 + this.scoreMidTerm * 2 + this.scoreFinalTerm * 3) / 9;
    this.averageScore = Math.round(avg * 10) / 10;
    this.average_score = this.averageScore;
    return this.averageScore;
  }
}
