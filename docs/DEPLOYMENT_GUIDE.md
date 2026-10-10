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
1. Đăng nhập vào PostgreSQL qua pgAdmin hoặc psql:
   ```bash
   psql -U postgres
   ```
2. Tạo cơ sở dữ liệu dự án:
   ```sql
   CREATE DATABASE school_management;
   ```
3. Nạp tập lệnh cấu trúc bảng (DDL) và dữ liệu mẫu:
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
3. Khởi tạo tệp cấu hình môi trường `.env`:
   ```env
   PORT=8081
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=school_management
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=HTQLLH_Super_Secret_JWT_Key_2026
   ```
4. Khởi chạy máy chủ API:
   ```bash
   npm run start
   ```
   Kiểm tra HealthCheck tại trình duyệt: `http://localhost:8081/health`.

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

---

## 4. DANH SÁCH TÀI KHOẢN MẪU PHÂN QUYỀN 5 VAI TRÒ (DEMO ACCOUNTS)

Hệ thống được nạp sẵn danh sách tài khoản phục vụ đánh giá và nghiệm thu phân quyền RBAC:

| Vai trò (Role) | Mã Người dùng | Tên Đăng nhập | Mật khẩu Mặc định | Chức năng Kiểm thử Trọng tâm |
| :--- | :---: | :---: | :---: | :--- |
| **Ban Giám Hiệu** (Admin / Principal) | `BGH001` | `admin` | `admin123` | Dashboard tổng quan, giám sát chuyên cần, duyệt mở/khóa sổ điểm, xem nhật ký kiểm toán (Audit Logs). |
| **Giáo viên Chủ nhiệm** (Homeroom Teacher) | `GV001` | `gvcn_10a1` | `gv123` | Quản lý danh sách lớp 10A1, điểm danh buổi sáng, duyệt đơn xin nghỉ phép của phụ huynh. |
| **Giáo viên Bộ môn** (Subject Teacher) | `GV002` | `gv_toan` | `gv123` | Nhập và sửa điểm môn Toán, tính điểm trung bình môn (TBM), xuất sổ điểm Excel. |
| **Học sinh** (Student) | `HS001` | `hs_nguyenanh` | `hs123` | Xem thời khóa biểu, tra cứu bảng điểm chi tiết, GPA hệ 10/4, tải phiếu báo điểm PDF. |
| **Phụ huynh** (Parent) | `PH001` | `ph_nguyenanh` | `ph123` | Sổ liên lạc điện tử con em, nộp đơn xin nghỉ học trực tuyến, xem học phí và tải biên lai PDF. |

*Lưu ý: Mọi tài khoản đều có thể chuyển đổi nhanh thông qua thanh công cụ **Role Switcher** tích hợp sẵn trên giao diện Header.*

---

## 5. THỰC THI BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Để chạy kiểm thử toàn bộ các quy tắc nghiệp vụ, tính điểm trung bình môn, xếp loại học lực và engine xuất báo cáo:

```bash
cd members/member5_Modules_QA
node tests/unitTestingSuite.test.js
```

Kết quả mong đợi:
```text
=====================================================
[UNIT TEST QA SUITE] Executing Automated System Tests
=====================================================
PASS: [Test 1: GPA Weight Calculation] -> Result: 8.5
PASS: [Test 2: Academic Rank Evaluation] -> Result: Giỏi
PASS: [Test 3: GPA 10/4 Scale Conversion] -> Result: 4
PASS: [Test 4: Excel Export Row Count] -> Result: 1
PASS: [Test 5: PDF Report Card Success Status] -> Result: true
=====================================================
[TEST SUMMARY] Total: 5 | Passed: 5 | Failed: 0
=====================================================
```
