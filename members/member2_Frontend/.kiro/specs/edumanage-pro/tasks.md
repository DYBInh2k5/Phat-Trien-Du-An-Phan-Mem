# Implementation Plan: EduManage Pro

## Overview

Chuyển đổi 17 màn hình HTML tĩnh thành một ReactJS SPA hoàn chỉnh sử dụng Vite + React 18 + React Router DOM v6 + Tailwind CSS v3. Kế hoạch được chia thành 8 nhóm công việc, mỗi nhóm xây dựng tích lũy trên nhóm trước, kết thúc bằng việc kết nối toàn bộ hệ thống.

## Tasks

- [x] 1. Khởi tạo dự án và cấu hình Design System
  - [x] 1.1 Scaffold Vite + React 18 project và cài đặt dependencies
    - Chạy `npm create vite@latest edumanage-pro -- --template react` tại `d:\project\`
    - Cài đặt dependencies: `react-router-dom@6`, `tailwindcss@3`, `autoprefixer`, `postcss`
    - Chạy `npx tailwindcss init -p` để tạo `tailwind.config.js` và `postcss.config.js`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Cấu hình Tailwind với toàn bộ design tokens từ DESIGN.md
    - Cập nhật `tailwind.config.js`: thêm tất cả color tokens, fontSize/typography tokens, borderRadius tokens, spacing tokens, và boxShadow tokens vào `theme.extend`
    - Cấu hình `content` array: `['./index.html', './src/**/*.{js,jsx}']`
    - _Requirements: 1.3, 18.1, 18.2, 18.3, 18.4_

  - [ ]* 1.3 Write property test cho design token completeness
    - **Property 20: Design token completeness** — kiểm tra mọi color token trong DESIGN.md đều tồn tại trong tailwind.config.js với đúng hex value
    - **Property 21: Typography token completeness** — kiểm tra mọi typography style được map đúng fontSize, lineHeight, fontWeight
    - **Validates: Requirements 18.1, 18.2**

  - [x] 1.4 Cấu hình `index.html` và `src/index.css`
    - Thêm Google Fonts `<link>` cho "Be Vietnam Pro" (400, 500, 600, 700) và "Inter" (400, 500, 600) vào `index.html`
    - Thêm Material Symbols Outlined `<link>` từ Google Fonts CDN vào `index.html`
    - Cập nhật `src/index.css`: thêm `@tailwind base/components/utilities` directives; set default `font-family: 'Be Vietnam Pro', sans-serif` trong Tailwind base layer
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [x] 2. Hệ thống constants, API stubs và mock data
  - [x] 2.1 Tạo file constants: roles.js và routes.js
    - Tạo `src/constants/roles.js`: export object `ROLES` với keys `GV`, `GVCN`, `BGH`, `PH`, `HS`
    - Tạo `src/constants/routes.js`: export object `ROUTES` với tất cả path constants và object `ROLE_DASHBOARD` mapping role → dashboard path
    - _Requirements: 2.8, 17.6_

  - [x] 2.2 Tạo API stubs (`src/api/stubs.js`)
    - Implement hàm helper `createStub(name)` trả về async function log → delay 500ms → resolve
    - Export 9 named stub functions: `handleLoginSubmit` (với logic reject khi `username === 'error'`), `handleSaveGrades`, `handleSaveAttendance`, `handleSendNotification`, `handleSaveScheduleSlot`, `handleExportReport`, `handleCreateUser`, `handleUpdateUser`, `handleDeactivateUser`
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ]* 2.3 Write property tests cho API stubs
    - **Property 16: API stub logging invariant** — kiểm tra mọi stub đều emit `console.log` với prefix `[API STUB]`
    - **Property 17: API stub Promise resolution** — kiểm tra mọi stub trả về Promise resolve sau ~500ms
    - **Validates: Requirements 16.3, 16.4**

  - [x] 2.4 Tạo mock data (`src/data/mockData.js`)
    - Export static arrays: `students` (10+ entries), `classes` (5+ entries), `teachers` (8+ entries), `grades` (GradeEntry objects), `attendanceRecords`, `timetableSlots` (đủ dữ liệu cho 1 tuần, 2 lớp), `notifications`, `userAccounts`
    - Đảm bảo dữ liệu tuân theo interfaces trong design document
    - _Requirements: 16.5_

- [x] 3. AuthContext và ProtectedRoute
  - [x] 3.1 Implement AuthContext và AuthProvider (`src/context/AuthContext.jsx`)
    - Tạo `AuthContext` via `React.createContext`
    - Implement `AuthProvider` với lazy initializer từ `localStorage` key `edumanage_user`
    - Implement `login({ username, password, role })`: gọi `handleLoginSubmit` stub → store vào `localStorage` → update state
    - Implement `logout()`: remove `edumanage_user` từ `localStorage` → reset state
    - Export custom hook `useAuth`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property tests cho AuthContext
    - **Property 1: Login stores user in localStorage** — gọi `login()` với valid credentials, kiểm tra `localStorage.getItem('edumanage_user')` có giá trị đúng
    - **Property 2: Session restoration round-trip** — set localStorage trước, mount AuthProvider, kiểm tra `context.user` và `context.isAuthenticated`
    - **Property 3: Logout clears all auth state** — đăng nhập rồi logout, kiểm tra localStorage null và context state reset
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [x] 3.3 Implement ProtectedRoute (`src/components/auth/ProtectedRoute.jsx`)
    - Nhận props `roles: string[]`
    - Nếu `!isAuthenticated` → `<Navigate to={ROUTES.LOGIN} replace />`
    - Nếu `!roles.includes(role)` → `<Navigate to={ROUTES.UNAUTHORIZED} replace />`
    - Trả về `children ?? <Outlet />`
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ]* 3.4 Write property tests cho ProtectedRoute
    - **Property 4: Unauthenticated access always redirects to /login** — mock unauthenticated AuthContext, render ProtectedRoute với bất kỳ roles array, kiểm tra redirect đến `/login`
    - **Property 5: Insufficient role always redirects to /unauthorized** — mock authenticated user với role không thuộc roles array, kiểm tra redirect đến `/unauthorized`
    - **Property 18: Protected route coverage** — kiểm tra mọi route trong AppRouter (trừ /login, /unauthorized, *) đều được wrap bởi ProtectedRoute với non-empty roles array
    - **Validates: Requirements 2.6, 2.7, 17.2**

- [x] 4. Layout Shell: MainLayout, Sidebar, Header
  - [x] 4.1 Implement Sidebar (`src/components/layout/Sidebar.jsx`)
    - Define `NAV_ITEMS` array với đầy đủ label, icon (Material Symbol name), path, roles cho 11 menu items
    - Filter items theo `role` từ `useAuth()`
    - Render collapsed (68px) / expanded (260px) state dựa trên prop `isCollapsed`
    - Active item: `bg-[#2563eb] text-white`; inactive: hover state `bg-[#f1f5f9]`
    - Render Material Symbols Outlined icons qua `<span className="material-symbols-outlined">`
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Write property test cho role-based navigation filtering
    - **Property 7: Role-based navigation filtering** — với mỗi role trong ROLES, render Sidebar và kiểm tra items hiển thị là đúng tập hợp items có role đó trong `roles` array
    - **Validates: Requirements 4.4**

  - [x] 4.3 Implement Header (`src/components/layout/Header.jsx`)
    - Render page title (nhận qua props hoặc context), user avatar placeholder, và logout button
    - Logout button gọi `useAuth().logout()` rồi navigate đến `/login`
    - _Requirements: 4.2_

  - [x] 4.4 Implement MainLayout (`src/components/layout/MainLayout.jsx`)
    - State `isCollapsed` khởi tạo từ `localStorage.getItem('sidebar_collapsed')`
    - `useEffect` persist `isCollapsed` vào `localStorage` mỗi khi thay đổi
    - Layout: `flex h-screen` — Sidebar bên trái, flex-col container bên phải (Header + main `<Outlet />`)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 4.5 Write property test cho sidebar collapse persistence
    - **Property 6: Sidebar toggle persists state** — toggle sidebar, kiểm tra `localStorage.getItem('sidebar_collapsed')` phản ánh đúng state mới
    - **Validates: Requirements 4.3**

- [x] 5. Shared UI Components
  - [x] 5.1 Implement StatusBadge (`src/components/shared/StatusBadge.jsx`)
    - Nhận props `status` và `label`
    - Map status → Tailwind classes theo `STATUS_STYLES` object trong design
    - Height 22px, `text-label-sm`, `font-weight: 500`, `px-2.5 py-0.5`, `rounded-full`
    - _Requirements: 7.7, 9.8, 13.6, 18.7_

  - [x] 5.2 Implement KpiCard (`src/components/shared/KpiCard.jsx`)
    - Nhận props: `label`, `value`, `icon`, `trend?`, `trendPositive?`
    - White surface, `border border-[#e2e8f0]`, `shadow-elevation-1`, padding 16-20px
    - Render icon via Material Symbols, value dùng `text-data-metric`, trend chip với màu success/error
    - _Requirements: 5.5, 6.2, 18.5_

  - [x] 5.3 Implement Modal (`src/components/shared/Modal.jsx`)
    - Nhận props: `isOpen`, `onClose`, `title`, `children`, `size?`
    - Sử dụng `createPortal` render vào `document.body`
    - Backdrop: `rgba(15,23,42,0.4)` với `backdrop-filter: blur(4px)`
    - Elevation Level 3 shadow; close on backdrop click và Escape key
    - _Requirements: 12.3, 15.3, 18.6_

  - [x] 5.4 Implement DataTable (`src/components/shared/DataTable.jsx`)
    - Reusable table component nhận `columns`, `data`, `stickyFirstColumn?`
    - Header: `bg-[#f8fafc]`, text `#475569`, uppercase `text-label-sm`, height 40px
    - Row: height 44px, hover `bg-[#f8fafc]`, border-bottom `#f1f5f9`
    - Apply `font-variant-numeric: tabular-nums` và `text-data-table` font token
    - _Requirements: 8.2, 8.10, 14.7, 18.8_

- [x] 6. Checkpoint — Kiểm tra foundation
  - Đảm bảo tất cả tests pass, kiểm tra Tailwind tokens được áp dụng đúng trong shared components, sidebar navigation hoạt động đúng theo role. Hỏi user nếu có vấn đề phát sinh.

- [ ] 7. Auth Pages và Routing
  - [x] 7.1 Implement LoginPage (`src/pages/auth/LoginPage.jsx`)
    - 3 tabs: "GV / Cán bộ", "PH / Học sinh", "BGH / Quản trị" — state `activeRole`
    - Controlled form: `formData` (username, password), `error`, `isLoading` states
    - Submit flow: `e.preventDefault()` → `setIsLoading(true)` → `login({ ...formData, role: activeRole })` → navigate đến `ROLE_DASHBOARD[activeRole]`
    - Error: hiển thị `<p className="text-[#dc2626] text-body-sm mt-2">` sau khi reject
    - Nếu đã authenticated → redirect đến dashboard
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 7.2 Implement UnauthorizedPage và NotFoundPage
    - `src/pages/auth/UnauthorizedPage.jsx`: Thông báo lỗi quyền truy cập + nút "Quay lại" navigate đến `ROLE_DASHBOARD[role]`
    - `src/pages/shared/NotFoundPage.jsx`: 404 page với nút quay lại
    - _Requirements: 17.3, 17.4_

  - [-] 7.3 Implement AppRouter (`src/routes/AppRouter.jsx`)
    - Import và sử dụng `<Routes>`, `<Route>` từ React Router DOM v6
    - Route index `/`: redirect logic dựa trên `isAuthenticated` và `ROLE_DASHBOARD[role]`
    - Route `/login`: `<LoginPage />` (không có ProtectedRoute)
    - Route `/unauthorized`: `<UnauthorizedPage />`
    - Layout route `element={<MainLayout />}` chứa tất cả protected routes
    - Wrap routes đúng role theo design (GV/GVCN routes, BGH routes, shared routes)
    - Catch-all `*`: `<NotFoundPage />`
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ]* 7.4 Write property test cho root path redirect
    - **Property 19: Root path redirect correctness** — unauthenticated user → `/login`; authenticated user với mỗi role → `ROLE_DASHBOARD[role]`
    - **Validates: Requirements 17.5**

  - [-] 7.5 Implement App.jsx (entry wiring)
    - Wrap toàn bộ app với `<AuthProvider>` và `<BrowserRouter>`
    - Render `<AppRouter />`
    - _Requirements: 2.1, 17.1_

