# Dự án 2: Hệ thống Quản lý Trường học (School Management System - SMS)

Kho lưu trữ tài liệu phân tích, kiến trúc hệ thống và mã nguồn dự án Hệ thống Quản lý Trường học (School Management System - SMS) thuộc môn học Phát triển dự án phần mềm (SW320DV01) - Đại học Hoa Sen (HSU).

---

## 1. Thông tin chung

- Tên đề tài: Xây dựng Hệ thống Quản lý Trường học (School Management System - SMS)
- Môn học: Phát triển dự án phần mềm
- Mã môn học: SW320DV01 (3 Tín chỉ)
- Chủ sở hữu Repository / Trưởng nhóm: Võ Duy Bình (DYBInh2k5)

---

## 2. Phân công nhiệm vụ 5 thành viên nhóm

| STT | Thành viên & Vai trò | Phân hệ & Công việc phụ trách | Thư mục công việc trên GitHub |
| :---: | :--- | :--- | :--- |
| 1 | Võ Duy Bình (PM / Lead BA) | Quản lý tiến độ, Tài liệu SRS, UAT Test Plan, Báo cáo Tuần | [members/member1_PM_BA/](members/member1_PM_BA/) |
| 2 | Thành viên 2 (Frontend Dev) | UI/UX Design System, Portal Layout & Dashboard UI | [members/member2_Frontend/](members/member2_Frontend/) |
| 3 | Thành viên 3 (Backend & DB Architect) | Thiết kế PostgreSQL ERD, Clean Architecture, State Store & MockData | [members/member3_Backend_DB/](members/member3_Backend_DB/) |
| 4 | Thành viên 4 (Logic & Security Dev) | JWT Auth, RBAC 5 Roles, Thuật toán tính GPA hệ 10/4, Sổ điểm điện tử | [members/member4_Logic_Security/](members/member4_Logic_Security/) |
| 5 | Thành viên 5 (Modules Dev & QA) | Module Điểm danh, Học phí, Export Excel/PDF Engine & Unit Testing | [members/member5_Modules_QA/](members/member5_Modules_QA/) |

---

## 3. Bộ công nghệ lựa chọn (Tech Stack Core)

- UI/UX: Web Application (Giao diện chuẩn UX/UI hiện đại, hỗ trợ Responsive PC, Tablet & Mobile).
- Database: PostgreSQL (Hệ CSDL quan hệ chuẩn ACID, bảo mật dữ liệu học sinh & điểm số).
- Kiến trúc: Clean Architecture / 3-Layer Architecture (Tách biệt Presentation - Domain - Service - Infrastructure).
- Design Patterns: MVC, Repository Pattern, Dependency Injection (DI), Unit of Work.
- Xác thực & Bảo mật: JWT (JSON Web Token) phân quyền 5 Roles (Admin, GVCN, GVBM, Student, Parent) & CORS.
- Xuất báo cáo: Excel (Bảng điểm lớp, danh sách học sinh) & PDF (Học bạ điện tử, Phiếu báo điểm, Biên lai).
- Logging & Testing: Centralized Audit Logging (Ghi vết lịch sử sửa điểm) & Unit Test (Kiểm thử logic tính GPA).

---

## 4. Các vai trò người dùng (Actors)

- Admin / Ban Giám Hiệu: Quản trị tài khoản, phân quyền, quản lý danh mục môn/lớp, phân công giảng dạy, chốt khóa sổ điểm.
- Giáo viên Chủ nhiệm (GVCN): Quản lý lớp chủ nhiệm, điểm danh chuyên cần hàng ngày, đánh giá hạnh kiểm, tiếp nhận đơn nghỉ học từ phụ huynh.
- Giáo viên Bộ môn (GVBM): Nhập/chỉnh sửa điểm thành phần, điểm danh theo tiết học được phân công, tổng kết TBM.
- Học sinh: Tra cứu bảng điểm cá nhân, GPA hệ 10/4, thời khóa biểu, lịch kiểm tra, chuyên cần.
- Phụ huynh: Sổ liên lạc điện tử, nhận thông báo vắng học/điểm danh, nộp đơn xin nghỉ học, tra cứu điểm con em và học phí.

---

## 5. Cấu trúc tài liệu và thư mục (Repository Structure)

- README.md: Tổng quan dự án, thông tin nhóm và hướng dẫn.
- [USE_CASES.md](USE_CASES.md): Tài liệu đặc tả chi tiết 43 Use Cases, 5 sơ đồ Mermaid phân rã & 4 Sequence Diagrams cho 5 vai trò.
- [database/ERD.md](database/ERD.md): Sơ đồ thực thể quan hệ ERD Mermaid & Từ điển dữ liệu Data Dictionary 8 thực thể.
- [timeline.md](timeline.md): Tiến độ & Lộ trình thực hiện dự án theo tuần (Hoàn thành Tuần 1 - Tuần 9).
- BrainStorm/: Hồ sơ phân tích báo cáo chi tiết theo từng tuần:
  - [Week1 TL SRS .md](BrainStorm/Week1%20TL%20SRS%20.md): Tài liệu Phân tích Yêu cầu Phần mềm (SRS), Ma trận RBAC, Rules & NFRs. (Đã hoàn thành)
  - [Week2 UXUI .md](BrainStorm/Week2%20UXUI%20.md): Chuyên đề Nghiên cứu UI/UX (WinForms vs Web vs Mobile, React/Angular/Vue, Figma, Wireframes). (Đã hoàn thành)
  - [Week3 DB .md](BrainStorm/Week3%20DB%20.md): Chuyên đề Cơ sở Dữ liệu (PostgreSQL, ERD & DDL Scripts, Node.js Express Connection). (Đã hoàn thành)
  - [Week4 KT .md](BrainStorm/Week4%20KT%20.md): Chuyên đề Kiến trúc Phần mềm (Clean Architecture, 3-Layer, REST API Services, DTOs & Exceptions). (Đã hoàn thành)
  - [Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md): Chuyên đề Mẫu Thiết kế (MVC/MVVM, Repository Pattern, Unit of Work, Dependency Injection). (Đã hoàn thành)
  - [Week6 Export .md](BrainStorm/Week6%20Export%20.md): Chuyên đề Xuất Báo cáo (Excel SheetJS, PDF Print Engine). (Đã hoàn thành)
  - [Week7 Authentication Authorization .md](BrainStorm/Week7%20Authentication%20Authorization%20.md): Chuyên đề Xác thực & Bảo mật (JWT, CORS, RBAC 5 Roles). (Đã hoàn thành)
  - [Week8 Logging .md](BrainStorm/Week8%20Logging%20.md): Chuyên đề Nhật ký Hệ thống (Centralized Audit Logging - Vết sửa điểm). (Đã hoàn thành)
  - [Week9 Testing .md](BrainStorm/Week9%20Testing%20.md): Chuyên đề Kiểm thử Phần mềm (Unit Testing & Automated QA Suite). (Đã hoàn thành)
- members/: Thư mục phân vùng công việc riêng cho từng thành viên nhóm (member1 đến member5).

---

## 6. Liên kết Repository

- GitHub Repository: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
- Branch chính: main
