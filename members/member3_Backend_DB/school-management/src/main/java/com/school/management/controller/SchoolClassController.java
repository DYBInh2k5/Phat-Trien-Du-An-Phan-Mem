package com.school.management.controller;

import com.school.management.entity.SchoolClass;
import com.school.management.repository.SchoolClassRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class SchoolClassController {

    private final SchoolClassRepository schoolClassRepository;

    public SchoolClassController(SchoolClassRepository schoolClassRepository) {
        this.schoolClassRepository = schoolClassRepository;
    }

    @GetMapping
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(schoolClassRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<SchoolClass> createClass(@RequestBody SchoolClass schoolClass) {
        return ResponseEntity.ok(schoolClassRepository.save(schoolClass));
    }
}
