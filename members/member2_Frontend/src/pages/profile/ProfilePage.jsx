/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/profile/ProfilePage.jsx
 * Vai trò: Trang Hồ Sơ Cá Nhân (User Profile Page)
 * Phân quyền: Tất cả 5 vai trò (BGH, GVCN, GV, HS, PH) đều truy cập được
 * Tính năng:
 *   - Xem thông tin cá nhân (tên, username, vai trò, email, SĐT)
 *   - Chỉnh sửa họ tên, email, SĐT
 *   - Avatar đại diện (hiển thị chữ cái đầu, chưa hỗ trợ upload)
 *   - Gọi PUT /api/auth/profile → cập nhật AuthContext ngay lập tức
 * Tác giả: Nhóm Đồ Án PTDA PM — member2_Frontend
 * Ngày tạo: 28/11/2026
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { apiClient } from '../../api/client.js';

// ─── Hằng số ──────────────────────────────────────────────────────────────────

/** Màu nền avatar theo vai trò */
const ROLE_AVATAR_BG = {
  BGH:  'from-[#f97316] to-[#ea580c]',
  GVCN: 'from-[#7c3aed] to-[#6d28d9]',
  GV:   'from-[#2563eb] to-[#1d4ed8]',
  HS:   'from-[#0891b2] to-[#0e7490]',
  PH:   'from-[#16a34a] to-[#15803d]',
};

