/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/bgh/AuditLogsPage.jsx
 * Vai trò: Trang Nhật Ký Kiểm Toán (Audit Trail) dành cho Ban Giám Hiệu
 * Kiến trúc: React Page Component — kết nối GET /api/audit-logs
 * Mô tả:
 *   - Hiển thị toàn bộ lịch sử hành động hệ thống (sửa điểm, xóa học sinh, import, ...).
 *   - Bộ lọc theo: action, username, entity, khoảng ngày (dateFrom → dateTo).
 *   - Xuất Excel danh sách nhật ký hiện tại.
 *   - Chỉ dành cho role BGH — route được bảo vệ bởi ProtectedRoute.
 * Tác giả: Nhóm Đồ Án PTDA PM — member2_Frontend
 * Ngày tạo: 28/11/2026
 * ==============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client.js';
import { exportToExcel } from '../../utils/exportEngine.js';

// ─── Hằng số bộ lọc ───────────────────────────────────────────────────────────

/**
 * Danh sách action phổ biến để hiển thị trong dropdown bộ lọc.
 * Thêm vào đây khi hệ thống bổ sung action mới.
 */
const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'UPDATE_GRADE',      label: 'Sửa điểm' },
  { value: 'LOCK_GRADEBOOK',    label: 'Khóa sổ điểm' },
  { value: 'UNLOCK_GRADEBOOK',  label: 'Mở khóa sổ điểm' },
  { value: 'DELETE_STUDENT',    label: 'Xóa học sinh' },
  { value: 'IMPORT_STUDENTS',   label: 'Import học sinh' },
  { value: 'UPDATE_CONDUCT',    label: 'Cập nhật hạnh kiểm' },
  { value: 'DELETE_GRADE',      label: 'Xóa điểm' },
];

/** Màu badge theo loại action */
const ACTION_BADGE_STYLES = {
  UPDATE_GRADE:     'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
  LOCK_GRADEBOOK:   'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  UNLOCK_GRADEBOOK: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  DELETE_STUDENT:   'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  IMPORT_STUDENTS:  'bg-[#eff4ff] text-[#2563eb] border-[#bfdbfe]',
  UPDATE_CONDUCT:   'bg-[#fdf4ff] text-[#9333ea] border-[#e9d5ff]',
};

