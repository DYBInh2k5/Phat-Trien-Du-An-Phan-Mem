/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: AttendanceRepository.js
 * Vai trò: Kho Dữ Liệu Điểm Danh Chuyên Cần (Attendance Data Access Repository)
 * UAT-06: Nâng cấp điểm danh 2 cấp theo tiết học
 *   - period 0 = GVCN điểm danh đầu giờ
 *   - period 1..10 = GVBM điểm danh theo tiết
 *   - UNIQUE (student_code, class_name, att_date, period) — 2 cấp không ghi đè nhau
 *   - Thêm: subject_name, recorded_by, late_minutes
 *   - In-memory fallback hoàn chỉnh cho môi trường dev/demo
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';

/**
 * Kho lưu trữ điểm danh in-memory dùng khi DB offline.
 * @type {Array<Object>}
 */
const memAttendances = [];
let _nextId = 1;

/**
 * Tìm index trong memAttendances theo UNIQUE key (student_code, class_name, att_date, period).
 */
function findMemIdx(studentCode, className, attDate, period) {
  return memAttendances.findIndex(
    a => a.student_code === studentCode &&
         a.class_name  === className   &&
         a.att_date    === attDate      &&
         Number(a.period) === Number(period)
  );
}

export class AttendanceRepository {
  static async findAll() {
    const res = await query('SELECT * FROM attendances');
    if (res && res.rows) return res.rows;
    return memAttendances;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM attendances WHERE student_code = $1', [studentCode]);
    if (res && res.rows) return res.rows;
    return memAttendances.filter(a => a.student_code === studentCode);
  }

  /**
   * Lấy điểm danh theo lớp + ngày (tương thích ngược, không lọc period).
   */
  static async findByClassNameAndDate(className, attDate) {
    const res = await query(
      'SELECT * FROM attendances WHERE class_name = $1 AND att_date = $2 ORDER BY period ASC, student_code ASC',
      [className, attDate]
    );
    if (res && res.rows) return res.rows;
    return memAttendances.filter(a => a.class_name === className && a.att_date === attDate);
  }

  /**
   * Lấy điểm danh theo lớp + ngày + period cụ thể (UAT-06).
   * period=0: đầu giờ GVCN; period=1..10: tiết học GVBM.
   *
   * @param {string} className
   * @param {string} attDate - YYYY-MM-DD
   * @param {number} period  - 0..10
   * @returns {Promise<Array>}
   */
  static async findByClassDatePeriod(className, attDate, period) {
    const res = await query(
      `SELECT * FROM attendances
       WHERE class_name = $1 AND att_date = $2 AND period = $3
       ORDER BY student_code ASC`,
      [className, attDate, Number(period)]
    );
    if (res && res.rows) return res.rows;
    return memAttendances.filter(
      a => a.class_name === className &&
           a.att_date   === attDate   &&
           Number(a.period) === Number(period)
    );
  }

  /**
   * Tổng hợp điểm danh theo lớp trong khoảng ngày.
   * Chỉ tính period=0 (đầu giờ GVCN) để không đếm trùng nhiều tiết.
   */
  static async getSummaryByClass(dateFrom, dateTo, className) {
    const conditions = [
      `a.att_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`,
      `a.period = 0`,   // chỉ tính điểm danh đầu giờ
    ];
    const params = [];

    if (dateFrom) { params.push(dateFrom); conditions.push(`a.att_date::date >= $${params.length}::date`); }
    if (dateTo)   { params.push(dateTo);   conditions.push(`a.att_date::date <= $${params.length}::date`); }
    if (className) { params.push(className); conditions.push(`a.class_name = $${params.length}`); }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const res = await query(
      `SELECT
         a.class_name,
         sc.gvcn_name,
         COUNT(DISTINCT a.student_code)                        AS total_students,
         COUNT(*)                                              AS total_records,
         COUNT(*) FILTER (WHERE a.status = 'PRESENT')         AS present_count
       FROM attendances a
       LEFT JOIN school_classes sc ON sc.class_name = a.class_name
       ${whereClause}
       GROUP BY a.class_name, sc.gvcn_name
       HAVING COUNT(*) > 0
       ORDER BY a.class_name ASC`,
      params
    );
    if (!res) return [];
    return res.rows;
  }

