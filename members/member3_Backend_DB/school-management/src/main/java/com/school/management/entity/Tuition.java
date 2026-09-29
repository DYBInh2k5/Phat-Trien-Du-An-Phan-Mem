package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tuitions")
public class Tuition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_code", nullable = false)
    private String studentCode;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "class_name", nullable = false)
    private String className;

    private String semester;

    @Column(name = "school_year")
    private String schoolYear;

    @Column(name = "amount_due")
    private Double amountDue;

    @Column(name = "amount_paid")
    private Double amountPaid;

    private String status; // PAID, UNPAID, PARTIAL

    @Column(name = "receipt_no")
    private String receiptNo;

    public Tuition() {}

    public Tuition(String studentCode, String studentName, String className, String semester, String schoolYear, Double amountDue, Double amountPaid, String status, String receiptNo) {
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.className = className;
        this.semester = semester;
        this.schoolYear = schoolYear;
        this.amountDue = amountDue;
        this.amountPaid = amountPaid;
        this.status = status;
        this.receiptNo = receiptNo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getSchoolYear() { return schoolYear; }
    public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }

    public Double getAmountDue() { return amountDue; }
    public void setAmountDue(Double amountDue) { this.amountDue = amountDue; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
}
