package com.school.management.service.impl;

import com.school.management.entity.GradeBook;
import com.school.management.entity.Student;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.GradeBookRepository;
import com.school.management.repository.StudentRepository;
import com.school.management.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final GradeBookRepository gradeBookRepository;

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository, GradeBookRepository gradeBookRepository) {
        this.studentRepository = studentRepository;
        this.gradeBookRepository = gradeBookRepository;
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Override
    public Student getStudentByCode(String studentCode) {
        return studentRepository.findByStudentCode(studentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with code: " + studentCode));
    }

    @Override
    public List<Student> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className);
    }

    @Override
    public Student createStudent(Student student) {
        if (student.getGpa() != null) {
            evaluateAcademicRank(student);
        }
        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);
        student.setFullName(studentDetails.getFullName());
        student.setClassName(studentDetails.getClassName());
        student.setGender(studentDetails.getGender());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        student.setParentName(studentDetails.getParentName());
        student.setParentPhone(studentDetails.getParentPhone());
        student.setStatus(studentDetails.getStatus());
        if (studentDetails.getGpa() != null) {
            student.setGpa(studentDetails.getGpa());
            evaluateAcademicRank(student);
        }
        return studentRepository.save(student);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    @Override
    public Student calculateAcademicPerformance(Long studentId) {
        Student student = getStudentById(studentId);
        List<GradeBook> grades = gradeBookRepository.findByStudentCode(student.getStudentCode());

        if (grades.isEmpty()) {
            return student;
        }

        double sum = 0.0;
        int count = 0;
        for (GradeBook gb : grades) {
            if (gb.getAverageScore() != null) {
                sum += gb.getAverageScore();
                count++;
            }
        }

        if (count > 0) {
            double gpa = Math.round((sum / count) * 10.0) / 10.0;
            student.setGpa(gpa);
            evaluateAcademicRank(student);
            studentRepository.save(student);
        }

        return student;
    }

    private void evaluateAcademicRank(Student student) {
        Double gpa = student.getGpa();
        if (gpa == null) return;

        if (gpa >= 9.0) {
            student.setAcademicRank("Xuất sắc");
        } else if (gpa >= 8.0) {
            student.setAcademicRank("Giỏi");
        } else if (gpa >= 6.5) {
            student.setAcademicRank("Khá");
        } else if (gpa >= 5.0) {
            student.setAcademicRank("Trung bình");
        } else {
            student.setAcademicRank("Yếu");
        }
    }
}
