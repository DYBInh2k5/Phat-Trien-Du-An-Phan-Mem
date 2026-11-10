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

/**
 * Nộp đơn xin nghỉ học.
 * @param {{ studentCode, fromDate, toDate, reason }} payload
 */
export const submitLeaveRequest = async (payload) => {
  const data = await apiClient('/leave-requests', { method: 'POST', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Nộp đơn xin nghỉ thất bại');
  return data;
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

/**
 * Phân công lớp chủ nhiệm cho GVCN.
 * @param {string} className - tên lớp (vd: "10A1")
 * @param {number} userId - id của GVCN
 */
export const assignHomeroomClass = async (className, userId) => {
  const data = await apiClient(`/classes/${encodeURIComponent(className)}/homeroom`, {
    method: 'PUT',
    body: { userId },
  });
  if (!data?.success) throw new Error(data?.message || 'Phân công lớp chủ nhiệm thất bại');
  return data;
};

/**
 * Hủy phân công lớp chủ nhiệm.
 * @param {string} className - tên lớp cần hủy phân công
 */
export const removeHomeroomClass = async (className) => {
  const data = await apiClient(`/classes/${encodeURIComponent(className)}/homeroom`, {
    method: 'DELETE',
  });
  if (!data?.success) throw new Error(data?.message || 'Hủy phân công lớp chủ nhiệm thất bại');
  return data;
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

/**
 * Lấy đồng thời danh sách học sinh và danh sách lớp cho StudentListPage.
 * Nếu user là GVCN, backend tự lọc chỉ trả học sinh lớp chủ nhiệm.
 * @param {string|null} className - lọc thêm từ frontend (optional)
 * @returns {{ students: Array, classes: Array, restrictedClassName: string|null }}
 */
export const fetchStudentListData = async (className = null) => {
  const qs = className ? `?className=${encodeURIComponent(className)}` : '';
  const [rawStudents, rawClasses] = await Promise.all([
    apiClient(`/students${qs}`),
    apiClient('/classes'),
  ]);

  const students = (Array.isArray(rawStudents) ? rawStudents : []).map((s) => ({
    id:        s.student_code || s.studentCode || String(s.id),
    name:      s.full_name    || s.fullName    || '',
    className: s.class_name   || s.className   || '',
    gender:    s.gender       || '',
    dob:       s.dob          || '',
    parentName:  s.parent_name  || s.parentName  || '',
    parentPhone: s.parent_phone || s.parentPhone || '',
    gpa:         s.gpa          != null ? parseFloat(s.gpa) : null,
    academicRank: s.academic_rank || s.academicRank || '',
    status:    (s.status || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'inactive',
  }));

  const classes = (Array.isArray(rawClasses) ? rawClasses : []).map((c) => ({
    id:   c.class_name || c.className || String(c.id),
    name: c.class_name || c.className || String(c.id),
  }));

  // Nếu backend đã lọc theo lớp (GVCN), tất cả students cùng 1 lớp
  // → phát hiện bằng cách xem có bao nhiêu className khác nhau
  const classNamesInResult = [...new Set(students.map((s) => s.className).filter(Boolean))];
  const restrictedClassName = classNamesInResult.length === 1 ? classNamesInResult[0] : null;

  return { students, classes, restrictedClassName };
};

/**
 * Lấy dữ liệu tổng hợp dashboard dành cho Ban Giám Hiệu.
 * Trả về: { totalStudents, totalTeachers, attendanceRate, passingRate,
 *           lowAttendanceClasses, lowGpaStudents, attendanceTrend }
 * Ném lỗi khi API thất bại (không fallback sang mock).
 */
/**
 * Lấy tổng hợp chuyên cần theo lớp cho BGH.
 * @param {{ dateFrom?: string, dateTo?: string, className?: string }} filters
 * @returns {{ summaries: Array, classNames: Array<string> }}
 */
export const fetchAttendanceSummary = async ({ dateFrom, dateTo, className } = {}) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo)   params.append('dateTo', dateTo);
  if (className && className !== 'all') params.append('className', className);

  const qs = params.toString();
  const data = await apiClient(`/attendance/summary${qs ? `?${qs}` : ''}`);
  if (!data?.success) {
    throw new Error(data?.message || 'Lỗi khi tải dữ liệu chuyên cần');
  }
  return { summaries: data.summaries ?? [], classNames: data.classNames ?? [] };
};

/**
 * Lấy toàn bộ dữ liệu trang GradebookPage:
 * { classes, subjects, students, gradeRows }
 * @param {{ className, semester, schoolYear }} params
 */
export const fetchGradebookPageData = async ({ className, semester = 'HK1', schoolYear = '2024-2025' }) => {
  const qs = new URLSearchParams({ className, semester, schoolYear }).toString();
  const data = await apiClient(`/gradebook/page-data?${qs}`);
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải dữ liệu sổ điểm');
  return data;
};

/**
 * Lưu hàng loạt điểm từ spreadsheet.
 * @param {{ className, semester, schoolYear, items: Array }} payload
 */
export const saveGradebookSpreadsheet = async (payload) => {
  const data = await apiClient('/gradebook/save-spreadsheet', { method: 'POST', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Lưu điểm thất bại');
  return data;
};

export const fetchBGHDashboard = async () => {
  const data = await apiClient('/dashboard/bgh');
  if (!data?.success) {
    throw new Error(data?.message || 'Lỗi khi tải dữ liệu dashboard BGH');
  }
  return data.data;
};

// ── POST / Action Handlers ───────────────────────────────────────────────────

/**
 * Đăng nhập qua API thật. KHÔNG có fallback giả thành công.
 * Nếu API lỗi (sai mật khẩu, không kết nối được,...) sẽ throw lỗi thực sự.
 * Chú ý: AuthContext.jsx đã gọi trực tiếp apiClient('/auth/login'), hàm này
 * giữ lại để tương thích với các file khác có thể gọi trực tiếp.
 */
export const handleLoginSubmit = async ({ username, password, role }) => {
  console.log('[API CALL] handleLoginSubmit -> Node.js Express Backend', { username, role });
  const data = await apiClient('/auth/login', {
    method: 'POST',
    body: { username, password, role },
  });
  return data;
};

export const handleSaveGrades       = createStub('handleSaveGrades', '/gradebook/save');
export const handleSaveAttendance   = createStub('handleSaveAttendance', '/attendance/save');
export const handleSendNotification = createStub('handleSendNotification', '/notifications/send');
export const handleExportReport     = createStub('handleExportReport', '/reports/export');

// ── Schedule API ─────────────────────────────────────────────────────────────

/**
 * Lấy dữ liệu trang ScheduleAdmin: slots, allWeekSlots, classes, subjects, teacherNames.
 * @param {string} classId
 * @param {string} weekStart - YYYY-MM-DD
 */
export const fetchSchedulePageData = async (classId, weekStart) => {
  const data = await apiClient(
    `/schedules?classId=${encodeURIComponent(classId)}&weekStart=${encodeURIComponent(weekStart)}`
  );
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải dữ liệu thời khóa biểu');
  return data;
};

/**
 * Lưu (upsert) một slot thời khóa biểu.
 * @param {object} slot - { classId, weekStart, dayOfWeek, period, subjectName, teacherName, room }
 * @returns {object} slot đã lưu
 */
export const handleSaveScheduleSlot = async (slot) => {
  const data = await apiClient('/schedules', { method: 'POST', body: slot });
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi lưu tiết học');
  return data.data;
};

/**
 * Xóa một slot thời khóa biểu.
 */
export const handleDeleteScheduleSlot = async ({ classId, weekStart, dayOfWeek, period }) => {
  const data = await apiClient('/schedules', {
    method: 'DELETE',
    body: { classId, weekStart, dayOfWeek, period },
  });
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi xóa tiết học');
  return data;
};

/**
 * Lấy lịch cố định hàng tuần (schedule_templates) của một lớp.
 * Không phụ thuộc vào tuần cụ thể.
 * @param {string} classId
 * @returns {Array<{ id, classId, dayOfWeek, period, subjectName, teacherName, room }>}
 */
export const fetchScheduleTemplates = async (classId) => {
  try {
    const data = await apiClient(`/schedules/templates?classId=${encodeURIComponent(classId)}`);
    if (data?.success) return data.templates ?? [];
  } catch {
    console.info('[API Fallback] Không lấy được schedule templates, bỏ qua kiểm tra lịch.');
  }
  return [];
};
export const handleCreateUser       = createStub('handleCreateUser', '/users/create');
export const handleUpdateUser       = createStub('handleUpdateUser', '/users/update');
export const handleDeactivateUser   = createStub('handleDeactivateUser', '/users/deactivate');

// ── User Management API (Settings) ───────────────────────────────────────────

/**
 * Lấy danh sách toàn bộ người dùng.
 * @returns {Array<{ id, name, username, email, role, isActive, createdAt }>}
 */
export const fetchUsers = async () => {
  const data = await apiClient('/users');
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải danh sách người dùng');
  return data.data;
};

/**
 * Tạo người dùng mới.
 * @param {{ username, password, fullName, email, role, isActive? }} payload
 */
export const createUser = async (payload) => {
  const data = await apiClient('/users', { method: 'POST', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Tạo tài khoản thất bại');
  return data.data;
};

/**
 * Cập nhật thông tin người dùng.
 * @param {number} id
 * @param {{ fullName?, email?, role?, isActive?, password? }} payload
 */
export const updateUser = async (id, payload) => {
  const data = await apiClient(`/users/${id}`, { method: 'PUT', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Cập nhật tài khoản thất bại');
  return data.data;
};

/**
 * Vô hiệu hóa tài khoản.
 * @param {number} id
 */
export const deactivateUser = async (id) => {
  const data = await apiClient(`/users/${id}/deactivate`, { method: 'PATCH' });
  if (!data?.success) throw new Error(data?.message || 'Vô hiệu hóa tài khoản thất bại');
  return data.data;
};

export const handleApproveGradeBook  = createStub('handleApproveGradeBook', '/gradebook/approve');
export const handleLockAllGradeBooks = createStub('handleLockAllGradeBooks', '/gradebook/lock-all');

// ── Report API (BGH) ──────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ dữ liệu báo cáo BGH.
 * @param {{ semester: string, schoolYear: string }} filters
 * @returns {{ gradeBookList, hoclucByGrade, classNames, avgBySubject, submissionRate, scoreDistribution }}
 */
export const fetchBGHReportData = async ({ semester = 'HK1', schoolYear = '2024-2025' } = {}) => {
  const data = await apiClient(
    `/reports/bgh?semester=${encodeURIComponent(semester)}&schoolYear=${encodeURIComponent(schoolYear)}`
  );
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải dữ liệu báo cáo');
  return data;
};

/**
 * Ký duyệt sổ điểm một lớp.
 * @returns {{ classId, className, status, approvedAt }}
 */
export const approveBGHGradeBook = async ({ classId, semester, schoolYear }) => {
  const data = await apiClient('/reports/bgh/approve', {
    method: 'POST',
    body: { classId, semester, schoolYear },
  });
  if (!data?.success) throw new Error(data?.message || 'Ký duyệt thất bại');
  return data.data;
};

/**
 * Khóa sổ điểm toàn trường.
 */
export const lockAllBGHGradeBooks = async ({ semester, schoolYear }) => {
  const data = await apiClient('/reports/bgh/lock-all', {
    method: 'POST',
    body: { semester, schoolYear },
  });
  if (!data?.success) throw new Error(data?.message || 'Khóa sổ thất bại');
  return data;
};

/**
 * Xóa hẳn tài khoản (chỉ áp dụng cho tài khoản đã bị vô hiệu hóa).
 */
export const deleteUser = async (id) => {
  const data = await apiClient(`/users/${id}`, { method: 'DELETE' });
  if (!data?.success) throw new Error(data?.message || 'Xóa tài khoản thất bại');
  return data.data;
};

// ── Closure (Chốt sổ điểm) API ────────────────────────────────────────────────

/**
 * Lấy trạng thái chốt sổ của một lớp.
 * @param {{ classId: string, semester: string, schoolYear: string }}
 * @returns closure object hoặc null nếu chưa có
 */
export const fetchClosureStatus = async ({ classId, semester, schoolYear }) => {
  try {
    const qs = new URLSearchParams({ classId, semester, schoolYear }).toString();
    const data = await apiClient(`/gradebook/closure?${qs}`);
    return data?.data ?? null;
  } catch (err) {
    // 404 nghĩa là chưa có bản ghi → trả null
    if (err?.status === 404 || String(err?.message).includes('404')) return null;
    throw err;
  }
};

/**
 * Chốt sổ điểm.
 * @param {{ classId, className, gvcnName, semester, schoolYear }}
 * @returns closure DTO
 */
export const submitClosure = async ({ classId, className, gvcnName, semester, schoolYear }) => {
  const data = await apiClient('/gradebook/closure/submit', {
    method: 'POST',
    body: { classId, className, gvcnName, semester, schoolYear },
  });
  if (!data?.success) throw new Error(data?.message || 'Chốt sổ điểm thất bại');
  return data.data;
};

/**
 * Gửi đơn xin mở khóa sổ điểm.
 * @param {{ classId, className, gvcnName, semester, schoolYear, reason }}
 */
export const requestUnlock = async ({ classId, className, gvcnName, semester, schoolYear, reason }) => {
  const data = await apiClient('/gradebook/closure/request-unlock', {
    method: 'POST',
    body: { classId, className, gvcnName, semester, schoolYear, reason },
  });
  if (!data?.success) throw new Error(data?.message || 'Gửi đơn xin mở khóa thất bại');
  return data;
};

// ── Notifications API ─────────────────────────────────────────────────────────

/**
 * Lấy danh sách thông báo của user hiện tại.
 * @returns {Array}
 */
export const fetchNotifications = async () => {
  const data = await apiClient('/notifications');
  return data?.data ?? [];
};

/**
 * Lấy số thông báo chưa đọc.
 * @returns {number}
 */
export const fetchUnreadCount = async () => {
  const data = await apiClient('/notifications/unread-count');
  return data?.count ?? 0;
};

/**
 * Đánh dấu thông báo đã đọc.
 * @param {string|number} id
 */
export const markNotificationRead = async (id) => {
  await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
};

/**
 * BGH duyệt mở khóa sổ điểm.
 * @param {{ notificationId, classId, className, gvcnUsername, semester, schoolYear }}
 */
export const approveBGHUnlock = async ({ notificationId, classId, className, gvcnUsername, semester, schoolYear }) => {
  const data = await apiClient('/reports/bgh/approve-unlock', {
    method: 'POST',
    body: { notificationId, classId, className, gvcnUsername, semester, schoolYear },
  });
  if (!data?.success) throw new Error(data?.message || 'Duyệt mở khóa thất bại');
  return data;
};

// ── Communication API (Sổ liên lạc) ──────────────────────────────────────────

/**
 * Lấy danh sách liên hệ theo role (PH: BGH + GVCN các lớp của con; GVCN: lớp chủ nhiệm).
 */
export const fetchCommunicationContacts = async () => {
  const data = await apiClient('/communication/contacts');
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải danh sách người liên hệ');
  return data.data;
};

/**
 * Lấy dữ liệu khởi tạo trang: { classes, notifications }
 * @param {string|null} className - lọc thông báo theo lớp
 */
export const fetchCommunicationPageData = async (className = null) => {
  const qs = className ? `?className=${encodeURIComponent(className)}` : '';
  const data = await apiClient(`/communication/page-data${qs}`);
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải dữ liệu sổ liên lạc');
  return data;
};

/**
 * Lấy danh sách học sinh (phụ huynh) theo lớp.
 * @param {string} className
 * @returns {Array<{ id, name, className, parentName, parentPhone }>}
 */
export const fetchCommunicationStudents = async (className) => {
  const data = await apiClient(`/communication/students?className=${encodeURIComponent(className)}`);
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải danh sách học sinh');
  return data.data;
};

/**
 * Gửi thông báo mới.
 * @param {{ title, content, type, senderId, recipients }} payload
 * @returns notification DTO
 */
export const sendCommunicationNotification = async (payload) => {
  const data = await apiClient('/communication/notifications', { method: 'POST', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Gửi thông báo thất bại');
  return data.data;
};

/**
 * Lấy thread tin nhắn của một học sinh theo kênh trao đổi (GVCN hoặc BGH).
 * @param {string} studentId
 * @param {string} [conversationType='GVCN']
 * @returns {Array<{ id, from, text, conversationType, sentAt }>}
 */
export const fetchMessageThread = async (studentId, conversationType = 'GVCN') => {
  const qs = `?studentId=${encodeURIComponent(studentId)}&conversationType=${encodeURIComponent(conversationType || 'GVCN')}`;
  const data = await apiClient(`/communication/messages${qs}`);
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải tin nhắn');
  return data.data;
};

/**
 * Gửi tin nhắn vào thread.
 * @param {{ studentId, className, fromRole, message, conversationType }} payload
 * @returns message DTO
 */
export const sendMessageToThread = async (payload) => {
  const data = await apiClient('/communication/messages', { method: 'POST', body: payload });
  if (!data?.success) throw new Error(data?.message || 'Gửi tin nhắn thất bại');
  return data.data;
};

// ── GVCN Dashboard API ────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ dữ liệu Dashboard GVCN.
 * @returns {{ classInfo, students, todayAttendance, pendingLeaves, conductSummary, conductPct }}
 */
export const fetchGVCNDashboard = async () => {
  const data = await apiClient('/dashboard/gvcn');
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải dữ liệu Dashboard GVCN');
  return data.data;
};

/**
 * Duyệt hoặc từ chối đơn xin nghỉ học.
 * @param {number} id - ID đơn xin nghỉ
 * @param {'approve'|'reject'} action
 */
export const processLeaveRequest = async (id, action) => {
  const data = await apiClient(`/dashboard/gvcn/leave-requests/${id}`, {
    method: 'PATCH',
    body: { action },
  });
  if (!data?.success) throw new Error(data?.message || 'Xử lý đơn nghỉ thất bại');
  return data.data;
};

// ── Settings / Permissions API ────────────────────────────────────────────────

/**
 * Lấy ma trận phân quyền từ server.
 * @returns {object} matrix { [moduleId]: { [role]: boolean } }
 */
export const fetchPermissions = async () => {
  const data = await apiClient('/settings/permissions');
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải phân quyền');
  return data.data;
};

/**
 * Lưu ma trận phân quyền.
 * @param {object} matrix
 */
export const savePermissions = async (matrix) => {
  const data = await apiClient('/settings/permissions', { method: 'PUT', body: { matrix } });
  if (!data?.success) throw new Error(data?.message || 'Lưu phân quyền thất bại');
  return data.data;
};

/**
 * Cập nhật hạnh kiểm học sinh (UC-GVCN-07).
 * @param {string|number} studentId
 * @param {{ conductRank: string, schoolYear: string, semester: string }} payload
 * @returns student DTO sau khi cập nhật
 */
export const updateStudentConduct = async (studentId, { conductRank, schoolYear, semester }) => {
  const data = await apiClient(`/students/${encodeURIComponent(studentId)}/conduct`, {
    method: 'PUT',
    body: { conductRank, schoolYear, semester },
  });
  if (!data?.success) throw new Error(data?.message || 'Cập nhật hạnh kiểm thất bại');
  return data.data;
};

// ── Grade Review Request API (UC-GVBM-09) ────────────────────────────────────

/**
 * Học sinh nộp đơn yêu cầu phúc khảo điểm.
 * @param {{ studentCode, subjectName, semester, schoolYear, reason, currentScore }} payload
 * @returns {{ id, status }}
 */
export const submitGradeReviewRequest = async ({ studentCode, subjectName, semester, schoolYear, reason, currentScore }) => {
  const data = await apiClient('/gradebook/review-request', {
    method: 'POST',
    body: { studentCode, subjectName, semester, schoolYear, reason, currentScore },
  });
  if (!data?.success) throw new Error(data?.message || 'Nộp đơn phúc khảo thất bại');
  return data.data;
};

/**
 * GV/GVCN xem danh sách đơn phúc khảo điểm đang chờ.
 * @returns {Array}
 */
export const fetchGradeReviewRequests = async () => {
  const data = await apiClient('/gradebook/review-requests');
  if (!data?.success) throw new Error(data?.message || 'Lỗi khi tải danh sách phúc khảo');
  return data.data ?? [];
};
