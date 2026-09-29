package com.school.management.repository;

import com.school.management.entity.Tuition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuitionRepository extends JpaRepository<Tuition, Long> {
    Optional<Tuition> findByStudentCodeAndSemester(String studentCode, String semester);
    List<Tuition> findByClassName(String className);
}
