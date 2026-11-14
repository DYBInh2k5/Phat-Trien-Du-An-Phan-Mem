# Dự án 2: Hệ thống Quản lý Trường học (School Management System - SMS)
## Đề tài: Hệ Thống Quản Lý Lớp Học & Học Vụ THPT (HTQLLH / EduManage Pro)
### Môn học: Phát triển Dự án Phần mềm (SW320DV01) — Trường Đại học Hoa Sen (HSU)

Kho lưu trữ tài liệu phân tích, kiến trúc hệ thống, báo cáo đồ án, bộ slide thuyết trình và mã nguồn phần mềm hoàn chỉnh cho dự án Hệ thống Quản lý Trường học (School Management System - SMS) đạt chuẩn quy chế Thông tư 22/2021/TT-BGDĐT.

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÃ MÔN HỌC: SW320DV01 (3 TÍN CHỈ) — HỌC KỲ 2631
CHỦ NHIỆM ĐỀ TÀI / TRƯỞNG NHÓM: VÕ DUY BÌNH (DYBInh2k5)
KHO LƯU TRỮ GITHUB: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
KHO LƯU TRỮ BITBUCKET: https://bitbucket.org/codyisme27205/pt_da_pm
CƠ CHẾ ĐỒNG BỘ: DUAL-REMOTE PUSH (1 LỆNH PUSH CẬP NHẬT CẢ GITHUB & BITBUCKET)
BẢNG JIRA KANBAN BOARD: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
KHÔNG GIAN DỰ ÁN CLICKUP: https://app.clickup.com/1100320000025585/v/s/1100320000109903
BẢN SLIDE TRỰC TUYẾN CANVA: https://www.canva.com/d/75iOEEpReWqgOuN
THỜI ĐIỂM TIẾN ĐỘ HIỆN TẠI: 12/11/2026 (TUẦN 8-9 / 15 TUẦN HỌC PHẦN - QA TESTING 100% PASS)
================================================================================
```

---

## 1. Thông Tin Chung

- **Tên đề tài**: Xây dựng Hệ thống Quản lý Lớp học & Học vụ THPT (EduManage Pro / HTQLLH)
- **Cơ sở đào tạo**: Khoa Công nghệ Thông tin — Trường Đại học Hoa Sen (HSU)
- **Môn học**: Phát triển dự án phần mềm
- **Mã học phần**: SW320DV01 (3 Tín chỉ)
- **Chủ sở hữu Repository / Trưởng nhóm**: Võ Duy Bình (GitHub: [DYBInh2k5](https://github.com/DYBInh2k5) | Bitbucket: `codyisme27205`)
- **Kho lưu trữ chính (Dual Remotes)**:
  - **GitHub**: [https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem)
  - **Bitbucket**: [https://bitbucket.org/codyisme27205/pt_da_pm](https://bitbucket.org/codyisme27205/pt_da_pm)
- **Mô hình quản trị dự án**: Agile / Scrum kết hợp Jira Kanban Board & ClickUp Workspace
- **Nền tảng Quản trị & Trình chiếu Trực tuyến**:
  - **Cẩm nang Lập trình & Sửa mã nguồn (Developer Handbook)**: [docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md)
  - **Jira Cloud (Kanban Board 2)**: [https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2](https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2)
  - **ClickUp Workspace (Group 2_PTDAPM)**: [https://app.clickup.com/1100320000025585/v/s/1100320000109903](https://app.clickup.com/1100320000025585/v/s/1100320000109903)
  - **Slide Báo Cáo Đồ Án (Canva)**: [https://www.canva.com/d/75iOEEpReWqgOuN](https://www.canva.com/d/75iOEEpReWqgOuN)

---

## 2. Phân Công Nhiệm Vụ 5 Thành Viên Nhóm

| STT | Họ và Tên | Vai Trò Đảm Nhiệm | Mảng Phân Hệ & Công Việc Cụ Thể | Hồ Sơ Cá Nhân & Thẻ Jira | Tỷ Lệ Đóng Góp |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Võ Duy Bình** | **Project Manager & Lead BA** (Trưởng nhóm) | Quản lý tiến độ, Hồ sơ SRS IEEE 830, Ma trận RTM, Quy chế Thông tư 22, Điều phối Jira Kanban | [members/member1_PM_BA/README.md](members/member1_PM_BA/README.md)<br>Jira: [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | 20% |
| 2 | **Võ Hoàng Sơn** | **Dev Frontend** (Frontend Developer) | Thiết kế 8 Wireframes UI/UX, lập trình Web SPA Responsive React 18, Vite, Tailwind CSS, 5 Portals vai trò | [members/member2_Frontend/README.md](members/member2_Frontend/README.md)<br>Jira: [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | 20% |
| 3 | **Huỳnh Trung Tính** | **Dev Backend** (Backend Developer & DBA) | Kiến trúc Clean Architecture 4 tầng, RESTful API Node.js/Express, Thiết kế CSDL PostgreSQL 3NF, Connection Pool | [members/member3_Backend_DB/README.md](members/member3_Backend_DB/README.md)<br>Jira: [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | 20% |
| 4 | **Trần Quang Vinh** | **Logic Security** (Core Logic & Security) | Thuật toán tính ĐTBmhk chia 9 và xếp loại Thông tư 22, Bảo mật JWT, Middleware RBAC 5 Roles, Unit of Work ACID | [members/member4_Logic_Security/README.md](members/member4_Logic_Security/README.md)<br>Jira: [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | 20% |
| 5 | **Nguyễn Minh Quốc Bảo** | **Tester** (QA/QC Testing Lead) | Kế hoạch kiểm thử UAT 43 Use Cases, Bộ kiểm thử tự động QA Unit Testing Suite, Động cơ xuất Excel/PDF | [members/member5_Modules_QA/README.md](members/member5_Modules_QA/README.md)<br>Jira: [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | 20% |

---

## 3. Bộ Công Nghệ Lựa Chọn (Tech Stack Core)

- **Giao diện (Frontend)**: Web Single Page Application (React 18, Vite 6, Tailwind CSS 3, Lucide Icons, Responsive PC & Mobile).
- **Máy chủ (Backend)**: Node.js (LTS), Express Framework tổ chức theo mô hình Clean Architecture 4 tầng độc lập.
- **Cơ sở dữ liệu (Database)**: PostgreSQL 16 (Hệ CSDL quan hệ chuẩn ACID, chuẩn hóa 3NF, Singleton Connection Pool tối đa 20 clients).
- **Mẫu thiết kế (Design Patterns)**: Unit of Work Pattern (giao dịch ACID bảng điểm), Repository Pattern, Singleton Pattern, Export Engine Pattern.
- **Xác thực & Bảo mật**: Stateless JWT (JSON Web Token), Middleware phân quyền RBAC 5 Roles, 100% Parameterized Queries chống SQL Injection, Audit Trail Logger.
- **Xuất dữ liệu (Export Engine)**: Xuất bảng điểm Excel `.xlsx` (SheetJS) và xuất in học bạ/biên lai PDF `.pdf` chuẩn trang A4 (jsPDF).
- **Kiểm thử & QA**: Bộ kiểm thử tự động QA Unit Testing Suite (Pass 100%) và kịch bản nghiệm thu người dùng UAT cho 43 Use Cases.
- **Đóng gói & CI/CD**: Dockerfile, Docker Compose mạng cầu nối nội bộ (Bridge Network) và kịch bản CI Workflow GitHub Actions.

---

## 4. Các Vai Trò Người Dùng (Actors)

1. **Ban Giám Hiệu / Admin (ROLE_ADMIN)**: Quản trị tài khoản, cấu hình năm học/kỳ, quản lý danh mục lớp, phân công giảng dạy cho giáo viên, giám sát tỷ lệ vắng toàn trường, chốt khóa sổ điểm học kỳ (LOCKED).
2. **Giáo Viên Chủ Nhiệm (ROLE_HOMEROOM_TEACHER)**: Quản lý lớp chủ nhiệm, điểm danh đầu giờ, duyệt đơn xin nghỉ học online của phụ huynh, đánh giá hạnh kiểm học kỳ/cả năm.
3. **Giáo Viên Bộ Môn (ROLE_SUBJECT_TEACHER)**: Điểm danh theo tiết dạy, nhập/sửa điểm thành phần trên bảng tính Spreadsheet, tự động tính ĐTBmhk, yêu cầu mở lại sổ điểm khi có lý do chính đáng.
4. **Học Sinh (ROLE_STUDENT)**: Tra cứu bảng điểm cá nhân chi tiết, GPA thang điểm 10 và 4.0, xem thời khóa biểu, lịch thi và nhật ký chuyên cần.
5. **Phụ Huynh (ROLE_PARENT)**: Sổ liên lạc điện tử trực tuyến, theo dõi điểm số và chuyên cần của con, nộp đơn xin nghỉ học trực tuyến, tra cứu và thanh toán học phí điện tử.

---

## 5. Danh Mục Toàn Bộ Đường Link Tài Liệu & Mã Nguồn Hệ Thống

### 5.1 Báo Cáo Đồ Án Cuối Kỳ & Bộ Trình Chiếu Slide
- [Report_Slide/report.md](Report_Slide/report.md): Báo cáo hệ thống đồ án môn học cuối kỳ toàn diện (11 chương chi tiết, đầy đủ cơ sở lý thuyết, kiến trúc, CSDL, thuật toán Thông tư 22, hiện trạng Tuần 7 và kế hoạch hoàn thiện).
- [Report_Slide/slide.md](Report_Slide/slide.md): Bộ trình chiếu 16 Slide thuyết trình đồ án trước Hội đồng chấm thi HSU (có kèm Speaker Notes và sơ đồ Mermaid).
- [Slide Trực Tuyến Trên Canva](https://www.canva.com/d/75iOEEpReWqgOuN): Bản trình chiếu slide đồ án được thiết kế chuyên nghiệp trên Canva (16 trang slide chuẩn hóa 10 Modules, phân công 5 thành viên nhóm và hiện trạng Tuần 8-9: [https://www.canva.com/d/75iOEEpReWqgOuN](https://www.canva.com/d/75iOEEpReWqgOuN)).

### 5.2 Tài Liệu Yêu Cầu, Kiến Trúc & Kỹ Thuật (docs/)
- [docs/PRODUCT_BACKLOG.md](docs/PRODUCT_BACKLOG.md): Danh mục yêu cầu sản phẩm chuẩn Scrum (19 PBIs, 8 Epics, 90 Story Points chia đều 5 thành viên, tiêu chuẩn INVEST, DoR/DoD & Lộ trình 5 Sprints).
- [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](docs/CHI_TIET_NGHIEP_VU_HE_THONG.md): Đặc tả chi tiết Nghiệp vụ học vụ (Quy chế Thông tư 22, Điểm danh 2 cấp, Khóa sổ điểm, Kiểm toán Audit Trail, Chống xung đột TKB).
- [docs/CHI_TIET_CONG_NGHE_HE_THONG.md](docs/CHI_TIET_CONG_NGHE_HE_THONG.md): Báo cáo chi tiết toàn bộ công nghệ, thư viện, kiến trúc, bảng phân công nhiệm vụ 5 thành viên và cây phả hệ tập tin mã nguồn.
- [docs/KIEN_TRUC_CHI_TIET_HE_THONG.md](docs/KIEN_TRUC_CHI_TIET_HE_THONG.md): Đặc tả chi tiết Kiến trúc hệ thống Clean Architecture 4 tầng, C4 Container, Sequence Diagram, 4 Design Patterns, ERD 3NF và RBAC.
- [docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md](docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md): Cẩm nang kỹ thuật toàn diện giải thích tường tận RESTful API, Layout Components, Docker và mối liên kết mã nguồn.
- [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md): Đặc tả chi tiết các RESTful API Endpoints cho toàn hệ thống (Quy chuẩn URL, HTTP status codes, Request/Response payloads).
- [docs/JIRA_KANBAN_MAPPING.md](docs/JIRA_KANBAN_MAPPING.md): Cẩm nang ánh xạ toàn diện Jira Cloud & GitHub (9 Components, 6 Fix Versions, 11 Epics, 8 Chuyên Đề, 5 Docs, 91 Thẻ & Ma trận Issue Links).
- [docs/KICH_BAN_DEMO.md](docs/KICH_BAN_DEMO.md): Kịch bản thuyết trình và hướng dẫn thao tác demo trực quan đồ án (SRS -> UI/UX -> CSDL -> Kiến trúc -> Mẫu thiết kế Patterns -> Live Demo Prototype).
- [docs/Requirements_Traceability_Matrix.md](docs/Requirements_Traceability_Matrix.md): Ma trận truy xuất nguồn gốc yêu cầu (Requirements Traceability Matrix - RTM) gắn kết SRS, Mã nguồn và Test Cases.
- [docs/UML_DIAGRAMS.md](docs/UML_DIAGRAMS.md): Hồ sơ mô hình hóa UML toàn diện (5 Use Case Diagrams, Class Diagram Clean Architecture, Sequence Diagrams SD01-SD04, Activity & Deployment Diagrams).
- [docs/UAT_Testing_Plan.md](docs/UAT_Testing_Plan.md): Kế hoạch và kịch bản kiểm thử chấp nhận người dùng UAT cho 43 Use Cases.
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md): Hướng dẫn triển khai hệ thống bằng Docker Compose & danh sách tài khoản mẫu 5 Roles.
- [docs/project2_specs.md](docs/project2_specs.md): Đặc tả yêu cầu kỹ thuật đồ án môn học.

### 5.3 Hồ Sơ Phân Tích & Tiến Độ 15 Tuần (BrainStorm/)
- [timeline.md](timeline.md): Tiến độ & Lộ trình thực hiện dự án 15 tuần (Bắt đầu từ 14/09/2026, thời điểm hiện tại: 14/11/2026 - Chính thức bước vào Tuần 10: Tích hợp hệ thống & An ninh OWASP).
- [USE_CASES.md](USE_CASES.md): Tài liệu tổng hợp đặc tả chi tiết 43 Use Cases cho 5 nhóm tác nhân.
- [BrainStorm/Week1 TL SRS .md](BrainStorm/Week1%20TL%20SRS%20.md): Tuần 1 - Tài liệu Phân tích Yêu cầu Phần mềm (SRS IEEE 830), Ma trận RBAC, Rules & NFRs.
- [BrainStorm/Week2 UXUI .md](BrainStorm/Week2%20UXUI%20.md): Tuần 2 - Chuyên đề Nghiên cứu UI/UX (Design System, Tailwind CSS, 8 Wireframes phân hệ).
- [BrainStorm/Week3 DB .md](BrainStorm/Week3%20DB%20.md): Tuần 3 - Chuyên đề Cơ sở Dữ liệu (PostgreSQL 3NF, ERD, Schema DDL, Connection Pool).
- [BrainStorm/Week4 KT .md](BrainStorm/Week4%20KT%20.md): Tuần 4 - Chuyên đề Kiến trúc Phần mềm (Clean Architecture 4 tầng, RESTful API, DTOs & UML).
- [BrainStorm/Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md): Tuần 5 - Chuyên đề Mẫu Thiết kế (Repository Pattern, Unit of Work ACID bảng điểm, Dependency Injection).
- [BrainStorm/Week6 Export .md](BrainStorm/Week6%20Export%20.md): Tuần 6 - Chuyên đề Động cơ Xuất Báo cáo (Excel SheetJS, in ấn PDF jsPDF A4).
- [BrainStorm/Week7.md](BrainStorm/Week7.md) & [BrainStorm/Week7 Authentication Authorization .md](BrainStorm/Week7%20Authentication%20Authorization%20.md): Tuần 7 - Chuyên đề Xác thực & Bảo mật (JWT, RBAC 5 Roles, 1-Click Demo Login). *(Đã hoàn thành xuất sắc)*
- [BrainStorm/Week8.md](BrainStorm/Week8.md) & [BrainStorm/Week8 Logging .md](BrainStorm/Week8%20Logging%20.md): Tuần 8 - Chuyên đề Nhật ký Hệ thống (Centralized Audit Logging), Đồng bộ Dual-Remote (GitHub & Bitbucket), Tái cấu trúc Menu Nhóm & Nạp dữ liệu mẫu 100%. *(Đã hoàn thành xuất sắc)*
- [BrainStorm/Week9.md](BrainStorm/Week9.md) & [BrainStorm/Week9 Testing .md](BrainStorm/Week9%20Testing%20.md): Tuần 9 - Chuyên đề Kiểm thử Phần mềm (Automated QA Unit Test Suite 68/68 Backend & 13/13 Frontend Vitest đạt 100% PASS), Đồng bộ Jira & ClickUp, Canva Slide & Cẩm nang PostgreSQL Extension. *(Đã hoàn thành xuất sắc)*
- [BrainStorm/Week10.md](BrainStorm/Week10.md): Tuần 10 - Tích hợp Toàn Hệ Thống, Kiểm thử Bảo mật & Phòng thủ Lỗ hổng OWASP Top 10 (Security Hardening, Rate Limiting, Helmet Headers, Chống SQLi & BOLA). *(Đang triển khai - In Progress)*
- [BrainStorm/Week11.md](BrainStorm/Week11.md): Tuần 11 - Tối ưu hóa Hiệu năng, Indexing CSDL PostgreSQL & Caching Redis (Cache-Aside).
- [BrainStorm/Week12.md](BrainStorm/Week12.md): Tuần 12 - Đóng gói Docker, Docker Compose & Tự động hóa CI/CD GitHub Actions.
- [BrainStorm/Week13.md](BrainStorm/Week13.md): Tuần 13 - Báo cáo Thẩm định Kỹ thuật & Nghiệm thu Người dùng UAT Toàn diện (43 Use Cases).
- [BrainStorm/Week14.md](BrainStorm/Week14.md): Tuần 14 - Đóng gói Bản phát hành Release v1.0.0 & Cẩm nang Hướng dẫn Sử dụng.
- [BrainStorm/Week15.md](BrainStorm/Week15.md): Tuần 15 - Tổng kết Toàn diện Dự án, Kịch bản Thuyết trình Đồ án & Đánh giá KPI 5 Thành viên.

### 5.4 Báo Cáo Chuyên Đề Định Dạng Word (.docx) (CHUYENDE/)
- [CHUYENDE/Chuyên Đề 1 UXUI.docx](CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx): Chuyên đề 1 - Nghiên cứu UI/UX và công nghệ thiết kế giao diện Web.
- [CHUYENDE/Chuyên đề 2 Storages.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx): Chuyên đề 2 - Khảo sát và phân tích cơ sở dữ liệu quan hệ và NoSQL (PostgreSQL, MySQL, MongoDB).
- [CHUYENDE/Chuyên đề 3 Kiến trúc.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx): Chuyên đề 3 - Khảo sát và phân tích các kiến trúc phần mềm (Clean Architecture, N-Tier, Microservices).
- [CHUYENDE/Chuyên đề 4 Pattern.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx): Chuyên đề 4 - Khảo sát các mẫu thiết kế (Repository, Unit of Work, Singleton, Dependency Injection).
- [CHUYENDE/Chuyên đề 5 Export.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx): Chuyên đề 5 - Nghiên cứu và phát triển phân hệ xuất báo cáo & định dạng dữ liệu (Excel, PDF, CSV).
- [CHUYENDE/Chuyên đề 6 Authentication Authorization.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx): Chuyên đề 6 - Nghiên cứu xác thực, phân quyền và bảo mật Web (JWT, CORS, CSRF, RBAC).
- [CHUYENDE/Chuyên đề 7 Logging.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%207%20Logging.docx): Chuyên đề 7 - Nghiên cứu và xây dựng hệ thống nhật ký tập trung (Centralized Audit Logging).
- [CHUYENDE/Chuyên đề 8 Testing.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx): Chuyên đề 8 - Nghiên cứu và triển khai chiến lược kiểm thử phần mềm & QA (Unit, Integration, Security, UAT).

### 5.5 Cơ Sở Dữ Liệu & Mô Hình Dữ Liệu (database/)
- [database/schema.sql](database/schema.sql): Tập lệnh DDL khởi tạo toàn bộ 8 bảng CSDL PostgreSQL 3NF, ràng buộc toàn vẹn và chỉ mục.
- [database/ERD.md](database/ERD.md): Sơ đồ thực thể quan hệ ERD Mermaid & Từ điển dữ liệu Data Dictionary chi tiết 8 bảng.
- [members/member3_Backend_DB/POSTGRESQL_GUIDE.md](members/member3_Backend_DB/POSTGRESQL_GUIDE.md): Cẩm nang toàn diện quản trị, tối ưu hóa và vận hành CSDL PostgreSQL.
- [docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md](docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md): Cẩm nang hướng dẫn kết nối và sử dụng PostgreSQL Extension trên IDE, thao tác xem bảng và truy vấn dữ liệu.

### 5.6 Thư Mục Hồ Sơ Công Việc 5 Thành Viên (members/)
- [members/member1_PM_BA/README.md](members/member1_PM_BA/README.md): Hồ sơ thành viên 1 - Võ Duy Bình (Project Manager & Lead BA).
- [members/member2_Frontend/README.md](members/member2_Frontend/README.md): Hồ sơ thành viên 2 - Võ Hoàng Sơn (Dev Frontend).
- [members/member3_Backend_DB/README.md](members/member3_Backend_DB/README.md): Hồ sơ thành viên 3 - Huỳnh Trung Tính (Dev Backend & DBA).
- [members/member4_Logic_Security/README.md](members/member4_Logic_Security/README.md): Hồ sơ thành viên 4 - Trần Quang Vinh (Logic Security).
- [members/member5_Modules_QA/README.md](members/member5_Modules_QA/README.md): Hồ sơ thành viên 5 - Nguyễn Minh Quốc Bảo (Tester QA Lead).

### 5.7 Các Điểm Nút Mã Nguồn Cốt Lõi Hệ Thống (Source Code Core)
- **Khởi động Backend Express & Composition Root**: [members/member3_Backend_DB/school-management-nodejs/server.js](members/member3_Backend_DB/school-management-nodejs/server.js)
- **Cấu hình Kết nối CSDL PostgreSQL Singleton**: [members/member3_Backend_DB/school-management-nodejs/src/config/db.js](members/member3_Backend_DB/school-management-nodejs/src/config/db.js)
- **Khởi tạo dữ liệu mẫu seeder**: [members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js](members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js)
- **Mẫu thiết kế Unit of Work Pattern (ACID)**: [members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js](members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)
- **Nhật ký kiểm toán Audit Logger**: [members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js](members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js)
- **Thực thể Sổ điểm & Thuật toán Thông tư 22**: [members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js](members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js)
- **Lưu trữ Sổ điểm GradeBookRepository**: [members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js](members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js)
- **Tầng dịch vụ học sinh StudentService**: [members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js](members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js)
- **Giao diện Web SPA React Khởi động**: [members/member2_Frontend/src/App.jsx](members/member2_Frontend/src/App.jsx)
- **Bố cục giao diện chung MainLayout**: [members/member2_Frontend/src/components/layout/MainLayout.jsx](members/member2_Frontend/src/components/layout/MainLayout.jsx)
- **Giao diện Đăng nhập 1-Click Demo Login**: [members/member2_Frontend/src/pages/auth/LoginPage.jsx](members/member2_Frontend/src/pages/auth/LoginPage.jsx)
- **Lưới nhập điểm bảng tính GradebookPage**: [members/member2_Frontend/src/pages/gv/GradebookPage.jsx](members/member2_Frontend/src/pages/gv/GradebookPage.jsx)
- **Giao diện Cổng Phụ huynh ParentPortalPage**: [members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx](members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx)
- **Middleware Phân quyền RBAC**: [members/member4_Logic_Security/rbacMiddleware.js](members/member4_Logic_Security/rbacMiddleware.js)
- **Middleware Xác thực JWT**: [members/member4_Logic_Security/jwtAuthMiddleware.js](members/member4_Logic_Security/jwtAuthMiddleware.js)
- **Động cơ Xuất báo cáo Export Engine**: [members/member5_Modules_QA/exportEngine.js](members/member5_Modules_QA/exportEngine.js)
- **Bộ Kiểm thử Tự động QA Unit Testing Suite**: [members/member5_Modules_QA/tests/unitTestingSuite.test.js](members/member5_Modules_QA/tests/unitTestingSuite.test.js)

---

## 6. Liên Kết Quản Lý Dự Án, Công Cụ & Repository

- **Kho lưu trữ GitHub chính thức**: [https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem)
- **Kho lưu trữ Bitbucket song song**: [https://bitbucket.org/codyisme27205/pt_da_pm](https://bitbucket.org/codyisme27205/pt_da_pm)
- **Cơ chế Dual-Remote Push**:
  ```bash
  # Một lệnh duy nhất cập nhật đồng thời lên cả GitHub và Bitbucket:
  git push origin main
  ```
- **Branch chính**: `main`
- **Bảng Jira Cloud Kanban Board**: [https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2](https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2)
- **Dự Án Jira Cloud Project**: [https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN](https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN)
- **Không Gian Dự Án ClickUp (Space Group 2_PTDAPM)**: [https://app.clickup.com/1100320000025585/v/s/1100320000109903](https://app.clickup.com/1100320000025585/v/s/1100320000109903)
- **Thư Mục Dự Án ClickUp (Folder HTQLLH)**: [https://app.clickup.com/1100320000025585/v/f/1100320000138169](https://app.clickup.com/1100320000025585/v/f/1100320000138169)
- **Cẩm nang Ánh xạ Jira, ClickUp & GitHub**: [docs/JIRA_KANBAN_MAPPING.md](docs/JIRA_KANBAN_MAPPING.md)
- **Bản Slide Trình Chiếu Trực Tuyến Trên Canva**: [https://www.canva.com/d/75iOEEpReWqgOuN](https://www.canva.com/d/75iOEEpReWqgOuN)

---

## 7. Hướng Dẫn Vận Hành Nhanh & Danh Sách Tài Khoản Kiểm Thử

### 7.1 Cách Khởi Chạy Hệ Thống

1. **Bước 1: Khởi động Cơ sở Dữ liệu PostgreSQL (Docker)**:
   ```bash
   docker start htqllh_postgres
   # Hoặc nếu chưa tạo container:
   # docker compose up -d postgres-db
   ```
   - Cổng kết nối CSDL: `localhost:5434`
   - Tên cơ sở dữ liệu: `school_management`
   - Tài khoản: `postgres` / Mật khẩu: `postgres`

2. **Bước 2: Khởi động Backend Node.js Express (Port 8081)**:
   ```bash
   cd members/member3_Backend_DB/school-management-nodejs
   node server.js
   ```
   - Server lắng nghe tại: `http://localhost:8081`
   - Kiểm tra HealthCheck: `http://localhost:8081/api/health`

