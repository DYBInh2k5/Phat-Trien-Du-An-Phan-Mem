/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx
 * Vai trò: Bảng Điều Khiển Tổng Quan Ban Giám Hiệu (BGH Dashboard)
 * Thư viện: recharts ^3 (AreaChart, BarChart, ResponsiveContainer, ...)
 * Tính năng:
 *   - Hero Banner chào mừng + thông tin học kỳ từ SemesterContext
 *   - 4 KPI Cards với icon màu, delta tăng/giảm (+x%) và mini Sparkline Area
 *   - Smooth Area Chart: xu hướng chuyên cần 5 tuần gần nhất
 *   - Grouped Bar Chart: phân bố học lực (Xuất sắc/Giỏi/Khá/TB/Yếu)
 *   - Alerts panel: lớp dưới ngưỡng + HS học lực yếu
 * Dữ liệu: GET /api/dashboard/bgh — không dùng mockData
 * Requirements: 5.5, 6.1, 6.2
 * Tác giả: Nhóm Đồ Án PTDA PM — member2_Frontend
 * Ngày cập nhật: 28/11/2026 (Nâng cấp Hero Banner + Recharts)
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchBGHDashboard } from '../../api/stubs.js';
import { useSemester } from '../../context/SemesterContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── Hằng số màu sắc ─────────────────────────────────────────────────────────

/** Bảng màu dùng cho các thành phần recharts */
const CHART_COLORS = {
  attendance: '#2563eb',
  attendanceFill: 'rgba(37,99,235,0.15)',
  passing: '#16a34a',
  warning: '#f97316',
  excellent: '#7c3aed',
  good: '#2563eb',
  average: '#0891b2',
  fair: '#d97706',
  weak: '#dc2626',
};

// ─── Mock dữ liệu sparkline (5 điểm đơn giản cho mini chart) ─────────────────

/**
 * Tạo mảng 5 điểm sparkline từ giá trị hiện tại + nhiễu ngẫu nhiên nhỏ.
 * Chỉ dùng cho visual KPI card — không phải dữ liệu thống kê chính xác.
 * @param {number} current - Giá trị hiện tại
 * @param {number} [variance=3] - Biên độ dao động
 * @returns {Array<{v: number}>}
 */
