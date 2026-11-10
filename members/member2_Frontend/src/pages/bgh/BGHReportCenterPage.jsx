/**
 * BGHReportCenterPage — Trung tâm báo cáo BGH
 *
 * Chức năng:
 *   - Khung tiến độ chốt sổ điểm (nộp / ký duyệt / khóa)
 *   - Nút "Ký duyệt" từng lớp + nút "Khóa sổ toàn trường" với modal xác nhận
 *   - Tab "Học lực": tỉ lệ học lực theo khối + bảng so sánh điểm TB theo môn
 *   - Tab "Chốt số điểm": tỉ lệ nộp điểm đúng hạn + phân phối điểm
 *   - Export Excel & PDF (client-side)
 *
 * Dữ liệu: GET /api/reports/bgh — không dùng mockData.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../../components/shared/Modal.jsx';
import {
  fetchBGHReportData,
  approveBGHGradeBook,
  lockAllBGHGradeBooks,
  fetchNotifications,
  approveBGHUnlock,
  markNotificationRead,
} from '../../api/stubs.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgCell(v) {
  if (v === undefined || v === null) return <span className="text-[#94a3b8]">—</span>;
  let cls;
  if (v >= 8.0)      cls = 'bg-[#f0fdf4] text-[#15803d]';
  else if (v >= 6.5) cls = 'bg-[#eff6ff] text-[#1d4ed8]';
  else if (v >= 5.0) cls = 'bg-[#fff7ed] text-[#c2410c]';
  else               cls = 'bg-[#fef2f2] text-[#b91c1c] font-bold';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-label-sm font-medium ${cls}`}
      style={{ fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem', textAlign: 'center' }}>
      {v.toFixed(1)}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

const HOCLUC_STYLES = {
  gioi: 'bg-[#f0fdf4] text-[#15803d]',
  kha:  'bg-[#eff6ff] text-[#1d4ed8]',
  tb:   'bg-[#fff7ed] text-[#c2410c]',
  yeu:  'bg-[#fef2f2] text-[#b91c1c]',
  kem:  'bg-[#fef2f2] text-[#7f1d1d]',
};

const STATUS_CONFIG = {
  pending:   { icon: 'hourglass_empty', label: 'Chưa nộp',  cls: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]'  },
  submitted: { icon: 'inbox',           label: 'Chờ duyệt', cls: 'bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]'  },
  approved:  { icon: 'verified',        label: 'Đã duyệt',  cls: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]'  },
  locked:    { icon: 'lock',            label: 'Đã khóa',   cls: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]'  },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${cfg.cls}`}>
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function HoclucCell({ value, type }) {
  return (
    <td className="px-4 py-2.5 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span className={`inline-block px-2 py-0.5 rounded text-label-sm font-medium ${HOCLUC_STYLES[type]}`}>
        {value}%
      </span>
    </td>
  );
}

function SkeletonRow({ cols = 5 }) {
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

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

function HoclucTab({ loading, hoclucByGrade, classNames, avgBySubject }) {
  return (
    <div className="space-y-6">
      {/* Tỉ lệ học lực theo khối */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">workspace_premium</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Tỉ lệ học lực theo khối</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">Khối</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#15803d] font-medium uppercase tracking-wider">Giỏi</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#1d4ed8] font-medium uppercase tracking-wider">Khá</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#c2410c] font-medium uppercase tracking-wider">T.Bình</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#b91c1c] font-medium uppercase tracking-wider">Yếu</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#7f1d1d] font-medium uppercase tracking-wider">Kém</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4].map((i) => <SkeletonRow key={i} cols={6} />)
                : hoclucByGrade.length === 0
                ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8] text-body-sm">Chưa có dữ liệu học lực</td></tr>
                )
                : hoclucByGrade.map((row, i) => (
                  <tr key={row.grade}
                    className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i === hoclucByGrade.length - 1 ? 'font-semibold bg-[#f8fafc]' : ''}`}
                    style={{ height: '44px' }}>
                    <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.grade}</td>
                    <HoclucCell value={row.gioi} type="gioi" />
                    <HoclucCell value={row.kha}  type="kha"  />
                    <HoclucCell value={row.tb}   type="tb"   />
                    <HoclucCell value={row.yeu}  type="yeu"  />
                    <HoclucCell value={row.kem}  type="kem"  />
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Điểm TB theo môn & lớp */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">table_chart</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Điểm trung bình theo môn &amp; lớp</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Môn học</th>
                {classNames.map((cn) => (
                  <th key={cn} className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">{cn}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map((i) => <SkeletonRow key={i} cols={classNames.length + 1 || 4} />)
                : avgBySubject.length === 0
                ? (
                  <tr><td colSpan={classNames.length + 1} className="px-4 py-8 text-center text-[#94a3b8] text-body-sm">Chưa có dữ liệu điểm</td></tr>
                )
                : avgBySubject.map((row) => (
                  <tr key={row.subject} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '44px' }}>
                    <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.subject}</td>
                    {classNames.map((cn) => (
                      <td key={cn} className="px-4 py-2 text-center whitespace-nowrap">{avgCell(row[cn])}</td>
                    ))}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#f1f5f9] flex flex-wrap gap-4 text-label-sm text-[#64748b]">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-[#f0fdf4]" />≥ 8.0 Giỏi</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-[#eff6ff]" />6.5–8.0 Khá</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-[#fff7ed]" />5.0–6.5 T.Bình</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-[#fef2f2]" />&lt; 5.0 Yếu/Kém</span>
        </div>
      </div>
    </div>
  );
}

function ChatSoTab({ loading, submissionRate, scoreDistribution }) {
  return (
    <div className="space-y-6">
      {/* Tỉ lệ nộp điểm đúng hạn */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">assignment_turned_in</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Tỉ lệ nộp điểm đúng hạn theo giáo viên</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">Giáo viên</th>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">Môn</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Đúng hạn</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Tổng</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4].map((i) => <SkeletonRow key={i} cols={5} />)
                : submissionRate.length === 0
                ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[#94a3b8] text-body-sm">Chưa có dữ liệu</td></tr>
                : submissionRate.map((row) => (
                  <tr key={`${row.teacher}-${row.subject}`} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '44px' }}>
                    <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.teacher}</td>
                    <td className="px-4 py-2 text-[#334155] whitespace-nowrap">{row.subject}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.onTime}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.total}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-label-sm font-semibold ${row.rate === 100 ? 'bg-[#f0fdf4] text-[#15803d]' : row.rate >= 75 ? 'bg-[#fff7ed] text-[#c2410c]' : 'bg-[#fef2f2] text-[#b91c1c]'}`}
                        style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân phối điểm */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">bar_chart</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Phân phối điểm toàn trường</h2>
        </div>
        <div className="px-5 py-5 space-y-3">
          {loading
            ? [1,2,3,4,5,6].map((i) => <div key={i} className="animate-pulse h-7 bg-[#e2e8f0] rounded-full" />)
            : scoreDistribution.length === 0
            ? <p className="text-center text-[#94a3b8] text-body-sm py-6">Chưa có dữ liệu điểm</p>
            : scoreDistribution.map((row) => (
              <div key={row.range} className="flex items-center gap-3">
                <span className="text-label-sm text-[#64748b] w-16 flex-none text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.range}</span>
                <div className="flex-1 h-7 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#6366f1] flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(row.pct, 4)}%` }} role="presentation">
                    {row.pct >= 8 && (
                      <span className="text-white text-label-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.pct}%</span>
                    )}
                  </div>
                </div>
                <span className="text-label-sm font-semibold text-[#334155] w-12 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.count} HS</span>
                <span className="text-label-sm text-[#94a3b8] w-8 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.pct}%</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHReportCenterPage() {
  const [activeTab,        setActiveTab]        = useState('hocluc');
  const [selectedSemester, setSelectedSemester] = useState('HK1');
  const [selectedYear,     setSelectedYear]     = useState('2024-2025');
  const [isExporting,      setIsExporting]      = useState(false);

  // Data from API
  const [gradeBookList,    setGradeBookList]    = useState([]);
  const [hoclucByGrade,    setHoclucByGrade]    = useState([]);
  const [classNames,       setClassNames]       = useState([]);
  const [avgBySubject,     setAvgBySubject]     = useState([]);
  const [submissionRate,   setSubmissionRate]   = useState([]);
  const [scoreDistribution,setScoreDistribution]= useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);

  // Modal & action state
  const [isLockModalOpen,    setIsLockModalOpen]    = useState(false);
  const [lockingAll,         setLockingAll]         = useState(false);
  const [approvingId,        setApprovingId]        = useState(null);
  const [unlockSuccessClass, setUnlockSuccessClass] = useState(null); // tên lớp vừa duyệt mở khóa

  // Unlock requests from notifications
  const [unlockRequests,  setUnlockRequests]  = useState([]);
  const [approvingUnlock, setApprovingUnlock] = useState(null);

  // ── Fetch khi filter thay đổi ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBGHReportData({ semester: selectedSemester, schoolYear: selectedYear });
        if (!cancelled) {
          setGradeBookList(data.gradeBookList     ?? []);
          setHoclucByGrade(data.hoclucByGrade     ?? []);
          setClassNames(data.classNames           ?? []);
          setAvgBySubject(data.avgBySubject       ?? []);
          setSubmissionRate(data.submissionRate   ?? []);
          setScoreDistribution(data.scoreDistribution ?? []);
        }
        // Tải danh sách thông báo, lọc unlock_request chưa đọc
        try {
          const notifications = await fetchNotifications();
          if (!cancelled) {
            // Lọc tất cả unlock_request chưa được duyệt (kể cả đã đọc)
            // vì BGH vẫn cần duyệt dù đã click đọc thông báo
            const requests = (Array.isArray(notifications) ? notifications : []).filter(
              (n) => n.type === 'unlock_request'
            );
            setUnlockRequests(requests);
          }
        } catch {
          // Không có thông báo không ảnh hưởng trang báo cáo
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu báo cáo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedSemester, selectedYear]);

  // ── Closure stats ─────────────────────────────────────────────────────────
  const closureStats = useMemo(() => {
    const total     = gradeBookList.length;
    const submitted = gradeBookList.filter((r) => ['submitted','approved','locked'].includes(r.status)).length;
    const approved  = gradeBookList.filter((r) => ['approved','locked'].includes(r.status)).length;
    const locked    = gradeBookList.filter((r) => r.status === 'locked').length;
    const pending   = gradeBookList.filter((r) => r.status === 'pending').length;
    return { total, submitted, approved, locked, pending };
  }, [gradeBookList]);

  const canLockAll  = closureStats.approved === closureStats.total && closureStats.total > 0;
  const approvedPct = closureStats.total > 0
    ? Math.round((closureStats.approved / closureStats.total) * 100)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApprove = async (classId) => {
    setApprovingId(classId);
    try {
      const result = await approveBGHGradeBook({
        classId,
        semester: selectedSemester,
        schoolYear: selectedYear,
      });
      setGradeBookList((prev) =>
        prev.map((r) =>
          r.classId === classId
            ? { ...r, status: result.status, approvedAt: result.approvedAt }
            : r
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveUnlock = async (request) => {
    setApprovingUnlock(request.id);
    try {
      await approveBGHUnlock({
        notificationId: request.id,
        classId:        request.relatedClass ?? request.related_class,
        className:      request.relatedClass ?? request.related_class,
        gvcnUsername:   request.senderId    ?? request.sender_id,
        semester:       request.relatedSemester ?? request.related_semester ?? selectedSemester,
        schoolYear:     selectedYear,
      });
      // Xóa request khỏi danh sách sau khi duyệt
      setUnlockRequests((prev) => prev.filter((r) => r.id !== request.id));
      // Cập nhật status lớp về 'approved' trong danh sách hiển thị
      const classId = request.relatedClass ?? request.related_class;
      setGradeBookList((prev) =>
        prev.map((r) => r.classId === classId ? { ...r, status: 'approved' } : r)
      );
      // Hiện modal thành công
      setUnlockSuccessClass(classId);
    } catch (err) {
      setError(err.message || 'Duyệt mở khóa thất bại.');
    } finally {
      setApprovingUnlock(null);
    }
  };

  const handleLockAll = async () => {    setLockingAll(true);
    try {
      await lockAllBGHGradeBooks({ semester: selectedSemester, schoolYear: selectedYear });
      setGradeBookList((prev) =>
        prev.map((r) => (r.status === 'approved' ? { ...r, status: 'locked' } : r))
      );
      setIsLockModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLockingAll(false);
    }
  };

  // ── Export Excel ─────────────────────────────────────────────────────────
  const handleExportExcel = useCallback(() => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const label = `${selectedSemester} - ${selectedYear}`;

      const ws1 = XLSX.utils.aoa_to_sheet([
        ['Khối / Lớp', 'Giỏi (%)', 'Khá (%)', 'Trung bình (%)', 'Yếu (%)', 'Kém (%)'],
        ...hoclucByGrade.map((r) => [r.grade, r.gioi, r.kha, r.tb, r.yeu, r.kem]),
      ]);
      ws1['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Học lực');

      const ws2 = XLSX.utils.aoa_to_sheet([
        ['Môn học', ...classNames],
        ...avgBySubject.map((r) => [r.subject, ...classNames.map((cn) => r[cn] ?? '')]),
      ]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Điểm TB theo môn');

      const ws3 = XLSX.utils.aoa_to_sheet([
        ['Giáo viên', 'Môn học', 'Đúng hạn', 'Tổng', 'Tỉ lệ (%)'],
        ...submissionRate.map((r) => [r.teacher, r.subject, r.onTime, r.total, r.rate]),
      ]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Nộp điểm đúng hạn');

      const ws4 = XLSX.utils.aoa_to_sheet([
        ['Khoảng điểm', 'Số học sinh', 'Tỉ lệ (%)'],
        ...scoreDistribution.map((r) => [r.range, r.count, r.pct]),
      ]);
      XLSX.utils.book_append_sheet(wb, ws4, 'Phân phối điểm');

      const ws5 = XLSX.utils.aoa_to_sheet([
        ['Lớp', 'GVCN', 'Trạng thái', 'Ngày nộp', 'Ngày ký duyệt'],
        ...gradeBookList.map((r) => [
          r.className, r.gvcnName,
          STATUS_CONFIG[r.status]?.label ?? r.status,
          fmtDate(r.submittedAt), fmtDate(r.approvedAt),
        ]),
      ]);
      ws5['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws5, 'Chốt sổ điểm');

      XLSX.writeFile(wb, `BaoCao_HTQLLH_${label}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  }, [selectedSemester, selectedYear, hoclucByGrade, classNames, avgBySubject, submissionRate, scoreDistribution, gradeBookList]);

  // ── Export PDF ────────────────────────────────────────────────────────────
  const handleExportPdf = useCallback(() => {
    const label = `${selectedSemester} – ${selectedYear}`;
    const ts = 'border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:11pt;margin-bottom:24pt';
    const th = 'background:#e8edf8;border:1px solid #b0b8d0;padding:6px 10px;text-align:left;font-size:10pt;font-weight:bold';
    const tc = 'border:1px solid #c8d0e0;padding:5px 10px;font-size:10pt';
    const tn = tc + ';text-align:center';
    const h2s = 'font-family:Arial,sans-serif;font-size:13pt;margin:20pt 0 8pt;color:#1e3a6e;border-bottom:2px solid #2563eb;padding-bottom:4pt';

    const mkTable = (headers, rows, alignCenter = []) => {
      const head = '<tr>' + headers.map((h, i) =>
        `<th style="${th}${alignCenter.includes(i) ? ';text-align:center' : ''}">${h}</th>`
      ).join('') + '</tr>';
      const body = rows.map((row) =>
        '<tr>' + row.map((cell, i) =>
          `<td style="${alignCenter.includes(i) ? tn : tc}">${cell ?? '—'}</td>`
        ).join('') + '</tr>'
      ).join('');
      return `<table style="${ts}"><thead>${head}</thead><tbody>${body}</tbody></table>`;
    };

    const t1 = `<h2 style="${h2s}">Tỉ lệ học lực theo khối</h2>` +
      mkTable(['Khối / Lớp', 'Giỏi (%)', 'Khá (%)', 'Trung bình (%)', 'Yếu (%)', 'Kém (%)'],
        hoclucByGrade.map((r) => [r.grade, r.gioi+'%', r.kha+'%', r.tb+'%', r.yeu+'%', r.kem+'%']),
        [1,2,3,4,5]);

    const t2 = `<h2 style="${h2s}">Điểm trung bình theo môn &amp; lớp</h2>` +
      mkTable(['Môn học', ...classNames],
        avgBySubject.map((r) => [r.subject, ...classNames.map((cn) => r[cn] ?? '—')]),
        classNames.map((_, i) => i + 1));

    const t3 = `<h2 style="${h2s}">Tỉ lệ nộp điểm đúng hạn theo giáo viên</h2>` +
      mkTable(['Giáo viên', 'Môn học', 'Đúng hạn', 'Tổng', 'Tỉ lệ (%)'],
        submissionRate.map((r) => [r.teacher, r.subject, r.onTime, r.total, r.rate+'%']),
        [2,3,4]);

    const t4 = `<h2 style="${h2s}">Phân phối điểm toàn trường</h2>` +
      mkTable(['Khoảng điểm', 'Số học sinh', 'Tỉ lệ (%)'],
        scoreDistribution.map((r) => [r.range, r.count, r.pct+'%']),
        [1,2]);

    const t5 = `<h2 style="${h2s}">Tiến độ chốt sổ điểm</h2>` +
      mkTable(['Lớp', 'GVCN', 'Trạng thái', 'Ngày nộp', 'Ngày ký duyệt'],
        gradeBookList.map((r) => [
          r.className, r.gvcnName,
          STATUS_CONFIG[r.status]?.label ?? r.status,
          fmtDate(r.submittedAt), fmtDate(r.approvedAt),
        ]),
        [3,4]);

    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
      <title>Báo cáo HTQLLH</title>
      <style>@page{margin:1.5cm}body{font-family:Arial,sans-serif;color:#0b1c30;padding:0}
      h1{font-size:16pt;margin:0 0 4pt;color:#0b1c30}
      p.sub{font-size:10pt;color:#64748b;margin:0 0 20pt}
      @media print{body{margin:0}}</style>
      </head><body>
      <h1>Báo cáo Học vụ &amp; Chất lượng Điểm số</h1>
      <p class="sub">${label} &nbsp;|&nbsp; HTQLLH &nbsp;|&nbsp; ${new Date().toLocaleDateString('vi-VN')}</p>
      ${t1}${t2}${t3}${t4}${t5}
      </body></html>`;

    const popup = window.open('', '_blank', 'width=960,height=720,scrollbars=yes');
    if (!popup) {
      alert('Trình duyệt đang chặn popup. Vui lòng cho phép popup rồi thử lại.');
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    setTimeout(() => { try { popup.print(); } catch (e) { /* user closed */ } }, 400);
  }, [selectedSemester, selectedYear, hoclucByGrade, classNames, avgBySubject, submissionRate, scoreDistribution, gradeBookList]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Trung tâm Báo cáo</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Thống kê học lực, chất lượng điểm số, tiến độ chốt sổ và phê duyệt toàn trường
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportExcel} disabled={isExporting || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#15803d]">table_view</span>
            Xuất Excel
          </button>
          <button type="button" onClick={handleExportPdf} disabled={isExporting || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#b91c1c]">picture_as_pdf</span>
            Xuất PDF
          </button>
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

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-label-sm font-medium text-[#434655]">Học kỳ</label>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
            <option value="HK1">Học kỳ 1</option>
            <option value="HK2">Học kỳ 2</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-label-sm font-medium text-[#434655]">Năm học</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
            <option value="2024-2025">2024–2025</option>
            <option value="2023-2024">2023–2024</option>
          </select>
        </div>
      </div>

      {/* ── Khung tiến độ chốt sổ ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">assignment_turned_in</span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Tiến độ chốt sổ điểm</h2>
            <span className="text-label-sm bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] px-2 py-0.5 rounded">
              {selectedSemester} · {selectedYear}
            </span>
          </div>
          <button
            type="button"
            disabled={!canLockAll || loading}
            onClick={() => setIsLockModalOpen(true)}
            title={canLockAll ? 'Khóa sổ toàn trường' : 'Cần ký duyệt hết tất cả các lớp trước khi khóa'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-semibold shadow-elevation-1 transition-all active:scale-[0.98] ${
              canLockAll && !loading
                ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Khóa sổ toàn trường
          </button>
        </div>

        {/* Progress summary */}
        <div className="px-5 py-4 border-b border-[#f1f5f9] bg-[#f8f9ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-[#475569]">
              Đã ký duyệt:{' '}
              <span className="font-semibold text-[#0b1c30]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '—' : `${closureStats.approved}/${closureStats.total}`}
              </span>{' '}lớp
              {closureStats.locked > 0 && (
                <span className="ml-2 text-label-sm text-[#334155]">· {closureStats.locked} lớp đã khóa</span>
              )}
            </span>
            <span className="text-label-sm font-semibold text-[#004ac6]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {loading ? '—' : `${approvedPct}%`}
            </span>
          </div>
          <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${approvedPct}%`, background: approvedPct === 100 ? '#16a34a' : '#004ac6' }}
              role="progressbar" aria-valuenow={approvedPct} aria-valuemin={0} aria-valuemax={100} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { key: 'approved', icon: 'verified',        label: 'Đã duyệt', cls: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',  val: closureStats.approved  },
              { key: 'submitted',icon: 'inbox',           label: 'Chờ duyệt',cls: 'bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]',  val: closureStats.submitted },
              { key: 'pending',  icon: 'hourglass_empty', label: 'Chưa nộp', cls: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',  val: closureStats.pending   },
              ...(closureStats.locked > 0 ? [{ key: 'locked', icon: 'lock', label: 'Đã khóa', cls: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]', val: closureStats.locked }] : []),
            ].map((chip) => (
              <span key={chip.key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium ${chip.cls}`}>
                <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>
                {chip.label}: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{loading ? '—' : chip.val}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Per-class table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">Lớp</th>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">GVCN</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap">Ngày nộp</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap">Ngày ký duyệt</th>
                <th className="px-4 py-2.5 text-right  text-label-sm text-[#475569] font-medium uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3].map((i) => <SkeletonRow key={i} cols={6} />)
                : gradeBookList.length === 0
                ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8] text-body-sm">Không có dữ liệu</td></tr>
                : gradeBookList.map((row) => (
                  <tr key={row.classId} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '52px' }}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="font-semibold text-[#0f172a]">{row.className}</span>
                    </td>
                    <td className="px-4 py-2 text-[#334155] whitespace-nowrap">{row.gvcnName}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap"><StatusChip status={row.status} /></td>
                    <td className="px-4 py-2 text-center text-body-sm text-[#64748b] whitespace-nowrap">{fmtDate(row.submittedAt)}</td>
                    <td className="px-4 py-2 text-center text-body-sm text-[#64748b] whitespace-nowrap">{fmtDate(row.approvedAt)}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {row.status === 'submitted' ? (
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button type="button" disabled={approvingId === row.classId}
                            onClick={() => handleApprove(row.classId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-label-sm font-medium transition-all">
                            {approvingId === row.classId
                              ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-[14px]">draw</span>}
                            Ký duyệt
                          </button>
                          {(() => {
                            const unlockReq = unlockRequests.find(
                              (r) => (r.relatedClass ?? r.related_class) === row.classId
                            );
                            return unlockReq ? (
                              <button type="button"
                                disabled={approvingUnlock === unlockReq.id}
                                onClick={() => handleApproveUnlock(unlockReq)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed text-white text-label-sm font-medium transition-all">
                                {approvingUnlock === unlockReq.id
                                  ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                  : <span className="material-symbols-outlined text-[14px]">lock_open</span>}
                                Duyệt mở khóa
                              </button>
                            ) : null;
                          })()}
                        </div>
                      ) : row.status === 'approved' || row.status === 'locked' ? (
                        (() => {
                          const unlockReq = unlockRequests.find(
                            (r) => (r.relatedClass ?? r.related_class) === row.classId
                          );
                          return unlockReq ? (
                            <button type="button"
                              disabled={approvingUnlock === unlockReq.id}
                              onClick={() => handleApproveUnlock(unlockReq)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed text-white text-label-sm font-medium transition-all">
                              {approvingUnlock === unlockReq.id
                                ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-[14px]">lock_open</span>}
                              Duyệt mở khóa
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-label-sm text-[#15803d] font-medium">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>Đã xong
                            </span>
                          );
                        })()
                      ) : (
                        (() => {
                          const unlockReq = unlockRequests.find(
                            (r) => (r.relatedClass ?? r.related_class) === row.classId
                          );
                          return unlockReq ? (
                            <button type="button"
                              disabled={approvingUnlock === unlockReq.id}
                              onClick={() => handleApproveUnlock(unlockReq)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed text-white text-label-sm font-medium transition-all">
                              {approvingUnlock === unlockReq.id
                                ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-[14px]">lock_open</span>}
                              Duyệt mở khóa
                            </button>
                          ) : (
                            <span className="text-label-sm text-[#94a3b8]">GV chưa nộp</span>
                          );
                        })()
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex border-b border-[#e2e8f0] gap-0">
        {[
          { id: 'hocluc', label: 'Học lực',      icon: 'workspace_premium'    },
          { id: 'chatso', label: 'Chốt số điểm', icon: 'assignment_turned_in' },
        ].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-5 py-3 text-body-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]'
            }`}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'hocluc' && (
        <HoclucTab loading={loading} hoclucByGrade={hoclucByGrade} classNames={classNames} avgBySubject={avgBySubject} />
      )}
      {activeTab === 'chatso' && (
        <ChatSoTab loading={loading} submissionRate={submissionRate} scoreDistribution={scoreDistribution} />
      )}

      {/* ── Modal thành công duyệt mở khóa ── */}
      <Modal
        isOpen={!!unlockSuccessClass}
        onClose={() => setUnlockSuccessClass(null)}
        title="Duyệt mở khóa thành công"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-[#16a34a]" aria-hidden="true">lock_open</span>
          </div>
          <div className="space-y-2">
            <p className="text-body-md font-semibold text-[#0f172a]">
              Đã mở khóa sổ điểm lớp {unlockSuccessClass}
            </p>
            <p className="text-body-sm text-[#64748b] leading-relaxed">
              GVCN lớp <strong className="text-[#0b1c30]">{unlockSuccessClass}</strong> đã được
              thông báo và có thể chỉnh sửa điểm trở lại.
            </p>
          </div>
          <div className="w-full pt-2 border-t border-[#f1f5f9]">
            <button type="button" onClick={() => setUnlockSuccessClass(null)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-body-sm font-semibold transition-colors">
              Đã hiểu
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal xác nhận khóa sổ ── */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => !lockingAll && setIsLockModalOpen(false)}
        title="Xác nhận khóa sổ toàn trường"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-[#dc2626]" aria-hidden="true">lock</span>
          </div>
          <div className="space-y-2">
            <p className="text-body-md font-semibold text-[#0f172a]">
              Khóa sổ điểm {selectedSemester} — Năm học {selectedYear}
            </p>
            <p className="text-body-sm text-[#64748b] leading-relaxed">
              Hành động này sẽ <strong className="text-[#0b1c30]">khóa toàn bộ sổ điểm</strong> của{' '}
              <strong className="text-[#0b1c30]">{closureStats.total} lớp</strong> và{' '}
              <strong className="text-[#dc2626]">không thể hoàn tác</strong>.
              Sau khi khóa, không ai có thể chỉnh sửa điểm số nữa.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2 border-t border-[#f1f5f9]">
            <button type="button" onClick={() => setIsLockModalOpen(false)} disabled={lockingAll}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 transition-colors">
              Hủy
            </button>
            <button type="button" onClick={handleLockAll} disabled={lockingAll}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold transition-all">
              {lockingAll ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Đang khóa...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">lock</span>Xác nhận khóa sổ</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
