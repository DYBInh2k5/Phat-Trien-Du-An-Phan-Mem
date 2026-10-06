import { StudentService } from '../services/StudentService.js';

export class StudentController {
  static async getStudents(req, res) {
    try {
      const { className } = req.query;
      const students = await StudentService.getAllStudents(className);
      return res.json(students);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getStudentById(req, res) {
    try {
      const student = await StudentService.getStudentById(req.params.id);
      return res.json(student);
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createStudent(req, res) {
    try {
      const created = await StudentService.createStudent(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStudent(req, res) {
    try {
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
}
