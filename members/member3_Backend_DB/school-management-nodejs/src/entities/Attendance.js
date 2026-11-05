/**
 * Clean Architecture - Entity Layer: Attendance Domain Model
 */
export class Attendance {
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
    this.attDate = data.attDate || data.att_date;
    this.att_date = this.attDate;
    this.status = data.status || 'PRESENT';
    this.note = data.note || null;
  }
}