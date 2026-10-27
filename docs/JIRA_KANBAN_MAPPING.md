# CẨM NANG ÁNH XẠ TOÀN DIỆN HỆ THỐNG JIRA CLOUD & GITHUB REPOSITORY
## (ENTERPRISE JIRA KANBAN, COMPONENTS, RELEASES & TRACEABILITY MAPPING)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
TỔNG QUAN TIẾN ĐỘ: 15 TUẦN HỌC KỲ 2631 (14/09/2026 - 27/12/2026)
THỜI ĐIỂM ĐÁNH GIÁ: 27/10/2026 (TUẦN 7 / 15 TUẦN - GIAI ĐOẠN ĐÁNH GIÁ CHÍNH)
PROJECT KEY: KAN | BOARD ID: 2 (KAN board)
TỔNG SỐ HẠNG MỤC QUẢN LÝ: 91 THẺ CÔNG VIỆC TRÊN JIRA KANBAN (100% ĐÃ RANKED)
BẢNG JIRA KANBAN: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
DANH SÁCH RANKED: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/list?jql=project%20%3D%20KAN%20ORDER%20BY%20cf%5B10019%5D%20ASC
KHO LƯU TRỮ GITHUB: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
================================================================================
```

---

## 1. ĐỊNH BIÊN VAI TRÒ & TÀI KHOẢN JIRA 5 THÀNH VIÊN DỰ ÁN

| Mã Thẻ Jira | Họ và Tên | Vai Trò Đảm Nhiệm | Tài Khoản Jira Cloud | Phân Hệ Phụ Trách & Trách Nhiệm | Liên Kết Thư Mục GitHub |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | `Duy Bình` (`bron@reputyze.asia`) | Điều phối Jira Kanban, biên soạn đặc tả SRS IEEE 830, chuẩn hóa quy chế Thông tư 22/2021/TT-BGDĐT và RTM Matrix. | [GitHub: members/member1_PM_BA](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member1_PM_BA) |
| [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend (Frontend Developer)** | `Sonvohoang` | Thiết kế 8 Wireframes UI/UX, lập trình Web SPA Responsive trên React 18, Vite, TailwindCSS (Dashboard BGH, Cổng GVCN, Lưới sổ điểm, Cổng Phụ huynh & Học sinh). | [GitHub: members/member2_Frontend](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member2_Frontend) |
| [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend (Backend Developer)** | `Huỳnh Trung Tính` | Thiết kế kiến trúc Clean Architecture 4 tầng trên Node.js/Express, chuẩn hóa CSDL PostgreSQL 3NF, lập trình DDL schema.sql và cẩm nang POSTGRESQL_GUIDE.md. | [GitHub: members/member3_Backend_DB](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member3_Backend_DB) |
| [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security (Core Logic & Security)** | `tqvcontacts` | Xây dựng thuật toán tính ĐTBmhk chia 9 và xếp loại Thông tư 22, thiết lập xác thực JWT, Middleware RBAC 5 Roles, Unit of Work bảo toàn ACID và Audit Trail. | [GitHub: members/member4_Logic_Security](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member4_Logic_Security) |
| [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester (QA/QC Testing Lead)** | `Quốc Bảo (QA Lead)` | Xây dựng kịch bản kiểm thử UAT Plan cho 5 nhóm tác nhân, phát triển bộ kiểm thử tự động QA Unit Testing Suite kiểm chứng logic điểm số, kiểm thử tải và bảo mật. | [GitHub: members/member5_Modules_QA](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member5_Modules_QA) |

---

## 2. HỆ THỐNG 9 PHÂN HỆ (COMPONENTS) TRÊN JIRA CLOUD

Toàn bộ 91 thẻ công việc trên Jira đã được phân loại chính xác vào 9 phân hệ kỹ thuật:

| STT | Tên Phân Hệ (Jira Component) | ID Jira | Mô Tả Kỹ Thuật | Thành Viên Phụ Trách |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **UI/UX & Frontend** | `10000` | Giao diện Web SPA React 18, Vite, TailwindCSS, Wireframes & Dashboards | Võ Hoàng Sơn |
| 2 | **Backend & Clean Architecture** | `10001` | Kiến trúc 4 tầng Controller, Service & Repositories Node.js/Express | Huỳnh Trung Tính |
| 3 | **Database & PostgreSQL** | `10002` | Lược đồ CSDL PostgreSQL 3NF, ERD, Schema DDL & Connection Pool | Huỳnh Trung Tính |
| 4 | **Core Logic & Circular 22** | `10003` | Thuật toán tính ĐTBmhk chia 9, xếp loại Thông tư 22 & Khóa sổ điểm | Trần Quang Vinh |
| 5 | **Security & Authentication** | `10004` | Xác thực JWT, 1-Click Demo Login, Session Token & Middleware RBAC 5 Roles | Trần Quang Vinh |
| 6 | **Reporting & Export Engine** | `10005` | Động cơ xuất báo cáo Excel .xlsx (SheetJS) và in ấn PDF (jsPDF) | Nguyễn Minh Quốc Bảo |
| 7 | **Audit & Centralized Logging** | `10006` | Ghi nhật ký kiểm toán Audit Trail, lưu vết sửa điểm & truy vết hệ thống | Huỳnh Trung Tính & Trần Quang Vinh |
| 8 | **QA, Testing & Verification** | `10007` | Kịch bản UAT Plan, bộ kiểm thử tự động QA Unit Testing Suite | Nguyễn Minh Quốc Bảo |
| 9 | **Project Management & Research** | `10008` | Quản lý tiến độ 15 tuần, SRS IEEE 830, RTM Matrix & 8 Chuyên đề học thuật | Võ Duy Bình |

---

## 3. LỘ TRÌNH 6 PHIÊN BẢN PHÁT HÀNH (FIX VERSIONS / RELEASES)

Hệ thống quản lý phiên bản trên Jira Cloud phản ánh chu kỳ phát triển phần mềm (SDLC) theo 15 tuần học kỳ:

| Phiên Bản (Fix Version) | ID Jira | Giai Đoạn Áp Dụng | Trạng Thái Phát Hành | Ngày Hoàn Thành | Trọng Tâm Phát Hành |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v0.1-alpha** | `10000` | Tuần 1 - 2 | **Released** | 27/09/2026 | Khởi động dự án: Khảo sát SRS IEEE 830, RTM Matrix & Thiết kế 8 Wireframes UI/UX |
| **v0.2-alpha** | `10001` | Tuần 3 - 4 | **Released** | 11/10/2026 | Nền tảng kiến trúc: CSDL PostgreSQL 3NF, ERD 14 bảng quan hệ & Clean Architecture 4 tầng |
| **v0.5-beta** | `10002` | Tuần 5 - 6 | **Released** | 25/10/2026 | Nghiệp vụ cốt lõi: Sổ Điểm Thông tư 22, ACID Unit of Work & Động cơ Xuất báo cáo Excel/PDF |
| **v0.7-beta** | `10003` | Tuần 7 | **Unreleased (Active)** | 01/11/2026 | **Thời điểm hiện tại (27/10)**: Xác thực JWT, 1-Click Demo Login & Middleware RBAC 5 Roles |
| **v0.8-rc** | `10004` | Tuần 8 - 9 | **Unreleased** | 15/11/2026 | Kiểm toán & Kiểm thử: Centralized Audit Trail Logging & Automated QA Testing Suite |
| **v1.0.0** | `10005` | Tuần 10 - 15 | **Unreleased** | 27/12/2026 | Hoàn thiện & Bàn giao: Tối ưu hiệu năng, Docker Compose, Nghiệm thu UAT & Thuyết trình |

---

## 4. DANH MỤC 11 EPICS ÁNH XẠ GITHUB REPOSITORY

| STT | Mã Epic Jira | Tên Epic Nghiệp Vụ | Tuần Áp Dụng | Mô Tả Trọng Tâm | Tài Liệu & Mã Nguồn Trên GitHub |
| :---: | :---: | :--- | :---: | :--- | :--- |
| 1 | [KAN-38](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-38) | **EPIC-00: Khảo Sát, Phân Tích & Thiết Kế Kiến Trúc** | Tuần 1 - 4 | Đặc tả SRS IEEE 830, Thông tư 22, Sơ đồ UML và CSDL PostgreSQL 3NF | [USE_CASES.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/USE_CASES.md)<br>[UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md) |
| 2 | [KAN-64](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-64) | **EPIC-10: Thiết Kế Giao Diện Trực Quan (Wireframes)** | Tuần 2 | Bộ 8 Wireframes phân hệ cho 5 nhóm tác nhân và Design System | [member2_Frontend/](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member2_Frontend)<br>[Week2 UXUI .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week2%20UXUI%20.md) |
| 3 | [KAN-8](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-8) | **EPIC-02: Quản lý Hồ sơ, Lớp học & Đào tạo** | Tuần 1 & 3 | Danh mục Khối/Lớp, Hồ sơ Học sinh, CSDL PostgreSQL 3NF | [database/ERD.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/database/ERD.md)<br>[database/schema.sql](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/database/schema.sql) |
| 4 | [KAN-9](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-9) | **EPIC-03: Điểm danh & Chuyên cần Học đường** | Tuần 4 | Điểm danh đầu giờ (GVCN), điểm danh theo tiết (GVBM), cảnh báo vắng 20% | [CHI_TIET_NGHIEP_VU.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) |
| 5 | [KAN-10](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-10) | **EPIC-04: Sổ điểm Điện tử Thông tư 22** | Tuần 5 | Lưới nhập điểm Spreadsheet, tự động tính ĐTBmhk chia 9, khóa sổ LOCKED | [GradebookPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/gv/GradebookPage.jsx)<br>[gpaCalculationLogic.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member4_Logic_Security/gpaCalculationLogic.js) |
| 6 | [KAN-11](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-11) | **EPIC-05: Giao dịch Điểm ACID & Mẫu Thiết kế** | Tuần 5 | Repository Pattern, Unit of Work bảo toàn giao dịch cho 45 học sinh | [UnitOfWork.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)<br>[GradeBookRepository.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| 7 | [KAN-13](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-13) | **EPIC-07: Thời khóa biểu & Chống Xung đột Lịch** | Tuần 5 | Thời khóa biểu tự động kiểm tra chống trùng giáo viên và phòng học | [CHI_TIET_NGHIEP_VU.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) |
| 8 | [KAN-14](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-14) | **EPIC-08: Xuất Báo cáo & Cổng Giao tiếp Phụ huynh** | Tuần 6 | Export Engine Excel .xlsx, In ấn PDF học bạ và cổng phụ huynh | [exportEngine.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member5_Modules_QA/exportEngine.js)<br>[ParentPortalPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) |
| 9 | [KAN-6](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-6) | **EPIC-01: Xác thực & Quản trị Phân quyền (Auth & RBAC)** | Tuần 7 (Hiện tại 27/10) | Đăng nhập JWT, 1-Click Demo Login, Middleware RBAC 5 Roles | [LoginPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/auth/LoginPage.jsx)<br>[rbacMiddleware.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member4_Logic_Security/rbacMiddleware.js) |
| 10 | [KAN-12](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-12) | **EPIC-06: Nhật ký Kiểm toán Học vụ (Audit Trail)** | Tuần 8 | Ghi vết sửa điểm, lịch sử truy cập và nhật ký kiểm toán trung tâm | [AuditLogger.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js)<br>[Week8 Logging .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week8%20Logging%20.md) |
| 11 | [KAN-63](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-63) | **EPIC-09: Tiến Độ 15 Tuần Nghiên Cứu Môn Học** | Tuần 1 - 15 | Tập hợp 15 mốc báo cáo nghiên cứu học thuật hàng tuần (WEEK-01 đến WEEK-15) | [timeline.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/timeline.md)<br>[BrainStorm/](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/BrainStorm) |

---

## 5. BÁO CÁO 8 CHUYÊN ĐỀ NGHIÊN CỨU HỌC THUẬT (CHUYÊN ĐỀ .DOCX)

| Mã Thẻ Jira | Tên Báo Cáo Chuyên Đề | Tuần | Phân Hệ Component | Phiên Bản | Trạng Thái | Người Phụ Trách | Liên Kết Tệp Word Trên GitHub |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| [KAN-88](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-88) | **CD-01: Chuyên đề 1 - Giao diện UI/UX & Web SPA** | Tuần 2 | UI/UX & Frontend | `v0.1-alpha` | **Done** | Võ Hoàng Sơn | [Chuyên Đề 1 UXUI.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx) |
| [KAN-89](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-89) | **CD-02: Chuyên đề 2 - CSDL PostgreSQL 3NF & Storages** | Tuần 3 | Database & PostgreSQL | `v0.2-alpha` | **Done** | Huỳnh Trung Tính | [Chuyên đề 2 Storages.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx) |
| [KAN-90](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-90) | **CD-03: Chuyên đề 3 - Kiến trúc Phần mềm Clean Architecture** | Tuần 4 | Backend & Clean Architecture | `v0.2-alpha` | **Done** | Huỳnh Trung Tính | [Chuyên đề 3 Kiến trúc.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx) |
| [KAN-91](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-91) | **CD-04: Chuyên đề 4 - Mẫu Thiết kế Patterns & Giao dịch ACID** | Tuần 5 | Core Logic & Circular 22 | `v0.5-beta` | **Done** | Trần Quang Vinh | [Chuyên đề 4 Pattern.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx) |
| [KAN-92](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-92) | **CD-05: Chuyên đề 5 - Động cơ Xuất Báo cáo Excel & PDF** | Tuần 6 | Reporting & Export Engine | `v0.5-beta` | **Done** | Nguyễn Minh Quốc Bảo | [Chuyên đề 5 Export.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx) |
| [KAN-93](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-93) | **CD-06: Chuyên đề 6 - Xác thực JWT & Phân quyền RBAC 5 Roles** | Tuần 7 | Security & Authentication | `v0.7-beta` | **In Progress** | Trần Quang Vinh | [Chuyên đề 6 Authentication.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx) |
| [KAN-94](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-94) | **CD-07: Chuyên đề 7 - Ghi Nhật ký Kiểm toán (Audit Trail)** | Tuần 8 | Audit & Centralized Logging | `v0.8-rc` | **To Do** | Huỳnh Trung Tính | [Chuyên đề 7 Logging.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%207%20Logging.docx) |
| [KAN-95](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-95) | **CD-08: Chuyên đề 8 - Kiểm thử Tự động QA Unit Suite & UAT** | Tuần 9 | QA, Testing & Verification | `v0.8-rc` | **To Do** | Nguyễn Minh Quốc Bảo | [Chuyên đề 8 Testing.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx) |

---

## 6. HỒ SƠ ĐẶC TẢ KIẾN TRÚC & HỢP ĐỒNG KỸ THUẬT (DOCS/ .MD)

| Mã Thẻ Jira | Tên Hồ Sơ Kỹ Thuật | Phân Hệ Component | Phiên Bản | Trạng Thái | Người Phụ Trách | Liên Kết Tài Liệu Trên GitHub |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| [KAN-96](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-96) | **DOC-01: Đặc tả Hợp đồng RESTful API Specification** | Backend & Clean Architecture | `v0.2-alpha` | **Done** | Huỳnh Trung Tính | [docs/API_SPECIFICATION.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/API_SPECIFICATION.md) |
| [KAN-97](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-97) | **DOC-02: Báo cáo Toàn diện Kiến trúc, API, Layout & Docker (91KB)** | Project Management & Research | `v0.2-alpha` | **Done** | Võ Duy Bình | [docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md) |
| [KAN-98](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-98) | **DOC-03: Phân tích Chi tiết Công nghệ & Ngăn xếp Kỹ thuật (61KB)** | Project Management & Research | `v0.1-alpha` | **Done** | Võ Duy Bình | [docs/CHI_TIET_CONG_NGHE_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_CONG_NGHE_HE_THONG.md) |
| [KAN-99](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-99) | **DOC-04: Hồ sơ Đặc tả Nghiệp vụ Chi tiết & Khung Quy chế Học đường (16KB)** | Project Management & Research | `v0.1-alpha` | **Done** | Võ Duy Bình | [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) |
| [KAN-100](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-100) | **DOC-05: Kịch bản Trình diễn Phần mềm & Kiểm chứng 5 Roles (Demo Script 32KB)** | Project Management & Research | `v1.0.0` | **To Do** | Võ Duy Bình | [docs/KICH_BAN_DEMO.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/KICH_BAN_DEMO.md) |

---

## 7. DANH SÁCH CHI TIẾT 91 THẺ THEO 15 TUẦN HỌC KỲ

### Nhóm Thành Viên Dự Án (Idea Column)
- [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33): MEMBER-01 - Võ Duy Bình (PM & Lead BA) | [GitHub: members/member1_PM_BA](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member1_PM_BA)
- [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34): MEMBER-02 - Võ Hoàng Sơn (Dev Frontend) | [GitHub: members/member2_Frontend](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member2_Frontend)
- [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35): MEMBER-03 - Huỳnh Trung Tính (Dev Backend) | [GitHub: members/member3_Backend_DB](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member3_Backend_DB)
- [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36): MEMBER-04 - Trần Quang Vinh (Logic Security) | [GitHub: members/member4_Logic_Security](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member4_Logic_Security)
- [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37): MEMBER-05 - Nguyễn Minh Quốc Bảo (Tester QA Lead) | [GitHub: members/member5_Modules_QA](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member5_Modules_QA)

### Tuần 1 (14/09/2026 - 20/09/2026): Khảo Sát & Đặc Tả SRS IEEE 830 (Version v0.1-alpha - Done)
- [KAN-39](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-39): SRS-01 - Khảo sát & Biên soạn SRS theo chuẩn IEEE 830 (Done) | [GitHub: USE_CASES.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/USE_CASES.md)
- [KAN-40](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-40): SRS-02 - Đặc tả chi tiết 43 Use Cases cho 5 nhóm tác nhân (Done) | [GitHub: USE_CASES.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/USE_CASES.md)
- [KAN-41](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-41): SRS-03 - Xây dựng Ma trận Truy xuất Yêu cầu RTM Matrix (Done) | [GitHub: Requirements_Traceability_Matrix.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/Requirements_Traceability_Matrix.md)
- [KAN-42](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-42): SRS-04 - Chuẩn hóa khung pháp lý Thông tư 22/2021/TT-BGDĐT (Done) | [GitHub: CHI_TIET_NGHIEP_VU_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md)
- [KAN-98](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-98): DOC-03 - Phân tích Chi tiết Công nghệ & Ngăn xếp Kỹ thuật Hệ thống (Done) | [GitHub: docs/CHI_TIET_CONG_NGHE_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_CONG_NGHE_HE_THONG.md)
- [KAN-99](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-99): DOC-04 - Hồ sơ Đặc tả Nghiệp vụ Chi tiết & Khung Quy chế Học đường THPT (Done) | [GitHub: docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md)
- [KAN-17](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-17): PBI-03 - Quản lý danh mục Lớp học & Hồ sơ Học sinh (Done) | [GitHub: PRODUCT_BACKLOG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/PRODUCT_BACKLOG.md)
- [KAN-18](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-18): PBI-04 - Phân công giảng dạy môn học theo từng lớp (Done) | [GitHub: PRODUCT_BACKLOG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/PRODUCT_BACKLOG.md)
- [KAN-65](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-65): WEEK-01 - Báo cáo Tuần 1: Yêu cầu SRS & Pháp lý Thông tư 22 (Done) | [GitHub: Week1 TL SRS .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week1%20TL%20SRS%20.md)

### Tuần 2 (21/09/2026 - 27/09/2026): Chuyên Đề 1 - UI/UX & Wireframes (Version v0.1-alpha - Done)
- [KAN-55](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-55): UI-01 - Nghiên cứu Web SPA Responsive vs Desktop WinForms (Done) | [GitHub: Week2 UXUI .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week2%20UXUI%20.md)
- [KAN-56](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-56): UI-02 - Xây dựng Design System & TailwindCSS (Done) | [GitHub: member2_Frontend/](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member2_Frontend)
- [KAN-80](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-80): WF-01 - Wireframe Đăng nhập 5 Roles & 1-Click Demo Login (Done) | [GitHub: LoginPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/auth/LoginPage.jsx)
- [KAN-81](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-81): WF-02 - Wireframe Dashboard Ban Giám Hiệu (Done) | [GitHub: BGHDashboardPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx)
- [KAN-82](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-82): WF-03 - Wireframe Giám sát Chuyên cần Toàn trường (Done) | [GitHub: BGHAttendanceMonitorPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/bgh/BGHAttendanceMonitorPage.jsx)
- [KAN-83](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-83): WF-04 - Wireframe Lưới Sổ Điểm Spreadsheet (GVBM) (Done) | [GitHub: GradebookPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/gv/GradebookPage.jsx)
- [KAN-84](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-84): WF-05 - Wireframe Điểm Danh Chuyên Cần Theo Tiết (Done) | [GitHub: AttendancePage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/gv/AttendancePage.jsx)
- [KAN-85](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-85): WF-06 - Wireframe Cổng Giáo Viên Chủ Nhiệm (Done) | [GitHub: GVCNDashboardPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/gv/GVCNDashboardPage.jsx)
- [KAN-86](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-86): WF-07 - Wireframe Sổ Liên Lạc Điện Tử & Cổng Phụ Huynh (Done) | [GitHub: ParentPortalPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx)
- [KAN-87](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-87): WF-08 - Wireframe Bảng Điểm Cá Nhân Học Sinh (Done) | [GitHub: member2_Frontend/src/pages/](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/tree/main/members/member2_Frontend/src/pages)
- [KAN-88](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-88): CD-01 - Chuyên đề 1: Nghiên cứu Giao diện UI/UX & Responsive Web SPA (Done) | [GitHub: Chuyên Đề 1 UXUI.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx)
- [KAN-66](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-66): WEEK-02 - Báo cáo Tuần 2: Nghiên cứu UI/UX & Wireframes (Done) | [GitHub: Week2 UXUI .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week2%20UXUI%20.md)

### Tuần 3 (28/09/2026 - 04/10/2026): Chuyên Đề 2 - CSDL PostgreSQL & ERD 3NF (Version v0.2-alpha - Done)
- [KAN-51](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-51): ERD-01 - Thiết kế Sơ đồ Thực thể Quan hệ CSDL Chuẩn Hóa 3NF (Done) | [GitHub: database/ERD.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/database/ERD.md)
- [KAN-52](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-52): ERD-02 - Xây dựng Từ điển Dữ liệu (Data Dictionary) 14 bảng quan hệ (Done) | [GitHub: database/ERD.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/database/ERD.md)
- [KAN-53](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-53): ERD-03 - Lập trình tập lệnh DDL PostgreSQL schema.sql (Done) | [GitHub: database/schema.sql](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/database/schema.sql)
- [KAN-54](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-54): ERD-04 - Cẩm nang Quản trị CSDL POSTGRESQL_GUIDE.md (Done) | [GitHub: POSTGRESQL_GUIDE.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/POSTGRESQL_GUIDE.md)
- [KAN-16](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-16): PBI-18 - Cấu hình Singleton PostgreSQL Connection Pool (Done) | [GitHub: db.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)
- [KAN-89](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-89): CD-02 - Chuyên đề 2: Giải pháp Lưu trữ CSDL Quan hệ PostgreSQL Chuẩn Hóa 3NF (Done) | [GitHub: Chuyên đề 2 Storages.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx)
- [KAN-67](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-67): WEEK-03 - Báo cáo Tuần 3: CSDL PostgreSQL, ERD 3NF & Schema (Done) | [GitHub: Week3 DB .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week3%20DB%20.md)

### Tuần 4 (05/10/2026 - 11/10/2026): Chuyên Đề 3 - Clean Architecture & UML Diagrams (Version v0.2-alpha - Done)
- [KAN-43](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-43): UML-01 - Sơ đồ Use Case Tổng thể & 5 Sơ đồ Phân rã chức năng (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-44](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-44): UML-02 - Sơ đồ Lớp thực thể Clean Architecture (Class Diagram) (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-45](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-45): UML-03 - Sơ đồ Tuần tự SD-01: Xác thực JWT & Phân quyền RBAC (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-46](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-46): UML-04 - Sơ đồ Tuần tự SD-02: Nhập bảng điểm hàng loạt & ACID (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-47](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-47): UML-05 - Sơ đồ Tuần tự SD-03: Điểm danh & Duyệt đơn nghỉ học (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-48](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-48): UML-06 - Sơ đồ Tuần tự SD-04: Thu học phí & Xuất biên lai PDF (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-49](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-49): UML-07 - Sơ đồ Hoạt động (Activity Diagram) tính điểm và khóa sổ (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-50](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-50): UML-08 - Sơ đồ Triển khai Hạ tầng Docker (Deployment Diagram) (Done) | [GitHub: docs/UML_DIAGRAMS.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UML_DIAGRAMS.md)
- [KAN-19](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-19): PBI-05 - Điểm danh chuyên cần đầu giờ (GVCN) (Done) | [GitHub: docs/PRODUCT_BACKLOG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/PRODUCT_BACKLOG.md)
- [KAN-25](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-25): PBI-06 - Điểm danh chi tiết theo từng tiết học (GVBM) (Done) | [GitHub: docs/PRODUCT_BACKLOG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/PRODUCT_BACKLOG.md)
- [KAN-26](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-26): PBI-07 - Tự động cảnh báo học sinh vắng quá 20% số tiết (Done) | [GitHub: docs/PRODUCT_BACKLOG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/PRODUCT_BACKLOG.md)
- [KAN-96](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-96): DOC-01 - Đặc tả Giao diện Lập trình Ứng dụng & Hợp đồng API RESTful (Done) | [GitHub: docs/API_SPECIFICATION.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/API_SPECIFICATION.md)
- [KAN-97](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-97): DOC-02 - Báo cáo Giải thích Toàn diện Kiến trúc, API, Layout & Triển khai Docker (Done) | [GitHub: docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md)
- [KAN-90](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-90): CD-03 - Chuyên đề 3: Kiến trúc Phần mềm Clean Architecture & Thiết kế Hệ thống 4 Tầng (Done) | [GitHub: Chuyên đề 3 Kiến trúc.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx)
- [KAN-68](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-68): WEEK-04 - Báo cáo Tuần 4: Clean Architecture & UML Diagrams (Done) | [GitHub: Week4 KT .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week4%20KT%20.md)

### Tuần 5 (12/10/2026 - 18/10/2026): Chuyên Đề 4 - Patterns, ACID & Sổ Điểm TT22 (Version v0.5-beta - Done)
- [KAN-23](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-23): PBI-11 - Repository Pattern trừu tượng hóa câu lệnh SQL (Done) | [GitHub: GradeBookRepository.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js)
- [KAN-24](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-24): PBI-12 - Unit of Work bảo vệ giao dịch ACID 45 học sinh (Done) | [GitHub: UnitOfWork.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)
- [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20): PBI-08 - Nhập điểm thành phần trên giao diện Spreadsheet (Done) | [GitHub: GradebookPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/gv/GradebookPage.jsx)
- [KAN-21](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-21): PBI-09 - Tự động tính ĐTBmhk chia 9 và xếp loại Thông tư 22 (Done) | [GitHub: gpaCalculationLogic.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member4_Logic_Security/gpaCalculationLogic.js)
- [KAN-22](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-22): PBI-10 - Cơ chế chốt khóa sổ điểm học kỳ LOCKED (Done) | [GitHub: GradeBookService.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js)
- [KAN-28](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-28): PBI-14 - Thời khóa biểu tự động kiểm tra chống xung đột lịch dạy (Done) | [GitHub: CHI_TIET_NGHIEP_VU_HE_THONG.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md)
- [KAN-91](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-91): CD-04 - Chuyên đề 4: Mẫu Thiết kế Phần mềm (Design Patterns) & Giao dịch ACID (Done) | [GitHub: Chuyên đề 4 Pattern.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx)
- [KAN-69](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-69): WEEK-05 - Báo cáo Tuần 5: Mẫu Thiết Kế Patterns & ACID (Done) | [GitHub: Week5 Pattern .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week5%20Pattern%20.md)

### Tuần 6 (19/10/2026 - 25/10/2026): Chuyên Đề 5 - Export Engine & Cổng Phụ Huynh (Version v0.5-beta - Done)
- [KAN-30](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-30): PBI-15 - Xuất bảng điểm lớp ra file Excel .xlsx (SheetJS) (Done) | [GitHub: exportEngine.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member5_Modules_QA/exportEngine.js)
- [KAN-31](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-31): PBI-16 - Xuất và in ấn phiếu báo điểm / học bạ PDF (jsPDF) (Done) | [GitHub: exportEngine.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member5_Modules_QA/exportEngine.js)
- [KAN-29](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-29): PBI-17 - Cổng phụ huynh tra cứu điểm tức thời & nộp đơn nghỉ học (Done) | [GitHub: ParentPortalPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx)
- [KAN-92](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-92): CD-05 - Chuyên đề 5: Động cơ Xuất Báo cáo Đa định dạng (Excel & PDF) (Done) | [GitHub: Chuyên đề 5 Export.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx)
- [KAN-70](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-70): WEEK-06 - Báo cáo Tuần 6: Export Engine (Excel & PDF) (Done) | [GitHub: Week6 Export .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week6%20Export%20.md)

### Tuần 7 (26/10/2026 - 01/11/2026): Chuyên Đề 6 - Xác Thực JWT & RBAC (Version v0.7-beta - THỜI ĐIỂM HIỆN TẠI: 27/10/2026)
- [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7): PBI-01 - Đăng nhập hệ thống & tính năng 1-Click Demo Login 5 Roles (Done) | [GitHub: LoginPage.jsx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member2_Frontend/src/pages/auth/LoginPage.jsx)
- [KAN-15](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-15): PBI-02 - Middleware phân quyền RBAC 5 cấp bậc bảo vệ Endpoints (Done) | [GitHub: rbacMiddleware.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member4_Logic_Security/rbacMiddleware.js)
- [KAN-93](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-93): CD-06 - Chuyên đề 6: Xác thực Bảo mật JWT, Session Token & Phân quyền RBAC (**In Progress**) | [GitHub: Chuyên đề 6 Authentication.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx)
- [KAN-71](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-71): WEEK-07 - Báo cáo Tuần 7: Xác thực JWT & Phân quyền RBAC (**In Progress**) | [GitHub: BrainStorm/Week7.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week7.md)

### Các Tuần Tiếp Theo (Từ Tuần 8 Đến Tuần 15 - Sau Ngày 27/10/2026)
- **Tuần 8 (02/11 - 08/11/2026 - Version v0.8-rc)**:
  - [KAN-27](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-27): PBI-13 - Ghi nhật ký kiểm toán Audit Trail lưu vết sửa điểm (To Do) | [GitHub: AuditLogger.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js)
  - [KAN-94](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-94): CD-07 - Chuyên đề 7: Ghi Nhật ký Kiểm toán Trung tâm (Audit Trail) (To Do) | [GitHub: Chuyên đề 7 Logging.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%207%20Logging.docx)
  - [KAN-72](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-72): WEEK-08 - Báo cáo Tuần 8: Centralized Audit Logging (To Do) | [GitHub: Week8 Logging .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week8%20Logging%20.md)
- **Tuần 9 (09/11 - 15/11/2026 - Version v0.8-rc)**:
  - [KAN-32](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-32): PBI-19 - Bộ kiểm thử tự động QA Unit Testing Suite (To Do) | [GitHub: unitTestingSuite.test.js](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/members/member5_Modules_QA/tests/unitTestingSuite.test.js)
  - [KAN-95](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-95): CD-08 - Chuyên đề 8: Kiểm thử Tự động & Đảm bảo Chất lượng Phần mềm (To Do) | [GitHub: Chuyên đề 8 Testing.docx](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx)
  - [KAN-73](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-73): WEEK-09 - Báo cáo Tuần 9: Automated QA Testing (To Do) | [GitHub: Week9 Testing .md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week9%20Testing%20.md)
- **Tuần 10 (16/11 - 22/11/2026 - Version v1.0.0)**:
  - [KAN-74](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-74): WEEK-10 - Tích hợp hệ thống & phòng thủ OWASP Top 10 (To Do) | [GitHub: Week10.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week10.md)
- **Tuần 11 (23/11 - 29/11/2026 - Version v1.0.0)**:
  - [KAN-75](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-75): WEEK-11 - Tối ưu hóa hiệu năng, Indexes & Redis Caching (To Do) | [GitHub: Week11.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week11.md)
- **Tuần 12 (30/11 - 06/12/2026 - Version v1.0.0)**:
  - [KAN-76](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-76): WEEK-12 - Đóng gói Docker Compose & CI/CD GitHub Actions (To Do) | [GitHub: Week12.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week12.md)
- **Tuần 13 (07/12 - 13/12/2026 - Version v1.0.0)**:
  - [KAN-61](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-61): QA-01 - Kịch bản kiểm thử chấp nhận người dùng UAT Plan (Done) | [GitHub: UAT_Testing_Plan.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/UAT_Testing_Plan.md)
  - [KAN-77](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-77): WEEK-13 - Nghiệm thu kỹ thuật & UAT 43 Use Cases (To Do) | [GitHub: Week13.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week13.md)
- **Tuần 14 (14/12 - 20/12/2026 - Version v1.0.0)**:
  - [KAN-62](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-62): QA-02 - Cẩm nang triển khai hệ thống Deployment Guide (Done) | [GitHub: DEPLOYMENT_GUIDE.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/DEPLOYMENT_GUIDE.md)
  - [KAN-78](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-78): WEEK-14 - Đóng gói Release v1.0 & Cẩm nang Hướng dẫn Sử dụng (To Do) | [GitHub: Week14.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week14.md)
- **Tuần 15 (21/12 - 27/12/2026 - Version v1.0.0)**:
  - [KAN-100](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-100): DOC-05 - Kịch bản Trình diễn Phần mềm & Kiểm chứng 5 Nhóm Vai trò (To Do) | [GitHub: docs/KICH_BAN_DEMO.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/docs/KICH_BAN_DEMO.md)
  - [KAN-79](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-79): WEEK-15 - Tổng kết dự án, Thuyết trình bảo vệ & Đánh giá KPI (To Do) | [GitHub: Week15.md](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem/blob/main/BrainStorm/Week15.md)

---

## 8. MA TRẬN LIÊN KẾT PHỤ THUỘC & TRUY XUẤT (ISSUE LINKS: BLOCKS & RELATES)

Hệ thống Jira đã được thiết lập các liên kết Issue Links trực tiếp nhằm đảm bảo tính truy xuất và quản lý rủi ro kỹ thuật:

| Loại Liên Kết (Link Type) | Thẻ Nguồn (Inward Issue) | Quan Hệ Phụ Thuộc | Thẻ Đích (Outward Issue) | Ý Nghĩa Kỹ Thuật |
| :---: | :---: | :---: | :---: | :--- |
| **Blocks** | [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7) | **Blocks** | [KAN-15](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-15) | Cơ chế xác thực JWT phải hoàn thiện trước khi phân quyền RBAC có hiệu lực |
| **Blocks** | [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20) | **Blocks** | [KAN-21](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-21) | Nhập đủ các cột điểm thành phần là điều kiện tiên quyết để tính ĐTBmhk |
| **Blocks** | [KAN-21](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-21) | **Blocks** | [KAN-22](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-22) | Phải tính xong điểm trung bình và xếp loại mới được phép khóa sổ LOCKED |
| **Blocks** | [KAN-51](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-51) | **Blocks** | [KAN-53](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-53) | Thiết kế sơ đồ quan hệ ERD 3NF chuẩn hóa trước khi sinh mã DDL SQL |
| **Relates** | [KAN-23](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-23) | **Relates to** | [KAN-24](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-24) | Repository Pattern phối hợp chặt chẽ cùng Unit of Work bảo toàn ACID |
| **Relates** | [KAN-53](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-53) | **Relates to** | [KAN-16](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-16) | Lược đồ schema SQL kết nối trực tiếp qua Singleton PostgreSQL Pool |
| **Relates** | [KAN-80](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-80) | **Relates to** | [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7) | Wireframe WF-01 ánh xạ trực tiếp đến tính năng Đăng nhập & 1-Click Login |
| **Relates** | [KAN-83](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-83) | **Relates to** | [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20) | Wireframe WF-04 định hình giao diện bảng nhập điểm Spreadsheet PBI-08 |
| **Relates** | [KAN-86](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-86) | **Relates to** | [KAN-29](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-29) | Wireframe WF-07 định hình cấu trúc cổng thông tin phụ huynh PBI-17 |
| **Relates** | [KAN-30](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-30) | **Relates to** | [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20) | Xuất báo cáo Excel trích xuất dữ liệu trực tiếp từ sổ điểm lớp học |
| **Relates** | [KAN-31](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-31) | **Relates to** | [KAN-20](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-20) | In ấn phiếu báo điểm PDF trích xuất từ bảng điểm cá nhân học sinh |
| **Relates** | [KAN-39](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-39) | **Relates to** | [KAN-41](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-41) | Đặc tả SRS IEEE 830 được đối chiếu qua Ma trận Truy xuất RTM |
| **Relates** | [KAN-42](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-42) | **Relates to** | [KAN-21](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-21) | Quy chế Thông tư 22 định hướng công thức tính ĐTBmhk chia 9 |

```
================================================================================
KẾT LUẬN: HỆ THỐNG QUẢN LÝ JIRA KANBAN VÀ KHO GITHUB ĐÃ ĐỒNG BỘ 100% TUYỆT ĐỐI.
MỌI HẠNG MỤC TỪ VAI TRÒ THÀNH VIÊN, 9 PHÂN HỆ COMPONENTS, 6 PHIÊN BẢN RELEASES,
11 EPICS, 8 CHUYÊN ĐỀ WORD, 5 TÀI LIỆU KIẾN TRÚC VÀ 91 THẺ CÔNG VIỆC ĐÃ ĐƯỢC
THIẾT LẬP CHUẨN MỰC, LIÊN KẾT WEB LINK VÀ XẾP THỨ TỰ THEO ĐÚNG TIẾN ĐỘ THỰC TẾ.
================================================================================
```
