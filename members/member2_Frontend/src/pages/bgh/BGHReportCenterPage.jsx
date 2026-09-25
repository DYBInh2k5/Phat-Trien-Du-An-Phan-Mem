/**
 * BGHReportCenterPage — Trung tâm báo cáo BGH
 *
 * Chức năng:
 *   - Khung tiến độ chốt sổ điểm (nộp / ký duyệt / khóa)
 *   - Nút "Ký duyệt" từng lớp + nút "Khóa sổ toàn trường" với modal xác nhận
 *   - Tab "Học lực": tỉ lệ học lực theo khối + bảng so sánh điểm TB theo môn
 *   - Tab "Chốt số điểm": tỉ lệ nộp điểm đúng hạn + phân phối điểm
 *   - Export buttons → handleExportReport stub
 */

import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../../components/shared/Modal.jsx';
import { handleApproveGradeBook, handleLockAllGradeBooks } from '../../api/stubs.js';
import { gradeBookStatus } from '../../data/mockData.js';

// ─── Static data ─────────────────────────────────────────────────────────────

const HOCLUC_BY_GRADE = [
  { grade: 'Khối 10',      gioi: 22, kha: 38, tb: 28, yeu: 9, kem: 3  },
  { grade: 'Khối 11',      gioi: 25, kha: 40, tb: 25, yeu: 8, kem: 2  },
  { grade: 'Khối 12',      gioi: 30, kha: 42, tb: 20, yeu: 6, kem: 2  },
  { grade: 'Toàn trường',  gioi: 26, kha: 40, tb: 24, yeu: 8, kem: 2  },
];

const AVG_BY_SUBJECT = [
  { subject: 'Toán',       '10A1': 6.9, '10A2': 7.1, '11B1': 7.5 },
  { subject: 'Ngữ văn',    '10A1': 6.8, '10A2': 7.0, '11B1': 7.2 },
  { subject: 'Tiếng Anh',  '10A1': 6.1, '10A2': 6.4, '11B1': 6.9 },
  { subject: 'Vật lý',     '10A1': 7.0, '10A2': 6.8, '11B1': 7.3 },
  { subject: 'Hóa học',    '10A1': 6.4, '10A2': 6.6, '11B1': 7.0 },
];

const SUBMISSION_RATE = [
  { teacher: 'Nguyễn Văn An',   subject: 'Toán',      onTime: 4, total: 4, rate: 100 },
  { teacher: 'Trần Thị Bình',   subject: 'Ngữ văn',   onTime: 4, total: 4, rate: 100 },
  { teacher: 'Lê Minh Châu',    subject: 'Tiếng Anh', onTime: 3, total: 4, rate: 75  },
  { teacher: 'Phạm Thị Dung',   subject: 'Vật lý',    onTime: 4, total: 4, rate: 100 },
  { teacher: 'Hoàng Văn Em',    subject: 'Hóa học',   onTime: 2, total: 4, rate: 50  },
  { teacher: 'Vũ Thị Phương',   subject: 'Sinh học',  onTime: 4, total: 4, rate: 100 },
  { teacher: 'Đặng Quốc Hùng',  subject: 'Lịch sử',  onTime: 3, total: 4, rate: 75  },
  { teacher: 'Bùi Thị Lan',     subject: 'Địa lý',   onTime: 4, total: 4, rate: 100 },
];

