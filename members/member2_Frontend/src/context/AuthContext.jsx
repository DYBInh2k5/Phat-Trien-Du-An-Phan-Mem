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
 * ==============================================================================
 */

import { createContext, useContext, useState } from 'react';
import { handleLoginSubmit } from '../api/stubs.js';

// Khởi tạo đối tượng Context mặc định là null
const AuthContext = createContext(null);

/**
 * Component Nhà cung cấp ngữ cảnh xác thực (AuthProvider)
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Cây Component con được bao bọc
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  /**
   * Khởi tạo trạng thái người dùng từ localStorage.
   * Sử dụng hàm lazy initializer để chỉ đọc localStorage một lần khi component mount.
   */
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('htqllh_user') || localStorage.getItem('edumanage_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * Xử lý đăng nhập tài khoản:
   * @param {Object} credentials - Thông tin đăng nhập
   * @param {string} credentials.username - Tên đăng nhập
   * @param {string} credentials.password - Mật khẩu
   * @param {string} credentials.role - Vai trò đăng nhập (BGH, GVCN, GV, PH, HS)
   */
  const login = async ({ username, password, role }) => {
    // Gọi hàm kiểm tra thông tin đăng nhập
    await handleLoginSubmit({ username, password, role });
    
    // Đóng gói đối tượng người dùng
    const userObj = { username, role, name: username };
    
    // Lưu vĩnh viễn vào localStorage để duy trì phiên làm việc
    localStorage.setItem('htqllh_user', JSON.stringify(userObj));
    
    // Cập nhật state để kích hoạt reactive re-render trên toàn hệ thống
    setUser(userObj);
  };

  /**
   * Xử lý đăng xuất:
   * Xóa sạch các khóa lưu trữ phiên và đưa state về null.
   */
  const logout = () => {
    localStorage.removeItem('htqllh_user');
    localStorage.removeItem('edumanage_user');
    setUser(null);
  };

  /**
   * Giá trị Context được cung cấp cho toàn bộ cây Component
   */
  const value = {
    user,                           // Đối tượng người dùng { username, role, name }
    role: user?.role ?? null,       // Vai trò người dùng (BGH, GVCN, GV, PH, HS)
    isAuthenticated: !!user,        // Trạng thái đã đăng nhập hay chưa (boolean)
    login,                          // Hàm đăng nhập
    logout,                         // Hàm đăng xuất
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
