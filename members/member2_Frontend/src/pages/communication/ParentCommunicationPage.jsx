/**
 * ParentCommunicationPage — Sổ liên lạc phụ huynh
 *
 * Hai tab chính:
 *   - "Thông báo"  : tạo và xem danh sách thông báo gửi phụ huynh
 *   - "Trao đổi"   : thread chat giữa GVCN và từng phụ huynh học sinh
 *
 * Requirements: GVCN / BGH role
 */

import { useState, useMemo } from 'react';
import { handleSendNotification } from '../../api/stubs.js';
import { notifications, students, classes } from '../../data/mockData.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';

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

// Seeded hardcoded threads keyed by studentId (populated lazily for any student)
const SEED_MESSAGES = [
  { from: 'gv',  text: 'Chào phụ huynh, em có vắng mặt buổi học ngày hôm qua không có phép. Phụ huynh vui lòng cho biết lý do ạ?' },
  { from: 'ph',  text: 'Dạ thưa thầy/cô, hôm qua em bị sốt nên không đi học được. Gia đình xin lỗi vì không thông báo kịp thời.' },
  { from: 'gv',  text: 'Dạ phụ huynh nhớ nộp giấy phép của bác sĩ để nhà trường ghi nhận vắng có phép. Cảm ơn phụ huynh ạ.' },
  { from: 'ph',  text: 'Vâng thầy/cô ơi, gia đình sẽ nộp giấy tờ sớm nhất có thể. Cảm ơn thầy/cô đã liên hệ.' },
];

// Fake parent name derived from student name
function parentName(studentName) {
  const parts = studentName.trim().split(' ');
  const lastName = parts[0];
  return `PH: ${lastName} (phụ huynh)`;
}

