# THÔNG TIN THÀNH VIÊN 5: FUNCTIONAL MODULES DEVELOPER & QA/TESTING LEAD

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: NGUYỄN MINH QUỐC BẢO
VAI TRÒ: QA/QC TESTER (TESTER LEAD)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member5_Modules_QA/README.md
NGÀY CẬP NHẬT: 27/10/2026
================================================================================
```

---

## 1. VỊ TRÍ & VAI TRÒ CHÍNH TRONG HỆ THỐNG

- **Chức danh đảm nhiệm**: Trưởng nhóm Đảm bảo Chất lượng Phần mềm (QA/Testing Lead) & Chuyên viên Phát triển Phân hệ Chức năng (Functional Modules Developer).
- **Vị trí trong quy trình phát triển**:
  - Chịu trách nhiệm thiết kế, lập trình Engine xuất báo cáo học vụ (Excel & PDF), cơ chế ghi vết kiểm toán hệ thống (Audit Trail).
  - Xây dựng toàn bộ bộ kiểm thử tự động (Automated Test Suite) bảo đảm chất lượng toàn diện của hệ thống HTQLLH trước khi xuất xưởng.

---

## 2. NHIỆM VỤ ĐÃ HOÀN THÀNH TRÊN HỆ THỐNG

### 2.1 Phát Triển Engine Xuất Báo Cáo Học Vụ Đa Định Dạng (Export Engine)
- Triển khai mô đun [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js) và tích hợp vào giao diện Frontend React:
  + **Xuất Báo cáo Excel (`.xlsx`)**: Sử dụng thư viện `SheetJS`, tự động căn chỉnh độ rộng cột, định dạng tiêu đề in đậm, xuất bảng điểm chi tiết lớp học và danh sách chuyên cần.
  + **Xuất Tài liệu PDF / In ấn Học bạ**: Thiết lập mẫu in chuẩn Bộ GD&ĐT (*SỞ GIÁO DỤC VÀ ĐÀO TẠO TP.HCM - TRƯỜNG THPT HOA SEN*), hỗ trợ xuất Học bạ điện tử, Phiếu báo điểm cá nhân và Biên lai thu tiền học phí có mã tra cứu.

### 2.2 Xây Dựng Bộ Kiểm Thử Tự Động Toàn Diện (Automated QA Test Suite)
- Phát triển toàn bộ các ca kiểm thử đơn vị tại [members/member5_Modules_QA/tests/unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js):
  + **Kiểm thử Thuật toán Thông tư 22**: Kiểm thử tính chính xác của công thức tính ĐTBmhk chia 9, các trường hợp biên điểm (0.0 và 10.0), làm tròn số học và quy tắc xếp loại học lực.
  + **Kiểm thử Phân quyền RBAC**: Kiểm thử chặn trái phép khi Học sinh hoặc Phụ huynh cố tình gọi API sửa điểm.
  + **Kiểm thử Export Engine**: Kiểm thử cấu trúc mảng dữ liệu xuất Excel và định dạng HTML trang in PDF.
- Toàn bộ các ca kiểm thử đạt tỷ lệ thành công 100% (Pass Rate).

### 2.3 Triển Khai Nhật Ký Kiểm Toán Trung Tâm (Centralized Audit Logging)
- Xây dựng thành phần [AuditLogger.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js) trong tầng ứng dụng:
  + Tự động ghi nhận thông tin chi tiết mỗi khi có thao tác sửa điểm: ID người dùng, vai trò, bảng tác động, điểm cũ, điểm mới, lý do sửa điểm, địa chỉ IP và timestamp.
  + Kết nối với bảng `audit_logs` trong PostgreSQL để lưu trữ vĩnh viễn, ngăn ngừa sửa học bạ trái phép.

### 2.4 Hỗ Trợ Đóng Gói Triển Khai & Kiểm Thử Tích Hợp
- Đóng góp vào tài liệu hướng dẫn triển khai hệ thống [docs/DEPLOYMENT_GUIDE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/DEPLOYMENT_GUIDE.md).
- Tham gia cấu hình Docker Compose và kiểm thử tải hiệu năng hệ thống.

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `members/member5_Modules_QA/exportEngine.js` | Engine xử lý xuất file Excel .xlsx và tạo trang in PDF |
| `members/member5_Modules_QA/tests/unitTestingSuite.test.js` | Bộ kịch bản kiểm thử tự động QA Unit Testing |
| `src/utils/AuditLogger.js` | Lớp ghi vết nhật ký kiểm toán học vụ chống gian lận điểm |
| `BrainStorm/Week6 Export .md` | Báo cáo nghiên cứu chuyên đề Xuất Báo Cáo tuần 6 |
| `BrainStorm/Week8 Logging .md` | Báo cáo nghiên cứu chuyên đề Nhật ký Hệ thống tuần 8 |
| `BrainStorm/Week9 Testing .md` | Báo cáo nghiên cứu chuyên đề Kiểm thử Phần mềm tuần 9 |
