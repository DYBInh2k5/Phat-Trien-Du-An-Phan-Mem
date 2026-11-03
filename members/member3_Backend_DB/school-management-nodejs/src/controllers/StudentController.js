import { StudentService } from '../services/StudentService.js';

const SENTINEL = '__NO_CLASS__';

export class StudentController {
  static async getStudents(req, res) {
    try {
      const { className } = req.query;
      const students = await StudentService.getAllStudents(className, req.gvcnClassName ?? null);
      return res.json(students);
    } catch (err) {
      if (err.code === 'GVCN_NOT_ASSIGNED') {
        return res.status(403).json({ success: false, message: err.message, code: err.code });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getStudentById(req, res) {
    try {
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      const student = await StudentService.getStudentById(req.params.id);
      // GVCN đã phân công → chỉ được xem học sinh lớp mình
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền truy cập dữ liệu học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
      return res.json(student);
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createStudent(req, res) {
    try {
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → chỉ được tạo học sinh vào lớp mình
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const targetClass = req.body.className || req.body.class_name;
        if (targetClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'GVCN chỉ được tạo học sinh thuộc lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
      const created = await StudentService.createStudent(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStudent(req, res) {
    try {
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → kiểm tra học sinh có thuộc lớp mình không
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const student = await StudentService.getStudentById(req.params.id);
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền sửa dữ liệu học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
      const updated = await StudentService.updateStudent(req.params.id, req.body);
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async calculateGPA(req, res) {
    try {
      const updated = await StudentService.calculateAcademicPerformance(req.params.id);
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateConduct(req, res) {
    try {
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === '__NO_CLASS__') {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → kiểm tra học sinh có thuộc lớp mình không
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const student = await StudentService.getStudentById(req.params.id);
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền cập nhật hạnh kiểm học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
      const { conductRank, schoolYear, semester } = req.body;
      const validRanks = ['Tốt', 'Khá', 'Trung bình', 'Yếu'];
      if (!conductRank || !validRanks.includes(conductRank)) {
        return res.status(400).json({ success: false, message: 'Hạnh kiểm không hợp lệ. Các giá trị cho phép: Tốt, Khá, Trung bình, Yếu' });
      }
      const result = await StudentService.updateStudent(req.params.id, { conductRank, schoolYear, semester });
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
