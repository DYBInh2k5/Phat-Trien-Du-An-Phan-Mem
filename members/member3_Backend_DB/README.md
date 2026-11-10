# THÔNG TIN THÀNH VIÊN 3: BACKEND ARCHITECT & DATABASE ADMINISTRATOR (DBA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: HUỲNH TRUNG TÍNH
VAI TRÒ: BACKEND DEVELOPER (DEV BACKEND & DBA)
TÀI KHOẢN JIRA CLOUD: Huỳnh Trung Tính
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member3_Backend_DB/README.md
NGÀY CẬP NHẬT: 27/10/2026 (TUẦN 7 / 15 TUẦN HỌC KỲ 2631)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:  
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Liên Kết Mã Nguồn / CSDL |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-01** | **KAN-04** | **API Quản Trị Người Dùng & Phân Quyền**: UserController, UserService, đổi mật khẩu | `UC-ADM-02` | 3 SP | **DONE** | [UserController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js) |
| **EPIC-02** | **KAN-05** | **CSDL & API Danh Mục Lớp Học**: Bảng `school_classes`, ClassController, ClassService | `UC-ADM-03` | 2 SP | **DONE** | [ClassController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js) |
| **EPIC-02** | **KAN-06** | **CSDL & API Quản Lý Hồ Sơ Học Sinh**: Bảng `students`, `student_profiles`, phân trang | `UC-ADM-03`<br>`UC-GVCN-03` | 2 SP | **DONE** | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) |
| **EPIC-03** | **KAN-08** | **API & CSDL Thời Khóa Biểu Tuần**: Bảng `schedules`, ScheduleController | `UC-GVCN-02`<br>`UC-GVBM-02` | 2 SP | **DONE** | [ScheduleController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js) |
| **EPIC-04** | **KAN-11** | **API Ghi Nhận Điểm Danh Lớp Đầu Giờ**: Bảng `attendance_records`, lưu trạng thái | `UC-GVCN-04` | 2 SP | **DONE** | [AttendanceController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js) |
| **EPIC-04** | **KAN-14** | **API Phê Duyệt Đơn Nghỉ Học & Đồng Bộ Điểm Danh**: Cập nhật trạng thái `APPROVED` | `UC-GVCN-05` | 1 SP | **DONE** | [AttendanceController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js) |
| **EPIC-05** | **KAN-18** | **Cơ Chế Khóa Sổ Điểm 2 Cấp CSDL**: Bảng `grade_book_closures`, kiểm tra `LOCKED` | `UC-GVCN-09`<br>`UC-ADM-08` | 1 SP | **DONE** | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) |
| **EPIC-06** | **KAN-20** | **Quản Lý Giao Dịch Dữ Liệu ACID (Unit of Work)**: Rollback toàn bộ nếu 1 dòng lỗi | Toàn hệ thống | 3 SP | **DONE** | [UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js) |
| **EPIC-06** | **KAN-21** | **Repository Pattern Trừu Tượng Hóa Truy Vấn**: 8 Repository đóng gói SQL sạch | Tầng Data Access | 2 SP | **DONE** | [Thư mục repositories/](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/) |
| **EPIC-06** | **KAN-22** | **Singleton Connection Pool CSDL PostgreSQL**: Cấu hình `pg.Pool` tối đa 20 client | Tầng Kết nối DB | 1 SP | **DONE** | [db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js) |
| **EPIC-08** | **KAN-26** | **API Tiếp Nhận Đơn Nghỉ Học Từ Phụ Huynh**: Bảng `leave_requests`, xử lý tải đơn | `UC-PAR-02` | 1 SP | **DONE** | [ParentPortalController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ParentPortalController.js) |
| **EPIC-08** | **KAN-27** | **API Kênh Trao Đổi Tin Nhắn Phụ Huynh - GVCN**: Bảng `parent_messages` | `UC-PAR-03` | 1 SP | **DONE** | [ParentPortalController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ParentPortalController.js) |
| **EPIC-09** | **KAN-28** | **API Quản Lý Danh Mục Học Phí & Gạch Nợ**: Bảng `fee_invoices`, chuyển trạng thái | `UC-ADM-07`<br>`UC-PAR-04` | 1 SP | **DONE** | [TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js) |
| **TỔNG** | — | **7 Module Lớn (Module 1, 2, 3, 4, 5, 6, 8, 9)** | **Backend API & Database 3NF** | **22 SP** | **DONE** | **Tỷ lệ đóng góp: ~20% toàn hệ thống** |

