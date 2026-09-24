/**
 * GVDashboardPage — Dashboard tổng quan cho Giáo viên (GV / GVCN)
 *
 * Hiển thị:
 *   - 4 KPI cards: lớp đang dạy, tổng học sinh, buổi học tuần này, tỉ lệ chuyên cần TB
 *   - Bảng điểm gần đây (top 8 entries từ mockData)
 *   - Danh sách lịch dạy sắp tới trong tuần hiện tại
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useMemo } from 'react';
import KpiCard from '../../components/shared/KpiCard.jsx';
import DataTable from '../../components/shared/DataTable.jsx';
import { grades, timetableSlots, students, subjects } from '../../data/mockData.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map subjectId → subject name */
const SUBJECT_MAP = Object.fromEntries(
  subjects.map(s => [s.id, s.name])
);

/** Map studentId → student name */
const STUDENT_MAP = Object.fromEntries(
  students.map(s => [s.id, s.name])
);

/**
 * Returns Tailwind bg + text classes for grade color-coding.
 * < 5  → red   ≥ 8 → green   otherwise → neutral
 */
function gradeClasses(value) {
  if (value === undefined || value === null) return '';
  if (value < 5) return 'bg-[#fef2f2] text-[#dc2626] font-bold';
  if (value >= 8) return 'bg-[#f0fdf4] text-[#16a34a]';
  return '';
}

// Day-of-week display labels (dayOfWeek 1 = Thứ Hai)
const DAY_LABELS = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
};

// ─── Sub-component: upcoming schedule card ───────────────────────────────────

