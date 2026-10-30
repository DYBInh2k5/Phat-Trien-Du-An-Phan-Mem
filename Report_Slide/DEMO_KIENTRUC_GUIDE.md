# HƯỚNG DẪN DEMO CHUYÊN ĐỀ KIẾN TRÚC PHẦN MỀM
## Chuyên đề 3 (Tuần 4): Clean Architecture & Node.js Express Backend
### Hệ thống: HTQLLH / EduManage Pro — Đại học Hoa Sen (SW320DV01)

```
================================================================================
Vị trí tệp : Report_Slide/DEMO_KIENTRUC_GUIDE.md
Mục đích   : Kịch bản quay video demo chuyên đề Kiến trúc Phần mềm (Tuần 4)
Thời điểm  : 30/10/2026 — Tuần 7 / 15 Tuần Học kỳ 2631
GitHub     : https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
================================================================================
```

---

## PHẦN 1: CHUẨN BỊ TRƯỚC KHI QUAY VIDEO

### 1.1 Yêu cầu
- Backend Node.js đang chạy tại `http://localhost:8081`
- VS Code mở thư mục `members/member3_Backend_DB/school-management-nodejs/src/`
- Terminal hiển thị log Backend để thấy request đến
- Trình duyệt hoặc Postman sẵn sàng gọi API

### 1.2 Kiểm tra Backend đang chạy
```bash
curl http://localhost:8081/api/health
# => {"status":"UP","service":"HTQLLH Node.js Express Backend","timestamp":"..."}
```

### 1.3 Bố cục màn hình khi quay video
```
+--------------------------------------+----------------------------------+
|  VS CODE (src/ — cây thư mục)        |  TRÌNH DUYỆT / POSTMAN (API)    |
|  [Hiển thị cấu trúc 4 tầng]          |  [Gọi RESTful API]              |
+--------------------------------------+----------------------------------+
|         TERMINAL BACKEND (log request HTTP đến)                        |
+------------------------------------------------------------------------+
```

---

## PHẦN 2: KỊCH BẢN DEMO TỪNG NỘI DUNG KIẾN TRÚC

---

### DEMO 4.1: Sơ Đồ Clean Architecture 4 Vòng Đồng Tâm
**Thời lượng gợi ý: 3 phút**

**Kịch bản tường thuật:**

> "Clean Architecture tổ chức hệ thống như 4 vòng đồng tâm. Quy tắc cốt lõi: hướng phụ thuộc chỉ đi từ ngoài vào trong — tầng trong không bao giờ biết tầng ngoài."

**Sơ đồ (vẽ tay lên bảng hoặc chiếu slide):**
```
+-------------------------------------------------------------+
|  TẦNG 4 — FRAMEWORKS & DRIVERS (Ngoài cùng)                |
|  server.js, Express, pg driver, Docker, React SPA           |
|  +-------------------------------------------------------+  |
|  |  TẦNG 3 — INTERFACE ADAPTERS                         |  |
|  |  Controllers, Routes, Repositories                   |  |
|  |  +-------------------------------------------------+ |  |
|  |  |  TẦNG 2 — APPLICATION USE CASES               | |  |
|  |  |  GradeBookController.js (logic nghiệp vụ)     | |  |
|  |  |  +---------------------------------------+    | |  |
|  |  |  |  TẦNG 1 — DOMAIN ENTITIES (Lõi)      |    | |  |
|  |  |  |  GradeBook.js (tinh khiết nghiệp vụ) |    | |  |
|  |  |  +---------------------------------------+    | |  |
|  |  +-------------------------------------------------+ |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

> "GradeBook.js không có một dòng import framework nào. server.js ở ngoài cùng import tất cả — đây là Composition Root."

---

### DEMO 4.2: Cây Thư Mục VS Code — Ánh Xạ 4 Tầng Vào Mã Nguồn
**Thời lượng gợi ý: 3 phút**

**Mở VS Code, hiển thị cây thư mục:**
```
members/member3_Backend_DB/school-management-nodejs/
  server.js                     <-- Tầng 4: Composition Root
  src/
    entities/
      GradeBook.js              <-- Tầng 1: Domain Entity (không import gì)
    controllers/
      GradeBookController.js    <-- Tầng 3: Interface Adapter
      AuthController.js
      StudentController.js
    repositories/
      UserRepository.js         <-- Tầng 3: Repository Adapter
    config/
      db.js                     <-- Tầng 4: Infrastructure
    utils/
      UnitOfWork.js             <-- Tầng 2: Điều phối giao dịch
    seeders/
      dataInitializer.js        <-- Tầng 4: Khởi tạo dữ liệu mẫu
```

**Kịch bản tường thuật:**

> "Mở GradeBook.js. File này chỉ có `export class GradeBook` — không import Express, không import pg. Tầng lõi hoàn toàn tinh khiết, có thể chạy và kiểm thử mà không cần khởi động server."

> "Trong khi đó, server.js import tất cả Controllers và đăng ký Routes. Đây là nơi duy nhất biết tất cả — Composition Root."

---

### DEMO 4.3: RESTful API — Gọi Endpoint Thực Tế
**Thời lượng gợi ý: 3 phút**

**Các endpoint chính:**
```
GET  /api/health            -- Kiểm tra sức khỏe dịch vụ
POST /api/auth/login        -- Đăng nhập, nhận JWT Token
GET  /api/students          -- Danh sách 45 học sinh
GET  /api/grades            -- Sổ điểm điện tử
POST /api/grades/batch      -- Lưu hàng loạt điểm (qua UnitOfWork)
GET  /api/attendance        -- Điểm danh chuyên cần
```

**Thao tác demo:**
1. Mở `http://localhost:8081/api/health` → nhận `{"status":"UP",...}`
2. Mở `http://localhost:8081/api/students` → nhận mảng JSON 45 học sinh
3. Trong terminal Backend, chỉ log: `[HTTP API] GET /api/students`
4. Nói: "Mỗi request đến đều được ghi log bởi middleware logger trong server.js"

