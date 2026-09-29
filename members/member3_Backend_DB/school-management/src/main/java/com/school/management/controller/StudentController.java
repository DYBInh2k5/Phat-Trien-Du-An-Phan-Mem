package com.school.management.controller;

import com.school.management.entity.Student;
import com.school.management.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String className) {
        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(studentRepository.findByClassName(className));
        }
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student saved = studentRepository.save(student);
        return ResponseEntity.ok(saved);
    }
}
