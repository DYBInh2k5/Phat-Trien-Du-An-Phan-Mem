# THÔNG TIN THÀNH VIÊN 2: FRONTEND LEAD DEVELOPER & SYSTEM INTEGRATION SPECIALIST

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: VÕ HOÀNG SƠN
VAI TRÒ: FRONTEND DEVELOPER (DEV FRONTEND)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member2_Frontend/README.md
NGÀY CẬP NHẬT: 27/10/2026
================================================================================
```

---

## 1. VỊ TRÍ & VAI TRÒ CHÍNH TRONG HỆ THỐNG

- **Chức danh đảm nhiệm**: Trưởng nhóm Lập trình Giao diện (Frontend Lead Developer) & Chuyên viên Nghiên cứu Kiến trúc Mở rộng (System Integration).
- **Vị trí trong quy trình phát triển**:
  - Chịu trách nhiệm thiết kế, lập trình và tối ưu hóa toàn bộ Ứng dụng Web Single Page Application (SPA) phía máy khách (Client-side).
  - Đảm bảo trải nghiệm người dùng (UX/UI) mượt mà, phân quyền giao diện nghiêm ngặt cho 5 nhóm vai trò và kết nối RESTful API với Backend Node.js.

---

## 2. NHIỆM VỤ ĐÃ HOÀN THÀNH TRÊN HỆ THỐNG

### 2.1 Xây Dựng Khung Ứng Dụng Web SPA Chuẩn Công Nghệ
- Khởi tạo và cấu hình hoàn chỉnh dự án React 18 kết hợp Vite bundler và TailwindCSS tại `members/member2_Frontend/`.
- Xây dựng hệ thống Design System hiện đại: Bảng màu học đường chuyên nghiệp, Typography chuẩn Inter/Segoe UI, Card bo tròn, hiệu ứng bóng mờ (box-shadow) và tương thích hoàn toàn trên Desktop, Tablet và Mobile.
- Thiết lập hệ thống định tuyến phân quyền đa tầng bằng `react-router-dom` v6 kèm thành phần bảo vệ tuyến đường `ProtectedRoute.jsx`.

### 2.2 Phát Triển 5 Cổng Thông Tin Riêng Biệt Cho 5 Vai Trò (5 Portals)
- **Cổng Ban Giám Hiệu (`/bgh`)**:
  + [BGHDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx): Tổng quan sĩ số toàn trường, tình trạng chốt sổ điểm các khối lớp.
  + [BGHAttendanceMonitorPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHAttendanceMonitorPage.jsx): Theo dõi chuyên cần học sinh toàn trường, tự động lọc học sinh có nguy cơ cấm thi do vắng quá 20% số tiết.
  + Quản lý danh mục khối/lớp và phân công giáo viên.
- **Cổng Giáo Viên Chủ Nhiệm (`/gvcn`)**:
  + [GVCNDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GVCNDashboardPage.jsx): Quản trị lớp 10A1 (sĩ số 45 học sinh).
  + Đánh giá hạnh kiểm học kỳ theo 4 mức Thông tư 22 (Tốt, Khá, Đạt, Chưa đạt).
  + Tiếp nhận, xem lý do và duyệt đơn xin nghỉ học từ phụ huynh.
- **Cổng Giáo Viên Bộ Môn (`/gv`)**:
  + [GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx): Lưới dữ liệu bảng điểm (Spreadsheet Grid) cố định cột Mã và Tên học sinh, tự động tính ĐTBmhk theo thời gian thực.
  + [AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/AttendancePage.jsx): Điểm danh nhanh theo tiết học với 4 trạng thái chuyên cần.
  + Chức năng gửi yêu cầu mở khóa sổ điểm phúc khảo gửi Ban Giám Hiệu.
- **Cổng Học Sinh (`/student`)**:
  + Tra cứu bảng điểm cá nhân, GPA hệ 10 và hệ 4, xếp loại học lực và số buổi vắng học.
- **Cổng Phụ Huynh (`/parent`)**:
  + [ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx): Sổ liên lạc điện tử con em, nộp đơn xin nghỉ học kèm lý do trực tuyến, tra cứu và in biên lai học phí.

### 2.3 Cơ Chế Đăng Nhập & Chuyển Vai Trò 1-Click Demo
- Phát triển trang [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) với 5 Tab trực quan cho 5 vai trò.
- Tích hợp tính năng 1-Click Demo Login giúp hội đồng đánh giá và giảng viên trải nghiệm ngay lập tức các quyền hạn mà không cần gõ mật khẩu thủ công.

### 2.4 Nghiên Cứu Kiến Trúc Hệ Thống Mở Rộng
- Đồng chủ trì nghiên cứu giải pháp Cơ sở dữ liệu và lộ trình mở rộng kiến trúc Event-Driven, Microservices trong [BrainStorm/Week3 DB .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week3%20DB%20.md) và [Week4 KT .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week4%20KT%20.md).

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Thư mục / Tệp mã nguồn | Vai Trò & Chức Năng Cụ Thể |
| :--- | :--- |
| `src/pages/auth/LoginPage.jsx` | Màn hình đăng nhập đa vai trò và nút đăng nhập nhanh 1-click |
| `src/pages/bgh/` | Bộ màn hình quản trị toàn trường cho Ban Giám Hiệu |
| `src/pages/gv/GradebookPage.jsx` | Bảng nhập điểm tương tác thời gian thực cho Giáo viên bộ môn |
| `src/pages/gv/AttendancePage.jsx` | Giao diện điểm danh chuyên cần theo ngày và theo tiết học |
| `src/pages/gv/GVCNDashboardPage.jsx` | Bảng điều khiển quản lý lớp chủ nhiệm và duyệt đơn nghỉ học |
| `src/pages/communication/ParentPortalPage.jsx` | Cổng thông tin sổ liên lạc điện tử dành cho phụ huynh |
| `src/components/common/ProtectedRoute.jsx` | Bộ lọc kiểm tra phân quyền và điều hướng bảo vệ tuyến đường |
| `src/utils/exportEngine.js` | Tích hợp xuất bảng điểm ra Excel và xem trước in ấn PDF |
