# TIẾN ĐỘ THỰC HIỆN DỰ ÁN - TUẦN 10 (16/11/2026 - 22/11/2026)
## CHUYÊN ĐỀ TÍCH HỢP TOÀN HỆ THỐNG, KIỂM THỬ AN NINH BẢO MẬT & PHÒNG THỦ LỖ HỔNG THEO TIÊU CHUẨN OWASP (SECURITY HARDENING & FULL SYSTEM INTEGRATION)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
GIAI ĐOẠN: BƯỚC VÀO TUẦN 10 / 15 TUẦN NGHIÊN CỨU & PHÁT TRIỂN
THỜI ĐIỂM CẬP NHẬT: 14/11/2026 (KHỞI ĐỘNG VÀ TRIỂN KHAI TUẦN 10)
TÀI LIỆU CHUYÊN ĐỀ LIÊN QUAN: BrainStorm/Week10.md & CHUYENDE/Chuyên đề 6 Authentication Authorization.docx
KHO LƯU TRỮ GITHUB: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
KHO LƯU TRỮ BITBUCKET: https://bitbucket.org/codyisme27205/pt_da_pm
BẢNG JIRA KANBAN BOARD: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
KHÔNG GIAN DỰ ÁN CLICKUP: https://app.clickup.com/1100320000025585/v/s/1100320000109903
CANVA SLIDE TRỰC TUYẾN: https://www.canva.com/d/75iOEEpReWqgOuN
================================================================================
```

---

## 1. BỐI CẢNH DỰ ÁN & MỤC TIÊU TRỌNG TÂM BƯỚC VÀO TUẦN 10

Tính đến thời điểm hiện tại (**14/11/2026**), nhóm 2 đã hoàn thành trọn vẹn 100% các cột mốc nền tảng của 9 tuần trước đó:
- **Tuần 1 - 7**: Hoàn thiện Phân tích Yêu cầu SRS, Thiết kế UX/UI Tailwind SPA React, CSDL PostgreSQL 3NF 8 bảng chuẩn hóa, Kiến trúc Clean Architecture 4 tầng, Bộ mẫu thiết kế phần mềm (Unit of Work, Repository, Singleton Pool), Động cơ xuất báo cáo Export Engine (Excel `.xlsx`, PDF `.pdf`), Xác thực Stateless JWT & Phân quyền RBAC 5 vai trò kèm 1-Click Demo Login.
- **Tuần 8**: Hệ thống Ghi nhật ký kiểm toán tập trung (`AuditLogger.js`), Thiết lập cơ chế đồng bộ song song Dual-Remote Git (GitHub & Bitbucket), Tái cấu trúc Menu Sidebar nhóm đa cấp và Bơm nạp 100% dữ liệu mẫu (Full Seed Data 11 bảng).
- **Tuần 9**: Thực thi hoàn tất bộ kiểm thử tự động QA Testing Suite (Backend 68/68 test cases PASS, Frontend Vitest 13/13 test cases PASS, Vite build đạt 100%), Xuất bản Cẩm nang kết nối PostgreSQL Extension trên IDE (`docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md`), và Chuẩn hóa toàn bộ hồ sơ đặc tả Use Case [docs/USE_CASES.md] theo chuẩn RUP Cockburn Fully-Dressed cùng tài liệu [docs/UML_DIAGRAMS.md] theo chuẩn OMG UML 2.5.

### Các Mục Tiêu Cốt Lõi Khi Bước Vào Tuần 10 (16/11/2026 - 22/11/2026):
1. **Tích hợp hệ thống toàn diện (End-to-End System Integration)**:
   - Ghép nối thông suốt 3 phân tầng: Giao diện Web SPA (React 18 + Vite, Port 5173) $\leftrightarrow$ Máy chủ Backend RESTful API (Node.js Express Clean Architecture, Port 8081) $\leftrightarrow$ Cơ sở dữ liệu quan hệ PostgreSQL 15 (Docker container `htqllh_postgres`, Port 5434).
   - Kiểm tra tương tác đồng bộ dữ liệu thời gian thực giữa 5 vai trò (BGH duyệt mở sổ $\rightarrow$ GVBM sửa điểm $\rightarrow$ GVCN xem tổng hợp $\rightarrow$ Học sinh & Phụ huynh tra cứu tức thì).
2. **Kiểm thử An ninh & Phòng thủ Lỗ hổng Web theo Tiêu chuẩn OWASP Top 10 (Security Hardening)**:
   - **A01: Broken Access Control (Kiểm soát truy cập bị phá vỡ)**: Kiểm tra chặn triệt để lỗ hổng BOLA/IDOR (Học sinh/Phụ huynh chỉ xem được dữ liệu của chính mình, Giáo viên chỉ sửa lớp được phân công, ngăn chặn gọi cURL/Postman can thiệp trái phép).
   - **A02: Cryptographic Failures (Lỗi mã hóa)**: Bảo vệ mật khẩu người dùng với muối băm `bcrypt` (Salt rounds = 10), token JWT ký bằng thuật toán HS256 có hạn 24 giờ, truyền thông HTTPS an toàn.
   - **A03: Injection (Lỗ hổng Tiêm nhiễm)**: Đảm bảo 100% câu lệnh SQL trong toàn bộ các Repositories đều dùng Prepared Statements tham số hóa `$1, $2`, triệt tiêu hoàn toàn nguy cơ SQL Injection.
   - **A05: Security Misconfiguration (Cấu hình an ninh sai lệch)**: Bổ sung gói bảo mật `helmet` thiết lập các HTTP Security Headers (Content-Security-Policy, X-Frame-Options chống Clickjacking, X-Content-Type-Options chống MIME-sniffing).
   - **A07: Identification and Authentication Failures (Lỗi xác thực & Định danh)**: Tích hợp bộ giới hạn tần suất gọi API `express-rate-limit` chống tấn công vét cạn mật khẩu (Brute-Force) và DoS tầng ứng dụng.
3. **Giám sát Tính Bất Biến của Nhật Ký Kiểm Toán (Audit Trail Integrity)**:
   - Đảm bảo mọi giao dịch thay đổi dữ liệu nhạy cảm (sửa điểm Thông tư 22, mở khóa sổ điểm, duyệt đơn nghỉ học, thanh toán học phí) đều được ghi vết tự động vào bảng `audit_logs` với đầy đủ IP, User ID, giá trị cũ (`old_values`), giá trị mới (`new_values`). Bảng nhật ký là chỉ đọc (Append-only).
4. **Chuẩn bị Bước Đệm Cho Tuần 11 (Performance Optimization & Redis Caching)**:
   - Khảo sát các câu truy vấn tải điểm nặng và thiết lập kế hoạch đánh chỉ mục Composite Indexes trên PostgreSQL cùng chiến lược Cache-Aside với Redis.

---

## 2. BẢNG PHÂN CÔNG NHIỆM VỤ & ĐÁNH GIÁ KPI 5 THÀNH VIÊN BƯỚC VÀO TUẦN 10

Theo quy chuẩn quản trị dự án phần mềm trên Jira Cloud (`KAN Board ID 2`) và ClickUp (`Group 2_PTDAPM`), 5 thành viên được phân công nhiệm vụ cụ thể cho Tuần 10:

| STT | Mã Thẻ Jira | Họ và Tên | Vai Trò Kỹ Thuật | Nhiệm Vụ Trọng Tâm Tuần 10 (Security & Integration) | Tỷ Lệ Đóng Góp | Trạng Thái Jira |
| :---: | :---: | :--- | :--- | :--- | :---: | :---: |
| 1 | [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Điều phối tiến độ Tuần 10, đồng bộ lộ trình trên Jira & ClickUp; thiết lập Deadline & Assignee chuẩn xác; biên soạn Cẩm nang lập trình & sửa code; hoàn tất 100% 5 PBIs phụ trách (`KAN-114`, `KAN-117`, `KAN-134`, `KAN-137`, `KAN-138`). | 20% (100% KPI) | **DONE (100%)** |
| 2 | [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend (UI/UX)** | Rà soát an ninh giao diện Web SPA, làm sạch dữ liệu đầu vào (Input Sanitization) chống XSS trên các Form nhập điểm và đơn nghỉ học, xử lý các phản hồi lỗi HTTP 401/403/409 hiển thị trực quan. | 20% (100% KPI) | **IN PROGRESS** |
| 3 | [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend & DBA** | Rà soát toàn bộ 8 Repositories bảo đảm 100% câu truy vấn SQL an toàn tham số hóa `$1, $2`, kiểm tra tính toàn vẹn giao dịch nguyên tử Unit of Work khi có lỗi phát sinh trong giao dịch đồng thời. | 20% (100% KPI) | **IN PROGRESS** |
| 4 | [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security (Lead)** | Chủ trì Chuyên đề Bảo mật Tuần 10: Cấu hình `express-rate-limit`, tích hợp `helmet`, kiểm thử phòng thủ các lỗ hổng OWASP Top 10 (chống tấn công cURL bỏ qua giao diện, kiểm soát Token JWT). | 20% (100% KPI) | **IN PROGRESS** |
| 5 | [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester (QA Lead)** | Xây dựng bộ kịch bản kiểm thử an ninh (Security Test Cases), kiểm thử thâm nhập (Penetration Testing) trên các Endpoint nhạy cảm `/api/gradebook/save`, `/api/gradebook/lock`, `/api/tuition/pay`. | 20% (100% KPI) | **IN PROGRESS** |

---

## 3. CHI TIẾT CÁC GIẢI PHÁP PHÒNG THỦ AN NINH KỸ THUẬT (OWASP SECURITY HARDENING)

### 3.1. Hàng Rào Chống Tấn Công Vét Cạn (Brute-Force Attack Defense)
Áp dụng middleware `express-rate-limit` cho endpoint đăng nhập nhạy cảm:
```javascript
// members/member3_Backend_DB/school-management-nodejs/server.js
const rateLimit = require('express-rate-limit');