const SCORE_DISTRIBUTION = [
  { range: '0 – 2',   count: 3,  pct: 2  },
  { range: '2 – 4',   count: 8,  pct: 6  },
  { range: '4 – 5',   count: 15, pct: 12 },
  { range: '5 – 6.5', count: 42, pct: 33 },
  { range: '6.5 – 8', count: 38, pct: 30 },
  { range: '8 – 10',  count: 22, pct: 17 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgCell(v) {
  if (v === undefined || v === null) return <span className="text-[#94a3b8]">—</span>;
  let cls;
  if (v >= 8.0)      cls = 'bg-[#f0fdf4] text-[#15803d]';
  else if (v >= 6.5) cls = 'bg-[#eff6ff] text-[#1d4ed8]';
  else if (v >= 5.0) cls = 'bg-[#fff7ed] text-[#c2410c]';
  else               cls = 'bg-[#fef2f2] text-[#b91c1c] font-bold';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-label-sm font-medium ${cls}`}
      style={{ fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem', textAlign: 'center' }}
    >
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
  pending:   { icon: 'hourglass_empty', label: 'Chưa nộp',  cls: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]'   },
  submitted: { icon: 'inbox',           label: 'Chờ duyệt', cls: 'bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]'   },
  approved:  { icon: 'verified',        label: 'Đã duyệt',  cls: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]'   },
  locked:    { icon: 'lock',            label: 'Đã khóa',   cls: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]'   },
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

// ─── Tab: Học lực ─────────────────────────────────────────────────────────────

function HoclucTab() {
  return (
    <div className="space-y-6">
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
              {HOCLUC_BY_GRADE.map((row, i) => (
                <tr key={row.grade} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i === HOCLUC_BY_GRADE.length - 1 ? 'font-semibold bg-[#f8fafc]' : ''}`} style={{ height: '44px' }}>
                  <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.grade}</td>
                  <HoclucCell value={row.gioi} type="gioi" />
                  <HoclucCell value={row.kha}  type="kha"  />
                  <HoclucCell value={row.tb}   type="tb"   />
                  <HoclucCell value={row.yeu}  type="yeu"  />
                  <HoclucCell value={row.kem}  type="kem"  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">table_chart</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Điểm trung bình theo môn & lớp</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left   text-label-sm text-[#475569] font-medium uppercase tracking-wider">Môn học</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">10A1</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">10A2</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">11B1</th>
              </tr>
            </thead>
            <tbody>
              {AVG_BY_SUBJECT.map((row) => (
                <tr key={row.subject} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '44px' }}>
                  <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.subject}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">{avgCell(row['10A1'])}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">{avgCell(row['10A2'])}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">{avgCell(row['11B1'])}</td>
                </tr>
              ))}
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

// ─── Tab: Chốt sổ điểm ────────────────────────────────────────────────────────

