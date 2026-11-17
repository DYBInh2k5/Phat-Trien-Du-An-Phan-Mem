# KẾ HOẠCH KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (UAT TESTING PLAN) — HTQLLH / THPT HSU

- **Dự án:** Hệ thống Quản lý Lớp học & Học vụ THPT HSU (HTQLLH / School Management System)
- **Người lập kịch bản (Lead BA / PM):** Võ Duy Bình (Member 1)
- **Trưởng nhóm kiểm thử (QA/QC Testing Lead):** Nguyễn Minh Quốc Bảo (Member 5)
- **Môn học:** Phát triển dự án phần mềm (SW320DV01) — HSU, học kỳ 2631
- **Phạm vi:** 15 kịch bản, phủ **43/43 Use Cases** trong `docs/USE_CASES.md`, cho **5 vai trò**: BGH, GVCN, GVBM, Học sinh, Phụ huynh.
- **Chuẩn nghiệp vụ:** Thông tư 22/2021/TT-BGDĐT — xếp loại **Tốt / Khá / Đạt / Chưa đạt**.

> **Quy ước trạng thái:** `PASS (auto)` = có ca kiểm thử tự động trong `members/member5_Modules_QA/tests/unitTestingSuite.test.js`; `PASS (thủ công)` = đã thao tác trên giao diện React.

---

## 1. PHẠM VI KIỂM THỬ UAT (UAT SCOPE)

Kiểm thử các màn hình giao diện React Frontend tại `members/member2_Frontend/src/pages/`:

1. **Xác thực & Phân quyền**: `LoginPage.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx`.
2. **Ban Giám Hiệu**: `BGHDashboardPage.jsx`, `StudentListPage.jsx`, `ScheduleAdminPage.jsx`, `BGHAttendanceMonitorPage.jsx`, `BGHReportCenterPage.jsx`, `SystemSettingsPage.jsx`.
3. **Giáo viên**: `GVDashboardPage.jsx`, `GradebookPage.jsx`, `AttendancePage.jsx`, `TimetablePage.jsx`.
4. **Học sinh**: `StudentGradebookPage.jsx`, `StudentSchedulePage.jsx`, `StudentExamsPage.jsx`, `StudentAttendancePage.jsx`.
5. **Phụ huynh**: `ParentCommunicationPage.jsx`.

Mỗi kịch bản đối chiếu đồng thời với bộ 200 ca kiểm thử tự động của Member 5 và đặc tả Use Case tương ứng.

---

## 2. KỊCH BẢN KIỂM THỬ UAT CHI TIẾT

### 2.1. Xác thực & Phân quyền (Auth & RBAC)

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-01` | Đăng nhập 5 vai trò | Mở Login → chọn vai trò → nhập tài khoản/mật khẩu → Đăng nhập | Nhận JWT + RoleCode, chuyển đúng Dashboard theo vai trò; sai mật khẩu → "Tài khoản hoặc mật khẩu không chính xác" (401) | `UC_AUTH_01`, `UC_AUTH_02`, `UC_AUTH_03` | PASS (thủ công) |
| `UAT-02` | Chặn truy cập trái phép | Đăng nhập HS → nhập URL `/bgh/dashboard`; gọi API không token | Chuyển `/unauthorized`; API trả 401 khi thiếu token, 403 khi sai vai trò | `UC_ADM_02` | PASS (auto) — Test 36a–36h |

### 2.2. Quản trị học vụ (BGH)

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-03` | Quản lý lớp & hồ sơ học sinh | Mở `StudentListPage` → thêm lớp → thêm HS → lọc theo lớp/trạng thái | Mã HS dạng `HSxxxxx`; không xóa được lớp còn học sinh; lọc ACTIVE / SUSPENDED / TRANSFERRED đúng | `UC_ADM_01`, `UC_ADM_03` | PASS (thủ công) |
| `UAT-04` | Phân công giảng dạy & xếp TKB | Mở `ScheduleAdminPage` → phân công GVBM → xếp tiết → thử trùng tiết/phòng | Ma trận Thứ 2–Thứ 7 hiển thị đúng; trùng tiết bị chặn kèm thông báo "Giáo viên [Tên] đã được phân công dạy lớp [Lớp] tiết [Tiết] ngày [Ngày]" | `UC_ADM_04`, `UC_GVBM_01` | PASS (thủ công) |

