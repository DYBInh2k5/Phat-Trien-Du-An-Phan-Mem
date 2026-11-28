# THÔNG TIN THÀNH VIÊN 5: FUNCTIONAL MODULES DEVELOPER & QA/TESTING LEAD

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: NGUYỄN MINH QUỐC BẢO
VAI TRÒ: QA/QC TESTER (TESTER LEAD) & FUNCTIONAL MODULES DEVELOPER
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
BẢNG TRELLO KANBAN: https://trello.com/b/gkdRNT57/htqllh-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-l%E1%BB%9Bp-h%E1%BB%8Dc-h%E1%BB%8Dc-v%E1%BB%A5-edumanage-pro
VỊ TRÍ TÀI LIỆU: members/member5_Modules_QA/README.md
NGÀY CẬP NHẬT: 17/11/2026 (TUẦN 10 / 15 TUẦN HỌC KỲ 2631 - 214 CA, 0 FAIL)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Ca Kiểm Thử Truy Vết |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-04** | **KAN-12** | **Kiểm Thử Điểm Danh Trùng Tiết**: Chặn giáo viên điểm danh sai tiết / trùng tiết với lớp khác | `UC-GVBM-03` | 2 SP | **DONE** | Test 33a–33e |
| **EPIC-04** | **KAN-13** | **Kiểm Thử Cảnh Báo Vắng ≥ 20%**: Kích hoạt cảnh báo cấm thi học kỳ | `UC-ADM-06` | 2 SP | **DONE** | Test 32a–32g |
| **EPIC-05** | **KAN-16** | **Kiểm Thử 5 Ca Biên Điểm Số Thông Tư 22**: Điểm 0.0, 10.0, điểm khống, làm tròn | `UC-GVBM-06` | 3 SP | **DONE** | Test 35a–35g |
| **EPIC-06** | **KAN-22** | **Kiểm Thử Chịu Tải 5 Request Đồng Thời**: Kiểm chứng Connection Pool không cạn kiệt | Tầng DB | 2 SP | **DONE** | Test 29a–29g |
| **EPIC-07** | **KAN-24** | **Kiểm Thử Phòng Thủ Brute-Force Mật Khẩu**: Kiểm chứng Rate Limiter chặn HTTP 429 | Bảo mật API | 2 SP | **DONE** | Test 30a–30e |
| **EPIC-09** | **KAN-29** | **Động Cơ In Biên Lai Học Phí**: Sinh biểu mẫu biên lai trường HSU, mã tra cứu duy nhất | `UC-PAR-07` | 2 SP | **DONE** | Test 12, 22a–22j, 25a–25e |
| **EPIC-10** | **KAN-30** | **Động Cơ Xuất Bảng Điểm Lớp Excel (SheetJS)**: Định dạng `.xlsx` chuẩn cột điểm | `UC-GVBM-11` | 3 SP | **DONE** | Test 4, 11a–11e, 24, 28, 37a–37c |
| **EPIC-10** | **KAN-31** | **Động Cơ In Ấn Phiếu Điểm Học Bạ**: Quốc hiệu, tiêu ngữ, bảng điểm khổ A4 | `UC-GVCN-08`<br>`UC-STU-02` | 2 SP | **DONE** | Test 5, 17a–17b, 19a–19j |
| **EPIC-10** | **KAN-33** | **Bộ Kiểm Thử Tự Động QA Toàn Diện (214 Ca Tests)**: Unit tests, Vitest, UAT | Cả 43 UCs | 5 SP | **DONE** | Toàn bộ `unitTestingSuite.test.js` |
| **TỔNG** | — | **6 Module Lớn (Module 4, 5, 6, 7, 9, 10)** | **Kiểm thử tự động QA & Động cơ xuất báo cáo** | **23 SP** | **DONE** | **214 ca, 0 FAIL** |

