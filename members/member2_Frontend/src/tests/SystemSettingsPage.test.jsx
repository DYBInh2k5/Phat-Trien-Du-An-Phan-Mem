/**
 * SystemSettingsPage.test.jsx
 * Tests: load permissions, API error fallback, BGH settings checkbox locked, save permissions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SystemSettingsPage from '../pages/bgh/SystemSettingsPage.jsx';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
  default: { Provider: ({ children }) => children },
  AuthProvider: ({ children }) => children,
}));

vi.mock('../api/stubs.js', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchPermissions: vi.fn(),
  savePermissions: vi.fn(),
}));

import { useAuth } from '../context/AuthContext.jsx';
import { fetchUsers, fetchPermissions, savePermissions } from '../api/stubs.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockPermissions = {
  gradebook:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance: { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:   { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:   { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

const bghAuth = {
  user: { id: 99, name: 'BGH User', role: 'BGH', className: null },
  role: 'BGH',
  className: null,
  isAuthenticated: true,
  isRestoringSession: false,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <SystemSettingsPage />
    </MemoryRouter>
  );
}

async function switchToPermissionsTab() {
  const tabBtn = screen.getByRole('button', { name: /Phân quyền chi tiết/i });
  fireEvent.click(tabBtn);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SystemSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(bghAuth);
  });

  // A. Load permissions từ API → checkboxes xuất hiện
  it('A. Tải permissions từ API, chuyển tab Phân quyền → hiển thị checkboxes', async () => {
    fetchUsers.mockResolvedValue([]);
    fetchPermissions.mockResolvedValue(mockPermissions);

    renderPage();

    // Chuyển sang tab Phân quyền chi tiết
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Phân quyền chi tiết/i })).toBeInTheDocument();
    });
    switchToPermissionsTab();

    // Sau khi load xong, các checkbox phải hiển thị
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // 5 modules × 5 roles = 25 checkboxes (+ 2 legend checkboxes = 27 total)
      expect(checkboxes.length).toBeGreaterThanOrEqual(25);
    });
  });

  // B. API error → fallback DEFAULT_PERMISSIONS, không crash
  it('B. API lỗi: fallback DEFAULT_PERMISSIONS, không crash, vẫn hiển thị permission matrix', async () => {
    fetchUsers.mockResolvedValue([]);
    fetchPermissions.mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Phân quyền chi tiết/i })).toBeInTheDocument();
    });
    switchToPermissionsTab();

    // Dù API lỗi, vẫn load được permission matrix
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(25);
    });

    // Có warning message về fallback
    expect(screen.getByText(/Không thể tải phân quyền/i)).toBeInTheDocument();
  });

  // C. BGH settings checkbox phải bị disabled (LOCKED_ON logic)
  it('C. Checkbox settings/BGH bị disabled (LOCKED_ON)', async () => {
    fetchUsers.mockResolvedValue([]);
    fetchPermissions.mockResolvedValue(mockPermissions);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Phân quyền chi tiết/i })).toBeInTheDocument();
    });
    switchToPermissionsTab();

    // Chờ checkboxes load xong
    await waitFor(() => {
      // Checkbox với aria-label "Cài đặt — BGH" phải tồn tại
      expect(screen.getByRole('checkbox', { name: 'Cài đặt — BGH' })).toBeInTheDocument();
    });

    const lockedCheckbox = screen.getByRole('checkbox', { name: 'Cài đặt — BGH' });
    expect(lockedCheckbox).toBeDisabled();
    expect(lockedCheckbox).toBeChecked(); // BGH luôn có quyền settings
  });

  // D. Save permissions — click Lưu thay đổi → savePermissions được gọi 1 lần
  it('D. Click Lưu thay đổi → savePermissions được gọi', async () => {
    fetchUsers.mockResolvedValue([]);
    fetchPermissions.mockResolvedValue(mockPermissions);
    savePermissions.mockResolvedValue({});

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Phân quyền chi tiết/i })).toBeInTheDocument();
    });
    switchToPermissionsTab();

    // Chờ load xong (hết loading state)
    await waitFor(() => {
      expect(screen.queryByText(/Đang tải phân quyền/i)).not.toBeInTheDocument();
    });

    // Click nút Lưu thay đổi
    const saveBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(savePermissions).toHaveBeenCalledTimes(1);
    });
  });
});
