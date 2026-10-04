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
| **Tuần 4** | Chuyên đề Kiến trúc Phần mềm (Clean Architecture, Service - Repository - Controller Layer, DTOs & Exception Handling) | [Week4 KT .md](BrainStorm/Week4%20KT%20.md) | **HOÀN THÀNH (Tuần 4)** | Cả nhóm / Backend Lead |
| **Tuần 5** | Design Patterns (MVC, Repository Pattern, Unit of Work, Dependency Injection) | [Week5 Pattern .md](BrainStorm/Week5%20Pattern%20.md) | **TIẾP THEO (Tuần 5)** | Cả nhóm |
| **Tuần 6** | Export Engine Báo Báo (Xuất file Excel `.xlsx`, In ấn Học bạ / Biên lai PDF) | `BrainStorm/Week6 Export .md` | DỰ KIẾN | Thành viên 5 (Modules/QA) |
| **Tuần 7** | Xác thực & Bảo mật (JWT, Session Token, Spring Security, OWASP, CORS) | `BrainStorm/Week7 Authentication Authorization .md` | DỰ KIẾN | Thành viên 4 (Security) |
| **Tuần 8** | Ghi nhật ký hệ thống (Centralized Audit Logging - Vết lịch sử sửa điểm) | `BrainStorm/Week8 Logging .md` | DỰ KIẾN | Backend / QA |
| **Tuần 9** | Kiểm thử Phần mềm (Unit Testing, API Integration Test, UAT Testing) | `BrainStorm/Week9 Testing .md` | DỰ KIẾN | QA Lead |

---

## Chi Tiết Kết Quả Hoàn Thành Đến Hết Tuần 4

1. **Tuần 1 (Phân tích Yêu cầu SRS)**:
   - Xác định 5 Tác nhân tương tác (`BGH`, `GVCN`, `GVBM`, `Học sinh`, `Phụ huynh`).
   - Xây dựng ma trận phân quyền RBAC và quy tắc nghiệp vụ tính điểm Thông tư 22 (BR-01 đến BR-06).

2. **Tuần 2 (Thiết kế UX/UI & Frontend SPA)**:
   - Hoàn thiện giao diện Web SPA trên React.js 18 + Vite + TailwindCSS.
   - Tách biệt 5 màn hình Đăng nhập & Portal phù hợp cho 5 vai trò.
   - Tối ưu hóa tông màu hải quân `hsl(222, 74%, 40%)` và hiển thị Responsive.

3. **Tuần 3 (Cơ sở Dữ liệu PostgreSQL & REST API)**:
   - Cấu hình CSDL PostgreSQL (`school_management`) kết nối với Spring Boot (Port `8081`).
   - Xây dựng 8 Entities JPA (`User`, `Student`, `GradeBook`, `Attendance`, `LeaveRequest`, `Tuition`, `SchoolClass`, `Subject`).
   - Cài đặt 8 Repositories và 6 REST Controllers tiếp nhận yêu cầu từ Frontend (`/api/auth`, `/api/students`, `/api/gradebook`, `/api/attendance`, `/api/leave-requests`, `/api/tuition`).
   - Tạo DataInitializer tự động chèn dữ liệu mẫu 5 vai trò vào PostgreSQL.

4. **Tuần 4 (Sinh Mã Nguồn & Triển Khai Clean Architecture)**:
   - Hoàn thành sinh mã nguồn hệ thống tầng DTO (`ApiResponse`, `GradeBookDTO`, `StudentDTO`, `AttendanceDTO`, `LeaveRequestDTO`, `TuitionDTO`).
   - Xây dựng tầng Service Interfaces & Implementations (`StudentService`, `GradeBookService`, `AttendanceService`, `LeaveRequestService`, `TuitionService`, `SchoolClassService`, `SubjectService`).
   - Thiết lập bộ xử lý ngoại lệ toàn cục Global Exception Handler (`ResourceNotFoundException`, `BadRequestException`, `GradeSheetLockedException`).
   - Biên dịch và kiểm thử qua Maven: 100% BUILD SUCCESS.

---

## Bước Tiếp Theo (Kế hoạch Tuần 5)

- **Trọng tâm Tuần 5**: Áp dụng Design Patterns chuyên sâu (Repository Pattern, Unit of Work, Factory Pattern cho báo cáo, Dependency Injection).
