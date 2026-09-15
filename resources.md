# Tài nguyên Tham khảo & Công cụ cho Dự án 2: Hệ thống Quản lý Trường học (SMS)

Tổng hợp các tài nguyên sách, tài liệu quy chế, công cụ và thư viện hỗ trợ phục vụ xây dựng Hệ thống Quản lý Trường học (School Management System - SMS) trong môn học Phát triển dự án phần mềm.

---

## 1. Sách & Tài liệu Chuyên ngành

- "Clean Architecture: A Craftsman's Guide to Software Structure and Design" - Robert C. Martin  
  Ứng dụng: Thiết kế kiến trúc 3 lớp / Clean Architecture tách biệt UI, Domain nghiệp vụ và Infrastructure.
- "Design Patterns: Elements of Reusable Object-Oriented Software" - Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides  
  Ứng dụng: Áp dụng MVC Pattern, Repository Pattern, Dependency Injection (DI) và Unit of Work trong quản lý CSDL.
- "PostgreSQL Documentation & Best Practices"  
  Ứng dụng: Thiết kế Cơ sở dữ liệu quan hệ tối ưu hóa cho điểm số học sinh, chỉ mục (Indexing) và giao dịch (Transaction).

---

## 2. Quy chế Đánh giá & Văn bản Pháp lý Đào tạo

- Thông tư 22/2021/TT-BGDĐT (hoặc Quy chế đào tạo tín chỉ Đại học):  
  Ứng dụng: Tham chiếu chuẩn công thức tính điểm trung bình môn, điểm tích lũy GPA (hệ 10.0 & hệ 4.0), tiêu chuẩn xếp loại Học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu, Kém) và xếp loại Hạnh kiểm học sinh.

---

## 3. Công cụ & Thư viện Hỗ trợ Phát triển (Development Tools)

### 3.1. Phát triển Web Application & CSDL
- Visual Studio Code / IDE: Môi trường lập trình chính.
- PostgreSQL / pgAdmin 4 (hoặc Supabase): Quản trị Cơ sở dữ liệu quan hệ.
- Postman: Kiểm thử RESTful API endpoints và xác thực JWT Bearer Token.

### 3.2. Thư viện Xuất Báo cáo (Export Libraries)
- SheetJS (xlsx) / ExcelJS: Thư viện xử lý xuất dữ liệu bảng điểm và danh sách học sinh ra file Excel.
- jsPDF / pdfmake: Thư viện tạo và định dạng Học bạ điện tử, Phiếu báo điểm, Biên lai thu tiền ra file PDF.

### 3.3. Quản lý Code & Thiết kế UI/UX
- Git & GitHub: Quản lý phiên bản mã nguồn dự án (https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem).
- Figma / Balsamiq: Thiết kế Wireframe & Mockup giao diện Dashboard quản lý trường học.

---

## 4. Best Practices & Lời khuyên Thực hành

1. Bảo mật Dữ liệu Điểm số: Kiểm tra phân quyền JWT cẩn thận, tuyệt đối không cho phép Học sinh/Phụ huynh gọi API sửa điểm.
2. Minh bạch thông qua Audit Log: Mỗi thao tác thay đổi điểm số của Giáo viên đều cần ghi lại nhật ký (người sửa, điểm cũ, điểm mới, thời gian).
3. Kiểm thử Thuật toán GPA: Viết Unit Test phủ hết các trường hợp điểm biên (ví dụ: 7.9 vs 8.0, học lực giỏi nhưng có môn khống dưới 6.5) để đảm bảo tính xếp loại chính xác.
4. Trải nghiệm Người dùng (UX): Đảm bảo giao diện bảng điểm và thời khóa biểu dễ nhìn, thao tác mượt mà trên mọi thiết bị.
