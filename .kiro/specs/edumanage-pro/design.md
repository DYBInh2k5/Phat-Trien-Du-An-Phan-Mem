# Design Document — EduManage Pro

## Overview

EduManage Pro là một Single Page Application (SPA) được xây dựng bằng **Vite + React 18 + React Router DOM v6 + Tailwind CSS v3**, chuyển đổi 17 màn hình HTML tĩnh (xuất từ Google Stitch) thành một ứng dụng hoàn chỉnh với hệ thống xác thực phân quyền theo vai trò. Hệ thống phục vụ 5 loại người dùng: GV (Giáo viên), GVCN (Giáo viên Chủ nhiệm), BGH (Ban Giám Hiệu), PH (Phụ huynh), HS (Học sinh).

Kiến trúc đặt trọng tâm vào:
- **Tách biệt mối quan tâm**: Auth logic trong Context, UI logic trong components, side-effects trong API stubs
- **Role-based access control**: ProtectedRoute kiểm tra xác thực và phân quyền tại tầng routing
- **Design token consistency**: Toàn bộ màu sắc, typography, spacing đều đến từ DESIGN.md thông qua `tailwind.config.js`
- **Dễ thay thế**: API stubs được tách biệt hoàn toàn, có thể thay bằng real API calls mà không sửa component logic

---

## Architecture

### High-Level Architecture

```
d:\project\edumanage-pro\
├── index.html                     # Google Fonts CDN, Material Symbols CDN
├── vite.config.js
├── tailwind.config.js             # Design tokens từ DESIGN.md
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                   # Entry point: ReactDOM.createRoot
    ├── index.css                  # @tailwind base/components/utilities; body font
    ├── App.jsx                    # AuthProvider wrapper + AppRouter
    │
    ├── constants/
    │   ├── roles.js               # ROLES enum: GV, GVCN, BGH, PH, HS
    │   └── routes.js              # ROUTES path constants
    │
    ├── context/
    │   └── AuthContext.jsx        # createContext, AuthProvider, useAuth hook
    │
    ├── api/
    │   └── stubs.js               # Tất cả API stub functions (named exports)
    │
    ├── data/
    │   └── mockData.js            # Static mock data arrays
    │
    ├── routes/
    │   └── AppRouter.jsx          # <Routes> + <Route> với ProtectedRoute
    │
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx
    │   ├── layout/
    │   │   ├── MainLayout.jsx     # Shell: Sidebar + Header + <Outlet>
    │   │   ├── Sidebar.jsx        # Collapsible navigation rail
    │   │   └── Header.jsx         # Top bar: title, avatar, logout
    │   └── shared/
    │       ├── StatusBadge.jsx    # Reusable chip/badge component
    │       ├── KpiCard.jsx        # Reusable KPI metric card
    │       ├── DataTable.jsx      # Reusable Excel-like table
    │       └── Modal.jsx          # Reusable modal dialog shell
    │
    └── pages/
        ├── auth/
        │   ├── LoginPage.jsx
        │   └── UnauthorizedPage.jsx
        ├── shared/
        │   └── NotFoundPage.jsx
        ├── gv/
        │   ├── GVDashboardPage.jsx
        │   ├── GradebookPage.jsx
        │   └── AttendancePage.jsx
        ├── students/
        │   └── StudentListPage.jsx
        ├── schedule/
        │   └── TimetablePage.jsx
        ├── communication/
        │   └── ParentCommunicationPage.jsx
        └── bgh/
            ├── BGHDashboardPage.jsx
            ├── BGHAttendanceMonitorPage.jsx
            ├── ScheduleAdminPage.jsx
            ├── BGHReportCenterPage.jsx
            └── SystemSettingsPage.jsx
```

### Component Hierarchy

