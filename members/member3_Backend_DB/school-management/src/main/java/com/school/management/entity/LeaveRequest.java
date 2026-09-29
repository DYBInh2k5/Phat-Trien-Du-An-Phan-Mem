package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_code", nullable = false)
    private String studentCode;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "from_date")
    private String fromDate;

    @Column(name = "to_date")
    private String toDate;

    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "submitted_at")
    private String submittedAt;

    public LeaveRequest() {}

    public LeaveRequest(String studentCode, String studentName, String className, String reason, String fromDate, String toDate, String status, String submittedAt) {
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.className = className;
        this.reason = reason;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }

    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
}
