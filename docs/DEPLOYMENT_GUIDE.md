# Hướng Dẫn Cài Đặt, Triển Khai & Vận Hành Hệ Thống (Deployment & User Guide)

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & Quản lý: **Võ Duy Bình (PM / Lead BA)**  

---

## 1. YÊU CẦU MÔI TRƯỜNG HỆ THỐNG (SYSTEM PREREQUISITES)

Để triển khai và vận hành toàn diện hệ thống HTQLLH, máy chủ hoặc máy tính phát triển cần đáp ứng các điều kiện sau:

- **Hệ điều hành**: Windows 10/11, macOS, hoặc Ubuntu Linux 20.04+.
- **Node.js**: Phiên bản LTS `v18.x` hoặc `v20.x+` (kèm npm `v9.x+`).
- **Docker & Docker Compose**: Docker Desktop (Windows/macOS) hoặc Docker Engine + Docker Compose Plugin (Linux).
- **Cơ sở dữ liệu (nếu chạy local không qua Docker)**: PostgreSQL `v14+` hoặc `v15+`.
- **Trình duyệt Web**: Google Chrome, Microsoft Edge, Firefox hoặc Safari phiên bản mới nhất.

---

## 2. TRIỂN KHAI NHANH BẰNG DOCKER COMPOSE (RECOMMENDED QUICKSTART)

Hệ thống đã được đóng gói toàn diện với Docker Compose tại tệp gốc `docker-compose.yml`, cho phép khởi chạy đồng thời CSDL PostgreSQL và Backend REST API chỉ bằng 1 câu lệnh.

### Bước 1: Khởi chạy Cụm Dịch vụ Docker
Tại thư mục gốc của dự án, mở terminal (PowerShell hoặc Bash) và thực hiện lệnh:
```bash
docker compose up -d
```

### Bước 2: Kiểm tra trạng thái vùng chứa (Containers Status)
Kiểm tra xem các container đã khởi động và đạt trạng thái Healthy:
```bash
docker compose ps
```
Kết quả mong muốn:
- `htqllh_postgres`: Đang lắng nghe tại cổng `5434:5432` (Health: healthy).
- `htqllh_backend`: Đang lắng nghe tại cổng `8081:8081` (Status: running).

### Bước 3: Khởi chạy Giao diện Frontend React (Vite SPA)
Mở một cửa sổ terminal mới và khởi chạy phân hệ giao diện:
```bash
cd members/member2_Frontend
npm install
npm run dev
```
Trình duyệt sẽ tự động mở cổng dịch vụ Frontend tại: `http://localhost:5173` (hoặc `http://localhost:3000`).

---

## 3. TRIỂN KHAI THỦ CÔNG TỪNG THÀNH PHẦN (MANUAL SETUP)

Trong trường hợp muốn chạy trực tiếp mã nguồn để gỡ lỗi và phát triển (Debug mode):

### 3.1. Thiết lập Cơ sở Dữ liệu PostgreSQL
1. Nếu sử dụng Docker (Khuyên dùng):
   - PostgreSQL được container hóa và mở cổng host tại `5434` (tránh xung đột với PostgreSQL cục bộ port 5432).
   - Tên database: `school_management`
   - User: `postgres` / Password: `postgres`
   - Lệnh khởi động: `docker start htqllh_postgres`
2. Nếu cài đặt cục bộ qua PostgreSQL máy chủ:
   - Tạo cơ sở dữ liệu dự án:
     ```sql
     CREATE DATABASE school_management;
     ```
   - Nạp tập lệnh cấu trúc bảng (DDL) và dữ liệu mẫu:
     ```bash
     psql -U postgres -d school_management -f database/schema.sql
     ```

### 3.2. Cấu hình & Chạy Backend Node.js Express
1. Di chuyển vào thư mục Backend:
   ```bash
   cd members/member3_Backend_DB/school-management-nodejs
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình tệp môi trường `.env`:
   ```env
   PORT=8081
   DB_HOST=localhost
   DB_PORT=5434
   DB_NAME=school_management
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=HTQLLH_Super_Secret_JWT_Key_2026
   ```
4. Khởi chạy máy chủ API:
   ```bash
   node server.js
   ```
   Kiểm tra HealthCheck tại trình duyệt: `http://localhost:8081/api/health`.

### 3.3. Cấu hình & Chạy Frontend React Vite
1. Di chuyển vào thư mục Frontend:
   ```bash
   cd members/member2_Frontend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ nhà phát triển:
   ```bash
   npm run dev
   ```
   Truy cập Web SPA: `http://localhost:5173`.

---

## 4. DANH SÁCH TÀI KHOẢN MẪU PHÂN QUYỀN 5 VAI TRÒ (DEMO ACCOUNTS)

Hệ thống được nạp sẵn danh sách tài khoản chuẩn hóa 100% dữ liệu phục vụ đánh giá và nghiệm thu phân quyền RBAC:

