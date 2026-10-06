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
| **Tuần 5** | Design Patterns (MVC, Repository Pattern, Unit of Work, Dependency Injection) | [Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md) | **TIẾP THEO (Tuần 5)** | Cả nhóm |
| **Tuần 6** | Export Engine Báo Báo (Xuất file Excel `.xlsx`, In ấn Học bạ / Biên lai PDF) | `BrainStorm/Week6 Export .md` | DỰ KIẾN | Thành viên 5 (Modules/QA) |
| **Tuần 7** | Xác thực & Bảo mật (JWT, Session Token, Spring Security / Node Auth, OWASP, CORS) | `BrainStorm/Week7 Authentication Authorization .md` | DỰ KIẾN | Thành viên 4 (Security) |
| **Tuần 8** | Ghi nhật ký hệ thống (Centralized Audit Logging - Vết lịch sử sửa điểm) | `BrainStorm/Week8 Logging .md` | DỰ KIẾN | Backend / QA |
| **Tuần 9** | Kiểm thử Phần mềm (Unit Testing, API Integration Test, UAT Testing) | `BrainStorm/Week9 Testing .md` | DỰ KIẾN | QA Lead |

---

## Chi Tiết Kết Quả Hoàn Thành Đến Hết Tuần 4

1. **Tuần 1 (Phân tích Yêu cầu SRS)**:
   - Xác định 5 Tác nhân tương tác (`BGH`, `GVCN`, `GVBM`, `Học sinh`, `Phụ huynh`).
   - Xây dựng ma trận phân quyền RBAC và 43 Use Cases chi tiết kèm 5 sơ đồ Mermaid & 5 bảng Use Case Specifications.

2. **Tuần 2 (Thiết kế UX/UI & Frontend SPA)**:
   - Hoàn thiện giao diện Web SPA trên React.js 18 + Vite + TailwindCSS.
   - Tách biệt 5 màn hình Đăng nhập & Portal phù hợp cho 5 vai trò.
   - Tối ưu hóa tông màu hải quân `hsl(222, 74%, 40%)` và hiển thị Responsive.

3. **Tuần 3 (Cơ sở Dữ liệu PostgreSQL & REST API)**:
   - Cấu hình CSDL PostgreSQL (`school_management`) kết nối với Backend (Port `8081`).
   - Xây dựng 8 Entities/Tables (`users`, `students`, `grade_books`, `attendances`, `leave_requests`, `tuitions`, `school_classes`, `subjects`).

4. **Tuần 4 (Sinh Mã Nguồn Backend Node.js Express + PostgreSQL Clean Architecture)**:
   - Chuyển đổi công nghệ Backend sang **Node.js (Express.js) + PostgreSQL** nhằm đạt sự đồng bộ 100% JavaScript/TypeScript với React Frontend.
   - Tổ chức chuẩn mô hình Clean Architecture:
     - Tầng Repositories: `UserRepository`, `StudentRepository`, `GradeBookRepository`, `AttendanceRepository`, `LeaveRequestRepository`, `TuitionRepository`, `ClassRepository`, `SubjectRepository`.
     - Tầng Services: `StudentService`, `GradeBookService`, `AttendanceService`, `LeaveRequestService`, `TuitionService`.
     - Tầng Controllers: `AuthController`, `StudentController`, `GradeBookController`, `AttendanceController`, `LeaveRequestController`, `TuitionController`, `ClassController`, `SubjectController`.
   - Kết nối cổng `8081`, tự động nạp dữ liệu Seeder ban đầu và hoàn thành kiểm thử HTTP 200 OK.

---

## Bước Tiếp Theo (Kế hoạch Tuần 5)

- **Trọng tâm Tuần 5**: Áp dụng Design Patterns chuyên sâu (Repository Pattern, Unit of Work, Factory Pattern cho báo cáo, Dependency Injection).
