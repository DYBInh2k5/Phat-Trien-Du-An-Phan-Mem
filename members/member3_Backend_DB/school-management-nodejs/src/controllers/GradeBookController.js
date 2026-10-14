import { GradeBookService } from '../services/GradeBookService.js';

export class GradeBookController {
  /**
   * GET /api/gradebook/page-data?className=10A1&semester=HK1&schoolYear=2024-2025
   * Trả về classes, subjects, students, gradeRows cho GradebookPage.
   */
  static async getPageData(req, res) {
    try {
      const { className, semester = 'HK1', schoolYear = '2024-2025' } = req.query;
      if (!className) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số className' });
      }
      const data = await GradeBookService.getGradebookPageData(className, semester, schoolYear);
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('[GradeBookController] getPageData error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getGradeBook(req, res) {
    try {
      const grades = await GradeBookService.getGrades(req.query);
      return res.json(grades);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async saveGrades(req, res) {
    try {
      const payload = req.body;
      let count = 0;

      if (Array.isArray(payload)) {
        const saved = await GradeBookService.saveAllGrades(payload);
        count = saved.length;
      } else {
        await GradeBookService.saveGrade(payload);
        count = 1;
      }

      return res.json({
        success: true,
        message: 'Đã lưu thông tin sổ điểm thành công vào Node.js & PostgreSQL!',
        count,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/gradebook/save-spreadsheet
   * Body: { className, semester, schoolYear, items: [...] }
   * Lưu hàng loạt từ trang spreadsheet GradebookPage.
   */
  static async saveSpreadsheet(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có dữ liệu để lưu' });
      }
      const saved = await GradeBookService.saveGradesFromSpreadsheet(items);
      return res.json({
        success: true,
        message: `Đã lưu ${saved.length} dòng điểm vào PostgreSQL!`,
        count: saved.length,
      });
    } catch (err) {
      console.error('[GradeBookController] saveSpreadsheet error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async lockGradeSheet(req, res) {
    try {
      const { className, subjectName } = req.query;
      await GradeBookService.lockGradeSheet(className, subjectName);
      return res.json({
        success: true,
        message: `Đã khóa sổ điểm lớp ${className} môn ${subjectName}`,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async unlockGradeSheet(req, res) {
    try {
      const { className, subjectName } = req.query;
      await GradeBookService.unlockGradeSheet(className, subjectName);
      return res.json({
        success: true,
        message: `Đã mở khóa sổ điểm lớp ${className} môn ${subjectName}`,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
