/**
 * ParentCommunicationPage — Sổ liên lạc phụ huynh
 *
 * Hai tab chính:
 *   - "Thông báo"  : tạo và xem danh sách thông báo gửi phụ huynh (PH chỉ xem, không tạo)
 *   - "Trao đổi"   : thread chat phân quyền chặt chẽ theo role:
 *       + PH   : Chỉ thấy BGH và GVCN của các lớp mà con đang học
 *       + GVCN : Chỉ thấy phụ huynh của lớp mình chủ nhiệm
 *       + BGH  : Toàn quyền xem và trao đổi với phụ huynh toàn trường
 *
 * Dữ liệu: /api/communication/* — không dùng mockData.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import {
  fetchCommunicationPageData,
  fetchCommunicationStudents,
  fetchCommunicationContacts,
  sendCommunicationNotification,
  fetchMessageThread,
  sendMessageToThread,
} from '../../api/stubs.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  academic: 'Học vụ',
  absence:  'Vắng mặt',
  event:    'Sự kiện',
  general:  'Thông báo chung',
};

const TYPE_STYLES = {
  academic: 'bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]',
  absence:  'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]',
  event:    'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',
  general:  'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]',
};

const TYPE_ICONS = {
  academic: 'menu_book',
  absence:  'person_off',
  event:    'event',
  general:  'campaign',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function parentDisplayName(student) {
  if (student.parentName && student.parentName.trim()) return student.parentName;
  const parts = student.name ? student.name.trim().split(' ') : ['Học sinh'];
  return `PH: ${parts[parts.length - 1]} (phụ huynh)`;
}

function initials(name = '') {
  const parts = name.trim().split(' ');
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.general;
  const icon  = TYPE_ICONS[type]  ?? 'info';
  const label = TYPE_LABELS[type] ?? type;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${style}`}>
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

function NotificationCard({ notif }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-col gap-2 hover:shadow-elevation-2 transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={notif.type} />
          <StatusBadge status={notif.status} />
        </div>
        <span className="text-label-sm text-[#94a3b8] flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">schedule</span>
          {formatDate(notif.sentAt)}
        </span>
      </div>
      <h3 className="text-body-md font-semibold text-[#0b1c30] leading-snug line-clamp-1">{notif.title}</h3>
      <p className="text-body-sm text-[#475569] line-clamp-2 leading-relaxed">{notif.content}</p>
      {notif.recipients?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="material-symbols-outlined text-[14px] text-[#94a3b8]" aria-hidden="true">group</span>
          {notif.recipients.map((r) => (
            <span key={r} className="text-label-sm bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">{r}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 space-y-3">
      <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-1/3" />
      <div className="animate-pulse h-5 bg-[#e2e8f0] rounded w-3/4" />
      <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-full" />
    </div>
  );
}

/** Form tạo thông báo mới — chỉ GVCN / BGH */
function NotificationForm({ classes: classList, onSend, onCancel, isSending }) {
  const [formData, setFormData] = useState({ title: '', content: '', type: 'academic', recipients: [] });
  const [errors,   setErrors]   = useState({});

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev)   => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())           e.title      = 'Vui lòng nhập tiêu đề.';
    if (!formData.content.trim())         e.content    = 'Vui lòng nhập nội dung.';
    if (!formData.recipients.length)      e.recipients = 'Vui lòng chọn lớp nhận.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSend(formData);
    setFormData({ title: '', content: '', type: 'academic', recipients: [] });
    setErrors({});
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all ${
      errors[field] ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
    }`;

  return (
    <form onSubmit={handleSubmit} className="bg-[#f8f9ff] border border-[#c3c6d7] rounded-xl p-5 space-y-4" noValidate>
      <h3 className="text-headline-sm font-semibold text-[#0b1c30] flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-[#004ac6]" aria-hidden="true">edit_note</span>
        Tạo thông báo mới
      </h3>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-label-sm font-medium text-[#434655]">Tiêu đề <span className="text-[#ef4444]">*</span></label>
        <input type="text" value={formData.title} onChange={(e) => set('title', e.target.value)}
          placeholder="Nhập tiêu đề thông báo..." className={inputCls('title')} />
        {errors.title && <p className="text-label-sm text-[#ef4444] flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.title}</p>}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <label className="text-label-sm font-medium text-[#434655]">Nội dung <span className="text-[#ef4444]">*</span></label>
        <textarea rows={4} value={formData.content} onChange={(e) => set('content', e.target.value)}
          placeholder="Nhập nội dung thông báo..." className={`${inputCls('content')} resize-none`} />
        {errors.content && <p className="text-label-sm text-[#ef4444] flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.content}</p>}
      </div>

      {/* Type + Recipients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-label-sm font-medium text-[#434655]">Loại thông báo</label>
          <select value={formData.type} onChange={(e) => set('type', e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
            {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-sm font-medium text-[#434655]">Lớp nhận <span className="text-[#ef4444]">*</span></label>
          <select value={formData.recipients[0] ?? ''}
            onChange={(e) => set('recipients', e.target.value ? [e.target.value] : [])}
            className={`border rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all ${errors.recipients ? 'border-[#ef4444]' : 'border-[#e2e8f0]'}`}>
            <option value="">— Chọn lớp —</option>
            {classList.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
          {errors.recipients && <p className="text-label-sm text-[#ef4444] flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.recipients}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={isSending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-md shadow-elevation-2 transition-all">
          {isSending
            ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Đang gửi...</>
            : <><span className="material-symbols-outlined text-[18px]">send</span>Gửi thông báo</>}
        </button>
        <button type="button" onClick={onCancel} disabled={isSending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] active:scale-[0.99] disabled:opacity-60 text-[#334155] font-medium text-body-md transition-all">
          <span className="material-symbols-outlined text-[18px]">close</span>Huỷ
        </button>
      </div>
    </form>
  );
}

/** Danh sách người liên hệ cho Role PHỤ HUYNH */
function ContactListForParent({ contacts, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="animate-pulse w-10 h-10 rounded-full bg-[#e2e8f0]" />
            <div className="flex-1 space-y-1.5">
              <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-3/4" />
              <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const bghList = contacts?.bgh || [];
  const gvcnList = contacts?.gvcn || [];

  if (bghList.length === 0 && gvcnList.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-body-sm text-[#94a3b8]">
        Không tìm thấy người liên hệ (Ban Giám Hiệu hoặc GVCN).
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f1f5f9]">
      {/* 1. Nhóm Ban Giám Hiệu */}
      {bghList.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-[#f8f9ff] text-label-sm font-semibold text-[#434655] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">account_balance</span>
            Ban Giám Hiệu
          </div>
          <ul role="list" className="divide-y divide-[#f1f5f9]">
            {bghList.map((contact) => {
              const isSelected = contact.id === selectedId;
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(contact)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                      isSelected
                        ? 'bg-[#eff4ff] border-l-2 border-[#004ac6]'
                        : 'hover:bg-[#f8fafc] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative flex-none">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-label-md font-bold select-none ${
                          isSelected
                            ? 'bg-[#004ac6] text-white'
                            : 'bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] text-[#004ac6]'
                        }`}
                        aria-hidden="true"
                      >
                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                      </div>
                      {contact.hasUnread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#ef4444] rounded-full border-2 border-white shadow-xs animate-pulse ring-2 ring-red-200"
                          title={contact.unreadCount > 1 ? `Có ${contact.unreadCount} tin nhắn mới` : 'Có tin nhắn mới'}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-body-md font-semibold truncate ${isSelected ? 'text-[#004ac6]' : 'text-[#0b1c30]'}`}>
                          {contact.name}
                        </p>
                        {contact.hasUnread && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] flex-none animate-pulse shadow-xs"
                            title={contact.unreadCount > 1 ? `Có ${contact.unreadCount} tin nhắn mới` : 'Tin nhắn mới'}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                            {contact.unreadCount > 1 ? contact.unreadCount : 'Mới'}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#eff4ff] text-[#004ac6] border border-[#c3d2f6]">
                          BGH
                        </span>
                      </div>
                      <p className="text-label-sm text-[#64748b] truncate">{contact.title}</p>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6] ml-auto flex-none">
                        chevron_right
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 2. Nhóm Giáo viên chủ nhiệm */}
      {gvcnList.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-[#f8f9ff] text-label-sm font-semibold text-[#434655] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">school</span>
            Giáo viên chủ nhiệm
          </div>
          <ul role="list" className="divide-y divide-[#f1f5f9]">
            {gvcnList.map((contact) => {
              const isSelected = contact.id === selectedId;
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(contact)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                      isSelected
                        ? 'bg-[#eff4ff] border-l-2 border-[#004ac6]'
                        : 'hover:bg-[#f8fafc] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative flex-none">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-label-md font-bold select-none ${
                          isSelected
                            ? 'bg-[#004ac6] text-white'
                            : 'bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] text-[#565e74]'
                        }`}
                        aria-hidden="true"
                      >
                        {initials(contact.name)}
                      </div>
                      {contact.hasUnread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#ef4444] rounded-full border-2 border-white shadow-xs animate-pulse ring-2 ring-red-200"
                          title={contact.unreadCount > 1 ? `Có ${contact.unreadCount} tin nhắn mới` : 'Có tin nhắn mới'}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-body-md font-semibold truncate ${isSelected ? 'text-[#004ac6]' : 'text-[#0b1c30]'}`}>
                          {contact.name}
                        </p>
                        {contact.hasUnread && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] flex-none animate-pulse shadow-xs"
                            title={contact.unreadCount > 1 ? `Có ${contact.unreadCount} tin nhắn mới` : 'Tin nhắn mới'}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                            {contact.unreadCount > 1 ? contact.unreadCount : 'Mới'}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#f0fdf4] text-[#15803d] border border-[#86efac]">
                          GVCN {contact.className}
                        </span>
                      </div>
                      <p className="text-label-sm text-[#475569] truncate">
                        Con: <strong className="text-[#0b1c30]">{contact.studentName}</strong> (Lớp {contact.className})
                      </p>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6] ml-auto flex-none">
                        chevron_right
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Danh sách học sinh & phụ huynh bên trái cho GVCN / BGH */
function ParentList({ students: list, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="animate-pulse w-10 h-10 rounded-full bg-[#e2e8f0]" />
            <div className="flex-1 space-y-1.5">
              <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-3/4" />
              <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return <p className="px-4 py-8 text-center text-body-sm text-[#94a3b8]">Không có học sinh trong lớp này.</p>;
  }

  return (
    <ul role="list" className="divide-y divide-[#f1f5f9]">
      {list.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                isSelected
                  ? 'bg-[#eff4ff] border-l-2 border-[#004ac6]'
                  : 'hover:bg-[#f8fafc] border-l-2 border-transparent'
              }`}
            >
              {/* Avatar kèm icon chấm đỏ nổi bật khi có tin nhắn mới */}
              <div className="relative flex-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-label-md font-bold select-none ${
                    isSelected
                      ? 'bg-[#004ac6] text-white'
                      : 'bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] text-[#565e74]'
                  }`}
                  aria-hidden="true"
                >
                  {initials(s.name)}
                </div>
                {s.hasUnread && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#ef4444] rounded-full border-2 border-white shadow-xs animate-pulse ring-2 ring-red-200"
                    title={s.unreadCount > 1 ? `Có ${s.unreadCount} tin nhắn mới` : 'Có tin nhắn mới'}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-body-md truncate ${isSelected ? 'text-[#004ac6] font-semibold' : 'text-[#0b1c30] font-medium'}`}>
                    {s.name}
                  </p>
                  {/* Icon chấm đỏ + nhãn mới trên tên người dùng */}
                  {s.hasUnread && (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] flex-none animate-pulse shadow-xs"
                      title={s.unreadCount > 1 ? `Có ${s.unreadCount} tin nhắn mới` : 'Tin nhắn mới'}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                      {s.unreadCount > 1 ? s.unreadCount : 'Mới'}
                    </span>
                  )}
                </div>
                <p className="text-label-sm text-[#64748b] truncate">{parentDisplayName(s)}</p>
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-[18px] text-[#004ac6] ml-auto flex-none" aria-hidden="true">
                  chevron_right
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Bubble tin nhắn linh hoạt theo góc nhìn người dùng */
function ChatBubble({ message, isParent }) {
  const isMe = isParent
    ? message.from === 'ph'
    : (message.from === 'gv' || message.from === 'bgh');

  const timeStr = message.sentAt
    ? new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-body-sm leading-relaxed shadow-xs ${
          isMe
            ? 'bg-[#004ac6] text-white rounded-br-sm'
            : 'bg-[#f1f5f9] text-[#0b1c30] rounded-bl-sm border border-[#e2e8f0]'
        }`}
      >
        {message.text}
      </div>
      {timeStr && (
        <span className="text-[11px] text-[#94a3b8] px-1 mt-0.5 select-none">
          {timeStr}
        </span>
      )}
    </div>
  );
}

/** Thread hội thoại bên phải */
function ConversationThread({
  contact,
  messages,
  loadingThread,
  onSendMessage,
  isSendingMsg,
  isParent,
  isBGH,
  onSwitchBghChannel,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(contact, trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8f9ff]">
        <div className="flex items-center gap-3">
          <div
            className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] flex items-center justify-center text-label-md font-bold text-[#004ac6] select-none shadow-xs"
            aria-hidden="true"
          >
            {contact.role === 'BGH' ? (
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            ) : (
              initials(contact.name)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-body-md font-semibold text-[#0b1c30]">{contact.name}</p>
              {contact.role === 'BGH' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eff4ff] text-[#004ac6] border border-[#c3d2f6]">
                  Ban Giám Hiệu
                </span>
              )}
              {contact.role === 'GVCN' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f0fdf4] text-[#15803d] border border-[#86efac]">
                  GVCN {contact.className}
                </span>
              )}
              {contact.role === 'PH' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]">
                  Lớp {contact.className}
                </span>
              )}
            </div>
            <p className="text-label-sm text-[#64748b]">
              {isParent
                ? (contact.role === 'BGH' ? contact.title : `Con: ${contact.studentName} — Lớp ${contact.className}`)
                : isBGH
                  ? (contact.conversationType === 'BGH'
                      ? `Trao đổi trực tiếp Ban Giám Hiệu ↔ Phụ huynh em ${contact.studentName}`
                      : `Giám sát trao đổi GVCN ↔ Phụ huynh em ${contact.studentName}`)
                  : `${contact.title} • Mã HS: ${contact.studentId}`}
            </p>
          </div>
        </div>

        {/* Thanh chuyển kênh dành riêng cho Ban Giám Hiệu */}
        {isBGH && onSwitchBghChannel && (
          <div className="flex items-center gap-1 bg-[#e2e8f0]/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onSwitchBghChannel('BGH')}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                contact.conversationType === 'BGH'
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0b1c30] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">account_balance</span>
              Kênh Ban Giám Hiệu
            </button>
            <button
              type="button"
              onClick={() => onSwitchBghChannel('GVCN')}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                contact.conversationType === 'GVCN'
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0b1c30] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              Kênh GVCN ({contact.className})
            </button>
          </div>
        )}

        <span className="inline-flex items-center gap-1 text-label-sm bg-[#f0fdf4] text-[#15803d] border border-[#86efac] px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-pulse" />
          Đang hoạt động
        </span>
      </div>

      {/* Thông báo ngữ cảnh kênh cho BGH */}
      {isBGH && contact.conversationType === 'BGH' && (
        <div className="px-5 py-2 bg-[#eff4ff] text-[12px] text-[#004ac6] flex items-center gap-2 border-b border-[#c3d2f6]">
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">info</span>
          <span>
            Tin nhắn bạn gửi tại đây sẽ hiển thị trong khung <strong>"Ban Giám Hiệu"</strong> trên sổ liên lạc của Phụ huynh học sinh.
          </span>
        </div>
      )}

      {isBGH && contact.conversationType === 'GVCN' && (
        <div className="px-5 py-2 bg-[#fefce8] text-[12px] text-[#854d0e] flex items-center gap-2 border-b border-[#fef08a]">
          <span className="material-symbols-outlined text-[16px] text-[#ca8a04]">visibility</span>
          <span>
            Đang xem kênh trao đổi giữa <strong>Giáo viên chủ nhiệm lớp {contact.className}</strong> và Phụ huynh học sinh.
          </span>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 min-h-0 bg-[#fafafa]/50 chat-scrollbar">
        {loadingThread ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] gap-2">
            <span className="material-symbols-outlined text-[32px] text-[#cbd5e1] animate-spin">progress_activity</span>
            <p className="text-body-sm">Đang tải lịch sử trò chuyện...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-[#94a3b8]">
            <span className="material-symbols-outlined text-[42px] mb-2 text-[#cbd5e1]">chat_bubble_outline</span>
            <p className="text-body-sm font-medium text-[#475569]">Chưa có tin nhắn nào trong kênh này.</p>
            <p className="text-label-sm text-[#94a3b8] mt-0.5">Hãy nhập nội dung bên dưới để bắt đầu trao đổi!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble key={msg.id ?? idx} message={msg} isParent={isParent} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[#e2e8f0] bg-white flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn trao đổi... (Enter để gửi)"
          className="flex-1 border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all resize-none"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || isSendingMsg}
          aria-label="Gửi tin nhắn"
          className="flex-none inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all active:scale-95 shadow-xs"
        >
          {isSendingMsg ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">send</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParentCommunicationPage() {
  const { user, role } = useAuth();
  const isParent = role === 'PH';
  const isGVCN   = role === 'GVCN';
  const isBGH    = role === 'BGH';

  // ── Core state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('thongbao');

  // Notifications tab
  const [notifications, setNotifications] = useState([]);
  const [classes,       setClasses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [isFormOpen,    setIsFormOpen]    = useState(false);
  const [isSending,     setIsSending]     = useState(false);
  const [sendMessage,   setSendMessage]   = useState(null);

  // Trao đổi tab — Phụ huynh
  const [parentContacts,   setParentContacts]   = useState({ bgh: [], gvcn: [] });
  const [loadingContacts,  setLoadingContacts]  = useState(false);

  // Trao đổi tab — GVCN / BGH
  const [selectedClass,    setSelectedClass]    = useState('');
  const [classStudents,    setClassStudents]    = useState([]);
  const [loadingStudents,  setLoadingStudents]  = useState(false);

  // Active chat conversation (dùng chung cho cả 2 view)
  const [selectedContact,  setSelectedContact]  = useState(null);
  const [thread,           setThread]           = useState([]);
  const [loadingThread,    setLoadingThread]    = useState(false);
  const [isSendingMsg,     setIsSendingMsg]     = useState(false);

  // Search/filter state - tab Thông báo
  const [notifSearch,      setNotifSearch]      = useState('');
  const [notifFilterType,  setNotifFilterType]  = useState('all');
  const [notifFilterClass, setNotifFilterClass] = useState('all');

  // Search state - tab Trao đổi (GVCN/BGH)
  const [studentSearch, setStudentSearch] = useState('');

  // ── 1. Fetch dữ liệu khởi tạo trang ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommunicationPageData();
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setClasses(data.classes ?? []);
          if (data.classes?.length > 0) setSelectedClass(data.classes[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu sổ liên lạc.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Nếu là PH: Fetch danh bạ liên hệ (BGH + GVCN các lớp của con) ───────
  useEffect(() => {
    if (!isParent) return;

    let cancelled = false;
    setLoadingContacts(true);
    fetchCommunicationContacts()
      .then((data) => {
        if (!cancelled) {
          setParentContacts({
            bgh: data?.bgh || [],
            gvcn: data?.gvcn || [],
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách người liên hệ.');
      })
      .finally(() => {
        if (!cancelled) setLoadingContacts(false);
      });

    return () => { cancelled = true; };
  }, [isParent]);

  // ── 3. Nếu là GVCN/BGH: Fetch học sinh khi chọn lớp ────────────────────────
  useEffect(() => {
    if (isParent || !selectedClass) return;

    let cancelled = false;
    setLoadingStudents(true);
    setSelectedContact(null);
    setThread([]);

    fetchCommunicationStudents(selectedClass)
      .then((data) => { if (!cancelled) setClassStudents(data); })
      .catch(() => { if (!cancelled) setClassStudents([]); })
      .finally(() => { if (!cancelled) setLoadingStudents(false); });

    return () => { cancelled = true; };
  }, [isParent, selectedClass]);

  // ── 4. Chọn người liên hệ để mở thread chat ──────────────────────────────
  const handleSelectContact = useCallback(async (contact) => {
    setSelectedContact(contact);
    setThread([]);
    setLoadingThread(true);
    try {
      const msgs = await fetchMessageThread(contact.studentId, contact.conversationType || 'GVCN');
      setThread(msgs);
    } catch (err) {
      setError(err.message || 'Không thể tải tin nhắn hội thoại.');
      setThread([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  // Khi Phụ huynh chọn BGH hoặc GVCN
  const handleSelectParentContact = useCallback((contact) => {
    // Xóa ngay chấm đỏ của contact này
    setParentContacts((prev) => ({
      bgh: (prev.bgh || []).map((c) => (c.id === contact.id ? { ...c, hasUnread: false, unreadCount: 0 } : c)),
      gvcn: (prev.gvcn || []).map((c) => (c.id === contact.id ? { ...c, hasUnread: false, unreadCount: 0 } : c)),
    }));
    handleSelectContact(contact);
  }, [handleSelectContact]);

  // State kênh chat dành cho BGH (mặc định BGH: trao đổi trực tiếp Ban Giám hiệu ↔ Phụ huynh)
  const [bghActiveChannel, setBghActiveChannel] = useState('BGH');

  // Khi chọn học sinh trong view GVCN/BGH
  const handleSelectStudent = useCallback((student) => {
    // Xóa ngay chấm đỏ của học sinh này trên panel trái
    setClassStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, hasUnread: false, unreadCount: 0 } : s))
    );

    const contact = {
      id:               student.id,
      name:             student.name,
      title:            parentDisplayName(student),
      role:             'PH',
      conversationType: isBGH ? bghActiveChannel : 'GVCN',
      studentId:        student.id,
      studentName:      student.name,
      className:        student.className,
    };
    handleSelectContact(contact);
  }, [handleSelectContact, isBGH, bghActiveChannel]);

  // Chuyển kênh hội thoại cho BGH (Ban Giám Hiệu ↔ GVCN)
  const handleSwitchBghChannel = useCallback((channel) => {
    setBghActiveChannel(channel);
    if (selectedContact) {
      handleSelectContact({
        ...selectedContact,
        conversationType: channel,
      });
    }
  }, [selectedContact, handleSelectContact]);

  // ── 5. Polling tự động khi đang mở cuộc hội thoại (mỗi 3 giây) ─────────────
  useEffect(() => {
    if (!selectedContact?.studentId) return;

    const timer = setInterval(async () => {
      try {
        const msgs = await fetchMessageThread(
          selectedContact.studentId,
          selectedContact.conversationType || 'GVCN'
        );
        // Cập nhật thread mới nhất nếu có thay đổi
        setThread((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(msgs)) {
            return msgs;
          }
          return prev;
        });
      } catch {
        // Không block UI nếu một lần poll bị lỗi mạng
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedContact]);

  // ── 5b. Polling định kỳ cập nhật chấm đỏ tin nhắn mới cho danh sách ────────
  useEffect(() => {
    if (activeTab !== 'traodoi') return;

    const timer = setInterval(() => {
      if (isParent) {
        fetchCommunicationContacts()
          .then((data) => {
            if (data) {
              setParentContacts((prev) => ({
                bgh: (data.bgh || []).map((newC) => {
                  if (selectedContact?.id === newC.id) {
                    return { ...newC, hasUnread: false, unreadCount: 0 };
                  }
                  return newC;
                }),
                gvcn: (data.gvcn || []).map((newC) => {
                  if (selectedContact?.id === newC.id) {
                    return { ...newC, hasUnread: false, unreadCount: 0 };
                  }
                  return newC;
                }),
              }));
            }
          })
          .catch(() => {});
      } else if (selectedClass) {
        fetchCommunicationStudents(selectedClass)
          .then((data) => {
            if (Array.isArray(data)) {
              setClassStudents((prev) =>
                data.map((item) => {
                  if (selectedContact?.studentId === item.id) {
                    return { ...item, hasUnread: false, unreadCount: 0 };
                  }
                  return item;
                })
              );
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeTab, isParent, selectedClass, selectedContact]);

  // ── 6. Gửi thông báo mới (GVCN/BGH) ──────────────────────────────────────
  const handleSend = async (formData) => {
    setIsSending(true);
    setSendMessage(null);
    try {
      const notif = await sendCommunicationNotification({
        ...formData,
        senderId: user?.username ?? 'system',
      });
      setNotifications((prev) => [notif, ...prev]);
      setSendMessage({ type: 'success', text: 'Thông báo đã được gửi thành công!' });
      setIsFormOpen(false);
    } catch (err) {
      setSendMessage({ type: 'error', text: err.message || 'Lỗi khi gửi thông báo. Vui lòng thử lại.' });
    } finally {
      setIsSending(false);
    }
  };

  // ── 7. Gửi tin nhắn chat ─────────────────────────────────────────────────
  const handleSendChatMessage = useCallback(async (contact, text) => {
    setIsSendingMsg(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      from: isParent ? 'ph' : (isBGH ? 'bgh' : 'gv'),
      text,
      conversationType: contact.conversationType || 'GVCN',
      sentAt: new Date().toISOString(),
    };
    setThread((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessageToThread({
        studentId:        contact.studentId,
        className:        contact.className,
        fromRole:         isParent ? 'ph' : (isBGH ? 'bgh' : 'gv'),
        conversationType: contact.conversationType || 'GVCN',
        message:          text,
      });
      setThread((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
    } catch (err) {
      setThread((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(err.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSendingMsg(false);
    }
  }, [isParent, isBGH]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const q = notifSearch.trim().toLowerCase();
      if (q && !notif.title?.toLowerCase().includes(q) && !notif.content?.toLowerCase().includes(q)) return false;
      if (notifFilterType !== 'all' && notif.type !== notifFilterType) return false;
      if (notifFilterClass !== 'all' && !(notif.recipients ?? []).includes(notifFilterClass)) return false;
      return true;
    });
  }, [notifications, notifSearch, notifFilterType, notifFilterClass]);

  // Filtered students (GVCN/BGH)
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter((s) => s.name?.toLowerCase().includes(q));
  }, [classStudents, studentSearch]);

  const tabCls = (tab) =>
    `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-body-md font-medium transition-all ${
      activeTab === tab
        ? 'bg-[#004ac6] text-white shadow-elevation-1'
        : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]'
    }`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={activeTab === 'traodoi' ? 'h-[calc(100vh-112px)] flex flex-col space-y-3 overflow-hidden' : 'space-y-6'}>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 flex-none">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Sổ liên lạc phụ huynh</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            {isParent
              ? 'Kênh liên lạc trực tiếp giữa Phụ huynh với Ban Giám Hiệu và Giáo viên chủ nhiệm'
              : 'Gửi thông báo và trao đổi trực tiếp với phụ huynh học sinh'}
          </p>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] flex-none" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline hover:no-underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 flex-wrap flex-none">
        <button type="button" className={tabCls('thongbao')} onClick={() => setActiveTab('thongbao')} aria-selected={activeTab === 'thongbao'}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">campaign</span>
          Thông báo
          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-label-sm font-semibold ${activeTab === 'thongbao' ? 'bg-white/25 text-white' : 'bg-[#eff4ff] text-[#004ac6]'}`}>
            {filteredNotifications.length}
          </span>
        </button>
        <button type="button" className={tabCls('traodoi')} onClick={() => setActiveTab('traodoi')} aria-selected={activeTab === 'traodoi'}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">forum</span>
          Trao đổi
          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-label-sm font-semibold ${activeTab === 'traodoi' ? 'bg-white/25 text-white' : 'bg-[#eff4ff] text-[#004ac6]'}`}>
            {isParent
              ? (parentContacts.bgh.length + parentContacts.gvcn.length)
              : classStudents.length}
          </span>
        </button>
      </div>

      {/* ═══ TAB: THÔNG BÁO ═══════════════════════════════════════════════════ */}
      {activeTab === 'thongbao' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-body-sm text-[#64748b]">
              <span className="font-semibold text-[#0b1c30]">{filteredNotifications.length}</span>
              {filteredNotifications.length !== notifications.length ? ` / ${notifications.length}` : ''} thông báo, sắp xếp theo mới nhất
            </p>

            {/* Chỉ GVCN và BGH mới có nút "Tạo thông báo mới" */}
            {!isParent && (
              <button
                type="button"
                onClick={() => { setIsFormOpen((p) => !p); setSendMessage(null); }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-body-md font-semibold shadow-elevation-1 transition-all active:scale-[0.99] ${
                  isFormOpen ? 'bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]' : 'bg-[#004ac6] hover:bg-[#003ea8] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{isFormOpen ? 'expand_less' : 'add'}</span>
                {isFormOpen ? 'Thu gọn' : 'Tạo thông báo mới'}
              </button>
            )}
          </div>

          {/* Search & Filter - Thông báo */}
          <div className="flex flex-wrap gap-3 pb-1">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#94a3b8]" aria-hidden="true">search</span>
              <input
                type="text"
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                className="w-full border border-[#e2e8f0] rounded-lg pl-9 pr-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
              />
            </div>
            <select
              value={notifFilterType}
              onChange={(e) => setNotifFilterType(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="all">Tất cả loại</option>
              <option value="academic">Học vụ</option>
              <option value="absence">Vắng mặt</option>
              <option value="event">Sự kiện</option>
              <option value="general">Thông báo chung</option>
            </select>
            {classes.length > 0 && (
              <select
                value={notifFilterClass}
                onChange={(e) => setNotifFilterClass(e.target.value)}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
              >
                <option value="all">Tất cả lớp</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Form tạo thông báo */}
          {isFormOpen && !isParent && (
            <NotificationForm
              classes={classes}
              onSend={handleSend}
              onCancel={() => { setIsFormOpen(false); setSendMessage(null); }}
              isSending={isSending}
            />
          )}

          {/* Send result */}
          {sendMessage && (
            <p role="status" className={`flex items-center gap-1.5 text-body-sm font-medium ${sendMessage.type === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
              <span className="material-symbols-outlined text-[18px]">{sendMessage.type === 'success' ? 'check_circle' : 'error'}</span>
              {sendMessage.text}
            </p>
          )}

          {/* List thông báo */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[48px] mb-3" aria-hidden="true">inbox</span>
              <p className="text-body-md">Chưa có thông báo nào.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[48px] mb-3" aria-hidden="true">search_off</span>
              <p className="text-body-md">Không tìm thấy thông báo phù hợp.</p>
              <p className="text-body-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredNotifications.map((notif) => <NotificationCard key={notif.id} notif={notif} />)}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: TRAO ĐỔI ════════════════════════════════════════════════════ */}
      {activeTab === 'traodoi' && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] flex-1 min-h-0 overflow-hidden">

            {/* Left Panel: Phân quyền theo Role */}
            <div className="border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col h-full min-h-0 overflow-hidden bg-white">

              {/* ── CASE 1: Role PHỤ HUYNH ── */}
              {isParent ? (
                <>
                  <div className="px-4 py-3.5 border-b border-[#f1f5f9] bg-[#f8f9ff] flex-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6]">contacts</span>
                      <span className="text-body-md font-semibold text-[#0b1c30]">Người có thể liên hệ</span>
                      <span className="ml-auto text-label-sm bg-[#eff4ff] text-[#004ac6] px-2 py-0.5 rounded-full font-medium">
                        {parentContacts.bgh.length + parentContacts.gvcn.length}
                      </span>
                    </div>
                    <p className="text-label-sm text-[#64748b] mt-1">
                      Ban Giám hiệu và Giáo viên chủ nhiệm của con
                    </p>
                  </div>

                  <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 chat-scrollbar">
                    <ContactListForParent
                      contacts={parentContacts}
                      selectedId={selectedContact?.id ?? null}
                      onSelect={handleSelectParentContact}
                      loading={loadingContacts}
                    />
                  </div>
                </>
              ) : (
                /* ── CASE 2: Role GVCN / BGH ── */
                <>
                  <div className="px-4 py-3.5 border-b border-[#f1f5f9] bg-[#f8f9ff] space-y-2 flex-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6]" aria-hidden="true">groups</span>
                      <span className="text-body-md font-semibold text-[#0b1c30]">
                        {isGVCN ? 'Phụ huynh lớp chủ nhiệm' : 'Phụ huynh lớp'}
                      </span>
                      <span className="ml-auto text-label-sm bg-[#eff4ff] text-[#004ac6] px-2 py-0.5 rounded-full font-medium">
                        {filteredStudents.length}
                      </span>
                    </div>

                    {/* Dropdown chọn lớp: BGH chọn tự do, GVCN chỉ có lớp của mình */}
                    {classes.length > 0 && (
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        disabled={isGVCN && classes.length === 1}
                        className={`w-full border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-body-sm text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] transition-all ${
                          isGVCN ? 'cursor-default bg-[#f8fafc]' : ''
                        }`}
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}

                    {/* Tìm kiếm học sinh */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#94a3b8]" aria-hidden="true">search</span>
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm học sinh..."
                        className="w-full border border-[#e2e8f0] rounded-lg pl-9 pr-3 py-1.5 text-body-sm text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] transition-all"
                      />
                    </div>
                    {studentSearch && (
                      <p className="text-label-sm text-[#64748b]">{filteredStudents.length} / {classStudents.length} học sinh</p>
                    )}
                  </div>

                  <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 chat-scrollbar">
                    <ParentList
                      students={filteredStudents}
                      selectedId={selectedContact?.id ?? null}
                      onSelect={handleSelectStudent}
                      loading={loadingStudents}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right Panel: Thread chat hoặc Empty state */}
            <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white">
              {selectedContact ? (
                <ConversationThread
                  contact={selectedContact}
                  messages={thread}
                  loadingThread={loadingThread}
                  onSendMessage={handleSendChatMessage}
                  isSendingMsg={isSendingMsg}
                  isParent={isParent}
                  isBGH={isBGH}
                  onSwitchBghChannel={handleSwitchBghChannel}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-[#94a3b8] px-6 text-center">
                  <span className="material-symbols-outlined text-[52px] mb-3 text-[#cbd5e1]" aria-hidden="true">forum</span>
                  <p className="text-body-md font-semibold text-[#475569]">Chọn người để bắt đầu trò chuyện</p>
                  <p className="text-body-sm mt-1 max-w-sm">
                    {isParent
                      ? 'Chọn Ban Giám hiệu hoặc Giáo viên chủ nhiệm từ danh sách bên trái để gửi tin nhắn trao đổi.'
                      : 'Chọn phụ huynh học sinh từ danh sách bên trái để xem lịch sử và trao đổi trực tiếp.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
