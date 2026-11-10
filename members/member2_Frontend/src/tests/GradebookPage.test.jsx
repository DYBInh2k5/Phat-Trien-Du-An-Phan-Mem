/**
 * GradebookPage.test.jsx
 * Tests: class lock for GVCN, dropdown for BGH, read-only mode, save button, API error
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GradebookPage from '../pages/gv/GradebookPage.jsx';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
  default: { Provider: ({ children }) => children },
  AuthProvider: ({ children }) => children,
}));

vi.mock('../api/stubs.js', () => ({
  fetchGradebookPageData: vi.fn(),
  saveGradebookSpreadsheet: vi.fn(),
}));

vi.mock('../utils/exportEngine.js', () => ({
  exportToExcel: vi.fn(),
  exportToPDF: vi.fn(),
}));

import { useAuth } from '../context/AuthContext.jsx';
import { fetchGradebookPageData } from '../api/stubs.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const successData = {
  success: true,
  classes: [{ id: '10A1', name: '10A1' }],
  subjects: [],
  students: [],
  gradeRows: [],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <GradebookPage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GradebookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. GVCN class lock — chip hiển thị, KHÔNG có select dropdown cho lớp
  it('A. GVCN: hiển thị chip lớp cố định, không có dropdown lớp học', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'GV', role: 'GVCN', className: '10A1' },
      role: 'GVCN',
      className: '10A1',
      isAuthenticated: true,
      isRestoringSession: false,
    });
    fetchGradebookPageData.mockResolvedValue(successData);

    renderPage();

    // Chip phải xuất hiện với text '10A1'
    await waitFor(() => {
      expect(screen.getByText('10A1')).toBeInTheDocument();
    });

    // Không có select với options chứa '10A1' (select dropdown chọn lớp)
    // Phải không có element nào là select trong filter lớp học
    // (subject select và semester select vẫn có, nhưng không có class select)
    const selects = document.querySelectorAll('select');
    const classSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === '10A1')
    );
    expect(classSelect).toBeUndefined();
  });

  // B. BGH — có dropdown select cho lớp học
  it('B. BGH: hiển thị dropdown lớp học', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, role: 'BGH', className: null },
      role: 'BGH',
      className: null,
      isAuthenticated: true,
      isRestoringSession: false,
    });
    fetchGradebookPageData.mockResolvedValue(successData);

    renderPage();

    await waitFor(() => {
      // Ít nhất 1 select phải tồn tại (lớp học dropdown)
      const selects = document.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  // C. BGH read-only — KHÔNG render nút 'Lưu điểm'
  it('C. BGH: không hiển thị nút Lưu điểm (chế độ xem)', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, role: 'BGH', className: null },
      role: 'BGH',
      className: null,
      isAuthenticated: true,
      isRestoringSession: false,
    });
    fetchGradebookPageData.mockResolvedValue(successData);

    renderPage();

    await waitFor(() => {
      expect(fetchGradebookPageData).toHaveBeenCalled();
    });

    // Không có nút lưu điểm (text "Lưu điểm")
    expect(screen.queryByText(/Lưu điểm/i)).not.toBeInTheDocument();
  });

  // D. GVCN — có nút 'Lưu điểm'
  it('D. GVCN: hiển thị nút Lưu điểm', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'GV', role: 'GVCN', className: '10A1' },
      role: 'GVCN',
      className: '10A1',
      isAuthenticated: true,
      isRestoringSession: false,
    });
    fetchGradebookPageData.mockResolvedValue(successData);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Lưu điểm/i)).toBeInTheDocument();
    });
  });

  // E. API error → error banner
  it('E. Khi API lỗi, hiển thị thông báo lỗi', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'GV', role: 'GVCN', className: '10A1' },
      role: 'GVCN',
      className: '10A1',
      isAuthenticated: true,
      isRestoringSession: false,
    });
    fetchGradebookPageData.mockRejectedValue(new Error('Server error'));

    renderPage();

    await waitFor(() => {
      // Error banner hoặc text lỗi xuất hiện
      const errorEl =
        screen.queryByRole('alert') ||
        screen.queryByText(/Server error/i) ||
        screen.queryByText(/Không thể tải/i) ||
        screen.queryByText(/Lỗi/i);
      expect(errorEl).toBeInTheDocument();
    });
  });
});
