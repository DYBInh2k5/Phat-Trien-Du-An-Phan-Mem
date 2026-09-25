import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { ROUTES } from '../../constants/routes.js';

// Map route path → page title (Vietnamese)
const PAGE_TITLES = {
  [ROUTES.GV_DASHBOARD]:         'Tổng quan',
  [ROUTES.BGH_DASHBOARD]:        'Tổng quan quản trị',
  [ROUTES.STUDENTS]:             'Danh sách học sinh',
  [ROUTES.GRADEBOOK]:            'Sổ điểm',
  [ROUTES.ATTENDANCE]:           'Điểm danh chuyên cần',
  [ROUTES.BGH_ATTENDANCE]:       'Giám sát chuyên cần',
  [ROUTES.SCHEDULE]:             'Thời khóa biểu',
  [ROUTES.BGH_SCHEDULE_ADMIN]:   'Xếp thời khóa biểu',
  [ROUTES.PARENT_COMMUNICATION]: 'Sổ liên lạc',
  [ROUTES.BGH_REPORTS]:          'Trung tâm báo cáo',
  [ROUTES.BGH_SETTINGS]:         'Cài đặt hệ thống',
};

export default function MainLayout() {
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'EduManage Pro';

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Left sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(c => !c)}
      />

      {/* Right column: header + scrollable content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-auto p-gutter-lg bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