3. **Bước 3: Khởi động Frontend React Vite (Port 5173)**:
   ```bash
   cd members/member2_Frontend
   npm run dev
   ```
   - Truy cập giao diện tại: `http://localhost:5173`

### 7.2 Danh Sách Tài Khoản Demo 5 Vai Trò (Đã Nạp Sẵn 100% Dữ Liệu)

| STT | Vai Trò (Role) | Tên Đăng Nhập (Username) | Mật Khẩu (Password) | Người Đại Diện Mẫu | Ghi Chú Quyền Hạn |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Ban Giám Hiệu** (`ROLE_ADMIN`) | `admin` | `admin123` | Thầy Hiệu Trưởng | Quản trị học sinh, phân công lớp, duyệt khóa sổ, xem thống kê toàn trường |
| 2 | **Giáo Viên Chủ Nhiệm** (`ROLE_HOMEROOM_TEACHER`) | `gvcn01` | `gvcn123` | Cô Trần Thị Mai | Chủ nhiệm lớp 10A1, điểm danh đầu giờ, duyệt đơn nghỉ phép, sổ liên lạc |
| 3 | **Giáo Viên Bộ Môn** (`ROLE_SUBJECT_TEACHER`) | `gv01` | `gv123` | Thầy Nguyễn Văn An | Phụ trách môn Toán, nhập điểm thành phần TT22, điểm danh tiết dạy |
| 4 | **Học Sinh** (`ROLE_STUDENT`) | `hs001` | `hs123` | Nguyễn Thị Ánh (10A1) | Tra cứu bảng điểm cá nhân, thời khóa biểu tuần, lịch thi học kỳ |
| 5 | **Phụ Huynh** (`ROLE_PARENT`) | `ph001` | `ph123` | Phụ huynh em Ánh | Sổ liên lạc điện tử, theo dõi chuyên cần, nộp đơn nghỉ phép, tra cứu học phí |

> *Gợi ý: Người dùng có thể nhấn nút **"1-Click Demo Login"** ngay trên giao diện đăng nhập để tự động điền thông tin và đăng nhập tức thời vào vai trò mong muốn.*


