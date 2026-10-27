# MỤC LỤC TÀI LIỆU ĐẶC TẢ NGHIỆP VỤ & KIẾN TRÚC HỆ THỐNG HTQLLH

Tài liệu đặc tả toàn diện của hệ thống đã được phân chia thành **2 tệp chuyên sâu độc lập**:

1. [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md):
   - Đặc tả chi tiết 5 nhóm người dùng (BGH, GVCN, GVBM, Học sinh, Phụ huynh).
   - Quy chế chấm điểm, tính ĐTBmhk theo Thông tư 22/2021/TT-BGDĐT.
   - Vòng đời sổ điểm: `DRAFT` -> `SUBMITTED` -> `APPROVED` -> `LOCKED`.
   - Quy trình điểm danh 2 cấp và cảnh báo chuyên cần (vắng quá 3 buổi / quá 20% số tiết).
   - Nhật ký kiểm toán (Audit Trail) chống gian lận điểm số.
   - Thời khóa biểu chống xung đột lịch dạy, phòng học và lớp học.
   - Sổ liên lạc điện tử và cổng phụ huynh trực tuyến.

2. [docs/KIEN_TRUC_CHI_TIET_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/KIEN_TRUC_CHI_TIET_HE_THONG.md):
   - Mô hình Clean Architecture 4 tầng (Entities, Use Cases, Interface Adapters, Frameworks & Drivers).
   - Sơ đồ kiến trúc Mermaid C4 Container Diagram.
   - Sơ đồ tuần tự Sequence Diagram xử lý giao dịch ACID lưu điểm cả lớp.
   - Các mẫu thiết kế phần mềm áp dụng: Repository Pattern, Unit of Work Pattern, Singleton Pattern, Middleware Pipeline Pattern.
   - Thiết kế CSDL PostgreSQL 8 bảng chuẩn 3NF và sơ đồ ERD Mermaid.
   - Kiến trúc an ninh bảo mật JWT Stateless và Ma trận phân quyền RBAC 5 Roles.
   - Bảng ánh xạ từ kiến trúc sang tệp mã nguồn thực tế trong Repository.
