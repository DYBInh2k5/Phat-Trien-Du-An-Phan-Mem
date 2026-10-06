# BrainStorm Tuần 9: Chuyên Đề Kiểm Thử Phần Mềm & Đảm Bảo Chất Lượng (Software Testing & QA)

Tài liệu nghiên cứu và chiến lược triển khai Kiểm thử phần mềm (Software Testing & Quality Assurance Plan) cho **Hệ thống Quản lý Trường học (HTQLLH)**, bao gồm Unit Testing, Integration Testing, API Endpoint Testing và UAT Test Acceptance.

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ

### 1. Mục tiêu
Thiết lập bộ test suite tự động kiểm tra toàn bộ tính chính xác của các quy tắc nghiệp vụ (Business Rules), tính bảo mật phân quyền 5 Roles và hiệu năng trích xuất báo cáo.

### 2. Chiến lược 3 Tầng Kiểm thử (3-Tier Test Strategy)

1. **Tầng 1: Unit Testing (Kiểm thử Đơn vị)**:
   - Kiểm thử thuật toán tính Điểm trung bình môn (TBM) theo trọng số.
   - Kiểm thử xếp loại học lực tự động (`Giỏi`, `Khá`, `Trung bình`, `Yếu`).
   - Kiểm thử chuyển đổi thang điểm 10 sang thang điểm 4.0.
   - Kiểm thử bộ sinh báo cáo Excel (`SheetJS`) và PDF (`jsPDF`).
2. **Tầng 2: Integration & Security Testing (Kiểm thử Tích hợp & Bảo mật)**:
   - Kiểm thử xác thực JWT Token và chặn truy cập trái phép.
   - Kiểm thử ma trận phân quyền 5 Roles (RBAC).
   - Kiểm thử giao dịch dữ liệu toàn vẹn qua `UnitOfWork`.
3. **Tầng 3: User Acceptance Testing (UAT Test Plan)**:
   - Kiểm thử kịch bản thực tế 5 vai trò người dùng tương tác trực tiếp trên giao diện Frontend React SPA.

---

## CHƯƠNG II. THIẾT KẾ BỘ MÃ NGUỒN TỰ ĐỘNG KIỂM THỬ

Bộ Test Suite tự động cho kiểm thử QA đã được triển khai chính thức tại [members/member5_Modules_QA/tests/unitTestingSuite.test.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js).

### Kết quả Kiểm thử Tự động (Automated Test Execution Results)

```text
=====================================================
[UNIT TEST QA SUITE] Executing Automated System Tests
=====================================================
PASS: [Test 1: GPA Weight Calculation] -> Result: 8.5
PASS: [Test 2: Academic Rank Evaluation] -> Result: Giỏi
PASS: [Test 3: GPA 10/4 Scale Conversion] -> Result: 4
PASS: [Test 4: Excel Export Row Count] -> Result: 1
PASS: [Test 5: PDF Report Card Success Status] -> Result: true
=====================================================
[TEST SUMMARY] Total: 5 | Passed: 5 | Failed: 0
=====================================================
```

---

## CHƯƠNG III. NGƯỜI THỰC HIỆN & LIÊN HỆ

- **Trưởng nhóm / PM**: Võ Duy Bình (DYBInh2k5)
- **Thành viên phụ trách**: QA Lead & Modules Developer (Thành viên 5)
- **Hệ thống**: HTQLLH (School Management System - SMS)
