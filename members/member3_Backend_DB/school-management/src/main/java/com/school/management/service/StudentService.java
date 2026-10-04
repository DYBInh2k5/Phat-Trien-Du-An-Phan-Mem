package com.school.management.service;

import com.school.management.entity.Student;
import java.util.List;

public interface StudentService {
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student getStudentByCode(String studentCode);
    List<Student> getStudentsByClass(String className);
    Student createStudent(Student student);
    Student updateStudent(Long id, Student studentDetails);
    void deleteStudent(Long id);
    Student calculateAcademicPerformance(Long studentId);
}