  static async getDistinctClassNames() {
    const res = await query(`SELECT DISTINCT class_name FROM attendances ORDER BY class_name ASC`);
    if (!res) return [];
    return res.rows.map(r => r.class_name);
  }

  /**
   * Upsert điểm danh theo UNIQUE key (student_code, class_name, att_date, period).
   * period=0: GVCN đầu giờ; period=1..10: GVBM theo tiết — không ghi đè nhau.
   * Lưu thêm: subject_name, recorded_by, late_minutes.
   *
   * @param {Object} att
   * @param {string}  att.studentCode
   * @param {string}  att.studentName
   * @param {string}  att.className
   * @param {string}  att.attDate       - YYYY-MM-DD
   * @param {number}  [att.period=0]    - 0=GVCN, 1..10=GVBM
   * @param {string}  [att.subjectName] - tên môn (khi period>0)
   * @param {string}  [att.recordedBy]  - username người điểm danh
   * @param {number}  [att.lateMinutes=0]
   * @param {string}  att.status        - PRESENT|LATE|ABSENT
   * @param {string}  [att.note]
   * @returns {Promise<Object>}
   */
  static async upsert(att) {
    const period      = att.period      != null ? Number(att.period) : 0;
    const lateMinutes = att.lateMinutes != null ? Number(att.lateMinutes) : 0;
    const subjectName = att.subjectName || att.subject_name || null;
    const recordedBy  = att.recordedBy  || att.recorded_by  || null;

    // Tìm student_id nếu chưa có
    let studentId = att.studentId ?? null;
    if (!studentId && att.studentCode) {
      const stRes = await query('SELECT id FROM students WHERE student_code = $1 LIMIT 1', [att.studentCode]);
      studentId = stRes?.rows[0]?.id ?? null;
    }

    // ── PostgreSQL upsert với UNIQUE (student_code, class_name, att_date, period) ──
    const res = await query(
      `INSERT INTO attendances
         (student_id, student_code, student_name, class_name, att_date,
          period, subject_name, recorded_by, late_minutes, status, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (student_code, class_name, att_date, period)
       DO UPDATE SET
         status       = EXCLUDED.status,
         note         = EXCLUDED.note,
         student_name = EXCLUDED.student_name,
         subject_name = EXCLUDED.subject_name,
         recorded_by  = EXCLUDED.recorded_by,
         late_minutes = EXCLUDED.late_minutes
       RETURNING *`,
      [studentId, att.studentCode, att.studentName, att.className, att.attDate,
       period, subjectName, recordedBy, lateMinutes, att.status, att.note ?? null]
    );
    if (res && res.rows && res.rows.length > 0) return res.rows[0];

    // ── Fallback in-memory ──
    const idx = findMemIdx(att.studentCode, att.className, att.attDate, period);
    const record = {
      id:           idx >= 0 ? memAttendances[idx].id : _nextId++,
      student_id:   studentId,
      student_code: att.studentCode,
      student_name: att.studentName,
      class_name:   att.className,
      att_date:     att.attDate,
      period,
      subject_name: subjectName,
      recorded_by:  recordedBy,
      late_minutes: lateMinutes,
      status:       att.status,
      note:         att.note ?? null,
    };
    if (idx >= 0) memAttendances[idx] = record;
    else memAttendances.push(record);
    return record;
  }

  /** Legacy save (giữ tương thích ngược) */
  static async save(att) {
    if (att.id) {
      const res = await query(
        'UPDATE attendances SET status = $1, note = $2 WHERE id = $3 RETURNING *',
        [att.status, att.note, att.id]
      );
      if (res && res.rows) return res.rows[0];
      const idx = memAttendances.findIndex(a => a.id === att.id);
      if (idx >= 0) { memAttendances[idx] = { ...memAttendances[idx], status: att.status, note: att.note }; return memAttendances[idx]; }
      return att;
    }
    return this.upsert(att);
  }
}
