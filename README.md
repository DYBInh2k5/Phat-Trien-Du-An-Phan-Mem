# Dự án 2: Hệ thống Quản lý Trường học (School Management System - SMS)

[![Môn học](https://img.shields.io/badge/M%C3%B4n%20h%E1%BB%8Dc-Ph%C3%A1t%20tri%E1%BB%83n%20d%E1%BB%B1%20%C3%A1n%20ph%E1%BA%A7n%20m%E1%BB%81m-blue)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Mã môn](https://img.shields.io/badge/M%C3%A3%20m%C3%B4n-SW320DV01-green)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Tín chỉ](https://img.shields.io/badge/S%E1%BB%91%20t%C3%ADn%20ch%E1%BB%89-3-orange)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)
[![Nhóm](https://img.shields.io/badge/Th%C3%A0nh%20vi%C3%AAn-5%20Th%C3%A0nh%20vi%C3%AAn-brightgreen)](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md)

Kho lưu trữ tài liệu phân tích, kiến trúc hệ thống và mã nguồn dự án **Hệ thống Quản lý Trường học (School Management System - SMS)** thuộc môn học **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU).

---

## 📌 Thông tin chung

- **Tên đề tài:** Xây dựng Hệ thống Quản lý Trường học (School Management System - SMS)
- **Môn học:** Phát triển dự án phần mềm
- **Mã môn học:** `SW320DV01` (3 Tín chỉ)
- **Chủ sở hữu Repository / Trưởng nhóm:** Vũ Duy Bình ([@DYBInh2k5](https://github.com/DYBInh2k5))

---

## 👥 Phân Công Nhiệm Vụ 5 Thành Viên Nhóm

| STT | Thành viên & Vai trò | Phân hệ & Công việc phụ trách | Thư mục Công việc trên GitHub |
| :---: | :--- | :--- | :--- |
| **1** | **Vũ Duy Bình** *(PM / Lead BA)* | Quản lý tiến độ, Tài liệu SRS, UAT Test Plan, Báo cáo Tuần | [`members/member1_PM_BA/`](members/member1_PM_BA/) |
| **2** | **Thành viên 2** *(Frontend Dev)* | UI/UX Design System (Glassmorphism), Portal Layout & Dashboard UI | [`members/member2_Frontend/`](members/member2_Frontend/) |
| **3** | **Thành viên 3** *(Backend & DB Architect)* | Thiết kế PostgreSQL ERD, Clean Architecture, State Store & MockData | [`members/member3_Backend_DB/`](members/member3_Backend_DB/) |
| **4** | **Thành viên 4** *(Logic & Security Dev)* | JWT Auth, RBAC 4 Roles, Thuật toán tính GPA hệ 10/4, Sổ điểm điện tử | [`members/member4_Logic_Security/`](members/member4_Logic_Security/) |
| **5** | **Thành viên 5** *(Modules Dev & QA)* | Module Điểm danh, Học phí, Export Excel/PDF Engine & Unit Testing | [`members/member5_Modules_QA/`](members/member5_Modules_QA/) |

---

## 🛠️ Bộ công nghệ lựa chọn (Tech Stack - Trích xuất từ [Tech.md](Tech.md))

- **UI/UX:** **Web Application** (Giao diện chuẩn UX/UI hiện đại, hỗ trợ Responsive PC, Tablet & Mobile).
- **Database:** **PostgreSQL** (Hệ CSDL quan hệ chuẩn ACID, bảo mật dữ liệu học sinh & điểm số cao).
- **Kiến trúc:** **Clean Architecture / 3-Layer Architecture** (Tách biệt Presentation ↔ Domain ↔ Infrastructure).
- **Design Patterns:** **MVC**, **Repository Pattern**, **Dependency Injection (DI)**, **Unit of Work**.
- **Xác thực & Bảo mật:** **JWT (JSON Web Token)** phân quyền 4 Roles (Admin, Teacher, Student, Parent) & **CORS**.
- **Xuất báo cáo:** **Excel** (Bảng điểm lớp, danh sách học sinh) & **PDF** (Học bạ điện tử, Phiếu báo điểm, Biên lai).
- **Logging & Testing:** **Centralized Audit Logging** (Ghi vết lịch sử sửa điểm) & **Unit Test** (Kiểm thử logic tính GPA).

---

## 📂 Cấu trúc Tài liệu & Thư mục (Repository Structure)

- [`README.md`](README.md): Tổng quan dự án, thông tin nhóm và hướng dẫn.
- [`Tech.md`](Tech.md): Bảng tổng hợp công nghệ và Ma trận phân công 5 thành viên.
- [`members/`](members/): Thư mục phân vùng công việc riêng cho từng thành viên nhóm (`member1` đến `member5`).
- [`BrainStorm/Week1.md`](BrainStorm/Week1.md): Tài liệu phân tích SRS chi tiết (Danh sách Actors & 7 Phân hệ FC).
- [`syllabus.md`](syllabus.md): Khung chương trình phát triển dự án SMS theo chuyên đề kỹ thuật.
- [`timeline.md`](timeline.md): Lịch trình học tập và triển khai dự án chi tiết theo từng tuần.
- [`resources.md`](resources.md): Tài nguyên tham khảo, tài liệu quy chế và công cụ hỗ trợ phát triển.

---

## 🔗 Liên kết Repository

- **GitHub Repository:** [https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem)
- **Branch chính:** `main`
- **License:** MIT License
