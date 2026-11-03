import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchScheduleTemplates } from '../../api/stubs.js';

const DAYS = [
  { dayOfWeek: 1, label: 'Thứ Hai' },
  { dayOfWeek: 2, label: 'Thứ Ba' },
  { dayOfWeek: 3, label: 'Thứ Tư' },
  { dayOfWeek: 4, label: 'Thứ Năm' },
  { dayOfWeek: 5, label: 'Thứ Sáu' },
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PERIOD_TIMES = {
  1: '07:00 – 07:45', 2: '07:50 – 08:35', 3: '08:40 – 09:25',
  4: '09:35 – 10:20', 5: '10:25 – 11:10', 6: '13:00 – 13:45',
  7: '13:50 – 14:35', 8: '14:40 – 15:25', 9: '15:30 – 16:15', 10: '16:20 – 17:05',
};

/** Tính Thứ Hai của tuần chứa ngày `d` */
function getMondayOf(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=CN, 1=T2...6=T7
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

/** Format date → "YYYY-MM-DD" */
function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Tạo label "Tuần DD/MM – DD/MM/YYYY" */
function buildWeekLabel(mondayStr) {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const mon = new Date(y, m - 1, d);
  const fri = new Date(y, m - 1, d + 4);
  const fmt = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
  return `Tuần ${fmt(mon)}–${fmt(fri)}/${fri.getFullYear()}`;
}

function buildWeekOptions() {
  const options = [{ value: '2024-11-11', label: 'Tuần 11–15/11/2024' }];
  const today = new Date();
  const thisMonday = getMondayOf(today);
  for (let i = 0; i < 4; i++) {
    const mon = new Date(thisMonday);
    mon.setDate(thisMonday.getDate() - i * 7);
    const val = toYMD(mon);
    if (val !== '2024-11-11') {
      options.push({ value: val, label: buildWeekLabel(val) });
    }
  }
  return options;
}

const WEEK_OPTIONS = buildWeekOptions();

function getDateLabel(weekStart, dayOfWeek) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + (dayOfWeek - 1));
  return `${String(base.getDate()).padStart(2,'0')}/${String(base.getMonth()+1).padStart(2,'0')}`;
}

