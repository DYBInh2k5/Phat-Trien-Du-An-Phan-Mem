/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/context/AuthContext.jsx
 * Vai trò: Ngữ Cảnh Quản Lý Xác Thực Toàn Cục (Global Authentication Context)
 * Kiến trúc: React Context API - Quản lý trạng thái phiên làm việc không qua Prop Drilling
 * Mô tả:
 *   - Lưu trữ đối tượng người dùng hiện tại (user), vai trò (role), và cờ xác thực (isAuthenticated).
 *   - Tự động nạp lại thông tin người dùng từ localStorage khi tải lại trình duyệt.
 *   - Cung cấp hàm login và logout cho toàn bộ cây Component.
 *   - Expose hook tiện ích `useAuth()` để các Component dễ dàng sử dụng.
 *   - Hỗ trợ phân quyền RBAC qua `permissions`, `hasPermission`.
 *   - Polling permissions từ server mỗi 15 giây để nhận thay đổi từ BGH.
 * ==============================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client.js';

// Khởi tạo đối tượng Context mặc định là null
const AuthContext = createContext(null);

const STORAGE_KEY = 'htqllh_auth'; // lưu { user, token }

// Quyền mặc định — dùng làm fallback khi chưa/không lấy được từ server
export const DEFAULT_PERMISSIONS = {
  gradebook:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance: { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:   { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:   { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

// Interval fetch permissions từ server (ms) — đủ nhanh để phản ánh thay đổi của BGH
const PERMISSIONS_POLL_INTERVAL = 15_000; // 15 giây

/**
 * Kiểm tra role có quyền truy cập module không.
 * Dùng DEFAULT_PERMISSIONS làm fallback cho module chưa có trong matrix.
 */
export function hasPermission(permissions, moduleId, role) {
  if (!moduleId) return true;
  const matrix = permissions ?? DEFAULT_PERMISSIONS;
  const modPerms = matrix[moduleId] ?? DEFAULT_PERMISSIONS[moduleId];
  if (!modPerms) return true;
  return modPerms[role] === true;
}

/**
 * Đọc trạng thái đăng nhập đã lưu từ localStorage.
 */
function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.user && parsed?.token) return parsed;
    }
    const legacyUser = localStorage.getItem('htqllh_user') || localStorage.getItem('edumanage_user');
    if (legacyUser) {
      localStorage.removeItem('htqllh_user');
      localStorage.removeItem('edumanage_user');
    }
  } catch { /* ignore */ }
  return { user: null, token: null };
}

/**
 * Component Nhà cung cấp ngữ cảnh xác thực (AuthProvider)
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Cây Component con được bao bọc
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [authState, setAuthState]         = useState(readStoredAuth);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  // Permissions luôn lấy từ server — không cache localStorage
  const [permissions, setPermissions]     = useState(DEFAULT_PERMISSIONS);
  const pollTimerRef                       = useRef(null);

  // ── Fetch permissions từ server ─────────────────────────────────────────────
  const fetchPermissionsFromServer = useCallback(async (token) => {
    if (!token) return;
    try {
      const data = await apiClient('/settings/permissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success && data?.data && typeof data.data === 'object') {
        // Merge với DEFAULT để luôn có đủ keys
        setPermissions({ ...DEFAULT_PERMISSIONS, ...data.data });
      }
    } catch {
      // Giữ nguyên permissions hiện tại nếu fetch thất bại
    }
  }, []);

  // ── Bắt đầu / dừng polling permissions ─────────────────────────────────────
  const startPolling = useCallback((token) => {
    // Clear timer cũ nếu có
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      fetchPermissionsFromServer(token);
    }, PERMISSIONS_POLL_INTERVAL);
  }, [fetchPermissionsFromServer]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ── Restore session khi mount ───────────────────────────────────────────────
  useEffect(() => {
    const { token } = authState;
    if (!token) return;

    setIsRestoringSession(true);
    apiClient('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (data?.user) {
          setAuthState((prev) => ({ ...prev, user: data.user }));
          // Fetch permissions ngay lập tức (không dùng cache)
          fetchPermissionsFromServer(token);
          // Bắt đầu polling để nhận thay đổi từ BGH
          startPolling(token);
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setIsRestoringSession(false));

    // Cleanup polling khi unmount
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('htqllh_user');
    localStorage.removeItem('edumanage_user');
    setAuthState({ user: null, token: null });
    setPermissions(DEFAULT_PERMISSIONS);
    stopPolling();
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  /**
   * Xử lý đăng nhập tài khoản:
   * @param {Object} credentials - Thông tin đăng nhập
   * @param {string} credentials.username - Tên đăng nhập
   * @param {string} credentials.password - Mật khẩu
   * @param {string} credentials.role - Vai trò đăng nhập (BGH, GVCN, GV, PH, HS)
   */
  const login = useCallback(async ({ username, password, role }) => {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: { username, password, role },
    });

    if (!data?.success || !data?.token || !data?.user) {
      throw new Error(data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }

    const newAuth = { user: data.user, token: data.token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
    setAuthState(newAuth);

    // Lấy user đầy đủ (có className)
    try {
      const meData = await apiClient('/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (meData?.user) {
        const fullAuth = { user: meData.user, token: data.token };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullAuth));
        setAuthState(fullAuth);
      }
    } catch { /* fallback to login response */ }

    // Fetch permissions ngay sau login
    await fetchPermissionsFromServer(data.token);
    // Bắt đầu polling
    startPolling(data.token);

    return data;
  }, [fetchPermissionsFromServer, startPolling]);

  /**
   * Xử lý đăng xuất:
   * Xóa sạch các khóa lưu trữ phiên và đưa state về null.
   */
  const logout = useCallback(() => {
    clearAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── updatePermissions: BGH gọi ngay sau khi lưu để UI phản ánh tức thì ─────
  const updatePermissions = useCallback((newMatrix) => {
    setPermissions({ ...DEFAULT_PERMISSIONS, ...newMatrix });
  }, []);

  /**
   * Giá trị Context được cung cấp cho toàn bộ cây Component
   */
  const value = {
    user: authState.user,
    token: authState.token,
    role: authState.user?.role ?? null,
    className: authState.user?.className ?? null,
    isAuthenticated: !!authState.user && !!authState.token,
    isRestoringSession,
    permissions,
    updatePermissions,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook `useAuth` - Giúp các Component con dễ dàng truy cập thông tin phiên
 * @returns {{ user: Object, role: string, isAuthenticated: boolean, login: Function, logout: Function }}
 * @throws {Error} Nếu gọi bên ngoài thẻ <AuthProvider>
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
