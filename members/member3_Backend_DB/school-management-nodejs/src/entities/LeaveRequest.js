/**
 * Clean Architecture - Entity Layer: LeaveRequest Domain Model
 */
export class LeaveRequest {
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
    this.fromDate = data.fromDate || data.from_date;
    this.from_date = this.fromDate;
    this.toDate = data.toDate || data.to_date;
    this.to_date = this.toDate;
    this.reason = data.reason;
    this.status = data.status || 'PENDING';
    this.createdAt = data.createdAt || data.created_at;
    this.created_at = this.createdAt;
  }
}