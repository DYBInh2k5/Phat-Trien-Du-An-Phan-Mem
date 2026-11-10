# THÔNG TIN THÀNH VIÊN 2: FRONTEND LEAD DEVELOPER & SYSTEM INTEGRATION SPECIALIST

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: VÕ HOÀNG SƠN
VAI TRÒ: FRONTEND DEVELOPER (DEV FRONTEND)
TÀI KHOẢN JIRA CLOUD: Sonvohoang
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member2_Frontend/README.md
NGÀY CẬP NHẬT: 27/10/2026 (TUẦN 7 / 15 TUẦN HỌC KỲ 2631)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:  
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Liên Kết Mã Nguồn / Giao Diện |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-01** | **KAN-01** | **Giao Diện Đăng Nhập 5 Vai Trò & AuthContext**: Quản lý phiên, giải mã token | Cả 5 Roles | 3 SP | **DONE** | [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) |
| **EPIC-01** | **KAN-02** | **Tính Năng 1-Click Demo Login 5 Roles**: Chuyển đổi tài khoản nhanh chấm thi | Cả 5 Roles | 2 SP | **DONE** | [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) |
| **EPIC-01** | **KAN-03** | **Tuyến Đường Bảo Vệ ProtectedRoute**: Chặn truy cập trái quyền theo vai trò | Toàn hệ thống | 1 SP | **DONE** | [ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/common/ProtectedRoute.jsx) |
| **EPIC-01** | **KAN-04** | **Trang Cấu Hình Quản Trị Hệ Thống**: Giao diện quản lý khóa tài khoản, reset pass | `UC-ADM-02` | 2 SP | **DONE** | [SystemSettingsPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/settings/SystemSettingsPage.jsx) |
| **EPIC-02** | **KAN-06** | **Giao Diện Danh Sách Học Sinh & Hồ Sơ Phân Trang**: Lọc theo lớp, tìm kiếm | `UC-ADM-03`<br>`UC-GVCN-03` | 2 SP | **DONE** | [StudentListPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/students/StudentListPage.jsx) |
| **EPIC-03** | **KAN-08** | **Giao Diện Ma Trận Thời Khóa Biểu Tuần**: Hiển thị lưới TKB Thứ 2 - Thứ 7 | `UC-GVCN-02`<br>`UC-GVBM-02` | 1 SP | **DONE** | [TimetablePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/timetable/TimetablePage.jsx) |
| **EPIC-04** | **KAN-11** | **Giao Diện Điểm Danh Tương Tác GVCN**: Trạng thái Có mặt / Có phép / Không phép | `UC-GVCN-04` | 2 SP | **DONE** | [AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/attendance/AttendancePage.jsx) |
| **EPIC-04** | **KAN-12** | **Chế Độ Điểm Danh Theo Tiết GVBM**: Giao diện chọn tiết, ghi nhận vắng | `UC-GVBM-03` | 1 SP | **DONE** | [AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/attendance/AttendancePage.jsx) |
| **EPIC-04** | **KAN-13** | **Màn Hình Giám Sát Chuyên Cần BGH**: Tỷ lệ chuyên cần toàn trường, cảnh báo đỏ | `UC-ADM-04` | 1 SP | **DONE** | [BGHAttendanceMonitor.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHAttendanceMonitor.jsx) |
| **EPIC-04** | **KAN-14** | **Modal Phê Duyệt Đơn Nghỉ Học**: Xem lý do, duyệt `APPROVED`/từ chối `REJECTED` | `UC-GVCN-05` | 1 SP | **DONE** | [AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/attendance/AttendancePage.jsx) |
| **EPIC-05** | **KAN-15** | **Lưới Nhập Điểm Spreadsheet Tương Tác**: Nhập điểm nhanh bàn phím Enter/Tab | `UC-GVBM-04` | 2 SP | **DONE** | [GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx) |
| **EPIC-05** | **KAN-17** | **Badge Hiển Thị Xếp Loại Học Lực TT22**: Huy hiệu Tốt, Khá, Đạt, Chưa đạt | `UC-GVCN-08` | 1 SP | **DONE** | [GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx) |
| **EPIC-05** | **KAN-19** | **Bảng Điểm Cá Nhân Học Sinh**: Xem điểm các môn, ĐTBmhk, GPA hệ 4 | `UC-STU-02` | 1 SP | **DONE** | [StudentGradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/student/StudentGradebookPage.jsx) |
| **EPIC-08** | **KAN-25** | **Giao Diện Cổng Phụ Huynh Parent Portal**: Thẻ tổng quan điểm số, chuyên cần | `UC-PAR-01` | 1 SP | **DONE** | [ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) |
| **EPIC-08** | **KAN-26** | **Form Nộp Đơn Xin Nghỉ Học Trực Tuyến**: Chọn ngày, nhập lý do, theo dõi duyệt | `UC-PAR-02` | 1 SP | **DONE** | [LeaveRequestModal.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) |
| **EPIC-08** | **KAN-27** | **Hộp Thoại Nhắn Tin GVCN - Phụ Huynh**: Kênh trao đổi 2 chiều phản hồi học tập | `UC-PAR-03` | 1 SP | **DONE** | [ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) |
| **TỔNG** | — | **5 Module Lớn (Module 1, 2, 3, 4, 5, 8)** | **Toàn bộ giao diện SPA** | **23 SP** | **DONE** | **Tỷ lệ đóng góp: ~21% toàn hệ thống** |

