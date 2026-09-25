import { useState, useMemo } from 'react';
import { handleSaveAttendance } from '../../api/stubs.js';
import { students, classes, attendanceRecords } from '../../data/mockData.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as a yyyy-mm-dd string (value for <input type="date">) */
function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Builds the initial attendanceMap for a given class + date.
 * If a matching AttendanceRecord exists in mockData it is used;
 * otherwise every student in the class defaults to 'present'.
 */
function buildInitialMap(classId, date) {
  const classStudents = students.filter((s) => s.classId === classId);
  const record = attendanceRecords.find(
    (r) => r.classId === classId && r.date === date,
  );

  const map = {};
  for (const s of classStudents) {
    map[s.id] = 'present'; // default
  }
  if (record) {
    for (const entry of record.entries) {
      if (entry.studentId in map) {
        map[entry.studentId] = entry.status;
      }
    }
  }
  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Active-state Tailwind classes per attendance status */
const ACTIVE_STYLES = {
  present: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',
  late:    'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
  absent:  'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]',
};

const INACTIVE_STYLE =
  'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]';

const STATUS_LABELS = {
  present: 'Có mặt',
  late:    'Đi trễ',
  absent:  'Vắng',
};

const STATUS_ICONS = {
  present: 'check_circle',
  late:    'schedule',
  absent:  'cancel',
};

function AttendanceToggle({ studentId, current, onChange }) {
  return (
    <div className="flex gap-1.5">
      {(['present', 'late', 'absent']).map((status) => {
        const isActive = current === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(studentId, status)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-label-md font-medium transition-all select-none ${
              isActive ? ACTIVE_STYLES[status] : INACTIVE_STYLE
            }`}
            aria-pressed={isActive}
            aria-label={STATUS_LABELS[status]}
          >
            <span className="material-symbols-outlined text-[16px]">
              {STATUS_ICONS[status]}
            </span>
            <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Summary chip strip shown above the student list */
function SummaryBar({ summary, total }) {
  const chips = [
    { key: 'present', label: 'Có mặt', color: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]' },
    { key: 'late',    label: 'Đi trễ', color: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]' },
    { key: 'absent',  label: 'Vắng',   color: 'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-body-sm text-[#64748b] font-medium mr-1">
        Tổng cộng <span className="text-[#0b1c30] font-semibold">{total}</span> học sinh:
      </span>
      {chips.map(({ key, label, color }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium ${color}`}
        >
          <span className="text-[18px] font-semibold">{summary[key]}</span>
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedDate,  setSelectedDate]  = useState(todayISODate);

  // attendanceMap: { [studentId]: 'present' | 'late' | 'absent' }
  const [attendanceMap, setAttendanceMap] = useState(() =>
    buildInitialMap('10A1', todayISODate()),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null); // { type: 'success'|'error', text: string }

  // Students for the selected class
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClass),
    [selectedClass],
  );

  // Re-initialise attendanceMap whenever class or date changes
  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    setAttendanceMap(buildInitialMap(newClass, selectedDate));
    setSaveMessage(null);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setAttendanceMap(buildInitialMap(selectedClass, newDate));
    setSaveMessage(null);
  };

  // Toggle a single student's status — only that entry changes (Req 9.4)
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    setSaveMessage(null);
  };

  // Real-time summary counts via useMemo (Req 9.5)
  const summary = useMemo(() => {
    const values = Object.values(attendanceMap);
    return {
      present: values.filter((s) => s === 'present').length,
      late:    values.filter((s) => s === 'late').length,
      absent:  values.filter((s) => s === 'absent').length,
    };
  }, [attendanceMap]);

  // Save handler (Req 9.6)
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    const payload = {
      classId:   selectedClass,
      date:      selectedDate,
      teacherId: 'GV001',
      entries:   Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      })),
    };
    try {
      await handleSaveAttendance(payload);
      setSaveMessage({ type: 'success', text: 'Điểm danh đã được lưu thành công!' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Lỗi khi lưu điểm danh. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClassObj = classes.find((c) => c.id === selectedClass);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Điểm danh chuyên cần</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Ghi nhận trạng thái có mặt của học sinh theo buổi học
          </p>
        </div>
      </div>

      {/* ── Filter bar (Req 9.7) ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Class selector */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
              Lớp học
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date picker (Req 9.7) */}
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>
              Ngày điểm danh
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Session info badge */}
          <div className="flex items-end pb-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {selectedClassObj?.name ?? selectedClass} —{' '}
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                : 'Chưa chọn ngày'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Student list ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">

        {/* Summary bar (Req 9.5) — sticky at top of list */}
        <div className="sticky top-0 z-10 border-b border-[#f1f5f9] bg-[#f8f9ff] px-5 py-3">
          <SummaryBar summary={summary} total={classStudents.length} />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto] items-center px-5 py-2.5 bg-[#f8fafc] border-b border-[#f1f5f9]">
          <span className="text-label-sm font-semibold text-[#475569] uppercase tracking-wide">
            Học sinh
          </span>
          <span className="text-label-sm font-semibold text-[#475569] uppercase tracking-wide text-right">
            Trạng thái
          </span>
        </div>

        {/* Student rows (Req 9.2, 9.3, 9.4, 9.8) */}
        {classStudents.length === 0 ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            Không có học sinh trong lớp này.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-[#f1f5f9]">
            {classStudents.map((student, idx) => {
              const status = attendanceMap[student.id] ?? 'present';
              return (
                <li
                  key={student.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-[#f8fafc] transition-colors"
                >
                  {/* Student info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] flex items-center justify-center text-[#565e74] text-label-sm font-semibold select-none">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-md font-medium text-[#0b1c30] truncate">
                        {student.name}
                      </p>
                      <p className="text-body-sm text-[#64748b]">{student.id}</p>
                    </div>
                    {/* Attendance status badge — updates live with attendanceMap */}
                    <div className="hidden sm:block flex-shrink-0">
                      <StatusBadge status={status} />
                    </div>
                  </div>

                  {/* Toggle buttons (Req 9.3, 9.4, 9.8) */}
                  <AttendanceToggle
                    studentId={student.id}
                    current={status}
                    onChange={handleStatusChange}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer: save button + toast ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
        {/* Inline save message */}
        <div className="min-h-[28px]">
          {saveMessage && (
            <p
              role="status"
              className={`flex items-center gap-1.5 text-body-sm font-medium ${
                saveMessage.type === 'success'
                  ? 'text-[#15803d]'
                  : 'text-[#b91c1c]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {saveMessage.text}
            </p>
          )}
        </div>

        {/* Save button (Req 9.6) */}
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
              Lưu điểm danh
            </>
          )}
        </button>
      </div>
    </div>
  );
}
