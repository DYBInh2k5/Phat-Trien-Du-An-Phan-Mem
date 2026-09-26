/**
 * GradebookPage — Sổ điểm dạng spreadsheet cho GV (nhập điểm) và BGH (xem read-only)
 *
 * Columns: Miệng (hệ số 1), KT 15' (hệ số 1), KT 1 tiết (hệ số 2), HK (hệ số 3), Điểm TB
 * Grade color-coding: < 5.0 → đỏ, >= 8.0 → xanh, trung bình → neutral
 * Inline cell editing cho GV; toàn bộ read-only cho BGH.
 *
 * Requirements: sổ điểm GV / BGH
 */

import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../../components/shared/Modal.jsx';
import { handleSaveGrades } from '../../api/stubs.js';
import { exportToExcel, exportToPDF } from '../../utils/exportEngine.js';
import {
  grades as gradesData,
  students,
  classes,
  subjects,
} from '../../data/mockData.js';
import { ROLES } from '../../constants/roles.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns Tailwind classes for grade color-coding.
 * < 5  → red / bold    >= 8 → green    otherwise → neutral
 */
function gradeColorClass(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (isNaN(n)) return '';
  if (n < 5) return 'bg-[#fef2f2] text-[#dc2626] font-bold';
  if (n >= 8) return 'bg-[#f0fdf4] text-[#16a34a]';
  return 'bg-[#f8fafc] text-[#334155]';
}

/** Format a numeric score to 1 decimal, or return '—' if empty */
function fmtScore(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return isNaN(n) ? '—' : n % 1 === 0 ? n.toFixed(1) : String(n);
}

/**
 * Compute weighted average from the grade data object:
 *   Miệng × 1 + KT15' × 1 + KT1tiết × 2 + HK × 3  →  / (n_oral + n_15 + 2×n_45 + 3)
 * Matches Vietnamese standard weighting logic.
 * Returns null if no data.
 */
function computeAverage(entry) {
  if (!entry) return null;
  const { oral = [], test15min = [], test45min = [], semester } = entry;

  let sum = 0;
  let weight = 0;

  for (const v of oral) {
    if (v !== null && v !== undefined && v !== '') {
      sum += Number(v) * 1;
      weight += 1;
    }
  }
  for (const v of test15min) {
    if (v !== null && v !== undefined && v !== '') {
      sum += Number(v) * 1;
      weight += 1;
    }
  }
  for (const v of test45min) {
    if (v !== null && v !== undefined && v !== '') {
      sum += Number(v) * 2;
      weight += 2;
    }
  }
  if (semester !== null && semester !== undefined && semester !== '') {
    sum += Number(semester) * 3;
    weight += 3;
  }

  if (weight === 0) return null;
  return Math.round((sum / weight) * 10) / 10;
}

// ─── Sub-component: editable / read-only grade cell ──────────────────────────

function GradeCell({ value, rowKey, col, isEditing, isReadOnly, onStartEdit, onValueChange, onBlur }) {
  const displayVal = fmtScore(value);
  const colorCls = gradeColorClass(value);

  if (isReadOnly) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm pointer-events-none select-none ${colorCls}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {displayVal}
      </div>
    );
  }

  if (isEditing) {
    return (
      <input
        type="number"
        min={0}
        max={10}
        step={0.5}
        value={value ?? ''}
        autoFocus
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={() => onBlur(rowKey, col)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur();
          if (e.key === 'Escape') onBlur(rowKey, col, true);
        }}
        className="w-full h-full border border-[#004ac6] rounded bg-white px-2 py-1 text-body-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 text-center"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.5rem' }}
        aria-label="Nhập điểm"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onStartEdit(rowKey, col)}
      title="Nhấn để chỉnh sửa"
      className={`w-full h-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm transition-all hover:ring-2 hover:ring-[#004ac6]/40 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/40 cursor-text ${
        colorCls || 'bg-[#f8fafc] text-[#64748b]'
      }`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {displayVal}
    </button>
  );
}

// ─── Column definitions for the grade table ──────────────────────────────────

// Each col: { key, label, subLabel, field, colSpanHint }
// 'field' is the path into the gradeEntry: 'oral.0', 'oral.1', 'test15min.0', etc.
// We treat every score slot individually so the spreadsheet can expand later.
// For now we render one representative slot per category + semester + average.

