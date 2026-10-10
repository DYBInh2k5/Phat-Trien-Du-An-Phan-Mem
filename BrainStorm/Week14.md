# BrainStorm Tuần 14: Đóng Gói Bản Phát Hành Release v1.0 & Cẩm Nang Hướng Dẫn Sử Dụng (User Manual)

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI TUẦN 14

### 1. Mục tiêu
Chuẩn bị đầy đủ bộ hồ sơ bàn giao sản phẩm phần mềm phiên bản chính thức (Production Release v1.0.0). Xây dựng tài liệu hướng dẫn sử dụng (User Manual) chi tiết từng bước có hình ảnh minh họa cho cả 5 nhóm đối tượng, giúp người dùng không có kiến thức kỹ thuật vẫn có thể sử dụng thành thạo phần mềm.

### 2. Các thành phần trong bộ phát hành Release v1.0
1. **Mã nguồn đã đóng gói (Source Code Artifacts)**: Gắn thẻ phát hành `tag: v1.0.0` trên GitHub repository.
2. **Tập lệnh Khởi tạo CSDL tự động**: Tệp `database/schema.sql` hoàn chỉnh kèm dữ liệu mẫu niên khóa 2026-2027.
3. **Cẩm nang Người dùng (User Manual)**:
   - Sổ tay dành cho Ban Giám hiệu: Quản trị niên khóa, phê duyệt sổ điểm, thanh tra nhật ký kiểm toán.
   - Sổ tay dành cho Giáo viên: Hướng dẫn nhập điểm, tính điểm tự động, xuất file Excel và điểm danh.
   - Sổ tay dành cho Học sinh & Phụ huynh: Hướng dẫn xem điểm, nộp đơn xin nghỉ học và thanh toán học phí.
4. **Tài liệu Kỹ thuật Quản trị viên (Admin & Deployment Manual)**: Nằm tại `docs/DEPLOYMENT_GUIDE.md` và `docs/API_SPECIFICATION.md`.

---

## CHƯƠNG II. DANH MỤC TÍNH NĂNG HOÀN THIỆN TRONG RELEASE V1.0

- [x] **Xác thực Đa vai trò**: Đăng nhập bằng ID, cấp phát JWT Bearer Token, hỗ trợ chuyển vai trò nhanh (Role Switcher).
- [x] **Phân hệ BGH**: Dashboard thống kê tỷ lệ chuyên cần, quản lý hồ sơ học sinh, khóa/mở khóa sổ điểm, giám sát Audit Log.
- [x] **Phân hệ Giáo viên**: Sổ điểm điện tử môn học, điểm danh chuyên cần, đánh giá học lực theo Thông tư của Bộ GD&ĐT.
- [x] **Phân hệ Học sinh**: Tra cứu bảng điểm cá nhân, GPA thang điểm 10 và 4.0, xem thời khóa biểu và lịch thi.
- [x] **Phân hệ Phụ huynh**: Sổ liên lạc trực tuyến, nộp đơn xin nghỉ học, thanh toán học phí điện tử.
- [x] **Export Engine**: Xuất sổ điểm ra Excel (.xlsx), xuất phiếu báo điểm cá nhân ra PDF (.pdf), xuất dữ liệu thô (.csv).
- [x] **Audit Logging**: Lưu vết mọi thao tác sửa đổi điểm số đảm bảo tính không thể phủ nhận (Non-Repudiation).

---

## CHƯƠNG III. KẾT LUẬN VÀ PHÂN CÔNG THỰC HIỆN

- **Võ Duy Bình (PM)**: Biên soạn cẩm nang hướng dẫn sử dụng và kiểm tra tính toàn vẹn của gói phát hành.
- **Nguyễn Minh Quốc Bảo (Member 2)**: Tối ưu hóa giao diện người dùng, đảm bảo thông báo trợ giúp (Tooltips) rõ ràng.
- **Huỳnh Trung Tính (Member 5)**: Đóng gói tài liệu và gắn thẻ Release v1.0.0 trên GitHub.
- **Trạng thái tuần 14**: Bộ phát hành Release v1.0 đã hoàn tất và sẵn sàng cho buổi bảo vệ đồ án.