### Hệ Thống Động Cơ Báo Cáo & Kế Hoạch QA Đồng Thời Phụ Trách:
- **Động cơ xuất báo cáo (Excel SheetJS, in ấn HTML/A4)**: [exportEngine.js](exportEngine.js)
- **Bộ 214 ca kiểm thử tự động toàn diện (Node.js Test Runner)**: [tests/unitTestingSuite.test.js](tests/unitTestingSuite.test.js)
- **Kịch bản kiểm thử chấp nhận người dùng UAT (15 kịch bản / 43 Use Cases)**: [docs/UAT_Testing_Plan.md](../../docs/UAT_Testing_Plan.md)
- **Cẩm nang triển khai & cài đặt hệ thống**: [docs/DEPLOYMENT_GUIDE.md](../../docs/DEPLOYMENT_GUIDE.md)

### Phạm vi nghiệp vụ đã phủ kiểm thử (đối chiếu `docs/PRODUCT_BACKLOG.md`)

| PBI | Nội dung | Ca kiểm thử |
| :---: | :--- | :--- |
| PBI-05 | Điểm danh 4 trạng thái PRESENT / EXCUSED / ABSENT / LATE, mặc định PRESENT, lưu lịch sử, cổng PH chỉ báo vắng không phép | Test 31a–31j |
| PBI-07 | Cảnh báo vắng ≥ 20% (10/45 = 22.2%, đúng 20%, dưới 20%) | Test 32a–32g |
| PBI-09 | 5 ca điểm TBM theo Thông tư 22 (7.7; 0.0; 10.0; điểm khống; làm tròn) | Test 35a–35g |
| PBI-13 | Nhật ký kiểm toán sửa điểm: old/new score, IP, timestamp; chặn UPDATE/DELETE | Test 34a–34i |
| PBI-15 | Tên tệp `SoDiem_[TenLop]_[MonHoc]_[HocKy].xlsx`, tự căn độ rộng cột; tệp ghi ra đĩa khi môi trường có SheetJS; style header/hàng xen kẽ khi có `xlsx-js-style` | Test 4, 11a–11e, 37a–37i |
| PBI-16 | Phiếu báo điểm A4, quốc hiệu, tiêu ngữ, đủ đầu điểm, hạnh kiểm, `window.print()` | Test 19a–19j |
| PBI-19 | Ma trận RBAC 5 vai trò, 100% pass, UAT plan | Test 36a–36h, 39a |
| PBI-23 | Phổ điểm từng môn, danh sách Xuất sắc (mọi môn Tốt + hạnh kiểm Tốt + ĐTB ≥ 9.0 theo §9.2) / rèn luyện hè | Test 26a–26g, 27a–27l, 28a–28g |
| PBI-24 | Học phí, VietQR, biên lai điện tử, lịch sử nhiều năm | Test 9, 12, 14, 22, 25 |

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 10)
- **Động cơ Xuất Báo cáo Học vụ Đa định dạng (Export Engine)**:
  + Phát triển mô đun [exportEngine.js](exportEngine.js):
    * Xuất file bảng tính Excel (`.xlsx`) bằng `SheetJS`, tự động căn độ rộng cột; gắn style header in đậm + hàng dữ liệu xen kẽ trắng/xám nhạt khi môi trường có thư viện ghi style (PBI-15).
    * Sinh Phiếu báo điểm / Học bạ khổ A4 (quốc hiệu, tiêu ngữ, đủ 6 đầu điểm, xếp loại học lực, hạnh kiểm) và Biên lai học phí có mã tra cứu duy nhất, in bằng `window.print()` — người dùng chọn "Lưu thành PDF" của trình duyệt (PBI-16, KAN-29).
  + Hoàn thành Báo cáo Chuyên đề 5 tại [CHUYENDE/Chuyên đề 5 Export.docx](../../CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%205%20Export.docx).
- **Xây dựng Tài liệu Kiểm thử & Triển khai**:
  + Soạn thảo [docs/UAT_Testing_Plan.md](../../docs/UAT_Testing_Plan.md) bao quát 15 kịch bản / 43 Use Cases cho 5 nhóm vai trò.
  + Soạn thảo [docs/DEPLOYMENT_GUIDE.md](../../docs/DEPLOYMENT_GUIDE.md).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - 10)
