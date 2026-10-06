import { GradeBookService } from '../services/GradeBookService.js';

export class GradeBookController {
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
