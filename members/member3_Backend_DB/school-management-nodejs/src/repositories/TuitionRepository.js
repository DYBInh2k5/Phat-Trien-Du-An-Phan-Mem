import { querySafe as query } from '../config/db.js';

// Dữ liệu học phí mẫu dự phòng (In-Memory Fallback khi CSDL chưa khởi tạo học phí)
const inMemoryTuitions = [
  {
    id: 1,
    student_code: 'HS001',
    studentCode: 'HS001',
    student_name: 'Nguyễn Thị Ánh',
    studentName: 'Nguyễn Thị Ánh',
    class_name: '10A1',
    className: '10A1',
    semester: 'HK1',
    school_year: '2024-2025',
    amount_due: 1500000,
    amountDue: 1500000,
    amount_paid: 0,
    amountPaid: 0,
    status: 'UNPAID',
    receipt_no: null
  },
  {
    id: 2,
    student_code: 'HS001',
    studentCode: 'HS001',
    student_name: 'Nguyễn Thị Ánh',
    studentName: 'Nguyễn Thị Ánh',
    class_name: '10A1',
    className: '10A1',
    semester: 'HK1',
    school_year: '2024-2025',
    amount_due: 800000,
    amountDue: 800000,
    amount_paid: 0,
    amountPaid: 0,
    status: 'UNPAID',
    receipt_no: null
  },
  {
    id: 3,
    student_code: 'HS002',
    studentCode: 'HS002',
    student_name: 'Trần Văn Bảo',
    studentName: 'Trần Văn Bảo',
    class_name: '10A1',
    className: '10A1',
    semester: 'HK1',
    school_year: '2024-2025',
    amount_due: 1500000,
    amountDue: 1500000,
    amount_paid: 0,
    amountPaid: 0,
    status: 'UNPAID',
    receipt_no: null
  }
];

export class TuitionRepository {
  static async findAll() {
    const res = await query('SELECT * FROM tuitions ORDER BY id ASC');
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return inMemoryTuitions;
  }

  static async findById(id) {
    const res = await query('SELECT * FROM tuitions WHERE id = $1', [id]);
    if (res && res.rows && res.rows[0]) return res.rows[0];
    return inMemoryTuitions.find(t => String(t.id) === String(id)) || null;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM tuitions WHERE student_code = $1', [studentCode]);
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return inMemoryTuitions.filter(t => (t.student_code || t.studentCode) === studentCode);
  }

  static async findByClassName(className) {
    const res = await query('SELECT * FROM tuitions WHERE class_name = $1', [className]);
    if (res && res.rows && res.rows.length > 0) return res.rows;
    return inMemoryTuitions.filter(t => (t.class_name || t.className) === className);
  }

  static async save(t, client = null) {
    if (t.id) {
      const sql = `UPDATE tuitions SET amount_paid = $1, status = $2, receipt_no = $3 WHERE id = $4 RETURNING *`;
      const params = [t.amountPaid, t.status, t.receiptNo, t.id];
      if (client) {
        const res = await client.query(sql, params);
        if (res && res.rows && res.rows[0]) return res.rows[0];
      } else {
        const res = await query(sql, params);
        if (res && res.rows && res.rows[0]) return res.rows[0];
      }

      // In-memory fallback
      const found = inMemoryTuitions.find(item => String(item.id) === String(t.id));
      if (found) {
        found.amount_paid = t.amountPaid;
        found.amountPaid = t.amountPaid;
        found.status = t.status;
        found.receipt_no = t.receiptNo;
        found.receiptNo = t.receiptNo;
        return found;
      }
      return t;
    } else {
      const sql = `INSERT INTO tuitions (student_code, student_name, class_name, semester, school_year, amount_due, amount_paid, status, receipt_no)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
      const params = [t.studentCode, t.studentName, t.className, t.semester, t.schoolYear, t.amountDue, t.amountPaid || 0, t.status || 'UNPAID', t.receiptNo];
      if (client) {
        const res = await client.query(sql, params);
        if (res && res.rows && res.rows[0]) return res.rows[0];
      } else {
        const res = await query(sql, params);
        if (res && res.rows && res.rows[0]) return res.rows[0];
      }

      const newId = inMemoryTuitions.length + 1;
      const newRec = { id: newId, ...t };
      inMemoryTuitions.push(newRec);
      return newRec;
    }
  }
}