```
<App>
  <AuthProvider>                    # Cung cấp AuthContext cho toàn cây
    <BrowserRouter>
      <AppRouter>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/unauthorized">
          <UnauthorizedPage />
        </Route>
        <Route element={<MainLayout />}>   # Shell chứa Sidebar + Header
          <ProtectedRoute roles={[GV, GVCN]}>
            <Route path="/gv/dashboard" element={<GVDashboardPage />} />
            <Route path="/gradebook"    element={<GradebookPage />} />
            <Route path="/attendance"   element={<AttendancePage />} />
          </ProtectedRoute>
          <ProtectedRoute roles={[GV, GVCN, BGH]}>
            <Route path="/students"     element={<StudentListPage />} />
          </ProtectedRoute>
          <ProtectedRoute roles={[GV, GVCN, PH, HS]}>
            <Route path="/schedule"     element={<TimetablePage />} />
          </ProtectedRoute>
          <ProtectedRoute roles={[GVCN, BGH]}>
            <Route path="/parent-communication" element={<ParentCommunicationPage />} />
          </ProtectedRoute>
          <ProtectedRoute roles={[BGH]}>
            <Route path="/bgh/dashboard"        element={<BGHDashboardPage />} />
            <Route path="/bgh/attendance"       element={<BGHAttendanceMonitorPage />} />
            <Route path="/bgh/schedule-admin"   element={<ScheduleAdminPage />} />
            <Route path="/bgh/reports"          element={<BGHReportCenterPage />} />
            <Route path="/bgh/settings"         element={<SystemSettingsPage />} />
          </ProtectedRoute>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </AppRouter>
    </BrowserRouter>
  </AuthProvider>
</App>
```

---

## Components and Interfaces

### 1. AuthContext (`src/context/AuthContext.jsx`)

Context API trung tâm quản lý trạng thái xác thực.

```jsx
// Shape của AuthContext value
const AuthContextValue = {
  user: null | { username: string, role: string, name: string },
  role: null | 'GV' | 'GVCN' | 'BGH' | 'PH' | 'HS',
  isAuthenticated: boolean,
  login: ({ username, password, role }) => Promise<void>,
  logout: () => void,
};

// AuthProvider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Khởi tạo từ localStorage (lazy initializer)
    const stored = localStorage.getItem('edumanage_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async ({ username, password, role }) => {
    await handleLoginSubmit({ username, password, role }); // API stub
    const userObj = { username, role, name: username };
    localStorage.setItem('edumanage_user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('edumanage_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => useContext(AuthContext);
```

### 2. ProtectedRoute (`src/components/auth/ProtectedRoute.jsx`)

```jsx
// Props interface
type ProtectedRouteProps = {
  roles: string[],  // Mảng các role được phép truy cập
  children?: ReactNode,
  // Hoặc dùng như layout route với <Outlet />
};

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
}
```

### 3. MainLayout (`src/components/layout/MainLayout.jsx`)

```jsx
// State được quản lý trong MainLayout
const [isCollapsed, setIsCollapsed] = useState(() => {
  return localStorage.getItem('sidebar_collapsed') === 'true';
});

// Side effect: persist collapse state
useEffect(() => {
  localStorage.setItem('sidebar_collapsed', String(isCollapsed));
}, [isCollapsed]);

// Layout structure
return (
  <div className="flex h-screen bg-surface">
    <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(c => !c)} />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-gutter-lg">
        <Outlet />
      </main>
    </div>
  </div>
);
```

### 4. Sidebar (`src/components/layout/Sidebar.jsx`)

```jsx
// Cấu hình navigation items với role-based filtering
const NAV_ITEMS = [
  { label: 'Tổng quan', icon: 'dashboard', path: ROUTES.GV_DASHBOARD, roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Tổng quan', icon: 'admin_panel_settings', path: ROUTES.BGH_DASHBOARD, roles: [ROLES.BGH] },
  { label: 'Học sinh',  icon: 'groups', path: ROUTES.STUDENTS, roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Sổ điểm',  icon: 'grade', path: ROUTES.GRADEBOOK, roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Điểm danh', icon: 'how_to_reg', path: ROUTES.ATTENDANCE, roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Giám sát chuyên cần', icon: 'monitoring', path: ROUTES.BGH_ATTENDANCE, roles: [ROLES.BGH] },
  { label: 'Thời khóa biểu', icon: 'calendar_month', path: ROUTES.SCHEDULE, roles: [ROLES.GV, ROLES.GVCN, ROLES.PH, ROLES.HS] },
  { label: 'Xếp thời khóa biểu', icon: 'edit_calendar', path: ROUTES.BGH_SCHEDULE_ADMIN, roles: [ROLES.BGH] },
  { label: 'Sổ liên lạc', icon: 'chat', path: ROUTES.PARENT_COMMUNICATION, roles: [ROLES.GVCN, ROLES.BGH] },
  { label: 'Báo cáo', icon: 'assessment', path: ROUTES.BGH_REPORTS, roles: [ROLES.BGH] },
  { label: 'Cài đặt', icon: 'settings', path: ROUTES.BGH_SETTINGS, roles: [ROLES.BGH] },
];

// Props
type SidebarProps = {
  isCollapsed: boolean,
  onToggle: () => void,
};
```