### Kiến Trúc CSDL & Hạ Tầng Backend Đồng Thời Phụ Trách:
- **Thiết kế CSDL Chuẩn 3NF (15 bảng, Foreign Keys, Indexes)**: [schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql)
- **Từ điển dữ liệu Data Dictionary & Sơ đồ ERD**: [ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md)
- **Đặc tả hợp đồng RESTful API Specification**: [API_SPECIFICATION.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/API_SPECIFICATION.md)
- **Triển khai kiến trúc 3 tầng Clean Architecture (Controller - Service - Repository)**: [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js)

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Thiết kế & chuẩn hóa CSDL PostgreSQL 3NF**:
  + Thiết lập tập lệnh [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql) gồm 8 bảng quan hệ chuẩn hóa cao cấp, ràng buộc toàn vẹn khóa ngoại `ON DELETE RESTRICT` và chỉ mục tìm kiếm tối ưu.
  + Biên soạn [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md) và cẩm nang [POSTGRESQL_GUIDE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/POSTGRESQL_GUIDE.md).
  + Hoàn thành Báo cáo Chuyên đề 2 tại [CHUYENDE/Chuyên đề 2 Storages.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx) (`KAN-89`).
- **Xây dựng khung kiến trúc máy chủ Clean Architecture 4 Tầng**:
  + Tách biệt triệt để 4 tầng: Thực thể (Entities), Dịch vụ nghiệp vụ (Services), Bộ điều phối thích ứng (Controllers & Repositories) và Nền tảng Express/PostgreSQL (Frameworks).
  + Lập tài liệu hợp đồng giao tiếp [docs/API_SPECIFICATION.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/API_SPECIFICATION.md) (`KAN-96`).
  + Hoàn thành Báo cáo Chuyên đề 3 tại [CHUYENDE/Chuyên đề 3 Kiến trúc.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx) (`KAN-90`).
- **Cài đặt các mẫu thiết kế phần mềm cốt lõi (GoF Patterns)**:
  + **Repository Pattern**: Đóng gói câu truy vấn SQL an toàn tham số `$1, $2` tại [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js).
  + **Unit of Work Pattern**: Bảo toàn giao dịch ACID cho cả lớp 45 học sinh, cam kết `COMMIT` toàn bộ hoặc `ROLLBACK` an toàn tại [UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js).
  + **Singleton Connection Pool**: Tái sử dụng TCP connection tại [db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - Thời Điểm Hiện Tại: 27/10/2026)
- **Bảo vệ toàn bộ các Router API bằng Middleware xác thực JWT và phân quyền RBAC**:
  + Gắn [rbacMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/rbacMiddleware.js) vào các route `/api/grades`, `/api/attendance`, `/api/classes`.
  + Đảm bảo máy chủ phản hồi chính xác mã `401 Unauthorized` khi thiếu Token và `403 Forbidden` khi sai vai trò.

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 8 -> Tuần 15)
- **Tuần 8**: Hoàn thiện bảng CSDL `audit_logs` và kích hoạt hàm ghi vết trong `AuditLogger.js` (`KAN-27`), nộp Báo cáo Chuyên đề 7 `Logging.docx` (`KAN-94`).
- **Tuần 11**: Tối ưu hóa hiệu năng câu truy vấn điểm, bổ sung Composite Indexes và cấu hình caching Redis cho dữ liệu danh mục lớp/môn ít biến động.
- **Tuần 12**: Đóng gói Docker Compose tự động khởi tạo đồng thời container PostgreSQL và Backend Node.js.

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `database/schema.sql` | Toàn bộ câu lệnh SQL DDL tạo 8 bảng, khóa chính, khóa ngoại và chỉ mục |
| `database/ERD.md` | Sơ đồ Mermaid ERD và từ điển dữ liệu Data Dictionary |
| `src/config/db.js` | Singleton PostgreSQL Connection Pool và hàm query() an toàn |
| `src/utils/UnitOfWork.js` | Bộ điều phối giao dịch nguyên tử ACID (BEGIN, COMMIT, ROLLBACK) |
| `src/repositories/GradeBookRepository.js` | Repository Pattern đóng gói toàn bộ truy vấn bảng điểm |
| `src/services/GradeBookService.js` | Tầng nghiệp vụ điều phối tính điểm Thông tư 22 và kiểm tra khóa sổ |
| `src/controllers/GradeBookController.js` | Controller tiếp nhận HTTP request và trả phản hồi JSON chuẩn RESTful |
| `docs/API_SPECIFICATION.md` | Hợp đồng kỹ thuật đặc tả Endpoints RESTful API |
| `CHUYENDE/Chuyên đề 2 Storages.docx` | Báo cáo nghiên cứu Chuyên đề 2 CSDL PostgreSQL định dạng Word |
| `CHUYENDE/Chuyên đề 3 Kiến trúc.docx` | Báo cáo nghiên cứu Chuyên đề 3 Clean Architecture định dạng Word |
