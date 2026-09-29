package com.school.management.repository;

import com.school.management.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByClassNameAndAttDate(String className, String attDate);
    List<Attendance> findByStudentCode(String studentCode);
}
