package com.school.management.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.management.entity.Attendance;
import com.school.management.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final ObjectMapper objectMapper;

    @Autowired
    public AttendanceController(AttendanceService attendanceService, ObjectMapper objectMapper) {
        this.attendanceService = attendanceService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String attDate,
            @RequestParam(required = false) String studentCode) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(attendanceService.getAttendanceByStudentCode(studentCode));
        }
        if (className != null && attDate != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByClassAndDate(className, attDate));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveAttendance(@RequestBody Object payload) {
        Map<String, Object> response = new HashMap<>();

        if (payload instanceof List<?>) {
            List<?> rawList = (List<?>) payload;
            List<Attendance> attendances = new ArrayList<>();
            for (Object item : rawList) {
                Attendance att = objectMapper.convertValue(item, Attendance.class);
                attendances.add(att);
            }
            List<Attendance> saved = attendanceService.saveAllAttendance(attendances);
            response.put("count", saved.size());
        } else {
            Attendance att = objectMapper.convertValue(payload, Attendance.class);
            attendanceService.saveAttendance(att);
            response.put("count", 1);
        }

        response.put("success", true);
        response.put("message", "Đã lưu thông tin điểm danh thành công!");
        return ResponseEntity.ok(response);
    }
}
