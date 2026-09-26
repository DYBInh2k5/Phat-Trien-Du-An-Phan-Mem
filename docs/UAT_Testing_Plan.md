# Kế hoạch Kiểm thử Chấp nhận Người dùng (UAT Testing Plan) - EduManage Pro (SMS)

- **Dự án:** Hệ thống Quản lý Trường học EduManage Pro (School Management System - SMS)
- **Người lập kịch bản (Lead BA / PM):** Võ Duy Bình (Member 1)
- **Môn học:** Phát triển dự án phần mềm (SW320DV01) - HSU
- **Mục tiêu:** Kiểm thử nghiệm thu chức năng trên giao diện Web Application cho 4 đối tượng người dùng.

---

## 1. PHẠM VI KIỂM THỬ UAT (UAT SCOPE)

Kiểm thử toàn bộ các màn hình giao diện React Frontend tại `members/member2_Frontend/src/pages/` bao gồm:
1. **Xác thực & Chuyển vai trò**: `LoginPage.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx`.
2. **Ban Giám Hiệu / Admin**: `BGHDashboardPage.jsx`, `StudentListPage.jsx`, `ScheduleAdminPage.jsx`, `BGHAttendanceMonitorPage.jsx`, `BGHReportCenterPage.jsx`, `SystemSettingsPage.jsx`.
3. **Giáo viên**: `GVDashboardPage.jsx`, `GradebookPage.jsx`, `AttendancePage.jsx`, `TimetablePage.jsx`.
4. **Học sinh**: `StudentGradebookPage.jsx`, `StudentSchedulePage.jsx`, `StudentExamsPage.jsx`, `StudentAttendancePage.jsx`.
5. **Phụ huynh**: `ParentCommunicationPage.jsx`.

---

## 2. KỊCH BẢN KIỂM THỬ UAT CHI TIẾT (UAT TEST SCENARIOS)

### 2.1. Phân hệ Xác thực & Phân quyền (Auth & RBAC)

| Mã Test Case | Tên Kịch bản Kiểm thử | Các bước Thực hiện | Kết quả Kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `UAT-AUTH-01` | Đăng nhập tài khoản BGH | 1. Mở `LoginPage.jsx`<br>2. Chọn Role: Ban Giám Hiệu<br>3. Nhập ID/Pass chuẩn<br>4. Nhấn "Đăng nhập" | Chuyển hướng thành công tới `BGHDashboardPage.jsx`. Hiển thị tên & role BGH trên Header. | **PASS** |
| `UAT-AUTH-02` | Đăng nhập tài khoản Giáo viên | 1. Chọn Role: Giáo viên<br>2. Nhập tài khoản GV<br>3. Đăng nhập | Chuyển hướng tới `GVDashboardPage.jsx`. Hiển thị danh sách lớp chủ nhiệm & môn dạy. | **PASS** |
| `UAT-AUTH-03` | Đăng nhập tài khoản Học sinh | 1. Chọn Role: Học sinh<br>2. Đăng nhập | Chuyển hướng tới `StudentGradebookPage.jsx`. Hiển thị GPA & điểm môn học cá nhân. | **PASS** |
| `UAT-AUTH-04` | Đăng nhập tài khoản Phụ huynh | 1. Chọn Role: Phụ huynh<br>2. Đăng nhập | Chuyển hướng tới `ParentCommunicationPage.jsx`. Hiển thị Sổ liên lạc điện tử con em. | **PASS** |
| `UAT-AUTH-05` | Kiểm tra chặn truy cập trái phép (RBAC) | 1. Đăng nhập Role Học sinh<br>2. Cố tình nhập URL `/bgh/dashboard` | Chuyển hướng sang `UnauthorizedPage.jsx` thông báo không có quyền truy cập. | **PASS** |

---

### 2.2. Phân hệ Giáo viên (Teacher Gradebook & Attendance)

| Mã Test Case | Tên Kịch bản Kiểm thử | Các bước Thực hiện | Kết quả Kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `UAT-GV-01` | Nhập điểm thành phần & Tính TBM tự động | 1. Mở `GradebookPage.jsx`<br>2. Chọn Lớp 10A1, Môn Toán<br>3. Nhập điểm: Miệng=8.0, 15p=9.0, 1Tiết=8.0, GK=8.5, CK=9.0 | Hệ thống tự động tính TBM = 8.7 và hiển thị Badge Xếp loại "GIỎI". | **PASS** |
| `UAT-GV-02` | Kiểm tra ràng buộc điểm hợp lệ (0-10) | 1. Nhập điểm Miệng = 15.0 hoặc -2.0 | Hệ thống từ chối nhập điểm và hiển thị thông báo lỗi "Điểm phải nằm trong khoảng 0.0 - 10.0". | **PASS** |
| `UAT-GV-03` | Điểm danh lớp chủ nhiệm | 1. Mở `AttendancePage.jsx`<br>2. Đánh dấu học sinh A "Vắng không phép"<br>3. Bấm "Lưu điểm danh" | Lưu nhật ký điểm danh thành công. Tự động gửi thông báo tới Phụ huynh học sinh A. | **PASS** |

---

### 2.3. Phân hệ Ban Giám Hiệu (BGH Management & Report Center)

| Mã Test Case | Tên Kịch bản Kiểm thử | Các bước Thực hiện | Kết quả Kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `UAT-BGH-01` | Lập Thời khóa biểu toàn trường | 1. Mở `ScheduleAdminPage.jsx`<br>2. Phân công tiết dạy cho GV | Hiển thị ma trận Thời khóa biểu Thứ 2 - Thứ 7. Tự động cảnh báo nếu trùng tiết dạy. | **PASS** |
| `UAT-BGH-02` | Khóa Sổ điểm cuối kỳ | 1. Mở `BGHReportCenterPage.jsx`<br>2. Chọn Học kỳ 1 và bấm "Khóa Sổ Điểm" | Chuyển trạng thái Sổ điểm sang *Locked*. Giáo viên không thể chỉnh sửa điểm trực tiếp. | **PASS** |
| `UAT-BGH-03` | Giám sát chuyên cần toàn trường | 1. Mở `BGHAttendanceMonitorPage.jsx` | Hiển thị danh sách học sinh vắng quá 20% số tiết có nguy cơ cấm thi. | **PASS** |

---

### 2.4. Phân hệ Phụ huynh (Parent Communication & Fees)

| Mã Test Case | Tên Kịch bản Kiểm thử | Các bước Thực hiện | Kết quả Kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `UAT-PH-01` | Nộp đơn xin nghỉ học trực tuyến | 1. Mở `ParentCommunicationPage.jsx`<br>2. Nhập lý do & chọn ngày nghỉ<br>3. Bấm "Gửi đơn" | Gửi đơn nghỉ học thành công. GVCN nhận được thông báo trên `AttendancePage.jsx`. | **PASS** |
| `UAT-PH-02` | Tra cứu học phí & Biên lai | 1. Chuyển sang Tab Học phí | Hiển thị số tiền học phí HK1, trạng thái "ĐÃ THANH TOÁN" và nút "Tải biên lai PDF". | **PASS** |

---

## 3. KẾT LUẬN VÀ NGHIỆM THU

Bộ kịch bản UAT đã được kiểm thử toàn diện trên mã nguồn React Frontend tại `members/member2_Frontend/`. Tất cả các kịch bản kiểm thử cốt lõi cho 4 vai trò (**BGH, Giáo viên, Học sinh, Phụ huynh**) đều đạt kết quả **PASS 100%**.
