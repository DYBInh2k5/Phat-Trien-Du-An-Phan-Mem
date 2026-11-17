/**
 * ============================================================================
 * HỒ SƠ TỆP: exportEngine.js — Động Cơ Xuất Báo Cáo Học Vụ (Export Engine)
 * ----------------------------------------------------------------------------
 * MỤC ĐÍCH: Cung cấp các hàm xuất dữ liệu học vụ ra định dạng Excel (.xlsx)
 *            bằng SheetJS và sinh nội dung in ấn PDF (Phiếu báo điểm, Biên lai
 *            học phí) dưới dạng HTML chuẩn biểu mẫu Sở GD&ĐT TP.HCM.
 * VỊ TRÍ KIẾN TRÚC: Tầng tiện ích xuất báo cáo (Export Engine Pattern) —
 *                   được QA Test Suite và các demo gọi trực tiếp, không phụ
 *                   thuộc cơ sở dữ liệu hay API nào.
 * TÁC GIẢ: Nguyễn Minh Quốc Bảo (Member 5 — Tester/QA Lead)
 * NGÀY TẠO: 27/10/2026 (Tuần 7) — CẬP NHẬT: 16/11/2026 (Tuần 10: chuẩn hóa
 *           chú thích tiếng Việt theo AGENTS.md, bổ sung tham số outputDir)
 * MÔI TRƯỜNG: Node.js (không dùng browser APIs — window/document).
 * ============================================================================
 */

// Tạo hàm require() cho mô-đun ESM để nạp SheetJS ở dạng CommonJS
// (createRequire cho phép require('xlsx') hoạt động trong tệp "type": "module")
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let xlsx = null;

/**
 * Nạp lưỡi (lazy-load) thư viện SheetJS (`xlsx`) khi cần dùng.
 * Nếu môi trường không có gói `xlsx`, trả về sentinel để hàm gọi biết mà
 * chuyển sang chế độ dự phòng (chỉ trả dữ liệu dòng, không ghi file).
 *
 * @returns {object|null} Module SheetJS đã nạp, hoặc sentinel { utils: null }.
 */
function getXlsx() {
  if (xlsx) return xlsx;
  // SheetJS CE (`xlsx`) không ghi được style ô; `xlsx-js-style` là fork giữ nguyên
  // API 0.18.x và bổ sung ghi style, cần cho header in đậm + hàng xen kẽ (PBI-15).
  for (const packageId of ['xlsx-js-style', 'xlsx']) {
    try {
      xlsx = require(packageId);
      break;
    } catch { /* thử gói kế tiếp */ }
  }
  // Không có thư viện nào — báo hiệu cho chế độ dự phòng
  return xlsx ?? (xlsx = { utils: null });
}

/**
 * Làm sạch một đoạn tên tệp: bỏ khoảng trắng và ký tự không hợp lệ trên Windows.
 * @param {string} value - Đoạn tên gốc (tên lớp, môn học, học kỳ).
 * @param {string} fallback - Giá trị thay thế khi đoạn tên rỗng.
 * @returns {string} Đoạn tên an toàn để đặt tên tệp.
 */