### 5. Shared Components

**StatusBadge:**
```jsx
// Props
type StatusBadgeProps = {
  status: 'present' | 'late' | 'absent' | 'active' | 'inactive' | 'sent' | 'read' | 'pending',
  label: string,
};
// Mapping status → Tailwind classes (bg + text color pairs)
const STATUS_STYLES = {
  present: 'bg-[#f0fdf4] text-[#15803d]',
  late:    'bg-[#fff7ed] text-[#c2410c]',
  absent:  'bg-[#fef2f2] text-[#b91c1c]',
  active:  'bg-[#f0fdf4] text-[#15803d]',
  inactive:'bg-[#fef2f2] text-[#b91c1c]',
  sent:    'bg-[#eff4ff] text-[#2563eb]',
  read:    'bg-[#f1f5f9] text-[#334155]',
  pending: 'bg-[#fff7ed] text-[#c2410c]',
};
```

**KpiCard:**
```jsx
type KpiCardProps = {
  label: string,
  value: string | number,
  icon: string,          // Material Symbol name
  trend?: string,        // e.g. '+4.2%'
  trendPositive?: boolean,
};
```

**Modal:**
```jsx
type ModalProps = {
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: ReactNode,
  size?: 'sm' | 'md' | 'lg',  // default: 'md'
};
// Sử dụng createPortal để render vào document.body
// Backdrop: rgba(15,23,42,0.4) với backdrop-filter: blur(4px)
// Elevation Level 3 shadow
```

---

## Data Models

### User Object (trong AuthContext / localStorage)

```typescript
interface User {
  username: string;
  role: 'GV' | 'GVCN' | 'BGH' | 'PH' | 'HS';
  name: string;         // Họ tên hiển thị
}
```

### Student

```typescript
interface Student {
  id: string;            // e.g. 'HS001'
  name: string;          // Họ và tên đầy đủ
  classId: string;       // e.g. '10A1'
  status: 'active' | 'inactive' | 'reserved';  // Đang học / Nghỉ học / Bảo lưu
  photoUrl?: string;
}
```

### Grade Entry

```typescript
interface GradeEntry {
  studentId: string;
  subjectId: string;
  semester: 1 | 2;
  academicYear: string;  // e.g. '2024-2025'
  scores: {
    oral: number[];        // Điểm miệng (hệ số 1)
    test15min: number[];   // Kiểm tra 15' (hệ số 1)
    test45min: number[];   // Kiểm tra 1 tiết (hệ số 2)
    semester: number;      // Điểm thi học kỳ (hệ số 3)
    average: number;       // Điểm trung bình môn
  };
}
```

### Attendance Record

```typescript
interface AttendanceRecord {
  classId: string;
  date: string;           // ISO 8601 date string, e.g. '2024-11-15'
  teacherId: string;
  entries: Array<{
    studentId: string;
    status: 'present' | 'late' | 'absent';
  }>;
}
```

### Timetable Slot

```typescript
interface TimetableSlot {
  classId: string;
  weekStart: string;      // ISO date of Monday
  dayOfWeek: 1 | 2 | 3 | 4 | 5;  // Thứ 2–6
  period: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  subjectName: string;
  teacherName: string;
  room: string;
  timeRange: string;      // e.g. '07:00 – 07:45'
}
```

### Notification

```typescript
interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'academic' | 'absence' | 'event' | 'general';
  senderId: string;
  recipients: string[];   // Mảng studentId hoặc classId
  sentAt: string;         // ISO timestamp
  status: 'sent' | 'read' | 'pending';
}
```

### User Account (System Settings)

```typescript
interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'GV' | 'GVCN' | 'BGH' | 'PH' | 'HS';
  isActive: boolean;
  createdAt: string;
}
```

