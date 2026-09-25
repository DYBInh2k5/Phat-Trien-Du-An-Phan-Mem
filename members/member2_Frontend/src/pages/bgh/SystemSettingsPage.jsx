/**
 * SystemSettingsPage — Cài đặt hệ thống & phân quyền
 *
 * Chức năng:
 *   - Tab "Quản lý người dùng": DataTable + thêm/sửa (Modal) + vô hiệu hóa
 *   - Tab "Phân quyền chi tiết": Permission matrix (read-only checkboxes)
 *
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { useState, useCallback } from 'react';
import Modal from '../../components/shared/Modal.jsx';
import DataTable from '../../components/shared/DataTable.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { userAccounts } from '../../data/mockData.js';
import {
  handleCreateUser,
  handleUpdateUser,
  handleDeactivateUser,
} from '../../api/stubs.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'GV',   label: 'Giáo viên (GV)' },
  { value: 'GVCN', label: 'GV Chủ nhiệm (GVCN)' },
  { value: 'BGH',  label: 'Ban Giám Hiệu (BGH)' },
  { value: 'PH',   label: 'Phụ huynh (PH)' },
  { value: 'HS',   label: 'Học sinh (HS)' },
];

const ROLE_BADGE_STYLES = {
  GV:   'bg-[#eff4ff] text-[#2563eb]',
  GVCN: 'bg-[#f5f3ff] text-[#7c3aed]',
  BGH:  'bg-[#fff7ed] text-[#c2410c]',
  PH:   'bg-[#f0fdf4] text-[#15803d]',
  HS:   'bg-[#f1f5f9] text-[#334155]',
};

const EMPTY_FORM = {
  name:     '',
  username: '',
  password: '',
  email:    '',
  role:     'GV',
  isActive: true,
};

// ─── Permission matrix data ───────────────────────────────────────────────────

const MODULES = [
  { id: 'gradebook',   label: 'Sổ điểm' },
  { id: 'attendance',  label: 'Điểm danh' },
  { id: 'schedule',    label: 'Thời khóa biểu' },
  { id: 'reports',     label: 'Báo cáo' },
  { id: 'settings',    label: 'Cài đặt' },
];

const PERMISSION_MATRIX = {
  //                 GV     GVCN   BGH    PH     HS
  gradebook:   { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:    { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:     { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

const ROLES_COLS = ['GV', 'GVCN', 'BGH', 'PH', 'HS'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const cls = ROLE_BADGE_STYLES[role] ?? 'bg-[#f1f5f9] text-[#334155]';
  const label = ROLE_OPTIONS.find((r) => r.value === role)?.value ?? role;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${cls}`}
      style={{ height: '22px' }}
    >
      {label}
    </span>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab({ accounts, onAdd, onEdit, onDeactivate }) {
  const columns = [
    {
      key: 'name',
      header: 'Họ tên',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex-none w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]" aria-hidden="true">
              person
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-[#0f172a] truncate">{v}</p>
            <p className="text-label-sm text-[#94a3b8]">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      render: (v) => (
        <code className="text-body-sm text-[#334155] bg-[#f1f5f9] px-1.5 py-0.5 rounded font-mono">
          {v}
        </code>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (v) => (
        <span className="text-body-sm text-[#64748b]">{v}</span>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (v) => <RoleBadge role={v} />,
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (v) => (
        <StatusBadge status={v ? 'active' : 'inactive'} label={v ? 'Hoạt động' : 'Vô hiệu'} />
      ),
    },
    {
      key: '_actions',
      header: 'Hành động',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-[#475569] text-label-sm font-medium hover:bg-[#f8fafc] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Sửa
          </button>
          {row.isActive && (
            <button
              type="button"
              onClick={() => onDeactivate(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#fca5a5] text-[#b91c1c] text-label-sm font-medium hover:bg-[#fef2f2] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">block</span>
              Vô hiệu hóa
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-[#64748b]">{accounts.length} tài khoản</span>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-elevation-1 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm người dùng
        </button>
      </div>
      <DataTable columns={columns} data={accounts} emptyMessage="Không có tài khoản nào" />
    </div>
  );
}

// ─── Permissions tab ──────────────────────────────────────────────────────────

function PermissionsTab() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">
          admin_panel_settings
        </span>
        <h2 className="text-headline-sm font-semibold text-[#0f172a]">Ma trận phân quyền</h2>
        <span className="ml-auto text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded">
          Chỉ xem
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-data-table">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '44px' }}>
              <th className="px-4 py-3 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider min-w-[160px]">
                Module
              </th>
              {ROLES_COLS.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-label-sm font-medium uppercase tracking-wider"
                >
                  <RoleBadge role={role} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod, idx) => (
              <tr
                key={mod.id}
                className={`border-b border-[#f1f5f9] ${idx % 2 === 0 ? '' : 'bg-[#fafafa]'}`}
                style={{ height: '48px' }}
              >
                <td className="px-4 py-3 text-[#1e293b] font-medium whitespace-nowrap">
                  {mod.label}
                </td>
                {ROLES_COLS.map((role) => {
                  const hasAccess = PERMISSION_MATRIX[mod.id]?.[role] ?? false;
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        readOnly
                        disabled
                        aria-label={`${mod.label} — ${role}: ${hasAccess ? 'Có quyền' : 'Không có quyền'}`}
                        className={`w-4 h-4 rounded cursor-not-allowed ${
                          hasAccess
                            ? 'accent-[#004ac6]'
                            : 'opacity-40'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[#f1f5f9] flex items-center gap-4 text-label-sm text-[#64748b]">
        <span className="flex items-center gap-1.5">
          <input type="checkbox" checked readOnly disabled className="w-3.5 h-3.5 accent-[#004ac6]" />
          Có quyền truy cập
        </span>
        <span className="flex items-center gap-1.5">
          <input type="checkbox" checked={false} readOnly disabled className="w-3.5 h-3.5 opacity-40" />
          Không có quyền
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemSettingsPage() {
  const [activeTab,    setActiveTab]    = useState('users');
  const [accounts,     setAccounts]     = useState(userAccounts);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingUser,  setEditingUser]  = useState(null); // null | user object
  const [modalForm,    setModalForm]    = useState(EMPTY_FORM);
  const [isSaving,     setIsSaving]     = useState(false);

  // ── Modal open/close ─────────────────────────────────────────────────────────

  const openAddModal = useCallback(() => {
    setEditingUser(null);
    setModalForm(EMPTY_FORM);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((user) => {
    setEditingUser(user);
    setModalForm({
      name:     user.name,
      username: user.username,
      password: '',
      email:    user.email,
      role:     user.role,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalForm(EMPTY_FORM);
  }, []);

  const handleFormChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUser) {
        await handleUpdateUser({ ...editingUser, ...modalForm });
        // Optimistic update
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === editingUser.id
              ? {
                  ...a,
                  name:     modalForm.name,
                  username: modalForm.username,
                  email:    modalForm.email,
                  role:     modalForm.role,
                  isActive: modalForm.isActive,
                }
              : a,
          ),
        );
      } else {
        const newUser = {
          id:        `USR${String(accounts.length + 1).padStart(3, '0')}`,
          name:      modalForm.name,
          username:  modalForm.username,
          email:     modalForm.email,
          role:      modalForm.role,
          isActive:  modalForm.isActive,
          createdAt: new Date().toISOString(),
        };
        await handleCreateUser(newUser);
        setAccounts((prev) => [...prev, newUser]);
      }
      closeModal();
    } catch {
      // keep modal open
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deactivate ───────────────────────────────────────────────────────────────

  const handleDeactivate = useCallback(async (user) => {
    try {
      await handleDeactivateUser({ id: user.id });
      setAccounts((prev) =>
        prev.map((a) => (a.id === user.id ? { ...a, isActive: false } : a)),
      );
    } catch {
      // silently fail
    }
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-headline-md font-semibold text-[#0f172a]">Cài đặt Hệ thống</h1>
        <p className="text-body-sm text-[#64748b] mt-0.5">
          Quản lý tài khoản người dùng và phân quyền truy cập hệ thống
        </p>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex border-b border-[#e2e8f0] gap-0">
        {[
          { id: 'users',       label: 'Quản lý người dùng',  icon: 'manage_accounts' },
          { id: 'permissions', label: 'Phân quyền chi tiết', icon: 'admin_panel_settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-5 py-3 text-body-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'users' && (
        <UsersTab
          accounts={accounts}
          onAdd={openAddModal}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
        />
      )}
      {activeTab === 'permissions' && <PermissionsTab />}

      {/* ── Add/Edit User Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Họ và tên <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={modalForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Tên đăng nhập <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={modalForm.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              placeholder="a.nv"
              required
              autoComplete="off"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md font-mono text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Mật khẩu{' '}
              {editingUser && (
                <span className="text-[#94a3b8] font-normal">(để trống nếu không đổi)</span>
              )}
              {!editingUser && <span className="text-[#ef4444]">*</span>}
            </label>
            <input
              type="password"
              value={modalForm.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder={editingUser ? '••••••••' : 'Nhập mật khẩu...'}
              required={!editingUser}
              autoComplete="new-password"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Email <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="email"
              value={modalForm.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="a.nv@school.edu.vn"
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Vai trò <span className="text-[#ef4444]">*</span>
            </label>
            <select
              value={modalForm.role}
              onChange={(e) => handleFormChange('role', e.target.value)}
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* isActive toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-label-sm font-medium text-[#434655]">Trạng thái tài khoản</p>
              <p className="text-label-sm text-[#94a3b8]">
                {modalForm.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản bị vô hiệu hóa'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={modalForm.isActive}
              onClick={() => handleFormChange('isActive', !modalForm.isActive)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] ${
                modalForm.isActive ? 'bg-[#004ac6]' : 'bg-[#cbd5e1]'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${
                  modalForm.isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-sm shadow-elevation-1 transition-all"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