/** Màu badge theo vai trò */
const ROLE_BADGE = {
  BGH:  'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
  GVCN: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
  GV:   'bg-[#eff4ff] text-[#2563eb] border-[#bfdbfe]',
  HS:   'bg-[#ecfeff] text-[#0891b2] border-[#a5f3fc]',
  PH:   'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Dòng thông tin chỉ đọc (nhãn + giá trị).
 */
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f1f5f9] last:border-b-0">
      <span className="flex-none w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center mt-0.5" aria-hidden="true">
        <span className="material-symbols-outlined text-[17px] text-[#64748b]">{icon}</span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">{label}</p>
        <p className="text-[14px] font-medium text-[#0f172a] mt-0.5 break-words">{value || <span className="text-[#cbd5e1] italic">Chưa cập nhật</span>}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, role, updateUser } = useAuth();

  // ── Form state ────────────────────────────────────────────────────────────
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveOk,    setSaveOk]    = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email:    '',
    phone:    '',
  });

  // Khởi tạo form từ user hiện tại khi mở chỉnh sửa
  useEffect(() => {
    if (editing && user) {
      setForm({
        fullName: user.name || user.fullName || '',
        email:    user.email || '',
        phone:    user.phone || '',
      });
      setSaveError(null);
      setSaveOk(false);
    }
  }, [editing, user]);

  /**
   * Validate client-side trước khi gửi lên API.
   * @returns {string|null} thông báo lỗi hoặc null nếu hợp lệ
   */
  function validate() {
    if (!form.fullName.trim()) return 'Họ tên không được để trống.';
    if (form.fullName.trim().length > 100) return 'Họ tên không quá 100 ký tự.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return 'Địa chỉ email không hợp lệ.';
    if (form.phone && !/^[0-9+\s\-]{7,20}$/.test(form.phone.trim()))
      return 'Số điện thoại không hợp lệ (7–20 chữ số).';
    return null;
  }

  /**
   * Gửi dữ liệu cập nhật lên PUT /api/auth/profile.
   */
  async function handleSave(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setSaveError(err); return; }

    setSaving(true);
    setSaveError(null);
    setSaveOk(false);

    try {
      const res = await apiClient('/auth/profile', {
        method: 'PUT',
        body: {
          fullName: form.fullName.trim(),
          email:    form.email.trim()    || undefined,
          phone:    form.phone.trim()    || undefined,
        },
      });

      if (!res?.success) throw new Error(res?.message || 'Cập nhật thất bại.');

      // Cập nhật AuthContext + localStorage ngay lập tức
      updateUser({ name: res.user.name, email: res.user.email, phone: res.user.phone });
      setSaveOk(true);
      setEditing(false);
    } catch (apiErr) {
      setSaveError(apiErr.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const displayName  = user?.name || user?.fullName || user?.username || 'Người dùng';
  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U';
  const avatarBg     = ROLE_AVATAR_BG[role] || 'from-[#64748b] to-[#475569]';
  const badgeCls     = ROLE_BADGE[role]     || 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]';

  const inputCls = 'w-full px-3 py-2 text-[14px] text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition';

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#0f172a]">Hồ sơ cá nhân</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          Xem và cập nhật thông tin tài khoản của bạn
        </p>
      </div>

      {/* ── Avatar card ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex items-center gap-5">
        {/* Avatar */}
        <div className={`flex-none w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white font-bold text-[32px] shadow-lg`}>
          {user?.avatar
            ? <img src={user.avatar} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
            : avatarLetter
          }
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-[#0f172a] truncate">{displayName}</h2>
          <p className="text-[13px] text-[#64748b] mt-0.5">@{user?.username}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${badgeCls}`}>
              {ROLE_LABELS[role] || role}
            </span>
            {user?.className && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[13px]" aria-hidden="true">class</span>
                Lớp {user.className}
              </span>
            )}
          </div>
        </div>

        {/* Nút chỉnh sửa */}
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-none flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-[#2563eb] bg-[#eff4ff] border border-[#bfdbfe] hover:bg-[#dbeafe] transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">edit</span>
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* ── Toast thành công ── */}
      {saveOk && !editing && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[13px]" role="status">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
          Cập nhật hồ sơ thành công!
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHẾ ĐỘ XEM                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!editing && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#64748b]" aria-hidden="true">badge</span>
            <h3 className="text-[14px] font-semibold text-[#0f172a]">Thông tin tài khoản</h3>
          </div>
          <div className="px-5 py-2">
            <InfoRow label="Họ và tên"       icon="person"       value={displayName} />
            <InfoRow label="Tên đăng nhập"   icon="account_circle" value={user?.username} />
            <InfoRow label="Vai trò"         icon="shield"       value={ROLE_LABELS[role] || role} />
            <InfoRow label="Email"           icon="mail"         value={user?.email} />
            <InfoRow label="Số điện thoại"   icon="phone"        value={user?.phone} />
            {user?.className && (
              <InfoRow label="Lớp"           icon="class"        value={user.className} />
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHẾ ĐỘ CHỈNH SỬA                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editing && (
        <form onSubmit={handleSave} noValidate>
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#2563eb]" aria-hidden="true">edit_note</span>
              <h3 className="text-[14px] font-semibold text-[#0f172a]">Chỉnh sửa thông tin</h3>
              <p className="text-[11px] text-[#94a3b8] ml-1">· Không thể thay đổi username và vai trò</p>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Lỗi API */}
              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[13px]" role="alert">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
                  {saveError}
                </div>
              )}

              {/* Trường chỉ đọc: username */}
              <div>
                <label className="block text-[12px] font-semibold text-[#334155] mb-1.5">
                  Tên đăng nhập <span className="text-[#94a3b8] font-normal">(không thể thay đổi)</span>
                </label>
                <input type="text" value={user?.username || ''} disabled
                  className="w-full px-3 py-2 text-[14px] text-[#94a3b8] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-not-allowed" />
              </div>

              {/* Họ và tên */}
              <div>
                <label htmlFor="fullName" className="block text-[12px] font-semibold text-[#334155] mb-1.5">
                  Họ và tên <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên đầy đủ"
                  className={inputCls}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-[#334155] mb-1.5">
                  Địa chỉ Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@hsu.edu.vn"
                  className={inputCls}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label htmlFor="phone" className="block text-[12px] font-semibold text-[#334155] mb-1.5">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="VD: 0912345678"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Footer form */}
            <div className="px-5 py-4 bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEditing(false); setSaveError(null); }}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" aria-hidden="true" />
                )}
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">save</span>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Thông tin bảo mật (chỉ đọc) ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#64748b]" aria-hidden="true">security</span>
          <h3 className="text-[14px] font-semibold text-[#0f172a]">Bảo mật tài khoản</h3>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center" aria-hidden="true">
              <span className="material-symbols-outlined text-[17px] text-[#15803d]">lock</span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#0f172a]">Mật khẩu</p>
              <p className="text-[11px] text-[#64748b]">Lần đổi gần nhất: không rõ</p>
            </div>
          </div>
          <a href="/forgot-password"
            className="flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors">
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">key</span>
            Đổi mật khẩu
          </a>
        </div>
      </div>

    </div>
  );
}
