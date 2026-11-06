# HƯỚNG DẪN KIỂM THỬ API BẰNG POSTMAN DESKTOP
## HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) — THPT HOA SEN (HSU)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (SCHOOL MANAGEMENT SYSTEM - SMS)
VỊ TRÍ FILE POSTMAN:
  - Collection:  docs/HTQLLH_Postman_Collection.json
  - Environment: docs/HTQLLH_Postman_Environment.json
NGÀY TẠO: 06/11/2026
TÁC GIẢ: NHÓM DỰ ÁN PHÁT TRIỂN PHẦN MỀM HSU (TRƯỞNG NHÓM: VÕ DUY BÌNH)
================================================================================
```

---

## 1. HƯỚNG DẪN IMPORT VÀO POSTMAN DESKTOP (3 BƯỚC)

### Bước 1: Mở Postman Desktop
1. Khởi động phần mềm **Postman** trên máy tính của bạn.
2. Ở góc trên bên trái, bấm vào nút **Import** (hoặc phím tắt `Ctrl + O`).

### Bước 2: Kéo thả 2 tệp JSON vào Postman
Kéo thả hoặc chọn 2 tệp nằm trong thư mục `docs/`:
- [`docs/HTQLLH_Postman_Collection.json`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/HTQLLH_Postman_Collection.json)
- [`docs/HTQLLH_Postman_Environment.json`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/HTQLLH_Postman_Environment.json)

Bấm **Import** để hoàn tất.

### Bước 3: Chọn Môi Trường (Environment)
1. Ở góc trên bên phải màn hình Postman, bấm vào menu chọn môi trường (mặc định là *No Environment*).
2. Chọn môi trường: **`HTQLLH Localhost (Port 8081)`**.

---

## 2. DANH MỤC CÁC PHÂN HỆ API TRONG COLLECTION (10 FOLDERS)

Bộ sưu tập được phân chia thành **10 thư mục chuyên đề** tương ứng chuẩn kiến trúc Clean Architecture:

| Thư mục | Chức năng nghiệp vụ | Số lượng Request mẫu |
| :--- | :--- | :---: |
| **00. Health Check** | Kiểm tra kết nối máy chủ Express (`/api/health`) | 1 |
| **01. Authentication** | Đăng nhập 5 Roles (BGH, GVCN, GVBM, HS, PH), Auth Me, Quên mật khẩu | 7 |
| **02. Students** | Lấy danh sách học sinh theo lớp, xem chi tiết, cập nhật hạnh kiểm, tính GPA | 5 |
| **03. GradeBook TT22** | Xem sổ điểm, lưu điểm hàng loạt (Unit of Work ACID), chốt khóa sổ điểm | 5 |
| **04. Attendance** | Điểm danh chuyên cần theo ngày, lưu điểm danh, thống kê tỷ lệ vắng | 3 |
| **05. Leave Requests** | Phụ huynh nộp đơn nghỉ học trực tuyến, GVCN duyệt đơn tự động cập nhật điểm danh | 3 |
| **06. Tuition & VietQR** | Xem công nợ học phí, thanh toán trực tuyến sinh biên lai điện tử | 2 |
| **07. Schedules** | Tra cứu thời khóa biểu giảng dạy và học tập, quản lý template TKB | 2 |
| **08. Dashboard** | Số liệu thống kê thời gian thực cho Ban Giám Hiệu và Giáo Viên Chủ Nhiệm | 2 |
| **09. Notifications & Comm** | Trung tâm thông báo đẩy, danh bạ sổ liên lạc trực tuyến phụ huynh - giáo viên | 3 |
| **10. Classes & Subjects** | Danh mục Lớp học và Môn học toàn trường | 2 |

---

## 3. CƠ CHẾ TỰ ĐỘNG LƯU TOKEN JWT (AUTOMATIC TOKEN INJECTION)

> **Điểm tiện lợi:** Bạn **KHÔNG CẦN** copy-paste token thủ công giữa các request!

Trong các request đăng nhập:
- **`1.1 Đăng nhập BGH / Admin`**
- **`1.2 Đăng nhập GVCN 10A1`**
- **`1.3 Đăng nhập GV Bộ Môn`**

Đã được cài sẵn đoạn mã Test Script chuẩn:
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.collectionVariables.set('jwtToken', jsonData.token);
    console.log('Đã tự động lưu JWT Token vào biến collection');
}
```

**Cách sử dụng:**
1. Chạy request **`1.1 Đăng nhập BGH / Admin`** (hoặc tài khoản GV mong muốn) bấm **Send**.
2. Khi đăng nhập thành công trả về HTTP 200, Token sẽ tự động được lưu vào biến `{{jwtToken}}`.
3. Tất cả các request sau (Sổ điểm, Điểm danh, Học sinh...) sẽ tự động mang theo Header:
   ```http
   Authorization: Bearer {{jwtToken}}
   ```

---

## 4. TÀI KHOẢN MẪU DÙNG THỬ (DEMO ACCOUNTS)

| Vai trò | Username | Password | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Ban Giám Hiệu (BGH)** | `bgh.admin` | `Password123!` | Toàn quyền quản trị, khóa/mở sổ điểm, phân công |
| **GV Chủ Nhiệm (GVCN)** | `gvcn.10a1` | `Password123!` | Quản lý lớp 10A1, điểm danh đầu giờ, duyệt đơn nghỉ |
| **GV Bộ Môn (Toán)** | `gv.an` | `Password123!` | Nhập điểm thành phần môn Toán, nộp chốt sổ điểm |
| **Học Sinh** | `hs.anh` | `Password123!` | Xem bảng điểm cá nhân, xem thời khóa biểu |
| **Phụ Huynh** | `ph.anh` | `Password123!` | Xem kết quả học tập con, nộp đơn nghỉ học, thanh toán |

---

## 5. LƯU Ý KHI CHẠY TRÊN MÁY TÍNH
1. Đảm bảo **PostgreSQL Docker** đang chạy trên cổng `5434`.
2. Đảm bảo **Backend Node.js** đang chạy trên cổng `8081` (`node server.js`).
3. Kiểm tra bằng cách chạy request đầu tiên **`00. Health Check`** -> Nếu nhận `status: "UP"` là hệ thống đã sẵn sàng 100%!

