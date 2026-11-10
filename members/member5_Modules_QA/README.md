# THÔNG TIN THÀNH VIÊN 5: FUNCTIONAL MODULES DEVELOPER & QA/TESTING LEAD

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: NGUYỄN MINH QUỐC BẢO
VAI TRÒ: QA/QC TESTER (TESTER LEAD) & FUNCTIONAL MODULES DEVELOPER
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member5_Modules_QA/README.md
NGÀY CẬP NHẬT: 27/10/2026 (TUẦN 7 / 15 TUẦN HỌC KỲ 2631)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:  
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Liên Kết Mã Nguồn / Kiểm Thử |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-04** | **KAN-12** | **Kiểm Thử Điểm Danh Trùng Tiết**: Test case chặn giáo viên điểm danh sai tiết | `UC-GVBM-03` | 2 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **EPIC-04** | **KAN-13** | **Kiểm Thử Cảnh Báo Vắng $\ge 20\%$**: Test case kích hoạt cấm thi học kỳ | `UC-ADM-04` | 2 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **EPIC-05** | **KAN-16** | **Kiểm Thử 5 Ca Biên Điểm Số Thông Tư 22**: Điểm 0.0, 10.0, điểm khống, làm tròn | `UC-GVBM-04` | 3 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **EPIC-06** | **KAN-22** | **Kiểm Thử Chịu Tải 5 Request Đồng Thời**: Kiểm chứng Connection Pool không cạn kiệt | Tầng DB | 2 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **EPIC-07** | **KAN-24** | **Kiểm Thử Phòng Thủ Brute-Force Mật Khẩu**: Kiểm chứng Rate Limiter chặn HTTP 429 | Bảo mật API | 2 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **EPIC-09** | **KAN-29** | **Động Cơ Xuất Biên Lai Học Phí PDF (jsPDF)**: Sinh file PDF biên lai trường HSU | `UC-PAR-04` | 2 SP | **DONE** | [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js) |
| **EPIC-10** | **KAN-30** | **Động Cơ Xuất Bảng Điểm Lớp Excel (SheetJS)**: Định dạng `.xlsx` chuẩn cột điểm | `UC-GVCN-10` | 3 SP | **DONE** | [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js) |
| **EPIC-10** | **KAN-31** | **Động Cơ In Ấn Phiếu Điểm Học Bạ PDF (jsPDF)**: Quốc hiệu, tiêu ngữ, bảng điểm | `UC-GVCN-10`<br>`UC-STU-05` | 2 SP | **DONE** | [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js) |
| **EPIC-10** | **KAN-33** | **Bộ Kiểm Thử Tự Động QA Toàn Diện (68 Ca Tests PASS)**: Unit tests, Vitest, UAT | Cả 43 UCs | 5 SP | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) |
| **TỔNG** | — | **6 Module Lớn (Module 4, 5, 6, 7, 9, 10)** | **Kiểm thử tự động QA & Động cơ xuất báo cáo** | **23 SP** | **DONE** | **Tỷ lệ đóng góp: ~21% toàn hệ thống** |

### Hệ Thống Động Cơ Báo Cáo & Kế Hoạch QA Đồng Thời Phụ Trách:
- **Động cơ xuất báo cáo đa định dạng (Excel SheetJS, PDF jsPDF)**: [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js)
- **Bộ 68 ca kiểm thử tự động toàn diện (Node.js Test Runner)**: [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js)
- **Kịch bản kiểm thử chấp nhận người dùng UAT (15 kịch bản / 43 Use Cases)**: [UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md)
- **Cẩm nang triển khai & cài đặt hệ thống**: [DEPLOYMENT_GUIDE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/DEPLOYMENT_GUIDE.md)

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Động cơ Xuất Báo cáo Học vụ Đa định dạng (Export Engine)**:
  + Phát triển mô đun [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js):
    * Xuất file bảng tính Excel (`.xlsx`) bằng `SheetJS`, tự động căn lề và định dạng tiêu đề in đậm.
    * Xuất và in ấn Học bạ điện tử, Phiếu báo điểm và Biên lai học phí PDF chuẩn biểu mẫu Sở GD&ĐT TP.HCM bằng `jsPDF`.
  + Hoàn thành Báo cáo Chuyên đề 5 tại [CHUYENDE/Chuyên đề 5 Export.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx) (`KAN-92`).
- **Xây dựng Tài liệu Kiểm thử & Triển khai**:
  + Soạn thảo [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md) bao quát 43 Use Cases cho 5 nhóm vai trò.
  + Soạn thảo [docs/DEPLOYMENT_GUIDE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/DEPLOYMENT_GUIDE.md).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - Thời Điểm Hiện Tại: 27/10/2026)
- **Kiểm thử tích hợp hệ thống Xác thực JWT & Phân quyền RBAC**:
  + Thiết lập kịch bản kiểm thử giả lập tấn công không có Bearer Token (kết quả mong đợi: `401 Unauthorized`).
  + Thiết lập kịch bản kiểm thử Học sinh cố tình gọi Endpoint sửa điểm của Giáo viên (kết quả mong đợi: `403 Forbidden`).
  + Phối hợp cùng Member 4 hoàn thiện báo cáo [BrainStorm/Week7.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week7.md).

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 8 -> Tuần 15)
- **Tuần 8**: Hỗ trợ kiểm thử phân hệ ghi nhật ký kiểm toán [src/utils/AuditLogger.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js).
- **Tuần 9 (Trọng tâm)**: Hoàn thiện toàn diện Bộ kiểm thử tự động [tests/unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js) (`KAN-32`) và nộp Báo cáo Chuyên đề 8 `Testing.docx` (`KAN-95`).
- **Tuần 13**: Chủ trì đợt nghiệm thu kỹ thuật UAT toàn diện 43 Use Cases với hội đồng đánh giá.

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `members/member5_Modules_QA/exportEngine.js` | Động cơ xuất file Excel .xlsx và tạo trang in PDF học bạ |
| `members/member5_Modules_QA/tests/unitTestingSuite.test.js` | Bộ kịch bản kiểm thử tự động QA Unit Testing Suite |
| `docs/UAT_Testing_Plan.md` | Kịch bản kiểm thử chấp nhận người dùng UAT Plan 5 vai trò |
| `docs/DEPLOYMENT_GUIDE.md` | Cẩm nang hướng dẫn triển khai Docker và vận hành |
| `CHUYENDE/Chuyên đề 5 Export.docx` | Báo cáo nghiên cứu Chuyên đề 5 Xuất báo cáo định dạng Word |
| `CHUYENDE/Chuyên đề 8 Testing.docx` | Báo cáo nghiên cứu Chuyên đề 8 Kiểm thử phần mềm định dạng Word |
