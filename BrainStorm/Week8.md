# TIẾN ĐỘ THỰC HIỆN DỰ ÁN - TUẦN 8 (02/11/2026 - 08/11/2026)
## CHUYÊN ĐỀ 7: NHẬT KÝ KIỂM TOÁN (AUDIT LOGGING), ĐỒNG BỘ DUAL-REMOTE (GITHUB & BITBUCKET), TÁI CẤU TRÚC MENU VÀ BƠM DỮ LIỆU ĐẦY ĐỦ (FULL SEED DATA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
GIAI ĐOẠN: TUẦN 8 / 15 TUẦN NGHIÊN CỨU & PHÁT TRIỂN
THỜI ĐIỂM CẬP NHẬT: 06/11/2026 (TUẦN 8 HOÀN THÀNH XUẤT SẮC 100%)
TÀI LIỆU CHUYÊN ĐỀ CHI TIẾT: BrainStorm/Week8 Logging .md
KHO LƯU TRỮ GITHUB: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
KHO LƯU TRỮ BITBUCKET: https://bitbucket.org/codyisme27205/pt_da_pm
MÃ THẺ JIRA: KAN-72 (Done / Đã Hoàn Thành) & KAN-27 (Done)
================================================================================
```

---

## 1. MỤC TIÊU & NHIỆM VỤ TRỌNG TÂM TUẦN 8

Trong Tuần 8 (02/11/2026 - 08/11/2026), nhóm đã hoàn thành toàn diện 5 mục tiêu kỹ thuật và quản trị đồ án cốt lõi:

1. **Chuyên đề 7 - Hệ thống Ghi nhật ký tập trung (Centralized Audit Logging & Rate Limiting)**:
   - Nghiên cứu và triển khai cơ chế Audit Trail chống chối bỏ trách nhiệm (Non-Repudiation) cho các giao dịch nhạy cảm: sửa điểm Thông tư 22, chốt khóa sổ điểm, duyệt đơn xin nghỉ, thanh toán học phí.
   - Tích hợp lớp phòng thủ Rate Limiting (`express-rate-limit`) ngăn chặn tấn công vét cạn và tấn công DoS/DDoS tầng ứng dụng.
2. **Thiết lập Đồng bộ Song song 2 Kho lưu trữ Git (Dual-Remote GitHub & Bitbucket)**:
   - Kết nối thêm Bitbucket Repository: `https://bitbucket.org/codyisme27205/pt_da_pm.git` song song với GitHub Repository: `https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem.git`.
   - Cấu hình điều phối `origin` với 2 URL `push` đồng thời: chỉ cần chạy 1 lệnh duy nhất `git push origin main`, mã nguồn tự động cập nhật lên cả GitHub và Bitbucket.
3. **Sửa lỗi Điều hướng & Định tuyến Backend (Route 404 Dashboard BGH)**:
   - Cô lập nguyên nhân lỗi `GET /api/dashboard/bgh not found` do container Docker chạy image cũ.
   - Chuyển đổi mô hình vận hành Backend trực tiếp trên máy chủ lưu trữ (Host Node.js) để mã nguồn cập nhật tức thời (Hot-Reload) kết nối đến CSDL PostgreSQL Docker (Port `5434`).
4. **Bơm Dữ liệu Mẫu Toàn diện (Full Seed Data 100% Coverage)**:
   - Nâng cấp `dataInitializer.js`, khởi tạo dữ liệu thực tế cho 100% các bảng còn thiếu:
     - Thời khóa biểu (`schedules` & `schedule_templates`): 25 tiết học tuần (Thứ 2 - Thứ 6, Tiết 1 - 5 lớp 10A1).
     - Tin tức & Thông báo (`notifications`): 4 thông báo phân quyền toàn trường.
     - Sổ liên lạc điện tử (`parent_messages`): 5 chuỗi hội thoại giữa GVCN và Phụ huynh.
     - Cấu hình phân quyền hệ thống (`system_settings`): Ma trận quyền RBAC mặc định.
     - Học sinh (`students`): 12 học sinh chuẩn danh tính trên 3 lớp (10A1, 10A2, 11B1).
     - Bảng điểm (`grade_books`): 16 bản ghi điểm thành phần (Toán, Văn, Anh) chuẩn Thông tư 22.
     - Điểm danh (`attendances`): 14 bản ghi chuyên cần có mặt/nghỉ phép.
     - Đơn xin nghỉ phép (`leave_requests`): 4 đơn xin nghỉ trực tuyến (đã duyệt và chờ duyệt).
     - Học phí (`tuitions`): 12 hóa đơn học phí kèm mã biên lai thu tiền điện tử.
     - Khóa sổ điểm (`grade_book_closures`): 2 bản ghi chốt sổ (10A1 chờ duyệt, 10A2 đã khóa).
     - Tài khoản mẫu (`users`): 5 tài khoản demo tương ứng 5 vai trò (mật khẩu chuẩn hóa).
