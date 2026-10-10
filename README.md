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
| 1 | **Võ Duy Bình** (PM / Lead BA) | Quản lý tiến độ, Tài liệu SRS, Phân hệ Web UI/UX, Báo cáo Tuần | [members/member1_PM_BA/](members/member1_PM_BA/) |
| 2 | **Nguyễn Minh Quốc Bảo** (Frontend & System Dev) | Nghiên cứu PostgreSQL, Event-Driven & Microservices, UI Portal | [members/member2_Frontend/](members/member2_Frontend/) |
| 3 | **Trần Quang Vinh** (Backend & DB Architect) | Nghiên cứu Node.js Clean Architecture, Express REST API, Unit of Work | [members/member3_Backend_DB/](members/member3_Backend_DB/) |
| 4 | **Võ Hoàng Sơn** (Logic & Security Dev) | Nghiên cứu WinForms Desktop, DIP & DI, Xác thực JWT & Phân quyền RBAC | [members/member4_Logic_Security/](members/member4_Logic_Security/) |
| 5 | **Huỳnh Trung Tính** (Modules Dev & QA) | Nghiên cứu Clean Architecture chuyên sâu, PostgreSQL Guide, QA Unit Test | [members/member5_Modules_QA/](members/member5_Modules_QA/) |

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
  - [Week10.md](BrainStorm/Week10.md): Tích hợp Hệ thống, Kiểm thử Bảo mật & Phòng thủ Lỗ hổng OWASP. (Đã hoàn thành)
  - [Week11.md](BrainStorm/Week11.md): Tối ưu hóa Hiệu năng, Indexing CSDL PostgreSQL & Caching Redis. (Đã hoàn thành)
  - [Week12.md](BrainStorm/Week12.md): Đóng gói Docker, Docker Compose & Tự động hóa CI/CD GitHub Actions. (Đã hoàn thành)
  - [Week13.md](BrainStorm/Week13.md): Báo cáo Thẩm định Kỹ thuật & Nghiệm thu Người dùng UAT Toàn diện (43 Use Cases). (Đã hoàn thành)
  - [Week14.md](BrainStorm/Week14.md): Đóng gói Bản phát hành Release v1.0 & Cẩm nang Hướng dẫn Sử dụng. (Đã hoàn thành)
  - [Week15.md](BrainStorm/Week15.md): Tổng kết Toàn diện Dự án, Kịch bản Thuyết trình Đồ án & Đánh giá KPI 5 Thành viên. (Đã hoàn thành)
- docs/: Thư mục tài liệu kỹ thuật & quy trình:
  - [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md): Hướng dẫn cài đặt nhanh bằng Docker Compose & tài khoản mẫu 5 Roles.
  - [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md): Đặc tả chi tiết các RESTful API Endpoints cho toàn hệ thống.
  - [docs/Requirements_Traceability_Matrix.md](docs/Requirements_Traceability_Matrix.md): Ma trận truy xuất yêu cầu SRS - Code - UAT.
  - [docs/UAT_Testing_Plan.md](docs/UAT_Testing_Plan.md): Kế hoạch và kịch bản kiểm thử chấp nhận người dùng UAT.
  - [docs/project2_specs.md](docs/project2_specs.md): Đặc tả yêu cầu kỹ thuật đồ án.
- CHUYENDE/: Thư mục báo cáo chuyên đề chính thức định dạng Microsoft Word (.docx):
  - [Chuyên Đề 1 UXUI.docx](CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx): Nghiên cứu UI/UX và công nghệ thiết kế giao diện Web.
  - [Chuyên đề 2 Storages.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx): Khảo sát và phân tích cơ sở dữ liệu quan hệ và NoSQL (PostgreSQL, MySQL, MongoDB).
  - [Chuyên đề 3 Kiến trúc.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx): Khảo sát và phân tích các kiến trúc phần mềm (Clean Architecture, N-Tier, Microservices).
  - [Chuyên đề 4 Pattern.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx): Khảo sát các mẫu thiết kế (MVC, MVVM, Repository, Unit of Work, DIP & DI).
  - [Chuyên đề 5 Export.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx): Nghiên cứu và phát triển phân hệ xuất báo cáo & định dạng dữ liệu (Excel, PDF, CSV).
  - [Chuyên đề 6 Authentication Authorization.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx): Nghiên cứu xác thực, phân quyền và bảo mật Web (JWT, CORS, CSRF, RBAC).
  - [Chuyên đề 7 Logging.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%207%20Logging.docx): Nghiên cứu và xây dựng hệ thống nhật ký tập trung (Centralized Audit Logging).
  - [Chuyên đề 8 Testing.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx): Nghiên cứu và triển khai chiến lược kiểm thử phần mềm & QA (Unit, Integration, Security, UAT).
- members/: Thư mục phân vùng công việc riêng cho từng thành viên nhóm (member1 đến member5).

---

## 6. Liên kết Repository

- GitHub Repository: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
- Branch chính: main