- [ ] 8. GV Pages: Dashboard, Gradebook, Attendance
  - [-] 8.1 Implement GVDashboardPage (`src/pages/gv/GVDashboardPage.jsx`)
    - 4 KPI cards sử dụng `<KpiCard>`: số lớp đang dạy, tổng học sinh, số buổi học tuần này, tỉ lệ chuyên cần TB
    - Summary table recent grade entries: dùng `<DataTable>` với columns (tên học sinh, môn, điểm, ngày)
    - Upcoming schedule items cho tuần hiện tại
    - Data từ `mockData.js`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [-] 8.2 Implement GradebookPage (`src/pages/gv/GradebookPage.jsx`)
    - Filter toolbar: class selector, subject selector, semester selector dropdowns
    - Sticky first column (student name), scrollable grade columns với `overflow-x-auto`
    - Grade cell color-coding: `< 5.0` → `bg-[#fef2f2] text-[#dc2626] font-bold`; `>= 8.0` → `bg-[#f0fdf4] text-[#16a34a]`
    - States: `grades`, `editingCell`, `pendingValue`
    - BGH role: `pointer-events-none` — read-only
    - `handleCellBlur`: validate [0,10], revert nếu invalid, hiện tooltip error
    - "Lưu điểm" button gọi `handleSaveGrades` stub
    - Apply `font-variant-numeric: tabular-nums`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

  - [ ]* 8.3 Write property tests cho GradebookPage
    - **Property 9: Grade cell color coding invariant** — với mọi numeric value v, kiểm tra đúng bg-color và text-color class được áp dụng
    - **Property 10: Grade validation revert** — nhập giá trị ngoài [0,10], kiểm tra cell revert về giá trị cũ và không có invalid value trong state
    - **Validates: Requirements 8.3, 8.5, 8.6**

  - [-] 8.4 Implement AttendancePage (`src/pages/gv/AttendancePage.jsx`)
    - Filter: `<input type="date">` và class selector dropdown
    - Mỗi student row: 3 toggle buttons (Có mặt/Trễ/Vắng) với active/inactive styles theo status colors
    - State `attendanceMap`: `{ [studentId]: 'present' | 'late' | 'absent' }`
    - `useMemo` session summary: `{ present, late, absent }` counts
    - "Lưu điểm danh" gọi `handleSaveAttendance` stub với payload đầy đủ
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 8.5 Write property tests cho AttendancePage
    - **Property 11: Attendance status update correctness** — click status button cho 1 student, kiểm tra chỉ student đó thay đổi status
    - **Property 12: Attendance summary count invariant** — với bất kỳ tập hợp status assignments, `present + late + absent === totalStudents`
    - **Validates: Requirements 9.4, 9.5**

