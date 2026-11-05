/**
 * GradebookPage — Sổ điểm dạng spreadsheet cho GV (nhập điểm) và BGH (xem read-only)
 *
 * Columns: Miệng (hệ số 1), KT 15' (hệ số 1), KT 1 tiết (hệ số 2), HK (hệ số 3), Điểm TB
 * Grade color-coding: < 5.0 → đỏ, >= 8.0 → xanh, trung bình → neutral
 * Inline cell editing cho GV; toàn bộ read-only cho BGH.
 *
 * Dữ liệu: GET /api/gradebook/page-data — không dùng mockData.
 * Requirements: sổ điểm GV / BGH
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../../components/shared/Modal.jsx';
import {
  fetchGradebookPageData,
  saveGradebookSpreadsheet,
  fetchClosureStatus,
  submitClosure,
  requestUnlock,
} from '../../api/stubs.js';
import { exportToExcel, exportToPDF } from '../../utils/exportEngine.js';
import { ROLES } from '../../constants/roles.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeColorClass(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (isNaN(n)) return '';
  if (n < 5) return 'bg-[#fef2f2] text-[#dc2626] font-bold';
  if (n >= 8) return 'bg-[#f0fdf4] text-[#16a34a]';
  return 'bg-[#f8fafc] text-[#334155]';
}

function fmtScore(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return isNaN(n) ? '—' : n % 1 === 0 ? n.toFixed(1) : String(n);
}

function computeAverage(entry) {
  if (!entry) return null;
  const { oral = [], test15min = [], test45min = [], semester } = entry;
  let sum = 0, weight = 0;
  for (const v of oral)      { if (v != null && v !== '') { sum += Number(v) * 1; weight += 1; } }
  for (const v of test15min) { if (v != null && v !== '') { sum += Number(v) * 1; weight += 1; } }
  for (const v of test45min) { if (v != null && v !== '') { sum += Number(v) * 2; weight += 2; } }
  if (semester != null && semester !== '') { sum += Number(semester) * 3; weight += 3; }
  if (weight === 0) return null;
  return Math.round((sum / weight) * 10) / 10;
}

// ─── DB row → gradeMap entry ─────────────────────────────────────────────────

/**
 * Converts a flat DB gradeRow into the internal gradeMap entry shape.
 *
 * DB columns → frontend arrays:
 *   oral[0]      ← scoreOral    (Miệng lần 1)
 *   oral[1]      ← scoreOral2   (Miệng lần 2)
 *   test15min[0] ← score15m     (KT 15' lần 1)
 *   test15min[1] ← score15m2    (KT 15' lần 2)
 *   test45min[0] ← score1Hour   (KT 1 tiết lần 1)
 *   test45min[1] ← scoreMidTerm (KT 1 tiết lần 2 / Giữa HK)
 *   semester     ← scoreFinalTerm (Cuối HK hệ số 3)
 */
function dbRowToEntry(row) {
  return {
    oral:      [row.scoreOral  ?? null, row.scoreOral2 ?? null],
    test15min: [row.score15m   ?? null, row.score15m2  ?? null],
    test45min: [row.score1Hour ?? null, row.scoreMidTerm ?? null],
    semester:  row.scoreFinalTerm ?? null,
    average:   row.averageScore   ?? null,
    _id:       row.id ?? null,
  };
}

/**
 * Build gradeMap from API gradeRows:
 * { [studentCode]: { [subjectName]: entry } }
 */
function buildGradeMapFromRows(gradeRows) {
  const map = {};
  for (const row of gradeRows) {
    const sid   = row.studentCode;
    const subId = row.subjectId; // subjectName used as key
    if (!map[sid]) map[sid] = {};
    map[sid][subId] = dbRowToEntry(row);
  }
  return map;
}

/** Deep-copy gradeMap */
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
        _id:       entry._id ?? null,
      };
    }
  }
  return next;
}

function getCellValueFromEntry(entry, groupKey, idx) {
  if (!entry) return '';
  if (groupKey === 'semester') return entry.semester ?? '';
  const arr = entry[groupKey];
  if (!Array.isArray(arr)) return '';
  const v = arr[idx];
  return v !== undefined && v !== null ? v : '';
}

// ─── Column definitions ───────────────────────────────────────────────────────

