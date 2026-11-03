/**
 * BGHTuitionPage — Quản lý Học phí (UC-ADM-07)
 *
 * Chức năng:
 *   - KPI cards: Tổng học phí, Đã thu, Còn nợ, Tỷ lệ thu
 *   - Bảng danh sách học phí với filter theo lớp & trạng thái
 *
 * Dữ liệu: GET /api/tuition — không dùng mockData.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchTuitions } from '../../api/stubs.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(val) {
  if (val == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function SkeletonRow({ cols = 7 }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="animate-pulse h-4 bg-[#e2e8f0] rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color = '#2563eb', bgColor = '#eff4ff' }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[20px]" style={{ color }} aria-hidden="true">{icon}</span>
        <span className="text-label-sm font-semibold text-[#64748b]">{label}</span>
      </div>
      <p className="text-headline-lg font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-label-sm text-[#64748b]">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHTuitionPage() {
  const [records,        setRecords]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  // Filters
  const [filterClass,  setFilterClass]  = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTuitions();
        if (!cancelled) {
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải dữ liệu học phí. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Derived: class list ───────────────────────────────────────────────────
  const classOptions = useMemo(() => {
    const names = [...new Set(records.map((r) => r.class_name || r.className).filter(Boolean))].sort();
    return names;
  }, [records]);

  // ── Derived: KPIs ────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const total   = records.reduce((s, r) => s + (parseFloat(r.amount_due  || r.amountDue  || 0)), 0);
    const paid    = records.reduce((s, r) => s + (parseFloat(r.amount_paid || r.amountPaid || 0)), 0);
    const debt    = total - paid;
    const rate    = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, debt, rate };
  }, [records]);

  // ── Derived: filtered records ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const cls = r.class_name || r.className || '';
      const status = r.status || (
        parseFloat(r.amount_paid || r.amountPaid || 0) >= parseFloat(r.amount_due || r.amountDue || 0)
          ? 'paid'
          : 'unpaid'
      );
      const passClass  = filterClass  === 'all' || cls === filterClass;
      const passStatus = filterStatus === 'all' || status === filterStatus;
      return passClass && passStatus;
    });
  }, [records, filterClass, filterStatus]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-sans">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Quản lý Học phí</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Tổng hợp tình trạng thu học phí toàn trường — Niên khóa 2024–2025
          </p>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline hover:no-underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-2">
              <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-2/3" />
              <div className="animate-pulse h-8 bg-[#e2e8f0] rounded w-1/2" />
              <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon="account_balance_wallet"
            label="Tổng học phí"
            value={fmtCurrency(kpi.total)}
            sub={`${records.length} học sinh`}
            color="#0f172a"
          />
          <KpiCard
            icon="paid"
            label="Đã thu"
            value={fmtCurrency(kpi.paid)}
            sub={`${records.filter((r) => (r.status || '') === 'paid' || parseFloat(r.amount_paid || r.amountPaid || 0) >= parseFloat(r.amount_due || r.amountDue || 1)).length} HS đã thanh toán`}
            color="#15803d"
          />
          <KpiCard
            icon="money_off"
            label="Còn nợ"
            value={fmtCurrency(kpi.debt)}
            sub={`${records.filter((r) => (r.status || '') !== 'paid' && parseFloat(r.amount_paid || r.amountPaid || 0) < parseFloat(r.amount_due || r.amountDue || 1)).length} HS chưa thanh toán`}
            color={kpi.debt > 0 ? '#b91c1c' : '#15803d'}
          />
          <KpiCard
            icon="percent"
            label="Tỷ lệ thu"
            value={`${kpi.rate}%`}
            sub={kpi.rate >= 90 ? 'Đạt chỉ tiêu' : 'Chưa đạt chỉ tiêu 90%'}
            color={kpi.rate >= 90 ? '#15803d' : '#c2410c'}
          />
        </div>
      )}

      {/* ── Filter & Table ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">

        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-label-sm font-medium text-[#434655]">Lớp</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="all">Tất cả lớp</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-label-sm font-medium text-[#434655]">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
          </div>

          <p className="text-label-sm text-[#64748b] ml-auto self-end pb-2">
            Hiển thị {filtered.length} / {records.length} bản ghi
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Mã HS</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Lớp</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Khoản thu</th>
                <th className="px-4 py-2.5 text-right text-label-sm text-[#475569] font-medium uppercase tracking-wider">Phải nộp</th>
                <th className="px-4 py-2.5 text-right text-label-sm text-[#475569] font-medium uppercase tracking-wider">Đã nộp</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Số biên lai</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>{[1,2,3,4,5,6].map((i) => <SkeletonRow key={i} cols={7} />)}</>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#94a3b8] text-body-sm">
                    <span className="material-symbols-outlined text-[32px] block mb-2">receipt_long</span>
                    Không có dữ liệu học phí
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const studentCode = r.student_code || r.studentCode || '—';
                  const className   = r.class_name   || r.className   || '—';
                  const itemName    = r.item_name     || r.itemName    || r.feeType || '—';
                  const amountDue   = parseFloat(r.amount_due  || r.amountDue  || 0);
                  const amountPaid  = parseFloat(r.amount_paid || r.amountPaid || 0);
                  const receiptNo   = r.receipt_no    || r.receiptNo   || r.receiptNumber || '—';
                  const isPaid      = r.status === 'paid' || amountPaid >= amountDue;

                  return (
                    <tr key={r.id ?? idx} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '44px' }}>
                      <td className="px-4 py-2 font-mono text-[#004ac6] font-semibold whitespace-nowrap">{studentCode}</td>
                      <td className="px-4 py-2 text-[#334155] whitespace-nowrap">{className}</td>
                      <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap">{itemName}</td>
                      <td className="px-4 py-2 text-right text-[#334155] whitespace-nowrap">{fmtCurrency(amountDue)}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap font-semibold" style={{ color: isPaid ? '#15803d' : '#c2410c' }}>
                        {fmtCurrency(amountPaid)}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${isPaid ? 'bg-[#f0fdf4] border-[#86efac] text-[#15803d]' : 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'}`}>
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{isPaid ? 'check_circle' : 'pending'}</span>
                          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[#64748b] text-label-sm whitespace-nowrap">{receiptNo}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
