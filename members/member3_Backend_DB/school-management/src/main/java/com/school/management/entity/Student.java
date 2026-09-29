package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_code", nullable = false, unique = true, length = 30)
    private String studentCode;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String gender;
    private String dob;

    @Column(name = "class_name")
    private String className;

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "parent_phone")
    private String parentPhone;

    public Student() {}

    public Student(String studentCode, String fullName, String gender, String dob, String className, String parentName, String parentPhone) {
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.gender = gender;
        this.dob = dob;
        this.className = className;
        this.parentName = parentName;
        this.parentPhone = parentPhone;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }
}