### 2.3. Điểm danh & chuyên cần

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-05` | Điểm danh đầu giờ (GVCN) | Mở `AttendancePage` → chọn ngày → đánh dấu 4 trạng thái → Lưu | Mặc định tất cả "Có mặt"; lưu lịch sử; HS vắng không phép hiện ghi chú ở cổng PH | `UC_GVCN_02` | PASS (auto) — Test 31a–31j |
| `UAT-06` | Điểm danh theo tiết (GVBM) | Mở `AttendancePage` → chọn tiết được phân công → lưu; thử chọn sai tiết | Lưu kèm `recorded_by`; sai tiết → 403; trùng tiết với lớp khác → 409 | `UC_GVBM_02`, `UC_GVBM_03` | PASS (auto) — Test 33a–33e |
| `UAT-07` | Cảnh báo vắng ≥ 20% | Mở `BGHAttendanceMonitorPage`; xem HS vắng 10/45 buổi và 8/45 buổi | 22.2% và đúng 20% gắn nhãn đỏ "nguy cơ cấm thi"; 17.8% không cảnh báo; HS thấy cảnh báo của mình | `UC_ADM_06`, `UC_GVCN_07`, `UC_STU_03` | PASS (auto) — Test 32a–32g |

### 2.4. Sổ điểm & khóa sổ

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-08` | Nhập điểm lưới & TBM tự động | Mở `GradebookPage` → nhập Miệng=7, 15p=8, 1Tiết=6, GK=9, CK=8 | TBM = (7+8+12+18+24)/9 = **7.7**, xếp loại **Khá**; điểm ngoài [0,10] bị từ chối; khi LOCKED mọi ô bị vô hiệu hóa | `UC_GVBM_04`, `UC_GVBM_05`, `UC_GVBM_06`, `UC_GVBM_07` | PASS (auto) — Test 35a–35g |
| `UAT-09` | Khóa sổ, mở lại, audit trail | BGH khóa sổ → GVBM thử lưu điểm → BGH mở lại kèm lý do → mở `BGHReportCenterPage` xem audit | Lưu khi LOCKED trả HTTP 400 "Sổ điểm đã bị khóa"; mở lại ghi audit; audit ghi old=7.5, new=8.0, user, IP, timestamp và không sửa/xóa được | `UC_GVBM_08`, `UC_GVBM_09`, `UC_GVBM_10`, `UC_ADM_05`, `UC_ADM_08` | PASS (auto) — Test 34a–34i |