const COL_GROUPS = [
  {
    key: 'oral',
    label: 'Miệng',
    subLabel: 'Hệ số 1',
    color: 'bg-[#eff6ff]',
    textColor: 'text-[#1d4ed8]',
  },
  {
    key: 'test15min',
    label: 'KT 15\'',
    subLabel: 'Hệ số 1',
    color: 'bg-[#fef9c3]',
    textColor: 'text-[#854d0e]',
  },
  {
    key: 'test45min',
    label: 'KT 1 tiết',
    subLabel: 'Hệ số 2',
    color: 'bg-[#fff7ed]',
    textColor: 'text-[#c2410c]',
  },
  {
    key: 'semester',
    label: 'Cuối HK',
    subLabel: 'Hệ số 3',
    color: 'bg-[#f5f3ff]',
    textColor: 'text-[#7c3aed]',
  },
];

// Maximum number of score columns per category (based on mockData shape)
const MAX_COLS = {
  oral:      2,
  test15min: 2,
  test45min: 1,
  semester:  1,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GradebookPage() {
  const { role } = useAuth();
  const isReadOnly = role === ROLES.BGH;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedClass,    setSelectedClass]    = useState(classes[0]?.id ?? '10A1');
  const [selectedSubject,  setSelectedSubject]  = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState(1);

  // ── Grade state ───────────────────────────────────────────────────────────
  // gradeMap: { [studentId]: { [subjectId]: { oral: [], test15min: [], test45min: [], semester, average } } }
  const [gradeMap, setGradeMap] = useState(() => buildGradeMap(gradesData));

  // ── Editing state ─────────────────────────────────────────────────────────
  // editingCell: { rowKey: `${studentId}_${subjectId}`, col: 'oral.0' | 'test15min.1' | 'semester' } | null
  const [editingCell,   setEditingCell]   = useState(null);
  const [pendingValue,  setPendingValue]  = useState('');
  const [prevValue,     setPrevValue]     = useState(null); // for revert on invalid

  // ── Save state ────────────────────────────────────────────────────────────
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveMessage,  setSaveMessage]  = useState(null); // { type: 'success'|'error', text }

  // ── Unlock / Revision Modal State ──────────────────────────────────────────
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [submittingUnlock, setSubmittingUnlock] = useState(false);

  // ── Export Handlers ────────────────────────────────────────────────────────
  function handleExportExcel() {
    const className = classes.find(c => c.id === selectedClass)?.name || selectedClass;
    const headers = ['STT', 'Mã HS', 'Họ tên', 'TBM Môn', 'Học lực'];
    const rows = classStudents.map((st, idx) => {
      const entry = gradeMap[st.id]?.[selectedSubject !== 'ALL' ? selectedSubject : subjects[0]?.id];
      const avg = entry?.average ?? '—';
      const rank = avg >= 8.0 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5.0 ? 'Trung bình' : 'Yếu';
      return [idx + 1, st.code, st.name, avg, rank];
    });

    exportToExcel(`BangDiem_${className}_HK${selectedSemester}`, `Lớp ${className}`, headers, rows);
  }

  function handleExportPDF() {
    const className = classes.find(c => c.id === selectedClass)?.name || selectedClass;
    const subjectName = selectedSubject === 'ALL' ? 'Tất cả các môn' : subjects.find(s => s.id === selectedSubject)?.name || '';
    const headers = ['STT', 'Mã Học Sinh', 'Họ và Tên', 'Điểm Trung Bình', 'Xếp Loại'];
    const rows = classStudents.map((st, idx) => {
      const entry = gradeMap[st.id]?.[selectedSubject !== 'ALL' ? selectedSubject : subjects[0]?.id];
      const avg = entry?.average ?? '—';
      const rank = avg >= 8.0 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5.0 ? 'Trung bình' : 'Yếu';
      return [idx + 1, st.code, st.name, avg, rank];
    });

    exportToPDF(
      `BẢNG ĐIỂM TỔNG HỢP LỚP ${className}`,
      `Môn: ${subjectName} | Học kỳ ${selectedSemester} - Năm học 2024–2025`,
      headers,
      rows
    );
  }

  function handleRequestUnlockSubmit(e) {
    e.preventDefault();
    if (!unlockReason.trim()) return;
    setSubmittingUnlock(true);
    setTimeout(() => {
      setSubmittingUnlock(false);
      setIsUnlockModalOpen(false);
      setUnlockReason('');
      setSaveMessage({
        type: 'success',
        text: 'Đã gửi đơn xin mở khóa sổ điểm / phúc khảo tới Ban Giám Hiệu phê duyệt thành công!',
      });
    }, 600);
  }

  // ── Derived: students in selected class ───────────────────────────────────
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClass),
    [selectedClass],
  );

  // ── Derived: subjects to show ─────────────────────────────────────────────
  // If a specific subject is selected, show only that; otherwise show subjects
  // that have at least one grade entry for the class + semester, or all subjects.
  const displaySubjects = useMemo(() => {
    if (selectedSubject !== 'ALL') {
      return subjects.filter((s) => s.id === selectedSubject);
    }
    // Show subjects present in the filtered grade data for the class
    const subjectIds = new Set(
      gradesData
        .filter(
          (g) =>
            classStudents.some((s) => s.id === g.studentId) &&
            g.semester === Number(selectedSemester),
        )
        .map((g) => g.subjectId),
    );
    return subjects.filter((s) => subjectIds.has(s.id));
  }, [selectedSubject, selectedSemester, classStudents]);

  // ── Cell edit handlers ────────────────────────────────────────────────────

  function getCellValue(studentId, subjectId, col) {
    const entry = gradeMap[studentId]?.[subjectId];
    if (!entry) return '';
    if (col === 'semester') return entry.semester ?? '';
    const [field, idxStr] = col.split('.');
    const arr = entry[field];
    if (!Array.isArray(arr)) return '';
    return arr[Number(idxStr)] ?? '';
  }

  function handleStartEdit(rowKey, col) {
    if (isReadOnly) return;
    const [studentId, subjectId] = rowKey.split('__');
    const current = getCellValue(studentId, subjectId, col);
    setEditingCell({ rowKey, col });
    setPendingValue(current !== '' && current !== null && current !== undefined ? String(current) : '');
    setPrevValue(current);
    setSaveMessage(null);
  }

  function handleCellValueChange(val) {
    setPendingValue(val);
  }

  function handleCellBlur(rowKey, col, forceRevert = false) {
    if (!editingCell) return;

    const [studentId, subjectId] = rowKey.split('__');

    if (forceRevert) {
      setEditingCell(null);
      setPendingValue('');
      return;
    }

    const raw = pendingValue.trim();

    // Validate: empty allowed (clears), otherwise must be 0–10
    if (raw !== '') {
      const num = Number(raw);
      if (isNaN(num) || num < 0 || num > 10) {
        // Invalid → revert, do not update state
        setEditingCell(null);
        setPendingValue('');
        return;
      }
    }

    const newVal = raw === '' ? null : Number(raw);

    setGradeMap((prev) => {
      const next = deepCopyMap(prev);
      if (!next[studentId]) next[studentId] = {};
      if (!next[studentId][subjectId]) {
        next[studentId][subjectId] = {
          oral: [],
          test15min: [],
          test45min: [],
          semester: null,
          average: null,
        };
      }
      const entry = next[studentId][subjectId];

      if (col === 'semester') {
        entry.semester = newVal;
      } else {
        const [field, idxStr] = col.split('.');
        const idx = Number(idxStr);
        if (!Array.isArray(entry[field])) entry[field] = [];
        // Extend array if needed
        while (entry[field].length <= idx) entry[field].push(null);
        entry[field][idx] = newVal;
      }

      // Recompute average
      entry.average = computeAverage(entry);

      return next;
    });

    setEditingCell(null);
    setPendingValue('');
  }

  // ── Save handler ──────────────────────────────────────────────────────────

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);

    const payload = {
      classId:     selectedClass,
      subjectId:   selectedSubject,
      semester:    selectedSemester,
      academicYear: '2024-2025',
      gradeMap,
    };

    try {
      await handleSaveGrades(payload);
      setSaveMessage({ type: 'success', text: 'Điểm đã được lưu thành công!' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Lỗi khi lưu điểm. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Sổ điểm</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            {isReadOnly
              ? 'Xem bảng điểm học sinh theo lớp và môn học'
              : 'Nhập và quản lý điểm số học sinh theo buổi học'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isReadOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff7ed] text-[#c2410c] border border-[#fdba74] text-label-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Chế độ xem (BGH)
            </span>
          )}
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fdba74] text-body-sm font-medium transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Xin mở khóa / Phúc khảo
            </button>
          )}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-body-sm font-medium transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] text-body-sm font-medium transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* ── Filter toolbar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Class selector */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
              Lớp học
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setEditingCell(null);
                setSaveMessage(null);
              }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Subject selector */}
          <div className="flex flex-col gap-1.5 min-w-[170px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">menu_book</span>
              Môn học
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setEditingCell(null);
                setSaveMessage(null);
              }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="ALL">Tất cả môn</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Semester selector */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">date_range</span>
              Học kỳ
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(Number(e.target.value));
                setEditingCell(null);
                setSaveMessage(null);
              }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
          </div>

          {/* Info chip */}
          <div className="flex items-end pb-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {classStudents.length} học sinh · Năm học 2024–2025
            </span>
          </div>
        </div>
      </div>

      {/* ── Spreadsheet table ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-[#f1f5f9] bg-[#f8f9ff]">
          <span className="text-label-sm text-[#64748b] font-medium">Chú thích:</span>
          <span className="inline-flex items-center gap-1.5 text-label-sm">
            <span className="w-3 h-3 rounded bg-[#fef2f2] border border-[#fca5a5] inline-block" />
            <span className="text-[#dc2626] font-medium">Dưới 5.0</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-label-sm">
            <span className="w-3 h-3 rounded bg-[#f0fdf4] border border-[#86efac] inline-block" />
            <span className="text-[#16a34a]">Từ 8.0 trở lên</span>
          </span>
          {!isReadOnly && (
            <span className="ml-auto inline-flex items-center gap-1 text-label-sm text-[#64748b]">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Nhấn vào ô điểm để chỉnh sửa
            </span>
          )}
        </div>

        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto">
          {displaySubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[48px] mb-3">grade</span>
              <p className="text-body-md font-medium">Không có dữ liệu điểm</p>
              <p className="text-body-sm mt-1">Chưa có điểm nào được nhập cho lớp và học kỳ đã chọn.</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse text-body-sm">
              <thead>
                {/* ── Row 1: Group headers ── */}
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {/* Sticky: STT */}
                  <th
                    rowSpan={2}
                    scope="col"
                    className="sticky left-0 z-20 bg-[#f8fafc] border-r border-[#e2e8f0] w-12 min-w-[3rem] px-3 py-3 text-center text-label-sm font-semibold text-[#475569] uppercase tracking-wide align-middle"
                  >
                    STT
                  </th>

                  {/* Sticky: Tên học sinh */}
                  <th
                    rowSpan={2}
                    scope="col"
                    className="sticky left-12 z-20 bg-[#f8fafc] border-r border-[#e2e8f0] min-w-[160px] px-4 py-3 text-left text-label-sm font-semibold text-[#475569] uppercase tracking-wide align-middle"
                  >
                    Học sinh
                  </th>

                  {/* Subject columns per group */}
                  {displaySubjects.map((sub) =>
                    COL_GROUPS.map((group) => {
                      const count = MAX_COLS[group.key];
                      return (
                        <th
                          key={`${sub.id}_${group.key}_head`}
                          colSpan={count}
                          scope="colgroup"
                          className={`px-2 py-2 text-center text-label-sm font-semibold uppercase tracking-wide border-l border-[#e2e8f0] ${group.color} ${group.textColor}`}
                        >
                          {group.label}
                          <span className="block text-[10px] font-normal opacity-70 normal-case tracking-normal">
                            {group.subLabel}
                          </span>
                        </th>
                      );
                    })
                  )}

                  {/* Điểm TB per subject */}
                  {displaySubjects.map((sub) => (
                    <th
                      key={`${sub.id}_avg_head`}
                      scope="col"
                      className="px-3 py-2 text-center text-label-sm font-semibold text-[#475569] uppercase tracking-wide bg-[#f1f5f9] border-l border-[#e2e8f0] min-w-[4.5rem]"
                    >
                      TB
                    </th>
                  ))}
                </tr>

                {/* ── Row 2: Sub-column headers (slot numbers + subject names) ── */}
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {displaySubjects.map((sub) => (
                    <>
                      {COL_GROUPS.map((group) =>
                        Array.from({ length: MAX_COLS[group.key] }, (_, i) => (
                          <th
                            key={`${sub.id}_${group.key}_${i}`}
                            scope="col"
                            className={`px-2 py-1.5 text-center text-[11px] font-medium text-[#64748b] border-l border-[#e2e8f0] min-w-[3.5rem] ${group.color}`}
                          >
                            <span className="block font-semibold text-[10px] text-[#94a3b8] uppercase">
                              {sub.name}
                            </span>
                            Lần {i + 1}
                          </th>
                        ))
                      )}
                      {/* Average sub-header (empty — colspan handled above) */}
                      <th
                        key={`${sub.id}_avg_sub`}
                        scope="col"
                        className="px-3 py-1.5 text-center text-[11px] font-semibold text-[#475569] bg-[#f1f5f9] border-l border-[#e2e8f0]"
                      >
                        <span className="block text-[10px] text-[#94a3b8] font-medium uppercase">
                          {sub.name}
                        </span>
                        HK{selectedSemester}
                      </th>
                    </>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f1f5f9]">
                {classStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + displaySubjects.length * (COL_GROUPS.reduce((s, g) => s + MAX_COLS[g.key], 0) + 1)}
                      className="px-5 py-10 text-center text-body-md text-[#64748b]"
                    >
                      Không có học sinh trong lớp này.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student, rowIdx) => (
                    <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors group">

                      {/* STT — sticky */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-[#f8fafc] border-r border-[#e2e8f0] w-12 px-3 py-2.5 text-center text-body-sm text-[#94a3b8] transition-colors">
                        {rowIdx + 1}
                      </td>

                      {/* Student name — sticky */}
                      <td className="sticky left-12 z-10 bg-white group-hover:bg-[#f8fafc] border-r border-[#e2e8f0] min-w-[160px] px-4 py-2.5 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex-none w-7 h-7 rounded-full bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] flex items-center justify-center text-[#565e74] text-label-sm font-semibold select-none">
                            {rowIdx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-body-sm font-medium text-[#0b1c30] truncate">{student.name}</p>
                            <p className="text-[11px] text-[#94a3b8]">{student.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Grade cells per subject */}
                      {displaySubjects.map((sub) => {
                        const rowKey = `${student.id}__${sub.id}`;
                        const entry = gradeMap[student.id]?.[sub.id];

                        return (
                          <>
                            {COL_GROUPS.map((group) =>
                              Array.from({ length: MAX_COLS[group.key] }, (_, i) => {
                                const col = group.key === 'semester' ? 'semester' : `${group.key}.${i}`;
                                const rawVal = getCellValueFromEntry(entry, group.key, i);
                                const isThisCellEditing =
                                  editingCell?.rowKey === rowKey && editingCell?.col === col;
                                const displayValue = isThisCellEditing ? pendingValue : rawVal;

                                return (
                                  <td
                                    key={`${sub.id}_${group.key}_${i}_cell`}
                                    className={`px-1 py-1.5 text-center border-l border-[#f1f5f9] ${group.color.replace('bg-', 'bg-opacity-30 bg-')}`}
                                    style={{ minWidth: '3.5rem' }}
                                  >
                                    <GradeCell
                                      value={displayValue}
                                      rowKey={rowKey}
                                      col={col}
                                      isEditing={isThisCellEditing}
                                      isReadOnly={isReadOnly}
                                      onStartEdit={handleStartEdit}
                                      onValueChange={handleCellValueChange}
                                      onBlur={handleCellBlur}
                                    />
                                  </td>
                                );
                              })
                            )}

                            {/* Điểm TB column */}
                            <td
                              key={`${sub.id}_avg_cell`}
                              className="px-2 py-1.5 text-center bg-[#f8fafc] border-l border-[#e2e8f0]"
                              style={{ minWidth: '4.5rem' }}
                            >
                              <div
                                className={`w-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm font-semibold ${gradeColorClass(entry?.average ?? null)}`}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {fmtScore(entry?.average ?? null)}
                              </div>
                            </td>
                          </>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Footer: save button + message ── */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
          {/* Inline save message */}
          <div className="min-h-[28px]">
            {saveMessage && (
              <p
                role="status"
                className={`flex items-center gap-1.5 text-body-sm font-medium ${
                  saveMessage.type === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {saveMessage.text}
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || classStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-md shadow-elevation-2 transition-all"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                Lưu điểm
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Modal nộp đơn xin mở khóa / phúc khảo ── */}
      <Modal
        isOpen={isUnlockModalOpen}
        onClose={() => !submittingUnlock && setIsUnlockModalOpen(false)}
        title="Nộp Đơn Xin Mở Khóa Sổ Điểm / Phúc Khảo"
        size="md"
      >
        <form onSubmit={handleRequestUnlockSubmit} className="space-y-4 py-1">
          <div className="p-3 bg-[#eff4ff] border border-[#bfdbfe] rounded-lg text-body-sm text-[#1d4ed8]">
            <p className="font-semibold">Quy định BR-03 (Phân quyền 2 cấp):</p>
            <p className="mt-0.5 text-label-sm">
              Đơn xin mở khóa sẽ được gửi tới Ban Giám Hiệu. Khi được duyệt, hệ thống sẽ mở khóa sổ điểm 24h và tự động ghi vết Audit Log.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm font-medium text-[#334155]">Lớp & Môn học áp dụng</label>
            <input
              type="text"
              readOnly
              value={`Lớp: ${classes.find(c => c.id === selectedClass)?.name || selectedClass} — Môn: ${selectedSubject === 'ALL' ? 'Tất cả môn' : subjects.find(s => s.id === selectedSubject)?.name}`}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm font-medium text-[#475569]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm font-medium text-[#334155]">Lý do đề nghị điều chỉnh điểm / Phúc khảo (*)</label>
            <textarea
              required
              rows={3}
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="Nhập lý do chi tiết (Ví dụ: Học sinh Nguyễn Văn A đệ trình đơn xin phúc khảo bài thi giữa kỳ đã được duyệt)..."
              className="w-full border border-[#e2e8f0] rounded-lg p-3 text-body-sm text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(false)}
              disabled={submittingUnlock}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submittingUnlock || !unlockReason.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-medium shadow-elevation-1 disabled:opacity-50"
            >
              {submittingUnlock ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Đang gửi đơn...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Gửi đơn xin duyệt
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Pure helpers (module-level, no hooks) ───────────────────────────────────

/**
 * Build a nested gradeMap from the raw grades array:
 * { [studentId]: { [subjectId]: { oral, test15min, test45min, semester, average } } }
 */
function buildGradeMap(rawGrades) {
  const map = {};
  for (const g of rawGrades) {
    if (!map[g.studentId]) map[g.studentId] = {};
    map[g.studentId][g.subjectId] = {
      oral:      [...(g.scores.oral      ?? [])],
      test15min: [...(g.scores.test15min ?? [])],
      test45min: [...(g.scores.test45min ?? [])],
      semester:  g.scores.semester  ?? null,
      average:   g.scores.average   ?? null,
    };
  }
  return map;
}

/**
 * Deep-copy the gradeMap (one level per student + subject entry).
 * Shallow-copies score arrays so mutations don't bleed.
 */
function deepCopyMap(map) {
  const next = {};
  for (const [sid, subjMap] of Object.entries(map)) {
    next[sid] = {};
    for (const [subj, entry] of Object.entries(subjMap)) {
      next[sid][subj] = {
        oral:      [...(entry.oral      ?? [])],
        test15min: [...(entry.test15min ?? [])],
        test45min: [...(entry.test45min ?? [])],
        semester:  entry.semester,
        average:   entry.average,
      };
    }
  }
  return next;
}

/**
 * Read a single raw value from a grade entry for rendering.
 * groupKey: 'oral' | 'test15min' | 'test45min' | 'semester'
 * idx: array index (ignored for 'semester')
 */
function getCellValueFromEntry(entry, groupKey, idx) {
  if (!entry) return '';
  if (groupKey === 'semester') return entry.semester ?? '';
  const arr = entry[groupKey];
  if (!Array.isArray(arr)) return '';
  const v = arr[idx];
  return v !== undefined && v !== null ? v : '';
}