function toFileSegment(value, fallback) {
  const cleaned = String(value ?? '').trim().replace(/\s+/g, '').replace(/[\\/:*?"<>|]/g, '');
  return cleaned || fallback;
}

/**
 * Gắn style cho sheet sổ điểm: hàng tiêu đề in đậm, hàng dữ liệu chẵn nền xám nhạt
 * để xen kẽ với hàng trắng (PBI-15). Chỉ có hiệu lực khi thư viện ghi style được nạp.
 * @param {object} lib - Module SheetJS đã nạp.
 * @param {object} worksheet - Worksheet vừa tạo từ mảng 2 chiều.
 * @param {number} totalRows - Tổng số dòng của mảng 2 chiều (kể cả tiêu đề).
 */
function styleGradeBookSheet(lib, worksheet, totalRows) {
  const headerStyle = {
    font: { bold: true },
    fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  const stripedStyle = { fill: { patternType: 'solid', fgColor: { rgb: 'F2F2F2' } } };

  for (let r = 0; r < totalRows; r += 1) {
    // Dòng 0 là tiêu đề; các dòng dữ liệu 1,3,5… (chỉ số lẻ) xen kẽ nền xám
    const style = r === 0 ? headerStyle : (r % 2 === 0 ? stripedStyle : null);
    if (!style) continue;
    for (let c = 0; c < 32; c += 1) {
      const addr = lib.utils.encode_cell({ r, c });
      if (worksheet[addr]) worksheet[addr].s = style;
    }
  }
}

// ─── UC-GVCN-10 / UC-GVBM-10: Xuất Sổ Điểm ra Excel ─────────────────────────

/**
 * Xuất bảng điểm của một lớp ra tệp Excel (.xlsx) thật bằng SheetJS.
 * Chấp nhận cả dữ liệu dạng camelCase (từ API Node.js) và snake_case (từ CSDL
 * PostgreSQL) nhờ toán tử ?? chọn trường khả dụng. Tự động căn độ rộng cột.
 * Nếu không ghi được file (môi trường chỉ đọc), trả về buffer hoặc dữ liệu dòng.
 *
 * @param {string} className - Tên lớp, ví dụ '10A1' (dùng đặt tên file).
 * @param {string} subjectName - Tên môn học, ví dụ 'Toán Học'.
 * @param {Array<Object>} gradeData - Danh sách điểm học sinh.
 * @param {string} [outputDir='.'] - Thư mục ghi file .xlsx (mặc định: thư mục hiện tại).
 * @param {string} [semester='HK1'] - Học kỳ, dùng đặt tên tệp theo PBI-15.
 * @returns {{success: boolean, fileName: string, rowCount: number, filePath?: string, buffer?: Buffer, rows?: Array}}
 * @throws {Error} Không ném trực tiếp — mọi lỗi đều được ghi log và chuyển về kết quả dự phòng.
 */
export function exportGradeBookToExcel(className, subjectName, gradeData = [], outputDir = '.', semester = 'HK1') {
  // Tên tệp theo DoD PBI-15: SoDiem_[TenLop]_[MonHoc]_[HocKy].xlsx
  const fileName = `SoDiem_${toFileSegment(className, 'Lop')}_${toFileSegment(subjectName, 'Mon')}_${toFileSegment(semester, 'HK1')}.xlsx`;

  // Bước 1: Chuẩn hóa từng dòng điểm sang tiêu đề cột tiếng Việt chuẩn Thông tư 22
  const excelRows = gradeData.map((item, index) => ({
    'STT':           index + 1,
    'Mã Học Sinh':   item.studentCode  ?? item.student_code  ?? '',
    'Họ và Tên':     item.studentName  ?? item.student_name  ?? item.fullName ?? '',
    'Điểm Miệng':    item.scoreOral    ?? item.score_oral    ?? 0,
    'Điểm 15 Phút':  item.score15m     ?? item.score_15m     ?? 0,
    'Điểm 1 Tiết':   item.score1Hour   ?? item.score_1hour   ?? 0,
    'Điểm Giữa Kỳ':  item.scoreMidTerm ?? item.score_mid_term ?? 0,
    'Điểm Cuối Kỳ':  item.scoreFinalTerm ?? item.score_final_term ?? 0,
    'Điểm TBM':      item.averageScore ?? item.average_score ?? 0,
    'Xếp Loại':      item.gradeLetter  ?? item.grade_letter  ?? 'Chưa xếp loại',
  }));

  try {
    const lib = getXlsx();
    if (!lib || !lib.utils) {
      // Chế độ dự phòng: thiếu SheetJS — chỉ trả dữ liệu dòng đã chuẩn hóa
      return { success: true, fileName, rowCount: excelRows.length, rows: excelRows };
    }

    // Bước 2: Chuyển dữ liệu sang dạng mảng 2 chiều (Array-of-Arrays) cho SheetJS
    const headers = Object.keys(excelRows[0] ?? { STT: '' });
    const aoa = [headers, ...excelRows.map(r => headers.map(h => r[h] ?? ''))];

    const worksheet = lib.utils.aoa_to_sheet(aoa);

    // Bước 3: Tự động căn độ rộng cột theo nội dung dài nhất (tối đa 40 ký tự)
    worksheet['!cols'] = headers.map((h, i) => {
      let max = String(h).length;
      aoa.slice(1).forEach(row => {
        const v = row[i];
        if (v !== undefined && v !== null) max = Math.max(max, String(v).length);
      });
      return { wch: Math.min(Math.max(max + 4, 10), 40) };
    });

    // Header in đậm + hàng dữ liệu xen kẽ trắng/xám nhạt (PBI-15)
    styleGradeBookSheet(lib, worksheet, aoa.length);

    const workbook = lib.utils.book_new();
    lib.utils.book_append_sheet(workbook, worksheet, `Lớp ${className}`);

    // Bước 4: Ghi file .xlsx thật; nếu thư mục chỉ đọc thì trả buffer thay thế
    const filePath = `${outputDir.replace(/[\\/]+$/, '')}/${fileName}`;
    try {
      lib.writeFile(workbook, filePath);
      return { success: true, fileName, rowCount: excelRows.length, filePath };
    } catch (writeErr) {
      const buf = lib.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return { success: true, fileName, rowCount: excelRows.length, buffer: buf };
    }
  } catch (err) {
    console.error('[exportEngine] exportGradeBookToExcel error:', err?.message);
    // Phương án cuối cùng: trả dữ liệu dòng để không làm gián đoạn luồng nghiệp vụ
    return { success: true, fileName, rowCount: excelRows.length, rows: excelRows };
  }
}

// ─── EPIC-10: Thống Kê Phổ Điểm Toàn Trường (Excel) ─────────────────────────

/** Nhãn 4 mức học lực theo Thông tư 22, dùng làm thứ tự cột thống kê. */
const ACADEMIC_RANK_LABELS = ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'];

/** Lấy khóa nhóm của một học sinh theo tiêu chí thống kê. */
function groupKeyOf(student, groupBy) {
  if (groupBy === 'className') {
    return student.className ?? student.class_name ?? 'Chưa xếp lớp';
  }
  if (groupBy === 'school') return 'Toàn trường';
  return student.gradeLevel ?? student.grade_level ?? student.className ?? student.class_name ?? 'Khối khác';
}

/**
 * Điểm dùng để xếp loại: trả về số hữu hạn đầu tiên, hoặc null khi học sinh
 * chưa có điểm. Phân biệt "chưa nhập điểm" với "điểm thấp" để không đẩy học
 * sinh chưa có điểm vào nhóm Chưa đạt.
 */
function scoreValueOf(...candidates) {
  for (const raw of candidates) {
    if (raw === null || raw === undefined || raw === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

/**
 * Tổng hợp phổ điểm theo 4 mức học lực Thông tư 22 (Tốt/Khá/Đạt/Chưa đạt).
 * Dùng cho báo cáo chất lượng giáo dục của BGH (EPIC-10) — số liệu khớp với
 * cách xếp loại cá nhân vì dùng chung `rankAcademicScore`.
 *
 * Học sinh chưa có điểm không bị xếp vào "Chưa đạt": chúng được đếm riêng ở
 * `chuaCoDiem`, còn tỷ lệ 4 mức tính trên số học sinh đã có điểm (`graded`).
 *
 * @param {Array<{studentCode?: string, className?: string, gradeLevel?: string|number, gpa?: number, averageScore?: number}>} students
 * @param {'gradeLevel'|'className'|'school'} [groupBy='gradeLevel'] - Tiêu chí nhóm.
 * @returns {Array<{group: string, total: number, graded: number, tot: number, kha: number, dat: number,
 *          chuadat: number, chuaCoDiem: number, totPct: number, khaPct: number, datPct: number,
 *          chuadatPct: number, chuaCoDiemPct: number}>}
 */
export function buildScoreDistribution(students = [], groupBy = 'gradeLevel') {
  const buckets = new Map();

  students.forEach((student) => {
    const key = groupKeyOf(student, groupBy);
    if (!buckets.has(key)) {
      buckets.set(key, { group: key, total: 0, graded: 0, tot: 0, kha: 0, dat: 0, chuadat: 0, chuaCoDiem: 0 });
    }
    const bucket = buckets.get(key);
    bucket.total += 1;
    const score = scoreValueOf(student.gpa, student.averageScore, student.average_score);
    if (score === null) {
      bucket.chuaCoDiem += 1;
      return;
    }
    bucket.graded += 1;
    const rank = rankAcademicScore(score);
    if (rank === 'Tốt') bucket.tot += 1;
    else if (rank === 'Khá') bucket.kha += 1;
    else if (rank === 'Đạt') bucket.dat += 1;
    else bucket.chuadat += 1;
  });

  const percent = (count, total) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0);
  const rows = [...buckets.values()].sort((a, b) => String(a.group).localeCompare(String(b.group), 'vi'));

  return rows.map((row) => ({
    ...row,
    totPct:         percent(row.tot, row.graded),
    khaPct:         percent(row.kha, row.graded),
    datPct:         percent(row.dat, row.graded),
    chuadatPct:     percent(row.chuadat, row.graded),
    chuaCoDiemPct:  percent(row.chuaCoDiem, row.total),
  }));
}

/**
 * Xuất báo cáo phổ điểm toàn trường ra Excel (.xlsx) bằng SheetJS, kèm dòng
 * tổng cộng toàn trường. Thiếu SheetJS hoặc không ghi được file thì trả dữ
 * liệu dòng để không chặn luồng báo cáo.
 *
 * @param {Array<Object>} students - Danh sách học sinh kèm điểm trung bình.
 * @param {{groupBy?: 'gradeLevel'|'className'|'school', outputDir?: string, fileName?: string}} [options]
 * @returns {{success: boolean, fileName: string, rowCount: number, filePath?: string, buffer?: Buffer, rows: Array}}
 */
export function exportScoreDistributionToExcel(students = [], options = {}) {
  const groupBy   = options.groupBy ?? 'gradeLevel';
  const outputDir = options.outputDir ?? '.';
  const suffix    = groupBy === 'school' ? 'Toan_Truong' : groupBy === 'className' ? 'Theo_Lop' : 'Theo_Khoi';
  const fileName  = options.fileName ?? `Pho_Diem_${suffix}.xlsx`;

  const rows = buildScoreDistribution(students, groupBy);
  const totalRow = rows.reduce((acc, row) => ({
    group:        'Toàn trường',
    total:        acc.total + row.total,
    graded:       acc.graded + row.graded,
    tot:          acc.tot + row.tot,
    kha:          acc.kha + row.kha,
    dat:          acc.dat + row.dat,
    chuadat:      acc.chuadat + row.chuadat,
    chuaCoDiem:   acc.chuaCoDiem + row.chuaCoDiem,
  }), { group: 'Toàn trường', total: 0, graded: 0, tot: 0, kha: 0, dat: 0, chuadat: 0, chuaCoDiem: 0 });

  const percent = (count, total) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0);
  const tableRows = [...rows, {
    ...totalRow,
    totPct:         percent(totalRow.tot, totalRow.graded),
    khaPct:         percent(totalRow.kha, totalRow.graded),
    datPct:         percent(totalRow.dat, totalRow.graded),
    chuadatPct:     percent(totalRow.chuadat, totalRow.graded),
    chuaCoDiemPct:  percent(totalRow.chuaCoDiem, totalRow.total),
  }];

  try {
    const lib = getXlsx();
    if (!lib || !lib.utils) {
      return { success: true, fileName, rowCount: rows.length, rows: tableRows };
    }

    const headers = ['Nhóm', 'Sĩ số', 'Có điểm', ...ACADEMIC_RANK_LABELS, 'Chưa có điểm',
      ...ACADEMIC_RANK_LABELS.map((r) => `% ${r}`), '% Chưa có điểm'];
    const aoa = [
      headers,
      ...tableRows.map((row) => [
        row.group, row.total, row.graded, row.tot, row.kha, row.dat, row.chuadat, row.chuaCoDiem,
        row.totPct, row.khaPct, row.datPct, row.chuadatPct, row.chuaCoDiemPct,
      ]),
    ];

    const worksheet = lib.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = headers.map((h, i) => ({
      wch: Math.min(Math.max(String(h).length + 4, i === 0 ? 16 : 10), 40),
    }));

    const workbook = lib.utils.book_new();
    lib.utils.book_append_sheet(workbook, worksheet, 'Phổ điểm');

    const filePath = `${outputDir.replace(/[\\/]+$/, '')}/${fileName}`;
    try {
      lib.writeFile(workbook, filePath);
      return { success: true, fileName, rowCount: rows.length, filePath, rows: tableRows };
    } catch {
      const buf = lib.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return { success: true, fileName, rowCount: rows.length, buffer: buf, rows: tableRows };
    }
  } catch (err) {
    console.error('[exportEngine] exportScoreDistributionToExcel error:', err?.message);
    return { success: true, fileName, rowCount: rows.length, rows: tableRows };
  }
}

// ─── PBI-23 / EPIC-04: Báo Cáo BGH — Phổ Điểm & Khen Thưởng ─────────────────

/** Lấy danh sách đầu điểm môn của một học sinh (hỗ trợ nhiều tên trường). */
function subjectsOf(student) {
  const list = student.subjects ?? student.subjectScores ?? student.subject_scores ?? student.grades ?? [];
  return Array.isArray(list) ? list : [];
}

/** Điểm trung bình của một dòng môn. */
function subjectAverageOf(row) {
  return row.averageScore ?? row.average_score ?? row.average ?? row.score ?? row.gpa;
}

/** Nhãn hạnh kiểm của học sinh. */
function conductOf(student) {
  return student.conductRank ?? student.conduct_rank ?? student.conduct ?? '';
}

/** Lọc học sinh theo lớp hoặc khối (bỏ qua tiêu chí không truyền). */
function filterByScope(students, filter = {}) {
  return students.filter((student) => {
    const className = student.className ?? student.class_name;
    const gradeLevel = student.gradeLevel ?? student.grade_level;
    if (filter.className && className !== filter.className) return false;
    if (filter.gradeLevel != null && String(gradeLevel) !== String(filter.gradeLevel)) return false;
    return true;
  });
}

/** Nhãn phạm vi báo cáo: "Lớp 10A1" · "Khối 10" · "Toàn trường". */
function scopeLabelOf(filter = {}) {
  if (filter.className) return `Lớp ${filter.className}`;
  if (filter.gradeLevel != null) return `Khối ${filter.gradeLevel}`;
  return 'Toàn trường';
}

/** Bỏ dấu tiếng Việt để đặt tên tệp tin an toàn. */
function toAsciiSlug(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Phổ điểm **từng môn** theo 4 mức Thông tư 22 (PBI-23 — "biểu đồ phổ điểm từng môn").
 * Mỗi môn đếm số học sinh đạt từng mức kèm tỷ lệ %, phục vụ biểu đồ của BGH.
 *
 * @param {Array<Object>} students - Học sinh kèm `subjects: [{subjectName, averageScore}]`.
 * @param {{filter?: {className?: string, gradeLevel?: string|number}, className?: string, gradeLevel?: string|number}} [options]
 * @returns {Array<{subject: string, total: number, graded: number, tot: number, kha: number, dat: number,
 *          chuadat: number, chuaCoDiem: number, totPct: number, khaPct: number, datPct: number,
 *          chuadatPct: number, chuaCoDiemPct: number}>}
 */
export function buildSubjectScoreDistribution(students = [], options = {}) {
  const filter = options.filter ?? options;
  const buckets = new Map();

  filterByScope(students, filter).forEach((student) => {
    subjectsOf(student).forEach((row) => {
      const subject = row.subjectName ?? row.subject_name ?? row.subject ?? 'Khác';
      if (!buckets.has(subject)) {
        buckets.set(subject, { subject, total: 0, graded: 0, tot: 0, kha: 0, dat: 0, chuadat: 0, chuaCoDiem: 0 });
      }
      const bucket = buckets.get(subject);
      bucket.total += 1;
      const score = scoreValueOf(subjectAverageOf(row));
      if (score === null) {
        bucket.chuaCoDiem += 1;
        return;
      }
      bucket.graded += 1;
      const rank = rankAcademicScore(score);
      if (rank === 'Tốt') bucket.tot += 1;
      else if (rank === 'Khá') bucket.kha += 1;
      else if (rank === 'Đạt') bucket.dat += 1;
      else bucket.chuadat += 1;
    });
  });

  const percent = (count, total) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0);
  return [...buckets.values()]
    .sort((a, b) => String(a.subject).localeCompare(String(b.subject), 'vi'))
    .map((row) => ({
      ...row,
      totPct:         percent(row.tot, row.graded),
      khaPct:         percent(row.kha, row.graded),
      datPct:         percent(row.dat, row.graded),
      chuadatPct:     percent(row.chuadat, row.graded),
      chuaCoDiemPct:  percent(row.chuaCoDiem, row.total),
    }));
}

/**
 * Danh sách xét khen thưởng & rèn luyện hè của BGH (PBI-23):
 * - **Học sinh Xuất sắc**: tất cả môn đều xếp loại `Tốt` và hạnh kiểm `Tốt`.
 * - **Cần rèn luyện hè**: có ít nhất một môn `Chưa đạt` hoặc hạnh kiểm `Yếu`.
 *
 * @param {Array<Object>} students
 * @param {{filter?: {className?: string, gradeLevel?: string|number}} & {className?: string, gradeLevel?: string|number}} [options]
 * @returns {{total: number, scope: string, excellent: Array<Object>, summerTraining: Array<Object>}}
 */
export function buildAwardLists(students = [], options = {}) {
  const filter = options.filter ?? options;
  const scoped = filterByScope(students, filter);
  const excellent = [];
  const summerTraining = [];

  scoped.forEach((student) => {
    const rows = subjectsOf(student);
    const conduct = conductOf(student);
    const scoredRows = rows
      .map((row) => ({ row, score: scoreValueOf(subjectAverageOf(row)) }))
      .filter(({ score }) => score !== null);
    const failedSubjects = scoredRows
      .filter(({ score }) => rankAcademicScore(score) === 'Chưa đạt')
      .map(({ row }) => row.subjectName ?? row.subject_name ?? row.subject ?? 'Khác');
    const allExcellent = rows.length > 0
      && scoredRows.length === rows.length
      && scoredRows.every(({ score }) => rankAcademicScore(score) === 'Tốt');

    const record = {
      studentCode: student.studentCode ?? student.student_code ?? '',
      fullName: student.fullName ?? student.full_name ?? student.name ?? '',
      className: student.className ?? student.class_name ?? '',
      gradeLevel: student.gradeLevel ?? student.grade_level ?? '',
      conductRank: conduct,
      subjectCount: rows.length,
    };

    if (allExcellent && conduct === 'Tốt') {
      excellent.push({ ...record, title: 'Học sinh Xuất sắc' });
    }

    const reasons = [];
    if (failedSubjects.length > 0) reasons.push(`Môn Chưa đạt: ${failedSubjects.join(', ')}`);
    if (conduct === 'Yếu') reasons.push('Hạnh kiểm: Yếu');
    if (reasons.length > 0) summerTraining.push({ ...record, reason: reasons.join(' · ') });
  });

  const byName = (a, b) => String(a.fullName).localeCompare(String(b.fullName), 'vi');
  return {
    total: scoped.length,
    scope: scopeLabelOf(filter),
    excellent: excellent.sort(byName),
    summerTraining: summerTraining.sort(byName),
  };
}

/**
 * Xuất báo cáo BGH ra Excel (.xlsx) gồm 3 sheet: phổ điểm từng môn, danh sách
 * Học sinh Xuất sắc và danh sách cần rèn luyện hè (PBI-23). Thiếu SheetJS thì
 * trả dữ liệu dòng để không chặn luồng báo cáo.
 *
 * @param {Array<Object>} students
 * @param {{filter?: {className?: string, gradeLevel?: string|number}, outputDir?: string, fileName?: string}} [options]
 * @returns {{success: boolean, fileName: string, rowCount: number, filePath?: string, buffer?: Buffer,
 *          subjectRows: Array, excellent: Array, summerTraining: Array}}
 */
export function exportAwardReportToExcel(students = [], options = {}) {
  const filter    = options.filter ?? {};
  const outputDir = options.outputDir ?? '.';
  const scope     = scopeLabelOf(filter);
  const fileName  = options.fileName ?? `Bao_Cao_BGH_${toAsciiSlug(scope)}.xlsx`;

  const subjectRows   = buildSubjectScoreDistribution(students, { filter });
  const award         = buildAwardLists(students, { filter });
  const fallback = {
    success: true,
    fileName,
    rowCount: subjectRows.length,
    subjectRows,
    excellent: award.excellent,
    summerTraining: award.summerTraining,
  };

  try {
    const lib = getXlsx();
    if (!lib || !lib.utils) return fallback;

    const distHeaders = ['Môn học', 'Sĩ số', ...ACADEMIC_RANK_LABELS, ...ACADEMIC_RANK_LABELS.map((r) => `% ${r}`)];
    const distSheet = lib.utils.aoa_to_sheet([
      [`BÁO CÁO PHỔ ĐIỂM — ${scope}`],
      distHeaders,
      ...subjectRows.map((row) => [
        row.subject, row.total, row.tot, row.kha, row.dat, row.chuadat,
        row.totPct, row.khaPct, row.datPct, row.chuadatPct,
      ]),
    ]);
    distSheet['!cols'] = distHeaders.map((h, i) => ({ wch: i === 0 ? 24 : 12 }));

    const awardHeaders = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Khối', 'Hạnh kiểm'];
    const excellentSheet = lib.utils.aoa_to_sheet([
      [`DANH SÁCH HỌC SINH XUẤT SẮC — ${scope}`],
      awardHeaders,
      ...award.excellent.map((row, i) => [
        i + 1, row.studentCode, row.fullName, row.className, row.gradeLevel, row.conductRank,
      ]),
    ]);
    excellentSheet['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];

    const trainingHeaders = [...awardHeaders, 'Lý do'];
    const trainingSheet = lib.utils.aoa_to_sheet([
      [`DANH SÁCH HỌC SINH CẦN RÈN LUYỆN HÈ — ${scope}`],
      trainingHeaders,
      ...award.summerTraining.map((row, i) => [
        i + 1, row.studentCode, row.fullName, row.className, row.gradeLevel, row.conductRank, row.reason,
      ]),
    ]);
    trainingSheet['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 40 }];

    const workbook = lib.utils.book_new();
    lib.utils.book_append_sheet(workbook, distSheet, 'Phổ điểm môn');
    lib.utils.book_append_sheet(workbook, excellentSheet, 'Học sinh Xuất sắc');
    lib.utils.book_append_sheet(workbook, trainingSheet, 'Rèn luyện hè');

    const filePath = `${outputDir.replace(/[\\/]+$/, '')}/${fileName}`;
    try {
      lib.writeFile(workbook, filePath);
      return { ...fallback, filePath };
    } catch {
      return { ...fallback, buffer: lib.write(workbook, { type: 'buffer', bookType: 'xlsx' }) };
    }
  } catch (err) {
    console.error('[exportEngine] exportAwardReportToExcel error:', err?.message);
    return fallback;
  }
}

// ─── UC-GVCN-10 / UC-STU-05: Sinh Phiếu Báo Điểm (HTML in ấn PDF) ────────────

/**
 * Xếp loại học lực theo 4 mức của Thông tư 22/2021/TT-BGDĐT.
 * Tốt ≥ 8.0 · Khá ≥ 6.5 · Đạt ≥ 5.0 · Chưa đạt < 5.0
 *
 * @param {number} gpa - Điểm trung bình học kỳ (thang 10).
 * @returns {'Tốt'|'Khá'|'Đạt'|'Chưa đạt'} Nhãn xếp loại.
 */
export function rankAcademicScore(gpa) {
  const value = Number(gpa);
  if (Number.isNaN(value)) return 'Chưa đạt';
  if (value >= 8) return 'Tốt';
  if (value >= 6.5) return 'Khá';
  if (value >= 5) return 'Đạt';
  return 'Chưa đạt';
}

/** Định dạng một đầu điểm: null/undefined → '—', còn lại 1 chữ số thập phân. */
function formatScore(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  return Number.isNaN(num) ? '—' : num.toFixed(1);
}

/**
 * Sinh trang HTML Phiếu Báo Điểm / Học Bạ điện tử chuẩn PBI-16 — in khổ A4:
 * quốc hiệu + tiêu ngữ, thông tin học sinh, bảng điểm đầy đủ các đầu điểm
 * (miệng, 15 phút, 1 tiết, giữa kỳ, cuối kỳ, ĐTB), xếp loại học lực và hạnh
 * kiểm theo Thông tư 22, cùng khối chữ ký 3 bên.
 * Chuỗi HTML trả về có nút "In / Lưu PDF" gọi window.print() khi mở trên trình
 * duyệt; ở Node.js chỉ cần ghi chuỗi ra file .html rồi in.
 *
 * @param {{studentCode?: string, fullName?: string, className?: string, gpa?: number,
 *          schoolYear?: string, semesterLabel?: string, gvcnName?: string,
 *          academicRank?: string, conductRank?: string}} studentInfo - Thông tin học sinh.
 * @param {Array<{subjectName?: string, scoreOral?: number, score15m?: number,
 *          score1hour?: number, scoreMidTerm?: number, scoreFinalTerm?: number,
 *          averageScore?: number, gradeLetter?: string}>} gradeList - Danh sách điểm từng môn.
 * @returns {{success: boolean, fileName: string, htmlContent: string, studentCode: string,
 *          fullName: string, className: string, gpa: number, academicRank: string, conductRank: string}}
 */
export function exportReportCardToPDF(studentInfo = {}, gradeList = []) {
  const code         = studentInfo.studentCode    ?? studentInfo.student_code    ?? 'HS';
  const name         = studentInfo.fullName       ?? studentInfo.full_name       ?? 'Học sinh';
  const cls          = studentInfo.className      ?? studentInfo.class_name      ?? '';
  const gpa          = Number(studentInfo.gpa ?? 0);
  const schoolYear   = studentInfo.schoolYear     ?? '2024-2025';
  const semester     = studentInfo.semesterLabel  ?? 'Học kỳ I';
  const gvcnName     = studentInfo.gvcnName       ?? 'Giáo viên chủ nhiệm';
  const conductRank  = studentInfo.conductRank    ?? studentInfo.conduct_rank    ?? 'Tốt';
  const academicRank = studentInfo.academicRank   ?? studentInfo.academic_rank   ?? rankAcademicScore(gpa);
  const fileName     = `Phieu_Bao_Diem_${code}.pdf`;

  // Bảng điểm đầy đủ 9 cột theo mẫu học bạ; tô màu điểm <5 đỏ, ≥8 xanh
  const rowsHtml = gradeList.map((g, i) => {
    const avg   = g.averageScore ?? g.average_score ?? null;
    const subj  = g.subjectName  ?? g.subject_name  ?? `Môn ${i + 1}`;
    const rank  = g.gradeLetter  ?? g.grade_letter  ?? rankAcademicScore(avg);
    const color = avg !== null
      ? (avg < 5 ? '#dc2626' : avg >= 8 ? '#16a34a' : '#0f172a')
      : '#94a3b8';
    return `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${i + 1}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;font-weight:500">${subj}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${formatScore(g.scoreOral ?? g.score_oral)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${formatScore(g.score15m ?? g.score_15m)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${formatScore(g.score1hour ?? g.score1Hour ?? g.score_1hour)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${formatScore(g.scoreMidTerm ?? g.score_mid_term)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${formatScore(g.scoreFinalTerm ?? g.score_final_term)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center;font-weight:700;color:${color}">${formatScore(avg)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 10px;text-align:center">${rank || '—'}</td>
    </tr>`;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Phiếu Báo Điểm — ${name}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 20mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; color: #0f172a; background: #fff; }
    .toolbar { text-align: right; padding: 12px 24px; }
    .toolbar button { padding: 8px 18px; font-size: 13px; font-weight: 700; color: #fff;
      background: #004ac6; border: 0; border-radius: 6px; cursor: pointer; }
    .sheet { padding: 0 24px 24px; }
    .quoc-hieu { text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
    .quoc-hieu strong { font-size: 13px; }
    .tieu-ngu { text-align: center; font-size: 13px; font-weight: 700; margin: 6px 0 2px; }
    .tieu-ngu-sub { text-align: center; font-size: 12px; margin-bottom: 10px; }
    .divider { width: 140px; height: 1px; background: #0f172a; margin: 0 auto 14px; }
    .header { text-align:center; margin-bottom:18px; padding-bottom:10px; border-bottom:2px solid #004ac6; }
    .title { font-size:19px; font-weight:800; color:#004ac6; margin:8px 0 4px; text-transform:uppercase; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; margin:14px 0 18px; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { background:#f1f5f9; border:1px solid #cbd5e1; padding:7px 8px; color:#475569; font-weight:600; font-size:11px; }
    .gpa-row td { background:#eff4ff; font-weight:700; font-size:13px; color:#004ac6; border-top:2px solid #004ac6; }
    .ket-luan { display:flex; gap:24px; margin:16px 0 0; font-size:13px; }
    .ket-luan .box { flex:1; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; }
    .ket-luan strong { color:#004ac6; }
    .footer { margin-top:36px; display:flex; justify-content:space-between; text-align:center; font-size:12px; }
    .sig { width:180px; }
    .sig-title { font-weight:700; margin-bottom:50px; }
    @media print { .toolbar { display: none; } .sheet { padding: 0; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.print()">In / Lưu PDF</button>
  </div>
  <div class="sheet">
    <div class="quoc-hieu"><strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>TRƯỜNG THPT HSU</div>
    <div class="tieu-ngu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div class="tieu-ngu-sub">Độc lập — Tự do — Hạnh phúc</div>
    <div class="divider"></div>
    <div class="header">
      <div class="title">Phiếu Báo Điểm / Học Bạ Điện Tử</div>
      <div style="font-size:13px;color:#64748b">Hệ thống HTQLLH · ${semester} · Năm học ${schoolYear}</div>
    </div>
    <div class="info-grid">
      <div><span style="color:#64748b">Họ và tên: </span><strong>${name}</strong></div>
      <div><span style="color:#64748b">Mã học sinh: </span><strong>${code}</strong></div>
      <div><span style="color:#64748b">Lớp: </span><strong>${cls}</strong></div>
      <div><span style="color:#64748b">Giáo viên chủ nhiệm: </span><strong>${gvcnName}</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:34px">STT</th>
          <th>Môn Học</th>
          <th style="width:52px">Miệng</th>
          <th style="width:52px">15 phút</th>
          <th style="width:52px">1 tiết</th>
          <th style="width:56px">Giữa kỳ</th>
          <th style="width:56px">Cuối kỳ</th>
          <th style="width:52px">ĐTB</th>
          <th style="width:72px">Xếp loại</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="9" style="padding:16px;text-align:center;color:#94a3b8">Chưa có dữ liệu điểm.</td></tr>'}
      </tbody>
      <tfoot>
        <tr class="gpa-row">
          <td colspan="7" style="border:1px solid #e2e8f0;padding:8px 10px;text-align:right">Điểm trung bình học kỳ (GPA):</td>
          <td style="border:1px solid #e2e8f0;padding:8px 10px;text-align:center">${gpa.toFixed(2)}</td>
          <td style="border:1px solid #e2e8f0;padding:8px 10px;text-align:center">${academicRank}</td>
        </tr>
      </tfoot>
    </table>
    <div class="ket-luan">
      <div class="box">Xếp loại học lực: <strong>${academicRank}</strong></div>
      <div class="box">Hạnh kiểm: <strong>${conductRank}</strong></div>
    </div>
    <div class="footer">
      <div class="sig"><div class="sig-title">Học Sinh / Phụ Huynh</div><div style="color:#64748b;font-style:italic">(Ký và ghi rõ họ tên)</div></div>
      <div class="sig"><div class="sig-title">Giáo Viên Chủ Nhiệm</div><div style="color:#64748b;font-style:italic">(Ký tên)</div></div>
      <div class="sig"><div class="sig-title">Hiệu Trưởng</div><div style="color:#64748b;font-style:italic">(Ký tên và đóng dấu)</div></div>
    </div>
  </div>
</body>
</html>`;

  return {
    success:      true,
    fileName,
    htmlContent,
    studentCode:  code,
    fullName:     name,
    className:    cls,
    gpa,
    academicRank,
    conductRank,
  };
}

// ─── UC-PAR-04: Sinh Biên Lai Học Phí (HTML in ấn PDF) ──────────────────────

// Bộ đếm chống trùng số biên lai khi nhiều giao dịch phát sinh trong cùng 1 ms
let lastReceiptMs = 0;
let receiptSeq = 0;

/** Đệm số nguyên về chuỗi 2 chữ số. */
function pad2(value) {
  return String(value).padStart(2, '0');
}

/**
 * Sinh số biên lai DUY NHẤT cho mỗi giao dịch thanh toán (DoD KAN-133).
 * Ưu tiên mã giao dịch do cổng thanh toán trả về; nếu không có thì dùng dấu
 * thời gian tới mili giây kèm bộ đếm, bảo đảm hai lần gọi liên tiếp không trùng.
 *
 * @param {string} studentCode - Mã học sinh.
 * @param {string|number} [paymentId] - Mã giao dịch từ cổng thanh toán.
 * @returns {string} Số biên lai dạng `BL-<MÃHS>-<MÃGD|TIMESTAMP>`.
 */
function buildReceiptNo(studentCode, paymentId) {
  if (paymentId !== undefined && paymentId !== null && String(paymentId).trim() !== '') {
    return `BL-${studentCode.toUpperCase()}-${String(paymentId).toUpperCase()}`;
  }
  const now = new Date();
  const ms = now.getTime();
  receiptSeq = ms === lastReceiptMs ? receiptSeq + 1 : 1;
  lastReceiptMs = ms;
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`
    + `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`
    + String(now.getMilliseconds()).padStart(3, '0');
  return `BL-${studentCode.toUpperCase()}-${stamp}${receiptSeq > 1 ? `-${receiptSeq}` : ''}`;
}

/**
 * Sinh mã tra cứu in trên biên lai — suy ra tất định từ số biên lai để phụ
 * huynh có thể tra cứu lại giao dịch mà không cần đăng nhập.
 *
 * @param {string} receiptNo - Số biên lai.
 * @returns {string} Mã tra cứu dạng `TC-<8 ký tự cuối>-<4 ký tự băm>`.
 */
export function generateReceiptLookupCode(receiptNo) {
  const raw = String(receiptNo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `TC-${raw.slice(-8)}-${hash.toString(36).toUpperCase().padStart(4, '0').slice(-4)}`;
}

/**
 * Sinh trang HTML biên lai thanh toán học phí — gồm watermark "ĐÃ THANH TOÁN",
 * số biên lai duy nhất theo giao dịch, mã tra cứu, phương thức thanh toán,
 * thông tin người nộp, bảng chi tiết các khoản thu và tổng cộng. Chuỗi HTML
 * trả về ghi ra file .html để in biên lai khổ A4.
 *
 * @param {{receiptNo?: string, paymentId?: string|number, studentCode?: string, studentName?: string,
 *          className?: string, amountPaid?: number, paymentMethod?: string, items?: Array,
 *          status?: string}} tuitionData - Dữ liệu thanh toán.
 * @returns {{success: boolean, fileName: string, htmlContent: string, receiptNo: string,
 *          lookupCode: string, amountPaid: number, status: string}}
 */
export function exportTuitionReceiptToPDF(tuitionData) {
  const code       = tuitionData.studentCode ?? tuitionData.student_code ?? 'HS';
  const today      = new Date();
  const dateStr    = today.toISOString().split('T')[0];
  // Số biên lai: ưu tiên hệ thống cấp, kế đến mã giao dịch, cuối cùng tự sinh
  const paymentId  = tuitionData.paymentId ?? tuitionData.payment_id
    ?? tuitionData.transactionId ?? tuitionData.transaction_id;
  const receiptNo  = tuitionData.receiptNo ?? tuitionData.receipt_no
    ?? buildReceiptNo(code, paymentId);
  const lookupCode = generateReceiptLookupCode(receiptNo);
  const name       = tuitionData.studentName ?? tuitionData.student_name ?? 'Học sinh';
  const cls        = tuitionData.className   ?? tuitionData.class_name   ?? '';
  const amountPaid = tuitionData.amountPaid  ?? tuitionData.amount_paid  ?? 0;
  const payMethod  = tuitionData.paymentMethod ?? tuitionData.payment_method ?? 'Chuyển khoản VietQR';
  const status     = tuitionData.status ?? 'PAID';
  const items      = tuitionData.items ?? [];
  const fileName   = `Bien_Lai_Hoc_Phi_${code}.pdf`;

  const itemsHtml = items.map((item, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center">${i + 1}</td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px">${item.name ?? item.item_name ?? `Khoản thu ${i + 1}`}</td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:right;font-weight:600">
      ${Number(item.amount ?? 0).toLocaleString('vi-VN')} đ
    </td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center;color:#15803d;font-weight:600">Đã thanh toán</td>
  </tr>`).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Biên Lai Học Phí — ${name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; position:relative; }
    .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg);
      font-size:64px; font-weight:900; color:rgba(21,128,61,0.07); white-space:nowrap; pointer-events:none; z-index:0; }
    .content { position:relative; z-index:1; }
    .header { text-align:center; margin-bottom:24px; padding-bottom:12px; border-bottom:2px solid #004ac6; }
    .school { font-size:12px; color:#64748b; text-transform:uppercase; }
    .title { font-size:20px; font-weight:800; color:#004ac6; margin:8px 0 4px; text-transform:uppercase; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; margin:16px 0 20px; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f1f5f9; border:1px solid #cbd5e1; padding:8px 12px; color:#475569; font-weight:600; }
    .total-row td { background:#eff4ff; font-weight:700; font-size:14px; color:#004ac6; border-top:2px solid #004ac6; }
    .footer { margin-top:40px; display:flex; justify-content:space-between; text-align:center; font-size:12px; }
    .sig { width:180px; }
    .sig-title { font-weight:700; margin-bottom:50px; }
  </style>
</head>
<body>
  <div class="watermark">ĐÃ THANH TOÁN</div>
  <div class="content">
    <div class="header">
      <div class="school">Sở Giáo Dục và Đào Tạo — Trường THPT HSU</div>
      <div class="title">Biên Lai Thanh Toán Học Phí</div>
      <div style="font-size:13px;color:#64748b">Hệ thống HTQLLH · Năm học 2024–2025</div>
    </div>
    <div class="info-grid">
      <div><span style="color:#64748b">Mã biên lai: </span><strong>${receiptNo}</strong></div>
      <div><span style="color:#64748b">Mã tra cứu: </span><strong style="color:#004ac6">${lookupCode}</strong></div>
      <div><span style="color:#64748b">Ngày thanh toán: </span><strong>${dateStr}</strong></div>
      <div><span style="color:#64748b">Phương thức: </span><strong>${payMethod}</strong></div>
      <div><span style="color:#64748b">Họ tên học sinh: </span><strong>${name}</strong></div>
      <div><span style="color:#64748b">Mã học sinh: </span><strong>${code}</strong></div>
      <div><span style="color:#64748b">Lớp: </span><strong>${cls}</strong></div>
      <div><span style="color:#64748b">Trạng thái: </span><strong style="color:#15803d">Đã thanh toán</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:40px">STT</th>
          <th>Khoản Thu</th>
          <th style="width:140px;text-align:right">Số Tiền (VNĐ)</th>
          <th style="width:120px">Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || `<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Không có khoản thu.</td></tr>`}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2" style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right">Tổng cộng đã thanh toán:</td>
          <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right">${Number(amountPaid).toLocaleString('vi-VN')} đ</td>
          <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;color:#15803d">Hoàn tất</td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">
      <div class="sig"><div class="sig-title">Phụ Huynh / Học Sinh</div><div style="color:#64748b;font-style:italic">(Ký và ghi rõ họ tên)</div></div>
      <div class="sig"><div class="sig-title">Thủ Quỹ Nhà Trường</div><div style="color:#64748b;font-style:italic">(Ký tên và đóng dấu)</div></div>
    </div>
  </div>
</body>
</html>`;

  return {
    success:     true,
    fileName,
    htmlContent,
    receiptNo,
    lookupCode,
    amountPaid:  Number(amountPaid),
    status,
  };
}
