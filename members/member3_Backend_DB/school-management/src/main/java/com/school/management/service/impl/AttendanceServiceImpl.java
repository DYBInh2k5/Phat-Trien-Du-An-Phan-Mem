package com.school.management.service.impl;

import com.school.management.entity.Attendance;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.AttendanceRepository;
import com.school.management.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    @Autowired
    public AttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance entry not found with id: " + id));
    }

    @Override
    public List<Attendance> getAttendanceByStudentCode(String studentCode) {
        return attendanceRepository.findByStudentCode(studentCode);
    }

    @Override
    public List<Attendance> getAttendanceByClassAndDate(String className, String attDate) {
        return attendanceRepository.findByClassNameAndAttDate(className, attDate);
    }

    @Override
    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> saveAllAttendance(List<Attendance> attendanceList) {
        return attendanceRepository.saveAll(attendanceList);
    }
}
