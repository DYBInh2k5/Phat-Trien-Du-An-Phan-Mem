/**
 * SystemSettingsPage — Cài đặt hệ thống & phân quyền
 *
 * Chức năng:
 *   - Tab "Quản lý người dùng": DataTable + thêm/sửa (Modal) + vô hiệu hóa
 *   - Tab "Phân quyền chi tiết": Permission matrix (read-only checkboxes)
 *
 * Dữ liệu: GET /api/users — không dùng mockData.
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/shared/Modal.jsx';
import DataTable from '../../components/shared/DataTable.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  deleteUser,
  fetchPermissions,
  savePermissions,
  fetchClasses,
  assignHomeroomClass,
  removeHomeroomClass,
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
  name:      '',
  username:  '',
  password:  '',
  email:     '',
  role:      'GV',
  isActive:  true,
  className: '',
};

// ─── Permission matrix (static — quy tắc nghiệp vụ, không cần DB) ───────────

const MODULES = [
  { id: 'gradebook',  label: 'Sổ điểm' },
  { id: 'attendance', label: 'Điểm danh' },
  { id: 'schedule',   label: 'Thời khóa biểu' },
  { id: 'reports',    label: 'Báo cáo' },
  { id: 'settings',   label: 'Cài đặt' },
];

// Quyền mặc định — BGH có thể chỉnh sửa trực tiếp trên UI
const DEFAULT_PERMISSIONS = {
  gradebook:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance: { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:   { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:   { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

const ROLES_COLS = ['GV', 'GVCN', 'BGH', 'PH', 'HS'];

// BGH luôn có quyền settings — không cho phép bỏ tick
const LOCKED_ON = { settings: ['BGH'] };

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const cls = ROLE_BADGE_STYLES[role] ?? 'bg-[#f1f5f9] text-[#334155]';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${cls}`}
      style={{ height: '22px' }}>
      {role}
    </span>
  );
}

function SkeletonRow({ cols = 6 }) {
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

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab({ accounts, loading, onAdd, onEdit, onDeactivate, onDelete }) {
  const columns = [
    {
      key: 'name',
      header: 'Họ tên',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex-none w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]" aria-hidden="true">person</span>
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-[#0f172a] truncate">{v}</p>
            <p className="text-label-sm text-[#94a3b8]">#{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      render: (v) => (
        <code className="text-body-sm text-[#334155] bg-[#f1f5f9] px-1.5 py-0.5 rounded font-mono">{v}</code>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (v) => <span className="text-body-sm text-[#64748b]">{v || '—'}</span>,
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
          <button type="button" onClick={() => onEdit(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-[#475569] text-label-sm font-medium hover:bg-[#f8fafc] transition-colors">
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Sửa
          </button>
          {row.isActive && (
            <button type="button" onClick={() => onDeactivate(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#fca5a5] text-[#b91c1c] text-label-sm font-medium hover:bg-[#fef2f2] transition-colors">
              <span className="material-symbols-outlined text-[14px]">block</span>
              Vô hiệu hóa
            </button>
          )}
          {!row.isActive && (
            <button type="button" onClick={() => onDelete(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#fca5a5] text-[#b91c1c] text-label-sm font-medium hover:bg-[#fef2f2] transition-colors">
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-[#64748b]">
          {loading ? 'Đang tải...' : `${accounts.length} tài khoản`}
        </span>
        <button type="button" onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-elevation-1 transition-all">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm người dùng
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              <SkeletonRow cols={6} />
              <SkeletonRow cols={6} />
              <SkeletonRow cols={6} />
            </tbody>
          </table>
        </div>
      ) : (
        <DataTable columns={columns} data={accounts} emptyMessage="Không có tài khoản nào" />
      )}
    </div>
  );
}

// ─── Permissions tab ──────────────────────────────────────────────────────────

function PermissionsTab({ currentPermissions, onPermissionsSaved }) {
  const [matrix, setMatrix] = useState(() => {
    // Khởi tạo từ permissions hiện tại của context (đã load từ server)
    if (currentPermissions && typeof currentPermissions === 'object') {
      return Object.fromEntries(
        Object.entries(DEFAULT_PERMISSIONS).map(([mod, defaultRoles]) => [
          mod,
          { ...defaultRoles, ...(currentPermissions[mod] ?? {}) },
        ])
      );
    }
    return Object.fromEntries(
      Object.entries(DEFAULT_PERMISSIONS).map(([mod, roles]) => [mod, { ...roles }])
    );
  });
  const [saved, setSaved]       = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load permissions từ API khi mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    fetchPermissions()
      .then((data) => {
        if (!cancelled && data && typeof data === 'object') {
          setMatrix(
            Object.fromEntries(
              Object.entries(DEFAULT_PERMISSIONS).map(([mod, defaultRoles]) => [
                mod,
                { ...defaultRoles, ...(data[mod] ?? {}) },
              ])
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Không thể tải phân quyền từ server, dùng giá trị mặc định.');
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = (moduleId, role) => {
    if (LOCKED_ON[moduleId]?.includes(role)) return;
    setSaved(false);
    setSaveError(null);
    setMatrix((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [role]: !prev[moduleId][role] },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await savePermissions(matrix);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Thông báo lên parent để cập nhật AuthContext
      onPermissionsSaved?.(matrix);
    } catch (err) {
      setSaveError(err.message || 'Lưu phân quyền thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setMatrix(
      Object.fromEntries(
        Object.entries(DEFAULT_PERMISSIONS).map(([mod, roles]) => [mod, { ...roles }])
      )
    );
    setSaved(false);
    setSaveError(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 px-5 py-10 text-center text-body-md text-[#64748b]">
        <span className="material-symbols-outlined text-[32px] animate-spin block mx-auto mb-2 text-[#004ac6]">progress_activity</span>
        Đang tải phân quyền...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-[#7c3aed]" aria-hidden="true">admin_panel_settings</span>
        <h2 className="text-headline-sm font-semibold text-[#0f172a]">Ma trận phân quyền</h2>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={handleReset}
            className="px-3 py-1.5 text-label-sm rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] transition-colors">
            Đặt lại
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors">
            {isSaving ? (
              <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Đang lưu...</>
            ) : (
              <><span className="material-symbols-outlined text-[14px]">save</span>Lưu thay đổi</>
            )}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-[#fff7ed] rounded-lg border border-[#fdba74] text-body-sm text-[#c2410c]">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          {loadError}
        </div>
      )}
      {saved && (
        <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-[#f0fdf4] rounded-lg border border-[#86efac] text-body-sm text-[#15803d]">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Đã lưu phân quyền thành công
        </div>
      )}
      {saveError && (
        <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-[#fef2f2] rounded-lg border border-[#fecaca] text-body-sm text-[#b91c1c]">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {saveError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-data-table">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{height: '44px'}}>
              <th className="px-4 py-3 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider min-w-[160px]">Module</th>
              {ROLES_COLS.map((role) => (
                <th key={role} className="px-4 py-3 text-center text-label-sm font-medium uppercase tracking-wider">
                  <RoleBadge role={role} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod, idx) => (
              <tr key={mod.id}
                className={`border-b border-[#f1f5f9] ${idx % 2 === 0 ? '' : 'bg-[#fafafa]'}`}
                style={{height: '48px'}}>
                <td className="px-4 py-3 text-[#1e293b] font-medium whitespace-nowrap">{mod.label}</td>
                {ROLES_COLS.map((role) => {
                  const hasAccess = matrix[mod.id]?.[role] ?? false;
                  const isLocked  = LOCKED_ON[mod.id]?.includes(role) ?? false;
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        disabled={isLocked}
                        onChange={() => toggle(mod.id, role)}
                        aria-label={`${mod.label} — ${role}`}
                        title={isLocked ? 'Quyền này không thể thay đổi' : undefined}
                        className={`w-4 h-4 rounded accent-[#004ac6] ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
          <input type="checkbox" checked readOnly className="w-3.5 h-3.5 accent-[#004ac6]" />
          Có quyền truy cập
        </span>
        <span className="flex items-center gap-1.5">
          <input type="checkbox" checked={false} readOnly className="w-3.5 h-3.5 opacity-40" />
          Không có quyền
        </span>
        <span className="flex items-center gap-1.5 ml-auto text-[#94a3b8]">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Quyền cài đặt của BGH không thể bỏ
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemSettingsPage() {
  const [activeTab,   setActiveTab]   = useState('users');
  const { permissions, updatePermissions } = useAuth();

  // Callback: khi PermissionsTab lưu thành công → cập nhật permissions trong context ngay lập tức
  const handlePermissionsSaved = useCallback((newMatrix) => {
    updatePermissions(newMatrix);
  }, [updatePermissions]);

  // User list state
  const [accounts,   setAccounts]    = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [error,      setError]       = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalForm,   setModalForm]   = useState(EMPTY_FORM);
  const [isSaving,    setIsSaving]    = useState(false);
  const [modalError,  setModalError]  = useState(null);
  const [classes,        setClasses]        = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // ── Fetch users on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers();
        if (!cancelled) setAccounts(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách người dùng.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Modal open/close ──────────────────────────────────────────────────────
  const openAddModal = useCallback(async () => {
    setEditingUser(null);
    setModalForm(EMPTY_FORM);
    setModalError(null);
    setClassesLoading(true);
    setIsModalOpen(true);
    try {
      const data = await fetchClasses();
      setClasses(data ?? []);
    } catch {
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  const openEditModal = useCallback(async (user) => {
    setEditingUser(user);
    setModalError(null);
    setClassesLoading(true);
    setIsModalOpen(true);
    let currentClassName = '';
    try {
      const data = await fetchClasses();
      const classList = data ?? [];
      setClasses(classList);
      if (user.role === 'GVCN') {
        const assignedClass = classList.find(
          (c) => Number(c.homeroom_teacher_id) === Number(user.id)
        );
        currentClassName = assignedClass?.class_name ?? '';
      }
    } catch {
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
    setModalForm({
      name:      user.name,
      username:  user.username,
      password:  '',
      email:     user.email,
      role:      user.role,
      isActive:  user.isActive,
      className: currentClassName,
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalForm(EMPTY_FORM);
    setModalError(null);
  }, []);

  const handleFormChange = (field, value) =>
    setModalForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    // Ghi nhớ lớp cũ của user đang edit (trước khi gọi API)
    const previousClass = editingUser
      ? classes.find((c) => Number(c.homeroom_teacher_id) === Number(editingUser.id))
      : null;

    try {
      let resultUser;
      if (editingUser) {
        // Update — không gửi password
        resultUser = await updateUser(editingUser.id, {
          fullName: modalForm.name,
          email:    modalForm.email,
          role:     modalForm.role,
          isActive: modalForm.isActive,
        });
      } else {
        // Create
        resultUser = await createUser({
          username: modalForm.username,
          password: modalForm.password,
          fullName: modalForm.name,
          email:    modalForm.email,
          role:     modalForm.role,
          isActive: modalForm.isActive,
        });
      }

      // Finding 2 (role change): xử lý khi đổi role từ GVCN sang role khác → dọn phân công cũ
      if (editingUser?.role === 'GVCN' && modalForm.role !== 'GVCN' && previousClass) {
        await removeHomeroomClass(previousClass.class_name);
      }

      // Xử lý phân công lớp chủ nhiệm nếu role hiện tại là GVCN
      if (modalForm.role === 'GVCN') {
        if (modalForm.className) {
          // Gán lớp chủ nhiệm (backend dùng transaction: remove cũ + assign mới nguyên tử)
          await assignHomeroomClass(modalForm.className, resultUser.id);
        } else if (editingUser && previousClass) {
          // Người dùng chọn "Không phân công" và trước đó có lớp → hủy phân công
          await removeHomeroomClass(previousClass.class_name);
        }
      }

      // Finding 1: Tải lại danh sách users từ server để đồng bộ trạng thái
      // (tránh split-brain nếu bước homeroom phía trên thất bại)
      try {
        const freshUsers = await fetchUsers();
        setAccounts(freshUsers);
      } catch {
        // Fallback: cập nhật optimistic nếu không refresh được
        if (editingUser) {
          setAccounts((prev) => prev.map((a) => (a.id === resultUser.id ? resultUser : a)));
        } else {
          setAccounts((prev) => [...prev, resultUser]);
        }
      }

      closeModal();
    } catch (err) {
      // Finding 1: reload lại accounts từ server để không hiển thị trạng thái sai
      try {
        const freshUsers = await fetchUsers();
        setAccounts(freshUsers);
      } catch { /* bỏ qua nếu reload cũng thất bại */ }
      setModalError(err.message || 'Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deactivate ────────────────────────────────────────────────────────────
  const handleDeactivate = useCallback(async (user) => {
    try {
      // Finding 5: backend (UserService.deactivateUser) now handles cascade removal
      // of homeroom assignment for GVCN atomically — no need to call removeHomeroomClass separately.
      const updated = await deactivateUser(user.id);
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setError(err.message || 'Vô hiệu hóa tài khoản thất bại.');
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (user) => {
    if (!window.confirm(`Xác nhận xóa tài khoản "${user.name}" (${user.username})? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteUser(user.id);
      setAccounts((prev) => prev.filter((a) => a.id !== user.id));
    } catch (err) {
      setError(err.message || 'Xóa tài khoản thất bại.');
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-headline-md font-semibold text-[#0f172a]">Cài đặt Hệ thống</h1>
        <p className="text-body-sm text-[#64748b] mt-0.5">
          Quản lý tài khoản người dùng và phân quyền truy cập hệ thống
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline hover:no-underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      {/* ── Tab navigation ── */}
      <div className="flex border-b border-[#e2e8f0] gap-0">
        {[
          { id: 'users',       label: 'Quản lý người dùng',  icon: 'manage_accounts'      },
          { id: 'permissions', label: 'Phân quyền chi tiết', icon: 'admin_panel_settings' },
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
      {activeTab === 'users' && (
        <UsersTab
          accounts={accounts}
          loading={loading}
          onAdd={openAddModal}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'permissions' && (
        <PermissionsTab
          currentPermissions={permissions}
          onPermissionsSaved={handlePermissionsSaved}
        />
      )}

      {/* ── Add/Edit User Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Modal error */}
          {modalError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#fef2f2] rounded-lg border border-[#fecaca] text-body-sm text-[#b91c1c]">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {modalError}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Họ và tên <span className="text-[#ef4444]">*</span>
            </label>
            <input type="text" value={modalForm.name} required
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all" />
          </div>

          {/* Username — read-only khi sửa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Tên đăng nhập <span className="text-[#ef4444]">*</span>
            </label>
            <input type="text" value={modalForm.username} required={!editingUser}
              readOnly={!!editingUser}
              onChange={(e) => handleFormChange('username', e.target.value)}
              placeholder="a.nv"
              autoComplete="off"
              className={`border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md font-mono text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all ${editingUser ? 'bg-[#f8fafc] cursor-not-allowed opacity-70' : ''}`} />
          </div>

          {/* Password — chỉ hiện khi tạo mới */}
          {!editingUser && (
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Mật khẩu <span className="text-[#ef4444]">*</span>
            </label>
            <input type="password" value={modalForm.password}
              required
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoComplete="new-password"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all" />
          </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Email <span className="text-[#ef4444]">*</span>
            </label>
            <input type="email" value={modalForm.email} required
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="a.nv@school.edu.vn"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all" />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Vai trò <span className="text-[#ef4444]">*</span>
            </label>
            <select value={modalForm.role} required
              onChange={(e) => handleFormChange('role', e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Lớp chủ nhiệm — chỉ hiện khi role là GVCN */}
          {modalForm.role === 'GVCN' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-medium text-[#434655]">
                Lớp chủ nhiệm
              </label>
              {classesLoading ? (
                <div className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#94a3b8] bg-[#f8fafc]">
                  Đang tải danh sách lớp...
                </div>
              ) : (
                <select
                  value={modalForm.className}
                  onChange={(e) => handleFormChange('className', e.target.value)}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                >
                  <option value="">— Không phân công —</option>
                  {classes.map((cls) => {
                    const isOccupied =
                      cls.homeroom_teacher_id !== null &&
                      cls.homeroom_teacher_id !== undefined &&
                      Number(cls.homeroom_teacher_id) !== Number(editingUser?.id ?? null);
                    return (
                      <option
                        key={cls.class_name}
                        value={cls.class_name}
                        disabled={isOccupied}
                      >
                        {cls.class_name}
                        {isOccupied ? ` (đã phân công: ${cls.gvcn_name ?? 'GVCN khác'})` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
              {/* Finding 3: cảnh báo khi GVCN chưa được phân công lớp */}
              {!classesLoading && !modalForm.className && (
                <p className="flex items-center gap-1 text-label-sm text-[#c2410c]">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  GVCN chưa được phân công lớp chủ nhiệm. Tài khoản sẽ được tạo nhưng không có quyền truy cập dữ liệu lớp.
                </p>
              )}
            </div>
          )}

          {/* isActive toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-label-sm font-medium text-[#434655]">Trạng thái tài khoản</p>
              <p className="text-label-sm text-[#94a3b8]">
                {modalForm.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản bị vô hiệu hóa'}
              </p>
            </div>
            <button type="button" role="switch" aria-checked={modalForm.isActive}
              onClick={() => handleFormChange('isActive', !modalForm.isActive)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] ${modalForm.isActive ? 'bg-[#004ac6]' : 'bg-[#cbd5e1]'}`}>
              <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${modalForm.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
            <button type="button" onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-sm shadow-elevation-1 transition-all">
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