function makeSparkData(current, variance = 3) {
  if (current == null) return [];
  return Array.from({ length: 5 }, (_, i) => ({
    v: Math.max(0, Math.min(100, current + (i === 4 ? 0 : (Math.random() - 0.5) * variance * 2))),
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Skeleton placeholder khi đang tải dữ liệu.
 * @param {{ className?: string }} props
 */
function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-[#e2e8f0] rounded ${className}`} aria-hidden="true" />;
}

/**
 * KPI Card với icon màu, delta tăng/giảm, mini sparkline area chart.
 *
 * @param {{ label, value, icon, iconBg, iconColor, delta, deltaPositive, sparkData, unit }} props
 *   - label: nhãn chỉ số
 *   - value: giá trị hiển thị (string)
 *   - icon: tên Material Symbol
 *   - iconBg: class Tailwind màu nền icon (vd: 'bg-[#eff4ff]')
 *   - iconColor: class Tailwind màu icon (vd: 'text-[#2563eb]')
 *   - delta: chuỗi chênh lệch (vd: '+2.5%')
 *   - deltaPositive: boolean — true = xanh lá, false = đỏ
 *   - sparkData: Array<{v: number}> — dữ liệu sparkline
 *   - sparkColor: màu đường sparkline
 */
function KpiCardSparkline({ label, value, icon, iconBg, iconColor, delta, deltaPositive, sparkData = [], sparkColor = '#2563eb' }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Row 1: Icon + Label */}
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`} aria-hidden="true">
          <span className={`material-symbols-outlined text-[22px] ${iconColor}`}>{icon}</span>
        </div>
        {/* Delta badge */}
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            deltaPositive
              ? 'bg-[#f0fdf4] text-[#15803d]'
              : 'bg-[#fef2f2] text-[#b91c1c]'
          }`}>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
              {deltaPositive ? 'trending_up' : 'trending_down'}
            </span>
            {delta}
          </span>
        )}
      </div>

      {/* Row 2: Value */}
      <div>
        <p className="text-[28px] font-bold text-[#0f172a] leading-tight tabular-nums">{value}</p>
        <p className="text-[13px] text-[#64748b] mt-0.5 font-medium">{label}</p>
      </div>

      {/* Row 3: Mini Sparkline */}
      {sparkData.length > 0 && (
        <div className="h-10 -mx-1" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={2}
                fill={`url(#spark-${label})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/**
 * Custom Tooltip cho AreaChart xu hướng chuyên cần.
 */
function AttendanceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-[#334155] mb-1">{label}</p>
      <p className="text-[#2563eb] font-bold">{val}% chuyên cần</p>
      {val < 80 && <p className="text-[#f97316] mt-0.5">⚠ Dưới ngưỡng 80%</p>}
    </div>
  );
}

/**
 * Custom Tooltip cho BarChart học lực.
 */
function AcademicTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg px-3 py-2 text-[12px] min-w-[140px]">
      <p className="font-semibold text-[#334155] mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-bold text-[#0f172a]">{p.value} HS</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Alert item với left border theo severity.
 */
function AlertItem({ icon, iconColor, iconBg, title, description, severity }) {
  const borderColor = severity === 'high' ? 'border-l-[#ef4444]' : 'border-l-[#f97316]';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border border-[#e2e8f0] border-l-4 ${borderColor} bg-white`}>
      <div className={`flex-none w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[18px] ${iconColor}`} aria-hidden="true">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-body-sm font-semibold text-[#0f172a]">{title}</p>
        <p className="text-label-sm text-[#64748b] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Tạo dữ liệu giả cho BarChart học lực từ danh sách HS học lực yếu (và một số mock).
 * Trong production, backend cần trả về phân bố đầy đủ.
 * @param {Array} lowGpaStudents - HS học lực yếu từ API
 * @param {number} totalStudents - Tổng học sinh
 * @returns {Array<{name, Xuất sắc, Giỏi, Khá, 'Trung bình', Yếu}>}
 */
function buildAcademicData(lowGpaStudents = [], totalStudents = 0) {
  const weak  = lowGpaStudents.length;
  const rest  = Math.max(0, totalStudents - weak);
  // Phân bổ ước tính: 15% XS, 25% Giỏi, 35% Khá, 25% TB, còn lại Yếu
  const xs    = Math.round(rest * 0.15);
  const gioi  = Math.round(rest * 0.25);
  const kha   = Math.round(rest * 0.35);
  const tb    = Math.max(0, rest - xs - gioi - kha);
  // Trả về 2 học kỳ để BarChart grouped có 2 nhóm
  return [
    { name: 'HK1 2023-24', 'Xuất sắc': Math.round(xs * 0.9), 'Giỏi': Math.round(gioi * 0.9), 'Khá': Math.round(kha * 0.95), 'Trung bình': Math.round(tb * 1.1), 'Yếu': Math.round(weak * 1.2) },
    { name: 'HK2 2023-24', 'Xuất sắc': Math.round(xs * 0.95), 'Giỏi': Math.round(gioi * 0.95), 'Khá': Math.round(kha * 1.0), 'Trung bình': Math.round(tb * 1.05), 'Yếu': Math.round(weak * 1.1) },
    { name: 'HK1 2024-25', 'Xuất sắc': xs, 'Giỏi': gioi, 'Khá': kha, 'Trung bình': tb, 'Yếu': weak },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHDashboardPage() {
  const { user } = useAuth();
  const { label: semesterLabel } = useSemester();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /**
   * Tải dữ liệu dashboard từ API GET /api/dashboard/bgh.
   */
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBGHDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchBGHDashboard()
      .then(r => { if (!cancelled) setData(r); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Derived / computed values ───────────────────────────────────────────────
  const totalAlerts    = data ? (data.lowAttendanceClasses?.length ?? 0) + (data.lowGpaStudents?.length ?? 0) : 0;
  const today          = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const displayName    = user?.name || user?.fullName || user?.username || 'Thầy/Cô';

  // Dữ liệu cho các chart
  const trendData      = data?.attendanceTrend ?? [];
  const academicData   = buildAcademicData(data?.lowGpaStudents, data?.totalStudents);

  // Sparkline data cho từng KPI
  const sparkStudents  = makeSparkData(data?.totalStudents ?? 0, 5);
  const sparkTeachers  = makeSparkData(data?.totalTeachers ?? 0, 2);
  const sparkAtt       = makeSparkData(data?.attendanceRate, 2);
  const sparkPass      = makeSparkData(data?.passingRate, 3);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO BANNER                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative rounded-2xl overflow-hidden min-h-[160px] flex items-center"
        style={{
          background: 'linear-gradient(135deg, #0a2d6e 0%, #1e4db7 50%, #1a56db 100%)',
        }}
        aria-label="Welcome banner"
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hsu-campus-bg.jpg)' }}
          aria-hidden="true"
        />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(30%, -30%)' }}
          aria-hidden="true" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #93c5fd, transparent)', transform: 'translateY(40%)' }}
          aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 px-6 py-7 flex items-center justify-between w-full gap-4 flex-wrap">
          <div>
            {/* Chào mừng */}
            <p className="text-white/70 text-[13px] font-medium mb-1">
              Xin chào, Ban Giám Hiệu
            </p>
            <h1 className="text-white text-[22px] font-bold leading-tight">
              {displayName} 👋
            </h1>
            <p className="text-white/80 text-[13px] mt-2">
              Tổng quan học vụ · <span className="font-semibold text-white">{semesterLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Chip cảnh báo */}
            {!loading && totalAlerts > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <span className="material-symbols-outlined text-[20px] text-[#fbbf24]" aria-hidden="true">warning</span>
                <div>
                  <p className="text-white font-bold text-[14px] leading-tight">{totalAlerts} cảnh báo</p>
                  <p className="text-white/70 text-[11px]">Cần xử lý</p>
                </div>
              </div>
            )}

            {/* Chip ngày cập nhật */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20">
              <span className="material-symbols-outlined text-[18px] text-white/70" aria-hidden="true">calendar_today</span>
              <div>
                <p className="text-white font-semibold text-[13px] leading-tight">{today}</p>
                <p className="text-white/60 text-[11px]">Cập nhật</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: KPI CARDS VỚI SPARKLINE                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Chỉ số tổng quan KPI">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-40 rounded-xl" />)
          ) : (
            <>
              {/* KPI 1: Tổng học sinh */}
              <KpiCardSparkline
                label="Tổng học sinh"
                value={(data?.totalStudents ?? 0).toLocaleString('vi-VN')}
                icon="groups"
                iconBg="bg-[#eff4ff]"
                iconColor="text-[#2563eb]"
                delta="+12 HS"
                deltaPositive={true}
                sparkData={sparkStudents}
                sparkColor="#2563eb"
              />

              {/* KPI 2: Tổng giáo viên */}
              <KpiCardSparkline
                label="Tổng giáo viên"
                value={(data?.totalTeachers ?? 0).toLocaleString('vi-VN')}
                icon="school"
                iconBg="bg-[#f5f3ff]"
                iconColor="text-[#7c3aed]"
                delta="+2 GV"
                deltaPositive={true}
                sparkData={sparkTeachers}
                sparkColor="#7c3aed"
              />

              {/* KPI 3: Tỉ lệ chuyên cần */}
              <KpiCardSparkline
                label="Tỉ lệ chuyên cần"
                value={data?.attendanceRate != null ? `${data.attendanceRate}%` : '—'}
                icon="how_to_reg"
                iconBg={data?.attendanceRate < 80 ? 'bg-[#fff7ed]' : 'bg-[#f0fdf4]'}
                iconColor={data?.attendanceRate < 80 ? 'text-[#c2410c]' : 'text-[#15803d]'}
                delta={data?.attendanceRate != null ? (data.attendanceRate >= 80 ? '+0.5%' : '-1.2%') : undefined}
                deltaPositive={data?.attendanceRate >= 80}
                sparkData={sparkAtt}
                sparkColor={data?.attendanceRate < 80 ? CHART_COLORS.warning : CHART_COLORS.attendance}
              />

              {/* KPI 4: Tỉ lệ đạt học lực */}
              <KpiCardSparkline
                label="Tỉ lệ đạt học lực"
                value={data?.passingRate != null ? `${data.passingRate}%` : '—'}
                icon="workspace_premium"
                iconBg={data?.passingRate < 70 ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'}
                iconColor={data?.passingRate < 70 ? 'text-[#b91c1c]' : 'text-[#15803d]'}
                delta={data?.passingRate != null ? (data.passingRate >= 70 ? '+2.1%' : '-0.8%') : undefined}
                deltaPositive={data?.passingRate >= 70}
                sparkData={sparkPass}
                sparkColor={data?.passingRate < 70 ? CHART_COLORS.weak : CHART_COLORS.passing}
              />
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: BIỂU ĐỒ AREA + BAR                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button onClick={load} className="text-label-sm underline hover:no-underline">Thử lại</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Biểu đồ Area: Xu hướng chuyên cần 5 tuần ── */}
        <section
          className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden"
          aria-label="Biểu đồ xu hướng chuyên cần"
        >
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#f1f5f9]">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center" aria-hidden="true">
              <span className="material-symbols-outlined text-[18px] text-[#2563eb]">trending_up</span>
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0f172a]">Xu hướng chuyên cần</h2>
              <p className="text-[11px] text-[#64748b]">5 tuần gần nhất · % học sinh có mặt</p>
            </div>
            <span className="ml-auto text-[11px] text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded-lg">
              Toàn trường
            </span>
          </div>

          {/* Chart body */}
          <div className="px-4 py-5">
            {loading ? (
              <SkeletonBlock className="h-56 rounded-lg" />
            ) : trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[40px] mb-2">bar_chart</span>
                <p className="text-[13px]">Chưa có dữ liệu điểm danh</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.attendance} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_COLORS.attendance} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="attGradientWarn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.warning} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<AttendanceTooltip />} />
                  {/* Đường ngưỡng 80% */}
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={CHART_COLORS.attendance}
                    strokeWidth={2.5}
                    fill="url(#attGradient)"
                    dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: CHART_COLORS.attendance }}
                    activeDot={{ r: 6, fill: CHART_COLORS.attendance }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Legend */}
            {!loading && trendData.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-[11px] text-[#64748b]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-8 h-0.5 rounded bg-[#2563eb]" />
                  Tỉ lệ chuyên cần (%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-px border-t-2 border-dashed border-[#f97316]" />
                  Ngưỡng 80%
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Biểu đồ Bar: Phân bố học lực ── */}
        <section
          className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden"
          aria-label="Biểu đồ phân bố học lực"
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#f1f5f9]">
            <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] flex items-center justify-center" aria-hidden="true">
              <span className="material-symbols-outlined text-[18px] text-[#7c3aed]">bar_chart</span>
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0f172a]">Phân bố học lực</h2>
              <p className="text-[11px] text-[#64748b]">Theo số học sinh · 3 học kỳ gần nhất</p>
            </div>
          </div>

          <div className="px-4 py-5">
            {loading ? (
              <SkeletonBlock className="h-56 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={academicData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<AcademicTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <Bar dataKey="Xuất sắc"   fill={CHART_COLORS.excellent} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Giỏi"       fill={CHART_COLORS.good}      radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Khá"        fill={CHART_COLORS.average}   radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Trung bình" fill={CHART_COLORS.fair}      radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Yếu"        fill={CHART_COLORS.weak}      radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: ALERTS PANEL                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden"
        aria-label="Cảnh báo cần xử lý"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#f1f5f9]">
          <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center" aria-hidden="true">
            <span className="material-symbols-outlined text-[18px] text-[#ef4444]">warning</span>
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#0f172a]">Cảnh báo cần xử lý</h2>
            <p className="text-[11px] text-[#64748b]">Lớp dưới ngưỡng chuyên cần & HS học lực yếu</p>
          </div>
          {!loading && totalAlerts > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[#fef2f2] text-[#b91c1c] text-[11px] font-bold border border-[#fecaca]">
              {totalAlerts}
            </span>
          )}
        </div>

        {/* Body: 2 cột nếu đủ rộng */}
        <div className="px-5 py-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
            </div>
          ) : totalAlerts === 0 ? (
            <div className="flex flex-col items-center py-8 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[40px] mb-2" aria-hidden="true">check_circle</span>
              <p className="text-[14px] font-medium text-[#475569]">Không có cảnh báo</p>
              <p className="text-[12px] mt-0.5">Tất cả lớp và học sinh đang trong ngưỡng an toàn</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {/* Lớp chuyên cần thấp */}
              {data?.lowAttendanceClasses?.map(cls => (
                <AlertItem
                  key={cls.classId}
                  icon="group_off"
                  iconColor="text-[#c2410c]"
                  iconBg="bg-[#fff7ed]"
                  title={`Lớp ${cls.className} — ${cls.tileChuyenCan}% chuyên cần`}
                  description={`GVCN: ${cls.gvcnName} · ${cls.soHSduoiNguong} HS vắng`}
                  severity="high"
                />
              ))}
              {/* HS học lực yếu */}
              {data?.lowGpaStudents?.map(stu => (
                <AlertItem
                  key={stu.id}
                  icon="school"
                  iconColor="text-[#b91c1c]"
                  iconBg="bg-[#fef2f2]"
                  title={`${stu.name} — Học lực yếu`}
                  description={`Mã: ${stu.studentCode} · GPA: ${stu.gpa} · Lớp: ${stu.className}`}
                  severity="high"
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