### Hệ Thống Thiết Kế UI/UX & Wireframes Đồng Thời Phụ Trách:
- **Design System & TailwindCSS Styling**: [index.css](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/index.css)
- **Bộ 8 Wireframes chuẩn giao diện học đường**: [Thư mục Images/](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/Images/)
- **Kiến trúc SPA Component React 18**: Layout Sidebar, Navbar, Toast Notifications, Responsive Mobile-Desktop.

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Thiết kế hệ thống giao diện & Design System**:
  + Xây dựng bộ quy chuẩn giao diện học đường trên React 18, Vite và TailwindCSS.
  + Thiết kế trọn bộ 8 Wireframes chuẩn UX/UI bao quát toàn bộ 5 nhóm tác nhân học đường và lưu trữ hình ảnh chất lượng cao tại thư mục `Images/`.
  + Hoàn thành Báo cáo nghiên cứu Chuyên đề 1 định dạng Word tại [CHUYENDE/Chuyên Đề 1 UXUI.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx) (thẻ `KAN-88`).
- **Phát triển các trang màn hình phân hệ cốt lõi**:
  + **Ban Giám Hiệu**: [BGHDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx), [BGHAttendanceMonitorPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHAttendanceMonitorPage.jsx).
  + **Giáo Viên Chủ Nhiệm**: [GVCNDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GVCNDashboardPage.jsx) (quản lý 45 học sinh lớp 10A1, duyệt đơn nghỉ học).
  + **Giáo Viên Bộ Môn**: [GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx) (Lưới bảng điểm Spreadsheet cố định cột mã và tên, tự tính ĐTBmhk theo thời gian thực), [AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/AttendancePage.jsx).
  + **Phụ Huynh**: [ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) (Sổ liên lạc điện tử, nộp đơn xin nghỉ học, tra cứu điểm).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - Thời Điểm Hiện Tại: 27/10/2026)
- **Tối ưu hóa màn hình Đăng nhập [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) (Thẻ Jira [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7))**:
  + 5 Tab trực quan tương ứng 5 vai trò.
  + Tính năng **1-Click Demo Login** giúp hội đồng và giảng viên truy cập trực tiếp mọi phân hệ trong 1 giây mà không cần nhớ mật khẩu.
  + Hoàn thiện bộ bảo vệ tuyến đường [ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/common/ProtectedRoute.jsx) chặn người dùng chưa xác thực hoặc không đủ quyền hạn.

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 8 -> Tuần 15)
- **Tuần 8**: Phát triển giao diện Bảng điều khiển Giám sát Nhật ký Kiểm toán Audit Log cho Ban Giám Hiệu xem lịch sử sửa điểm của giáo viên.
- **Tuần 11**: Tối ưu hóa hiệu năng tải trang, bổ sung Loading Skeletons, hiệu ứng chuyển trang mượt mà và kiểm thử độ phản hồi trên nhiều độ phân giải màn hình.
- **Tuần 15**: Hoàn thiện bộ tài liệu hướng dẫn giao diện người dùng và chuẩn bị kịch bản trình chiếu Live Demo trong buổi bảo vệ đồ án.

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Thư mục / Tệp mã nguồn | Vai Trò & Chức Năng Cụ Thể |
| :--- | :--- |
| `src/pages/auth/LoginPage.jsx` | Màn hình đăng nhập đa vai trò và nút đăng nhập nhanh 1-Click Login |
| `src/components/common/ProtectedRoute.jsx` | Bộ lọc kiểm tra quyền hạn RBAC và điều hướng bảo vệ URL Client |
| `src/pages/bgh/` | Bộ màn hình quản trị toàn trường cho Ban Giám Hiệu |
| `src/pages/gv/GradebookPage.jsx` | Bảng nhập điểm tương tác Spreadsheet thời gian thực cho GVBM |
| `src/pages/gv/AttendancePage.jsx` | Giao diện điểm danh chuyên cần theo ngày và theo tiết học |
| `src/pages/gv/GVCNDashboardPage.jsx` | Bảng điều khiển quản lý lớp chủ nhiệm và duyệt đơn nghỉ học |
| `src/pages/communication/ParentPortalPage.jsx` | Cổng thông tin sổ liên lạc điện tử dành cho phụ huynh |
| `CHUYENDE/Chuyên Đề 1 UXUI.docx` | Báo cáo nghiên cứu Chuyên đề 1 định dạng Microsoft Word |
