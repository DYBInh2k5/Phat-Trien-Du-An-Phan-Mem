# BrainStorm Tuần 1: Phân Tích SRS - Hệ Thống Quản Lý Trường Học (School Management System - SMS)

Tài liệu phân tích Chi tiết Yêu cầu Phần mềm (SRS - Software Requirements Specification), xác định các Actors (Tác nhân tương tác) và FC (Functional Categories / Feature Components - Các phân hệ tính năng) cho Hệ thống Quản lý Trường học.

---

## 1. Danh sách Actors (Tác nhân tương tác hệ thống)

| STT | Actor (Tác nhân) | Mô tả vai trò & Quyền hạn chính |
| :--- | :--- | :--- |
| 1 | Admin / Ban Giám Hiệu (System Administrator / Principal) | Quản trị toàn bộ hệ thống, tạo và phân quyền tài khoản, cấu hình năm học/học kỳ, quản lý danh mục khối/lớp/môn học, phân công giảng dạy cho giáo viên, duyệt báo cáo tổng kết toàn trường, mở/khóa sổ điểm. |
| 2 | Giáo viên (Teacher / Form Teacher & Subject Teacher) | GV Chủ nhiệm: Điểm danh lớp, đánh giá hạnh kiểm, theo dõi tổng quát lớp, liên hệ phụ huynh.<br>GV Bộ môn: Nhập/sửa điểm thành phần theo tiết/môn được phân công, tổng kết điểm trung bình môn học. |
| 3 | Học sinh (Student) | Tra cứu kết quả học tập cá nhân (bảng điểm thành phần, GPA), xem thời khóa biểu, lịch kiểm tra/lịch thi, xem tình hình điểm danh chuyên cần, nhận thông báo từ nhà trường. |
| 4 | Phụ huynh (Parent) | Sử dụng như Sổ liên lạc điện tử: Theo dõi tình hình học tập và điểm số của con em, xem lịch học, nhận thông báo điểm danh/vắng học tức thời, xem và tra cứu tình hình thanh toán học phí. |

---

## 2. Phân tích Các Phân hệ Tính năng (FC - Functional Components / Functional Requirements)

### FC-01: Phân hệ Quản lý Tài khoản & Phân quyền (Authentication & Authorization)
- FC-01.1: Đăng nhập / Đăng xuất an toàn bằng Tên đăng nhập (Mã số) & Mật khẩu.
- FC-01.2: Phân quyền truy cập dựa trên vai trò (Role-Based Access Control - RBAC: Admin, Teacher, Student, Parent).
- FC-01.3: Đổi mật khẩu, khôi phục mật khẩu qua Email/Mã xác nhận.
- FC-01.4: Ghi vết nhật ký đăng nhập và thao tác người dùng (Audit Log).

### FC-02: Phân hệ Quản lý Hồ sơ Học sinh & Lớp học (Student & Class Management)
- FC-02.1: Quản lý hồ sơ học sinh (Họ tên, ngày sinh, giới tính, địa chỉ, ảnh đại diện, thông tin phụ huynh liên hệ).
- FC-02.2: Quản lý danh mục Lớp học, Khối lớp (Khối 10, 11, 12 hoặc các năm học), sĩ số tối đa.
- FC-02.3: Xếp lớp, chuyển lớp, phân loại trạng thái học sinh (Đang học, Thôi học, Chuyển trường, Đã tốt nghiệp).
- FC-02.4: Tra cứu, tìm kiếm và lọc danh sách học sinh theo lớp, họ tên, mã học sinh.

### FC-03: Phân hệ Quản lý Giảng dạy & Thời khóa biểu (Teaching & Schedule Management)
- FC-03.1: Quản lý danh mục Môn học (Toán, Văn, Anh, Lý, Hóa,...), số tiết học, hệ số môn.
- FC-03.2: Phân công giảng dạy (Giao môn học & lớp học cho Giáo viên bộ môn, giao lớp cho Giáo viên chủ nhiệm).
- FC-03.3: Lập và hiển thị Thời khóa biểu trực quan theo ma trận Thứ (Thứ 2 - Thứ 7) và Tiết học (Sáng/Chiều).
- FC-03.4: Cập nhật lịch báo giảng, lịch dạy bù hoặc đổi tiết dạy.

### FC-04: Phân hệ Sổ điểm Điện tử & Đánh giá (Grade & Academic Assessment)
- FC-04.1: Nhập và chỉnh sửa điểm thành phần (Điểm miệng, Điểm 15 phút, Điểm 1 tiết, Điểm Giữa kỳ, Điểm Cuối kỳ).
- FC-04.2: Tự động tính Điểm trung bình môn (TBM) và Điểm trung bình học kỳ/cả năm (GPA hệ 10.0 & hệ 4.0).
- FC-04.3: Tự động xếp loại Học lực theo quy chế (Xuất sắc, Giỏi, Khá, Trung bình, Yếu, Kém).
- FC-04.4: Nhập và đánh giá Hạnh kiểm học sinh theo từng học kỳ (Tốt, Khá, Trung bình, Yếu).
- FC-04.5: Chức năng Khóa/Mở sổ điểm (Tránh chỉnh sửa điểm sau khi đã chốt học kỳ).

### FC-05: Phân hệ Điểm danh & Chuyên cần (Attendance Management)
- FC-05.1: Điểm danh học sinh hàng ngày (dành cho GVCN) hoặc theo từng tiết học (dành cho GVBM).
- FC-05.2: Quản lý trạng thái: Có mặt, Vắng có phép, Vắng không phép, Đi trễ.
- FC-05.3: Gửi thông báo/cảnh báo tự động tới Phụ huynh khi học sinh vắng mặt.
- FC-05.4: Thống kê tỷ lệ chuyên cần theo tháng/học kỳ.

### FC-06: Phân hệ Quản lý Học phí & Thu chi (Tuition & Fee Management)
- FC-06.1: Khởi tạo thông báo học phí theo học kỳ/tháng (gồm Học phí chính khóa, Tiền bán trú, BHYT, Cơ sở vật chất).
- FC-06.2: Ghi nhận và theo dõi trạng thái thanh toán (Chưa thanh toán, Đã thanh toán, Còn nợ).
- FC-06.3: Xuất hóa đơn / Biên lai thu tiền điện tử gửi Phụ huynh.

### FC-07: Phân hệ Sổ liên lạc Điện tử & Báo cáo (Communication & Reporting)
- FC-07.1: Đăng tải thông báo chung của Nhà trường và thông báo riêng của Lớp học.
- FC-07.2: Xuất báo cáo danh sách học sinh, bảng điểm lớp ra file Excel.
- FC-07.3: Xuất Phiếu báo điểm cá nhân, Học bạ điện tử ra file PDF.

---

## 3. Yêu cầu Phi chức năng (NFR - Non-Functional Requirements)

- Bảo mật (Security): Mã hóa mật khẩu, phân quyền JWT chặt chẽ, kiểm soát không cho học sinh/phụ huynh tự ý sửa dữ liệu.
- Tính toàn vẹn (Data Integrity): Ràng buộc dữ liệu điểm (0 - 10), ghi nhận lịch sử chỉnh sửa điểm số (Audit Log).
- Hiệu năng (Performance): Thời gian phản hồi trang web < 1 giây, tải bảng điểm lớp nhanh chóng.
- Giao diện (Usability): Giao diện chuẩn UX/UI, tương thích Responsive trên Máy tính và Điện thoại di động.
