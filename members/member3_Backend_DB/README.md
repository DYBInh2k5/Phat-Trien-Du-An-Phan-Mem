# THÔNG TIN THÀNH VIÊN 3: BACKEND ARCHITECT & DATABASE ADMINISTRATOR (DBA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: HUỲNH TRUNG TÍNH
VAI TRÒ: BACKEND DEVELOPER (DEV BACKEND)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member3_Backend_DB/README.md
NGÀY CẬP NHẬT: 27/10/2026
================================================================================
```

---

## 1. VỊ TRÍ & VAI TRÒ CHÍNH TRONG HỆ THỐNG

- **Chức danh đảm nhiệm**: Kiến trúc sư Hệ thống Máy chủ (Backend Architect) & Quản trị Cơ sở Dữ liệu (Database Administrator - DBA).
- **Vị trí trong quy trình phát triển**:
  - Chịu trách nhiệm thiết kế, chuẩn hóa và tối ưu hóa toàn bộ tầng dữ liệu PostgreSQL và tầng ứng dụng máy chủ Node.js Express.
  - Tổ chức cấu trúc mã nguồn theo chuẩn **Clean Architecture 4 Tầng**, bảo đảm tính toàn vẹn giao dịch ACID và cài đặt các Mẫu thiết kế phần mềm cốt lõi (Design Patterns).

---

## 2. NHIỆM VỤ ĐÃ HOÀN THÀNH TRÊN HỆ THỐNG

### 2.1 Thiết Kế & Chuẩn Hóa Cơ Sở Dữ Liệu PostgreSQL
- Chuẩn hóa 8 bảng dữ liệu quan hệ theo Dạng chuẩn 3 (3NF) tại [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql):
  + `roles`, `users`: Phân quyền người dùng 5 vai trò.
  + `classes`, `students`, `subjects`, `teacher_assignments`: Quản lý đào tạo và phân công giảng dạy.
  + `grade_books`, `attendances`: Sổ điểm điện tử và lịch sử điểm danh.
  + `audit_logs`: Bảng nhật ký kiểm toán chống gian lận điểm.
- Thiết lập toàn bộ khóa chính (PK), khóa ngoại (FK `ON DELETE RESTRICT`) và các chỉ mục kết hợp (Composite Indexes) tối ưu hóa tốc độ truy vấn học sinh theo lớp và môn học.
- Xây dựng từ điển dữ liệu Data Dictionary và sơ đồ Mermaid ERD tại [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md).

### 2.2 Xây Dựng Khung Backend Clean Architecture 4 Tầng
- Triển khai toàn bộ mã nguồn Backend tại `members/member3_Backend_DB/school-management-nodejs/`:
  + *Tầng 1 (Entities)*: Định nghĩa các mô hình thực thể nghiệp vụ (`Student`, `Classroom`, `GradeBook`).
  + *Tầng 2 (Services)*: Điều phối nghiệp vụ chấm điểm Thông tư 22 tại [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js).
  + *Tầng 3 (Interface Adapters)*: Xây dựng Repositories và Controllers phục vụ RESTful API.
  + *Tầng 4 (Frameworks)*: Cấu hình Express server, CORS, JSON Body Parser tại [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/server.js).

### 2.3 Cài Đặt Repository Pattern (Mẫu Người Thủ Kho Dữ Liệu)
- Triển khai lớp [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) và [StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js).
- Đóng gói toàn bộ các câu truy vấn SQL tham số hóa an toàn `$1, $2` chống triệt để lỗ hổng SQL Injection. Tách biệt hoàn toàn tầng Service khỏi cú pháp CSDL cụ thể.

### 2.4 Cài Đặt Unit of Work Pattern (Bảo Vệ Giao Dịch ACID)
- Phát triển lớp [UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js) giải quyết bài toán sống còn khi lưu điểm cả lớp 45 học sinh.
- Quản lý Client độc quyền, phát lệnh `BEGIN TRANSACTION`, gom 45 thao tác ghi đệm và tự động `COMMIT` khi hợp lệ hoặc `ROLLBACK` ngay lập tức nếu phát sinh lỗi dữ liệu, bảo vệ dữ liệu không bị rách nát.

### 2.5 Cài Đặt Singleton Pattern Quản Lý Connection Pool
- Thiết kế [db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js) duy trì thể hiện duy nhất của `pg.Pool`, tái sử dụng kết nối TCP và bảo vệ máy chủ khỏi lỗi tràn kết nối.

### 2.6 Khởi Tạo Dữ Liệu Mẫu & Biên Soạn Cẩm Nang Kỹ Thuật
- Xây dựng tập lệnh khởi tạo dữ liệu mẫu phong phú (lớp 10A1, 45 học sinh, giáo viên, điểm số đầy đủ) phục vụ demo và cơ chế In-Memory Fallback khi chạy không có Docker.
- Biên soạn tài liệu hướng dẫn kỹ thuật CSDL chuyên sâu [POSTGRESQL_GUIDE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/POSTGRESQL_GUIDE.md) và tài liệu [docs/KIEN_TRUC_CHI_TIET_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/KIEN_TRUC_CHI_TIET_HE_THONG.md).

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `database/schema.sql` | Toàn bộ câu lệnh SQL DDL tạo 8 bảng, khóa chính, khóa ngoại và chỉ mục |
| `database/ERD.md` | Sơ đồ Mermaid ERD và từ điển dữ liệu Data Dictionary 8 thực thể |
| `src/config/db.js` | Singleton PostgreSQL Connection Pool và hàm query() an toàn |
| `src/utils/UnitOfWork.js` | Bộ điều phối giao dịch nguyên tử ACID (BEGIN, COMMIT, ROLLBACK) |
| `src/repositories/GradeBookRepository.js` | Repository Pattern đóng gói toàn bộ truy vấn bảng điểm |
| `src/services/GradeBookService.js` | Tầng nghiệp vụ điều phối tính điểm Thông tư 22 và kiểm tra khóa sổ |
| `src/controllers/GradeBookController.js` | Controller tiếp nhận HTTP request và trả phản hồi JSON chuẩn RESTful |
| `members/member3_Backend_DB/POSTGRESQL_GUIDE.md` | Cẩm nang hướng dẫn kết nối, cấu hình PostgreSQL và Docker container |
