# Requirements Document

## Introduction

EduManage Pro là một hệ thống quản lý dạy học và học vụ trường học được xây dựng bằng ReactJS. Hệ thống chuyển đổi và hợp nhất 17 màn hình HTML tĩnh (xuất từ Google Stitch) thành một Single Page Application hoàn chỉnh với xác thực phân quyền theo vai trò, quản lý điểm số, điểm danh, thời khóa biểu, sổ liên lạc phụ huynh và trung tâm báo cáo BGH. Dự án sử dụng Vite + React 18 + React Router DOM v6 + Tailwind CSS v3, tuân thủ design system "EdTech Clean Minimalist" được định nghĩa trong DESIGN.md.

## Glossary

- **EduManage Pro**: Hệ thống quản lý dạy học và học vụ trường học — ứng dụng SPA chính.
- **AuthContext**: React Context lưu trữ thông tin user hiện tại và vai trò (role).
- **ProtectedRoute**: Component kiểm tra xác thực và phân quyền trước khi render route.
- **GV**: Giáo viên bộ môn — vai trò có quyền xem/nhập điểm và điểm danh lớp mình dạy.
- **GVCN**: Giáo viên chủ nhiệm — GV có thêm quyền quản lý sổ liên lạc lớp chủ nhiệm.
- **BGH**: Ban Giám Hiệu — vai trò có quyền quản trị toàn hệ thống, xem tất cả báo cáo.
- **PH**: Phụ huynh học sinh — vai trò chỉ xem điểm và thông báo của con em mình.
- **HS**: Học sinh — vai trò xem thông tin cá nhân, điểm số và thời khóa biểu.
- **Design Token**: Giá trị thiết kế (màu sắc, typography, spacing) được định nghĩa trong DESIGN.md và import vào tailwind.config.js.
- **API Stub**: Hàm JavaScript giả lập API call, log dữ liệu ra console và trả về Promise resolved.
- **Material Symbols Outlined**: Bộ icon từ Google Material Symbols được nhúng qua Google Fonts CDN.
- **Controlled Component**: React component có form state được quản lý hoàn toàn qua useState hook.
- **SPA**: Single Page Application — ứng dụng không reload trang khi điều hướng.

## Requirements

### Requirement 1: Cấu trúc dự án và cấu hình

**User Story:** As a developer, I want a properly scaffolded Vite + React 18 project with Tailwind CSS and all design tokens configured, so that I can build consistent UI components without manual CSS overrides.

#### Acceptance Criteria

1. THE EduManage Pro SHALL be initialized as a Vite project with React 18 template located at `d:\project\edumanage-pro`.
2. THE EduManage Pro SHALL include `react-router-dom` v6, `tailwindcss` v3, `autoprefixer`, and `postcss` as dependencies in `package.json`.
3. THE EduManage Pro SHALL configure `tailwind.config.js` with all color tokens, typography scale, border-radius values, and spacing values extracted from DESIGN.md under the `theme.extend` section.
4. THE EduManage Pro SHALL load "Be Vietnam Pro" (weights 400, 500, 600, 700) and "Inter" (weights 400, 500, 600) from Google Fonts via a `<link>` tag in `index.html`.
5. THE EduManage Pro SHALL load Material Symbols Outlined icon font from Google Fonts CDN via a `<link>` tag in `index.html`.
6. THE EduManage Pro SHALL set `font-family: 'Be Vietnam Pro', sans-serif` as the default body font in `src/index.css` using the Tailwind base layer.
7. THE EduManage Pro SHALL define `src/index.css` importing Tailwind base, components, and utilities directives.

### Requirement 2: Hệ thống xác thực và phân quyền

**User Story:** As a school staff member, I want to log in with my credentials and be directed to the correct dashboard based on my role, so that I only see features relevant to my responsibilities.

#### Acceptance Criteria

