package com.school.management.service;

import com.school.management.entity.Attendance;
import java.util.List;

public interface AttendanceService {
    List<Attendance> getAllAttendance();
    Attendance getAttendanceById(Long id);
    List<Attendance> getAttendanceByStudentCode(String studentCode);
    List<Attendance> getAttendanceByClassAndDate(String className, String attDate);
    Attendance saveAttendance(Attendance attendance);
    List<Attendance> saveAllAttendance(List<Attendance> attendanceList);
}
