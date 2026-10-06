# Tiến Độ & Lộ Trình Thực Hiện Dự Án HTQLLH (Timeline & Roadmap)

Dự án: **Hệ thống Quản lý Lớp học & Học vụ (HTQLLH / School Management System)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & Quản lý: **Võ Duy Bình (PM / Lead BA)**

---

## Bảng Theo Dõi Tiến Độ Hàng Tuần (Weekly Milestones & Status)

| Tuần | Tên Chuyên Đề / Hạng Mục Công Việc | Tài Liệu Báo Cáo (`BrainStorm/`) | Trạng Thái | Thành Viên Phụ Trách chính |
| :---: | :--- | :--- | :---: | :--- |
| **Tuần 1** | Phân tích Yêu cầu Phần mềm (SRS), RBAC 5 Roles, Business Rules & Legal Framework | [Week1 TL SRS .md](BrainStorm/Week1%20TL%20SRS%20.md) | **HOÀN THÀNH** | Võ Duy Bình (PM/BA) |
| **Tuần 2** | Nghiên cứu UI/UX, Design System, Glassmorphism, TailwindCSS & Component Library | [Week2 UXUI .md](BrainStorm/Week2%20UXUI%20.md) | **HOÀN THÀNH** | Thành viên 2 (Frontend) |
| **Tuần 3** | Nghiên cứu Cơ sở Dữ liệu PostgreSQL, Thiết kế ERD, DDL Schema & REST API Integration | [Week3 DB .md](BrainStorm/Week3%20DB%20.md) | **HOÀN THÀNH** | Thành viên 3 (Backend & DB) |
| **Tuần 4** | Kiến trúc Phần mềm (Node.js Express + PostgreSQL Clean Architecture, DTOs & Services) | [Week4 KT .md](BrainStorm/Week4%20KT%20.md) | **HOÀN THÀNH (Tuần 4)** | Cả nhóm / Backend Lead |
| **Tuần 5** | Design Patterns (MVC, Repository Pattern, Unit of Work, Dependency Injection) | [Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md) | **HOÀN THÀNH (Tuần 5)** | Cả nhóm |
| **Tuần 6** | Export Engine Báo Báo (Xuất file Excel `.xlsx`, In ấn Học bạ / Biên lai PDF) | [Week6 Export .md](BrainStorm/Week6%20Export%20.md) | **HOÀN THÀNH (Tuần 6)** | Thành viên 5 (Modules/QA) |
| **Tuần 7** | Xác thực & Bảo mật (JWT, Session Token, Node Auth, RBAC 5 Roles, CORS) | [Week7 Authentication Authorization .md](BrainStorm/Week7%20Authentication%20Authorization%20.md) | **HOÀN THÀNH (Tuần 7)** | Thành viên 4 (Security) |
| **Tuần 8** | Ghi nhật ký hệ thống (Centralized Audit Logging - Vết lịch sử sửa điểm) | [Week8 Logging .md](BrainStorm/Week8%20Logging%20.md) | **HOÀN THÀNH (Tuần 8)** | Backend / Security |
| **Tuần 9** | Kiểm thử Phần mềm (Unit Testing, Automated QA Test Suite) | [Week9 Testing .md](BrainStorm/Week9%20Testing%20.md) | **HOÀN THÀNH (Tuần 9)** | QA Lead / Member 5 |

---

## Chi Tiết Kết Quả Hoàn Thành Dự Án (Tuần 1 -> Tuần 9)

1. **Tuần 1 (Phân tích Yêu cầu SRS)**: 43 Use Cases, RBAC 5 Roles, RTM Matrix & Legal Rules.
2. **Tuần 2 (Thiết kế UX/UI & Frontend SPA)**: Web Portal SPA trên React.js 18 + Vite.
3. **Tuần 3 (Cơ sở Dữ liệu PostgreSQL & REST API)**: PostgreSQL 8 Tables DDL & Schema.
4. **Tuần 4 (Sinh Mã Nguồn Backend Clean Architecture)**: Node.js Express 4-Layer Clean Architecture Backend.
5. **Tuần 5 (Design Patterns & Unit of Work)**: MVC, Repository Pattern, UnitOfWork class (`src/utils/UnitOfWork.js`).
6. **Tuần 6 (Export Engine)**: Excel `.xlsx` Export (`SheetJS`) & PDF Report Card/Receipt Engine (`jsPDF`) tại `members/member5_Modules_QA/exportEngine.js`.
7. **Tuần 7 (Xác thực & Bảo mật)**: JWT Authentication & RBAC 5 Roles Middleware tại `members/member4_Logic_Security/`.
8. **Tuần 8 (Centralized Audit Logging)**: Vết nhật ký sửa đổi điểm số tại `members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js`.
9. **Tuần 9 (Kiểm thử Tự động QA Suite)**: Automated Unit Testing suite tại `members/member5_Modules_QA/tests/unitTestingSuite.test.js`.


