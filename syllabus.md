# Syllabus: Nội dung học & Phát triển Dự án 2 - Hệ thống Quản lý Trường học (SMS)

Khung chương trình chi tiết các chuyên đề kỹ thuật áp dụng trong quá trình phát triển Hệ thống Quản lý Trường học (School Management System - SMS) thuộc môn học Phát triển dự án phần mềm (SW320DV01).

---

## 1. Phân tích Yêu cầu Nghiệp vụ Trường học (SRS & Business Requirements)
- Thu thập & Phân tích Yêu cầu: Xác định bài toán quản lý trường học thực tế (đào tạo, học sinh, giảng dạy, sổ điểm, tài chính).
- Phân tích 4 Actors: Admin / Ban Giám Hiệu, Giáo viên (GVCN & GVBM), Học sinh, Phụ huynh.
- Phân tích 7 Phân hệ FC (Functional Components):
  - FC-01: Quản lý Tài khoản & Phân quyền RBAC.
  - FC-02: Quản lý Hồ sơ Học sinh & Lớp học.
  - FC-03: Quản lý Giảng dạy & Thời khóa biểu.
  - FC-04: Sổ điểm Điện tử & Đánh giá Học lực/Hạnh kiểm.
  - FC-05: Điểm danh & Chuyên cần.
  - FC-06: Quản lý Học phí & Thu chi.
  - FC-07: Sổ liên lạc Điện tử & Xuất Báo cáo.

---

## 2. Thiết kế Kiến trúc Hệ thống & Cơ sở Dữ liệu (System & Database Design)
- Kiến trúc phần mềm: Áp dụng Clean Architecture / 3-Layer Architecture (Presentation Layer - Domain/Business Layer - Infrastructure/Data Access Layer).
- Thiết kế CSDL PostgreSQL:
  - Xây dựng sơ đồ ERD cho các bảng: Users, Roles, Students, Classes, Subjects, Schedules, Grades, Attendance, Tuition.
  - Thiết kế ràng buộc toàn vẹn khóa chính/khóa ngoại, chỉ mục (Index) nâng cao hiệu năng truy vấn điểm số.
- Thiết kế RESTful API & Bảo mật: Chuẩn hóa các RESTful endpoints, xác thực JWT (JSON Web Token) & cấu hình CORS.

---

## 3. Lập trình Logic Nghiệp vụ & Design Patterns (Core Business Logic)
- Mô hình Design Patterns:
  - MVC (Model-View-Controller) cho cấu trúc Web Application.
  - Repository Pattern & Unit of Work: Trừu tượng hóa truy vấn CSDL PostgreSQL và xử lý giao dịch (Transaction) khi nhập điểm/thu học phí.
  - Dependency Injection (DI): Giảm độ phụ thuộc cứng giữa các Service.
- Thuật toán Nghiệp vụ Đánh giá:
  - Tự động tính Điểm trung bình môn (TBM) theo hệ số tiết.
  - Tính điểm tích lũy GPA (Hệ 10.0 & Hệ 4.0).
  - Thuật toán tự động xếp loại Học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu, Kém) và Hạnh kiểm (Tốt, Khá, Trung bình, Yếu).

---

## 4. Thiết kế Giao diện Web UI/UX (School Portal Frontend)
- Giao diện Web Responsive: Thiết kế tương thích đa thiết bị (Desktop, Tablet, Mobile).
- Dashboard Đa Vai Trò (Multi-Role Dashboard):
  - Admin Portal: Quản lý tổng thể, biểu đồ thống kê sĩ số, phân công giảng dạy.
  - Teacher Portal: Sổ điểm điện tử tương tác cao, lưới điểm danh học sinh.
  - Student & Parent Portal: Tra cứu kết quả học tập cá nhân, lịch học, thông báo chuyên cần và học phí.
- Tối ưu trải nghiệm (UX): Hiệu ứng chuyển cảnh mượt mà, thông báo Toast, Modal nhập liệu tiện lợi.

---

## 5. Xuất Báo cáo & Kiểm thử Phần mềm (Export & Testing)
- Phân hệ Xuất báo cáo (Export):
  - Xuất danh sách học sinh và bảng điểm lớp ra file Excel.
  - Xuất phiếu báo điểm cá nhân, Học bạ điện tử và biên lai thu tiền ra file PDF.
- Kiểm thử (Testing):
  - Viết Unit Test cho các hàm tính GPA, xếp loại học lực, phân quyền JWT.
  - Kiểm thử tích hợp (Integration Test) luồng nhập điểm và chốt khóa sổ điểm.

---

## 6. Vận hành & Quản lý Nhật ký Hệ thống (Logging & Maintenance)
- Centralized Audit Logging: Ghi nhật ký lịch sử chỉnh sửa điểm số (người sửa, thời gian, điểm cũ, điểm mới) để đảm bảo tính minh bạch.
- Đóng gói & Đánh giá: Review mã nguồn, tối ưu hiệu năng và đóng gói ứng dụng.
