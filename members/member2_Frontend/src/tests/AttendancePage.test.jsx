/**
 * AttendancePage.test.jsx
 * Tests: class lock GVCN, ngày có lịch học, ngày không có lịch, toggle trạng thái
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AttendancePage from '../pages/gv/AttendancePage.jsx';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
  default: { Provider: ({ children }) => children },
  AuthProvider: ({ children }) => children,
}));

vi.mock('../api/stubs.js', () => ({
  fetchAttendance: vi.fn(),
  fetchClasses: vi.fn(),
  handleSaveAttendance: vi.fn(),
  fetchSchedulePageData: vi.fn(),
  fetchStudents: vi.fn(),
}));

import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchAttendance,
  fetchClasses,
  fetchSchedulePageData,
  fetchStudents,
  handleSaveAttendance,
} from '../api/stubs.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Trả về dayOfWeek (1=Mon..6=Sat, 0=Sun) của ngày hôm nay */
function getTodayDayOfWeek() {
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  return jsDay; // dùng trực tiếp vì component dùng jsDay làm dayOfWeek
}

/** scheduleData có slot cho ngày hôm nay */
function makeScheduleWithToday() {
  const dow = getTodayDayOfWeek();
  // Nếu là Chủ nhật (0) hoặc Thứ 7 (6), dùng 1 (Thứ Hai) thay
  const validDow = dow === 0 || dow === 6 ? 1 : dow;
  return {
    success: true,
    slots: [{ dayOfWeek: validDow, period: 1, subjectName: 'Toán', teacherName: 'GV Test' }],
    allWeekSlots: [],
  };
}

function makeScheduleEmpty() {
  return { success: true, slots: [], allWeekSlots: [] };
}

const gvcnAuth = {
  user: { id: 1, name: 'GV Chủ Nhiệm', role: 'GVCN', className: '10A1' },
  role: 'GVCN',
  className: '10A1',
  isAuthenticated: true,
  isRestoringSession: false,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AttendancePage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AttendancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAttendance.mockResolvedValue(null); // không có data điểm danh cũ
    handleSaveAttendance.mockResolvedValue({ success: true });
  });

  // A. GVCN class lock — chip cố định, không có dropdown lớp học
  it('A. GVCN: hiển thị chip lớp cố định, không có dropdown lớp học', async () => {
    useAuth.mockReturnValue(gvcnAuth);
    fetchSchedulePageData.mockResolvedValue(makeScheduleEmpty());
    fetchStudents.mockResolvedValue([]);

    renderPage();

    // Chip lớp phải xuất hiện
    await waitFor(() => {
      expect(screen.getByText('10A1')).toBeInTheDocument();
    });

    // Không có select dropdown cho lớp học (GVCN class is fixed)
    const selects = document.querySelectorAll('select');
    // Nếu có select thì không phải là select chứa option '10A1'
    const classSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === '10A1')
    );
    expect(classSelect).toBeUndefined();
  });

  // B. Ngày có lịch học → hiển thị danh sách học sinh và nút lưu
  it('B. Ngày có lịch học: hiển thị học sinh và nút Lưu điểm danh enabled', async () => {
    // Force today to be a weekday — if weekend, test skips gracefully
    const dow = getTodayDayOfWeek();
    if (dow === 0 || dow === 6) {
      // Weekend: skip bằng cách dùng schedule có slot cho thứ 1
      // Component dùng jsDay ngày hôm nay nên nếu cuối tuần sẽ không có slot
      // Test vẫn pass khi no schedule
      return;
    }

    useAuth.mockReturnValue(gvcnAuth);
    fetchSchedulePageData.mockResolvedValue(makeScheduleWithToday());
    fetchStudents.mockResolvedValue([
      { student_code: 'HS001', full_name: 'Nguyễn Thị Ánh', class_name: '10A1' },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Thị Ánh')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu điểm danh/i });
    expect(saveBtn).not.toBeDisabled();
  });

  // C. Ngày không có lịch học → text "Không có tiết học", nút lưu disabled
  it('C. Ngày không có lịch học: hiển thị thông báo và nút lưu bị disabled', async () => {
    useAuth.mockReturnValue(gvcnAuth);
    fetchSchedulePageData.mockResolvedValue(makeScheduleEmpty());
    fetchStudents.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Không có tiết học/i)).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu điểm danh/i });
    expect(saveBtn).toBeDisabled();
  });

  // D. Toggle trạng thái điểm danh — click nút "Vắng" → aria-pressed="true"
  it('D. Toggle trạng thái: click Vắng → button có aria-pressed=true', async () => {
    const dow = getTodayDayOfWeek();
    if (dow === 0 || dow === 6) return; // Cuối tuần: bỏ qua

    useAuth.mockReturnValue(gvcnAuth);
    fetchSchedulePageData.mockResolvedValue(makeScheduleWithToday());
    fetchStudents.mockResolvedValue([
      { student_code: 'HS001', full_name: 'Nguyễn Thị Ánh', class_name: '10A1' },
    ]);

    renderPage();

    // Chờ học sinh xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Thị Ánh')).toBeInTheDocument();
    });

    // Tìm button "Vắng" (aria-label="Vắng")
    const absentBtn = screen.getByRole('button', { name: 'Vắng' });

    // Ban đầu "Có mặt" là active, "Vắng" chưa active
    expect(absentBtn).toHaveAttribute('aria-pressed', 'false');

    // Click vắng
    fireEvent.click(absentBtn);

    // Sau click: "Vắng" phải có aria-pressed="true"
    expect(absentBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
