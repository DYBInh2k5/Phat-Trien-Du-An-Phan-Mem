package com.school.management.controller;

import com.school.management.entity.GradeBook;
import com.school.management.repository.GradeBookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gradebook")
public class GradeBookController {

    private final GradeBookRepository gradeBookRepository;

    public GradeBookController(GradeBookRepository gradeBookRepository) {
        this.gradeBookRepository = gradeBookRepository;
    }

    @GetMapping
    public ResponseEntity<List<GradeBook>> getGradeBook(
            @RequestParam(required = false) String studentCode,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String subjectName) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(gradeBookRepository.findByStudentCode(studentCode));
        }
        if (className != null && subjectName != null) {
            return ResponseEntity.ok(gradeBookRepository.findByClassNameAndSubjectName(className, subjectName));
        }
        if (className != null) {
            return ResponseEntity.ok(gradeBookRepository.findByClassName(className));
        }
        return ResponseEntity.ok(gradeBookRepository.findAll());
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveGrades(@RequestBody List<GradeBook> gradeBooks) {
        for (GradeBook gb : gradeBooks) {
            gb.calculateAverage();
        }
        List<GradeBook> saved = gradeBookRepository.saveAll(gradeBooks);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã lưu sổ điểm thành công vào PostgreSQL!");
        response.put("count", saved.size());
        return ResponseEntity.ok(response);
    }
}