- [ ] 9. Student List và Timetable Pages
  - [x] 9.1 Implement StudentListPage (`src/pages/students/StudentListPage.jsx`)
    - View toggle: "Card View" / "Photo Frame View" — state `viewMode`
    - Filter toolbar: search input, class selector, status filter chip group
    - Real-time filter: `useMemo` filter students theo `searchTerm` (case-insensitive, name hoặc studentId), selectedClass, selectedStatus
    - Card View: render student cards với photo placeholder, tên, mã HS, lớp, `<StatusBadge>`
    - Photo Frame View: grid layout với photo placeholder, tên, lớp
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 9.2 Write property test cho student search filtering
    - **Property 8: Real-time student search filtering** — với mọi search string q, kiểm tra displayed students là đúng tập hợp students có name hoặc id chứa q (case-insensitive)
    - **Validates: Requirements 7.6**

  - [x] 9.3 Implement TimetablePage (`src/pages/schedule/TimetablePage.jsx`)
    - 5-column grid (Thứ 2–6), rows là tiết học (1–10)
    - Mỗi cell: subject name, teacher name, room, time range
    - Empty cell: `bg-[#f8fafc]` muted state
    - Class selector và week selector dropdowns
    - Filter logic cập nhật grid từ `mockData.timetableSlots` khi selection thay đổi
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 9.4 Write property test cho timetable grid data consistency
    - **Property 14: Timetable grid data consistency** — với mỗi cặp (classId, weekStart), kiểm tra cells render đúng khớp với mockData entries
    - **Validates: Requirements 11.6**