const COL_GROUPS = [
  { key: 'oral',      label: 'Miệng',     subLabel: 'Hệ số 1', color: 'bg-[#eff6ff]', textColor: 'text-[#1d4ed8]' },
  { key: 'test15min', label: "KT 15'",    subLabel: 'Hệ số 1', color: 'bg-[#fef9c3]', textColor: 'text-[#854d0e]' },
  { key: 'test45min', label: 'KT 1 tiết', subLabel: 'Hệ số 2', color: 'bg-[#fff7ed]', textColor: 'text-[#c2410c]' },
  { key: 'semester',  label: 'Cuối HK',   subLabel: 'Hệ số 3', color: 'bg-[#f5f3ff]', textColor: 'text-[#7c3aed]' },
];

const MAX_COLS = { oral: 2, test15min: 2, test45min: 2, semester: 1 };

// ─── GradeCell ────────────────────────────────────────────────────────────────

function GradeCell({ value, rowKey, col, isEditing, isReadOnly, onStartEdit, onValueChange, onBlur }) {
  const displayVal = fmtScore(value);
  const colorCls   = gradeColorClass(value);

  if (isReadOnly) {
    return (
      <div className={`w-full h-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm pointer-events-none select-none ${colorCls}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {displayVal}
      </div>
    );
  }

  if (isEditing) {
    return (
      <input type="number" min={0} max={10} step={0.5}
        value={value ?? ''} autoFocus
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={() => onBlur(rowKey, col)}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') onBlur(rowKey, col, true); }}
        className="w-full h-full border border-[#004ac6] rounded bg-white px-2 py-1 text-body-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 text-center"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.5rem' }}
        aria-label="Nhập điểm"
      />
    );
  }

  return (
    <button type="button" onClick={() => onStartEdit(rowKey, col)} title="Nhấn để chỉnh sửa"
      className={`w-full h-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm transition-all hover:ring-2 hover:ring-[#004ac6]/40 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/40 cursor-text ${colorCls || 'bg-[#f8fafc] text-[#64748b]'}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}>
      {displayVal}
    </button>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-2 py-2">
          <div className="animate-pulse h-8 bg-[#e2e8f0] rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GradebookPage() {
  const { role, user } = useAuth();
  const isGVCN     = role === ROLES.GVCN;

  // ── Filter state ─────────────────────────────────────────────────────────
  const [selectedClass,    setSelectedClass]    = useState('');
  const [selectedSubject,  setSelectedSubject]  = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('HK1');

  // ── Data from API ─────────────────────────────────────────────────────────
  const [classes,   setClasses]   = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // ── Grade state ───────────────────────────────────────────────────────────
  const [gradeMap,   setGradeMap]  = useState({});
  const [gradeRows,  setGradeRows] = useState([]); // raw rows — needed for save

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingCell,  setEditingCell]  = useState(null);
  const [pendingValue, setPendingValue] = useState('');

  // ── Save state ────────────────────────────────────────────────────────────
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // ── Closure state ─────────────────────────────────────────────────────────
  const [closureStatus,       setClosureStatus]       = useState(null);
  const [isClosureSubmitting, setIsClosureSubmitting] = useState(false);
  const [isClosureModalOpen,  setIsClosureModalOpen]  = useState(false);

  // ── Modal unlock ─────────────────────────────────────────────────────────
  const [isUnlockModalOpen,  setIsUnlockModalOpen]  = useState(false);
  const [unlockReason,       setUnlockReason]       = useState('');
  const [submittingUnlock,   setSubmittingUnlock]   = useState(false);
  const [unlockSentBanner,   setUnlockSentBanner]   = useState(false); // banner sau khi gửi đơn

  // isReadOnly: BGH luôn read-only; GVCN read-only khi đã chốt sổ chờ duyệt hoặc đã khóa toàn trường
  const isReadOnly = role === ROLES.BGH
    || closureStatus?.status === 'submitted'
    || closureStatus?.status === 'locked';

  // ── Fetch meta (classes list) on mount ────────────────────────────────────
  useEffect(() => {
    async function loadMeta() {
      try {
        // Load with empty className to get classes + subjects; grades will be empty
        const data = await fetchGradebookPageData({ className: '__meta__', semester: selectedSemester });
        if (data.classes?.length > 0) {
          // GVCN chỉ thấy lớp của mình; BGH/GV thấy tất cả
          const filteredClasses = isGVCN && user?.className
            ? data.classes.filter((c) => c.id === user.className || c.name === user.className)
            : data.classes;
          setClasses(filteredClasses);
          setSubjects(data.subjects ?? []);
          // GVCN: set cố định lớp chủ nhiệm; BGH/GV: set lớp đầu tiên
          if (isGVCN && user?.className) {
            setSelectedClass(user.className);
          } else {
            setSelectedClass(filteredClasses[0]?.id ?? '');
          }
        }
      } catch {
        // Silently ignore — main fetch will surface the error
      }
    }
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix race condition: nếu session restore (/auth/me) hoàn thành SAU mount,
  // user.className mới có giá trị → cập nhật selectedClass cho GVCN
  useEffect(() => {
    if (!isGVCN || !user?.className) return;
    setSelectedClass(user.className);
  }, [isGVCN, user?.className]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch grades when class / semester changes ────────────────────────────
  useEffect(() => {
    if (!selectedClass || selectedClass === '__meta__') return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setEditingCell(null);
      setSaveMessage(null);
      try {
        const data = await fetchGradebookPageData({
          className:  selectedClass,
          semester:   selectedSemester,
          schoolYear: '2024-2025',
        });
        if (!cancelled) {
          setClasses(data.classes ?? []);
          setSubjects(data.subjects ?? []);
          setStudents(data.students ?? []);
          setGradeRows(data.gradeRows ?? []);
          setGradeMap(buildGradeMapFromRows(data.gradeRows ?? []));
        }
        // Load closure status cho GVCN
        if (!cancelled && isGVCN) {
          try {
            const closure = await fetchClosureStatus({
              classId:    selectedClass,
              semester:   selectedSemester,
              schoolYear: '2024-2025',
            });
            if (!cancelled) setClosureStatus(closure);
          } catch {
            // Nếu lỗi thì coi như chưa chốt
            if (!cancelled) setClosureStatus(null);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải sổ điểm.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedClass, selectedSemester]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-poll closure status khi GVCN đã gửi đơn xin mở khóa (chờ BGH duyệt) ──
  useEffect(() => {
    // Chỉ poll khi GVCN đang ở trạng thái submitted/locked và đã gửi đơn
    if (!isGVCN || !selectedClass || !unlockSentBanner) return;
    const interval = setInterval(async () => {
      try {
        const closure = await fetchClosureStatus({
          classId:    selectedClass,
          semester:   selectedSemester,
          schoolYear: '2024-2025',
        });
        setClosureStatus(closure);
        // Nếu đã được BGH duyệt mở khóa (status = approved) → dừng poll
        if (closure?.status === 'approved' || closure == null) {
          setUnlockSentBanner(false);
          setSaveMessage({ type: 'success', text: 'BGH đã duyệt mở khóa sổ điểm! Bạn có thể chỉnh sửa điểm trở lại.' });
          clearInterval(interval);
        }
      } catch {
        // Ignore poll errors
      }
    }, 5000); // poll mỗi 5 giây
    return () => clearInterval(interval);
  }, [isGVCN, selectedClass, selectedSemester, unlockSentBanner]); // eslint-disable-line react-hooks/exhaustive-deps
  const classStudents = students; // already filtered by class via API

  const displaySubjects = useMemo(() => {
    if (selectedSubject !== 'ALL') return subjects.filter((s) => s.id === selectedSubject);
    return subjects;
  }, [subjects, selectedSubject]);

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
    setPendingValue(current !== '' && current != null ? String(current) : '');
    setSaveMessage(null);
  }

  function handleCellBlur(rowKey, col, forceRevert = false) {
    if (!editingCell) return;
    if (forceRevert) { setEditingCell(null); setPendingValue(''); return; }

    const raw = pendingValue.trim();
    if (raw !== '') {
      const num = Number(raw);
      if (isNaN(num) || num < 0 || num > 10) { setEditingCell(null); setPendingValue(''); return; }
    }
    const newVal = raw === '' ? null : Number(raw);
    const [studentId, subjectId] = rowKey.split('__');

    setGradeMap((prev) => {
      const next = deepCopyMap(prev);
      if (!next[studentId]) next[studentId] = {};
      if (!next[studentId][subjectId]) {
        next[studentId][subjectId] = { oral: [], test15min: [], test45min: [], semester: null, average: null, _id: null };
      }
      const entry = next[studentId][subjectId];
      if (col === 'semester') {
        entry.semester = newVal;
      } else {
        const [field, idxStr] = col.split('.');
        const idx = Number(idxStr);
        if (!Array.isArray(entry[field])) entry[field] = [];
        while (entry[field].length <= idx) entry[field].push(null);
        entry[field][idx] = newVal;
      }
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

    // Lưu toàn bộ student × subject — kể cả ô null
    // → đảm bảo UPSERT trên server ghi đúng, không bỏ sót bản ghi nào
    const items = [];
    for (const student of classStudents) {
      for (const subject of subjects) {
        const entry = gradeMap[student.id]?.[subject.id] ?? null;
        items.push({
          studentCode:    student.id,
          studentName:    student.name,
          className:      selectedClass,
          subjectId:      subject.id,
          semester:       selectedSemester,
          schoolYear:     '2024-2025',
          scoreOral:      entry?.oral?.[0]      ?? null,
          scoreOral2:     entry?.oral?.[1]      ?? null,
          score15m:       entry?.test15min?.[0] ?? null,
          score15m2:      entry?.test15min?.[1] ?? null,
          score1Hour:     entry?.test45min?.[0] ?? null,
          scoreMidTerm:   entry?.test45min?.[1] ?? null,
          scoreFinalTerm: entry?.semester        ?? null,
        });
      }
    }

    if (items.length === 0) {
      setSaveMessage({ type: 'error', text: 'Không có điểm nào để lưu.' });
      setIsSaving(false);
      return;
    }

    try {
      await saveGradebookSpreadsheet({ className: selectedClass, semester: selectedSemester, schoolYear: '2024-2025', items });
      setSaveMessage({ type: 'success', text: 'Điểm đã được lưu thành công!' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Lỗi khi lưu điểm. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function handleExportExcel() {
    const className = selectedClass;
    const headers = ['STT', 'Mã HS', 'Họ tên', 'TBM Môn', 'Học lực'];
    const rows = classStudents.map((st, idx) => {
      const entry = gradeMap[st.id]?.[selectedSubject !== 'ALL' ? selectedSubject : subjects[0]?.id];
      const avg = entry?.average ?? '—';
      const rank = typeof avg === 'number'
        ? (avg >= 8 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5 ? 'Trung bình' : 'Yếu')
        : '—';
      return [idx + 1, st.id, st.name, avg, rank];
    });
    exportToExcel(`BangDiem_${className}_${selectedSemester}`, `Lớp ${className}`, headers, rows);
  }

  function handleExportPDF() {
    const className = selectedClass;
    const subjectName = selectedSubject === 'ALL' ? 'Tất cả các môn' : subjects.find((s) => s.id === selectedSubject)?.name || '';
    const headers = ['STT', 'Mã Học Sinh', 'Họ và Tên', 'Điểm Trung Bình', 'Xếp Loại'];
    const rows = classStudents.map((st, idx) => {
      const entry = gradeMap[st.id]?.[selectedSubject !== 'ALL' ? selectedSubject : subjects[0]?.id];
      const avg = entry?.average ?? '—';
      const rank = typeof avg === 'number'
        ? (avg >= 8 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5 ? 'Trung bình' : 'Yếu')
        : '—';
      return [idx + 1, st.id, st.name, avg, rank];
    });
    exportToPDF(
      `BẢNG ĐIỂM TỔNG HỢP LỚP ${className}`,
      `Môn: ${subjectName} | ${selectedSemester} - Năm học 2024–2025`,
      headers, rows
    );
  }

  function handleRequestUnlockSubmit(e) {
    e.preventDefault();
    if (!unlockReason.trim()) return;
    setSubmittingUnlock(true);
    requestUnlock({
      classId:    selectedClass,
      className:  selectedClass,
      gvcnName:   user?.fullName || user?.full_name || '',
      semester:   selectedSemester,
      schoolYear: '2024-2025',
      reason:     unlockReason,
    })
      .then(() => {
        setSubmittingUnlock(false);
        setIsUnlockModalOpen(false);
        setUnlockReason('');
        setUnlockSentBanner(true);
        setSaveMessage({ type: 'success', text: 'Đã gửi đơn xin mở khóa sổ điểm tới Ban Giám Hiệu phê duyệt thành công! Vui lòng chờ BGH xử lý.' });
      })
      .catch((err) => {
        setSubmittingUnlock(false);
        setSaveMessage({ type: 'error', text: err.message || 'Gửi đơn thất bại. Vui lòng thử lại.' });
      });
  }

  async function handleSubmitClosure() {
    setIsClosureSubmitting(true);
    try {
      const result = await submitClosure({
        classId:    selectedClass,
        className:  selectedClass,
        gvcnName:   user?.fullName || user?.full_name || '',
        semester:   selectedSemester,
        schoolYear: '2024-2025',
      });
      setClosureStatus(result);
      setIsClosureModalOpen(false);
      setSaveMessage({ type: 'success', text: 'Chốt sổ điểm thành công! Sổ điểm đã được gửi cho Ban Giám Hiệu ký duyệt.' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Chốt sổ điểm thất bại. Vui lòng thử lại.' });
    } finally {
      setIsClosureSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const totalCols = 2 + displaySubjects.length * (COL_GROUPS.reduce((s, g) => s + MAX_COLS[g.key], 0) + 1);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Sổ điểm</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            {isReadOnly ? 'Xem bảng điểm học sinh theo lớp và môn học' : 'Nhập và quản lý điểm số học sinh theo buổi học'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isReadOnly && role === ROLES.BGH && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff7ed] text-[#c2410c] border border-[#fdba74] text-label-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Chế độ xem (BGH)
            </span>
          )}
          {isGVCN && !closureStatus && (
            <button type="button" onClick={() => setIsClosureModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-body-sm font-medium transition-all">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Chốt sổ điểm
            </button>
          )}
          {!isReadOnly && (
            <button type="button" onClick={() => setIsUnlockModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fdba74] text-body-sm font-medium transition-all">
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Xin mở khóa / Phúc khảo
            </button>
          )}
          {isGVCN && isReadOnly && closureStatus && (
            <button type="button" onClick={() => setIsUnlockModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fdba74] text-body-sm font-medium transition-all">
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Xin mở khóa
            </button>
          )}
          <button type="button" onClick={handleExportExcel} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-body-sm font-medium transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Xuất Excel
          </button>
          <button type="button" onClick={handleExportPDF} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] text-body-sm font-medium transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline" onClick={() => { setError(null); if (selectedClass) { setLoading(true); fetchGradebookPageData({ className: selectedClass, semester: selectedSemester, schoolYear: '2024-2025' }).then((d) => { setStudents(d.students); setGradeRows(d.gradeRows); setGradeMap(buildGradeMapFromRows(d.gradeRows)); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); } }}>
            Thử lại
          </button>
        </div>
      )}

      {/* ── Closure Banner ── */}
      {isGVCN && closureStatus?.status === 'submitted' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef9c3] border border-[#fde68a] text-[#854d0e]" role="status">
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <p className="text-body-sm font-medium flex-1">
            Sổ điểm đã chốt – chỉ xem.{' '}
            <span className="font-normal">Chờ BGH ký duyệt.</span>
          </p>
        </div>
      )}
      {isGVCN && closureStatus?.status === 'locked' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="status">
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <p className="text-body-sm font-medium flex-1">Sổ điểm đã chốt – chỉ xem.</p>
        </div>
      )}
      {/* Banner chờ BGH duyệt mở khóa */}
      {isGVCN && unlockSentBanner && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#eff4ff] border border-[#bfdbfe] text-[#1d4ed8]" role="status">
          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          <p className="text-body-sm font-medium flex-1">
            Đã gửi đơn xin mở khóa – đang chờ BGH phê duyệt.
            <span className="font-normal"> Trang sẽ tự động cập nhật khi được duyệt.</span>
          </p>
        </div>
      )}
      {/* ── Filter toolbar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Class selector */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>Lớp học
            </label>
            {isGVCN ? (
              // GVCN: chip read-only, không có dropdown
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {selectedClass || user?.className || 'Chưa phân công'}
              </span>
            ) : (
              // BGH và các role khác: dropdown như cũ
              <select value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject('ALL'); }}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
                {classes.length === 0 && <option value="">Đang tải...</option>}
                {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
            )}
          </div>

          {/* Subject selector */}
          <div className="flex flex-col gap-1.5 min-w-[170px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">menu_book</span>Môn học
            </label>
            <select value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setEditingCell(null); setSaveMessage(null); }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
              <option value="ALL">Tất cả môn</option>
              {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>

          {/* Semester selector */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">date_range</span>Học kỳ
            </label>
            <select value={selectedSemester}
              onChange={(e) => { setSelectedSemester(e.target.value); setEditingCell(null); setSaveMessage(null); }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
            </select>
          </div>

          {/* Info chip */}
          <div className="flex items-end pb-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {loading ? 'Đang tải...' : `${classStudents.length} học sinh · Năm học 2024–2025`}
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

        {/* Table */}
        <div className="overflow-x-auto">
          {displaySubjects.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[48px] mb-3">grade</span>
              <p className="text-body-md font-medium">Không có dữ liệu điểm</p>
              <p className="text-body-sm mt-1">Chưa có điểm nào được nhập cho lớp và học kỳ đã chọn.</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse text-body-sm">
              <thead>
                {/* Row 1: Group headers */}
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th rowSpan={2} scope="col"
                    className="sticky left-0 z-20 bg-[#f8fafc] border-r border-[#e2e8f0] w-12 min-w-[3rem] px-3 py-3 text-center text-label-sm font-semibold text-[#475569] uppercase tracking-wide align-middle">
                    STT
                  </th>
                  <th rowSpan={2} scope="col"
                    className="sticky left-12 z-20 bg-[#f8fafc] border-r border-[#e2e8f0] min-w-[160px] px-4 py-3 text-left text-label-sm font-semibold text-[#475569] uppercase tracking-wide align-middle">
                    Học sinh
                  </th>
                  {displaySubjects.map((sub) => (
                    <React.Fragment key={sub.id}>
                      {COL_GROUPS.map((group) => (
                        <th key={`${sub.id}_${group.key}_head`} colSpan={MAX_COLS[group.key]} scope="colgroup"
                          className={`px-2 py-2 text-center text-label-sm font-semibold uppercase tracking-wide border-l border-[#e2e8f0] ${group.color} ${group.textColor}`}>
                          {group.label}
                          <span className="block text-[10px] font-normal opacity-70 normal-case tracking-normal">{group.subLabel}</span>
                        </th>
                      ))}
                      <th key={`${sub.id}_avg_head`} scope="col"
                        className="px-3 py-2 text-center text-label-sm font-semibold text-[#475569] uppercase tracking-wide bg-[#f1f5f9] border-l border-[#e2e8f0]"
                        style={{ minWidth: '5.5rem' }}>
                        Tổng
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
                {/* Row 2: Sub-column headers */}
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {displaySubjects.map((sub) => (
                    <>
                      {COL_GROUPS.map((group) =>
                        Array.from({ length: MAX_COLS[group.key] }, (_, i) => (
                          <th key={`${sub.id}_${group.key}_${i}`} scope="col"
                            className={`px-2 py-1.5 text-center text-[11px] font-medium text-[#64748b] border-l border-[#e2e8f0] min-w-[3.5rem] ${group.color}`}>
                            <span className="block font-semibold text-[10px] text-[#94a3b8] uppercase">{sub.name}</span>
                            Lần {i + 1}
                          </th>
                        ))
                      )}
                      <th key={`${sub.id}_avg_sub`} scope="col"
                        className="px-3 py-1.5 text-center text-[11px] font-semibold text-[#475569] bg-[#f1f5f9] border-l border-[#e2e8f0]"
                        style={{ minWidth: '5.5rem' }}>
                        <span className="block text-[10px] text-[#94a3b8] font-medium uppercase">{sub.name}</span>
                        {selectedSemester}
                      </th>
                    </>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f1f5f9]">
                {loading ? (
                  [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={totalCols} />)
                ) : classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={totalCols} className="px-5 py-10 text-center text-body-md text-[#64748b]">
                      Không có học sinh trong lớp này.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student, rowIdx) => (
                    <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors group">
                      {/* STT sticky */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-[#f8fafc] border-r border-[#e2e8f0] w-12 px-3 py-2.5 text-center text-body-sm text-[#94a3b8] transition-colors">
                        {rowIdx + 1}
                      </td>
                      {/* Name sticky */}
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

                      {/* Grade cells */}
                      {displaySubjects.map((sub) => {
                        const rowKey = `${student.id}__${sub.id}`;
                        const entry  = gradeMap[student.id]?.[sub.id];
                        return (
                          <>
                            {COL_GROUPS.map((group) =>
                              Array.from({ length: MAX_COLS[group.key] }, (_, i) => {
                                const col = group.key === 'semester' ? 'semester' : `${group.key}.${i}`;
                                const rawVal = getCellValueFromEntry(entry, group.key, i);
                                const isThisCellEditing = editingCell?.rowKey === rowKey && editingCell?.col === col;
                                const displayValue = isThisCellEditing ? pendingValue : rawVal;
                                return (
                                  <td key={`${sub.id}_${group.key}_${i}_cell`}
                                    className={`px-1 py-1.5 text-center border-l border-[#f1f5f9] ${group.color.replace('bg-', 'bg-opacity-30 bg-')}`}
                                    style={{ minWidth: '3.5rem' }}>
                                    <GradeCell
                                      value={displayValue}
                                      rowKey={rowKey}
                                      col={col}
                                      isEditing={isThisCellEditing}
                                      isReadOnly={isReadOnly}
                                      onStartEdit={handleStartEdit}
                                      onValueChange={setPendingValue}
                                      onBlur={handleCellBlur}
                                    />
                                  </td>
                                );
                              })
                            )}
                            {/* Average column */}
                            <td key={`${sub.id}_avg_cell`}
                              className="px-2 py-1.5 text-center bg-[#f8fafc] border-l border-[#e2e8f0]"
                              style={{ minWidth: '5.5rem' }}>
                              <div className={`w-full flex items-center justify-center px-2 py-1.5 rounded text-body-sm font-semibold ${gradeColorClass(entry?.average ?? null)}`}
                                style={{ fontVariantNumeric: 'tabular-nums' }}>
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

      {/* ── Footer: save button ── */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
          <div className="min-h-[28px]">
            {saveMessage && (
              <p role="status"
                className={`flex items-center gap-1.5 text-body-sm font-medium ${saveMessage.type === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {saveMessage.text}
              </p>
            )}
          </div>
          <button type="button" onClick={handleSave}
            disabled={isSaving || loading || classStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-md shadow-elevation-2 transition-all">
            {isSaving ? (
              <><span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>Đang lưu...</>
            ) : (
              <><span className="material-symbols-outlined text-[20px]">save</span>Lưu điểm</>
            )}
          </button>
        </div>
      )}

      {/* ── Modal xác nhận chốt sổ điểm ── */}
      <Modal
        isOpen={isClosureModalOpen}
        onClose={() => !isClosureSubmitting && setIsClosureModalOpen(false)}
        title="Xác nhận chốt sổ điểm"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-[#fff7ed] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-[#f59e0b]" aria-hidden="true">lock</span>
          </div>
          <div className="space-y-2">
            <p className="text-body-md font-semibold text-[#0f172a]">Chốt sổ điểm lớp {selectedClass}</p>
            <p className="text-body-sm text-[#64748b] leading-relaxed">
              Sau khi chốt sổ, <strong className="text-[#0b1c30]">điểm sẽ không thể chỉnh sửa</strong> trừ khi BGH duyệt đơn mở khóa.
              Hành động này sẽ gửi sổ điểm tới Ban Giám Hiệu để ký duyệt.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2 border-t border-[#f1f5f9]">
            <button type="button" onClick={() => setIsClosureModalOpen(false)} disabled={isClosureSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 transition-colors">
              Hủy
            </button>
            <button type="button" onClick={handleSubmitClosure} disabled={isClosureSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold transition-all">
              {isClosureSubmitting ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Đang chốt...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">lock</span>Chốt sổ</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal mở khóa / phúc khảo ── */}
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
            <label className="text-label-sm font-medium text-[#334155]">Lớp &amp; Môn học áp dụng</label>
            <input type="text" readOnly
              value={`Lớp: ${selectedClass} — Môn: ${selectedSubject === 'ALL' ? 'Tất cả môn' : subjects.find((s) => s.id === selectedSubject)?.name ?? selectedSubject}`}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm font-medium text-[#475569]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-sm font-medium text-[#334155]">Lý do đề nghị điều chỉnh điểm / Phúc khảo (*)</label>
            <textarea required rows={3} value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="w-full border border-[#e2e8f0] rounded-lg p-3 text-body-sm text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
            <button type="button" onClick={() => setIsUnlockModalOpen(false)} disabled={submittingUnlock}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc]">
              Hủy bỏ
            </button>
            <button type="submit" disabled={submittingUnlock || !unlockReason.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-medium shadow-elevation-1 disabled:opacity-50">
              {submittingUnlock
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Đang gửi đơn...</>
                : <><span className="material-symbols-outlined text-[18px]">send</span>Gửi đơn xin duyệt</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
