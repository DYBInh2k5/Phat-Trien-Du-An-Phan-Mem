package com.school.management.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.management.entity.GradeBook;
import com.school.management.service.GradeBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gradebook")
public class GradeBookController {

    private final GradeBookService gradeBookService;
    private final ObjectMapper objectMapper;

    @Autowired
    public GradeBookController(GradeBookService gradeBookService, ObjectMapper objectMapper) {
        this.gradeBookService = gradeBookService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<GradeBook>> getGradeBook(
            @RequestParam(required = false) String studentCode,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String subjectName) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(gradeBookService.getGradesByStudentCode(studentCode));
        }
        if (className != null && subjectName != null) {
            return ResponseEntity.ok(gradeBookService.getGradesByClassAndSubject(className, subjectName));
        }
        if (className != null) {
            return ResponseEntity.ok(gradeBookService.getGradesByClass(className));
        }
        return ResponseEntity.ok(gradeBookService.getAllGrades());
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveGrades(@RequestBody Object payload) {
        Map<String, Object> response = new HashMap<>();

        if (payload instanceof List<?>) {
            List<?> rawList = (List<?>) payload;
            List<GradeBook> gradeBooks = new ArrayList<>();
            for (Object item : rawList) {
                GradeBook gb = objectMapper.convertValue(item, GradeBook.class);
                gradeBooks.add(gb);
            }
            List<GradeBook> saved = gradeBookService.saveAllGrades(gradeBooks);
            response.put("count", saved.size());
        } else {
            GradeBook gb = objectMapper.convertValue(payload, GradeBook.class);
            gradeBookService.saveGrade(gb);
            response.put("count", 1);
        }

        response.put("success", true);
        response.put("message", "Đã lưu thông tin sổ điểm thành công!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lock")
    public ResponseEntity<Map<String, Object>> lockGradeSheet(
            @RequestParam String className,
            @RequestParam String subjectName) {
        gradeBookService.lockGradeSheet(className, subjectName);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã khóa sổ điểm lớp " + className + " môn " + subjectName);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unlock")
    public ResponseEntity<Map<String, Object>> unlockGradeSheet(
            @RequestParam String className,
            @RequestParam String subjectName) {
        gradeBookService.unlockGradeSheet(className, subjectName);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã mở khóa sổ điểm lớp " + className + " môn " + subjectName);
        return ResponseEntity.ok(response);
    }
}