export default function StudentSchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState('2024-11-11');
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const CLASS_ID = '10A1';
  const printRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchScheduleTemplates(CLASS_ID)
      .then((templates) => {
        // Map API shape → UI shape; weekStart comes from selectedWeek at render time
        const mapped = (templates || []).map(slot => ({
          classId: slot.classId ?? CLASS_ID,
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          subjectName: slot.subjectName,
          teacherName: slot.teacherName,
          room: slot.room,
          // weekStart and timeRange computed in slotMap below
        }));
        setTimetableSlots(mapped);
      })
      .catch(() => setTimetableSlots([]))
      .finally(() => setLoading(false));
  }, []);

  const slotMap = useMemo(() => {
    const map = {};
    timetableSlots.forEach(s => {
      // Templates don't have weekStart — match by dayOfWeek+period only
      const key = `${s.dayOfWeek}_${s.period}`;
      map[key] = {
        ...s,
        weekStart: selectedWeek,
        timeRange: PERIOD_TIMES[s.period] ?? '',
      };
    });
    return map;
  }, [timetableSlots, selectedWeek]);

  const totalSlots = Object.keys(slotMap).length;
  const weekLabel = WEEK_OPTIONS.find(w => w.value === selectedWeek)?.label ?? '';

  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = `Thời Khóa Biểu – Lớp ${CLASS_ID} – ${weekLabel}`;
    window.print();
    document.title = prevTitle;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Thời Khóa Biểu</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">Lớp 10A1 · Phòng học cố định: P.302 (Tòa nhà B)</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] bg-white focus:outline-none focus:border-[#004ac6]">
            {WEEK_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
          <button type="button" onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-body-sm font-medium text-[#0f172a] hover:bg-[#f8fafc] transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">print</span>
            In lịch biểu
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        {[
          { label: 'Tổng tiết tuần', value: totalSlots, icon: 'hourglass_top', sub: 'tiết học' },
          { label: 'Tiết sáng', value: Object.values(slotMap).filter(s => s.period <= 5).length, icon: 'wb_sunny', sub: 'tiết (1–5)' },
          { label: 'Tiết chiều', value: Object.values(slotMap).filter(s => s.period > 5).length, icon: 'wb_twilight', sub: 'tiết (6–10)' },
          { label: 'Phòng học', value: 'P.302', icon: 'meeting_room', sub: 'Tòa nhà B' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#64748b]">{k.label}</span>
              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">{k.icon}</span>
            </div>
            <div className="text-data-metric font-bold text-[#0f172a]" style={{ fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            <div className="text-label-sm text-[#94a3b8] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Timetable grid */}
      <div ref={printRef} className="print-area bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        {/* Print-only header */}
        <div className="hidden print:block px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-lg font-bold text-[#0f172a]">THỜI KHÓA BIỂU – LỚP {CLASS_ID}</h2>
          <p className="text-sm text-[#475569] mt-0.5">{weekLabel} · Phòng học cố định: P.302 (Tòa nhà B)</p>
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-[#f1f5f9] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-auto print:overflow-visible" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <table className="w-full border-collapse text-body-sm" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="bg-[#f8fafc] border-b-2 border-[#e2e8f0]">
                  <th className="sticky left-0 z-20 bg-[#f8fafc] px-3 py-3 text-left text-label-sm font-semibold text-[#475569] uppercase tracking-wider border-r border-[#e2e8f0]" style={{ minWidth: '80px' }}>Tiết</th>
                  {DAYS.map(day => (
                    <th key={day.dayOfWeek} className="px-3 py-3 text-center border-r border-[#e2e8f0] last:border-r-0" style={{ minWidth: '140px' }}>
                      <div className="text-label-sm font-semibold text-[#0f172a]">{day.label}</div>
                      <div className="text-[11px] text-[#94a3b8] mt-0.5">{getDateLabel(selectedWeek, day.dayOfWeek)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pi) => (
                  <tr key={period} className={`border-b border-[#f1f5f9] ${pi % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}`}>
                    <td className={`sticky left-0 z-10 border-r border-[#e2e8f0] px-3 py-2 ${pi % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center">
                          <span className="text-label-sm font-semibold text-[#2563eb]">{period}</span>
                        </span>
                        <span className="text-[10px] text-[#94a3b8] text-center leading-tight">{PERIOD_TIMES[period].split(' – ')[0]}</span>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const slot = slotMap[`${day.dayOfWeek}_${period}`];
                      return (
                        <td key={day.dayOfWeek} className="px-2 py-2 border-r border-[#f1f5f9] last:border-r-0 align-top">
                          {slot ? (
                            <div className="bg-[#eff4ff] border border-[#bfdbfe] rounded p-2 flex flex-col gap-1 min-h-[80px]">
                              <p className="text-label-sm font-semibold text-[#1e40af] leading-tight">{slot.subjectName}</p>
                              <p className="text-[11px] text-[#475569] leading-tight">{slot.teacherName}</p>
                              <div className="flex items-center gap-1 mt-auto flex-wrap">
                                <span className="text-[10px] font-medium bg-white text-[#334155] border border-[#e2e8f0] px-1.5 py-0.5 rounded">{slot.room}</span>
                                <span className="text-[10px] text-[#64748b]">{slot.timeRange}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full bg-[#f8fafc] rounded flex items-center justify-center min-h-[80px]">
                              <span className="text-[#cbd5e1] text-[11px]">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Print-only footer */}
        <div className="hidden print:flex items-center justify-between px-6 py-3 border-t border-[#e2e8f0] text-[11px] text-[#64748b]">
          <span>HTQLLH · Cổng Học Vụ GD&amp;ĐT</span>
          <span>In ngày: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}