function ChatSoTab() {
  return (
    <div className="space-y-6">
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
              {SUBMISSION_RATE.map((row) => (
                <tr key={row.teacher} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '44px' }}>
                  <td className="px-4 py-2 text-[#1e293b] whitespace-nowrap font-medium">{row.teacher}</td>
                  <td className="px-4 py-2 text-[#334155] whitespace-nowrap">{row.subject}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.onTime}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.total}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-label-sm font-semibold ${row.rate === 100 ? 'bg-[#f0fdf4] text-[#15803d]' : row.rate >= 75 ? 'bg-[#fff7ed] text-[#c2410c]' : 'bg-[#fef2f2] text-[#b91c1c]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {row.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">bar_chart</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Phân phối điểm toàn trường</h2>
        </div>
        <div className="px-5 py-5 space-y-3">
          {SCORE_DISTRIBUTION.map((row) => (
            <div key={row.range} className="flex items-center gap-3">
              <span className="text-label-sm text-[#64748b] w-16 flex-none text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.range}</span>
              <div className="flex-1 h-7 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#6366f1] flex items-center justify-end pr-2" style={{ width: `${Math.max(row.pct, 4)}%` }} role="presentation">
                  {row.pct >= 8 && (
                    <span className="text-white text-label-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.pct}%</span>
                  )}
                </div>
              </div>
              <span className="text-label-sm font-semibold text-[#334155] w-12 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.count} HS</span>
              <span className="text-label-sm text-[#94a3b8] w-8 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BGHReportCenterPage() {
  const [activeTab,        setActiveTab]        = useState('hocluc');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedYear,     setSelectedYear]     = useState('2024-2025');
  const [isExporting,      setIsExporting]      = useState(false);

  // Gradebook closure state
  const [gradeBookList,  setGradeBookList]  = useState(gradeBookStatus);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockingAll,     setLockingAll]     = useState(false);
  const [approvingId,    setApprovingId]    = useState(null);

  // Closure progress stats
  const closureStats = useMemo(() => {
    const total     = gradeBookList.length;
    const submitted = gradeBookList.filter(r => ['submitted','approved','locked'].includes(r.status)).length;
    const approved  = gradeBookList.filter(r => ['approved','locked'].includes(r.status)).length;
    const locked    = gradeBookList.filter(r => r.status === 'locked').length;
    const pending   = gradeBookList.filter(r => r.status === 'pending').length;
    return { total, submitted, approved, locked, pending };
  }, [gradeBookList]);

  const canLockAll = closureStats.approved === closureStats.total && closureStats.total > 0;

  // Handlers
  const handleApprove = async (classId) => {
    setApprovingId(classId);
    try {
      await handleApproveGradeBook({ classId, semester: selectedSemester, year: selectedYear });
      setGradeBookList(prev => prev.map(r =>
        r.classId === classId
          ? { ...r, status: 'approved', approvedAt: new Date().toISOString() }
          : r
      ));
    } finally {
      setApprovingId(null);
    }
  };

  const handleLockAll = async () => {
    setLockingAll(true);
    try {
      await handleLockAllGradeBooks({ semester: selectedSemester, year: selectedYear });
      setGradeBookList(prev => prev.map(r => ({ ...r, status: 'locked' })));
      setIsLockModalOpen(false);
    } finally {
      setLockingAll(false);
    }
  };

  // ── Export Excel (client-side via SheetJS) ───────────────────────────────
  const handleExportExcel = useCallback(() => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const label = 'HK' + selectedSemester + ' - ' + selectedYear;

      // Sheet 1: Tỉ lệ học lực
      const hoclucRows = [
        ['Khối / Lớp', 'Giỏi (%)', 'Khá (%)', 'Trung bình (%)', 'Yếu (%)', 'Kém (%)'],
        ...HOCLUC_BY_GRADE.map(r => [r.grade, r.gioi, r.kha, r.tb, r.yeu, r.kem]),
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(hoclucRows);
      ws1['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Học lực');

      // Sheet 2: Điểm TB theo môn
      const avgRows = [
        ['Môn học', '10A1', '10A2', '11B1'],
        ...AVG_BY_SUBJECT.map(r => [r.subject, r['10A1'], r['10A2'], r['11B1']]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(avgRows);
      ws2['!cols'] = [{ wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Điểm TB theo môn');

      // Sheet 3: Tỉ lệ nộp điểm
      const subRows = [
        ['Giáo viên', 'Môn học', 'Đúng hạn', 'Tổng', 'Tỉ lệ (%)'],
        ...SUBMISSION_RATE.map(r => [r.teacher, r.subject, r.onTime, r.total, r.rate]),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(subRows);
      ws3['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Nộp điểm đúng hạn');

      // Sheet 4: Phân phối điểm
      const distRows = [
        ['Khoảng điểm', 'Số học sinh', 'Tỉ lệ (%)'],
        ...SCORE_DISTRIBUTION.map(r => [r.range, r.count, r.pct]),
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(distRows);
      ws4['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Phân phối điểm');

      // Sheet 5: Tiến độ chốt sổ
      const gbRows = [
        ['Lớp', 'GVCN', 'Trạng thái', 'Ngày nộp', 'Ngày ký duyệt'],
        ...gradeBookList.map(r => [
          r.className,
          r.gvcnName,
          STATUS_CONFIG[r.status]?.label ?? r.status,
          fmtDate(r.submittedAt),
          fmtDate(r.approvedAt),
        ]),
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(gbRows);
      ws5['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws5, 'Chốt sổ điểm');

      XLSX.writeFile(wb, 'BaoCao_EduManage_' + label + '.xlsx');
    } finally {
      setIsExporting(false);
    }
  }, [selectedSemester, selectedYear, gradeBookList]);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  // Mo popup chi chua data rồi print popup - tranh in toan trang
  const handleExportPdf = useCallback(() => {
    const label = 'Học kỳ ' + selectedSemester + ' – ' + selectedYear;

    const ts = 'border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:11pt;margin-bottom:24pt';
    const th = 'background:#e8edf8;border:1px solid #b0b8d0;padding:6px 10px;text-align:left;font-size:10pt;font-weight:bold';
    const tc = 'border:1px solid #c8d0e0;padding:5px 10px;font-size:10pt';
    const tn = tc + ';text-align:center';
    const h2s = 'font-family:Arial,sans-serif;font-size:13pt;margin:20pt 0 8pt;color:#1e3a6e;border-bottom:2px solid #2563eb;padding-bottom:4pt';

    const mkTable = (headers, rows, alignCenter = []) => {
      const head = '<tr>' + headers.map((h, i) =>
        '<th style="' + th + (alignCenter.includes(i) ? ';text-align:center' : '') + '">' + h + '</th>'
      ).join('') + '</tr>';
      const body = rows.map(row =>
        '<tr>' + row.map((cell, i) =>
          '<td style="' + (alignCenter.includes(i) ? tn : tc) + '">' + (cell ?? '—') + '</td>'
        ).join('') + '</tr>'
      ).join('');
      return '<table style="' + ts + '"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    };

    const t1 = '<h2 style="' + h2s + '">Tỉ lệ học lực theo khối</h2>' +
      mkTable(
        ['Khối / Lớp', 'Giỏi (%)', 'Khá (%)', 'Trung bình (%)', 'Yếu (%)', 'Kém (%)'],
        HOCLUC_BY_GRADE.map(r => [r.grade, r.gioi + '%', r.kha + '%', r.tb + '%', r.yeu + '%', r.kem + '%']),
        [1, 2, 3, 4, 5]
      );

    const t2 = '<h2 style="' + h2s + '">Điểm trung bình theo môn & lớp</h2>' +
      mkTable(
        ['Môn học', '10A1', '10A2', '11B1'],
        AVG_BY_SUBJECT.map(r => [r.subject, r['10A1'], r['10A2'], r['11B1']]),
        [1, 2, 3]
      );

    const t3 = '<h2 style="' + h2s + '">Tỉ lệ nộp điểm đúng hạn theo giáo viên</h2>' +
      mkTable(
        ['Giáo viên', 'Môn học', 'Đúng hạn', 'Tổng', 'Tỉ lệ (%)'],
        SUBMISSION_RATE.map(r => [r.teacher, r.subject, r.onTime, r.total, r.rate + '%']),
        [2, 3, 4]
      );

    const t4 = '<h2 style="' + h2s + '">Phân phối điểm toàn trường</h2>' +
      mkTable(
        ['Khoảng điểm', 'Số học sinh', 'Tỉ lệ (%)'],
        SCORE_DISTRIBUTION.map(r => [r.range, r.count, r.pct + '%']),
        [1, 2]
      );

    const t5 = '<h2 style="' + h2s + '">Tiến độ chốt sổ điểm</h2>' +
      mkTable(
        ['Lớp', 'GVCN', 'Trạng thái', 'Ngày nộp', 'Ngày ký duyệt'],
        gradeBookList.map(r => [
          r.className,
          r.gvcnName,
          STATUS_CONFIG[r.status]?.label ?? r.status,
          fmtDate(r.submittedAt),
          fmtDate(r.approvedAt),
        ]),
        [3, 4]
      );

    const html = '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">' +
      '<title>Báo cáo EduManage Pro</title>' +
      '<style>@page{margin:1.5cm}body{font-family:Arial,sans-serif;color:#0b1c30;padding:0}' +
      'h1{font-size:16pt;margin:0 0 4pt;color:#0b1c30}' +
      'p.sub{font-size:10pt;color:#64748b;margin:0 0 20pt}' +
      '@media print{body{margin:0}}</style>' +
      '</head><body>' +
      '<h1>Báo cáo Học vụ &amp; Chất lượng Điểm số</h1>' +
      '<p class="sub">' + label + ' &nbsp;|&nbsp; EduManage Pro &nbsp;|&nbsp; ' +
      new Date().toLocaleDateString('vi-VN') + '</p>' +
      t1 + t2 + t3 + t4 + t5 +
      '</body></html>';

    const popup = window.open('', '_blank', 'width=960,height=720,scrollbars=yes');
    if (!popup) {
      alert('Trình duyệt đang chặn popup. Vui lòng cho phép popup cho trang này rồi thử lại.');
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    setTimeout(() => {
      try { popup.print(); } catch (e) { /* user closed popup */ }
    }, 400);
  }, [selectedSemester, selectedYear, gradeBookList]);

  const approvedPct = closureStats.total > 0
    ? Math.round((closureStats.approved / closureStats.total) * 100)
    : 0;

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
          <button type="button" onClick={handleExportExcel} disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#15803d]">table_view</span>
            Xuất Excel
          </button>
          <button type="button" onClick={handleExportPdf} disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#b91c1c]">picture_as_pdf</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-label-sm font-medium text-[#434655]">Học kỳ</label>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
            <option value="1">Học kỳ 1</option>
            <option value="2">Học kỳ 2</option>
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

      {/* ── Khung tiến độ chốt sổ điểm ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]" aria-hidden="true">assignment_turned_in</span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Tiến độ chốt sổ điểm</h2>
            <span className="text-label-sm bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] px-2 py-0.5 rounded">
              HK{selectedSemester} · {selectedYear}
            </span>
          </div>
          <button
            type="button"
            disabled={!canLockAll}
            onClick={() => setIsLockModalOpen(true)}
            title={canLockAll ? 'Khóa sổ toàn trường' : 'Cần ký duyệt hết tất cả các lớp trước khi khóa'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-semibold shadow-elevation-1 transition-all active:scale-[0.98] ${
              canLockAll
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
                {closureStats.approved}/{closureStats.total}
              </span>{' '}
              lớp
              {closureStats.locked > 0 && (
                <span className="ml-2 text-label-sm text-[#334155]">
                  · {closureStats.locked} lớp đã khóa
                </span>
              )}
            </span>
            <span className="text-label-sm font-semibold text-[#004ac6]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {approvedPct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${approvedPct}%`,
                background: approvedPct === 100 ? '#16a34a' : '#004ac6',
              }}
              role="progressbar"
              aria-valuenow={approvedPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {/* Stat chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium bg-[#f0fdf4] text-[#15803d] border-[#86efac]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Đã duyệt: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{closureStats.approved}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]">
              <span className="material-symbols-outlined text-[14px]">inbox</span>
              Chờ duyệt: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{closureStats.submitted}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium bg-[#fff7ed] text-[#c2410c] border-[#fdba74]">
              <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
              Chưa nộp: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{closureStats.pending}</strong>
            </span>
            {closureStats.locked > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-medium bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Đã khóa: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{closureStats.locked}</strong>
              </span>
            )}
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
              {gradeBookList.map((row) => (
                <tr key={row.classId} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '52px' }}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="font-semibold text-[#0f172a]">{row.className}</span>
                  </td>
                  <td className="px-4 py-2 text-[#334155] whitespace-nowrap">{row.gvcnName}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="px-4 py-2 text-center text-body-sm text-[#64748b] whitespace-nowrap">
                    {fmtDate(row.submittedAt)}
                  </td>
                  <td className="px-4 py-2 text-center text-body-sm text-[#64748b] whitespace-nowrap">
                    {fmtDate(row.approvedAt)}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {row.status === 'submitted' ? (
                      <button
                        type="button"
                        disabled={approvingId === row.classId}
                        onClick={() => handleApprove(row.classId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-label-sm font-medium transition-all"
                      >
                        {approvingId === row.classId ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">draw</span>
                        )}
                        Ký duyệt
                      </button>
                    ) : row.status === 'approved' || row.status === 'locked' ? (
                      <span className="inline-flex items-center gap-1 text-label-sm text-[#15803d] font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Đã xong
                      </span>
                    ) : (
                      <span className="text-label-sm text-[#94a3b8]">GV chưa nộp</span>
                    )}
                  </td>
                </tr>
              ))}
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
      {activeTab === 'hocluc' && <HoclucTab />}
      {activeTab === 'chatso' && <ChatSoTab />}

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
              Khóa sổ điểm học kỳ {selectedSemester} — Năm học {selectedYear}
            </p>
            <p className="text-body-sm text-[#64748b] leading-relaxed">
              Hành động này sẽ <strong className="text-[#0b1c30]">khóa toàn bộ sổ điểm</strong> của{' '}
              <strong className="text-[#0b1c30]">{closureStats.total} lớp</strong> và{' '}
              <strong className="text-[#dc2626]">không thể hoàn tác</strong>.
              Sau khi khóa, không ai có thể chỉnh sửa điểm số nữa.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={() => setIsLockModalOpen(false)}
              disabled={lockingAll}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] disabled:opacity-60 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleLockAll}
              disabled={lockingAll}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold transition-all"
            >
              {lockingAll ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Đang khóa...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Xác nhận khóa sổ
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