---

## State Management

### Quy tắc quản lý state

| Loại state | Nơi lưu | Ví dụ |
|---|---|---|
| Xác thực người dùng | `AuthContext` + `localStorage` | `user`, `role` |
| Sidebar collapse | `MainLayout` state + `localStorage` | `isCollapsed` |
| Form fields | Component local state (`useState`) | `username`, `password` |
| Filter/search inputs | Page component local state | `searchTerm`, `selectedClass` |
| Grade edits (trước khi lưu) | Page component local state | `editedGrades` Map |
| Attendance statuses | Page component local state | `attendanceMap` (studentId → status) |
| Modal open/close | Page component local state | `isModalOpen`, `modalData` |
| Mock data | `src/data/mockData.js` (static) | Không có state, chỉ là constant arrays |

### Grade Editing State Pattern

```jsx
// GradebookPage.jsx
const [grades, setGrades] = useState(initialGrades);        // Toàn bộ grade data
const [editingCell, setEditingCell] = useState(null);        // { studentId, column }
const [pendingValue, setPendingValue] = useState('');        // Giá trị đang nhập

const handleCellBlur = (studentId, column, prevValue) => {
  const num = parseFloat(pendingValue);
  if (isNaN(num) || num < 0 || num > 10) {
    // Revert và hiện tooltip error
    setPendingValue(String(prevValue));
  } else {
    setGrades(prev => updateGrade(prev, studentId, column, num));
  }
  setEditingCell(null);
};
```

---

## Routing Configuration

### Route Constants (`src/constants/routes.js`)

```javascript
export const ROUTES = {
  LOGIN:                 '/login',
  UNAUTHORIZED:          '/unauthorized',
  GV_DASHBOARD:          '/gv/dashboard',
  BGH_DASHBOARD:         '/bgh/dashboard',
  STUDENTS:              '/students',
  GRADEBOOK:             '/gradebook',
  ATTENDANCE:            '/attendance',
  BGH_ATTENDANCE:        '/bgh/attendance',
  SCHEDULE:              '/schedule',
  BGH_SCHEDULE_ADMIN:    '/bgh/schedule-admin',
  PARENT_COMMUNICATION:  '/parent-communication',
  BGH_REPORTS:           '/bgh/reports',
  BGH_SETTINGS:          '/bgh/settings',
};
```

### Role-to-Dashboard Mapping

```javascript
export const ROLE_DASHBOARD = {
  [ROLES.GV]:   ROUTES.GV_DASHBOARD,
  [ROLES.GVCN]: ROUTES.GV_DASHBOARD,
  [ROLES.BGH]:  ROUTES.BGH_DASHBOARD,
  [ROLES.PH]:   ROUTES.SCHEDULE,
  [ROLES.HS]:   ROUTES.SCHEDULE,
};
```

### Root Path Redirect Logic (`AppRouter.jsx`)

```jsx
// Route index: redirect dựa trên auth state
<Route
  index
  element={
    isAuthenticated
      ? <Navigate to={ROLE_DASHBOARD[role]} replace />
      : <Navigate to={ROUTES.LOGIN} replace />
  }
/>
```

---

## API Stubs (`src/api/stubs.js`)

Tất cả stubs theo cùng một pattern: log → delay 500ms → resolve.

```javascript
// Pattern chung
const createStub = (name) => async (payload) => {
  console.log(`[API STUB] ${name}`, payload);
  return new Promise(resolve =>
    setTimeout(() => resolve({ success: true, data: payload }), 500)
  );
};

export const handleLoginSubmit       = createStub('handleLoginSubmit');
export const handleSaveGrades        = createStub('handleSaveGrades');
export const handleSaveAttendance    = createStub('handleSaveAttendance');
export const handleSendNotification  = createStub('handleSendNotification');
export const handleSaveScheduleSlot  = createStub('handleSaveScheduleSlot');
export const handleExportReport      = createStub('handleExportReport');
export const handleCreateUser        = createStub('handleCreateUser');
export const handleUpdateUser        = createStub('handleUpdateUser');
export const handleDeactivateUser    = createStub('handleDeactivateUser');
```

---

## Tailwind Configuration

