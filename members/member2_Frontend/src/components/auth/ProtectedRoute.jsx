/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/auth/ProtectedRoute.jsx
 * Vai trò: Vỏ Bọc Bảo Vệ Tuyến Đường (Route Guarding Component)
 * Cơ chế bảo mật: Kiểm tra xác thực (Authentication) & Phân quyền (Authorization)
 * Mô tả:
 *   - Chặn người dùng chưa đăng nhập: Tự động chuyển hướng về trang /login.
 *   - Chặn người dùng không có quyền: So khớp vai trò với danh sách cho phép (roles).
 *     Nếu vi phạm, chuyển hướng về trang /unauthorized (403).
 *   - Cho phép hiển thị nội dung hợp lệ thông qua children hoặc thẻ <Outlet />.
 * ==============================================================================
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

/**
 * Component ProtectedRoute - Bảo vệ các tuyến đường yêu cầu phân quyền
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {Array<string>} [props.roles] - Mảng danh sách các vai trò được phép truy cập (ví dụ: [ROLES.BGH, ROLES.GVCN])
 * @param {React.ReactNode} [props.children] - Component con cần hiển thị (nếu không truyền sẽ dùng Outlet)
 * @returns {JSX.Element}
 */
export default function ProtectedRoute({ roles, children }) {
  // Lấy trạng thái đăng nhập và vai trò hiện tại từ AuthContext
  const { isAuthenticated, role } = useAuth();

  // 1. KIỂM TRA XÁC THỰC (AUTHENTICATION):
  // Nếu người dùng chưa đăng nhập, lập tức chuyển hướng về trang Login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 2. KIỂM TRA PHÂN QUYỀN (ROLE-BASED AUTHORIZATION):
  // Nếu tuyến đường có quy định danh sách quyền và vai trò hiện tại không nằm trong danh sách
  if (roles && !roles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // 3. HỢP LỆ: Cho phép người dùng truy cập vào trang con
  return children ?? <Outlet />;
}