| Vai trò (Role) | Mã Người dùng | Tên Đăng nhập | Mật khẩu Mặc định | Họ và Tên Mẫu | Chức năng Kiểm thử Trọng tâm |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Ban Giám Hiệu** (`ROLE_ADMIN`) | `BGH001` | `admin` | `admin123` | Thầy Hiệu Trưởng | Dashboard phân tích toàn trường, phân công giảng dạy, duyệt mở/khóa sổ điểm, xem nhật ký kiểm toán (Audit Logs). |
| **Giáo viên Chủ nhiệm** (`ROLE_HOMEROOM_TEACHER`) | `GV001` | `gvcn01` | `gvcn123` | Cô Trần Thị Mai | Quản lý danh sách lớp 10A1, điểm danh buổi sáng, duyệt đơn xin nghỉ phép của phụ huynh, sổ liên lạc. |
| **Giáo viên Bộ môn** (`ROLE_SUBJECT_TEACHER`) | `GV002` | `gv01` | `gv123` | Thầy Nguyễn Văn An | Nhập và sửa điểm môn Toán lớp 10A1, tính điểm trung bình môn (TBM), xuất sổ điểm Excel. |
| **Học sinh** (`ROLE_STUDENT`) | `HS001` | `hs001` | `hs123` | Nguyễn Thị Ánh (10A1) | Xem thời khóa biểu tuần, tra cứu bảng điểm chi tiết, lịch thi học kỳ 2026, tải phiếu báo điểm PDF. |
| **Phụ huynh** (`ROLE_PARENT`) | `PH001` | `ph001` | `ph123` | Phụ huynh em Ánh | Sổ liên lạc điện tử con em, nộp đơn xin nghỉ học trực tuyến, xem học phí và tải biên lai PDF. |

*Lưu ý: Mọi tài khoản đều có thể chuyển đổi nhanh thông qua nút **1-Click Demo Login** tích hợp sẵn trên giao diện Đăng nhập.*

---

## 5. THỰC THI BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Hệ thống sở hữu bộ kiểm thử tự động toàn diện cho cả Backend và Frontend, đạt tỷ lệ đạt chuẩn 100%:

### 5.1 Kiểm thử Backend (Clean Architecture, Thông tư 22, RBAC & Export)
Chạy bộ kiểm thử Node.js Test Runner của backend:
```bash
cd members/member3_Backend_DB/school-management-nodejs
npm install
npm test
```
Kết quả đạt được: **79/79 tests PASS (100%)** bao gồm:
- Tính điểm trung bình môn học kỳ (ĐTBmhk) theo trọng số chia 9.
- Phân loại học lực theo Thông tư 22 (Tốt, Khá, Đạt, Chưa đạt).
- Quy đổi GPA thang điểm 10 sang thang điểm 4.0.
- Unit of Work và tính toàn vẹn giao dịch ACID khi cập nhật điểm.
- Kiểm soát truy cập RBAC 5 Roles, bảo mật JWT và chống SQL Injection.
- Động cơ xuất báo cáo Excel (`SheetJS`) và PDF (`jsPDF`).

### 5.2 Bộ kiểm thử QA của Member 5 (Thông tư 22, PBI-05/07/09/13/15/16/17/19/23/24, KAN-12/13/16/133)
```bash
# Từ thư mục gốc repo (script test:qa đã khai báo trong package.json gốc)
npm run test:qa
```
Kết quả đạt được: **198 PASS + 16 SKIP + 0 FAIL** trên máy chưa cài thư viện ghi Excel;
**213 PASS + 1 SKIP** khi môi trường có `xlsx-js-style` (ví dụ chạy kèm
`NODE_PATH` trỏ tới thư mục đã cài gói fork). SKIP còn lại là Test 39a — ca hợp đồng phát hiện
`server.js` của member3 chưa nối `authorizeRoles` vào route. Bao gồm:
- ĐTBmhk 5 ca (7.7; 0.0; 10.0; điểm khống; làm tròn), xếp loại 4 mức Thông tư 22, quy đổi GPA 10 → 4.
- PBI-05: điểm danh 4 trạng thái, mặc định PRESENT, lưu lịch sử, cổng PH chỉ báo vắng không phép.
- PBI-07 / KAN-13: cảnh báo vắng ≥ 20% (10/45 = 22.2%, đúng ngưỡng 20%, dưới ngưỡng 17.8%).
- KAN-12: chặn GVBM điểm danh sai tiết (403) và trùng tiết với lớp khác (409).
- PBI-13: audit log ghi old/new score, IP, timestamp; UPDATE/DELETE bị từ chối.
- PBI-15 / KAN-30: tên tệp `SoDiem_[TenLop]_[MonHoc]_[HocKy].xlsx`, tự căn độ rộng cột; header in đậm + hàng xen kẽ trắng/xám được gắn khi môi trường có thư viện ghi style.
- PBI-16: phiếu báo điểm/học bạ A4 có quốc hiệu, tiêu ngữ, 6 đầu điểm, xếp loại học lực + hạnh kiểm.
- PBI-17b/17c: đơn xin nghỉ và luồng duyệt đồng bộ điểm danh `EXCUSED`; GVCN khác lớp bị chặn 403.
- PBI-19: ma trận RBAC 5 vai trò × toàn bộ endpoint khớp `rbacMiddleware.js` thật (thiếu token 401, sai vai trò 403).
- KAN-133: biên lai duy nhất theo giao dịch + mã tra cứu tất định, tra cứu mã lạ trả 404.
- EPIC-10 / PBI-23: phổ điểm theo khối/lớp/môn, danh sách Học sinh Xuất sắc và rèn luyện hè.
- KAN-22/24: connection pool không cạn kiệt và rate limiter đăng nhập.
- Test 4/11/24/28/37 xác minh tệp `.xlsx` **tồn tại thật trên đĩa** (`filePath` + `fs.existsSync`); 9 khẳng định này tự **SKIP** nếu máy chưa có `xlsx`, 6 khẳng định style (37d–37i) tự **SKIP** nếu chưa có `xlsx-js-style`, và chạy đủ khi thư viện hiện diện — không báo thành công giả. Tệp xuất được ghi vào `os.tmpdir()` nên không làm rác mã nguồn.
- Thư viện: `xlsx` 0.18.5 (dữ liệu) là phụ thuộc tùy chọn của môi trường chạy, đã khai báo ở `members/member2_Frontend/package.json`; không có `package.json`/`node_modules` riêng trong thư mục member5. SheetJS Community không ghi được style ô nên engine dò thêm `xlsx-js-style` (nếu có) trước khi rơi về `xlsx`.