### Design Token Mapping (`tailwind.config.js`)

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surface tokens
        surface:                    '#f8f9ff',
        'surface-dim':              '#cbdbf5',
        'surface-bright':           '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#eff4ff',
        'surface-container':        '#e5eeff',
        'surface-container-high':   '#dce9ff',
        'surface-container-highest':'#d3e4fe',
        'on-surface':               '#0b1c30',
        'on-surface-variant':       '#434655',
        // Primary
        primary:                    '#004ac6',
        'on-primary':               '#ffffff',
        'primary-container':        '#2563eb',
        'on-primary-container':     '#eeefff',
        // Secondary
        secondary:                  '#565e74',
        'on-secondary':             '#ffffff',
        'secondary-container':      '#dae2fd',
        // Semantic
        error:                      '#ba1a1a',
        'error-container':          '#ffdad6',
        // Outline
        outline:                    '#737686',
        'outline-variant':          '#c3c6d7',
        // Background
        background:                 '#f8f9ff',
        'on-background':            '#0b1c30',
      },
      fontFamily: {
        'be-vietnam': ['"Be Vietnam Pro"', 'sans-serif'],
        inter:        ['Inter', 'sans-serif'],
      },
      fontSize: {
        // typography tokens (size / [size, { lineHeight, fontWeight, ... }])
        display:      ['36px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg':['28px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.015em' }],
        'headline-md':['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-sm':['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md':    ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm':    ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-md':   ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'label-sm':   ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'data-metric':['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.02em' }],
        'data-table': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      },
      borderRadius: {
        sm:      '0.125rem',
        DEFAULT: '0.25rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        full:    '9999px',
      },
      spacing: {
        gutter:    '1rem',
        'gutter-lg':'1.5rem',
        margin:    '1rem',
        'margin-md':'1.5rem',
        'margin-lg':'2rem',
        'space-xs':'0.25rem',
        'space-sm':'0.5rem',
        'space-md':'0.75rem',
        'space-lg':'1rem',
        'space-xl':'1.5rem',
        'space-2xl':'2rem',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgba(15,23,42,0.04)',
        'elevation-2': '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)',
        'elevation-3': '0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
};
```

---

## Screen-by-Screen Design

### LoginPage (`/login`)

**Layout**: Full-screen centered card trên nền surface `#f8f9ff`.

**Tab switching**: 3 tabs ("GV / Cán bộ", "PH / Học sinh", "BGH / Quản trị"). Tab active có indicator `#2563eb` ở đáy và text `#2563eb`; inactive có text `#64748b`. Mỗi tab set state `activeRole` → cập nhật `placeholder` và `role` value trong form.

**Form state**:
```jsx
const [formData, setFormData] = useState({ username: '', password: '' });
const [activeRole, setActiveRole] = useState(ROLES.GV);
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**Submit flow**:
```jsx
const onSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  try {
    await login({ ...formData, role: activeRole });  // AuthContext.login
    navigate(ROLE_DASHBOARD[activeRole], { replace: true });
  } catch {
    setError('Tên đăng nhập hoặc mật khẩu không đúng.');
  } finally {
    setIsLoading(false);
  }
};
```

### GradebookPage (`/gradebook`)

**Table structure**: `<div class="overflow-x-auto">` chứa `<table>` với:
- First column `position: sticky; left: 0; z-index: 10; background: white` — Tên học sinh
- Grade columns: scrollable
- Cell classes dựa trên value: `grade < 5` → `bg-[#fef2f2] text-[#dc2626] font-bold`; `grade >= 8` → `bg-[#f0fdf4] text-[#16a34a]`

**Inline edit**: Khi `editingCell === { studentId, col }` thì render `<input type="number" min="0" max="10">` thay cho span. BGH: `pointer-events-none` và không có `onClick`.

### AttendancePage (`/attendance`)

**Per-student row**: 3 toggle buttons. Active state dùng solid background matching status color; inactive state dùng ghost/outline style.

**Session summary** (reactive):
```jsx
const summary = useMemo(() => {
  const values = Object.values(attendanceMap);
  return {
    present: values.filter(s => s === 'present').length,
    late:    values.filter(s => s === 'late').length,
    absent:  values.filter(s => s === 'absent').length,
  };
}, [attendanceMap]);
```

### ScheduleAdminPage (`/bgh/schedule-admin`)

**Conflict detection**: Khi modal submit, check xem `teacherName` hoặc `room` đã tồn tại trong bất kỳ slot nào khác cùng `dayOfWeek` + `period`. Nếu có conflict → highlight cell với `bg-[#fef2f2]`.

### BGHReportCenterPage (`/bgh/reports`)

**Tab navigation**: 2 tabs chính: "Học lực" và "Chất số điểm". Dùng state `activeTab` để toggle visibility của content panels. Không reload, chỉ `display: none` / `display: block` hoặc conditional render.

---

## Error Handling

### Form Validation

- **Login**: Error state được hiển thị dưới form dưới dạng `<p className="text-[#dc2626] text-body-sm mt-2">` sau khi Promise reject.
- **Grade input**: Giá trị ngoài [0, 10] → revert về giá trị cũ + `title` tooltip hoặc inline error span.
- **Required fields trong modal forms**: Kiểm tra tại `onSubmit` trước khi gọi API stub; nếu invalid → hiển thị error text bên dưới từng field.

### Route Errors

- **Unauthenticated**: `ProtectedRoute` → `<Navigate to="/login" replace />`
- **Insufficient role**: `ProtectedRoute` → `<Navigate to="/unauthorized" replace />`
- **Unknown path**: Catch-all `*` → `<NotFoundPage />`

### API Stub Error Simulation

Để test error handling trong LoginPage, `handleLoginSubmit` có thể được mở rộng để reject khi `username === 'error'`:
```javascript
export const handleLoginSubmit = async ({ username, password, role }) => {
  console.log('[API STUB] handleLoginSubmit', { username, role });
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (username === 'error') reject(new Error('Invalid credentials'));
      else resolve({ success: true, user: { username, role } });
    }, 500)
  );
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Login stores user in localStorage

*For any* valid credential object `{ username, password, role }`, calling `AuthContext.login()` with that object SHALL store a user entry in `localStorage` under the key `edumanage_user` and update the context's `user` and `role` state synchronously.

**Validates: Requirements 2.2**

---

### Property 2: Session restoration round-trip

*For any* user object stored in `localStorage` under `edumanage_user`, initializing `AuthProvider` SHALL restore that user object to the context state — i.e., `context.user` equals the stored user and `context.isAuthenticated` is `true`.

**Validates: Requirements 2.3**

---

### Property 3: Logout clears all auth state

*For any* authenticated user, calling `logout()` SHALL result in `localStorage.getItem('edumanage_user')` returning `null`, `context.user` being `null`, and `context.isAuthenticated` being `false`.

**Validates: Requirements 2.4**

---

### Property 4: Unauthenticated access always redirects to /login

*For any* protected route with any `roles` array, an unauthenticated user (no `edumanage_user` in localStorage) attempting to navigate to that route SHALL be redirected to `/login`.

**Validates: Requirements 2.6**

---

### Property 5: Insufficient role always redirects to /unauthorized

*For any* `ProtectedRoute` with a non-empty `roles` array, and *for any* authenticated user whose `role` is NOT contained in that array, navigating to that route SHALL redirect to `/unauthorized`.

**Validates: Requirements 2.7**

---

### Property 6: Sidebar toggle persists state

*For any* initial sidebar state (expanded or collapsed), toggling the sidebar SHOULD update the `localStorage` value `sidebar_collapsed` to reflect the new state, such that reading `localStorage.getItem('sidebar_collapsed')` after toggling returns the toggled value.

**Validates: Requirements 4.3**

---

### Property 7: Role-based navigation filtering

*For any* authenticated user with a given role `R`, the navigation items rendered by `Sidebar` SHALL be exactly the set of items whose `roles` array contains `R` — no more and no fewer.

**Validates: Requirements 4.4**

---

### Property 8: Real-time student search filtering

*For any* search input string `q` and any student list, the displayed students SHALL be exactly those whose `name` or `id` contains `q` as a case-insensitive substring; no student outside this set SHALL appear, and no matching student SHALL be hidden.

**Validates: Requirements 7.6**

---

### Property 9: Grade cell color coding invariant

*For any* numeric grade value `v` displayed in the gradebook, the cell's visual style SHALL satisfy: if `v < 5.0` then background is `#fef2f2` and text is `#dc2626` bold; if `v >= 8.0` then background is `#f0fdf4` and text is `#16a34a`; otherwise neutral styling applies.

**Validates: Requirements 8.3**

---

### Property 10: Grade validation revert

*For any* grade cell edit where the entered value `x` satisfies `isNaN(x) || x < 0 || x > 10`, the cell SHALL revert to its previous valid value after losing focus or pressing Enter, and no invalid value SHALL be persisted to component state.

**Validates: Requirements 8.5, 8.6**

---

### Property 11: Attendance status update correctness

*For any* student in the attendance list and any status button clicked (`present`, `late`, `absent`), the attendance state map entry for that student SHALL be updated to the clicked status, and no other student's status SHALL change.

**Validates: Requirements 9.4**

---

### Property 12: Attendance summary count invariant

*For any* set of attendance status assignments, the session summary counts `{ present, late, absent }` SHALL equal the exact count of students assigned each respective status — i.e., `present + late + absent === totalStudents` and each count matches the number of entries with that status.

**Validates: Requirements 9.5**

---

### Property 13: BGH attendance row highlight invariant

*For any* attendance summary row where `tỉ lệ chuyên cần < 80%`, the row's background color SHALL be the warning orange `#fff7ed`. *For any* row where `tỉ lệ chuyên cần >= 80%`, the row SHALL NOT have the warning orange background.

**Validates: Requirements 10.3**

---

### Property 14: Timetable grid data consistency

*For any* class selector value and week selector value, the cells rendered in the timetable grid SHALL exactly correspond to the `TimetableSlot` entries in `mockData` matching that `classId` and `weekStart` — no slot SHALL be missing and no extra slot SHALL appear.

**Validates: Requirements 11.6**

---

### Property 15: Schedule conflict cell highlighting

*For any* pair of `TimetableSlot` entries that share the same `teacherName` OR the same `room` AND the same `dayOfWeek` AND the same `period`, both corresponding cells in the Schedule Admin grid SHALL have the error red background `#fef2f2`. Cells without such conflicts SHALL NOT have that background.

**Validates: Requirements 12.7**

---

### Property 16: API stub logging invariant

*For any* API stub function in `src/api/stubs.js` called with any payload, a `console.log` entry SHALL be emitted with the prefix `[API STUB]` followed by the function name and the payload. This SHALL hold regardless of the payload's shape or content.

**Validates: Requirements 16.3**

---

### Property 17: API stub Promise resolution

*For any* API stub function called with any valid payload, the returned value SHALL be a `Promise` that resolves (not rejects) after approximately 500ms with a success response object. No stub SHALL reject under normal call conditions.

**Validates: Requirements 16.4**

---

### Property 18: Protected route coverage

*For any* route defined in `AppRouter.jsx` that is not `/login`, `/unauthorized`, or `*`, that route SHALL be wrapped by a `ProtectedRoute` component with a non-empty `roles` array. No authenticated application route SHALL be reachable without passing through `ProtectedRoute`.

**Validates: Requirements 17.2**

---

### Property 19: Root path redirect correctness

*For any* unauthenticated user navigating to `/`, they SHALL be redirected to `/login`. *For any* authenticated user with role `R` navigating to `/`, they SHALL be redirected to `ROLE_DASHBOARD[R]` — the exact dashboard path associated with their role.

**Validates: Requirements 17.5**

---

### Property 20: Design token completeness

*For any* named color token defined in `DESIGN.md`, the `tailwind.config.js` SHALL contain a mapping of that token name to the exact hex value specified in `DESIGN.md`. No token defined in `DESIGN.md` SHALL be absent from the Tailwind config.

**Validates: Requirements 18.1**

---

### Property 21: Typography token completeness

*For any* typography style defined in `DESIGN.md` (`display`, `headline-lg`, `headline-md`, `headline-sm`, `body-lg`, `body-md`, `body-sm`, `label-md`, `label-sm`, `data-metric`, `data-table`), the `tailwind.config.js` SHALL map that style name to the exact `fontSize`, `lineHeight`, `fontWeight`, and `letterSpacing` values from `DESIGN.md`.

**Validates: Requirements 18.2**
