/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/context/SemesterContext.jsx
 * Vai trò: Context Học kỳ / Năm học Toàn Cục (Global Semester Context)
 * Mô tả:
 *   - Lưu trữ và chia sẻ state { semester, schoolYear } cho toàn bộ cây Component.
 *   - Các trang Dashboard, GradeBook, Attendance đều đọc từ context này.
 *   - Người dùng thay đổi học kỳ qua Header → tất cả trang tự động cập nhật.
 *   - Giá trị được persist vào localStorage để ghi nhớ sau khi refresh.
 * ==============================================================================
 */

import { createContext, useContext, useState, useEffect } from 'react';

/** Danh sách học kỳ / năm học có sẵn để chọn */
export const SEMESTER_OPTIONS = [
  { semester: 'HK1', schoolYear: '2024-2025', label: 'Học kỳ I — 2024–2025' },
  { semester: 'HK2', schoolYear: '2024-2025', label: 'Học kỳ II — 2024–2025' },
  { semester: 'HK1', schoolYear: '2025-2026', label: 'Học kỳ I — 2025–2026' },
  { semester: 'HK2', schoolYear: '2025-2026', label: 'Học kỳ II — 2025–2026' },
];

const STORAGE_KEY = 'htqllh_semester';

const SemesterContext = createContext(null);

/**
 * Provider bọc ngoài MainLayout để tất cả trang con dùng được.
 */
export function SemesterProvider({ children }) {
  const [current, setCurrent] = useState(() => {
    // Khởi tạo từ localStorage, fallback sang HK1 2024-2025
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = SEMESTER_OPTIONS.find(
          o => o.semester === parsed.semester && o.schoolYear === parsed.schoolYear
        );
        if (valid) return valid;
      }
    } catch { /* ignore */ }
    return SEMESTER_OPTIONS[0];
  });

  // Persist mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ semester: current.semester, schoolYear: current.schoolYear }));
  }, [current]);

  /**
   * Chọn học kỳ theo index trong SEMESTER_OPTIONS hoặc theo object { semester, schoolYear }.
   * @param {number|{semester,schoolYear}} val
   */
  function selectSemester(val) {
    if (typeof val === 'number') {
      const opt = SEMESTER_OPTIONS[val];
      if (opt) setCurrent(opt);
    } else if (val && val.semester && val.schoolYear) {
      const opt = SEMESTER_OPTIONS.find(o => o.semester === val.semester && o.schoolYear === val.schoolYear);
      if (opt) setCurrent(opt);
    }
  }

  return (
    <SemesterContext.Provider value={{ ...current, selectSemester, options: SEMESTER_OPTIONS }}>
      {children}
    </SemesterContext.Provider>
  );
}

/**
 * Hook tiện ích đọc/ghi học kỳ từ bất kỳ component nào.
 * @returns {{ semester, schoolYear, label, selectSemester, options }}
 */
export function useSemester() {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error('useSemester phải được dùng trong SemesterProvider');
  return ctx;
}