- [ ] 10. BGH Pages: Dashboard, Attendance Monitor, Schedule Admin
  - [x] 10.1 Implement BGHDashboardPage (`src/pages/bgh/BGHDashboardPage.jsx`)
    - 4 system-wide KPI cards: tổng HS, tổng GV, tỉ lệ chuyên cần toàn trường, tỉ lệ đạt học lực
    - Static attendance trend chart area (HTML/CSS, không cần charting library) — visual bar chart dùng div widths
    - Alerts panel: học sinh chuyên cần < 80% và GPA < 5.0 từ mockData
    - Recent activity logs list (grade submissions, schedule changes)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.2 Implement BGHAttendanceMonitorPage (`src/pages/bgh/BGHAttendanceMonitorPage.jsx`)
    - Summary table: columns (lớp, GVCN, tổng HS, tỉ lệ chuyên cần %, số HS dưới ngưỡng)
    - Row highlight: `tỉ lệ chuyên cần < 80%` → `bg-[#fff7ed]` row background
    - Filter: date range (2 `<input type="date">`) và class filter dropdown
    - Filter updates displayed data từ local static dataset
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 10.3 Write property test cho BGH attendance row highlight
    - **Property 13: BGH attendance row highlight invariant** — với mọi row có tỉ lệ < 80% → `bg-[#fff7ed]`; với mọi row có tỉ lệ >= 80% → không có warning bg
    - **Validates: Requirements 10.3**

  - [x] 10.4 Implement ScheduleAdminPage (`src/pages/bgh/ScheduleAdminPage.jsx`)
    - Full timetable grid (tất cả lớp, có thể select qua dropdown)
    - Click empty cell → mở `<Modal>` với form điền subject, teacher, room (controlled component với dropdowns từ mockData)
    - Click occupied cell → mở Modal pre-populated với slot data hiện tại
    - Conflict detection: check trùng teacherName hoặc room trong cùng dayOfWeek + period → highlight `bg-[#fef2f2]`
    - Submit gọi `handleSaveScheduleSlot` stub → optimistic update timetable grid
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 10.5 Write property test cho schedule conflict highlighting
    - **Property 15: Schedule conflict cell highlighting** — tạo 2 slots trùng teacher/room + dayOfWeek + period, kiểm tra cả 2 cells có `bg-[#fef2f2]`; cells không conflict không có bg đó
    - **Validates: Requirements 12.7**

