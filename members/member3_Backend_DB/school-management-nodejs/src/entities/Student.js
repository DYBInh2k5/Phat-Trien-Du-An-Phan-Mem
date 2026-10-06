/**
 * Clean Architecture - Entity Layer: Student Domain Model
 */
export class Student {
  constructor(data = {}) {
    this.id = data.id;
    this.studentCode = data.studentCode || data.student_code;
    this.student_code = this.studentCode;
    this.fullName = data.fullName || data.full_name;
    this.full_name = this.fullName;
    this.gender = data.gender;
    this.dob = data.dob;
    this.className = data.className || data.class_name;
    this.class_name = this.className;
    this.parentName = data.parentName || data.parent_name;
    this.parent_name = this.parentName;
    this.parentPhone = data.parentPhone || data.parent_phone;
    this.parent_phone = this.parentPhone;
    this.gpa = parseFloat(data.gpa || 0.0);
    this.academicRank = data.academicRank || data.academic_rank;
    this.academic_rank = this.academicRank;
    this.status = data.status || 'ACTIVE';
  }
}