// Initials from full Vietnamese name: take last word (given name)
function initials(name) {
  const parts = name.trim().split(' ');
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

// Format ISO date string to vi-VN short form
function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('vi-VN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill badge for notification type */
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

/** Single notification card in the list */
function NotificationCard({ notif }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-col gap-2 hover:shadow-elevation-2 transition-shadow">
      {/* Top row: badges + date */}
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

      {/* Title */}
      <h3 className="text-body-md font-semibold text-[#0b1c30] leading-snug line-clamp-1">
        {notif.title}
      </h3>

      {/* Content preview — 2 lines */}
      <p className="text-body-sm text-[#475569] line-clamp-2 leading-relaxed">
        {notif.content}
      </p>

      {/* Recipients */}
      {notif.recipients && notif.recipients.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="material-symbols-outlined text-[14px] text-[#94a3b8]" aria-hidden="true">group</span>
          {notif.recipients.map((r) => (
            <span key={r} className="text-label-sm bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Collapsible form for creating a new notification */
function NotificationForm({ classes: classList, onSend, onCancel, isSending }) {
  const [formData, setFormData] = useState({
    title:      '',
    content:    '',
    type:       'academic',
    recipients: [],
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleRecipient = (classId) => {
    set('recipients', classId ? [classId] : []);
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())             e.title      = 'Vui lòng nhập tiêu đề.';
    if (!formData.content.trim())           e.content    = 'Vui lòng nhập nội dung.';
    if (formData.recipients.length === 0)   e.recipients = 'Vui lòng chọn lớp nhận.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    await onSend(formData);
    setFormData({ title: '', content: '', type: 'academic', recipients: [] });
    setErrors({});
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all ${
      errors[field] ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f8f9ff] border border-[#c3c6d7] rounded-xl p-5 space-y-4"
      noValidate
    >
      <h3 className="text-headline-sm font-semibold text-[#0b1c30] flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-[#004ac6]" aria-hidden="true">
          edit_note
        </span>
        Tạo thông báo mới
      </h3>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-label-sm font-medium text-[#434655]">
          Tiêu đề <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Nhập tiêu đề thông báo..."
          className={inputCls('title')}
        />
        {errors.title && (
          <p className="text-label-sm text-[#ef4444] flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>
            {errors.title}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <label className="text-label-sm font-medium text-[#434655]">
          Nội dung <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Nhập nội dung thông báo..."
          className={`${inputCls('content')} resize-none`}
        />
        {errors.content && (
          <p className="text-label-sm text-[#ef4444] flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>
            {errors.content}
          </p>
        )}
      </div>

      {/* Type + Recipients row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm font-medium text-[#434655]">Loại thông báo</label>
          <select
            value={formData.type}
            onChange={(e) => set('type', e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
          >
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Recipients */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm font-medium text-[#434655]">
            Lớp nhận <span className="text-[#ef4444]">*</span>
          </label>
          <select
            value={formData.recipients[0] ?? ''}
            onChange={(e) => handleRecipient(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all ${
              errors.recipients ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
            }`}
          >
            <option value="">— Chọn lớp —</option>
            {classList.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {errors.recipients && (
            <p className="text-label-sm text-[#ef4444] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">error</span>
              {errors.recipients}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-md shadow-elevation-2 transition-all"
        >
          {isSending ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Đang gửi...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Gửi thông báo
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] active:scale-[0.99] disabled:opacity-60 text-[#334155] font-medium text-body-md transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Huỷ
        </button>
      </div>
    </form>
  );
}

/** Left panel: list of parents (students of 10A1) */
function ParentList({ students: list, selectedId, onSelect }) {
  return (
    <ul role="list" className="divide-y divide-[#f1f5f9]">
      {list.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isSelected
                  ? 'bg-[#eff4ff] border-l-2 border-[#004ac6]'
                  : 'hover:bg-[#f8fafc] border-l-2 border-transparent'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-none w-10 h-10 rounded-full flex items-center justify-center text-label-md font-bold select-none ${
                  isSelected
                    ? 'bg-[#004ac6] text-white'
                    : 'bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] text-[#565e74]'
                }`}
                aria-hidden="true"
              >
                {initials(s.name)}
              </div>
              <div className="min-w-0">
                <p className={`text-body-md font-medium truncate ${isSelected ? 'text-[#004ac6]' : 'text-[#0b1c30]'}`}>
                  {s.name}
                </p>
                <p className="text-label-sm text-[#64748b] truncate">{parentName(s.name)}</p>
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

/** Single chat bubble */
function ChatBubble({ message }) {
  const isGV = message.from === 'gv';
  return (
    <div className={`flex ${isGV ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-body-sm leading-relaxed ${
          isGV
            ? 'bg-[#004ac6] text-white rounded-br-sm'
            : 'bg-[#f1f5f9] text-[#0b1c30] rounded-bl-sm'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

/** Right panel: conversation thread */
function ConversationThread({ student, messages, onSendMessage }) {
  const [input, setInput] = useState('');

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(student.id, trimmed);
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
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2e8f0] bg-[#f8f9ff]">
        <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-[#c3c6d7] to-[#dce9ff] flex items-center justify-center text-label-md font-bold text-[#565e74] select-none" aria-hidden="true">
          {initials(student.name)}
        </div>
        <div>
          <p className="text-body-md font-semibold text-[#0b1c30]">{student.name}</p>
          <p className="text-label-sm text-[#64748b]">{parentName(student.name)}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-label-sm bg-[#f0fdf4] text-[#15803d] border border-[#86efac] px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
          Đang hoạt động
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} />
        ))}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[#e2e8f0] bg-white flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi)"
          className="flex-1 border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all resize-none"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim()}
          aria-label="Gửi tin nhắn"
          className="flex-none inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParentCommunicationPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState('thongbao');
  const [messages,    setMessages]    = useState(() =>
    [...notifications].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)),
  );
  const [isFormOpen,  setIsFormOpen]  = useState(false);
  const [isSending,   setIsSending]   = useState(false);
  const [sendMessage, setSendMessage] = useState(null); // { type, text }

  // Trao đổi state
  const [selectedParentId, setSelectedParentId] = useState(null);
  // threads: { [studentId]: Message[] }
  const [threads, setThreads] = useState({});

  // Students in 10A1 for the Trao đổi tab
  const class10A1Students = useMemo(
    () => students.filter((s) => s.classId === '10A1'),
    [],
  );

  // ── Handlers: Thông báo tab ────────────────────────────────────────────────

  const handleToggleForm = () => {
    setIsFormOpen((prev) => !prev);
    setSendMessage(null);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSendMessage(null);
  };

  const handleSend = async (formData) => {
    setIsSending(true);
    setSendMessage(null);
    const newNotif = {
      id:         `NTF${Date.now()}`,
      title:      formData.title,
      content:    formData.content,
      type:       formData.type,
      senderId:   'GV003',
      recipients: formData.recipients,
      sentAt:     new Date().toISOString(),
      status:     'sent',
    };
    try {
      await handleSendNotification(newNotif);
      setMessages((prev) => [newNotif, ...prev]);
      setSendMessage({ type: 'success', text: 'Thông báo đã được gửi thành công!' });
      setIsFormOpen(false);
    } catch {
      setSendMessage({ type: 'error', text: 'Lỗi khi gửi thông báo. Vui lòng thử lại.' });
    } finally {
      setIsSending(false);
    }
  };

  // ── Handlers: Trao đổi tab ─────────────────────────────────────────────────

  const handleSelectParent = (studentId) => {
    setSelectedParentId(studentId);
    // Seed thread if first time opening
    setThreads((prev) => {
      if (prev[studentId]) return prev;
      return { ...prev, [studentId]: SEED_MESSAGES.map((m) => ({ ...m })) };
    });
  };

  const handleSendChatMessage = (studentId, text) => {
    setThreads((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] ?? []), { from: 'gv', text }],
    }));
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedStudent   = class10A1Students.find((s) => s.id === selectedParentId);
  const activeThread      = selectedParentId ? (threads[selectedParentId] ?? []) : [];

  // ── Tab button helper ─────────────────────────────────────────────────────

  const tabCls = (tab) =>
    `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-body-md font-medium transition-all ${
      activeTab === tab
        ? 'bg-[#004ac6] text-white shadow-elevation-1'
        : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]'
    }`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0b1c30]">Sổ liên lạc phụ huynh</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Gửi thông báo và trao đổi trực tiếp với phụ huynh học sinh
          </p>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          className={tabCls('thongbao')}
          onClick={() => setActiveTab('thongbao')}
          aria-selected={activeTab === 'thongbao'}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">campaign</span>
          Thông báo
          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-label-sm font-semibold ${
            activeTab === 'thongbao' ? 'bg-white/25 text-white' : 'bg-[#eff4ff] text-[#004ac6]'
          }`}>
            {messages.length}
          </span>
        </button>
        <button
          type="button"
          className={tabCls('traodoi')}
          onClick={() => setActiveTab('traodoi')}
          aria-selected={activeTab === 'traodoi'}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">forum</span>
          Trao đổi
          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-label-sm font-semibold ${
            activeTab === 'traodoi' ? 'bg-white/25 text-white' : 'bg-[#eff4ff] text-[#004ac6]'
          }`}>
            {class10A1Students.length}
          </span>
        </button>
      </div>

      {/* ═══ TAB: THÔNG BÁO ═══════════════════════════════════════════════════ */}
      {activeTab === 'thongbao' && (
        <div className="space-y-4">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-body-sm text-[#64748b]">
              <span className="font-semibold text-[#0b1c30]">{messages.length}</span> thông báo, sắp xếp theo mới nhất
            </p>
            <button
              type="button"
              onClick={handleToggleForm}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-body-md font-semibold shadow-elevation-1 transition-all active:scale-[0.99] ${
                isFormOpen
                  ? 'bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]'
                  : 'bg-[#004ac6] hover:bg-[#003ea8] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {isFormOpen ? 'expand_less' : 'add'}
              </span>
              {isFormOpen ? 'Thu gọn' : 'Tạo thông báo mới'}
            </button>
          </div>

          {/* Collapsible form */}
          {isFormOpen && (
            <NotificationForm
              classes={classes}
              onSend={handleSend}
              onCancel={handleCancelForm}
              isSending={isSending}
            />
          )}

          {/* Send result message */}
          {sendMessage && (
            <p
              role="status"
              className={`flex items-center gap-1.5 text-body-sm font-medium ${
                sendMessage.type === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {sendMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {sendMessage.text}
            </p>
          )}

          {/* Notification list */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-[48px] mb-3" aria-hidden="true">inbox</span>
              <p className="text-body-md">Chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {messages.map((notif) => (
                <NotificationCard key={notif.id} notif={notif} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: TRAO ĐỔI ════════════════════════════════════════════════════ */}
      {activeTab === 'traodoi' && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]" style={{ minHeight: '520px' }}>

            {/* Left: Parent list */}
            <div className="border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col">
              {/* List header */}
              <div className="px-4 py-3.5 border-b border-[#f1f5f9] bg-[#f8f9ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#004ac6]" aria-hidden="true">groups</span>
                  <span className="text-body-md font-semibold text-[#0b1c30]">Phụ huynh lớp 10A1</span>
                  <span className="ml-auto text-label-sm bg-[#eff4ff] text-[#004ac6] px-2 py-0.5 rounded-full font-medium">
                    {class10A1Students.length}
                  </span>
                </div>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1">
                <ParentList
                  students={class10A1Students}
                  selectedId={selectedParentId}
                  onSelect={handleSelectParent}
                />
              </div>
            </div>

            {/* Right: Thread or empty state */}
            <div className="flex flex-col">
              {selectedStudent ? (
                <ConversationThread
                  student={selectedStudent}
                  messages={activeThread}
                  onSendMessage={handleSendChatMessage}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-[#94a3b8] px-6 text-center">
                  <span className="material-symbols-outlined text-[52px] mb-3" aria-hidden="true">
                    forum
                  </span>
                  <p className="text-body-md font-medium text-[#475569]">Chọn phụ huynh để xem cuộc trò chuyện</p>
                  <p className="text-body-sm mt-1">Danh sách phụ huynh học sinh lớp 10A1 hiển thị bên trái.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