1. THE EduManage Pro SHALL provide an `AuthContext` created via `React.createContext` that exposes `user`, `role`, `login`, and `logout` functions to all descendant components.
2. WHEN a user calls the `login` function with `{ username, password, role }`, THE AuthContext SHALL store the user object in `localStorage` under the key `edumanage_user` and update the context state synchronously.
3. WHEN the application initializes, THE AuthContext SHALL read `localStorage` key `edumanage_user` and restore the authenticated session if a valid value exists.
4. WHEN a user calls the `logout` function, THE AuthContext SHALL remove `edumanage_user` from `localStorage` and reset context state to unauthenticated.
5. THE EduManage Pro SHALL provide a `ProtectedRoute` component that accepts a `roles` prop (array of allowed role strings).
6. WHEN an unauthenticated user navigates to any protected path, THE ProtectedRoute SHALL redirect the user to `/login` using React Router's `<Navigate>` component.
7. WHEN an authenticated user navigates to a route with insufficient role, THE ProtectedRoute SHALL redirect the user to a `/unauthorized` page.
8. THE EduManage Pro SHALL define role constants: `ROLES.GV`, `ROLES.GVCN`, `ROLES.BGH`, `ROLES.PH`, `ROLES.HS` in `src/constants/roles.js`.

### Requirement 3: Màn hình đăng nhập

**User Story:** As a user of any role, I want to log in through a unified login screen with role-specific tabs, so that I can authenticate with credentials relevant to my role.

#### Acceptance Criteria

1. THE Login Screen SHALL render at the `/login` route and be accessible without authentication.
2. THE Login Screen SHALL display three tabs: "GV / Cán bộ", "PH / Học sinh", and "BGH / Quản trị".
3. WHEN a user clicks a tab, THE Login Screen SHALL switch the active tab and update the form context (placeholder text, role value) accordingly.
4. THE Login Screen SHALL render a controlled form with `username` and `password` fields managed via `useState`.
5. WHEN a user submits the login form, THE Login Screen SHALL call the `handleLoginSubmit` API stub function with `{ username, password, role }`.
6. WHEN `handleLoginSubmit` resolves successfully, THE Login Screen SHALL call `AuthContext.login` and navigate the user to the role-appropriate dashboard route.
7. IF `handleLoginSubmit` rejects, THEN THE Login Screen SHALL display an inline error message below the form without page reload.
8. WHEN an authenticated user navigates to `/login`, THE Login Screen SHALL redirect the user to their role-appropriate dashboard.
9. THE Login Screen SHALL apply the EdTech Clean Minimalist design tokens: primary blue `#2563eb` for the active tab indicator and submit button, surface background `#f8f9ff`, and `Be Vietnam Pro` font.

### Requirement 4: Layout chính và điều hướng

**User Story:** As an authenticated user, I want a consistent application shell with a sidebar navigation and header, so that I can navigate between modules efficiently.

#### Acceptance Criteria

1. THE Main Layout SHALL render a fixed left navigation sidebar (260px expanded, 68px collapsed) for all authenticated routes.
2. THE Main Layout SHALL render a top header bar with the page title, user avatar, and a logout button.
3. WHEN a user clicks the sidebar collapse toggle button, THE Main Layout SHALL toggle the sidebar width between 260px and 68px and persist the collapsed state in `localStorage`.
4. THE Main Layout SHALL filter navigation menu items based on the authenticated user's role from AuthContext, showing only routes accessible to that role.
5. THE Main Layout SHALL highlight the active navigation item using the primary color `#2563eb` as background and `#ffffff` as text color.
6. THE Main Layout SHALL use Material Symbols Outlined icons for all navigation menu items.

### Requirement 5: Dashboard Giáo viên

**User Story:** As a GV/GVCN, I want an overview dashboard showing my classes, recent grades, and attendance status, so that I can quickly assess my workload and priorities.

#### Acceptance Criteria

1. THE GV Dashboard SHALL render at the `/gv/dashboard` route, accessible only to users with role `GV` or `GVCN`.
2. THE GV Dashboard SHALL display KPI metric cards showing: số lớp đang dạy, tổng số học sinh, số buổi học tuần này, and tỉ lệ chuyên cần trung bình.
3. THE GV Dashboard SHALL display a summary table of recent grade entries with student name, subject, grade, and date columns.
4. THE GV Dashboard SHALL display upcoming schedule items for the current week.
5. THE GV Dashboard KPI cards SHALL follow the design specification: white surface, `1px solid #e2e8f0` border, `label-sm` muted label, `data-metric` value typography, and trend chip with color coding.