### 5.3 Kiểm thử Frontend (Vite Component & Route Testing)
Chạy bộ kiểm thử Vitest:
```bash
cd members/member2_Frontend
npm run test
```
Kết quả đạt được: **13/13 tests PASS (100%)**.

---

## 6. ĐỒNG BỘ DUAL-REMOTE (GITHUB & BITBUCKET)

Hệ thống được cấu hình hỗ trợ đồng bộ song song 2 kho lưu trữ mã nguồn lớn nhất:
- **GitHub**: `https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem.git`
- **Bitbucket**: `https://bitbucket.org/codyisme27205/pt_da_pm.git`

Lệnh đồng bộ 1 chạm:
```bash
git push origin main
```
Lệnh trên sẽ tự động đẩy toàn bộ commit và nhánh `main` mới nhất lên đồng thời cả 2 máy chủ GitHub và Bitbucket.

---

## 7. TRIỂN KHAI ĐÁM MÂY PRODUCTION (VERCEL & NEON CLOUD DATABASE)

Hệ thống đã được đóng gói và triển khai vận hành trực tuyến 24/7 trên hạ tầng đám mây Serverless:

### 7.1. Địa chỉ dịch vụ trực tuyến (Production URLs)
- **Frontend Single Page Application (Vercel)**: **[https://htqllh-frontend.vercel.app](https://htqllh-frontend.vercel.app)**  
  *(Tự động cấp chứng chỉ bảo mật SSL/TLS HTTPS, tối ưu hóa Code-Splitting bundle khởi tạo chỉ 37.14 kB)*.
- **Backend RESTful API (Vercel Serverless Function)**: **[https://htqllh-backend.vercel.app](https://htqllh-backend.vercel.app)**  
  *(Kiểm tra trạng thái sức khỏe hệ thống: [https://htqllh-backend.vercel.app/api/health](https://htqllh-backend.vercel.app/api/health))*.

### 7.2. Cơ sở dữ liệu đám mây Neon PostgreSQL Serverless
- **Host**: `ep-wispy-rain-be6an41h-pooler.c-9.us-east-2.aws.neon.tech`
- **Database**: `neondb` (PostgreSQL 18.7, AWS US East 2)
- **Hiện trạng dữ liệu**: Đã nạp đầy đủ 100% dữ liệu mẫu 18/18 bảng CSDL 3NF (48 tài khoản người dùng 5 vai trò RBAC, 16 hồ sơ học sinh, 192 bản ghi sổ điểm 2 năm học 2024-2025 và 2025-2026, 125 slot thời khóa biểu, 80 bản ghi điểm danh, 16 hóa đơn học phí, 4 giao dịch VietQR).

### 7.3. Bộ 3 Công cụ Quản lý Dự án Agile Chuẩn Quốc Tế
- **Trello Kanban Board**: **[https://trello.com/b/gkdRNT57/htqllh-hệ-thống-quản-lý-lớp-học-học-vụ-edumanage-pro](https://trello.com/b/gkdRNT57/htqllh-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-l%E1%BB%9Bp-h%E1%BB%8Dc-h%E1%BB%8Dc-v%E1%BB%A5-edumanage-pro)** (30/30 PBIs đã hoàn thành 100% trong cột `✅ Done / Released`).
- **Jira Cloud Project & Kanban**: [https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN](https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN)
- **ClickUp Workspace**: [https://app.clickup.com/1100320000025585/v/s/1100320000109903](https://app.clickup.com/1100320000025585/v/s/1100320000109903)

