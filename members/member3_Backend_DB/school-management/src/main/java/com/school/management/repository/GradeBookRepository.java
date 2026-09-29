package com.school.management.repository;

import com.school.management.entity.GradeBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeBookRepository extends JpaRepository<GradeBook, Long> {
    List<GradeBook> findByStudentCode(String studentCode);
    List<GradeBook> findByClassNameAndSubjectName(String className, String subjectName);
    List<GradeBook> findByClassName(String className);
}