### Requirement 6: Dashboard Ban Giám Hiệu

**User Story:** As a BGH administrator, I want a system-wide oversight dashboard with aggregate statistics and alerts, so that I can monitor school performance and act on critical issues.

#### Acceptance Criteria

1. THE BGH Dashboard SHALL render at the `/bgh/dashboard` route, accessible only to users with role `BGH`.
2. THE BGH Dashboard SHALL display system-wide KPI cards: tổng số học sinh, tổng số giáo viên, tỉ lệ chuyên cần toàn trường, and tỉ lệ đạt học lực.
3. THE BGH Dashboard SHALL display a school-wide attendance trend chart area (static data visualization using HTML/CSS, no charting library required).
4. THE BGH Dashboard SHALL display an alerts panel listing students with attendance below 80% and students with GPA below 5.0.
5. THE BGH Dashboard SHALL display a list of recent system activity logs (grade submissions, schedule changes).

### Requirement 7: Quản lý danh sách học sinh

**User Story:** As a GV or BGH user, I want to view the student roster in both card view and photo frame view, so that I can identify students quickly in different contexts.

#### Acceptance Criteria

1. THE Student List Screen SHALL render at `/students` route, accessible to roles `GV`, `GVCN`, and `BGH`.
2. THE Student List Screen SHALL provide a view toggle button switching between "Card View" and "Photo Frame View".
3. WHEN Card View is active, THE Student List Screen SHALL render each student as a card displaying: student photo placeholder, full name, student ID, class, and status badge.
4. WHEN Photo Frame View is active, THE Student List Screen SHALL render each student as a photo frame grid item displaying: student photo placeholder, full name, and class label.
5. THE Student List Screen SHALL include a filter toolbar with a search input (filtering by name or student ID), a class selector dropdown, and a status filter chip group.
6. WHEN the search input value changes, THE Student List Screen SHALL filter the displayed student list in real-time without API calls.
7. THE Student List Screen SHALL display status badges using the chip design specification: "Đang học" in success green, "Nghỉ học" in error red, "Bảo lưu" in warning orange.

### Requirement 8: Sổ điểm

**User Story:** As a GV, I want to view and enter grades for my assigned classes in a spreadsheet-style interface, so that I can efficiently manage academic records for all students.

#### Acceptance Criteria

1. THE Grade Book Screen SHALL render at `/gradebook` route, accessible to roles `GV`, `GVCN`, and `BGH`.
2. THE Grade Book Screen SHALL display an Excel-like data table with sticky first column (student name) and scrollable grade columns.
3. THE Grade Book Screen SHALL render grade cells color-coded per design spec: scores `< 5.0` with `#fef2f2` background and `#dc2626` bold text; scores `≥ 8.0` with `#f0fdf4` background and `#16a34a` text.
4. WHEN a GV user clicks a grade cell, THE Grade Book Screen SHALL make the cell editable via an inline `<input>` controlled component.
5. WHEN an editable grade cell loses focus or the user presses Enter, THE Grade Book Screen SHALL validate that the value is a number between 0 and 10 inclusive.
6. IF a grade value is outside the range 0–10, THEN THE Grade Book Screen SHALL revert the cell to the previous valid value and display a tooltip error message.
7. WHEN a GV user clicks the "Lưu điểm" button, THE Grade Book Screen SHALL call the `handleSaveGrades` API stub with the modified grades payload.
8. WHERE the authenticated role is `BGH`, THE Grade Book Screen SHALL render all grade cells as read-only with no inline editing capability.
9. THE Grade Book Screen SHALL include a filter toolbar with class selector, subject selector, and semester selector dropdowns.
10. THE Grade Book Screen SHALL apply tabular numeric figures (`font-variant-numeric: tabular-nums`) to all numeric grade cells using the `data-table` typography token.

### Requirement 9: Điểm danh chuyên cần

**User Story:** As a GV, I want to take attendance for a class session by marking each student present, late, or absent, so that I can maintain accurate attendance records.

