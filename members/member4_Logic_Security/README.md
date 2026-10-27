# THÔNG TIN THÀNH VIÊN 4: SECURITY ENGINEER & CORE ACADEMIC LOGIC DEVELOPER

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: TRẦN QUANG VINH
VAI TRÒ: CORE LOGIC & SECURITY SPECIALIST (LOGIC SECURITY)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member4_Logic_Security/README.md
NGÀY CẬP NHẬT: 27/10/2026
================================================================================
```

---

## 1. VỊ TRÍ & VAI TRÒ CHÍNH TRONG HỆ THỐNG

- **Chức danh đảm nhiệm**: Kỹ sư An ninh Ứng dụng (Security Engineer) & Chuyên viên Phát triển Thuật toán Học vụ Cốt lõi (Core Academic Logic Developer).
- **Vị trí trong quy trình phát triển**:
  - Chịu trách nhiệm bảo đảm tính an toàn bảo mật, cơ chế kiểm soát truy cập phân quyền RBAC đa vai trò và mã hóa dữ liệu.
  - Xây dựng các thuật toán tính toán học vụ phức tạp: Tính điểm trung bình môn theo Thông tư 22, quy đổi GPA hệ 4.0, xếp loại học lực và kiểm soát trạng thái khóa sổ điểm.

---

## 2. NHIỆM VỤ ĐÃ HOÀN THÀNH TRÊN HỆ THỐNG

### 2.1 Xây Dựng Cơ Chế Xác Thực JWT (JSON Web Token) Vô Trạng Thái
- Phát triển thành phần xác thực đăng nhập vô trạng thái (Stateless Authentication) tại [jwtAuthMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/jwtAuthMiddleware.js) và [authMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/middlewares/authMiddleware.js):
  + Bóc tách mã Bearer Token từ HTTP Authorization Header.
  + Kiểm tra chữ ký điện tử với bí mật `JWT_SECRET` và kiểm tra thời hạn hết hạn (TTL 15 phút).
  + Đính kèm thông tin danh tính người dùng (`userId`, `username`, `roleCode`) vào đối tượng `req.user`.

### 2.2 Xây Dựng Middleware Phân Quyền RBAC (Role-Based Access Control)
- Phát triển [rbacMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/rbacMiddleware.js) triển khai ma trận kiểm soát truy cập cho 5 nhóm vai trò:
  + `ADMIN` / `BGH`: Ban Giám Hiệu toàn quyền kiểm soát hệ thống và chốt khóa sổ điểm.
  + `GVCN`: Giáo viên chủ nhiệm quản lý học sinh và duyệt đơn nghỉ học lớp chủ nhiệm.
  + `GVBM`: Giáo viên bộ môn chỉ được phép nhập điểm cho lớp và môn học mình được phân công.
  + `STUDENT`: Học sinh chỉ được xem điểm của chính mình.
  + `PARENT`: Phụ huynh chỉ được xem thông tin con em mình.
- Tự động chặn và trả mã lỗi `403 Forbidden` khi người dùng cố tình truy cập tài nguyên vượt quá thẩm quyền.

### 2.3 Cài Đặt Thuật Toán Học Vụ Chuẩn Thông Tư 22/2021/TT-BGDĐT
- Lập trình mô đun [gpaCalculationLogic.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/gpaCalculationLogic.js) và tích hợp vào [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js):
  + Công thức tính Điểm trung bình môn học kỳ (ĐTBmhk):
    `ĐTBmhk = (ĐĐGtx_mieng + ĐĐGtx_15p + ĐĐGtx_1tiet*2 + ĐĐGgk*2 + ĐĐGck*3) / 9`
  + Làm tròn số học chuẩn xác 1 chữ số thập phân.
  + Thuật toán quy đổi sang thang điểm 4.0 và thang điểm chữ (A, B, C, D, F).
  + Thuật toán xếp loại học lực 4 mức: Tốt (Giỏi), Khá, Đạt (Trung bình), Chưa đạt (Yếu).

### 2.4 Xây Dựng Máy Trạng Thái Khóa Sổ Điểm (Gradebook Lifecycle State Machine)
- Triển khai logic kiểm soát trạng thái sổ điểm: `DRAFT` (Bản nháp) -> `SUBMITTED` (Đã nộp) -> `APPROVED` (Đã duyệt) -> `LOCKED` (Đã chốt khóa).
- Ngăn chặn triệt để hành vi cố ý sửa điểm khi sổ điểm đã bị khóa bởi Ban Giám Hiệu (nêu rõ mã lỗi `400 Bad Request: Sổ điểm đã chốt`).

### 2.5 Phòng Thủ An Ninh Mạng & Bảo Vệ Ứng Dụng
- Thiết lập cấu hình bảo vệ lớp biên với `helmet` (chặn Clickjacking, XSS Protection, HSTS).
- Thiết lập cấu hình CORS nghiêm ngặt chỉ chấp nhận các nguồn tin cậy từ Frontend Client.
- Nghiên cứu chuyên đề bảo mật chuyên sâu tại [BrainStorm/Week7 Authentication Authorization .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week7%20Authentication%20Authorization%20.md).

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `members/member4_Logic_Security/jwtAuthMiddleware.js` | Middleware xác thực chữ ký số JSON Web Token độc lập |
| `members/member4_Logic_Security/rbacMiddleware.js` | Middleware kiểm tra quyền hạn Role-Based Access Control |
| `members/member4_Logic_Security/gpaCalculationLogic.js` | Thuật toán tính ĐTBmhk, GPA hệ 10/4 và xếp loại Thông tư 22 |
| `src/middlewares/authMiddleware.js` | Middleware tích hợp trong Backend Node.js Express chính |
| `BrainStorm/Week7 Authentication Authorization .md` | Báo cáo nghiên cứu chuyên đề Xác thực & Bảo mật tuần 7 |
