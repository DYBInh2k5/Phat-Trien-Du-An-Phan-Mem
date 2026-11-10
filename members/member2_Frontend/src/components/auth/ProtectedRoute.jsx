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
 * Route bảo vệ bằng xác thực JWT + phân quyền theo role.
 * - Nếu đang khôi phục phiên (kiểm tra token với /api/auth/me): hiển thị loading
 * - Nếu chưa xác thực: redirect về /login
 * - Nếu không đủ quyền: redirect về /unauthorized
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {Array<string>} [props.roles] - Mảng danh sách các vai trò được phép truy cập (ví dụ: [ROLES.BGH, ROLES.GVCN])
 * @param {React.ReactNode} [props.children] - Component con cần hiển thị (nếu không truyền sẽ dùng Outlet)
 * @returns {JSX.Element}
 */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role, isRestoringSession } = useAuth();

  // Đang kiểm tra xem token còn hiệu lực không → hiển thị loading thay vì redirect sớm
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium">Đang khôi phục phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

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
