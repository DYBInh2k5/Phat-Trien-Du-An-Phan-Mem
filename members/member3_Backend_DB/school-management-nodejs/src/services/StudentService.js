import { StudentRepository } from '../repositories/StudentRepository.js';
import { GradeBookRepository } from '../repositories/GradeBookRepository.js';

export class StudentService {
  static async getAllStudents(className) {
    if (className) {
      return await StudentRepository.findByClassName(className);
    }
    return await StudentRepository.findAll();
  }

  static async getStudentById(id) {
    const s = await StudentRepository.findById(id);
    if (!s) throw new Error(`Student not found with id: ${id}`);
    return s;
  }

  static async createStudent(data) {
    if (data.gpa != null) {
      data.academicRank = this.evaluateAcademicRank(data.gpa);
    }
    return await StudentRepository.create(data);
  }

  static async updateStudent(id, data) {
    const existing = await this.getStudentById(id);
    const updatedData = { ...existing, ...data };
    if (updatedData.gpa != null) {
      updatedData.academicRank = this.evaluateAcademicRank(updatedData.gpa);
    }
    return await StudentRepository.update(id, updatedData);
  }

  static async calculateAcademicPerformance(studentId) {
    const student = await this.getStudentById(studentId);
    const grades = await GradeBookRepository.findByStudentCode(student.student_code);

    if (!grades || grades.length === 0) return student;

    let sum = 0;
    let count = 0;
    for (const gb of grades) {
      if (gb.average_score != null) {
        sum += parseFloat(gb.average_score);
        count++;
      }
    }

    if (count > 0) {
      const gpa = Math.round((sum / count) * 10) / 10;
      const academicRank = this.evaluateAcademicRank(gpa);
      return await StudentRepository.update(studentId, { ...student, gpa, academicRank });
    }

    return student;
  }

  static evaluateAcademicRank(gpa) {
    if (gpa >= 9.0) return 'Xuất sắc';
    if (gpa >= 8.0) return 'Giỏi';
    if (gpa >= 6.5) return 'Khá';
    if (gpa >= 5.0) return 'Trung bình';
    return 'Yếu';
  }
}
