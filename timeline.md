# Lịch trình Phát triển Dự án 2 - Hệ thống Quản lý Trường học (SMS)

Lịch trình thực hiện chi tiết theo tuần cho đề tài **Xây dựng Hệ thống Quản lý Trường học (School Management System - SMS)** trong môn học **Phát triển dự án phần mềm**.

---

## 🗓️ Tuần 1: Phân tích Yêu cầu & Khởi tạo Dự án
- Xác định đề tài **Dự án 2: Hệ thống Quản lý Trường học (SMS)**.
- Phân tích chi tiết Yêu cầu Phần mềm (SRS): Khảo sát bài toán quản lý nhà trường.
- Xác định 4 Actors chính (*Admin, Giáo viên, Học sinh, Phụ huynh*) và 7 Phân hệ FC (Tài khoản, Học sinh, TKB, Điểm số, Điểm danh, Học phí, Báo cáo).
- Viết tài liệu SRS khởi tạo tại [`BrainStorm/Week1.md`](BrainStorm/Week1.md).
- Lựa chọn Bộ công nghệ chính thức từ [`Tech.md`](Tech.md).

---

## 🗓️ Tuần 2: Thiết kế Kiến trúc CSDL & Wireframe Giao diện
- Thiết kế sơ đồ Cơ sở dữ liệu quan hệ **PostgreSQL ERD**: các bảng `Users`, `Students`, `Teachers`, `Classes`, `Subjects`, `Schedules`, `Grades`, `Attendance`, `Tuition`.
- Phân tích mô hình **Clean Architecture / 3-Layer Architecture** (Presentation, Domain, Infrastructure).
- Xây dựng bản vẽ Wireframe / Mockup UI cho các giao diện Dashboard Admin, Giáo viên, Học sinh & Phụ huynh.

---

## 🗓️ Tuần 3: Xây dựng Module Tài khoản & Phân quyền (Auth & RBAC)
- Triển khai chức năng Đăng nhập / Đăng xuất, Khôi phục mật khẩu.
- Xây dựng cơ chế xác thực **JWT (JSON Web Token)** và Middleware phân quyền 4 vai trò (**RBAC**).
- Thiết lập khung giao diện Web Portal chính tích hợp bộ chuyển đổi vai trò (Role Switcher).

---

## 🗓️ Tuần 4: Xây dựng Module Quản lý Học sinh, Lớp học & Thời khóa biểu
- Phát triển phân hệ Quản lý Hồ sơ Học sinh (CRUD), xếp lớp, lọc và tìm kiếm học sinh.
- Quản lý danh mục Khối lớp & Môn học.
- Lập và hiển thị Thời khóa biểu trực quan theo dạng lưới Thứ (T2 - T7) và Tiết học (Sáng/Chiều).

---

## 🗓️ Tuần 5: Xây dựng Module Sổ điểm Điện tử & Tự động tính GPA
- Xây dựng màn hình Nhập điểm dành cho Giáo viên bộ môn (Điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ).
- Lập trình thuật toán tự động tính Điểm trung bình môn (TBM), điểm **GPA (Hệ 10.0 & Hệ 4.0)**.
- Lập trình logic tự động xếp loại **Học lực** và đánh giá **Hạnh kiểm** theo quy chế.
- Phát triển tính năng Khóa / Mở chốt sổ điểm cuối kỳ.

---

## 🗓️ Tuần 6: Xây dựng Module Điểm danh & Quản lý Học phí
- Xây dựng giao diện Điểm danh chuyên cần theo ngày/tiết học cho Giáo viên chủ nhiệm & Bộ môn.
- Cảnh báo học sinh vắng mặt và gửi thông báo Sổ liên lạc điện tử tới Phụ huynh.
- Khởi tạo thông báo học phí, theo dõi trạng thái thanh toán (*Chưa thanh toán, Đã thanh toán, Còn nợ*).

---

## 🗓️ Tuần 7: Module Xuất Báo cáo (Excel/PDF) & Kiểm thử Unit Test
- Triển khai tính năng **Xuất Excel**: Xuất danh sách học sinh, bảng điểm lớp, báo cáo tổng kết.
- Triển khai tính năng **Xuất PDF**: Xuất phiếu báo điểm cá nhân, Học bạ điện tử, Biên lai học phí.
- Viết **Unit Test** cho công thức tính GPA, xếp loại học lực và kiểm tra nhật ký lưu vết **Audit Log**.

---

## 🗓️ Tuần 8: Hoàn thiện, Đóng gói & Báo cáo Demo Dự án SMS
- Kiểm thử toàn diện hệ thống (Integration & System Testing), sửa lỗi phát sinh.
- Hoàn thiện tài liệu báo cáo tổng kết và cập nhật toàn bộ kho lưu trữ GitHub.
- Chuẩn bị Slide và thực hiện Live Demo báo cáo trước Giảng viên môn học.
