/**
 * Clean Architecture - Entity Layer: Tuition Domain Model
 */
export class Tuition {
  constructor(data = {}) {
    this.id = data.id;
    this.studentCode = data.studentCode || data.student_code;
    this.student_code = this.studentCode;
    this.studentName = data.studentName || data.student_name;
    this.student_name = this.studentName;
    this.className = data.className || data.class_name;
    this.class_name = this.className;
    this.semester = data.semester || 'HK1';
    this.schoolYear = data.schoolYear || data.school_year || '2025-2026';
    this.school_year = this.schoolYear;
    this.amountDue = parseFloat(data.amountDue || data.amount_due || 0.0);
    this.amount_due = this.amountDue;
    this.amountPaid = parseFloat(data.amountPaid || data.amount_paid || 0.0);
    this.amount_paid = this.amountPaid;
    this.status = data.status || 'UNPAID';
    this.receiptNo = data.receiptNo || data.receipt_no;
    this.receipt_no = this.receiptNo;
  }
}