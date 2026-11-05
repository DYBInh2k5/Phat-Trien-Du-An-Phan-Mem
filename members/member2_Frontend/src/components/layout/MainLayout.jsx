/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/MainLayout.jsx
 * Vai trò: Khung Bố Cục Giao Diện Chính (Master Application Shell)
 * Kiến trúc: Single Page Application (SPA) - React Router DOM Outlet
 * Mô tả:
 *   - Định hình khung hiển thị chung cho toàn bộ các trang chức năng nội bộ.
 *   - Tích hợp thanh điều hướng bên trái (Sidebar) và thanh tiêu đề (Header).
 *   - Sử dụng thẻ <Outlet /> để nạp các trang con động mà không làm tải lại trình duyệt.
 *   - Quản lý trạng thái thu gọn/mở rộng Sidebar bền vững thông qua localStorage.
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { ROUTES } from '../../constants/routes.js';

/**
 * Bảng tra cứu ánh xạ đường dẫn URL (Route Path) sang Tiêu đề trang tiếng Việt.
 * Tiêu đề này sẽ được truyền vào Component Header để hiển thị trên thanh trên cùng.
 */
const PAGE_TITLES = {
  [ROUTES.GV_DASHBOARD]:         'Tổng quan Giáo viên',
  [ROUTES.BGH_DASHBOARD]:        'Tổng quan Ban Giám Hiệu',
  [ROUTES.STUDENTS]:             'Danh sách học sinh',
  [ROUTES.GRADEBOOK]:            'Sổ điểm điện tử môn học',
  [ROUTES.ATTENDANCE]:           'Điểm danh chuyên cần',
  [ROUTES.BGH_ATTENDANCE]:       'Giám sát chuyên cần toàn trường',
  [ROUTES.SCHEDULE]:             'Thời khóa biểu giảng dạy',
  [ROUTES.BGH_SCHEDULE_ADMIN]:   'Xếp thời khóa biểu học vụ',
  [ROUTES.PARENT_COMMUNICATION]: 'Sổ liên lạc & Duyệt đơn xin phép',
  [ROUTES.BGH_REPORTS]:          'Trung tâm báo cáo thống kê',
  [ROUTES.BGH_SETTINGS]:         'Cài đặt hệ thống & Phân quyền',
};

/**
 * Component MainLayout - Vỏ bọc bố cục chính của ứng dụng
 * @component
 * @returns {JSX.Element} Khung giao diện Application Shell bao gồm Sidebar, Header và Outlet
 */
export default function MainLayout() {
  // Lấy đối tượng vị trí URL hiện tại từ React Router để nhận diện trang đang mở
  const location = useLocation();

  /**
   * Trạng thái thu gọn/mở rộng thanh Sidebar.
   * Khởi tạo giá trị ban đầu từ localStorage để ghi nhớ sở thích hiển thị của người dùng sau khi refresh.
   */
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  /**
   * Hiệu ứng phụ: Đồng bộ trạng thái thu gọn Sidebar vào localStorage mỗi khi giá trị thay đổi.
   */
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Xác định tiêu đề hiển thị trên Header tương ứng với URL hiện hành (mặc định 'HTQLLH')
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'HTQLLH';

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* 
        1. THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR):
        - Cố định chiều cao 100vh.
        - Tự động lọc danh mục menu theo vai trò người dùng (RBAC).
        - Có nút thu gọn/mở rộng linh hoạt (68px <-> 260px).
      */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(c => !c)}
      />

      {/* 
        2. CỘT HIỂN THỊ NỘI DUNG BÊN PHẢI (HEADER + MAIN CONTENT):
        - Chiếm toàn bộ không gian còn lại (flex-1).
        - Header cố định trên cùng hiển thị tiêu đề và thông tin tài khoản đăng nhập.
      */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Thanh tiêu đề đỉnh trang kèm thông tin người dùng và nút đăng xuất */}
        <Header title={pageTitle} />

        {/* 
          Vùng nội dung chính cuộn dọc độc lập:
          Thẻ <Outlet /> là nơi các màn hình chức năng (GradebookPage, AttendancePage, ...) 
          được React Router gắn kết (mount) vào mà KHÔNG kích hoạt cơ chế tải lại toàn trang (No Full Page Reload).
        */}
        <main className="flex-1 overflow-auto p-gutter-lg bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