function ActionBadge({ action }) {
  const style = ACTION_BADGE_STYLES[action] || 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]';
  const label = ACTION_OPTIONS.find(o => o.value === action)?.label || action;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
      {label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Định dạng timestamp ISO → chuỗi ngày giờ tiếng Việt.
 * @param {string} iso - Chuỗi ISO 8601
 * @returns {string}
 */
function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * Hiển thị giá trị JSON ngắn gọn trong ô bảng.
 * Nếu là object: in ra các cặp key: value trên từng dòng.
 * @param {any} val
 * @returns {string}
 */
function formatJsonValue(val) {
  if (val == null) return '—';
  if (typeof val === 'string') return val;
  try {
    const obj = typeof val === 'object' ? val : JSON.parse(val);
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n');
  } catch {
    return String(val);
  }
}

/** Skeleton cho một dòng bảng khi đang tải */
function SkeletonRow() {
  return (
    <tr>
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterAction,   setFilterAction]   = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [filterEntity,   setFilterEntity]   = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');

  // ── Data state ────────────────────────────────────────────────────────────
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Detail expanded row ───────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState(null);

  /**
   * Gọi GET /api/audit-logs với các bộ lọc hiện tại.
   * API đã yêu cầu role BGH (server trả 403 nếu không phải BGH).
   */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterAction)   params.set('action',   filterAction);
      if (filterUsername) params.set('user',      filterUsername);
      if (filterEntity)   params.set('entity',    filterEntity);
      if (filterDateFrom) params.set('dateFrom',  filterDateFrom);
      if (filterDateTo)   params.set('dateTo',    filterDateTo);

      const qs = params.toString();
      const res = await apiClient(`/audit-logs${qs ? '?' + qs : ''}`);
      // Backend trả { success, count, data }
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Không thể tải nhật ký kiểm toán.');
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterUsername, filterEntity, filterDateFrom, filterDateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /**
   * Xuất danh sách nhật ký hiện tại ra file Excel.
   */
  function handleExport() {
    const headers = ['ID', 'Thời gian', 'Hành động', 'Người thực hiện', 'Vai trò', 'Thực thể', 'ID thực thể', 'Giá trị cũ', 'Giá trị mới', 'Địa chỉ IP'];
    const rows = logs.map(log => [
      log.id,
      formatDateTime(log.timestamp),
      log.action,
      log.user    || log.username || '—',
      log.role    || '—',
      log.entity  || '—',
      log.entityId ?? '—',
      log.previousValue != null ? JSON.stringify(log.previousValue) : '—',
      log.newValue      != null ? JSON.stringify(log.newValue)      : '—',
      log.ipAddress     || '—',
    ]);
    exportToExcel('NhatKy_KiemToan_HTQLLH', 'AuditLogs', headers, rows);
  }

  function resetFilters() {
    setFilterAction(''); setFilterUsername(''); setFilterEntity('');
    setFilterDateFrom(''); setFilterDateTo('');
  }

  const hasActiveFilter = filterAction || filterUsername || filterEntity || filterDateFrom || filterDateTo;

  const inputCls = 'px-3 py-2 text-body-sm text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition';

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Nhật ký Kiểm toán</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Lịch sử toàn bộ hành động hệ thống — sửa điểm, xóa học sinh, khóa sổ điểm, ...
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={fetchLogs} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-label-sm font-medium text-[#475569] bg-[#f1f5f9] border border-[#e2e8f0] hover:bg-[#e2e8f0] transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
            Làm mới
          </button>
          <button type="button" onClick={handleExport} disabled={loading || logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-label-sm font-semibold text-[#0369a1] bg-[#f0f9ff] border border-[#bae6fd] hover:bg-[#e0f2fe] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* ── Bộ lọc ── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Lọc theo hành động */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-medium text-[#334155]">Hành động</label>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className={inputCls}>
              {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Lọc theo username */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-medium text-[#334155]">Người thực hiện</label>
            <input type="text" value={filterUsername} onChange={e => setFilterUsername(e.target.value)}
              placeholder="VD: admin, teacher1..."
              className={`${inputCls} w-44`} />
          </div>

          {/* Lọc theo thực thể */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-medium text-[#334155]">Thực thể</label>
            <input type="text" value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
              placeholder="VD: students, grade_books..."
              className={`${inputCls} w-44`} />
          </div>

          {/* Lọc theo khoảng ngày */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-medium text-[#334155]">Từ ngày</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-medium text-[#334155]">Đến ngày</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className={inputCls} />
          </div>

          {/* Nút xóa bộ lọc */}
          {hasActiveFilter && (
            <button type="button" onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-label-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] hover:bg-[#fee2e2] transition-colors self-end">
              <span className="material-symbols-outlined text-[16px]">close</span>
              Xóa bộ lọc
            </button>
          )}

          {/* Số bản ghi */}
          <span className="ml-auto text-label-sm text-[#94a3b8] self-end pb-2">
            {loading ? 'Đang tải...' : `${logs.length} bản ghi`}
          </span>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button onClick={fetchLogs} className="text-label-sm underline hover:no-underline">Thử lại</button>
        </div>
      )}

      {/* ── Bảng nhật ký ── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-label-sm">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr className="text-left text-[#475569]">
                <th className="px-4 py-3 font-semibold w-8">#</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Hành động</th>
                <th className="px-4 py-3 font-semibold">Người thực hiện</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Thực thể</th>
                <th className="px-4 py-3 font-semibold">ID thực thể</th>
                <th className="px-4 py-3 font-semibold">Địa chỉ IP</th>
                <th className="px-4 py-3 font-semibold w-10">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-[#94a3b8]">
                    <span className="material-symbols-outlined text-[40px] block mb-2">manage_search</span>
                    <p className="text-body-sm font-medium text-[#475569]">Không có nhật ký nào</p>
                    <p className="text-label-sm mt-1">Thử thay đổi bộ lọc</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <>
                    <tr key={log.id ?? idx}
                      className={`hover:bg-[#fafafa] transition-colors ${expandedId === (log.id ?? idx) ? 'bg-[#fffbeb]' : ''}`}>
                      <td className="px-4 py-3 text-[#94a3b8] font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#334155] font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3 font-medium text-[#0f172a]">
                        {log.user || log.username || '—'}
                      </td>
                      <td className="px-4 py-3 text-[#64748b]">{log.role || '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#334155]">{log.entity || '—'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#64748b]">
                        {log.entityId ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#94a3b8]">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(log.previousValue != null || log.newValue != null) && (
                          <button type="button"
                            onClick={() => setExpandedId(prev => prev === (log.id ?? idx) ? null : (log.id ?? idx))}
                            className="p-1 rounded-md text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff4ff] transition-colors"
                            aria-label="Xem chi tiết giá trị">
                            <span className="material-symbols-outlined text-[18px]">
                              {expandedId === (log.id ?? idx) ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Dòng mở rộng: hiển thị giá trị cũ → mới */}
                    {expandedId === (log.id ?? idx) && (
                      <tr key={`detail-${log.id ?? idx}`} className="bg-[#fffbeb]">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Giá trị cũ */}
                            <div>
                              <p className="text-label-sm font-semibold text-[#b45309] mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">history</span>
                                Giá trị cũ (previousValue)
                              </p>
                              {log.previousValue != null ? (
                                <pre className="text-[11px] bg-[#fefce8] border border-[#fde68a] rounded-lg p-3 text-[#78350f] whitespace-pre-wrap break-all font-mono max-h-40 overflow-auto">
                                  {formatJsonValue(log.previousValue)}
                                </pre>
                              ) : (
                                <p className="text-label-sm text-[#94a3b8] italic">Không có giá trị cũ</p>
                              )}
                            </div>
                            {/* Giá trị mới */}
                            <div>
                              <p className="text-label-sm font-semibold text-[#15803d] mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">update</span>
                                Giá trị mới (newValue)
                              </p>
                              {log.newValue != null ? (
                                <pre className="text-[11px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 text-[#14532d] whitespace-pre-wrap break-all font-mono max-h-40 overflow-auto">
                                  {formatJsonValue(log.newValue)}
                                </pre>
                              ) : (
                                <p className="text-label-sm text-[#94a3b8] italic">Không có giá trị mới</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer info ── */}
      {!loading && logs.length > 0 && (
        <p className="text-label-sm text-[#94a3b8] text-center">
          Hiển thị {logs.length} bản ghi nhật ký gần nhất · Dữ liệu được ghi vào bảng{' '}
          <span className="font-mono font-semibold text-[#475569]">audit_logs</span> (PostgreSQL Table 18)
        </p>
      )}
    </div>
  );
}