function ScheduleSlotCard({ slot }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f1f5f9] last:border-0">
      {/* Period circle */}
      <div className="flex-none w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center">
        <span className="text-label-sm font-semibold text-[#2563eb]">{slot.period}</span>
      </div>

      {/* Slot details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm font-semibold text-[#0f172a] truncate">{slot.subjectName}</span>
          <span className="flex-none text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded">
            {slot.room}
          </span>
        </div>
        <p className="text-label-sm text-[#64748b] mt-0.5 truncate">{slot.teacherName}</p>
        <p className="text-label-sm text-[#94a3b8] mt-0.5">{slot.timeRange}</p>
      </div>
    </div>
  );
}

function ScheduleDayGroup({ dayLabel, slots }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-1 pb-1 border-b border-[#e2e8f0]">
        <span className="material-symbols-outlined text-[16px] text-[#2563eb]" aria-hidden="true">
          event
        </span>
        <span className="text-label-sm font-semibold text-[#2563eb] uppercase tracking-wider">
          {dayLabel}
        </span>
        <span className="ml-auto text-label-sm text-[#94a3b8]">
          {slots.length} tiết
        </span>
      </div>
      {slots.map((slot, idx) => (
        <ScheduleSlotCard key={`${slot.dayOfWeek}-${slot.period}-${idx}`} slot={slot} />
      ))}
    </div>
  );
}

// ─── Column definitions for Recent Grades DataTable ──────────────────────────

const gradeColumns = [
  {
    key: 'stt',
    header: 'STT',
    className: 'w-12 text-center',
    cellClassName: 'text-center text-[#94a3b8]',
    render: (_v, _row, rowIdx) => rowIdx + 1,
  },
  {
    key: 'studentName',
    header: 'Học sinh',
    render: (v) => (
      <div className="flex items-center gap-2">
        {/* Avatar placeholder */}
        <div
          className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center flex-none"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[16px] text-[#2563eb]">person</span>
        </div>
        <span className="font-medium text-[#0f172a]">{v}</span>
      </div>
    ),
  },
  {
    key: 'subjectName',
    header: 'Môn học',
    render: (v) => (
      <span className="inline-flex items-center gap-1 text-[#334155]">
        <span className="material-symbols-outlined text-[14px] text-[#64748b]" aria-hidden="true">
          menu_book
        </span>
        {v}
      </span>
    ),
  },
  {
    key: 'average',
    header: 'Điểm TB',
    className: 'text-center',
    cellClassName: 'text-center',
    render: (v) => (
      <span
        className={`inline-block px-2 py-0.5 rounded text-label-sm font-medium ${gradeClasses(v)}`}
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem' }}
      >
        {v !== undefined && v !== null ? v.toFixed(1) : '—'}
      </span>
    ),
  },
  {
    key: 'semester',
    header: 'Kết quả',
    render: (v) => {
      if (v === undefined || v === null) return <span className="text-[#94a3b8]">—</span>;
      let label, cls;
      if (v >= 8.0) { label = 'Giỏi';   cls = 'bg-[#f0fdf4] text-[#15803d]'; }
      else if (v >= 6.5) { label = 'Khá';    cls = 'bg-[#eff6ff] text-[#1d4ed8]'; }
      else if (v >= 5.0) { label = 'T.Bình'; cls = 'bg-[#fff7ed] text-[#c2410c]'; }
      else               { label = 'Yếu';   cls = 'bg-[#fef2f2] text-[#b91c1c]'; }
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${cls}`}>
          {label}
        </span>
      );
    },
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GVDashboardPage() {
  // ── Derived data ─────────────────────────────────────────────────────────

  /**
   * Top 8 recent grade entries, flattened and enriched with display names.
   * mockData grades are already ordered; we just take the first 8.
   */
  const recentGrades = useMemo(() => {
    return grades.slice(0, 8).map(g => ({
      studentName: STUDENT_MAP[g.studentId] ?? g.studentId,
      subjectName: SUBJECT_MAP[g.subjectId] ?? g.subjectId,
      average:     g.scores.average,
      semester:    g.scores.semester,
    }));
  }, []);

  /**
   * Upcoming schedule: timetableSlots for weekStart '2024-11-11', grouped by dayOfWeek.
   * We show all 5 days to represent "this week".
   */
  const scheduleByDay = useMemo(() => {
    const WEEK = '2024-11-11';
    const CLASS_ID = '10A1'; // Representative class for GV view

    const slots = timetableSlots
      .filter(s => s.weekStart === WEEK && s.classId === CLASS_ID)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.period - b.period);

    // Group by dayOfWeek
    const groups = {};
    for (const slot of slots) {
      if (!groups[slot.dayOfWeek]) groups[slot.dayOfWeek] = [];
      groups[slot.dayOfWeek].push(slot);
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Page title ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Tổng quan</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Chào buổi sáng! Đây là tóm tắt hoạt động dạy học của bạn.
          </p>
        </div>
        <span className="hidden md:flex items-center gap-1.5 text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
          Tuần 13–17/11/2024
        </span>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <section aria-label="Thống kê tổng quan">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Lớp đang dạy"
            value="3"
            icon="class"
            trend="+1"
            trendPositive={true}
          />
          <KpiCard
            label="Tổng học sinh"
            value="45"
            icon="groups"
          />
          <KpiCard
            label="Buổi học tuần này"
            value="15"
            icon="calendar_month"
          />
          <KpiCard
            label="Tỉ lệ chuyên cần TB"
            value="82%"
            icon="how_to_reg"
            trend="-2%"
            trendPositive={false}
          />
        </div>
      </section>

      {/* ── Main content: 2-column layout ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Recent grades table (takes 2/3 width on xl) */}
        <section
          className="xl:col-span-2 bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden"
          aria-label="Điểm số gần đây"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">
                grade
              </span>
              <h2 className="text-headline-sm font-semibold text-[#0f172a]">Điểm số gần đây</h2>
            </div>
            <span className="text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded">
              HK1 · 2024–2025
            </span>
          </div>

          {/* DataTable */}
          <div className="p-0">
            <DataTable
              columns={gradeColumns}
              data={recentGrades}
              emptyMessage="Chưa có dữ liệu điểm số"
            />
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-[#f1f5f9] flex items-center justify-between">
            <span className="text-label-sm text-[#94a3b8]">
              Hiển thị 8 mục gần nhất
            </span>
            <a
              href="/gradebook"
              className="inline-flex items-center gap-1 text-label-sm font-medium text-[#2563eb] hover:text-[#004ac6] transition-colors"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                arrow_forward
              </span>
            </a>
          </div>
        </section>

        {/* Right: Upcoming schedule (takes 1/3 width on xl) */}
        <section
          className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden"
          aria-label="Lịch dạy tuần này"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">
                calendar_month
              </span>
              <h2 className="text-headline-sm font-semibold text-[#0f172a]">Lịch dạy tuần này</h2>
            </div>
          </div>

          {/* Schedule list */}
          <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: '480px' }}>
            {Object.keys(scheduleByDay).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[40px] mb-2" aria-hidden="true">
                  event_busy
                </span>
                <p className="text-body-sm">Không có lịch dạy trong tuần này</p>
              </div>
            ) : (
              Object.entries(scheduleByDay).map(([dayOfWeek, slots]) => (
                <ScheduleDayGroup
                  key={dayOfWeek}
                  dayLabel={DAY_LABELS[Number(dayOfWeek)] ?? `Ngày ${dayOfWeek}`}
                  slots={slots}
                />
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-[#f1f5f9]">
            <a
              href="/schedule"
              className="inline-flex items-center gap-1 text-label-sm font-medium text-[#2563eb] hover:text-[#004ac6] transition-colors"
            >
              Xem thời khóa biểu đầy đủ
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                arrow_forward
              </span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
