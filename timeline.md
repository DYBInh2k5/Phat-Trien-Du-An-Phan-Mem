# Tiến Độ & Lộ Trình Thực Hiện Dự Án HTQLLH (Timeline & Roadmap)

Dự án: **Hệ thống Quản lý Lớp học & Học vụ (HTQLLH / School Management System)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & Quản lý: **Võ Duy Bình (PM / Lead BA)**

---

## Bảng Theo Dõi Tiến Độ Hàng Tuần (Weekly Milestones & Status)

| Tuần | Tên Chuyên Đề / Hạng Mục Công Việc | Tài Liệu Báo Cáo (`BrainStorm/` & `CHUYENDE/`) | Trạng Thái | Thành Viên Phụ Trách chính |
| :---: | :--- | :--- | :---: | :--- |
| **Tuần 1** | Phân tích Yêu cầu Phần mềm (SRS), RBAC 5 Roles, Business Rules & Legal Framework | [Week1 TL SRS .md](BrainStorm/Week1%20TL%20SRS%20.md) | **HOÀN THÀNH** | Võ Duy Bình (PM/Lead BA) |
| **Tuần 2** | Nghiên cứu UI/UX, Design System, Glassmorphism, TailwindCSS & Component Library (Chuyên đề 1) | [Week2 UXUI .md](BrainStorm/Week2%20UXUI%20.md)<br>[Chuyên Đề 1 UXUI.docx](CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx) | **HOÀN THÀNH** | Võ Duy Bình & Trần Quang Vinh |
| **Tuần 3** | Nghiên cứu Cơ sở Dữ liệu PostgreSQL, Thiết kế ERD, DDL Schema & REST API (Chuyên đề 2) | [Week3 DB .md](BrainStorm/Week3%20DB%20.md)<br>[Chuyên đề 2 Storages.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx) | **HOÀN THÀNH** | Nguyễn Minh Quốc Bảo & Huỳnh Trung Tính |
| **Tuần 4** | Kiến trúc Phần mềm (Node.js Express + PostgreSQL Clean Architecture, Chuyên đề 3) | [Week4 KT .md](BrainStorm/Week4%20KT%20.md)<br>[Chuyên đề 3 Kiến trúc.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx) | **HOÀN THÀNH (Tuần 4)** | Trần Quang Vinh & Huỳnh Trung Tính |
| **Tuần 5** | Design Patterns (MVC/MVVM, Repository Pattern, Unit of Work, DI & DIP, Chuyên đề 4) | [Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md)<br>[Chuyên đề 4 Pattern.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx) | **HOÀN THÀNH (Tuần 5)** | Cả nhóm / Võ Hoàng Sơn |
| **Tuần 6** | Export Engine Báo Cáo (Xuất file Excel `.xlsx`, In ấn Học bạ / Biên lai PDF, Chuyên đề 5) | [Week6 Export .md](BrainStorm/Week6%20Export%20.md)<br>[Chuyên đề 5 Export.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx) | **HOÀN THÀNH (Tuần 6)** | Huỳnh Trung Tính |
| **Tuần 7** | Xác thực & Bảo mật (JWT, Session Token, Node Auth, RBAC 5 Roles, CORS, Chuyên đề 6) | [Week7 Authentication Authorization .md](BrainStorm/Week7%20Authentication%20Authorization%20.md)<br>[Chuyên đề 6 Authentication Authorization.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx) | **HOÀN THÀNH (Tuần 7)** | Võ Hoàng Sơn |
| **Tuần 8** | Ghi nhật ký hệ thống (Centralized Audit Logging - Vết lịch sử sửa điểm, Chuyên đề 7) | [Week8 Logging .md](BrainStorm/Week8%20Logging%20.md)<br>[Chuyên đề 7 Logging.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%207%20Logging.docx) | **HOÀN THÀNH (Tuần 8)** | Trần Quang Vinh |
| **Tuần 9** | Kiểm thử Phần mềm (Unit Testing, Automated QA Test Suite, Chuyên đề 8) | [Week9 Testing .md](BrainStorm/Week9%20Testing%20.md)<br>[Chuyên đề 8 Testing.docx](CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx) | **HOÀN THÀNH (Tuần 9)** | Huỳnh Trung Tính & Cả nhóm |

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


