# BrainStorm Tuần 13: Báo Cáo Thẩm Định Kỹ Thuật & Nghiệm Thu Người Dùng UAT Toàn Diện (Acceptance Verification)

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI TUẦN 13

### 1. Mục tiêu
Thực hiện thẩm định chất lượng toàn diện (Final User Acceptance Testing - UAT) trên phiên bản tích hợp đầy đủ của hệ thống. Kiểm chứng sự ăn khớp giữa 43 Use Cases đã cam kết trong tài liệu SRS (`USE_CASES.md`) với trải nghiệm thực tế của 5 nhóm người dùng: Ban Giám hiệu, Giáo viên Chủ nhiệm, Giáo viên Bộ môn, Học sinh và Phụ huynh.

### 2. Các nhóm kịch bản nghiệm thu chính
1. **Quy trình Quản lý Học vụ BGH**: Lập thời khóa biểu, duyệt danh sách giáo viên, đóng băng khóa sổ điểm học kỳ.
2. **Quy trình Chuyên cần & Điểm danh**: GVCN điểm danh trên lớp, hệ thống tự động đẩy cảnh báo về tài khoản phụ huynh nếu học sinh vắng không phép.
3. **Quy trình Sổ điểm & Học lực**: GVBM nhập điểm thi, tự động tính TBM có trọng số, xếp loại học lực theo ngưỡng chuẩn và trích xuất bảng điểm Excel.
4. **Quy trình Dịch vụ Phụ huynh & Học sinh**: Phụ huynh nộp đơn xin nghỉ học trực tuyến, GVCN phê duyệt; tra cứu học phí và thanh toán trực tuyến.

---

## CHƯƠNG II. BẢNG TỔNG HỢP KẾT QUẢ NGHIỆM THU UAT

| Nhóm Chức Năng | Số Ca Kiểm Thử | Số Ca Đạt (Pass) | Tỷ Lệ Đạt (%) | Đánh Giá Nghiệm Thu |
| :--- | :---: | :---: | :---: | :---: |
| **Xác thực & Phân quyền (Auth & RBAC)** | 8 | 8 | 100% | Đạt chuẩn an toàn không trạng thái |
| **Quản lý Hồ sơ & Lớp học** | 10 | 10 | 100% | Dữ liệu đồng bộ và tải nhanh |
| **Sổ điểm & Đánh giá Học lực** | 12 | 12 | 100% | Tính điểm chính xác 100% theo quy chế |
| **Điểm danh & Chuyên cần** | 8 | 8 | 100% | Cảnh báo tự động gửi tức thì |
| **Trích xuất Báo cáo (Export Engine)**| 5 | 5 | 100% | File Excel & PDF hiển thị chuẩn A4 |
| **TỔNG CỘNG** | **43** | **43** | **100%** | **NGHIỆM THU XUẤT SẮC** |

---

## CHƯƠNG III. KẾT LUẬN VÀ PHÂN CÔNG THỰC HIỆN

- **Võ Duy Bình (PM / Lead BA)**: Chủ trì điều phối các buổi nghiệm thu UAT chéo giữa các thành viên.
- **Tất cả thành viên**: Đóng vai các nhóm người dùng thực tế và ghi nhận biên bản nghiệm thu kỹ thuật.
- **Trạng thái tuần 13**: Toàn bộ 43 Use Cases đã được nghiệm thu với kết quả PASS 100%, sẵn sàng đóng gói bản phát hành chính thức.
