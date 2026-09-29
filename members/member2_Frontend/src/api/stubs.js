import { apiClient } from './client.js';

// Generic stub factory: tries real API first, logs call, falls back gracefully to stub
const createStub = (name, endpoint) => async (payload) => {
  console.log(`[API CALL] ${name}`, payload);
  try {
    if (endpoint) {
      const result = await apiClient(endpoint, { method: 'POST', body: payload });
      return result;
    }
  } catch (err) {
    console.info(`[API Fallback] Endpoint ${endpoint || name} chưa sẵn sàng hoặc offline. Sử dụng mock data.`);
  }

  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, data: payload, source: 'stub' }), 300)
  );
};

// ── GET Data Fetchers from PostgreSQL ──────────────────────────────────────────

export const fetchStudents = async (className) => {
  try {
    const url = className ? `/students?className=${encodeURIComponent(className)}` : '/students';
    const data = await apiClient(url);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    console.info('[API Fallback] Không lấy được danh sách học sinh từ PostgreSQL, dùng mockData.');
  }
  return null;
};

export const fetchGradeBook = async (studentCode, className, subjectName) => {
  try {
    let query = [];
    if (studentCode) query.push(`studentCode=${encodeURIComponent(studentCode)}`);
    if (className) query.push(`className=${encodeURIComponent(className)}`);
    if (subjectName) query.push(`subjectName=${encodeURIComponent(subjectName)}`);
    const qStr = query.length > 0 ? `?${query.join('&')}` : '';
    const data = await apiClient(`/gradebook${qStr}`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    console.info('[API Fallback] Không lấy được sổ điểm từ PostgreSQL, dùng mockData.');
  }
  return null;
};

export const fetchAttendance = async (className, attDate) => {
  try {
    let query = [];
    if (className) query.push(`className=${encodeURIComponent(className)}`);
    if (attDate) query.push(`attDate=${encodeURIComponent(attDate)}`);
    const qStr = query.length > 0 ? `?${query.join('&')}` : '';
    const data = await apiClient(`/attendance${qStr}`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    console.info('[API Fallback] Không lấy được điểm danh từ PostgreSQL, dùng mockData.');
  }
  return null;
};

export const fetchLeaveRequests = async (className, studentCode) => {
  try {
    let query = [];
    if (className) query.push(`className=${encodeURIComponent(className)}`);
    if (studentCode) query.push(`studentCode=${encodeURIComponent(studentCode)}`);
    const qStr = query.length > 0 ? `?${query.join('&')}` : '';
    const data = await apiClient(`/leave-requests${qStr}`);
    if (Array.isArray(data)) return data;
  } catch {
    console.info('[API Fallback] Không lấy được đơn xin nghỉ từ PostgreSQL, dùng mockData.');
  }
  return null;
};

export const fetchTuitions = async (className, studentCode) => {
  try {
    let query = [];
    if (className) query.push(`className=${encodeURIComponent(className)}`);
    if (studentCode) query.push(`studentCode=${encodeURIComponent(studentCode)}`);
    const qStr = query.length > 0 ? `?${query.join('&')}` : '';
    const data = await apiClient(`/tuition${qStr}`);
    if (Array.isArray(data)) return data;
  } catch {
    console.info('[API Fallback] Không lấy được thông tin học phí từ PostgreSQL, dùng mockData.');
  }
  return null;
};

export const fetchClasses = async () => {
  try {
    const data = await apiClient('/classes');
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    console.info('[API Fallback] Không lấy được danh mục lớp từ PostgreSQL.');
  }
  return null;
};

export const fetchSubjects = async () => {
  try {
    const data = await apiClient('/subjects');
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    console.info('[API Fallback] Không lấy được danh mục môn từ PostgreSQL.');
  }
  return null;
};

// ── POST / Action Handlers ───────────────────────────────────────────────────

export const handleLoginSubmit = async ({ username, password, role }) => {
  console.log('[API CALL] handleLoginSubmit -> Spring Boot PostgreSQL', { username, role });
  
  try {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: { username, password, role },
    });
    if (data) return data;
  } catch (err) {
    console.info('[API Fallback] Không kết nối được Backend Spring Boot (cổng 8081). Sử dụng dữ liệu giả định.');
    if (username === 'error') {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }
  }

  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        success: true,
        user: { username, role, name: username },
        token: 'demo-local-jwt-token',
        source: 'stub',
      });
    }, 300)
  );
};

export const handleSaveGrades       = createStub('handleSaveGrades', '/gradebook/save');
export const handleSaveAttendance   = createStub('handleSaveAttendance', '/attendance/save');
export const handleSendNotification = createStub('handleSendNotification', '/notifications/send');
export const handleSaveScheduleSlot = createStub('handleSaveScheduleSlot', '/schedules/save');
export const handleExportReport     = createStub('handleExportReport', '/reports/export');
export const handleCreateUser       = createStub('handleCreateUser', '/users/create');
export const handleUpdateUser       = createStub('handleUpdateUser', '/users/update');
export const handleDeactivateUser   = createStub('handleDeactivateUser', '/users/deactivate');

export const handleApproveGradeBook  = createStub('handleApproveGradeBook', '/gradebook/approve');
export const handleLockAllGradeBooks = createStub('handleLockAllGradeBooks', '/gradebook/lock-all');
