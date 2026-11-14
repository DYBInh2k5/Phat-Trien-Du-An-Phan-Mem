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
| 1 | [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Điều phối tiến độ Tuần 10, đồng bộ lộ trình trên Jira & ClickUp, rà soát kịch bản kiểm thử tích hợp End-to-End, kiểm tra ma trận truy xuất RTM với các yêu cầu bảo mật an ninh. | 20% (100% KPI) | **IN PROGRESS** |
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

## 4. TỔNG HỢP TIẾN ĐỘ ĐỒNG BỘ CÁC CÔNG CỤ QUẢN TRỊ DỰ ÁN

| Kênh Quản Trị / Tài Liệu | Nội Dung Đồng Bộ Hiện Tại | Trạng Thái Tuần 10 |
| :--- | :--- | :---: |
| **Bảng Jira Kanban** | 10 Epics (EPIC-01 đến EPIC-10), 27 Stories/Tasks kỹ thuật, liên kết chặt chẽ với mã nguồn và Use Cases. Thẻ Tuần 10 chuyển trạng thái sang **IN PROGRESS**. | **Đồng bộ 100%** |
| **Không Gian ClickUp** | Folder `HTQLLH` thuộc Space `Group 2_PTDAPM` hiển thị đầy đủ 10 Modules tương ứng WBS. Tiến độ 5 thành viên được cập nhật đồng bộ. | **Đồng bộ 100%** |
| **Bản Slide Canva** | Slide 4 (Kanban & ClickUp), Slide 12 (Hiện trạng tuần 8-9-10), Slide 15 (5 thành viên chính thức) được phản ánh chuẩn xác. | **Đồng bộ 100%** |
| **Kho Git GitHub** | Kho chính thức: `https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem` (Dual-Remote push). | **Up-to-date** |
| **Kho Git Bitbucket** | Kho đối ứng: `https://bitbucket.org/codyisme27205/pt_da_pm` (Dual-Remote push). | **Up-to-date** |
| **Tài liệu Nghiệp vụ** | [USE_CASES.md](USE_CASES.md) & [UML_DIAGRAMS.md](docs/UML_DIAGRAMS.md) chuẩn hóa RUP Cockburn và OMG UML 2.5. | **Đã hoàn thành** |
| **Cẩm nang CSDL** | [docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md](docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md) hướng dẫn toàn bộ thành viên thao tác DB. | **Đã hoàn thành** |

---

## 5. KẾ HOẠCH BÀN GIAO & BƯỚC ĐI TIẾP THEO (TUẦN 11 - TUẦN 15)

1. **Tuần 11 (23/11 - 29/11/2026)**: Tối ưu hóa hiệu năng, Đánh Composite Indexes trên PostgreSQL và Cấu hình Caching Redis (Cache-Aside Pattern).
2. **Tuần 12 (30/11 - 06/12/2026)**: Đóng gói Docker Compose tự động hóa toàn bộ và thiết lập Pipeline CI/CD GitHub Actions.
3. **Tuần 13 (07/12 - 13/12/2026)**: Báo cáo Thẩm định Kỹ thuật và Kiểm thử Chấp nhận Người dùng UAT toàn diện trên 43 Use Cases.
4. **Tuần 14 (14/12 - 20/12/2026)**: Đóng gói Bản phát hành Release v1.0.0 và hoàn thiện Cẩm nang Hướng dẫn Sử dụng (User Manual).
5. **Tuần 15 (21/12 - 27/12/2026)**: Tổng kết toàn diện Đồ án, Hoàn thiện Kịch bản Thuyết trình Bảo vệ và Tổng kết Đánh giá KPI 5 thành viên (100% Hoàn thành).
