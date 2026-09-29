package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "school_classes")
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name", nullable = false, unique = true)
    private String className;

    @Column(name = "grade_level")
    private Integer gradeLevel; // 10, 11, 12

    @Column(name = "homeroom_teacher")
    private String homeroomTeacher;

    private Integer capacity;

    public SchoolClass() {}

    public SchoolClass(String className, Integer gradeLevel, String homeroomTeacher, Integer capacity) {
        this.className = className;
        this.gradeLevel = gradeLevel;
        this.homeroomTeacher = homeroomTeacher;
        this.capacity = capacity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public String getHomeroomTeacher() { return homeroomTeacher; }
    public void setHomeroomTeacher(String homeroomTeacher) { this.homeroomTeacher = homeroomTeacher; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
