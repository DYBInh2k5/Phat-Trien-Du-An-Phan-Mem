# Tài liệu Phân tích Yêu cầu Phần mềm (SRS Specification) - EduManage Pro (SMS)

- **Tên hệ thống:** Hệ thống Quản lý Trường học EduManage Pro (School Management System - SMS)
- **Tác giả / Lead BA:** Võ Duy Bình (Member 1 - PM / Lead BA)
- **Môn học:** Phát triển dự án phần mềm (SW320DV01) - HSU
- **Phiên bản:** 1.0 (Phù hợp với mã nguồn React Frontend tại `members/member2_Frontend/`)

---

## 1. MỤC TIÊU VÀ TẦM VỰC HỆ THỐNG

### 1.1. Mục tiêu
Số hóa và quản lý toàn diện các hoạt động đào tạo, hồ sơ học sinh, phân công giảng dạy, sổ điểm điện tử, chuyên cần, lịch thi, thông báo liên lạc và học phí cho các trường phổ thông (THCS / THPT) hoặc cơ sở giáo dục.

### 1.2. Các phân hệ chính (Modules)
1. **Phân hệ Đăng nhập & Xác thực (Auth Module)**: Đăng nhập mã số ID, lưu JWT Session, phân quyền 4 Roles (`BGH/Admin`, `Giáo viên`, `Học sinh`, `Phụ huynh`).
2. **Phân hệ Ban Giám Hiệu / Quản trị (BGH/Admin Portal)**:
   - Dashboard thống kê tổng quan sĩ số, chuyên cần toàn trường.
   - Quản lý danh sách học sinh toàn trường (Student List & Filter).
   - Phân công thời khóa biểu & lịch báo giảng.
   - Giám sát điểm danh & chuyên cần toàn trường (Attendance Monitor).
   - Trung tâm báo cáo & khóa/mở sổ điểm (Report Center & Gradebook Locking).
   - Cấu hình năm học, môn học & hệ thống (System Settings).
3. **Phân hệ Giáo viên (Teacher Portal)**:
   - Dashboard Giáo viên (Lớp chủ nhiệm & Lớp bộ môn).
   - Sổ điểm điện tử (Gradebook): Nhập điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ; tự động tính TBM & xếp loại Học lực.
   - Điểm danh chuyên cần (Attendance Sheet): Điểm danh theo ngày/tiết.
   - Thời khóa biểu giảng dạy cá nhân.
4. **Phân hệ Học sinh (Student Portal)**:
   - Tra cứu kết quả học tập cá nhân (Bảng điểm chi tiết & GPA hệ 10/4).
   - Xem thời khóa biểu học tập & Lịch thi.
   - Theo dõi điểm danh chuyên cần cá nhân.
5. **Phân hệ Phụ huynh (Parent Portal - Sổ liên lạc)**:
   - Tra cứu điểm số & xếp loại học lực của con em.
   - Nhận thông báo điểm danh/vắng học tức thời.
   - Nộp đơn xin nghỉ học trực tuyến.
   - Tra cứu thông báo học phí & lịch sử thanh toán.

---

## 2. DANH SÁCH USE CASES & MA TRẬN PHÂN QUYỀN

### 2.1. Ma trận Phân quyền RBAC (Role-Based Access Control)

| Mã Use Case | Tên Use Case | BGH / Admin | Giáo viên | Học sinh | Phụ huynh |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `UC-AUTH-01` | Đăng nhập hệ thống | X | X | X | X |
| `UC-BGH-01` | Xem Dashboard tổng quan sĩ số & chuyên cần | X | - | - | - |
| `UC-BGH-02` | Quản lý danh sách học sinh toàn trường | X | - | - | - |
| `UC-BGH-03` | Lập và xếp Thời khóa biểu toàn trường | X | - | - | - |
| `UC-BGH-04` | Duyệt chốt / mở khóa Sổ điểm học kỳ | X | - | - | - |
| `UC-GV-01` | Nhập và chỉnh sửa điểm thành phần lớp bộ môn | - | X | - | - |
| `UC-GV-02` | Điểm danh chuyên cần lớp chủ nhiệm & tiết dạy | - | X | - | - |
| `UC-GV-03` | Đánh giá hạnh kiểm học sinh lớp chủ nhiệm | - | X | - | - |
| `UC-HS-01` | Tra cứu bảng điểm cá nhân & GPA tích lũy | - | - | X | - |
| `UC-HS-02` | Xem lịch học & lịch thi cá nhân | - | - | X | - |
| `UC-PH-01` | Tra cứu sổ liên lạc & kết quả học tập con em | - | - | - | X |
| `UC-PH-02` | Nộp đơn xin nghỉ học trực tuyến | - | - | - | X |
| `UC-PH-03` | Tra cứu học phí & xem biên lai thanh toán | - | - | - | X |

---

## 3. THIẾT KẾ QUY TRÌNH NGHIỆP VỤ CỐT LÕI (BUSINESS WORKFLOWS)

### 3.1. Quy trình Nhập điểm & Chốt sổ điểm cuối kỳ
1. GVBM truy cập Sổ điểm (`GradebookPage.jsx`), chọn Lớp học & Môn học phụ trách.
2. Hệ thống tải danh sách học sinh và hiển thị ô nhập điểm thành phần.
3. GVBM nhập điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ.
4. Hệ thống tự động tính Điểm trung bình môn (TBM):
   $$\text{TBM} = \frac{\text{Miệng} + 15\text{p} + (\text{1Tiết} \times 2) + (\text{GiữaKỳ} \times 2) + (\text{CuốiKỳ} \times 3)}{9}$$
5. Hệ thống tự động xếp loại Học lực theo quy chế.
6. Hết thời hạn nhập điểm, BGH thực hiện **Chốt khóa sổ điểm** (`BGHReportCenterPage.jsx`). Sổ điểm chuyển sang trạng thái *Read-only*.

### 3.2. Quy trình Điểm danh & Cảnh báo Chuyên cần
1. GVCN / GVBM mở màn hình Điểm danh (`AttendancePage.jsx`).
2. Chọn trạng thái cho từng học sinh (*Có mặt*, *Vắng có phép*, *Vắng không phép*, *Đi trễ*).
3. Nếu vắng không phép, hệ thống gửi thông báo tức thời tới Sổ liên lạc của Phụ huynh (`ParentCommunicationPage.jsx`).
4. Nếu tổng số tiết vắng không phép $> 20\%$ tổng số tiết, BGH nhận cảnh báo nguy cơ cấm thi trên `BGHAttendanceMonitorPage.jsx`.
