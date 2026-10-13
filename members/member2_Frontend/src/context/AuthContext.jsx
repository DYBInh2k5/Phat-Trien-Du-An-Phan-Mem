import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'htqllh_auth'; // key duy nhất lưu { user, token }

/**
 * Đọc trạng thái đăng nhập đã lưu từ localStorage.
 * Trả { user, token } hoặc { user: null, token: null }
 */
function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.user && parsed?.token) return parsed;
    }
    // Backward compat với key cũ (chỉ user, không có token)
    const legacyUser = localStorage.getItem('htqllh_user') || localStorage.getItem('edumanage_user');
    if (legacyUser) {
      // Xóa key cũ (không có token → không thể dùng)
      localStorage.removeItem('htqllh_user');
      localStorage.removeItem('edumanage_user');
    }
  } catch {
    // ignore
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // Khôi phục phiên: gọi /api/auth/me để xác minh token còn hiệu lực
  useEffect(() => {
    const { token } = authState;
    if (!token) return;

    setIsRestoringSession(true);
    apiClient('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (data?.user) {
          // Cập nhật thông tin user mới nhất từ DB
          setAuthState((prev) => ({
            ...prev,
            user: data.user,
          }));
        }
      })
      .catch(() => {
        // Token hết hạn hoặc không hợp lệ → đăng xuất
        clearAuth();
      })
      .finally(() => setIsRestoringSession(false));
    // Chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    // Xóa cả key cũ nếu còn
    localStorage.removeItem('htqllh_user');
    localStorage.removeItem('edumanage_user');
    setAuthState({ user: null, token: null });
  }

  /**
   * Đăng nhập: gọi API thật, lưu token + user vào localStorage.
   * Throws nếu API trả lỗi (401, 500, network error).
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

    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  const value = {
    user: authState.user,
    token: authState.token,
    role: authState.user?.role ?? null,
    isAuthenticated: !!authState.user && !!authState.token,
    isRestoringSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
