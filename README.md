# Dự án 2: Hệ thống Quản lý Trường học (School Management System - SMS)

Kho lưu trữ tài liệu phân tích, kiến trúc hệ thống và mã nguồn dự án Hệ thống Quản lý Trường học (School Management System - SMS) thuộc môn học Phát triển dự án phần mềm (SW320DV01) - Đại học Hoa Sen (HSU).

---

## 1. Thông tin chung

- Tên đề tài: Xây dựng Hệ thống Quản lý Trường học (School Management System - SMS)
- Môn học: Phát triển dự án phần mềm
- Mã môn học: SW320DV01 (3 Tín chỉ)
- Chủ sở hữu Repository / Trưởng nhóm: Vũ Duy Bình (DYBInh2k5)

---

## 2. Phân công nhiệm vụ 5 thành viên nhóm

| STT | Thành viên & Vai trò | Phân hệ & Công việc phụ trách | Thư mục công việc trên GitHub |
| :---: | :--- | :--- | :--- |
| 1 | Vũ Duy Bình (PM / Lead BA) | Quản lý tiến độ, Tài liệu SRS, UAT Test Plan, Báo cáo Tuần | [members/member1_PM_BA/](members/member1_PM_BA/) |
| 2 | Thành viên 2 (Frontend Dev) | UI/UX Design System, Portal Layout & Dashboard UI | [members/member2_Frontend/](members/member2_Frontend/) |
| 3 | Thành viên 3 (Backend & DB Architect) | Thiết kế PostgreSQL ERD, Clean Architecture, State Store & MockData | [members/member3_Backend_DB/](members/member3_Backend_DB/) |
| 4 | Thành viên 4 (Logic & Security Dev) | JWT Auth, RBAC 4 Roles, Thuật toán tính GPA hệ 10/4, Sổ điểm điện tử | [members/member4_Logic_Security/](members/member4_Logic_Security/) |
| 5 | Thành viên 5 (Modules Dev & QA) | Module Điểm danh, Học phí, Export Excel/PDF Engine & Unit Testing | [members/member5_Modules_QA/](members/member5_Modules_QA/) |

---

## 3. Bộ công nghệ lựa chọn (Tech Stack - Trích xuất từ Tech.md)

- UI/UX: Web Application (Giao diện chuẩn UX/UI hiện đại, hỗ trợ Responsive PC, Tablet & Mobile).
- Database: PostgreSQL (Hệ CSDL quan hệ chuẩn ACID, bảo mật dữ liệu học sinh & điểm số).
- Kiến trúc: Clean Architecture / 3-Layer Architecture (Tách biệt Presentation - Domain - Infrastructure).
- Design Patterns: MVC, Repository Pattern, Dependency Injection (DI), Unit of Work.
- Xác thực & Bảo mật: JWT (JSON Web Token) phân quyền 4 Roles (Admin, Teacher, Student, Parent) & CORS.
- Xuất báo cáo: Excel (Bảng điểm lớp, danh sách học sinh) & PDF (Học bạ điện tử, Phiếu báo điểm, Biên lai).
- Logging & Testing: Centralized Audit Logging (Ghi vết lịch sử sửa điểm) & Unit Test (Kiểm thử logic tính GPA).

---

## 4. Các vai trò người dùng (Actors)

- Admin / Ban Giám Hiệu: Quản trị tài khoản, phân quyền, quản lý danh mục môn/lớp, phân công giảng dạy, chốt khóa sổ điểm.
- Giáo viên (GVCN & GVBM): Nhập/sửa điểm thành phần, điểm danh chuyên cần, đánh giá hạnh kiểm, theo dõi lớp chủ nhiệm.
- Học sinh: Tra cứu bảng điểm cá nhân, GPA, thời khóa biểu, lịch kiểm tra, chuyên cần.
- Phụ huynh: Sổ liên lạc điện tử, nhận thông báo vắng học/điểm danh, tra cứu điểm con em và học phí.

---

## 5. Cấu trúc tài liệu và thư mục (Repository Structure)

- README.md: Tổng quan dự án, thông tin nhóm và hướng dẫn.
- Tech.md: Bảng tổng hợp công nghệ và Ma trận phân công 5 thành viên.
- members/: Thư mục phân vùng công việc riêng cho từng thành viên nhóm (member1 đến member5).
- BrainStorm/Week1.md: Tài liệu phân tích SRS chi tiết (Danh sách Actors & 7 Phân hệ FC).
- syllabus.md: Khung chương trình phát triển dự án SMS theo chuyên đề kỹ thuật.
- timeline.md: Lịch trình học tập và triển khai dự án chi tiết theo từng tuần.
- resources.md: Tài nguyên tham khảo, tài liệu quy chế và công cụ hỗ trợ phát triển.

---

## 6. Liên kết Repository

- GitHub Repository: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
- Branch chính: main
- License: MIT License