5. **Tái cấu trúc Thanh Menu Điều hướng (Grouped Navigation Sidebar)**:
   - Tái thiết kế toàn bộ `Sidebar.jsx` sang mô hình phân nhóm logic rõ ràng (`ROLE_NAV_GROUPS`), có tiêu đề phân đoạn (Section Headers) trực quan, chuẩn UI/UX Dashboard hiện đại cho từng vai trò.
   - Sửa lỗi Vite ESM runtime missing export `ROLE_LABELS` trong `roles.js`.

---

## 2. BẢNG PHÂN CÔNG & ĐÁNH GIÁ ĐÓNG GÓP 5 THÀNH VIÊN TUẦN 8

| STT | Mã Thẻ Jira | Họ và Tên | Vai Trò Đảm Nhiệm | Nhiệm Vụ Phân Công Cụ Thể Tuần 8 | Trạng Thái Đóng Góp |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Điều phối tiến độ tuần 8, thiết lập Dual-Remote Git (GitHub + Bitbucket), chuẩn hóa dữ liệu học vụ 11 bảng, cập nhật toàn bộ tài liệu `.md`. | 100% Hoàn thành (Xuất sắc) |
| 2 | [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend** | Tái cấu trúc thanh Sidebar nhóm đa cấp cho 5 Roles, khắc phục lỗi runtime màn hình trắng `ROLE_LABELS`, cập nhật giao diện hiển thị dữ liệu mới. | 100% Hoàn thành (Xuất sắc) |
| 3 | [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend & DBA** | Thêm cột `teacher_name` vào `grade_books`, mở rộng `dataInitializer.js` nạp đầy đủ dữ liệu CSDL PostgreSQL, xử lý các endpoint dashboard BGH. | 100% Hoàn thành (Xuất sắc) |
| 4 | [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security** | Hoàn thiện Chuyên đề 7 Audit Logging, tích hợp Rate Limiter và bộ lọc truy cập bảo mật cho API, xác thực quyền truy cập thông báo cho 5 vai trò. | 100% Hoàn thành (Xuất sắc) |
| 5 | [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester (QA Lead)** | Kiểm thử xác thực tự động: Backend 68/68 test cases PASS, Frontend Vitest 13/13 test cases PASS, kiểm tra tính toàn vẹn dữ liệu nạp mới. | 100% Hoàn thành (Xuất sắc) |

---

## 3. CHI TIẾT CÁC THAY ĐỔI KỸ THUẬT CỐT LÕI (CHANGELOG)

### 3.1 Cấu hình Git Dual-Remote (Đồng bộ GitHub & Bitbucket)
Đã cấu hình Git Remote `origin` với 2 URL push song song:
```bash
# Kiểm tra cấu hình remote:
git remote -v
# origin  https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem.git (fetch)
# origin  https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem.git (push)
# origin  https://bitbucket.org/codyisme27205/pt_da_pm.git (push)
# bitbucket  https://bitbucket.org/codyisme27205/pt_da_pm.git (fetch/push)

# Lệnh đẩy mã nguồn lên cả 2 nơi cùng lúc:
git push origin main
```

### 3.2 Tái cấu trúc Menu Sidebar Frontend (`Sidebar.jsx`)
Menu đã được nhóm thành các phân đoạn chức năng rõ ràng theo từng vai trò:
- **BGH (Ban Giám Hiệu)**:
  - `TỔNG QUAN`: Tổng quan (Dashboard)
  - `HỌC VỤ & ĐÀO TẠO`: Quản lý Học sinh, Lớp học & Phân công, Sổ điểm & Khóa sổ, Thời khóa biểu
  - `TÀI CHÍNH & KẾT NỐI`: Quản lý Học phí, Quản lý Tin tức
  - `HỆ THỐNG`: Báo cáo & Thống kê, Phân quyền & Cài đặt
- **GVCN (Giáo Viên Chủ Nhiệm)**:
  - `TỔNG QUAN`: Tổng quan lớp (Dashboard)
  - `CÔNG TÁC CHỦ NHIỆM`: Điểm danh lớp, Bảng điểm tổng hợp, Duyệt đơn nghỉ học
  - `KẾT NỐI PHỤ HUYNH`: Kênh trao đổi PH, Lịch báo giảng
- **GV (Giáo Viên Bộ Môn)**:
  - `TỔNG QUAN`: Tổng quan (Dashboard)
  - `HỌC VỤ & LỊCH DẠY`: Nhập điểm môn học, Điểm danh tiết dạy, Lịch dạy cá nhân
  - `TIN TỨC`: Thông báo nhà trường
- **HS (Học Sinh)**:
  - `KẾT QUẢ HỌC TẬP`: Tra cứu bảng điểm cá nhân
  - `LỊCH TRÌNH & THI`: Lịch học cá nhân, Lịch thi học kỳ
  - `TIN TỨC`: Thông báo nhà trường
- **PH (Phụ Huynh)**:
  - `TỔNG QUAN`: Tổng quan (Dashboard)
  - `THEO DÕI CON EM`: Điểm số con em, Chuyên cần & Điểm danh, Đơn xin nghỉ phép
  - `TƯƠNG TÁC & HỌC PHÍ`: Tra cứu học phí, Trao đổi với GVCN, Thông báo chung

### 3.3 Danh sách Tài khoản Kiểm thử Đã Nạp Dữ Liệu Sẵn (Seed Data Accounts)

| Vai trò | Tên đăng nhập | Mật khẩu | Họ và Tên | Phạm vi Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Ban Giám Hiệu** | `admin` | `admin123` | Thầy Hiệu Trưởng | Toàn quyền quản trị, duyệt khóa sổ, cấu hình hệ thống |
| **Giáo Viên Chủ Nhiệm** | `gvcn01` | `gvcn123` | Cô Trần Thị Mai | Chủ nhiệm lớp 10A1, điểm danh, duyệt đơn xin nghỉ, nhận xét |
| **Giáo Viên Bộ Môn** | `gv01` | `gv123` | Thầy Nguyễn Văn An | Dạy môn Toán, nhập điểm thành phần, điểm danh tiết học |
| **Học Sinh** | `hs001` | `hs123` | Nguyễn Thị Ánh | Lớp 10A1, tra cứu điểm, thời khóa biểu, lịch thi học kỳ |
| **Phụ Huynh** | `ph001` | `ph123` | Phụ huynh em Ánh | Sổ liên lạc, xem điểm con, nộp đơn nghỉ phép, đóng học phí |

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (QA TEST RESULTS)

1. **Backend Unit & Integration Tests**:
   - Công cụ: `node:test` (Native Node Test Runner)
   - Tệp kiểm thử: `members/member5_Modules_QA/tests/unitTestingSuite.test.js`
   - Kết quả: **68/68 tests PASS (100%)**, thời gian chạy 52ms.
2. **Frontend Component & Routing Tests**:
   - Công cụ: `vitest` + React Testing Library
   - Thư mục: `members/member2_Frontend`
   - Kết quả: **13/13 tests PASS (100%)**, 2 test files.
3. **Frontend Production Build**:
   - Lệnh: `npm run build`
   - Kết quả: **Thành công 100% (0 errors)**, 73 modules transformed.

---

## 5. KẾ HOẠCH BÀN GIAO & BƯỚC TIẾP THEO (TUẦN 9)

- Tiếp tục củng cố và hoàn thiện phân hệ Báo cáo kiểm thử tự động toàn diện (Chuyên đề 8 - Testing).
- Chuẩn bị bước sang Tuần 10: Tích hợp Hệ thống, Kiểm thử An toàn Thông tin và phòng thủ lỗ hổng OWASP Top 10.
- Duy trì đồng bộ tự động 100% giữa GitHub và Bitbucket cho mỗi commit.