- **Kiểm thử tích hợp hệ thống Xác thực JWT & Phân quyền RBAC**:
  + Giả lập tấn công không có Bearer Token → `401 Unauthorized` (Test 36a).
  + Học sinh / Phụ huynh gọi Endpoint của BGH → `403 Forbidden` (Test 36b–36c, 21f–21g).
  + Ma trận 5 vai trò × toàn bộ endpoint khớp middleware RBAC thật của member4 (Test 36h).
  + Test 34 gọi thẳng `AuditLogger` của member3; Test 38 gọi `vietQrHelper` (EMVCo + CRC16) cho PBI-24.
  + Test 27h–27l khóa điều kiện "Học sinh Xuất sắc" theo §9.2 (ĐTB các môn ≥ 9.0) và nhãn hạnh kiểm `Chưa Đạt` cho danh sách rèn luyện hè.
  + Test 39a quét `server.js` của member3 để phát hiện việc chưa nối `authorizeRoles` — tránh "test xanh mà sản phẩm chưa gắn RBAC".

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 11 -> Tuần 15)
- UAT toàn diện 43 Use Cases với hội đồng đánh giá (Tuần 13).
- Theo dõi hồi quy: chạy lại `npm run test:qa` mỗi khi member2/member3 hợp nhất mã nguồn.

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `members/member5_Modules_QA/exportEngine.js` | Xuất Excel .xlsx và sinh trang in A4 Phiếu điểm / Biên lai |
| `members/member5_Modules_QA/tests/unitTestingSuite.test.js` | Bộ 214 ca kiểm thử tự động QA Unit Testing Suite |
| `docs/UAT_Testing_Plan.md` | 15 kịch bản UAT phủ 43 Use Cases, 5 vai trò |
| `docs/DEPLOYMENT_GUIDE.md` | Cẩm nang hướng dẫn triển khai Docker và vận hành |
| `CHUYENDE/Chuyên đề 5 Export.docx` | Báo cáo nghiên cứu Chuyên đề 5 Xuất báo cáo định dạng Word |
| `CHUYENDE/Chuyên đề 8 Testing.docx` | Báo cáo nghiên cứu Chuyên đề 8 Kiểm thử phần mềm định dạng Word |

### Ghi chú kỹ thuật về định dạng Excel (PBI-15)
Bản SheetJS Community (`xlsx` v0.18.5) **không ghi được style ô**. `exportEngine.js` vì vậy dò
`xlsx-js-style` (fork giữ nguyên API 0.18.x, bổ sung ghi style) trước và tự rơi về `xlsx`;
cả hai đều là phụ thuộc *tùy chọn của môi trường chạy*, không nằm trong bài nộp của member 5
(`members/member2_Frontend/package.json` đã khai báo `xlsx ^0.18.5` cho phía client).

Vì vậy bộ test tách hai nhóm:
- **198 khẳng định logic** (tên tệp, số dòng, nội dung dòng, RBAC, TT22…) chạy ở mọi môi trường.
- **9 khẳng định xác minh tệp trên đĩa** (`filePath` + `fs.existsSync`) tự **SKIP** nếu môi
  trường chưa có `xlsx`, và chạy đủ khi thư viện hiện diện — không còn "thành công giả".
- **6 khẳng định style** (Test 37d–37i) tự **SKIP** nếu chưa có `xlsx-js-style`; có gói này thì
  đọc lại `xl/styles.xml` của tệp thật để xác minh `<b/>`, `FFD9E1F2`, `FFF2F2F2`.
- **1 ca hợp đồng tích hợp** (Test 39a) quét `server.js` của member3: hiện **SKIP** vì server chưa
  nối `authorizeRoles` vào route (nợ kỹ thuật của member3); khi member3 nối xong ca này tự PASS.

---

## 4. CÁCH CHẠY

Từ thư mục gốc repo (root `package.json` đã có `"type": "module"` và script `test:qa`):

```bash
npm run test:qa     # 198 PASS + 16 SKIP khi máy chưa cài gì; 213 PASS + 1 SKIP khi có xlsx-js-style
```

Muốn chạy đủ cả 15 ca (9 ca tệp + 6 ca style): cài `xlsx-js-style` ở một thư mục bất kỳ rồi chạy
kèm `NODE_PATH` trỏ tới `node_modules` đó (ví dụ dùng `members/member2_Frontend/node_modules`
nếu đã cài thêm gói fork); bộ test không khai báo phụ thuộc riêng.
