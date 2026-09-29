package com.school.management.repository;

import com.school.management.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByClassName(String className);
    List<LeaveRequest> findByStudentCode(String studentCode);
}
