/**
 * TimetablePage — Thời khóa biểu lớp học
 *
 * Hiển thị lưới 5 cột (Thứ 2–6) × 10 hàng (tiết 1–10).
 * Mỗi ô khớp slot → subjectName, teacherName, room, timeRange.
 * Header row và cột "Tiết" được sticky.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { useState, useMemo } from 'react';
import { timetableSlots, classes } from '../../data/mockData.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { dayOfWeek: 1, label: 'Thứ Hai' },
  { dayOfWeek: 2, label: 'Thứ Ba' },
  { dayOfWeek: 3, label: 'Thứ Tư' },
  { dayOfWeek: 4, label: 'Thứ Năm' },
  { dayOfWeek: 5, label: 'Thứ Sáu' },
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PERIOD_TIMES = {
  1:  '07:00 – 07:45',
  2:  '07:50 – 08:35',
  3:  '08:40 – 09:25',
  4:  '09:35 – 10:20',
  5:  '10:25 – 11:10',
  6:  '13:00 – 13:45',
  7:  '13:50 – 14:35',
  8:  '14:40 – 15:25',
  9:  '15:30 – 16:15',
  10: '16:20 – 17:05',
};

/** Ngày thứ trong tuần bắt đầu từ weekStart (Mon = dayOfWeek 1) */
function getDateLabel(weekStart, dayOfWeek) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + (dayOfWeek - 1));
  return `${String(base.getDate()).padStart(2, '0')}/${String(base.getMonth() + 1).padStart(2, '0')}`;
}

const WEEK_OPTIONS = [
  { value: '2024-11-11', label: 'Tuần 11–15/11/2024' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SlotCell({ slot }) {
  if (!slot) {
    return (
      <div className="h-full bg-[#f8fafc] rounded flex items-center justify-center min-h-[80px]">
        <span className="text-[#cbd5e1] text-[11px]">—</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#eff4ff] border border-[#bfdbfe] rounded p-2 flex flex-col gap-1 min-h-[80px]">
      {/* Subject */}
      <p className="text-label-sm font-semibold text-[#1e40af] leading-tight line-clamp-2">
        {slot.subjectName}
      </p>
      {/* Teacher */}
      <p className="text-[11px] text-[#475569] leading-tight line-clamp-1">
        {slot.teacherName}
      </p>
      {/* Room badge */}
      <div className="flex items-center gap-1 mt-auto flex-wrap">
        <span className="inline-block text-[10px] font-medium bg-white text-[#334155] border border-[#e2e8f0] px-1.5 py-0.5 rounded leading-none">
          {slot.room}
        </span>
        <span className="text-[10px] text-[#64748b] leading-none">
          {slot.timeRange}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id ?? '');
  const [selectedWeek, setSelectedWeek]   = useState('2024-11-11');

  // ── Build slot lookup: { dayOfWeek_period → slot } ───────────────────────
  const slotMap = useMemo(() => {
    const map = {};
    timetableSlots
      .filter(s => s.classId === selectedClass && s.weekStart === selectedWeek)
      .forEach(s => {
        map[`${s.dayOfWeek}_${s.period}`] = s;
      });
    return map;
  }, [selectedClass, selectedWeek]);

  const selectedClassInfo = classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Thời khóa biểu</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Lịch học theo lớp và tuần học
          </p>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">

          {/* Class selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="class-select" className="text-label-sm font-medium text-[#475569] whitespace-nowrap">
              Lớp học:
            </label>
            <div className="relative">
              <select
                id="class-select"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-body-sm text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#94a3b8]"
                aria-hidden="true"
              >
                expand_more
              </span>
            </div>
          </div>

          {/* Week selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="week-select" className="text-label-sm font-medium text-[#475569] whitespace-nowrap">
              Tuần học:
            </label>
            <div className="relative">
              <select
                id="week-select"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-body-sm text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition cursor-pointer"
              >
                {WEEK_OPTIONS.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#94a3b8]"
                aria-hidden="true"
              >
                expand_more
              </span>
            </div>
          </div>

          {/* Meta badge */}
          {selectedClassInfo && (
            <div className="ml-auto flex items-center gap-1.5 text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">class</span>
              Lớp {selectedClassInfo.name}
              {selectedClassInfo.gvcnId && (
                <span className="text-[#94a3b8]">· GVCN</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Timetable grid ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full border-collapse text-body-sm" style={{ minWidth: '700px' }}>

            {/* ── Header row ─────────────────────────────────────────── */}
            <thead>
              <tr className="bg-[#f8fafc] border-b-2 border-[#e2e8f0]">
                {/* "Tiết" sticky col header */}
                <th
                  className="sticky left-0 z-20 bg-[#f8fafc] px-3 py-3 text-left text-label-sm font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap border-r border-[#e2e8f0]"
                  style={{ minWidth: '80px' }}
                >
                  Tiết
                </th>
                {DAYS.map(day => (
                  <th
                    key={day.dayOfWeek}
                    className="px-3 py-3 text-center border-r border-[#e2e8f0] last:border-r-0"
                    style={{ minWidth: '140px' }}
                  >
                    <div className="text-label-sm font-semibold text-[#0f172a]">{day.label}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5 font-normal">
                      {getDateLabel(selectedWeek, day.dayOfWeek)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body rows ──────────────────────────────────────────── */}
            <tbody>
              {PERIODS.map((period, periodIdx) => (
                <tr
                  key={period}
                  className={`border-b border-[#f1f5f9] ${periodIdx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}`}
                >
                  {/* Period cell — sticky */}
                  <td
                    className={`sticky left-0 z-10 border-r border-[#e2e8f0] px-3 py-2 ${periodIdx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center">
                        <span className="text-label-sm font-semibold text-[#2563eb]">{period}</span>
                      </span>
                      <span className="text-[10px] text-[#94a3b8] whitespace-nowrap text-center leading-tight">
                        {PERIOD_TIMES[period].split(' – ')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map(day => {
                    const slot = slotMap[`${day.dayOfWeek}_${period}`] ?? null;
                    return (
                      <td
                        key={day.dayOfWeek}
                        className="px-2 py-2 border-r border-[#f1f5f9] last:border-r-0 align-top"
                      >
                        <SlotCell slot={slot} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-label-sm text-[#64748b]">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#eff4ff] border border-[#bfdbfe]" />
          <span>Có tiết học</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#f8fafc] border border-[#e2e8f0]" />
          <span>Không có tiết</span>
        </div>
      </div>

    </div>
  );
}
