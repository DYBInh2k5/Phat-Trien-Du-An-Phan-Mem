# Ma trận Truy xuất Yêu cầu (Requirements Traceability Matrix - RTM)

- **Hệ thống:** EduManage Pro (School Management System - SMS)
- **Tác giả (PM / Lead BA):** Võ Duy Bình (Member 1)
- **Mục tiêu:** Đảm bảo $100\%$ các Yêu cầu Chức năng (SRS FCs) được liên kết chặt chẽ với Use Cases, Mã nguồn React Frontend (`members/member2_Frontend/`) và Kịch bản Kiểm thử UAT.

---

## MA TRẬN TRUY XUẤT RTM CHI TIẾT

| Mã Yêu cầu SRS | Tên Yêu cầu Chức năng (FC) | Mã Use Case | Màn hình Giao diện React Frontend | Mã Test Case UAT | Trạng thái Nghiệm thu |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `FC-01.1` | Đăng nhập / Đăng xuất ID & Pass | `UC-AUTH-01` | `src/pages/auth/LoginPage.jsx` | `UAT-AUTH-01..04` | **PASS** |
| `FC-01.2` | Phân quyền RBAC 4 Roles | `UC-AUTH-02` | `src/components/auth/ProtectedRoute.jsx` | `UAT-AUTH-05` | **PASS** |
| `FC-01.3` | Quản lý phiên JWT & Session | `UC-AUTH-03` | `src/context/AuthContext.jsx` | `UAT-AUTH-01` | **PASS** |
| `FC-02.1` | Hồ sơ thông tin học sinh | `UC-BGH-02` | `src/pages/students/StudentListPage.jsx` | `UAT-BGH-01` | **PASS** |
| `FC-02.2` | Quản lý danh sách học sinh | `UC-BGH-02` | `src/pages/students/StudentListPage.jsx` | `UAT-BGH-01` | **PASS** |
| `FC-03.1` | Lập Thời khóa biểu toàn trường | `UC-BGH-03` | `src/pages/bgh/ScheduleAdminPage.jsx` | `UAT-BGH-01` | **PASS** |
| `FC-03.2` | Xem Thời khóa biểu cá nhân | `UC-HS-02` | `src/pages/schedule/TimetablePage.jsx` | `UAT-HS-02` | **PASS** |
| `FC-04.1` | Nhập điểm thành phần | `UC-GV-01` | `src/pages/gv/GradebookPage.jsx` | `UAT-GV-01` | **PASS** |
| `FC-04.2` | Tự động tính TBM & GPA 10/4 | `UC-GV-01` | `src/pages/gv/GradebookPage.jsx` | `UAT-GV-01` | **PASS** |
| `FC-04.3` | Xếp loại Học lực quy chuẩn | `UC-GV-01` | `src/pages/gv/GradebookPage.jsx` | `UAT-GV-01` | **PASS** |
| `FC-04.5` | Khóa / Mở chốt Sổ điểm cuối kỳ | `UC-BGH-04` | `src/pages/bgh/BGHReportCenterPage.jsx` | `UAT-BGH-02` | **PASS** |
| `FC-05.1` | Điểm danh chuyên cần ngày/tiết | `UC-GV-02` | `src/pages/gv/AttendancePage.jsx` | `UAT-GV-03` | **PASS** |
| `FC-05.2` | Giám sát vắng cấm thi toàn trường| `UC-BGH-05` | `src/pages/bgh/BGHAttendanceMonitorPage.jsx` | `UAT-BGH-03` | **PASS** |
| `FC-06.1` | Nộp đơn xin nghỉ học trực tuyến | `UC-PH-02` | `src/pages/communication/ParentCommunicationPage.jsx` | `UAT-PH-01` | **PASS** |
| `FC-06.2` | Tra cứu học phí & Biên lai | `UC-PH-03` | `src/pages/communication/ParentCommunicationPage.jsx` | `UAT-PH-02` | **PASS** |

---

## TỔNG KẾT
Ma trận RTM xác nhận toàn bộ 15 Yêu cầu Chức năng trọng tâm của hệ thống EduManage Pro đều được phát triển mã nguồn đầy đủ và đạt kết quả kiểm thử UAT **PASS 100%**.
