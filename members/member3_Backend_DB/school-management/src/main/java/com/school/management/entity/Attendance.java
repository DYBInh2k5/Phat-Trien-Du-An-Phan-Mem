package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "class_name")
    private String className;

    @Column(name = "att_date")
    private String attDate;

    private String status; // PRESENT, ABSENT_PERMIT, ABSENT_NO_PERMIT

    private String note;

    public Attendance() {}

    public Attendance(String studentCode, String studentName, String className, String attDate, String status, String note) {
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.className = className;
        this.attDate = attDate;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getAttDate() { return attDate; }
    public void setAttDate(String attDate) { this.attDate = attDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