#### Acceptance Criteria

1. THE Attendance Screen SHALL render at `/attendance` route, accessible to roles `GV` and `GVCN`.
2. THE Attendance Screen SHALL display a list of students for the selected class and session date.
3. THE Attendance Screen SHALL render attendance status controls for each student row: three toggle buttons for "Có mặt" (present), "Trễ" (late), and "Vắng" (absent).
4. WHEN a user clicks an attendance status button for a student, THE Attendance Screen SHALL update that student's attendance state via a controlled state update.
5. THE Attendance Screen SHALL display a session summary showing counts of present, late, and absent students, updating in real-time as statuses change.
6. WHEN a user clicks "Lưu điểm danh", THE Attendance Screen SHALL call the `handleSaveAttendance` API stub with the complete attendance payload including class ID, date, and per-student status array.
7. THE Attendance Screen SHALL include a date picker input (HTML `<input type="date">`) and a class selector dropdown to identify the session.
8. THE Attendance Screen SHALL apply status badge colors: present → success green `#f0fdf4`/`#16a34a`; late → warning orange `#fff7ed`/`#c2410c`; absent → error red `#fef2f2`/`#b91c1c`.

### Requirement 10: Giám sát chuyên cần (BGH)

**User Story:** As a BGH administrator, I want to monitor school-wide attendance across all classes and teachers, so that I can identify attendance issues and take corrective action.

#### Acceptance Criteria

1. THE BGH Attendance Monitor SHALL render at `/bgh/attendance` route, accessible only to role `BGH`.
2. THE BGH Attendance Monitor SHALL display a summary table of attendance rates per class, with columns: lớp, GVCN, tổng số học sinh, tỉ lệ chuyên cần (%), số học sinh dưới ngưỡng.
3. THE BGH Attendance Monitor SHALL highlight rows where tỉ lệ chuyên cần is below 80% using the warning orange color `#fff7ed` as row background.
4. THE BGH Attendance Monitor SHALL provide a date range filter with two `<input type="date">` fields (from/to) and a class filter dropdown.
5. WHEN filter values change, THE BGH Attendance Monitor SHALL update the displayed data by filtering the local static dataset.

### Requirement 11: Thời khóa biểu

**User Story:** As a GV or student, I want to view the weekly class schedule in a timetable grid, so that I can plan my teaching and study activities.

#### Acceptance Criteria

1. THE Timetable Screen SHALL render at `/schedule` route, accessible to roles `GV`, `GVCN`, `PH`, and `HS`.
2. THE Timetable Screen SHALL display a 5-column grid (Monday to Friday) with rows representing class periods (tiết 1–10).
3. THE Timetable Screen SHALL render each scheduled class cell showing: subject name, teacher name, room number, and period time range.
4. THE Timetable Screen SHALL display an empty cell state for unscheduled periods using a muted `#f8fafc` background.
5. THE Timetable Screen SHALL include a class selector dropdown and a week selector to switch the displayed schedule.
6. WHEN the class or week selection changes, THE Timetable Screen SHALL update the timetable grid with the corresponding static data.

### Requirement 12: Quản trị xếp thời khóa biểu (BGH Admin)

**User Story:** As a BGH administrator, I want to assign and manage the school-wide timetable, so that I can ensure all classes have complete schedules without conflicts.

#### Acceptance Criteria

1. THE Schedule Admin Screen SHALL render at `/bgh/schedule-admin` route, accessible only to role `BGH`.
2. THE Schedule Admin Screen SHALL display the full school timetable grid with all classes visible as columns or selectable via a dropdown.
3. WHEN a BGH user clicks an empty timetable cell, THE Schedule Admin Screen SHALL open a modal dialog for assigning subject, teacher, and room to that period.
4. THE modal form SHALL be a controlled component with subject, teacher, and room dropdowns populated from static data arrays.
5. WHEN the modal form is submitted, THE Schedule Admin Screen SHALL call the `handleSaveScheduleSlot` API stub and update the timetable grid cell optimistically.
6. WHEN a BGH user clicks an occupied timetable cell, THE Schedule Admin Screen SHALL open the same modal pre-populated with existing slot data for editing.
7. THE Schedule Admin Screen SHALL highlight conflict cells (same teacher or same room assigned to overlapping periods) using the error red background `#fef2f2`.

