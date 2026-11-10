/**
 * BGHDashboardPage — Dashboard tổng quan cho Ban Giám Hiệu
 *
 * Hiển thị:
 *   - 4 KPI cards: tổng HS, tổng GV, tỉ lệ chuyên cần, tỉ lệ đạt học lực
 *   - Biểu đồ xu hướng chuyên cần (bar chart bằng div)
 *   - Alerts panel: lớp < 80% chuyên cần + HS có GPA < 5.0
 *
 * Dữ liệu: gọi API GET /api/dashboard/bgh — không dùng mockData.
 * Requirements: 5.5, 6.1, 6.2
 */

import { useState, useEffect } from 'react';
import KpiCard from '../../components/shared/KpiCard.jsx';
import { fetchBGHDashboard } from '../../api/stubs.js';

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

/** Skeleton placeholder khi đang loading */
function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[#e2e8f0] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBGHDashboard();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalAlerts = data
    ? (data.lowAttendanceClasses?.length ?? 0) + (data.lowGpaStudents?.length ?? 0)
    : 0;

  // Ngày cập nhật hiển thị theo ngày hiện tại
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

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
          Cập nhật: {today}
        </span>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span>
          <p className="text-body-sm font-medium">{error}</p>
          <button
            className="ml-auto text-label-sm underline hover:no-underline"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBGHDashboard()
                .then(setData)
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <section aria-label="Chỉ số tổng quan">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
            </>
          ) : (
            <>
              <KpiCard
                label="Tổng học sinh"
                value={data?.totalStudents?.toString() ?? '—'}
                icon="groups"
              />
              <KpiCard
                label="Tổng giáo viên"
                value={data?.totalTeachers?.toString() ?? '—'}
                icon="school"
              />
              <KpiCard
                label="Tỉ lệ chuyên cần"
                value={data?.attendanceRate != null ? `${data.attendanceRate}%` : '—'}
                icon="how_to_reg"
                trend={data?.attendanceRate != null && data.attendanceRate < 80 ? 'Cần chú ý' : undefined}
                trendPositive={data?.attendanceRate != null && data.attendanceRate >= 80}
              />
              <KpiCard
                label="Tỉ lệ đạt học lực"
                value={data?.passingRate != null ? `${data.passingRate}%` : '—'}
                icon="workspace_premium"
                trend={data?.passingRate != null && data.passingRate < 70 ? 'Cần cải thiện' : undefined}
                trendPositive={data?.passingRate != null && data.passingRate >= 70}
              />
            </>
          )}
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
            {loading ? (
              <>
                <SkeletonBlock className="h-6" />
                <SkeletonBlock className="h-6" />
                <SkeletonBlock className="h-6" />
                <SkeletonBlock className="h-6" />
                <SkeletonBlock className="h-6" />
              </>
            ) : data?.attendanceTrend?.length > 0 ? (
              data.attendanceTrend.map((item) => (
                <TrendBar key={item.week} week={item.week} rate={item.rate} />
              ))
            ) : (
              <div className="flex flex-col items-center py-8 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[36px] mb-2" aria-hidden="true">bar_chart</span>
                <p className="text-body-sm">Chưa có dữ liệu điểm danh</p>
              </div>
            )}
          </div>
          {!loading && data?.attendanceTrend?.length > 0 && (
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
          )}
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
            {!loading && (
              <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fef2f2] text-[#b91c1c] text-label-sm font-bold">
                {totalAlerts}
              </span>
            )}
          </div>
          <div className="px-5 py-4 space-y-2.5 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {loading ? (
              <>
                <SkeletonBlock className="h-16" />
                <SkeletonBlock className="h-16" />
              </>
            ) : (
              <>
                {totalAlerts === 0 && (
                  <div className="flex flex-col items-center py-8 text-[#94a3b8]">
                    <span className="material-symbols-outlined text-[36px] mb-2" aria-hidden="true">
                      check_circle
                    </span>
                    <p className="text-body-sm">Không có cảnh báo nào</p>
                  </div>
                )}

                {/* Lớp chuyên cần thấp */}
                {data?.lowAttendanceClasses?.map((cls) => (
                  <AlertItem
                    key={cls.classId}
                    icon="group_off"
                    iconColor="text-[#c2410c]"
                    iconBg="bg-[#fff7ed]"
                    title={`Lớp ${cls.className} — Chuyên cần ${cls.tileChuyenCan}%`}
                    description={`GVCN: ${cls.gvcnName} · ${cls.soHSduoiNguong} HS vắng`}
                    severity="high"
                  />
                ))}

                {/* HS có GPA < 5.0 */}
                {data?.lowGpaStudents?.map((stu) => (
                  <AlertItem
                    key={stu.id}
                    icon="school"
                    iconColor="text-[#b91c1c]"
                    iconBg="bg-[#fef2f2]"
                    title={`${stu.name} — Học lực yếu`}
                    description={`Mã HS: ${stu.studentCode} · GPA: ${stu.gpa} · Lớp: ${stu.className}`}
                    severity="high"
                  />
                ))}
              </>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