**Đoạn code server.js cần hiển thị:**
```javascript
// Middleware ghi vết nhật ký HTTP thời gian thực
app.use((req, res, next) => {
  console.log(`[HTTP API] ${req.method} ${req.url}`);
  next();
});

// Đăng ký tuyến đường RESTful API cho 8 phân hệ
app.post('/api/auth/login', AuthController.login);
app.get('/api/students',    StudentController.getStudents);
app.get('/api/grades',      GradeBookController.getGradeBook);
```

---

### DEMO 4.4: Node.js Event Loop — Non-blocking I/O & async/await
**Thời lượng gợi ý: 2 phút**

**Đoạn code Controller cần hiển thị:**
```javascript
// GradeBookController.js — async/await không chặn luồng
static async getGradeBook(req, res) {
  try {
    // await: Node.js không đứng chờ — tiếp tục xử lý request khác
    // khi PostgreSQL trả về, Event Loop đưa callback vào queue xử lý tiếp
    const grades = await query(
      'SELECT * FROM grade_books WHERE class_name = $1',
      [req.query.className]
    );
    res.json({ success: true, data: grades.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
```

> "Từ khóa await nghĩa là Node.js không đứng chờ PostgreSQL. Trong thời gian đó, Event Loop xử lý request từ người dùng khác. Đây là lý do Node.js xử lý được hàng nghìn request đồng thời chỉ với 1 luồng."

---

### DEMO 4.5: Bảng So Sánh Kiến Trúc — Lý Do Chọn Clean Architecture
**Thời lượng gợi ý: 2 phút**

| Tiêu chí | 3-Layer | Clean Architecture | Microservice |
|:---|:---:|:---:|:---:|
| Phù hợp nhóm 5 người | Có | Có | Không (quá phức tạp) |
| Nghiệp vụ độc lập với DB | Không | Có | Có |
| Dễ viết Unit Test | Không | Có | Có |
| Chi phí vận hành | Thấp | Thấp | Cao |
| Phù hợp dự án này | Chấp nhận | Tối ưu | Quá mức cần thiết |

> "Chúng tôi chọn Clean Architecture vì Entity GradeBook có thể kiểm thử mà không cần chạy PostgreSQL. Đồng thời chi phí vận hành phù hợp với nhóm 5 người và 15 tuần."

---

## PHẦN 3: THỨ TỰ QUAY VIDEO VÀ THỜI LƯỢNG

| STT | Nội dung | Thời lượng | Ghi chú |
|:---:|:---|:---:|:---|
| 1 | Giới thiệu: 5 kiến trúc được khảo sát, lý do chọn | 2 phút | Bảng so sánh 5 kiến trúc |
| 2 | Demo 4.1: Vẽ sơ đồ 4 vòng đồng tâm | 3 phút | Vẽ tay hoặc chiếu slide |
| 3 | Demo 4.2: Cây thư mục VS Code — ánh xạ 4 tầng | 3 phút | Mở GradeBook.js và server.js |
| 4 | Demo 4.3: Gọi RESTful API thực tế | 3 phút | Trình duyệt + terminal log |
| 5 | Demo 4.4: async/await trong Controller | 2 phút | VS Code mã nguồn |
| 6 | Demo 4.5: Bảng so sánh — kết luận | 2 phút | Tại sao không Microservice |

**Tổng thời lượng dự kiến: khoảng 15 phút**

---

## PHẦN 4: CÂU TRẢ LỜI NGẮN GỌN NẾU BỊ HỎI THÊM

### "Quy tắc phụ thuộc trong Clean Architecture là gì?"
> "Hướng phụ thuộc trong mã nguồn chỉ đi từ ngoài vào trong. Tầng lõi GradeBook.js không biết Express hay PostgreSQL. Nếu đổi từ PostgreSQL sang MongoDB, chỉ viết lại Repository — Controller và Entity không thay đổi."

### "Composition Root là gì?"
> "Là nơi duy nhất trong hệ thống nơi mọi đối tượng được khởi tạo và kết nối. Trong hệ thống này là server.js — nơi import tất cả Controllers và đăng ký Routes."

### "Node.js xử lý đồng thời như thế nào chỉ với 1 luồng?"
> "Node.js dùng Event Loop. Khi chờ PostgreSQL, Node.js không đứng yên mà xử lý request khác. Khi dữ liệu về, Callback được đưa trở lại queue. Đây là Non-blocking I/O."

### "Tại sao không dùng Microservice?"
> "Microservice phù hợp khi đội ngũ lớn, nhiều dịch vụ cần scale riêng. Với nhóm 5 người và 15 tuần, Microservice tạo ra chi phí API Gateway, Service Discovery vượt xa lợi ích."

---

## PHẦN 5: ĐƯỜNG DẪN MÃ NGUỒN THAM KHẢO

- **Composition Root**: [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js)
- **Domain Entity (Tầng lõi)**: [src/entities/GradeBook.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js)
- **Interface Adapter**: [src/controllers/GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js)
- **Infrastructure (DB)**: [src/config/db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)
- **Tài liệu nghiên cứu tuần 4**: [BrainStorm/Week4 KT .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week4%20KT%20.md)

---

*Tài liệu phục vụ quay video demo chuyên đề Kiến trúc Phần mềm — Môn học Phát triển Dự án Phần mềm (SW320DV01), Đại học Hoa Sen (HSU), Học kỳ 2631.*
