package com.school.management.controller;

import com.school.management.entity.Attendance;
import com.school.management.repository.AttendanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String attDate,
            @RequestParam(required = false) String studentCode) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(attendanceRepository.findByStudentCode(studentCode));
        }
        if (className != null && attDate != null) {
            return ResponseEntity.ok(attendanceRepository.findByClassNameAndAttDate(className, attDate));
        }
        return ResponseEntity.ok(attendanceRepository.findAll());
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveAttendance(@RequestBody Object payload) {
        Map<String, Object> response = new HashMap<>();

        if (payload instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Attendance> attendances = (List<Attendance>) payload;
            List<Attendance> saved = attendanceRepository.saveAll(attendances);
            response.put("count", saved.size());
        }

        response.put("success", true);
        response.put("message", "Đã lưu thông tin điểm danh thành công vào PostgreSQL!");
        return ResponseEntity.ok(response);
    }
}