- [x] 11. Communication và BGH Report/Settings Pages
  - [x] 11.1 Implement ParentCommunicationPage (`src/pages/communication/ParentCommunicationPage.jsx`)
    - Tab navigation: "Thông báo" và "Trao đổi" tabs — state `activeTab`
    - "Thông báo" tab: list messages grouped by parent/student, ordered by most recent; form "Tạo thông báo mới" (controlled: tiêu đề, nội dung, loại, danh sách nhận); submit gọi `handleSendNotification` stub; `<StatusBadge>` cho trạng thái ("Đã gửi", "Đã đọc", "Chờ xử lý")
    - "Trao đổi" tab: threaded message exchanges với individual parents (GVCN 10A1 context)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 11.2 Implement BGHReportCenterPage (`src/pages/bgh/BGHReportCenterPage.jsx`)
    - Tab navigation: "Học lực" và "Chất số điểm" — state `activeTab`
    - Semester và academic year selector dropdowns — update tất cả data panels khi thay đổi
    - "Học lực" tab: tỉ lệ học lực per grade level table, school-wide GPA trend table, subject performance comparison table — color-coded cells
    - "Chất số điểm" tab: on-time grade submission rates per teacher, grade distribution table, anomaly flags
    - Export buttons gọi `handleExportReport({ format: 'excel'|'pdf', reportType })`
    - Tất cả tables dùng `text-data-table` và `font-variant-numeric: tabular-nums`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [x] 11.3 Implement SystemSettingsPage (`src/pages/bgh/SystemSettingsPage.jsx`)
    - Tab navigation: "Quản lý người dùng" và "Phân quyền chi tiết" tabs
    - "Quản lý người dùng" tab: DataTable với columns (họ tên, username, vai trò, trạng thái, hành động); "Thêm người dùng" button mở Modal với controlled form (họ tên, username, mật khẩu, email, vai trò, trạng thái); clear form on modal close
    - "Chỉnh sửa" → modal pre-populated, submit gọi `handleUpdateUser`
    - "Vô hiệu hóa" → gọi `handleDeactivateUser` → optimistic update status badge
    - "Phân quyền chi tiết" tab: permission matrix grid (roles as columns, feature modules as rows, read-only checkboxes)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

- [x] 12. Final Checkpoint — Tích hợp và kiểm tra toàn hệ thống
  - Đảm bảo tất cả routes hoạt động đúng với role-based access control. Kiểm tra toàn bộ navigation flow từ login → dashboard → các module. Verify tất cả API stub calls được log đúng prefix. Đảm bảo tất cả tests pass. Hỏi user nếu có vấn đề phát sinh.

## Notes

- Tasks đánh dấu `*` là optional, có thể bỏ qua khi cần MVP nhanh
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Property tests validate các invariants quan trọng (auth, filtering, rendering)
- Mock data và API stubs được thiết kế để dễ dàng swap với real backend
- Design tokens từ DESIGN.md phải được áp dụng nhất quán thông qua Tailwind config
- Vite dev server: `npm run dev`; Build: `npm run build`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "2.1", "2.2", "2.4"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "4.1", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["4.2", "4.3"] },
    { "id": 7, "tasks": ["4.4", "4.5"] },
    { "id": 8, "tasks": ["7.1", "7.2"] },
    { "id": 9, "tasks": ["7.3"] },
    { "id": 10, "tasks": ["7.4", "7.5"] },
    { "id": 11, "tasks": ["8.1", "8.2", "8.4", "9.1", "9.3", "10.1", "10.2", "10.4", "11.1", "11.2", "11.3"] },
    { "id": 12, "tasks": ["8.3", "8.5", "9.2", "9.4", "10.3", "10.5"] }
  ]
}
```