// Bộ giới hạn tần suất đăng nhập: Tối đa 5 lần thử sai trong 15 phút
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 yêu cầu đăng nhập từ 1 địa chỉ IP
  message: {
    success: false,
    message: 'Bạn đã đăng nhập thất bại quá 5 lần. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản!'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', authRateLimiter);
```

### 3.2. Thiết Lập Bộ Tiêu Chuẩn HTTP Security Headers Với Helmet
Tích hợp `helmet` bảo vệ các điểm nút API Backend:
```javascript
const helmet = require('helmet');

// Tích hợp Helmet bảo vệ Header ứng dụng
app.use(helmet({
  contentSecurityPolicy: false, // Để tương thích với giao diện React Vite nội bộ
  crossOriginEmbedderPolicy: false
}));
```

### 3.3. Phòng Thủ 100% Lỗ Hổng SQL Injection Bằng Prepared Statements
Toàn bộ truy vấn CSDL trong `src/repositories/` đều tuân thủ quy tắc tham số hóa:
```javascript
// TUYỆT ĐỐI KHÔNG GHÉP CHUỖI: `SELECT * FROM users WHERE username = '${username}'` (LỖ HỔNG SQLi)
// CHUẨN KỸ THUẬT AN TOÀN ĐƯỢC ÁP DỤNG TRONG HTQLLH:
const result = await this.db.query(
  'SELECT id, username, password_hash, full_name, role, status FROM users WHERE username = $1',
  [username]
);
```

### 3.4. Kiểm Soát Quyền Truy Cập Chống Leo Thang Đặc Quyền (BOLA / IDOR Defense)
- Endpoint xem điểm cá nhân `/api/gradebook/student` chỉ giải mã `userId` từ token JWT đã được xác thực, không cho phép truyền `studentId` qua query string để xem trộm điểm học sinh khác.
- Endpoint khóa sổ điểm và sửa điểm bắt buộc kiểm tra phân công giảng dạy trong CSDL, ngăn chặn giáo viên sửa điểm môn học hoặc lớp học không thuộc quyền quản lý.

---

## 4. TỔNG HỢP TIẾN ĐỘ ĐỒNG BỘ CÁC CÔNG CỤ QUẢN TRỊ DỰ ÁN & KẾT QUẢ MERGE PR TUẦN 10

### 4.1. Kết Quả Rà Soát & Hợp Nhất 2 Pull Requests Mới Nhất (17/11/2026):
1. **Pull Request #7 (Huỳnh Trung Tính & Võ Hoàng Sơn)**:
   - **Chức năng**: Thanh toán Học phí VietQR Động (chuẩn EMVCo NAPAS, CRC16), đối soát tức thì, xử lý tranh chấp 1 phiên duy nhất (Idempotency) và xuất biên lai PDF in ấn A4 chuẩn mực SD-04 trên Cổng Phụ Huynh (`ParentPortalPage.jsx` & `VietQrPaymentModal.jsx`).
   - **Backend**: Bổ sung `TuitionController`, `TuitionRepository`, `PaymentRepository`, `vietQrHelper.js`, và bộ kiểm thử `tuition-payment.test.js`.
   - **Đã sửa lỗi**: Chuẩn hóa lớp `AuditLogger.log` trong `school-management-nodejs` hỗ trợ cả 2 kiểu truyền tham số, khắc phục triệt để lỗi ghi log `undefined` khi ghi nhận giao dịch thanh toán.
2. **Pull Request #8 (Trần Quang Vinh - Member 4)**:
   - **Chức năng**: Tái cấu trúc toàn diện phân hệ Xác thực, Phân quyền RBAC & Nghiệp vụ Sổ điểm theo chuẩn Clean Architecture 4 tầng (Express 5 + PostgreSQL).
   - **Hồ sơ kỹ thuật**: Xuất bản 9 tệp tài liệu kiến trúc chuyên sâu tại `members/member4_Logic_Security/docs/` (Mermaid diagrams, Clean Architecture, RESTful API, RBAC, Gradebook logic).
   - **Đã khắc phục**: Cài đặt trọn vẹn 161 gói npm phụ thuộc, cấu hình kiểm thử đơn vị độc lập không phụ thuộc DB sống, đạt **94/94 unit tests PASS**.
3. **Đồng Bộ Kiểm Thử Tập Trung Toàn Hệ Thống**:
   - Cập nhật `package.json` gốc với lệnh `npm test` chạy liên hoàn toàn bộ test suites của Backend CSDL (`79/79 PASS`), Logic & Security (`94/94 PASS`), QA System & Use Cases (`136/136 PASS`), cùng Frontend Vitest (`13/13 PASS`), đạt tổng cộng **322/322 tests PASS (100% Xanh)**.
   - Xuất bản bản đồ chi tiết 27 tasks: `docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md`.

| Kênh Quản Trị / Tài Liệu | Nội Dung Đồng Bộ Hiện Tại | Trạng Thái Tuần 10 |
| :--- | :--- | :---: |
| **Bảng Jira Kanban** | 10 Epics (EPIC-01 đến EPIC-10), 27 Stories/Tasks kỹ thuật có đầy đủ 11 mục chi tiết, Deadline & Assignee chuẩn. 5 Tasks của Võ Duy Bình (`KAN-114, 117, 134, 137, 138`) đã chuyển trạng thái sang **DONE** kèm ghi nhận Worklog. | **Đồng bộ 100%** |
| **Không Gian ClickUp** | Folder `HTQLLH` thuộc Space `Group 2_PTDAPM` hiển thị đầy đủ 10 Modules, Deadline và Assignee. Toàn bộ 5 Tasks của Võ Duy Bình chuyển sang **complete**. | **Đồng bộ 100%** |
| **Bản Slide Canva** | Slide 4 (Kanban & ClickUp), Slide 12 (Hiện trạng tuần 8-9-10), Slide 15 (5 thành viên chính thức) được phản ánh chuẩn xác. | **Đồng bộ 100%** |
| **Kho Git GitHub** | Kho chính thức: `https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem` (Dual-Remote push). | **Up-to-date (Đã merge PR #7, #8)** |
| **Kho Git Bitbucket** | Kho đối ứng: `https://bitbucket.org/codyisme27205/pt_da_pm` (Dual-Remote push). | **Up-to-date (Đã sync)** |
| **Cẩm nang Lập trình** | [docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md) (978 dòng) hướng dẫn quy trình 5 bước phát triển, SQL an toàn và link tài liệu chuẩn. | **Đã hoàn thành** |
| **Bản Tổng Quan Leader** | [docs/TONG_QUAN_TOAN_BO_HE_THONG_CHO_LEADER.md](docs/TONG_QUAN_TOAN_BO_HE_THONG_CHO_LEADER.md) cập nhật tiến độ hợp nhất 2 PRs và kết quả 322 tests. | **Đã hoàn thành** |
| **Bản Đồ 27 Tasks Code** | [docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md](docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md) ánh xạ chi tiết từng task vào file code và hàm. | **Đã hoàn thành** |
| **Bộ Kiểm Thử Tập Trung** | Lệnh `npm test` + Frontend vitest chạy thành công **400/400 tests PASS (100% Xanh tuyệt đối, 0 Lỗi, 0 Bỏ qua)**. | **100% PASS** |

---

### 4.2. Cập Nhật Kiểm Thử Mở Rộng & Chuẩn Hóa Kiến Trúc (Ngày 19/11/2026)

Nhóm đã hoàn thành đợt rà soát và nâng cấp toàn diện hệ thống kiểm thử tự động, tích hợp trọn vẹn các commit mới từ **Member 5 (Nguyễn Minh Quốc Bảo - QA Lead)** và chuẩn hóa hợp đồng kiến trúc giữa các thành viên:

1. **Nâng Cấp Bộ Kiểm Thử Member 5 Lên 214 Ca:**
   - **Siết tiêu chí Học sinh Xuất sắc (Thông tư 22 §9.2 - Test 27h-27l):** Bắt buộc ĐTB các môn $\ge 9.0$ kết hợp hạnh kiểm Tốt; học sinh chưa đủ điểm hoặc đạt 8.9 không bị đánh trượt oan.
   - **Xử lý phổ điểm cho học sinh chưa có điểm (Test 24h-24j):** Tách riêng khỏi nhóm "Chưa đạt" để tính tỷ lệ % xếp loại chính xác trên số em thực tế đã có điểm (`gradedCount`).
   - **Kiểm thử bất biến của Nhật ký Kiểm toán AuditLogger (Test 34a-34j):** Kiểm thử ghi nhận hành vi sửa điểm (`UPDATE_SCORE`), lưu điểm cũ/mới, IP, user ID và ngăn chặn API UPDATE/DELETE trái phép.
   - **Kiểm thử mã hóa VietQR chuẩn EMVCo & CRC16 (PBI-24, Test 38a-38e):** Kiểm thử cấu trúc chuỗi TLV `000201` và thuật toán tính checksum CRC16-CCITT chuẩn ngân hàng.
2. **Khắc Phục Lỗ Hổng Hợp Đồng RBAC Tầng Ứng Dụng (Test 39a PASS):**
   - Tích hợp và xuất hàm middleware **`authorizeRoles(...allowedRoles)`** vào `server.js` (Member 3), bảo vệ các tuyến API theo 5 vai trò (`BGH`, `GVCN`, `GV`, `HS`, `PH`), giải quyết dứt điểm cảnh báo `SKIP: [Test 39a: server.js CHƯA nối authorizeRoles]`.
3. **Cơ Chế Vận Hành Linh Hoạt Kép (Dual-Mode Architecture):**
   - **Chế độ 1 - Docker PostgreSQL Thật:** Chạy container `htqllh_postgres` trên cổng `5434`, tự động khởi tạo 18 bảng quan hệ và nạp dữ liệu mẫu toàn diện.
   - **Chế độ 2 - In-Memory Mock Fallback:** Khi tắt Docker để tiết kiệm RAM/CPU, hệ thống tự động kích hoạt bộ lưu trữ bộ nhớ trong `UserRepository.js` và `db.js`, bảo đảm cả 5 vai trò vẫn đăng nhập và demo bình thường.

---

### 4.3. Tối Ưu Hóa Kỹ Thuật, Nạp Dữ Liệu Toàn Diện 100% & Chinh Phục 400/400 Tests Xanh Tuyệt Đối (Ngày 19/11/2026)

Sau khi rà soát toàn bộ hệ thống theo yêu cầu của Leader và phát hiện một số phân hệ còn dữ liệu thưa thớt (thiếu khối 12, thiếu các môn tự nhiên/xã hội, thiếu lịch sử thanh toán học phí), nhóm đã tiến hành nâng cấp toàn diện:

1. **Nạp Đầy Đủ 100% Dữ Liệu Thực Tế Trên Cả 18 Bảng PostgreSQL:**
   - **Mở rộng đầy đủ 3 Khối (10, 11, 12)**: Bổ sung các lớp `10A1`, `10A2`, `11B1`, `12A1`, `12A2` với đầy đủ GVCN phụ trách (` Trần Thị Mai` cho 12A1,...).
   - **52 Tài khoản người dùng (`users`)**: Phủ kín BGH, GVCN, GVBM, 16 học sinh (`HS001` đến `HS016`) và 16 phụ huynh tương ứng (`ph.hs0001` đến `ph.hs0016`, kèm các tài khoản demo ngắn `ph001`, `hs001`).
   - **Đa dạng môn học & Sổ điểm Thông tư 22 (`grade_books`)**: 37 bản ghi điểm số chi tiết trải đều Toán, Ngữ văn, Tiếng Anh, Vật lý, Hóa học với phổ điểm đa dạng (Xuất sắc ĐTB $\ge 9.0$, Tốt, Khá, Đạt, Chưa đạt).
   - **Thời khóa biểu & Templates (`schedules`, `schedule_templates`)**: 150 tiết học và 130 templates Mon-Fri (tiết 1-5) với phòng học, giáo viên phụ trách chuẩn mực.
   - **Chuyên cần & Điểm danh (`attendances`)**: 78 bản ghi điểm danh đầy đủ cả 4 trạng thái (PRESENT, LATE, ABSENT có phép và không phép).
   - **Đơn xin nghỉ học trực tuyến (`leave_requests`)**: 12 đơn xin nghỉ với đa dạng trạng thái (PENDING, APPROVED, REJECTED).
   - **Học phí & Giao dịch thanh toán VietQR (`tuitions`, `payments`)**: 44 bản ghi học phí, 3 biên lai thanh toán thành công kèm mã VietQR, tài khoản MBBank, mã giao dịch và đối soát tự động.
   - **Kênh tương tác gia đình & nhà trường (`notifications`, `parent_messages`, `parent_students`)**: 8 thông báo toàn trường theo phân loại (học tập, học phí, họp PH), 9 tin nhắn sổ liên lạc 2 chiều giữa PH, GVCN và BGH.

2. **Lưu Trữ Nhật Ký Kiểm Toán Bất Biến Vào PostgreSQL (`audit_logs` Table):**
   - Chuyển đổi cơ chế lưu trữ `AuditLogger` từ mảng RAM tạm thời sang bảng CSDL PostgreSQL quan hệ thực thụ (`Table 18: audit_logs`).
   - Ghi nhận đầy đủ thông tin: `timestamp`, `action`, `username`, `role`, `entity`, `entity_id`, `previous_value`, `new_value`, `ip_address`.
   - Cơ chế Append-only: Ngăn chặn triệt để mọi hành vi sửa (UPDATE) hoặc xóa (DELETE) nhật ký kiểm toán, đảm bảo tính chống chối bỏ (Non-repudiation).

3. **Tối Ưu Hóa Tốc Độ Truy Vấn Bằng Composite Indexes:**
   - Đánh chỉ mục hỗn hợp `idx_grade_books_class_subject_sem` trên bảng `grade_books(class_name, subject_name, semester)` tăng tốc độ tải sổ điểm của lớp gấp 5-10 lần.
   - Đánh chỉ mục `idx_attendances_class_date_status` trên `attendances(class_name, att_date, status)` tối ưu truy vấn chuyên cần ngày.
   - Đánh chỉ mục `idx_audit_logs_user_action` trên `audit_logs(username, action, timestamp)` hỗ trợ BGH tra cứu lịch sử nhanh chóng.

4. **Thiết Lập Bộ Tiêu Chuẩn Bảo Mật HTTP Security Headers (OWASP Hardening):**
   - Tích hợp các headers bảo mật trực tiếp trên `server.js`:
     - `X-Content-Type-Options: nosniff` (chống tấn công MIME-sniffing).
     - `X-Frame-Options: SAMEORIGIN` (phòng vệ tấn công Clickjacking).
     - `X-XSS-Protection: 1; mode=block` (hàng rào lọc Cross-Site Scripting).
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - Gỡ bỏ hoàn toàn header `X-Powered-By` (tránh rò rỉ thông tin nền tảng Express/Node.js).

5. **Cài Đặt `xlsx-js-style` & Chinh Phục 400/400 Tests Xanh Tuyệt Đối:**
   - Cài đặt thư viện `xlsx-js-style` cho phân hệ Export Engine của Member 5.
   - Toàn bộ 15 ca kiểm thử định dạng màu sắc ô Excel (`styles.xml`, nền header `D9E1F2`, sọc xen kẽ `F2F2F2`, in đậm font) chuyển từ SKIP sang **PASS 100%**.
   - **BẢNG TỔNG KẾT KIỂM THỬ TOÀN HỆ THỐNG**:
     - Phân hệ Backend CSDL (Member 3): **79 / 79 PASS**.
     - Phân hệ Logic & An ninh TT22 (Member 4): **94 / 94 PASS**.
     - Phân hệ QA & Modules Đầy Đủ (Member 5): **214 / 214 PASS** (0 Skip, 0 Fail).
     - Phân hệ Giao diện Frontend Vitest (Member 2): **13 / 13 PASS**.
     - **TỔNG CỘNG: 400 / 400 TESTS PASS (100% XANH TUYỆT ĐỐI)**.

---

## 5. KẾ HOẠCH BÀN GIAO & BƯỚC ĐI TIẾP THEO (TUẦN 11 - TUẦN 15)

1. **Tuần 11 (23/11 - 29/11/2026)**: Tối ưu hóa hiệu năng, Đánh Composite Indexes trên PostgreSQL và Cấu hình Caching Redis (Cache-Aside Pattern).
2. **Tuần 12 (30/11 - 06/12/2026)**: Đóng gói Docker Compose tự động hóa toàn bộ và thiết lập Pipeline CI/CD GitHub Actions.
3. **Tuần 13 (07/12 - 13/12/2026)**: Báo cáo Thẩm định Kỹ thuật và Kiểm thử Chấp nhận Người dùng UAT toàn diện trên 43 Use Cases.
4. **Tuần 14 (14/12 - 20/12/2026)**: Đóng gói Bản phát hành Release v1.0.0 và hoàn thiện Cẩm nang Hướng dẫn Sử dụng (User Manual).
5. **Tuần 15 (21/12 - 27/12/2026)**: Tổng kết toàn diện Đồ án, Hoàn thiện Kịch bản Thuyết trình Bảo vệ và Tổng kết Đánh giá KPI 5 thành viên (100% Hoàn thành).