### 2.5. Học bạ, báo cáo & xuất tệp

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-10` | Sổ điểm tổng hợp, hạnh kiểm, sổ liên lạc | GVCN mở sổ điểm tổng hợp → nhập hạnh kiểm + nhận xét → phát hành sổ liên lạc | Hạnh kiểm 4 mức Tốt/Khá/Đạt/Chưa đạt; nhận xét ≤ 500 ký tự; PH thấy đúng dữ liệu của con | `UC_GVCN_01`, `UC_GVCN_04`, `UC_GVCN_05`, `UC_GVCN_06` | PASS (thủ công) |
| `UAT-11` | Xuất Excel sổ điểm & báo cáo khen thưởng | Bấm "Xuất Excel" ở sổ điểm; BGH xuất báo cáo phổ điểm | Tệp `SoDiem_[TenLop]_[MonHoc]_[HocKy].xlsx`, header in đậm, hàng xen kẽ trắng/xám; báo cáo có phổ điểm từng môn + danh sách Xuất sắc / rèn luyện hè | `UC_GVBM_11`, `UC_GVCN_09`, `UC_ADM_07` | PASS (auto) — Test 37a–37i, 26–28 |
| `UAT-12` | In phiếu báo điểm / học bạ | Mở phiếu báo điểm → bấm "In / Lưu PDF" | Print Preview khổ A4, quốc hiệu + tiêu ngữ, đủ 6 đầu điểm, xếp loại học lực, hạnh kiểm; HS xem GPA hệ 10 và hệ 4 | `UC_GVCN_08`, `UC_STU_02` | PASS (auto) — Test 19a–19j |

### 2.6. Cổng Phụ huynh & Học sinh

| Mã | Kịch bản | Các bước | Kết quả kỳ vọng | UC | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UAT-13` | Nộp & duyệt đơn xin nghỉ | PH mở `ParentCommunicationPage` → chọn ngày, lý do (Ốm / Việc gia đình / Khác) → gửi; GVCN duyệt | Đơn `PENDING` hiện ngay cho GVCN; duyệt → `APPROVED` và điểm danh các ngày đó thành `EXCUSED`; từ chối → `REJECTED`, điểm danh giữ nguyên | `UC_PAR_04`, `UC_GVCN_03` | PASS (auto) — Test 20a–20i, 21a–21g |
| `UAT-14` | PH/HS tra cứu điểm, chuyên cần, TKB | PH đăng nhập bằng mã định danh → xem điểm, chuyên cần, sổ liên lạc; HS xem TKB & lịch thi | Chỉ thấy dữ liệu của chính con em mình; HS thấy TKB Thứ 2–Thứ 7 và lịch thi đã công bố | `UC_PAR_01`, `UC_PAR_02`, `UC_PAR_03`, `UC_STU_01` | PASS (thủ công) |
| `UAT-15` | Học phí VietQR & biên lai | PH mở tab Học phí → thanh toán → tải biên lai | Trạng thái UNPAID / PARTIAL / PAID đúng; biên lai có số duy nhất + mã tra cứu, tải được PDF; BGH cấu hình mức thu; HS nộp đơn phúc khảo | `UC_PAR_05`, `UC_PAR_06`, `UC_PAR_07`, `UC_ADM_09`, `UC_STU_04` | PASS (auto) — Test 12, 22a–22j, 25a–25e |

---

## 3. MA TRẬN TRUY XUẤT 43 USE CASES

| Phân hệ | Use Case | Kịch bản |
| :--- | :--- | :---: |
| Bảo mật | `UC_AUTH_01`, `UC_AUTH_02`, `UC_AUTH_03` | UAT-01 |
| Quản trị | `UC_ADM_01` … `UC_ADM_09` | UAT-02, 03, 04, 07, 09, 11, 15 |
| GV Bộ môn | `UC_GVBM_01` … `UC_GVBM_11` | UAT-04, 06, 08, 09, 11 |
| GV Chủ nhiệm | `UC_GVCN_01` … `UC_GVCN_09` | UAT-05, 07, 10, 11, 12, 13 |
| Phụ huynh | `UC_PAR_01` … `UC_PAR_07` | UAT-13, 14, 15 |
| Học sinh | `UC_STU_01` … `UC_STU_04` | UAT-07, 12, 14, 15 |

**Tổng: 15 kịch bản — 43/43 Use Cases.**

---

## 4. KẾT LUẬN VÀ NGHIỆM THU

- 15/15 kịch bản đã soạn đầy đủ bước thực hiện và kết quả kỳ vọng, phủ trọn 43 Use Cases của hệ thống.
- Các kịch bản gắn `PASS (auto)` được chứng minh bằng bộ **200 ca kiểm thử tự động** (0 FAIL) tại `members/member5_Modules_QA/tests/unitTestingSuite.test.js`.
- Các kịch bản `PASS (thủ công)` do nhóm ghi nhận trong các đợt kiểm thử giao diện; khi chạy nghiệm thu chính thức cần chụp màn hình đính kèm biên bản UAT.