### Requirement 13: Sổ liên lạc phụ huynh

**User Story:** As a GVCN, I want to send notifications and communicate with parents of students in my class, so that I can keep parents informed about their children's academic progress and school announcements.

#### Acceptance Criteria

1. THE Parent Communication Screen SHALL render at `/parent-communication` route, accessible to roles `GVCN` and `BGH`.
2. THE Parent Communication Screen SHALL display a list of sent and received messages grouped by parent/student, ordered by most recent first.
3. THE Parent Communication Screen SHALL provide a "Tạo thông báo mới" form with fields: tiêu đề (title), nội dung (content), loại thông báo (type dropdown), and danh sách nhận (recipient selector).
4. THE Parent Communication Screen form SHALL be a controlled component managing all field values via `useState`.
5. WHEN a user submits the notification form, THE Parent Communication Screen SHALL call the `handleSendNotification` API stub with the notification payload.
6. THE Parent Communication Screen SHALL display message status badges: "Đã gửi" (sent), "Đã đọc" (read), "Chờ xử lý" (pending).
7. THE Parent Communication Screen SHALL also render a "Trao đổi" (conversation) tab showing threaded message exchanges with individual parents for GVCN 10A1 context.

### Requirement 14: Trung tâm chất số điểm và báo cáo BGH

**User Story:** As a BGH administrator, I want a comprehensive reporting center showing academic performance analytics and grade quality metrics, so that I can make data-driven decisions about teaching quality.

#### Acceptance Criteria

1. THE BGH Report Center SHALL render at `/bgh/reports` route, accessible only to role `BGH`.
2. THE BGH Report Center SHALL merge content from both v1 and v3 HTML source files into a single unified interface with tab navigation.
3. THE BGH Report Center SHALL display an academic performance overview tab with: tỉ lệ học lực (Giỏi/Khá/TB/Yếu/Kém) per grade level, school-wide GPA trend, and subject performance comparison — all rendered as static data tables with color-coded cells.
4. THE BGH Report Center SHALL display a grade quality metrics tab with: on-time grade submission rates per teacher, grade distribution bell curve data table, and anomaly flags for statistical outliers.
5. THE BGH Report Center SHALL include export action buttons ("Xuất Excel", "Xuất PDF") that call `handleExportReport` API stub with `{ format, reportType }` parameters.
6. THE BGH Report Center SHALL include semester and academic year selector dropdowns that update all displayed data panels when changed.
7. THE BGH Report Center SHALL render all data tables using the `data-table` typography token (Inter 13px, tabular nums) with the Excel-like table design specification.

### Requirement 15: Cài đặt hệ thống và phân quyền

**User Story:** As a BGH system administrator, I want to manage user accounts and role permissions, so that I can control access levels for all staff members in the system.

#### Acceptance Criteria

1. THE System Settings Screen SHALL render at `/bgh/settings` route, accessible only to role `BGH`.
2. THE System Settings Screen SHALL display a user management table with columns: họ tên, username, vai trò (role), trạng thái (active/inactive), and hành động (action buttons).
3. THE System Settings Screen SHALL provide a "Thêm người dùng" button that opens a modal form with fields: họ tên, username, mật khẩu, email, vai trò selector, and trạng thái toggle.
4. THE modal form SHALL be a controlled component with all fields managed via `useState` and cleared on modal close.
5. WHEN the add user form is submitted, THE System Settings Screen SHALL call the `handleCreateUser` API stub with the user payload.
6. WHEN a user clicks "Chỉnh sửa" on a table row, THE System Settings Screen SHALL open the modal pre-populated with that user's data for editing and call `handleUpdateUser` on submit.
7. WHEN a user clicks "Vô hiệu hóa" on an active user row, THE System Settings Screen SHALL call `handleDeactivateUser` API stub with the user ID and update the row's status badge optimistically.
8. THE System Settings Screen SHALL also render a "Phân quyền chi tiết" tab showing a permission matrix grid with roles as columns and feature modules as rows, with read-only checkbox indicators.

