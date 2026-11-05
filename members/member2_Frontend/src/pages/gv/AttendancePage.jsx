import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { fetchAttendance, fetchClasses, handleSaveAttendance, fetchSchedulePageData, fetchStudents, fetchScheduleTemplates } from '../../api/stubs.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as a yyyy-mm-dd string (value for <input type="date">) */
function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

/** Trả về ngày Thứ Hai (YYYY-MM-DD) của tuần chứa dateStr */
function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  const { role, user, isRestoringSession } = useAuth();
  const isGVCN = role === ROLES.GVCN;

  // GVCN: class cố định từ user.className; BGH/khác: chọn từ dropdown
  // Khởi tạo với giá trị sẵn có ngay lúc mount; useEffect bên dưới sẽ cập nhật
  // khi /auth/me restore session trả về (fix race condition khi reload trang)
  const [selectedClass, setSelectedClass] = useState(() => isGVCN ? (user?.className ?? '') : '');
  const [selectedDate,  setSelectedDate]  = useState(todayISODate);

  // attendanceMap: { [studentId]: 'present' | 'late' | 'absent' }
  const [attendanceMap,  setAttendanceMap]  = useState({});
  const [classStudents,  setClassStudents]  = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [isLoadingData,  setIsLoadingData]  = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const [saveMessage,    setSaveMessage]    = useState(null); // { type: 'success'|'error', text: string }
  const [noSchedule,     setNoSchedule]     = useState(false);

  // Fix race condition: khi session restore (/auth/me) hoàn thành sau mount,
  // user.className mới có giá trị → cập nhật selectedClass cho GVCN
  useEffect(() => {
    if (!isGVCN) return;
    if (!isRestoringSession && user?.className && !selectedClass) {
      setSelectedClass(user.className);
    }
  }, [isGVCN, isRestoringSession, user?.className]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load danh sách lớp CHỈ cho BGH/GV — GVCN không cần dropdown
  useEffect(() => {
    if (isGVCN) return; // GVCN class is fixed
    fetchClasses().then((data) => {
      if (data?.length > 0) {
        setClasses(data);
        setSelectedClass((prev) => prev || data[0].class_name || data[0].id || '');
      }
    });
  }, [isGVCN]);

  // Fetch attendance + kiểm tra lịch học khi selectedClass hoặc selectedDate thay đổi
  useEffect(() => {
    if (!selectedClass) return;
    let cancelled = false;

    setIsLoadingData(true);
    setSaveMessage(null);
    setNoSchedule(false);

    const weekStart = getMondayOfWeek(selectedDate);
    // dayOfWeek: 1=Thứ2..5=Thứ6, 0=CN, 6=Thứ7 (không có tiết)
    const selectedDayObj = new Date(selectedDate + 'T00:00:00');
    const jsDay = selectedDayObj.getDay(); // 0=Sun..6=Sat
    // Chuyển sang dayOfWeek theo schema (1=Thứ2..5=Thứ6)
    const dayOfWeekSchema = jsDay === 0 ? 0 : jsDay; // Sun→0 (không có tiết), Mon→1, ..., Sat→6

    Promise.all([
      fetchAttendance(selectedClass, selectedDate).catch(() => null),
      fetchScheduleTemplates(selectedClass).catch(() => []),
      fetchStudents(selectedClass).catch(() => []),
    ]).then(([attendanceRecords, templateSlots, studentList]) => {
      if (cancelled) return;

      // Kiểm tra ngày hôm đó có tiết học không — dùng template (không phụ thuộc tuần)
      const hasSlotToday = templateSlots.length > 0
        && templateSlots.some((s) => Number(s.dayOfWeek) === dayOfWeekSchema);

      if (!hasSlotToday) {
        // Không có tiết học hôm nay
        setNoSchedule(true);
        setClassStudents([]);
        setAttendanceMap({});
        setIsLoadingData(false);
        return;
      }

      // Build existing attendance map từ records
      const existingMap = {};
      if (Array.isArray(attendanceRecords)) {
        for (const r of attendanceRecords) {
          const id = r.student_code || r.studentCode || String(r.student_id ?? r.id ?? '');
          if (id) existingMap[id] = (r.status || 'present').toLowerCase();
        }
      }

      // Build full student list từ DB, merge với records
      const students = Array.isArray(studentList)
        ? studentList.map((r) => ({
            id:   r.student_code || r.studentCode || String(r.id ?? ''),
            name: r.full_name    || r.fullName    || r.name || '',
          })).filter((s) => s.id)
        : [];

      const map = {};
      students.forEach((s) => { map[s.id] = existingMap[s.id] ?? 'present'; });

      setClassStudents(students);
      setAttendanceMap(map);
      if (!cancelled) setIsLoadingData(false);
    }).catch(() => {
      if (!cancelled) {
        setClassStudents([]);
        setAttendanceMap({});
        setIsLoadingData(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedClass, selectedDate]);

  // Toggle a single student's status — only that entry changes
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    setSaveMessage(null);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSaveMessage(null);
  };

  // Real-time summary counts via useMemo
  const summary = useMemo(() => {
    const values = Object.values(attendanceMap);
    return {
      present: values.filter((s) => s === 'present').length,
      late:    values.filter((s) => s === 'late').length,
      absent:  values.filter((s) => s === 'absent').length,
    };
  }, [attendanceMap]);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    // Gửi kèm studentCode (= student.id) và studentName để backend có thể upsert
    const entries = Object.entries(attendanceMap).map(([studentCode, status]) => {
      const student = classStudents.find((s) => s.id === studentCode);
      return {
        studentCode,
        studentName: student?.name ?? '',
        status,
      };
    });
    const payload = {
      className: selectedClass,
      attDate:   selectedDate,
      entries,
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

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Class selector — chip read-only cho GVCN, dropdown cho BGH/GV */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
              Lớp học
            </label>
            {isGVCN ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eff4ff] text-[#004ac6] border border-[#c3c6d7] text-body-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {selectedClass || 'Chưa phân công'}
              </span>
            ) : (
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSaveMessage(null); }}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
              >
                {classes.length === 0 && <option value="">Đang tải...</option>}
                {classes.map((c) => (
                  <option key={c.class_name || c.id} value={c.class_name || c.id}>
                    {c.name || c.class_name || c.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date picker */}
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
              {selectedClass || '—'} —{' '}
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

        {/* Summary bar — sticky at top of list */}
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

        {/* Loading state */}
        {isLoadingData ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            <span className="material-symbols-outlined text-[32px] animate-spin block mx-auto mb-2 text-[#004ac6]">
              progress_activity
            </span>
            Đang tải...
          </div>
        ) : noSchedule ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            <span className="material-symbols-outlined text-[32px] block mx-auto mb-2 text-[#94a3b8]">event_busy</span>
            Không có tiết học hôm này — lớp {selectedClass} không có lịch học vào ngày này.
          </div>
        ) : classStudents.length === 0 ? (
          <div className="px-5 py-10 text-center text-body-md text-[#64748b]">
            Không có dữ liệu điểm danh cho ngày này.
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

                  {/* Toggle buttons */}
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

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || classStudents.length === 0 || noSchedule}
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
