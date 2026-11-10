/**
 * BGHAttendanceMonitorPage — Giám sát chuyên cần toàn trường
 *
 * Chức năng:
 *   - Filter: from/to date + class dropdown
 *   - DataTable các lớp với tỉ lệ chuyên cần
 *   - Row highlight vàng khi tileChuyenCan < 80%
 *
 * Dữ liệu: GET /api/attendance/summary — không dùng mockData.
 * Requirements: 6.1, 6.2, 6.3
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchAttendanceSummary } from '../../api/stubs.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Ngày hôm nay và 7 ngày trước định dạng YYYY-MM-DD */
function defaultDateRange() {
  const to   = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

/** Skeleton placeholder khi loading */
function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="animate-pulse h-4 bg-[#e2e8f0] rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHAttendanceMonitorPage() {
  const defaults = useMemo(defaultDateRange, []);

  const [dateFrom,      setDateFrom]      = useState(defaults.from);
  const [dateTo,        setDateTo]        = useState(defaults.to);
  const [selectedClass, setSelectedClass] = useState('all');

  // Data from API
  const [summaries,   setSummaries]   = useState([]);
  const [classNames,  setClassNames]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Fetch khi filter thay đổi ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAttendanceSummary({
          dateFrom,
          dateTo,
          className: selectedClass,
        });
        if (!cancelled) {
          setSummaries(result.summaries);
          setClassNames(result.classNames);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải dữ liệu chuyên cần. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, selectedClass]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalBelow = useMemo(
    () => summaries.filter((r) => r.tileChuyenCan < 80).length,
    [summaries],
  );

  function retry() {
    setError(null);
    setLoading(true);
    fetchAttendanceSummary({ dateFrom, dateTo, className: selectedClass })
      .then((r) => { setSummaries(r.summaries); setClassNames(r.classNames); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-headline-md font-semibold text-[#0f172a]">Giám sát chuyên cần toàn trường</h1>
        <p className="text-body-sm text-[#64748b] mt-0.5">
          Theo dõi tỉ lệ chuyên cần theo lớp, phát hiện sớm nguy cơ học sinh bỏ học
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button
            className="text-label-sm underline hover:no-underline"
            onClick={retry}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Date from */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">event</span>
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Class filter */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
              Lớp học
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="all">Tất cả lớp</option>
              {classNames.map((cn) => (
                <option key={cn} value={cn}>{cn}</option>
              ))}
            </select>
          </div>

          {/* Summary badge */}
          {!loading && !error && totalBelow > 0 && (
            <div className="flex items-end pb-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#fff7ed] text-[#c2410c] border border-[#fdba74] text-body-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {totalBelow} lớp dưới ngưỡng 80%
              </span>
            </div>
          )}
          {!loading && !error && totalBelow === 0 && summaries.length > 0 && (
            <div className="flex items-end pb-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f0fdf4] text-[#15803d] border border-[#86efac] text-body-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Tất cả lớp đạt ngưỡng
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">bar_chart</span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Tỉ lệ chuyên cần theo lớp</h2>
          </div>
          <span className="text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded">
            {loading ? '—' : `${summaries.length} lớp`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-data-table"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Lớp</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">GVCN</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Tổng HS</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap">Tỉ lệ CC (%)</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap">HS dưới ngưỡng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : summaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#94a3b8] text-body-sm">
                    <span className="material-symbols-outlined text-[36px] block mb-2" aria-hidden="true">
                      search_off
                    </span>
                    Không có dữ liệu điểm danh trong khoảng thời gian này
                  </td>
                </tr>
              ) : (
                summaries.map((row) => {
                  const isLow = row.tileChuyenCan < 80;
                  return (
                    <tr
                      key={row.classId}
                      className={`border-b border-[#f1f5f9] ${isLow ? '' : 'hover:bg-[#f8fafc]'} transition-colors`}
                      style={{ height: '44px', ...(isLow ? { backgroundColor: '#fff7ed' } : {}) }}
                    >
                      {/* Lớp */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="font-semibold text-[#0f172a]">{row.className}</span>
                      </td>
                      {/* GVCN */}
                      <td className="px-4 py-2 text-[#334155] whitespace-nowrap">
                        {row.gvcnName}
                      </td>
                      {/* Tổng HS */}
                      <td className="px-4 py-2 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {row.totalStudents}
                      </td>
                      {/* Tỉ lệ CC */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-[#f1f5f9] rounded-full overflow-hidden flex-none">
                            <div
                              className={`h-full rounded-full ${isLow ? 'bg-[#f97316]' : 'bg-[#22c55e]'}`}
                              style={{ width: `${row.tileChuyenCan}%` }}
                              role="presentation"
                            />
                          </div>
                          <span
                            className={`text-label-sm font-semibold w-10 tabular-nums ${isLow ? 'text-[#c2410c]' : 'text-[#15803d]'}`}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {row.tileChuyenCan}%
                          </span>
                          {isLow && (
                            <span className="material-symbols-outlined text-[16px] text-[#f97316]" aria-label="Dưới ngưỡng">
                              warning
                            </span>
                          )}
                        </div>
                      </td>
                      {/* HS dưới ngưỡng */}
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {row.soHSduoiNguong === 0 ? (
                          <span className="inline-flex items-center gap-1 text-label-sm text-[#15803d]">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>0
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fef2f2] text-[#b91c1c] text-label-sm font-bold"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {row.soHSduoiNguong}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-[#f1f5f9] flex items-center gap-6 text-label-sm text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-1.5 rounded-full bg-[#22c55e]" />
            ≥ 80%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-1.5 rounded-full bg-[#f97316]" />
            &lt; 80% (hàng nền vàng)
          </span>
        </div>
      </div>
    </div>
  );
}
