# CẨM NANG ÁNH XẠ HỆ THỐNG JIRA CLOUD & QUY TRÌNH KANBAN (JIRA KANBAN MAPPING)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
TỔNG QUAN TIẾN ĐỘ: 15 TUẦN HỌC KỲ 2631 (14/09/2026 - 27/12/2026)
THỜI ĐIỂM ĐÁNH GIÁ: 27/10/2026 (TUẦN 7 / 15 TUẦN)
PROJECT KEY: KAN | BOARD ID: 2 (KAN board)
ĐƯỜNG DẪN BẢNG KANBAN: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
DANH SÁCH CÔNG VIỆC RANKED: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/list?jql=project%20%3D%20KAN%20ORDER%20BY%20cf%5B10019%5D%20ASC
================================================================================
```

---

## 1. ĐỊNH BIÊN VAI TRÒ 5 THÀNH VIÊN TRÊN HỆ THỐNG

| Mã Jira | Họ và Tên | Vai Trò Chính | Phân Hệ Phụ Trách & Trách Nhiệm | Thư Mục Mã Nguồn |
| :---: | :--- | :--- | :--- | :--- |
| [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Quản lý tiến độ toàn diện, điều phối Jira Kanban, biên soạn đặc tả SRS IEEE 830, chuẩn hóa quy chế Thông tư 22/2021/TT-BGDĐT và RTM Matrix. | `members/member1_PM_BA/` |
| [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend (Frontend Developer)** | Thiết kế 8 Wireframes UI/UX, lập trình Web SPA Responsive trên React 18, Vite, TailwindCSS (Dashboard BGH, Cổng GVCN, Lưới sổ điểm, Cổng Phụ huynh & Học sinh). | `members/member2_Frontend/` |
| [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend (Backend Developer)** | Thiết kế kiến trúc Clean Architecture 4 tầng trên Node.js/Express, chuẩn hóa CSDL quan hệ PostgreSQL 3NF, lập trình DDL schema.sql và cẩm nang POSTGRESQL_GUIDE.md. | `members/member3_Backend_DB/` |
| [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security (Core Logic & Security)** | Xây dựng thuật toán tính ĐTBmhk chia 9 và xếp loại Thông tư 22, thiết lập xác thực JWT, Middleware RBAC 5 Roles, Unit of Work bảo toàn ACID và Audit Trail. | `members/member4_Logic_Security/` |
| [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester (QA/QC Testing Lead)** | Xây dựng kịch bản kiểm thử UAT Plan cho 5 nhóm tác nhân, phát triển bộ kiểm thử tự động QA Unit Testing Suite kiểm chứng logic điểm số, kiểm thử tải và bảo mật. | `members/member5_Modules_QA/` |

---

## 2. DANH MỤC 11 EPICS THEO TRÌNH TỰ TIẾN TRÌNH MÔN HỌC

| STT | Mã Epic | Tên Epic Nghiệp Vụ | Giai Đoạn & Tuần Áp Dụng | Mô Tả Trọng Tâm |
| :---: | :---: | :--- | :---: | :--- |
| 1 | [KAN-38](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-38) | **EPIC-00: Khảo Sát, Phân Tích & Thiết Kế Kiến Trúc** | Tuần 1 - Tuần 4 | Đặc tả SRS IEEE 830, Thông tư 22, Sơ đồ UML và CSDL PostgreSQL 3NF |
| 2 | [KAN-64](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-64) | **EPIC-10: Thiết Kế Giao Diện Trực Quan (Wireframes)** | Tuần 2 | Bộ 8 Wireframes phân hệ cho 5 nhóm tác nhân và Design System |
| 3 | [KAN-8](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-8) | **EPIC-02: Quản lý Hồ sơ, Lớp học & Đào tạo** | Tuần 1 & Tuần 3 | Danh mục Khối/Lớp, Hồ sơ Học sinh, Phân công Giảng dạy |
| 4 | [KAN-9](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-9) | **EPIC-03: Điểm danh & Chuyên cần Học đường** | Tuần 4 | Điểm danh đầu giờ (GVCN), điểm danh theo tiết (GVBM), cảnh báo vắng 20% |
| 5 | [KAN-10](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-10) | **EPIC-04: Sổ điểm Điện tử Thông tư 22** | Tuần 5 | Lưới nhập điểm Spreadsheet, tự động tính ĐTBmhk chia 9, khóa sổ LOCKED |
| 6 | [KAN-11](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-11) | **EPIC-05: Giao dịch Điểm ACID & Mẫu Thiết kế** | Tuần 5 | Repository Pattern, Unit of Work bảo toàn giao dịch cho 45 học sinh |
| 7 | [KAN-13](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-13) | **EPIC-07: Thời khóa biểu & Chống Xung đột Lịch** | Tuần 5 | Thời khóa biểu tự động kiểm tra chống trùng giáo viên và phòng học |
| 8 | [KAN-14](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-14) | **EPIC-08: Xuất Báo cáo & Cổng Giao tiếp Phụ huynh** | Tuần 6 | Export Engine Excel .xlsx, In ấn PDF học bạ và cổng phụ huynh |
| 9 | [KAN-6](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-6) | **EPIC-01: Xác thực & Quản trị Phân quyền (Auth & RBAC)** | Tuần 7 (Hiện tại 27/10) | Đăng nhập JWT, 1-Click Demo Login, Middleware RBAC 5 Roles |
| 10 | [KAN-12](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-12) | **EPIC-06: Nhật ký Kiểm toán Học vụ (Audit Trail)** | Tuần 8 | Ghi vết sửa điểm, lịch sử truy cập và nhật ký kiểm toán trung tâm |
| 11 | [KAN-63](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-63) | **EPIC-09: Tiến Độ 15 Tuần Nghiên Cứu Môn Học** | Tuần 1 - Tuần 15 | Tập hợp 15 mốc báo cáo nghiên cứu học thuật hàng tuần (WEEK-01 đến WEEK-15) |

---

## 3. DANH SÁCH CHI TIẾT CÁC CÔNG VIỆC THEO TIẾN TRÌNH THỜI GIAN

### Tuần 1 (14/09/2026 - 20/09/2026): Khởi Động & Yêu Cầu SRS IEEE 830
- [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33): MEMBER-01 - Võ Duy Bình (Trạng thái: Idea)
- [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34): MEMBER-02 - Võ Hoàng Sơn (Trạng thái: Idea)
- [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35): MEMBER-03 - Huỳnh Trung Tính (Trạng thái: Idea)
- [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36): MEMBER-04 - Trần Quang Vinh (Trạng thái: Idea)
- [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37): MEMBER-05 - Nguyễn Minh Quốc Bảo (Trạng thái: Idea)
- [KAN-39](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-39): SRS-01 - Khảo sát & Biên soạn SRS theo chuẩn IEEE 830 (Trạng thái: Done)
- [KAN-40](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-40): SRS-02 - Đặc tả chi tiết 43 Use Cases cho 5 nhóm tác nhân (Trạng thái: Done)
- [KAN-41](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-41): SRS-03 - Xây dựng Ma trận Truy xuất Yêu cầu RTM Matrix (Trạng thái: Done)
- [KAN-42](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-42): SRS-04 - Chuẩn hóa khung pháp lý Thông tư 22/2021/TT-BGDĐT (Trạng thái: Done)
- [KAN-17](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-17): PBI-03 - Quản lý danh mục Lớp học & Hồ sơ Học sinh (Trạng thái: Done)
- [KAN-18](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-18): PBI-04 - Phân công giảng dạy môn học theo từng lớp (Trạng thái: Done)
- [KAN-65](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-65): WEEK-01 - Báo cáo Tuần 1: Yêu cầu SRS & Pháp lý Thông tư 22 (Trạng thái: Done)

### Tuần 2 (21/09/2026 - 27/09/2026): Chuyên Đề 1 - UI/UX & Wireframes
- [KAN-55](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-55): UI-01 - Nghiên cứu Web SPA Responsive vs Desktop WinForms (Trạng thái: Done)
- [KAN-56](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-56): UI-02 - Xây dựng Design System & TailwindCSS (Trạng thái: Done)
- [KAN-80](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-80): WF-01 - Wireframe Đăng nhập 5 Roles & 1-Click Demo Login (Trạng thái: Done)
- [KAN-81](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-81): WF-02 - Wireframe Dashboard Ban Giám Hiệu (Trạng thái: Done)
- [KAN-82](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-82): WF-03 - Wireframe Giám sát Chuyên cần Toàn trường (Trạng thái: Done)
- [KAN-83](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-83): WF-04 - Wireframe Lưới Sổ Điểm Spreadsheet (GVBM) (Trạng thái: Done)
- [KAN-84](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-84): WF-05 - Wireframe Điểm Danh Chuyên Cần Theo Tiết (Trạng thái: Done)
- [KAN-85](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-85): WF-06 - Wireframe Cổng Giáo Viên Chủ Nhiệm (Trạng thái: Done)
- [KAN-86](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-86): WF-07 - Wireframe Sổ Liên Lạc Điện Tử & Cổng Phụ Huynh (Trạng thái: Done)
- [KAN-87](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-87): WF-08 - Wireframe Bảng Điểm Cá Nhân Học Sinh (Trạng thái: Done)
- [KAN-66](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-66): WEEK-02 - Báo cáo Tuần 2: Nghiên cứu UI/UX & Wireframes (Trạng thái: Done)

### Tuần 3 (28/09/2026 - 04/10/2026): Chuyên Đề 2 - CSDL PostgreSQL & ERD 3NF
- [KAN-51](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-51): ERD-01 - Thiết kế Sơ đồ Thực thể Quan hệ CSDL Chuẩn Hóa 3NF (Trạng thái: Done)
- [KAN-52](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-52): ERD-02 - Xây dựng Từ điển Dữ liệu (Data Dictionary) 14 bảng quan hệ (Trạng thái: Done)
- [KAN-53](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-53): ERD-03 - Lập trình tập lệnh DDL PostgreSQL schema.sql (Trạng thái: Done)
- [KAN-54](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-54): ERD-04 - Cẩm nang Quản trị CSDL POSTGRESQL_GUIDE.md (Trạng thái: Done)
- [KAN-16](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-16): PBI-18 - Cấu hình Singleton PostgreSQL Connection Pool (Trạng thái: Done)
- [KAN-67](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-67): WEEK-03 - Báo cáo Tuần 3: CSDL PostgreSQL, ERD 3NF & Schema (Trạng thái: Done)

### Tuần 4 (05/10/2026 - 11/10/2026): Chuyên Đề 3 - Clean Architecture & UML Diagrams
- [KAN-43](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-43): UML-01 - Sơ đồ Use Case Tổng thể & 5 Sơ đồ Phân rã chức năng (Trạng thái: Done)
- [KAN-44](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-44): UML-02 - Sơ đồ Lớp thực thể Clean Architecture (Class Diagram) (Trạng thái: Done)
- [KAN-45](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-45): UML-03 - Sơ đồ Tuần tự SD-01: Xác thực JWT & Phân quyền RBAC (Trạng thái: Done)
- [KAN-46](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-46): UML-04 - Sơ đồ Tuần tự SD-02: Nhập bảng điểm hàng loạt & ACID (Trạng thái: Done)
- [KAN-47](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-47): UML-05 - Sơ đồ Tuần tự SD-03: Điểm danh & Duyệt đơn nghỉ học (Trạng thái: Done)
- [KAN-48](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-48): UML-06 - Sơ đồ Tuần tự SD-04: Thu học phí & Xuất biên lai PDF (Trạng thái: Done)
- [KAN-49](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-49): UML-07 - Sơ đồ Hoạt động (Activity Diagram) tính điểm và khóa sổ (Trạng thái: Done)
- [KAN-50](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-50): UML-08 - Sơ đồ Triển khai Hạ tầng Docker (Deployment Diagram) (Trạng thái: Done)
- [KAN-19](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-19): PBI-05 - Điểm danh chuyên cần đầu giờ (GVCN) (Trạng thái: Done)
- [KAN-25](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-25): PBI-06 - Điểm danh chi tiết theo từng tiết học (GVBM) (Trạng thái: Done)
- [KAN-26](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-26): PBI-07 - Tự động cảnh báo học sinh vắng quá 20% số tiết (Trạng thái: Done)
- [KAN-68](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-68): WEEK-04 - Báo cáo Tuần 4: Clean Architecture & UML Diagrams (Trạng thái: Done)

### Tuần 5 (12/10/2026 - 18/10/2026): Chuyên Đề 4 - Design Patterns, Unit of Work & Sổ Điểm TT22
- [KAN-23](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-23): PBI-11 - Repository Pattern trừu tượng hóa câu lệnh SQL (Trạng thái: Done)
- [KAN-24](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-24): PBI-12 - Unit of Work bảo vệ giao dịch ACID 45 học sinh (Trạng thái: Done)
- [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20): PBI-08 - Nhập điểm thành phần trên giao diện Spreadsheet (Trạng thái: Done)
- [KAN-21](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-21): PBI-09 - Tự động tính ĐTBmhk chia 9 và xếp loại Thông tư 22 (Trạng thái: Done)
- [KAN-22](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-22): PBI-10 - Cơ chế chốt khóa sổ điểm học kỳ LOCKED (Trạng thái: Done)
- [KAN-28](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-28): PBI-14 - Thời khóa biểu tự động kiểm tra chống xung đột lịch dạy (Trạng thái: Done)
- [KAN-69](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-69): WEEK-05 - Báo cáo Tuần 5: Mẫu Thiết Kế Patterns & ACID (Trạng thái: Done)

### Tuần 6 (19/10/2026 - 25/10/2026): Chuyên Đề 5 - Export Engine & Cổng Phụ Huynh
- [KAN-30](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-30): PBI-15 - Xuất bảng điểm lớp ra file Excel .xlsx (SheetJS) (Trạng thái: Done)
- [KAN-31](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-31): PBI-16 - Xuất và in ấn phiếu báo điểm / học bạ PDF (jsPDF) (Trạng thái: Done)
- [KAN-29](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-29): PBI-17 - Cổng phụ huynh tra cứu điểm tức thời & nộp đơn nghỉ học (Trạng thái: Done)
- [KAN-70](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-70): WEEK-06 - Báo cáo Tuần 6: Export Engine (Excel & PDF) (Trạng thái: Done)

### Tuần 7 (26/10/2026 - 01/11/2026): Chuyên Đề 6 - Xác Thực JWT & RBAC (THỜI ĐIỂM HIỆN TẠI: 27/10/2026)
- [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7): PBI-01 - Đăng nhập hệ thống & tính năng 1-Click Demo Login 5 Roles (Trạng thái: Done)
- [KAN-15](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-15): PBI-02 - Middleware phân quyền RBAC 5 cấp bậc bảo vệ Endpoints (Trạng thái: Done)
- [KAN-71](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-71): WEEK-07 - Báo cáo Tuần 7: Xác thực JWT & Phân quyền RBAC (**Trạng thái: In Progress**)

### Các Tuần Tiếp Theo (Từ Tuần 8 Đến Tuần 15 - Sau Ngày 27/10/2026)
- **Tuần 8 (02/11 - 08/11/2026)**:
  - [KAN-27](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-27): PBI-13 - Ghi nhật ký kiểm toán Audit Trail lưu vết sửa điểm (Trạng thái: To Do)
  - [KAN-72](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-72): WEEK-08 - Báo cáo Tuần 8: Centralized Audit Logging (Trạng thái: To Do)
- **Tuần 9 (09/11 - 15/11/2026)**:
  - [KAN-32](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-32): PBI-19 - Bộ kiểm thử tự động QA Unit Testing Suite (Trạng thái: To Do)
  - [KAN-73](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-73): WEEK-09 - Báo cáo Tuần 9: Automated QA Testing (Trạng thái: To Do)
- **Tuần 10 (16/11 - 22/11/2026)**:
  - [KAN-74](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-74): WEEK-10 - Tích hợp hệ thống & phòng thủ OWASP Top 10 (Trạng thái: To Do)
- **Tuần 11 (23/11 - 29/11/2026)**:
  - [KAN-75](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-75): WEEK-11 - Tối ưu hóa hiệu năng, Indexes & Redis Caching (Trạng thái: To Do)
- **Tuần 12 (30/11 - 06/12/2026)**:
  - [KAN-76](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-76): WEEK-12 - Đóng gói Docker Compose & CI/CD GitHub Actions (Trạng thái: To Do)
- **Tuần 13 (07/12 - 13/12/2026)**:
  - [KAN-61](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-61): QA-01 - Kịch bản kiểm thử chấp nhận người dùng UAT Plan (Trạng thái: Done)
  - [KAN-77](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-77): WEEK-13 - Nghiệm thu kỹ thuật & UAT 43 Use Cases (Trạng thái: To Do)
- **Tuần 14 (14/12 - 20/12/2026)**:
  - [KAN-62](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-62): QA-02 - Cẩm nang triển khai hệ thống Deployment Guide (Trạng thái: Done)
  - [KAN-78](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-78): WEEK-14 - Đóng gói Release v1.0 & Cẩm nang Hướng dẫn Sử dụng (Trạng thái: To Do)
- **Tuần 15 (21/12 - 27/12/2026)**:
  - [KAN-79](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-79): WEEK-15 - Tổng kết dự án, Thuyết trình bảo vệ & Đánh giá KPI (Trạng thái: To Do)
