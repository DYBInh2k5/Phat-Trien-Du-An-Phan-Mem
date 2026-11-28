/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: AttendancePage.jsx
 * Vai trò: Trang Điểm Danh Chuyên Cần (Attendance Page) — UAT-06
 * Nâng cấp: Điểm danh 2 cấp theo tiết học
 *   - period=0: GVCN điểm danh đầu giờ (mặc định)
 *   - period=1..10: GVBM điểm danh theo tiết học
 *   - Mỗi (student_code, class_name, att_date, period) là bản ghi độc lập
 *   - Trạng thái LATE: hiển thị ô nhập số phút đi trễ
 * ==============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import {
  fetchAttendance, fetchClasses, handleSaveAttendance,
  fetchScheduleTemplates, fetchStudents,
} from '../../api/stubs.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Các tiết học hiển thị trong dropdown.
 * period=0: đầu giờ GVCN, period=1..10: tiết học GVBM.
 */
const PERIOD_OPTIONS = [
  { value: 0, label: 'Đầu giờ (GVCN)' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Tiết ${i + 1}` })),
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ACTIVE_STYLES = {
  present: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',
  late:    'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
  absent:  'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]',
};
const INACTIVE_STYLE = 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]';
const STATUS_LABELS  = { present: 'Có mặt', late: 'Đi trễ', absent: 'Vắng' };
const STATUS_ICONS   = { present: 'check_circle', late: 'schedule', absent: 'cancel' };

/**
 * Toggle 3 nút trạng thái điểm danh cho 1 học sinh.
 */
function AttendanceToggle({ studentId, current, onChange }) {
  return (
    <div className="flex gap-1.5">
      {(['present', 'late', 'absent']).map((status) => {
        const isActive = current === status;
        return (
          <button key={status} type="button"
            onClick={() => onChange(studentId, status)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-label-md font-medium transition-all select-none ${isActive ? ACTIVE_STYLES[status] : INACTIVE_STYLE}`}
            aria-pressed={isActive} aria-label={STATUS_LABELS[status]}>
            <span className="material-symbols-outlined text-[16px]">{STATUS_ICONS[status]}</span>
            <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Ô nhập số phút đi trễ — chỉ hiển thị khi status = 'late'.
 * @param {{ studentId, minutes, onChange }} props
 */
function LateMinutesInput({ studentId, minutes, onChange }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="material-symbols-outlined text-[15px] text-[#c2410c]" aria-hidden="true">timer</span>
      <input
        type="number"
        min={1}
        max={120}
        value={minutes || ''}
        onChange={e => onChange(studentId, e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
        placeholder="Số phút"
        className="w-24 px-2 py-1 text-[12px] border border-[#fdba74] rounded-lg bg-[#fff7ed] text-[#c2410c] font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition"
        aria-label={`Số phút đi trễ`}
      />
      <span className="text-[12px] text-[#c2410c] font-medium">phút</span>
    </div>
  );
}

/**
 * Thanh tổng hợp số lượng từng trạng thái.
 */
function SummaryBar({ summary, total }) {
  const chips = [
    { key: 'present', label: 'Có mặt', color: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]' },
    { key: 'late',    label: 'Đi trễ', color: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]' },
    { key: 'absent',  label: 'Vắng',   color: 'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-body-sm text-[#64748b] font-medium mr-1">
        Tổng <span className="text-[#0b1c30] font-semibold">{total}</span> học sinh:
      </span>
      {chips.map(({ key, label, color }) => (
        <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium ${color}`}>
          <span className="text-[18px] font-semibold">{summary[key]}</span>
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { role, user, isRestoringSession } = useAuth();
  const isGVCN = role === ROLES.GVCN;

  const [selectedClass,  setSelectedClass]  = useState(() => isGVCN ? (user?.className ?? '') : '');
  const [selectedDate,   setSelectedDate]   = useState(todayISODate);
  /**
   * selectedPeriod: 0 = đầu giờ GVCN, 1..10 = tiết học GVBM.
   * GVCN mặc định 0, GVBM/BGH có thể chọn.
   */
  const [selectedPeriod, setSelectedPeriod] = useState(() => isGVCN ? 0 : 0);
  /**
   * subjectName cho tiết học (period > 0): lấy từ template TKB hoặc nhập tay.
   */
  const [subjectName,    setSubjectName]    = useState('');

  // attendanceMap: { [studentCode]: 'present' | 'late' | 'absent' }
  const [attendanceMap,  setAttendanceMap]  = useState({});
  // lateMinutesMap: { [studentCode]: number } — phút đi trễ
  const [lateMinutesMap, setLateMinutesMap] = useState({});

  const [classStudents,  setClassStudents]  = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [templateSlots,  setTemplateSlots]  = useState([]);
  const [isLoadingData,  setIsLoadingData]  = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const [saveMessage,    setSaveMessage]    = useState(null);
  const [noSchedule,     setNoSchedule]     = useState(false);

  // Fix race condition: session restore xong mới có user.className
  useEffect(() => {
    if (!isGVCN) return;
    if (!isRestoringSession && user?.className && !selectedClass) {
      setSelectedClass(user.className);
    }
  }, [isGVCN, isRestoringSession, user?.className]); // eslint-disable-line

  // Load danh sách lớp cho BGH/GV
  useEffect(() => {
    if (isGVCN) return;
    fetchClasses().then(data => {
      if (data?.length > 0) {
        setClasses(data);
        setSelectedClass(prev => prev || data[0].class_name || data[0].id || '');
      }
    });
  }, [isGVCN]);

  // Khi class / date thay đổi → load template + danh sách HS + attendance hiện tại
  useEffect(() => {
    if (!selectedClass) return;
    let cancelled = false;
    setIsLoadingData(true);
    setSaveMessage(null);
    setNoSchedule(false);

    const selectedDayObj = new Date(selectedDate + 'T00:00:00');
    const jsDay = selectedDayObj.getDay();
    const dayOfWeekSchema = jsDay === 0 ? 0 : jsDay;

    Promise.all([
      fetchScheduleTemplates(selectedClass).catch(() => []),
      fetchStudents(selectedClass).catch(() => []),
    ]).then(([slots, studentList]) => {
      if (cancelled) return;
      setTemplateSlots(slots ?? []);

      const hasSlotToday = Array.isArray(slots) && slots.length > 0
        && slots.some(s => Number(s.dayOfWeek) === dayOfWeekSchema);

      if (!hasSlotToday) {
        setNoSchedule(true);
        setClassStudents([]);
        setAttendanceMap({});
        setLateMinutesMap({});
        setIsLoadingData(false);
        return;
      }

      const students = Array.isArray(studentList)
        ? studentList.map(r => ({
            id:   r.student_code || r.studentCode || String(r.id ?? ''),
            name: r.full_name    || r.fullName    || r.name || '',
          })).filter(s => s.id)
        : [];

      setClassStudents(students);
      if (!cancelled) setIsLoadingData(false);
    }).catch(() => {
      if (!cancelled) {
        setClassStudents([]);
        setIsLoadingData(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedClass, selectedDate]);

  // Khi class / date / period thay đổi → reload attendance records cho tiết đó
  useEffect(() => {
    if (!selectedClass || classStudents.length === 0) return;
    let cancelled = false;

    fetchAttendance(selectedClass, selectedDate, selectedPeriod)
      .then(records => {
        if (cancelled) return;
        const existingMap = {};
        const existingLate = {};
        if (Array.isArray(records)) {
          for (const r of records) {
            const id = r.student_code || r.studentCode || String(r.student_id ?? r.id ?? '');
            if (id) {
              existingMap[id] = (r.status || 'present').toLowerCase();
              if (existingMap[id] === 'late') {
                existingLate[id] = r.late_minutes || r.lateMinutes || 0;
              }
            }
          }
        }
        const map = {};
        classStudents.forEach(s => { map[s.id] = existingMap[s.id] ?? 'present'; });
        setAttendanceMap(map);
        setLateMinutesMap(existingLate);
      })
      .catch(() => {
        // Khởi tạo tất cả present nếu fetch lỗi
        const map = {};
        classStudents.forEach(s => { map[s.id] = 'present'; });
        setAttendanceMap(map);
        setLateMinutesMap({});
      });

    return () => { cancelled = true; };
  }, [selectedClass, selectedDate, selectedPeriod, classStudents]);

  // Khi chọn tiết → tự điền môn học từ template TKB nếu có
  useEffect(() => {
    if (selectedPeriod === 0) { setSubjectName(''); return; }
    const selectedDayObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeekSchema = selectedDayObj.getDay() === 0 ? 0 : selectedDayObj.getDay();
    const slot = templateSlots.find(
      s => Number(s.dayOfWeek) === dayOfWeekSchema && Number(s.period) === selectedPeriod
    );
    setSubjectName(slot?.subjectName || slot?.subject_name || '');
  }, [selectedPeriod, selectedDate, templateSlots]);

  function handleStatusChange(studentId, status) {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    // Khi đổi khỏi LATE → xóa lateMinutes
    if (status !== 'late') {
      setLateMinutesMap(prev => { const n = { ...prev }; delete n[studentId]; return n; });
    }
    setSaveMessage(null);
  }

  function handleLateMinutesChange(studentId, minutes) {
    setLateMinutesMap(prev => ({ ...prev, [studentId]: minutes }));
  }

  const summary = useMemo(() => {
    const values = Object.values(attendanceMap);
    return {
      present: values.filter(s => s === 'present').length,
      late:    values.filter(s => s === 'late').length,
      absent:  values.filter(s => s === 'absent').length,
    };
  }, [attendanceMap]);

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);
    const entries = Object.entries(attendanceMap).map(([studentCode, status]) => {
      const student = classStudents.find(s => s.id === studentCode);
      return {
        studentCode,
        studentName:  student?.name ?? '',
        status,
        lateMinutes:  status === 'late' ? (lateMinutesMap[studentCode] || 0) : 0,
      };
    });
    const payload = {
      className:   selectedClass,
      attDate:     selectedDate,
      period:      selectedPeriod,
      subjectName: selectedPeriod > 0 ? (subjectName || null) : null,
      entries,
    };
    try {
      await handleSaveAttendance(payload);
      setSaveMessage({ type: 'success', text: `Đã lưu điểm danh ${PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label ?? ''} thành công!` });
    } catch {
      setSaveMessage({ type: 'error', text: 'Lỗi khi lưu điểm danh. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  }

  // Label mô tả tiết hiện tại
  const periodLabel = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label ?? '';

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Điểm danh chuyên cần</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Ghi nhận trạng thái có mặt · Điểm danh 2 cấp theo tiết học (UAT-06)
          </p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Lớp */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>Lớp học
            </label>
            {isGVCN ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {selectedClass || 'Chưa phân công'}
              </span>
            ) : (
              <select value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSaveMessage(null); }}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition">
                {classes.length === 0 && <option value="">Đang tải...</option>}
                {classes.map(c => (
                  <option key={c.class_name || c.id} value={c.class_name || c.id}>
                    {c.name || c.class_name || c.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ngày */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>Ngày điểm danh
            </label>
            <input type="date" value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setSaveMessage(null); }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition" />
          </div>

          {/* Tiết học — UAT-06 */}
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">schedule</span>
              Tiết học
              <span className="ml-1 text-[10px] text-[#2563eb] bg-[#eff4ff] px-1.5 py-0.5 rounded font-bold">UAT-06</span>
            </label>
            <select value={selectedPeriod}
              onChange={e => { setSelectedPeriod(Number(e.target.value)); setSaveMessage(null); }}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition"
              aria-label="Chọn tiết học">
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Môn học (khi period > 0) */}
          {selectedPeriod > 0 && (
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-label-sm font-medium text-[#434655]">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">book</span>Môn học
              </label>
              <input type="text" value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                placeholder="VD: Toán, Ngữ văn..."
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition" />
            </div>
          )}

          {/* Info chip */}
          <div className="flex items-end pb-0.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-body-sm font-medium ${
              selectedPeriod === 0
                ? 'bg-[#eff4ff] text-[#004ac6] border-[#c3c6d7]'
                : 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]'
            }`}>
              <span className="material-symbols-outlined text-[16px]">info</span>
              {selectedClass || '—'} · {periodLabel}
              {selectedPeriod > 0 && subjectName ? ` · ${subjectName}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Student list ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="sticky top-0 z-10 border-b border-[#f1f5f9] bg-[#f8f9ff] px-5 py-3">
          <SummaryBar summary={summary} total={classStudents.length} />
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center px-5 py-2.5 bg-[#f8fafc] border-b border-[#f1f5f9]">
          <span className="text-label-sm font-semibold text-[#475569] uppercase tracking-wide">Học sinh</span>
          <span className="text-label-sm font-semibold text-[#475569] uppercase tracking-wide text-right">Trạng thái</span>
        </div>

        {isLoadingData ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            <span className="material-symbols-outlined text-[32px] animate-spin block mx-auto mb-2 text-[#004ac6]">progress_activity</span>
            Đang tải...
          </div>
        ) : noSchedule ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            <span className="material-symbols-outlined text-[32px] block mx-auto mb-2 text-[#94a3b8]">event_busy</span>
            Lớp {selectedClass} không có lịch học vào ngày này.
          </div>
        ) : classStudents.length === 0 ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            Không có dữ liệu học sinh cho lớp này.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-[#f1f5f9]">
            {classStudents.map((student, idx) => {
              const status = attendanceMap[student.id] ?? 'present';
              const isLate = status === 'late';
              return (
                <li key={student.id}
                  className="px-5 py-3.5 hover:bg-[#f8fafc] transition-colors">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                    {/* Student info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] flex items-center justify-center text-[#565e74] text-label-sm font-semibold select-none">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-[#0b1c30] truncate">{student.name}</p>
                        <p className="text-body-sm text-[#64748b]">{student.id}</p>
                        {/* Ô nhập phút đi trễ — hiện khi LATE */}
                        {isLate && (
                          <LateMinutesInput
                            studentId={student.id}
                            minutes={lateMinutesMap[student.id] ?? 0}
                            onChange={handleLateMinutesChange}
                          />
                        )}
                      </div>
                      <div className="hidden sm:block flex-shrink-0">
                        <StatusBadge status={status} />
                      </div>
                    </div>

                    {/* Toggle */}
                    <AttendanceToggle
                      studentId={student.id}
                      current={status}
                      onChange={handleStatusChange}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
        <div className="min-h-[28px]">
          {saveMessage && (
            <p role="status" className={`flex items-center gap-1.5 text-body-sm font-medium ${saveMessage.type === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
              <span className="material-symbols-outlined text-[18px]">{saveMessage.type === 'success' ? 'check_circle' : 'error'}</span>
              {saveMessage.text}
            </p>
          )}
        </div>

        <button type="button" onClick={handleSave}
          disabled={isSaving || classStudents.length === 0 || noSchedule}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-md shadow-elevation-2 transition-all">
          {isSaving
            ? <><span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>Đang lưu...</>
            : <><span className="material-symbols-outlined text-[20px]">save</span>Lưu {periodLabel}</>
          }
        </button>
      </div>
    </div>
  );
}
