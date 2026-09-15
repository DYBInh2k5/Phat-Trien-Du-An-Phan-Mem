# Dự án 2: Hệ thống Quản lý Trường học (School Management System - SMS)

[![Môn học](https://img.shields.io/badge/M%C3%B4n%20h%E1%BB%8Dc-Ph%C3%A1t%20tri%E1%BB%83n%20d%E1%BB%B1%20%C3%A1n%20ph%E1%BA%A7n%20m%E1%BB%81m-blue)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Mã môn](https://img.shields.io/badge/M%C3%A3%20m%C3%B4n-SW320DV01-green)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Tín chỉ](https://img.shields.io/badge/S%E1%BB%91%20t%C3%ADn%20ch%E1%BB%89-3-orange)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Đề tài](https://img.shields.io/badge/%C4%90%E1%BB%81%20t%C3%A0i-Qu%E1%BA%A3n%20l%C3%BD%20tr%C6%B0%E1%BB%9Dng%20h%E1%BB%8Dc-purple)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)

Kho lưu trữ tài liệu phân tích, kiến trúc hệ thống và mã nguồn dự án **Hệ thống Quản lý Trường học (School Management System - SMS)** thuộc môn học **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU).

---

## 📌 Thông tin chung

- **Tên đề tài:** Xây dựng Hệ thống Quản lý Trường học (School Management System - SMS)
- **Môn học:** Phát triển dự án phần mềm
- **Mã môn học:** `SW320DV01` (3 Tín chỉ)
- **Chủ sở hữu Repository:** Vũ Duy Bình ([@DYBInh2k5](https://github.com/DYBInh2k5))

---

## 🎯 Mục tiêu Dự án SMS

1. **Số hóa quy trình quản lý trường học:** Xây dựng giải pháp web quản lý toàn diện từ hồ sơ học sinh, lớp học, thời khóa biểu, điểm số, điểm danh đến học phí.
2. **Tự động hóa đánh giá học tập:** Tự động tính điểm trung bình môn (TBM), điểm GPA (hệ 10.0 & 4.0), tự động xếp loại Học lực và Hạnh kiểm theo quy chế.
3. **Kết nối Sổ liên lạc điện tử:** Tăng cường giao tiếp 2 chiều giữa Nhà trường - Giáo viên - Học sinh - Phụ huynh thông qua bảng tin và thông báo chuyên cần.
4. **Áp dụng chuẩn kiến trúc & công nghệ hiện đại:** Triển khai theo Clean Architecture, Repository Pattern, bảo mật JWT RBAC và hỗ trợ xuất báo cáo Excel/PDF.

---

## 🛠️ Bộ công nghệ lựa chọn (Tech Stack - Trích xuất từ [Tech.md](Tech.md))

- **UI/UX:** **Web Application** (Giao diện chuẩn UX/UI hiện đại, hỗ trợ Responsive trên PC, Tablet & Mobile).
- **Database:** **PostgreSQL** (Hệ CSDL quan hệ chuẩn ACID, bảo mật dữ liệu học sinh & điểm số cao).
- **Kiến trúc:** **Clean Architecture / 3-Layer Architecture** (Tách biệt Presentation ↔ Domain ↔ Infrastructure).
- **Design Patterns:** **MVC**, **Repository Pattern**, **Dependency Injection (DI)**, **Unit of Work**.
- **Xác thực & Bảo mật:** **JWT (JSON Web Token)** phân quyền 4 Roles (Admin, Teacher, Student, Parent) & **CORS**.
- **Xuất báo cáo:** **Excel** (Bảng điểm lớp, danh sách học sinh) & **PDF** (Học bạ điện tử, Phiếu báo điểm, Biên lai).
- **Logging & Testing:** **Centralized Audit Logging** (Ghi vết lịch sử sửa điểm) & **Unit Test** (Kiểm thử logic tính GPA).

---

## 👥 Các vai trò người dùng (Actors)

- 👑 **Admin / Ban Giám Hiệu:** Quản trị tài khoản, phân quyền, quản lý danh mục môn/lớp, phân công giảng dạy, chốt khóa sổ điểm.
- 👨‍🏫 **Giáo viên (GVCN & GVBM):** Nhập/sửa điểm thành phần, điểm danh chuyên cần, đánh giá hạnh kiểm, theo dõi lớp chủ nhiệm.
- 🎓 **Học sinh:** Tra cứu bảng điểm cá nhân, GPA, thời khóa biểu, lịch kiểm tra, chuyên cần.
- 👨‍👩‍👧 **Phụ huynh:** Sổ liên lạc điện tử, nhận thông báo vắng học/điểm danh, tra cứu điểm con em và học phí.

---

## 📂 Cấu trúc Tài liệu & Thư mục (Repository Structure)

- [`README.md`](README.md): Tổng quan dự án, mục tiêu, bộ công nghệ và phân quyền hệ thống.
- [`Tech.md`](Tech.md): Bảng tổng hợp công nghệ được lựa chọn sử dụng trong dự án.
- [`BrainStorm/Week1.md`](BrainStorm/Week1.md): Tài liệu phân tích SRS chi tiết (Danh sách Actors & 7 Phân hệ FC).
- [`syllabus.md`](syllabus.md): Khung chương trình phát triển dự án SMS theo chuyên đề kỹ thuật.
- [`timeline.md`](timeline.md): Lịch trình thực hiện dự án chi tiết trong 8 tuần.
- [`resources.md`](resources.md): Tài nguyên tham khảo, tài liệu quy chế và công cụ hỗ trợ phát triển.

---

## 📖 Hướng dẫn sử dụng & Đóng góp

1. Đọc tệp [`BrainStorm/Week1.md`](BrainStorm/Week1.md) để nắm rõ yêu cầu SRS, Actors và các Phân hệ FC.
2. Theo dõi lộ trình triển khai tại [`timeline.md`](timeline.md).
3. Thực hiện phát triển mã nguồn theo chuẩn kiến trúc ghi trong [`syllabus.md`](syllabus.md).

---

## 🔗 Liên kết Repository

- **GitHub Repository:** [https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem)
- **Branch chính:** `main`
- **License:** MIT License