### Requirement 16: API Stub Functions

**User Story:** As a developer, I want centralized API stub functions for all data operations, so that I can replace them with real API calls later without modifying component logic.

#### Acceptance Criteria

1. THE EduManage Pro SHALL provide an `src/api/stubs.js` file containing all API stub functions as named exports.
2. THE API Stubs SHALL include the following functions: `handleLoginSubmit`, `handleSaveGrades`, `handleSaveAttendance`, `handleSendNotification`, `handleSaveScheduleSlot`, `handleExportReport`, `handleCreateUser`, `handleUpdateUser`, `handleDeactivateUser`.
3. WHEN any API stub function is called, THE API Stubs SHALL log the function name and payload to `console.log` with the prefix `[API STUB]`.
4. WHEN any API stub function is called, THE API Stubs SHALL return a `Promise` that resolves with a mock success response after a simulated delay of 500ms using `setTimeout`.
5. THE EduManage Pro SHALL provide an `src/data/mockData.js` file containing static mock data arrays for: students, classes, teachers, grades, attendance records, timetable slots, and notifications.

### Requirement 17: Routing và điều hướng

**User Story:** As a developer, I want a centralized route configuration with protected routes, so that all navigation in the application enforces authentication and role-based access consistently.

#### Acceptance Criteria

1. THE EduManage Pro SHALL define all application routes in `src/routes/AppRouter.jsx` using React Router DOM v6 `<Routes>` and `<Route>` components.
2. THE AppRouter SHALL wrap all protected routes with the `ProtectedRoute` component, passing the required `roles` array for each route.
3. THE AppRouter SHALL define a catch-all route (`*`) that renders a 404 Not Found page.
4. THE AppRouter SHALL define a `/unauthorized` route rendering an Unauthorized Access page with a "Quay lại" button that navigates to the user's role-appropriate dashboard.
5. WHEN the application first loads at the root path `/`, THE AppRouter SHALL redirect unauthenticated users to `/login` and authenticated users to their role-appropriate dashboard.
6. THE EduManage Pro SHALL define route path constants in `src/constants/routes.js` to avoid hardcoded strings throughout the codebase.

### Requirement 18: Thiết kế giao diện và Design System

**User Story:** As a designer and developer, I want all UI components to consistently implement the EdTech Clean Minimalist design system, so that the application has a professional, cohesive visual identity.

#### Acceptance Criteria

1. THE EduManage Pro SHALL implement the complete color palette from DESIGN.md as Tailwind CSS custom color tokens in `tailwind.config.js`, mapping each named color (primary, secondary, surface, etc.) to its hex value.
2. THE EduManage Pro SHALL implement typography classes in `tailwind.config.js` mapping `display`, `headline-lg`, `headline-md`, `headline-sm`, `body-lg`, `body-md`, `body-sm`, `label-md`, `label-sm`, `data-metric`, and `data-table` to their respective font-family, size, weight, and line-height values.
3. THE EduManage Pro SHALL implement border-radius tokens from DESIGN.md in `tailwind.config.js` under `theme.extend.borderRadius`.
4. THE EduManage Pro SHALL implement spacing tokens from DESIGN.md in `tailwind.config.js` under `theme.extend.spacing`.
5. WHEN rendering KPI Metric Cards, THE EduManage Pro SHALL use white surface `#ffffff`, `1px solid #e2e8f0` border, and `box-shadow: 0 1px 2px 0 rgba(15,23,42,0.04)` as specified in the Elevation Level 1 definition.
6. WHEN rendering modal dialogs, THE EduManage Pro SHALL apply Elevation Level 3 shadow and a backdrop overlay of `rgba(15,23,42,0.4)` with `backdrop-filter: blur(4px)`.
7. THE EduManage Pro SHALL render all status badges with height 22px, `label-sm` typography, `font-weight: 500`, and `px-2.5 py-0.5` padding per the Chips & Badges design specification.
8. THE EduManage Pro SHALL apply `font-variant-numeric: tabular-nums` to all components displaying numeric data in tabular format.
