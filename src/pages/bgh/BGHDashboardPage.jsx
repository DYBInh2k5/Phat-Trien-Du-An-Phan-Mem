/**
 * BGHDashboardPage — Dashboard tổng quan cho Ban Giám Hiệu
 *
 * Hiển thị:
 *   - 4 KPI cards: tổng HS, tổng GV, tỉ lệ chuyên cần, tỉ lệ đạt học lực
 *   - Biểu đồ xu hướng chuyên cần 5 tuần gần nhất (bar chart bằng div)
 *   - Alerts panel: lớp < 80% chuyên cần + HS có GPA < 5.0
 *   - Recent activity log
 *
 * Requirements: 5.5, 6.1, 6.2
 */

import { useMemo } from 'react';
import KpiCard from '../../components/shared/KpiCard.jsx';
import { bghAttendanceSummary, grades, students } from '../../data/mockData.js';

// ─── Static data ─────────────────────────────────────────────────────────────

const ATTENDANCE_TREND = [
  { week: 'T.10/10', rate: 88 },
  { week: 'T.17/10', rate: 85 },
  { week: 'T.24/10', rate: 82 },
  { week: 'T.31/10', rate: 79 },
  { week: 'T.07/11', rate: 74 },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: 'grade',
    iconColor: 'text-[#2563eb]',
    iconBg: 'bg-[#eff4ff]',
    text: 'GV Nguyễn Văn An đã nộp điểm môn Toán lớp 10A1',
    time: '14 phút trước',
  },
  {
    id: 2,
    icon: 'edit_calendar',
    iconColor: 'text-[#7c3aed]',
    iconBg: 'bg-[#f5f3ff]',
    text: 'Thời khóa biểu lớp 10A2 tuần 18/11 đã được cập nhật',
    time: '1 giờ trước',
  },
  {
    id: 3,
    icon: 'notifications',
    iconColor: 'text-[#c2410c]',
    iconBg: 'bg-[#fff7ed]',
    text: 'Thông báo họp phụ huynh đã được gửi đến 5 lớp',
    time: '3 giờ trước',
  },
  {
    id: 4,
    icon: 'how_to_reg',
    iconColor: 'text-[#15803d]',
    iconBg: 'bg-[#f0fdf4]',
    text: 'Điểm danh lớp 11B1 ngày 14/11 đã được lưu bởi GV Hoàng Văn Em',
    time: 'Hôm qua',
  },
  {
    id: 5,
    icon: 'person_add',
    iconColor: 'text-[#0369a1]',
    iconBg: 'bg-[#f0f9ff]',
    text: 'Tài khoản mới cho GV Nguyễn Thị Hằng đã được tạo',
    time: 'Hôm qua',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Bar chart row for attendance trend */
function TrendBar({ week, rate }) {
  const isWarning = rate < 80;
  return (
    <div className="flex items-center gap-3">
      <span className="text-label-sm text-[#64748b] w-20 flex-none">{week}</span>
      <div className="flex-1 h-6 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isWarning ? 'bg-[#f97316]' : 'bg-[#3b82f6]'
          }`}
          style={{ width: `${rate}%` }}
          role="presentation"
        />
      </div>
      <span
        className={`text-label-sm font-semibold w-10 text-right tabular-nums ${
          isWarning ? 'text-[#c2410c]' : 'text-[#1e40af]'
        }`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {rate}%
      </span>
    </div>
  );
}

/** Single alert item */
function AlertItem({ icon, iconColor, iconBg, title, description, severity }) {
  const borderColor =
    severity === 'high' ? 'border-l-[#ef4444]' : 'border-l-[#f97316]';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border border-[#e2e8f0] border-l-4 ${borderColor} bg-white`}>
      <div className={`flex-none w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[18px] ${iconColor}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-body-sm font-semibold text-[#0f172a]">{title}</p>
        <p className="text-label-sm text-[#64748b] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHDashboardPage() {
  // Lớp có tỉ lệ chuyên cần < 80%
  const lowAttendanceClasses = useMemo(
    () => bghAttendanceSummary.filter((r) => r.tileChuyenCan < 80),
    [],
  );

  // HS có ít nhất một môn có điểm trung bình < 5.0
  const lowGpaStudents = useMemo(() => {
    const lowIds = new Set(
      grades
        .filter((g) => g.scores.average < 5.0)
        .map((g) => g.studentId),
    );
    return students.filter((s) => lowIds.has(s.id));
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Tổng quan Ban Giám Hiệu</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Năm học 2024–2025 · Học kỳ 1
          </p>
        </div>
        <span className="hidden md:flex items-center gap-1.5 text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
          Cập nhật: 15/11/2024
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <section aria-label="Chỉ số tổng quan">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Tổng học sinh"
            value="15"
            icon="groups"
            trend="+2"
            trendPositive={true}
          />
          <KpiCard
            label="Tổng giáo viên"
            value="8"
            icon="school"
          />
          <KpiCard
            label="Tỉ lệ chuyên cần"
            value="74%"
            icon="how_to_reg"
            trend="-8%"
            trendPositive={false}
          />
          <KpiCard
            label="Tỉ lệ đạt học lực"
            value="78%"
            icon="workspace_premium"
            trend="+3%"
            trendPositive={true}
          />
        </div>
      </section>

      {/* ── Middle row: trend chart + alerts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Attendance trend chart */}
        <section
          className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden"
          aria-label="Xu hướng chuyên cần"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f1f5f9]">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">
              trending_up
            </span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Xu hướng chuyên cần</h2>
            <span className="ml-auto text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded">
              5 tuần gần nhất
            </span>
          </div>
          <div className="px-5 py-5 space-y-3">
            {ATTENDANCE_TREND.map((item) => (
              <TrendBar key={item.week} week={item.week} rate={item.rate} />
            ))}
          </div>
          <div className="px-5 pb-4 flex items-center gap-4 text-label-sm text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-[#3b82f6]" />
              ≥ 80% (bình thường)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-[#f97316]" />
              &lt; 80% (cần chú ý)
            </span>
          </div>
        </section>

        {/* Alerts panel */}
        <section
          className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden"
          aria-label="Cảnh báo cần xử lý"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f1f5f9]">
            <span className="material-symbols-outlined text-[20px] text-[#ef4444]" aria-hidden="true">
              warning
            </span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Cảnh báo cần xử lý</h2>
            <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fef2f2] text-[#b91c1c] text-label-sm font-bold">
              {lowAttendanceClasses.length + lowGpaStudents.length}
            </span>
          </div>
          <div className="px-5 py-4 space-y-2.5 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {lowAttendanceClasses.length === 0 && lowGpaStudents.length === 0 && (
              <div className="flex flex-col items-center py-8 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[36px] mb-2" aria-hidden="true">
                  check_circle
                </span>
                <p className="text-body-sm">Không có cảnh báo nào</p>
              </div>
            )}

            {/* Lớp chuyên cần thấp */}
            {lowAttendanceClasses.map((cls) => (
              <AlertItem
                key={cls.classId}
                icon="group_off"
                iconColor="text-[#c2410c]"
                iconBg="bg-[#fff7ed]"
                title={`Lớp ${cls.className} — Chuyên cần ${cls.tileChuyenCan}%`}
                description={`GVCN: ${cls.gvcnName} · ${cls.soHSduoiNguong} HS dưới ngưỡng`}
                severity="high"
              />
            ))}

            {/* HS có điểm TB < 5 */}
            {lowGpaStudents.map((stu) => (
              <AlertItem
                key={stu.id}
                icon="school"
                iconColor="text-[#b91c1c]"
                iconBg="bg-[#fef2f2]"
                title={`${stu.name} — Học lực yếu`}
                description={`Mã HS: ${stu.id} · Có môn điểm TB < 5.0`}
                severity="high"
              />
            ))}
          </div>
        </section>
      </div>

      {/* ── Recent activity log ── */}
      <section
        className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden"
        aria-label="Hoạt động gần đây"
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f1f5f9]">
          <span className="material-symbols-outlined text-[20px] text-[#64748b]" aria-hidden="true">
            history
          </span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Hoạt động gần đây</h2>
        </div>
        <ul role="list" className="divide-y divide-[#f1f5f9]">
          {RECENT_ACTIVITIES.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#f8fafc] transition-colors">
              <div
                className={`flex-none w-8 h-8 rounded-full ${activity.iconBg} flex items-center justify-center mt-0.5`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${activity.iconColor}`}
                  aria-hidden="true"
                >
                  {activity.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm text-[#0f172a]">{activity.text}</p>
                <p className="text-label-sm text-[#94a3b8] mt-0.5">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
