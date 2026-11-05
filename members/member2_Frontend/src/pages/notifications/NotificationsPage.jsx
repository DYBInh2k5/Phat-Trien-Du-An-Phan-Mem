/**
 * NotificationsPage — Trang thông báo cho GVCN và BGH
 *
 * Hiển thị danh sách thông báo, đánh dấu đã đọc khi nhấn.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchNotifications, markNotificationRead } from '../../api/stubs.js';
import { ROLES } from '../../constants/roles.js';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TYPE_CONFIG = {
  closure_submitted: { icon: 'inbox',            label: 'Nộp sổ điểm',    color: 'text-[#2563eb]',  bg: 'bg-[#eff4ff]' },
  unlock_request:    { icon: 'lock_open',         label: 'Xin mở khóa',    color: 'text-[#c2410c]',  bg: 'bg-[#fff7ed]' },
  unlock_approved:   { icon: 'check_circle',      label: 'Mở khóa được duyệt', color: 'text-[#15803d]', bg: 'bg-[#f0fdf4]' },
  system:            { icon: 'notifications',     label: 'Hệ thống',       color: 'text-[#475569]',  bg: 'bg-[#f8fafc]' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

function getSenderLabel(notification) {
  const role = notification.senderRole ?? notification.sender_role;
  if (role === ROLES.BGH || role === 'BGH')   return 'Ban Giám Hiệu';
  if (role === ROLES.GVCN || role === 'GVCN') return 'Giáo viên Chủ Nhiệm';
  if (role === ROLES.GV || role === 'GV')     return 'Giáo viên';
  return 'Hệ thống';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const [searchText,  setSearchText]  = useState('');
  const [filterType,  setFilterType]  = useState('all');
  const [filterRead,  setFilterRead]  = useState('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications();
        if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải thông báo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function handleCardClick(notification) {
    const readAt = notification.readAt ?? notification.read_at;
    if (readAt) return; // đã đọc rồi

    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, readAt: new Date().toISOString(), read_at: new Date().toISOString() }
            : n
        )
      );
    } catch {
      // Lỗi đọc không block UX
    }
  }

  const unreadCount = notifications.filter((n) => !(n.readAt ?? n.read_at)).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = searchText.trim().toLowerCase();
      if (q && !n.title?.toLowerCase().includes(q) && !n.content?.toLowerCase().includes(q)) return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (filterRead === 'unread' && (n.readAt ?? n.read_at)) return false;
      if (filterRead === 'read'   && !(n.readAt ?? n.read_at)) return false;
      return true;
    });
  }, [notifications, searchText, filterType, filterRead]);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Thông báo</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            {loading
              ? 'Đang tải thông báo...'
              : unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : 'Tất cả thông báo đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dc2626] text-white text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {/* ── Search & Filter bar ── */}
      <div className="flex flex-wrap gap-3 pb-2">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#94a3b8]" aria-hidden="true">search</span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung..."
            className="w-full border border-[#e2e8f0] rounded-lg pl-9 pr-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
          />
        </div>
        {/* Lọc loại */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
        >
          <option value="all">Tất cả loại</option>
          <option value="closure_submitted">Nộp sổ điểm</option>
          <option value="unlock_request">Xin mở khóa</option>
          <option value="unlock_approved">Mở khóa được duyệt</option>
          <option value="system">Hệ thống</option>
        </select>
        {/* Lọc trạng thái đọc */}
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unread">Chưa đọc</option>
          <option value="read">Đã đọc</option>
        </select>
        {/* Số kết quả */}
        {(searchText || filterType !== 'all' || filterRead !== 'all') && (
          <span className="inline-flex items-center text-body-sm text-[#64748b] self-center">
            {filteredNotifications.length} kết quả
          </span>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
        </div>
      )}

      {/* ── Content ── */}
      <div className="space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : notifications.length === 0 ? (
          /* Empty state - chưa có dữ liệu */
          <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
            <span className="material-symbols-outlined text-[56px] mb-4">notifications_none</span>
            <p className="text-body-md font-medium">Chưa có thông báo nào</p>
            <p className="text-body-sm mt-1">Thông báo từ hệ thống và Ban Giám Hiệu sẽ xuất hiện ở đây.</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty state - không có kết quả filter */
          <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
            <span className="material-symbols-outlined text-[56px] mb-4">search_off</span>
            <p className="text-body-md font-medium">Không tìm thấy thông báo phù hợp</p>
            <p className="text-body-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const readAt    = notification.readAt ?? notification.read_at;
            const sentAt    = notification.sentAt ?? notification.sent_at;
            const typeCfg   = getTypeConfig(notification.type);
            const isUnread  = !readAt;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleCardClick(notification)}
                className={`w-full text-left bg-white rounded-xl border transition-all hover:shadow-md ${
                  isUnread
                    ? 'border-[#004ac6] shadow-elevation-1'
                    : 'border-[#e2e8f0] opacity-80'
                }`}
                aria-label={`Thông báo: ${notification.title}${isUnread ? ' (chưa đọc)' : ''}`}
              >
                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeCfg.bg}`}>
                    <span className={`material-symbols-outlined text-[20px] ${typeCfg.color}`}>{typeCfg.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className={`text-body-sm font-semibold ${isUnread ? 'text-[#0b1c30]' : 'text-[#475569]'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dc2626] text-white text-[11px] font-semibold">
                            Chưa đọc
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${typeCfg.bg} ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                      </div>
                    </div>

                    {notification.content && (
                      <p className="text-body-sm text-[#64748b] mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#94a3b8]">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {getSenderLabel(notification)}
                      </span>
                      {(notification.relatedClass ?? notification.related_class) && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">groups</span>
                          Lớp {notification.relatedClass ?? notification.related_class}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {fmtDateTime(sentAt)}
                      </span>
                      {readAt && (
                        <span className="inline-flex items-center gap-1 text-[#15803d]">
                          <span className="material-symbols-outlined text-[13px]">done_all</span>
                          Đã đọc lúc {fmtDateTime(readAt)}
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
    </div>
  );
}
