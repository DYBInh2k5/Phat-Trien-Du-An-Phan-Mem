/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/notifications/NotificationsPage.jsx
 * Vai trò: Trang Thông Báo (Notifications Page)
 * Tính năng mới:
 *   - Nút "Đánh dấu tất cả đã đọc" → PATCH /api/notifications/read-all
 *     → unreadCount về 0 ngay lập tức (optimistic update)
 *   - Modal "Tạo thông báo mới" dành riêng BGH:
 *     → Chọn Khối (10/11/12), Lớp cụ thể (10A1...), Vai trò (GV/GVCN/HS/PH/Tất cả)
 *     → POST /api/notifications/broadcast
 * Tác giả: Nhóm Đồ Án PTDA PM — member2_Frontend
 * Ngày cập nhật: 28/11/2026
 * ==============================================================================
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
} from '../../api/stubs.js';
import { fetchClasses } from '../../api/stubs.js';
import { ROLES } from '../../constants/roles.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../../components/shared/Modal.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Định dạng ngày giờ tiếng Việt.
 * @param {string} iso
 */
function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

/** Cấu hình icon/màu theo loại thông báo */
const TYPE_CONFIG = {
  closure_submitted: { icon: 'inbox',        label: 'Nộp sổ điểm',         color: 'text-[#2563eb]',  bg: 'bg-[#eff4ff]' },
  unlock_request:    { icon: 'lock_open',    label: 'Xin mở khóa',          color: 'text-[#c2410c]',  bg: 'bg-[#fff7ed]' },
  unlock_approved:   { icon: 'check_circle', label: 'Mở khóa được duyệt',   color: 'text-[#15803d]',  bg: 'bg-[#f0fdf4]' },
  broadcast:         { icon: 'campaign',     label: 'Thông báo chính thức',  color: 'text-[#7c3aed]',  bg: 'bg-[#f5f3ff]' },
  system:            { icon: 'notifications', label: 'Hệ thống',             color: 'text-[#475569]',  bg: 'bg-[#f8fafc]' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

function getSenderLabel(notification) {
  const r = notification.senderRole ?? notification.sender_role;
  if (r === 'BGH')  return 'Ban Giám Hiệu';
  if (r === 'GVCN') return 'Giáo viên Chủ Nhiệm';
  if (r === 'GV')   return 'Giáo viên';
  return 'Hệ thống';
}

/** Skeleton card khi loading */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#e2e8f0] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#e2e8f0] rounded w-2/3" />
        <div className="h-3 bg-[#e2e8f0] rounded w-full" />
        <div className="h-3 bg-[#e2e8f0] rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── BroadcastModal ───────────────────────────────────────────────────────────

/**
 * Modal tạo thông báo broadcast — chỉ hiển thị cho BGH.
 *
 * @param {{ isOpen, classes, onClose, onSent }} props
 *   - classes: danh sách lớp để chọn trong dropdown
 *   - onSent: callback sau khi gửi thành công
 */
function BroadcastModal({ isOpen, classes, onClose, onSent }) {
  const [form, setForm] = useState({
    title:         '',
    content:       '',
    targetType:    'role',   // 'role' | 'grade' | 'class' | 'all'
    targetRole:    'GV',
    targetGrade:   '10',
    specificClass: '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    if (isOpen) { setSendError(null); setSending(false); }
  }, [isOpen]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  /**
   * Xây dựng payload gửi lên API từ form state.
   */
  function buildPayload() {
    const base = { title: form.title.trim(), content: form.content.trim() || undefined };
    if (form.targetType === 'all')   return { ...base, targetRole: 'ALL' };
    if (form.targetType === 'role')  return { ...base, targetRole: form.targetRole };
    if (form.targetType === 'grade') return { ...base, targetGrade: form.targetGrade };
    if (form.targetType === 'class') return { ...base, specificClass: form.specificClass };
    return base;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setSendError('Tiêu đề không được để trống.'); return; }
    if (form.targetType === 'class' && !form.specificClass) { setSendError('Vui lòng chọn lớp cụ thể.'); return; }

    setSending(true);
    setSendError(null);
    try {
      await broadcastNotification(buildPayload());
      onClose();
      if (onSent) onSent();
    } catch (err) {
      setSendError(err.message || 'Gửi thông báo thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  }

  /**
   * Label mô tả nhóm nhận dùng trong preview.
   */
  function recipientLabel() {
    if (form.targetType === 'all')   return 'Toàn trường (tất cả vai trò)';
    if (form.targetType === 'role')  return { GV: 'Giáo viên Bộ môn', GVCN: 'Giáo viên Chủ Nhiệm', HS: 'Học sinh', PH: 'Phụ huynh' }[form.targetRole] ?? form.targetRole;
    if (form.targetType === 'grade') return `Toàn khối ${form.targetGrade}`;
    if (form.targetType === 'class') return form.specificClass ? `Lớp ${form.specificClass}` : '(chưa chọn lớp)';
    return '—';
  }

  const inputCls = 'w-full px-3 py-2 text-[13px] text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition';
  const radioCls = (val) => `flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-[13px] font-medium ${
    form.targetType === val
      ? 'border-[#2563eb] bg-[#eff4ff] text-[#2563eb]'
      : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
  }`;

  return (
    <Modal isOpen={isOpen} onClose={sending ? () => {} : onClose} title="Tạo thông báo mới" size="lg">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Lỗi */}
        {sendError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[13px]" role="alert">
            <span className="material-symbols-outlined text-[17px]">error</span>
            {sendError}
          </div>
        )}

        {/* Tiêu đề */}
        <div>
          <label htmlFor="bc-title" className="block text-[12px] font-semibold text-[#334155] mb-1.5">
            Tiêu đề <span className="text-[#dc2626]">*</span>
          </label>
          <input id="bc-title" name="title" type="text" required
            value={form.title} onChange={handleChange}
            placeholder="VD: Thông báo nghỉ Tết Nguyên Đán 2025"
            className={inputCls} />
        </div>

        {/* Nội dung */}
        <div>
          <label htmlFor="bc-content" className="block text-[12px] font-semibold text-[#334155] mb-1.5">
            Nội dung chi tiết
          </label>
          <textarea id="bc-content" name="content" rows={3}
            value={form.content} onChange={handleChange}
            placeholder="Nội dung thông báo đầy đủ (tùy chọn)..."
            className={`${inputCls} resize-none`} />
        </div>

        {/* Nhóm nhận */}
        <div>
          <p className="text-[12px] font-semibold text-[#334155] mb-2">
            Gửi tới <span className="text-[#dc2626]">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { val: 'all',   icon: 'public',  label: 'Toàn trường' },
              { val: 'role',  icon: 'badge',   label: 'Theo vai trò' },
              { val: 'grade', icon: 'school',  label: 'Theo khối' },
              { val: 'class', icon: 'class',   label: 'Theo lớp' },
            ].map(opt => (
              <label key={opt.val} className={radioCls(opt.val)}>
                <input type="radio" name="targetType" value={opt.val}
                  checked={form.targetType === opt.val}
                  onChange={handleChange} className="sr-only" />
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </label>
            ))}
          </div>

          {/* Sub-options theo targetType */}
          {form.targetType === 'role' && (
            <div>
              <label className="block text-[11px] font-medium text-[#64748b] mb-1">Chọn vai trò</label>
              <select name="targetRole" value={form.targetRole} onChange={handleChange} className={inputCls}>
                <option value="GV">Giáo viên Bộ môn (GV)</option>
                <option value="GVCN">Giáo viên Chủ Nhiệm (GVCN)</option>
                <option value="HS">Học sinh (HS)</option>
                <option value="PH">Phụ huynh (PH)</option>
              </select>
            </div>
          )}
          {form.targetType === 'grade' && (
            <div>
              <label className="block text-[11px] font-medium text-[#64748b] mb-1">Chọn khối lớp</label>
              <div className="flex gap-2">
                {['10', '11', '12'].map(g => (
                  <label key={g} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border cursor-pointer text-[13px] font-semibold transition-colors ${
                    form.targetGrade === g
                      ? 'border-[#2563eb] bg-[#eff4ff] text-[#2563eb]'
                      : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
                  }`}>
                    <input type="radio" name="targetGrade" value={g}
                      checked={form.targetGrade === g} onChange={handleChange} className="sr-only" />
                    Khối {g}
                  </label>
                ))}
              </div>
            </div>
          )}
          {form.targetType === 'class' && (
            <div>
              <label className="block text-[11px] font-medium text-[#64748b] mb-1">Chọn lớp cụ thể</label>
              <select name="specificClass" value={form.specificClass} onChange={handleChange} className={inputCls}>
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Preview nhóm nhận */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[12px]">
          <span className="material-symbols-outlined text-[16px] text-[#2563eb]" aria-hidden="true">send</span>
          <span className="text-[#64748b]">Sẽ gửi đến:</span>
          <span className="font-semibold text-[#0f172a]">{recipientLabel()}</span>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
          <button type="button" onClick={onClose} disabled={sending}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors disabled:opacity-60">
            Hủy
          </button>
          <button type="submit" disabled={sending}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {sending
              ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" aria-hidden="true" />Đang gửi...</>
              : <><span className="material-symbols-outlined text-[16px]" aria-hidden="true">send</span>Gửi thông báo</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { role } = useAuth();
  const isBGH = role === ROLES.BGH || role === 'BGH';

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [classes,       setClasses]       = useState([]);

  const [searchText,  setSearchText]  = useState('');
  const [filterType,  setFilterType]  = useState('all');
  const [filterRead,  setFilterRead]  = useState('all');

  // Modal broadcast
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  // Toast
  const [toast, setToast] = useState(null);
  // Read-all loading
  const [markingAll, setMarkingAll] = useState(false);

  /**
   * Tải danh sách thông báo từ API.
   */
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchNotifications()
      .then(d => { if (!cancelled) setNotifications(Array.isArray(d) ? d : []); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // Tải danh sách lớp cho modal broadcast
    fetchClasses().then(raw => {
      if (!raw) return;
      setClasses((Array.isArray(raw) ? raw : []).map(c => ({
        id:   c.class_name || c.className || String(c.id),
        name: c.class_name || c.className || String(c.id),
      })));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /**
   * Hiển thị toast tự ẩn 3s.
   */
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  /**
   * Click vào thông báo → đánh dấu đã đọc (nếu chưa).
   */
  async function handleCardClick(notif) {
    if (notif.readAt ?? notif.read_at) return;
    try {
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n =>
        n.id === notif.id
          ? { ...n, readAt: new Date().toISOString(), read_at: new Date().toISOString() }
          : n
      ));
    } catch { /* không block UX */ }
  }

  /**
   * Đánh dấu tất cả đã đọc — optimistic update ngay lập tức.
   */
  async function handleMarkAllRead() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    // Optimistic: cập nhật UI ngay
    const now = new Date().toISOString();
    setNotifications(prev => prev.map(n =>
      (n.readAt ?? n.read_at) ? n : { ...n, readAt: now, read_at: now }
    ));
    try {
      await markAllNotificationsRead();
      showToast('Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (err) {
      // Rollback optimistic nếu lỗi
      await load();
      showToast(err.message || 'Đánh dấu thất bại.', 'error');
    } finally {
      setMarkingAll(false);
    }
  }

  // Computed
  const unreadCount = notifications.filter(n => !(n.readAt ?? n.read_at)).length;

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const q = searchText.trim().toLowerCase();
      if (q && !n.title?.toLowerCase().includes(q) && !n.content?.toLowerCase().includes(q)) return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (filterRead === 'unread' && (n.readAt ?? n.read_at)) return false;
      if (filterRead === 'read'   && !(n.readAt ?? n.read_at)) return false;
      return true;
    });
  }, [notifications, searchText, filterType, filterRead]);

  const selectCls = 'border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] text-[#0f172a] bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition';

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0f172a]">Thông báo</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            {loading ? 'Đang tải...'
              : unreadCount > 0 ? `${unreadCount} thông báo chưa đọc`
              : 'Tất cả thông báo đã đọc'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge chưa đọc */}
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef2f2] text-[#b91c1c] text-[12px] font-semibold border border-[#fecaca]">
              <span className="material-symbols-outlined text-[15px]">notifications_active</span>
              {unreadCount} chưa đọc
            </span>
          )}

          {/* Nút đánh dấu tất cả đã đọc */}
          {unreadCount > 0 && (
            <button type="button" onClick={handleMarkAllRead} disabled={markingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {markingAll
                ? <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#bbf7d0] border-t-[#15803d] rounded-full" aria-hidden="true" />
                : <span className="material-symbols-outlined text-[17px]" aria-hidden="true">done_all</span>
              }
              Đánh dấu tất cả đã đọc
            </button>
          )}

          {/* Nút tạo thông báo — chỉ BGH */}
          {isBGH && (
            <button type="button" onClick={() => setBroadcastOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">campaign</span>
              Tạo thông báo mới
            </button>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border text-[13px] ${
          toast.type === 'error'
            ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
            : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
        }`} role="status">
          <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#94a3b8]" aria-hidden="true">search</span>
          <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung..."
            className="w-full border border-[#e2e8f0] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition" />
        </div>

        {/* Lọc loại */}
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
          <option value="all">Tất cả loại</option>
          <option value="broadcast">Thông báo chính thức</option>
          <option value="closure_submitted">Nộp sổ điểm</option>
          <option value="unlock_request">Xin mở khóa</option>
          <option value="unlock_approved">Mở khóa được duyệt</option>
          <option value="system">Hệ thống</option>
        </select>

        {/* Lọc trạng thái đọc */}
        <select value={filterRead} onChange={e => setFilterRead(e.target.value)} className={selectCls}>
          <option value="all">Tất cả trạng thái</option>
          <option value="unread">Chưa đọc</option>
          <option value="read">Đã đọc</option>
        </select>

        {/* Số kết quả + nút xóa filter */}
        {(searchText || filterType !== 'all' || filterRead !== 'all') && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#64748b]">{filtered.length} kết quả</span>
            <button type="button"
              onClick={() => { setSearchText(''); setFilterType('all'); setFilterRead('all'); }}
              className="text-[12px] text-[#2563eb] hover:underline">
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-[13px] font-medium flex-1">{error}</p>
          <button onClick={load} className="text-[12px] underline hover:no-underline">Thử lại</button>
        </div>
      )}

      {/* ── Danh sách thông báo ── */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
            <span className="material-symbols-outlined text-[56px] mb-4">notifications_none</span>
            <p className="text-[15px] font-medium text-[#475569]">Chưa có thông báo nào</p>
            <p className="text-[13px] mt-1">Thông báo từ hệ thống và BGH sẽ xuất hiện ở đây.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
            <span className="material-symbols-outlined text-[56px] mb-4">search_off</span>
            <p className="text-[15px] font-medium text-[#475569]">Không tìm thấy thông báo phù hợp</p>
            <p className="text-[13px] mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          filtered.map(notif => {
            const readAt   = notif.readAt ?? notif.read_at;
            const sentAt   = notif.sentAt ?? notif.sent_at;
            const typeCfg  = getTypeConfig(notif.type);
            const isUnread = !readAt;

            return (
              <button key={notif.id} type="button"
                onClick={() => handleCardClick(notif)}
                className={`w-full text-left bg-white rounded-xl border transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
                  isUnread ? 'border-[#2563eb] shadow-sm' : 'border-[#e2e8f0] opacity-80'
                }`}
                aria-label={`${notif.title}${isUnread ? ' (chưa đọc)' : ''}`}
              >
                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeCfg.bg}`}>
                    <span className={`material-symbols-outlined text-[20px] ${typeCfg.color}`} aria-hidden="true">{typeCfg.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className={`text-[14px] font-semibold ${isUnread ? 'text-[#0f172a]' : 'text-[#475569]'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2563eb] text-white text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            Chưa đọc
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${typeCfg.bg} ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                      </div>
                    </div>

                    {notif.content && (
                      <p className="text-[13px] text-[#64748b] mt-1 line-clamp-2">{notif.content}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#94a3b8]">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {getSenderLabel(notif)}
                      </span>
                      {(notif.relatedClass ?? notif.related_class) && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">groups</span>
                          Lớp {notif.relatedClass ?? notif.related_class}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {fmtDateTime(sentAt)}
                      </span>
                      {readAt && (
                        <span className="inline-flex items-center gap-1 text-[#15803d]">
                          <span className="material-symbols-outlined text-[13px]">done_all</span>
                          Đã đọc {fmtDateTime(readAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── Modal Broadcast ── */}
      <BroadcastModal
        isOpen={broadcastOpen}
        classes={classes}
        onClose={() => setBroadcastOpen(false)}
        onSent={() => {
          showToast('Thông báo đã được gửi thành công!');
          load(); // reload để hiển thị thông báo vừa gửi
        }}
      />
    </div>
  );
}
