# Cẩm Nang Kỹ Thuật Toàn Diện: Giải Thích Tường Tận RESTful API, Layout Component, Docker & Mối Liên Kết Mã Nguồn Hệ Thống (Comprehensive Architecture Specification: RESTful API, Layout Components, Docker & Code Mapping)

- **Dự án**: Hệ thống Quản lý Trường học (School Management System - SMS / HTQLLH)
- **Học phần**: Phát triển dự án phần mềm (SW320DV01 - 3 Tín chỉ)
- **Đơn vị đào tạo**: Đại học Hoa Sen (HSU) - Khoa Công nghệ Thông tin
- **Chủ sở hữu Repository / Trưởng nhóm**: Võ Duy Bình (DYBInh2k5)
- **Ngày hoàn thiện**: 14/10/2026

---

## MỤC LỤC TỔNG QUAN

1. [Tổng Quan Kiến Trúc Hệ Thống & Nguyên Lý Clean Architecture](#1-tổng-quan-kiến-trúc-hệ-thống--nguyên-lý-clean-architecture)
2. [Giải Thích Tường Tận Về RESTful API](#2-giải-thích-tường-tận-về-restful-api)
   - 2.1. [Bản chất của RESTful API trong mô hình Clean Architecture](#21-bản-chất-của-restful-api-trong-mô-hình-clean-architecture)
   - 2.2. [Chu trình xử lý một yêu cầu HTTP (5 Bước chuyển tiếp)](#22-chu-trình-xử-lý-một-yêu-cầu-http-5-bước-chuyển-tiếp)
   - 2.3. [Quy chuẩn mã trạng thái phản hồi HTTP (Status Codes)](#23-quy-chuẩn-mã-trạng-thái-phản-hồi-http-status-codes)
   - 2.4. [Cơ chế lọc dữ liệu bằng Tham số truy vấn (Query Parameters)](#24-cơ-chế-lọc-dữ-liệu-bằng-tham-số-truy-vấn-query-parameters)
   - 2.5. [Bảng danh mục toàn bộ các Endpoint API và tệp mã nguồn phụ trách](#25-bảng-danh-mục-toàn-bộ-các-endpoint-api-và-tệp-mã-nguồn-phụ-trách)
   - 2.6. [Quy trình kiểm thử tự động API (Smoke Test & Postman Scripts)](#26-quy-trình-kiểm-thử-tự-động-api-smoke-test--postman-scripts)
3. [Giải Thích Tường Tận Về Khung Giao Diện (Layout Components)](#3-giải-thích-tường-tận-về-khung-giao-diện-layout-components)
   - 3.1. [Triết lý Wireframe & Khung ứng dụng thống nhất (Application Shell Layout)](#31-triết-lý-wireframe--khung-ứng-dụng-thống-nhất-application-shell-layout)
   - 3.2. [Khung điều phối chủ đạo MainLayout.jsx và cơ chế lồng ghép Outlet](#32-khung-điều-phối-chủ-đạo-mainlayoutjsx-và-cơ-chế-lồng-ghép-outlet)
   - 3.3. [Thanh điều hướng Sidebar.jsx và cơ chế phân quyền động RBAC](#33-thanh-điều-hướng-sidebarjsx-và-cơ-chế-phân-quyền-động-rbac)
   - 3.4. [Thanh tiêu đề Header.jsx và kiểm soát phiên làm việc](#34-thanh-tiêu-đề-headerjsx-và-kiểm-soát-phiên-làm-việc)
   - 3.5. [Các linh kiện khung dữ liệu tái sử dụng (DataTable, KpiCard, Modal, StatusBadge)](#35-các-linh-kiện-khung-dữ-liệu-tái-sử-dụng-datatable-kpicard-modal-statusbadge)
   - 3.6. [Bảo vệ tuyến đường với ProtectedRoute.jsx và AppRouter.jsx](#36-bảo-vệ-tuyến-đường-với-protectedroutejsx-và-approuterjsx)
4. [Giải Thích Tường Tận Về Docker & Containerization](#4-giải-thích-tường-tận-về-docker--containerization)
   - 4.1. [Khái niệm cốt lõi: Image, Container, Dockerfile và Docker Compose](#41-khái-niệm-cốt-lõi-image-container-dockerfile-và-docker-compose)
   - 4.2. [Giải phẫu tệp điều phối hạ tầng docker-compose.yml](#42-giải-phẫu-tệp-điều-phối-hạ-tầng-docker-composeyml)
   - 4.3. [Giải phẫu tệp đóng gói máy chủ Backend Dockerfile](#43-giải-phẫu-tệp-đóng-gói-máy-chủ-backend-dockerfile)
   - 4.4. [Sổ tay các câu lệnh Docker CLI thiết yếu phục vụ báo cáo](#44-sổ-tay-các-câu-lệnh-docker-cli-thiết-yếu-phục-vụ-báo-cáo)
5. [Mối Liên Kết Giữa API, Clean Architecture Và Cơ Sở Dữ Liệu SQL](#5-mối-liên-kết-giữa-api-clean-architecture-và-cơ-sở-dữ-liệu-sql)
   - 5.1. [Hồ chứa kết nối Connection Pooling (pg.Pool)](#51-hồ-chứa-kết-nối-connection-pooling-pgpool)
   - 5.2. [Truy vấn tham số hóa (Parameterized Queries) phòng thủ SQL Injection](#52-truy-vấn-tham-số-hóa-parameterized-queries-phòng-thủ-sql-injection)
   - 5.3. [Điều phối giao dịch nguyên tử Unit of Work (BEGIN, COMMIT, ROLLBACK)](#53-điều-phối-giao-dịch-nguyên-tử-unit-of-work-begin-commit-rollback)
   - 5.4. [Lược đồ dữ liệu vật lý 3NF và hệ thống chỉ mục B-Tree](#54-lược-đồ-dữ-liệu-vật-lý-3nf-và-hệ-thống-chỉ-mục-b-tree)
6. [Bản Đồ Tra Cứu Toàn Bộ Tập Tin Mã Nguồn Dự Án](#6-bản-đồ-tra-cứu-toàn-bộ-tập-tin-mã-nguồn-dự-án)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG & NGUYÊN LÝ CLEAN ARCHITECTURE

Hệ thống Quản lý Trường học (HTQLLH) được kiến tạo dựa trên mô hình **Clean Architecture** kết hợp phân tầng **Modular Monolith**. Kiến trúc này phân định rạch ròi giữa giao tiếp mạng bên ngoài, tầng điều hợp giao diện, tầng quy tắc ứng dụng và tầng thực thể bất biến.

```
+-----------------------------------------------------------------------------------------------+
| TẦNG 4: FRAMEWORKS & DRIVERS (Hạ Tầng Ngoài Cùng - External Boundary)                         |
|   - Máy chủ Web Express.js: server.js                                                         |
|   - Hồ chứa kết nối PostgreSQL pg.Pool: src/config/db.js                                      |
|   - Đóng gói ảo hóa Container: Dockerfile, docker-compose.yml                                 |
|   +---------------------------------------------------------------------------------------+   |
|   | TẦNG 3: INTERFACE ADAPTERS (Bộ Điều Hợp Giao Tiếp)                                    |   |
|   |   - Slim Controllers: src/controllers/*.js (Auth, Student, GradeBook, Attendance...)  |   |
|   |   - Repositories: src/repositories/*.js (GradeBookRepository, StudentRepository...)   |   |
|   |   +-------------------------------------------------------------------------------+   |   |
|   |   | TẦNG 2: USE CASES / SERVICES (Quy Tắc Nghiệp Vụ Ứng Dụng)                     |   |   |
|   |   |   - Business Services: src/services/*.js (Tính điểm TT22, Xếp loại học lực)   |   |   |
|   |   |   - Điều phối giao dịch: src/utils/UnitOfWork.js                              |   |   |
|   |   |   +-----------------------------------------------------------------------+   |   |   |
|   |   |   | TẦNG 1: ENTITIES (Quy Tắc Nghiệp Vụ Bất Biến Lõi)                     |   |   |   |
|   |   |   |   - src/entities/GradeBook.js (Công thức tính TBM Thông tư 22)        |   |   |   |
|   |   |   |   - src/entities/Student.js (Thực thể học sinh & GPA tích lũy)        |   |   |   |
|   |   |   |   - src/entities/User.js (Thực thể tài khoản & Vai trò RBAC)          |   |   |   |
|   |   |   +-----------------------------------------------------------------------+   |   |   |
|   |   +-------------------------------------------------------------------------------+   |   |
|   +---------------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------------+
```

### Nguyên tắc Phụ thuộc Một chiều (The Dependency Rule)
Mã nguồn ở các tầng bên ngoài chỉ được phép phụ thuộc vào các tầng bên trong. Tầng bên trong **tuyệt đối không phụ thuộc vào tầng bên ngoài**:
- `Entities` (Tầng 1) và `Services` (Tầng 2) hoàn toàn là mã JavaScript thuần túy, không chứa câu lệnh `import express`, không chứa câu lệnh SQL và không biết giao thức HTTP là gì.
- `Controllers` và `Repositories` (Tầng 3) đóng vai trò là cây cầu thông dịch hai chiều giữa thế giới dữ liệu bên ngoài và các quy tắc nghiệp vụ bên trong.
- `Express.js` và `PostgreSQL` (Tầng 4) chỉ là các công cụ hạ tầng có thể tháo lắp hoặc thay thế mà không gây ảnh hưởng đến logic nghiệp vụ cốt lõi.

---

## 2. GIẢI THÍCH TƯỜNG TẬN VỀ RESTful API

### 2.1. Bản Chất Của RESTful API Trong Mô Hình Clean Architecture
Nhiều người thường nhầm lẫn rằng "RESTful API là toàn bộ backend". Trong Clean Architecture:
- **RESTful API chỉ là Cơ Chế Giao Tiếp (Delivery Mechanism) nằm ở Tầng 4 và Tầng 3.**
- Nó đóng vai trò là "cửa ngõ" chuẩn hóa: tiếp nhận các yêu cầu HTTP từ giao diện máy khách (React SPA), giải mã dữ liệu định dạng JSON, kiểm tra tính hợp lệ cú pháp sơ bộ, rồi đẩy dữ liệu thuần vào tầng Use Case bên trong.

**5 Nguyên tắc thiết kế RESTful chuẩn hóa trong hệ thống:**
1. **Resource-Oriented (Hướng tài nguyên)**: Mọi URL đều sử dụng danh từ số nhiều định danh cho tài nguyên nghiệp vụ:
   - Hồ sơ học sinh: `/api/students`
   - Sổ điểm điện tử: `/api/gradebook`
   - Chuyên cần điểm danh: `/api/attendance`
   - Đơn xin nghỉ phép: `/api/leave-requests`
   - Quản lý học phí: `/api/tuition`
2. **Sử dụng đúng động từ chuẩn HTTP (HTTP Verbs)**:
   - `GET`: Đọc và truy vấn dữ liệu (không làm thay đổi trạng thái hệ thống).
   - `POST`: Tạo mới tài nguyên hoặc kích hoạt nghiệp vụ phức tạp (`/save`, `/lock`, `/unlock`, `/pay`).
   - `PUT`: Cập nhật trạng thái bản ghi hoặc cập nhật toàn phần (`/api/students/:id`, `/api/leave-requests/:id/approve`).
3. **Stateless (Phi trạng thái)**: Máy chủ không duy trì Session của Client. Mỗi yêu cầu đều đính kèm mã chữ ký điện tử JSON Web Token trong tiêu đề:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Hợp đồng dữ liệu JSON (JSON Contract)**: 100% dữ liệu trao đổi giữa Client và Server đều ở định dạng JSON có cấu trúc rõ ràng.
5. **Cổng kiểm tra sức khỏe độc lập (Healthcheck)**: Endpoint `GET /api/health` cho phép Docker và người vận hành kiểm tra độ sẵn sàng của máy chủ API.

---

### 2.2. Chu Trình Xử Lý Một Yêu Cầu HTTP (5 Bước Chuyển Tiếp)

Khi giáo viên bấm nút "Lưu điểm" hoặc "Thêm học sinh" trên giao diện, gói tin HTTP di chuyển qua 5 chặng tuần tự:

```
[Client (React 18)]
        │  (Gửi HTTP POST /api/students kèm Body JSON)
        ▼
[Chặng 1: Express Middleware] (server.js)
        │  - CORS Middleware: Kiểm tra quyền truy cập từ domain http://localhost:5173
        │  - express.json(): Giải mã chuỗi nhị phân HTTP thành đối tượng req.body
        │  - Logging Middleware: Ghi vết thời gian thực [HTTP API] POST /api/students
        ▼
[Chặng 2: Slim Controller] (StudentController.js)
        │  - Bóc tách tham số từ req.body
        │  - Đóng vai trò Adapter: không tính toán, chỉ ủy quyền cho Service
        ▼
[Chặng 3: Business Service / Use Case] (StudentService.js)
        │  - Thực thi quy tắc nghiệp vụ: Kiểm tra GPA đầu vào
        │  - Gọi hàm: evaluateAcademicRank(gpa) để tự động thẩm định xếp loại
        ▼
[Chặng 4: Repository Data Layer] (StudentRepository.js)
        │  - Chuẩn bị truy vấn tham số hóa: INSERT INTO students (...) VALUES ($1, $2...)
        │  - Gửi gói tin truy vấn SQL qua Connection Pool (pg.Pool)
        ▼
[Chặng 5: PostgreSQL 15 Container] (Physical Database)
        │  - Kiểm tra ràng buộc khóa chính, duy nhất và ghi dữ liệu xuống đĩa cứng
        │  - Trả về bản ghi vừa tạo thông qua mệnh đề RETURNING *
        ▼
[Phản Hồi Ngược]
        PostgreSQL -> Repository -> Service -> Controller đóng gói HTTP 201 Created -> Client.
```

---

### 2.3. Quy Chuẩn Mã Trạng Thái Phản Hồi HTTP (Status Codes)

Hệ thống tuân thủ chặt chẽ các quy chuẩn phản hồi của IETF:

| Mã Trạng Thái | Tên Chuẩn | Ý Nghĩa Kỹ Thuật Trong Hệ Thống | Ví Dụ Minh Chứng |
| :--- | :--- | :--- | :--- |
| **`200 OK`** | Thành công | Thực thi truy vấn, cập nhật hoặc chốt khóa thành công | `GET /api/students`, `POST /api/gradebook/lock` |
| **`201 Created`** | Đã tạo mới | Tạo mới thành công một thực thể tài nguyên trên CSDL | `POST /api/students`, `POST /api/leave-requests` |
| **`400 Bad Request`**| Yêu cầu sai | Vi phạm quy tắc nghiệp vụ hoặc dữ liệu không hợp lệ | Cố ý sửa điểm khi sổ điểm đã bị khóa (`LOCKED`) |
| **`401 Unauthorized`**| Chưa xác thực | Không cung cấp Token hoặc Token JWT hết hạn | Truy cập API quản trị mà không đính kèm Bearer Token |
| **`403 Forbidden`**| Bị cấm quyền | Người dùng có tài khoản nhưng không đủ quyền hạn RBAC | Học sinh cố gọi API chốt khóa sổ điểm của Giáo viên |
| **`404 Not Found`**| Không tìm thấy | Không tìm thấy ID tài nguyên trong cơ sở dữ liệu | `GET /api/students/9999` |
| **`500 Server Error`**| Lỗi máy chủ | Lỗi ngoại lệ phát sinh ngoài ý muốn (sập kết nối CSDL)| Lỗi kết nối Socket máy chủ PostgreSQL |

---

### 2.4. Cơ Chế Lọc Dữ Liệu Bằng Tham Số Truy Vấn (Query Parameters)

Một ví dụ điển hình khi Giảng viên hỏi về URL:
```text
GET http://localhost:8081/api/students?className=10A1
```

- **Ký tự `?`**: Đánh dấu điểm kết thúc của đường dẫn tĩnh (Path) và mở đầu danh sách các **Query Parameters (Cặp Khóa = Giá trị)**.
- **Ký tự `&`**: Nối nhiều điều kiện lọc đồng thời (ví dụ: `?className=10A1&subjectName=Toán`).
- **Cơ chế xử lý tại Controller**:
  Tại [src/controllers/StudentController.js:L6](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js#L6), Express tự động bóc tách các tham số sau dấu `?` vào đối tượng `req.query`:
  ```javascript
  const { className } = req.query;
  const students = await StudentService.getAllStudents(className);
  ```
- **Cơ chế rẽ nhánh tại Service**:
  Tại [src/services/StudentService.js:L5-L10](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js#L5-L10):
  - Nếu không có tham số sau dấu `?`: Gọi `StudentRepository.findAll()` -> Thực thi `SELECT * FROM students ORDER BY id ASC;` (Lấy toàn trường cho Ban Giám Hiệu).
  - Nếu có `className`: Gọi `StudentRepository.findByClassName(className)` -> Thực thi `SELECT * FROM students WHERE class_name = $1 ORDER BY full_name ASC;` (Lọc riêng lớp cho Giáo viên).

---

### 2.5. Bảng Danh Mục Toàn Bộ Các Endpoint API Và Tệp Mã Nguồn Phụ Trách

Toàn bộ các tuyến đường được đăng ký tập trung tại [server.js:L31-L70](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js#L31-L70):

| Phân Hệ Nghiệp Vụ | Phương Thức | Tuyến Đường (Endpoint) | Tệp Controller Xử Lý | Tệp Service Phụ Trách | Tệp Repository CSDL |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Kiểm tra Sức khỏe** | `GET` | `/api/health` | [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js) | Không qua Service | Không qua Repository |
| **Xác thực Đăng nhập** | `POST` | `/api/auth/login` | [AuthController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js) | jwt.sign & bcryptjs | [UserRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js) |
| **Hồ sơ Học sinh** | `GET` | `/api/students` | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) | [StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js) | [StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js) |
| **Chi tiết Học sinh** | `GET` | `/api/students/:id` | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) | [StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js) | [StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js) |
| **Thêm mới Học sinh** | `POST` | `/api/students` | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) | [StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js) | [StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js) |
| **Cập nhật Học sinh** | `PUT` | `/api/students/:id` | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) | [StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js) | [StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js) |
| **Tính GPA Tích lũy** | `POST` | `/api/students/:id/calculate-gpa` | [StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) | [StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js) | [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| **Tra cứu Sổ điểm** | `GET` | `/api/gradebook` | [GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js) | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) | [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| **Lưu Bảng điểm Cả lớp**| `POST` | `/api/gradebook/save` | [GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js) | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) | [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| **Chốt Khóa Sổ điểm** | `POST` | `/api/gradebook/lock` | [GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js) | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) | [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| **Mở Khóa Sổ điểm (BGH)**| `POST`| `/api/gradebook/unlock`| [GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js) | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) | [GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) |
| **Tra cứu Điểm danh** | `GET` | `/api/attendance` | [AttendanceController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js) | [AttendanceService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/AttendanceService.js) | [AttendanceRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js) |
| **Lưu Điểm danh Cả lớp**| `POST`| `/api/attendance/save`| [AttendanceController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js) | [AttendanceService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/AttendanceService.js) | [AttendanceRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js) |
| **Danh sách Đơn Nghỉ** | `GET` | `/api/leave-requests` | [LeaveRequestController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js) | [LeaveRequestService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/LeaveRequestService.js) | [LeaveRequestRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js) |
| **Nộp Đơn Nghỉ Học** | `POST` | `/api/leave-requests` | [LeaveRequestController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js) | [LeaveRequestService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/LeaveRequestService.js) | [LeaveRequestRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js) |
| **Duyệt Đơn Nghỉ Học** | `PUT` | `/api/leave-requests/:id/approve` | [LeaveRequestController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js) | [LeaveRequestService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/LeaveRequestService.js) | [LeaveRequestRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js) |
| **Tra cứu Học phí** | `GET` | `/api/tuition` | [TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js) | [TuitionService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/TuitionService.js) | [TuitionRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/TuitionRepository.js) |
| **Đóng Học phí & Biên lai**| `POST`| `/api/tuition/pay` | [TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js) | [TuitionService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/TuitionService.js) | [TuitionRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/TuitionRepository.js) |
| **Danh mục Lớp học** | `GET` | `/api/classes` | [ClassController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js) | Không qua Service | [ClassRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/ClassRepository.js) |
| **Danh mục Môn học** | `GET` | `/api/subjects` | [SubjectController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/SubjectController.js) | Không qua Service | [SubjectRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/SubjectRepository.js) |

---

### 2.6. Quy Trình Kiểm Thử Tự Động API (Smoke Test & Postman Scripts)

#### 1. Kiểm thử tự động bằng Node.js script:
Tập tin [test-api.mjs](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/test-api.mjs) cho phép chạy kiểm thử toàn diện toàn bộ 10 phân hệ API chỉ với một câu lệnh:
```bash
node test-api.mjs
```
Kết quả in ra trạng thái `PASS` và độ trễ mili-giây cho từng API.

#### 2. Kịch bản kiểm thử tự động trên Postman (Postman Tests Tab):
Khi gửi yêu cầu `POST http://localhost:8081/api/students` trên Postman, dán đoạn mã JavaScript sau vào thẻ **Tests**:
```javascript
pm.test("[HTTP Status] Phản hồi đúng chuẩn 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("[Performance] Tốc độ đáp ứng dưới 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});
const data = pm.response.json();
pm.test("[Clean Rule] Tự động xếp loại 'Giỏi' cho GPA 8.8", function () {
    pm.expect(data.academic_rank).to.eql("Giỏi");
});
```

---

## 3. GIẢI THÍCH TƯỜNG TẬN VỀ KHUNG GIAO DIỆN (LAYOUT COMPONENTS)

### 3.1. Triết Lý Wireframe & Khung Ứng Dụng Thống Nhất (Application Shell Layout)
Trong phát triển ứng dụng Web SPA hiện đại, cấu trúc giao diện được rã thành 2 phần tách biệt:
1. **Khung sườn cố định (App Shell)**: Gồm Sidebar và Header. Khung này được tải một lần duy nhất lúc khởi động, giữ cố định kích thước và không bao giờ bị dựng lại (re-render) khi người dùng di chuyển giữa các trang.
2. **Vùng nội dung động (Dynamic View)**: Vùng làm việc chính thay đổi nội dung linh hoạt theo từng URL mà không làm rung lắc hay nhấp nháy khung sườn.

```
+-----------------------------------------------------------------------------------------+
| [CỘT TRÁI: Sidebar.jsx]        | [CỘT PHẢI TRÊN: Header.jsx]                            |
| - Chiều rộng: 260px / 68px     | - Chiều cao cố định: 64px (h-16)                       |
| - Logo trường THPT HSU         | - Tiêu đề động: ánh xạ từ PAGE_TITLES                  |
| - Menu lọc theo vai trò (RBAC) | - Chỉ báo niên khóa: Học kỳ I (2024-2025)              |
| - Trạng thái gập/mở bền vững   | - Avatar người dùng + Chip vai trò phân màu            |
| - Nút gập mở ở chân trang      | - Nút Đăng xuất kết nối AuthContext                    |
|                                +--------------------------------------------------------+
|                                | [VÙNG TRUNG TÂM: <main> chứa <Outlet />]               |
|                                | - Bơm trực tiếp các trang chức năng:                   |
|                                |   GradebookPage, AttendancePage, StudentListPage...    |
|                                | - Vùng cuộn độc lập (overflow-y: auto, nền #f8fafc)    |
+-----------------------------------------------------------------------------------------+
```

---

### 3.2. Khung Điều Phối Chủ Đạo `MainLayout.jsx` Và Cơ Chế Lồng Ghép `<Outlet />`
- **Tập tin mã nguồn**: [src/components/layout/MainLayout.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/MainLayout.jsx)
- **Cấu trúc Flexbox bao bọc**:
  ```jsx
  <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
    <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(c => !c)} />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title={pageTitle} />
      <main className="flex-1 overflow-auto p-gutter-lg bg-[#f8fafc]">
        <Outlet />
      </main>
    </div>
  </div>
  ```
- **Ý nghĩa kỹ thuật của `<Outlet />`**:
  Linh kiện `<Outlet />` của thư viện `react-router-dom` hoạt động như một "ổ cắm linh hoạt". Khi URL là `/gv/gradebook`, `GradebookPage` sẽ được đưa vào `<Outlet />`. Khi URL đổi thành `/students`, `StudentListPage` sẽ thay thế vị trí đó. Toàn bộ Sidebar và Header ở xung quanh được giữ nguyên trạng thái bộ nhớ.
- **Lưu trữ trạng thái bền vững**:
  Sử dụng `localStorage.setItem('sidebar_collapsed', String(isCollapsed))` để ghi nhớ tùy chọn mở rộng/thu gọn của người dùng qua các phiên làm việc.
- **Bản đồ tiêu đề tự động (`PAGE_TITLES`)**:
  Ánh xạ chính xác từng URL sang tên tiếng Việt hiển thị trên đỉnh màn hình (ví dụ: `/bgh/dashboard` -> `"Tổng quan quản trị"`, `/gv/gradebook` -> `"Sổ điểm"`).

---

### 3.3. Thanh Điều Hướng `Sidebar.jsx` Và Cơ Chế Phân Quyền Động RBAC
- **Tập tin mã nguồn**: [src/components/layout/Sidebar.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Sidebar.jsx)
- **Lọc menu động dựa trên vai trò**:
  ```javascript
  const { role } = useAuth();
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  ```
  Nhờ đoạn mã này, một tài khoản chỉ nhìn thấy các chức năng thuộc quyền hạn của mình:
  - `ROLES.BGH`: Xem các báo cáo toàn trường, xếp thời khóa biểu và giám sát chuyên cần.
  - `ROLES.GVCN`: Xem danh sách lớp chủ nhiệm, duyệt đơn nghỉ phép của phụ huynh.
  - `ROLES.GV`: Xem sổ điểm các môn phụ trách và lịch giảng dạy.
  - `ROLES.PH` / `ROLES.HS`: Xem điểm số, thời khóa biểu học tập và tình hình đóng học phí.
- **Trạng thái thu gọn 2 cấp độ**:
  - Khi mở rộng: Chiều rộng `260px`, hiển thị tên phân hệ đầy đủ.
  - Khi thu gọn: Rút ngắn về `68px`, chỉ hiển thị icon vector chuẩn Material Symbols, giúp mở rộng tối đa diện tích hiển thị bảng điểm 45 học sinh.
- **Đánh dấu mục đang xem (`<NavLink isActive>`)**:
  Tự động đổi màu nền sang xanh dương đậm `bg-[#004ac6] text-white` khi URL trùng khớp với `item.path`.
- **Tối ưu hóa in ấn (`print:hidden`)**:
  Ẩn hoàn toàn thanh Sidebar khi người dùng xuất lệnh in (Ctrl+P).

---

### 3.4. Thanh Tiêu Đề `Header.jsx` Và Kiểm Soát Phiên Làm Việc
- **Tập tin mã nguồn**: [src/components/layout/Header.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Header.jsx)
- **Độ cao chuẩn hóa**: Chiều cao `64px` (`h-16`) tạo đường thẳng ngang cố định.
- **Bảng màu định danh vai trò (Role Badges)**:
  - Giáo viên Bộ môn (`GV`): `bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]` (Xanh dương nhạt)
  - Giáo viên Chủ nhiệm (`GVCN`): `bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]` (Tím nhạt)
  - Ban Giám Hiệu (`BGH`): `bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]` (Cam đất)
  - Phụ huynh (`PH`): `bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]` (Xanh lá cây)
  - Học sinh (`HS`): `bg-[#f8fafc] text-[#334155] border-[#e2e8f0]` (Xám)
- **Nút Đăng xuất**: Gọi hàm `logout()` từ [AuthContext.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/context/AuthContext.jsx), xóa mã Token khỏi trình duyệt và điều hướng về trang đăng nhập.

---

### 3.5. Các Linh Kiện Khung Dữ Liệu Tái Sử Dụng (Shared UI Components)

Thư mục quản lý: [members/member2_Frontend/src/components/shared](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared)

1. **`DataTable.jsx` — Khung Bảng Ma Trận Dữ Liệu Kiểu Excel**:
   - Tệp mã nguồn: [src/components/shared/DataTable.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/DataTable.jsx)
   - Thuộc tính `stickyFirstColumn`: Cố định cột số thứ tự và họ tên học sinh bên trái màn hình khi cuộn ngang qua các cột điểm kiểm tra.
   - Kiểu chữ `tabular-nums`: Bảo đảm các con số điểm số học thẳng hàng dọc chính xác.
2. **`KpiCard.jsx` — Thẻ Bố Cục Chỉ Số Học Vụ**:
   - Tệp mã nguồn: [src/components/shared/KpiCard.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/KpiCard.jsx)
   - Trực quan hóa các chỉ số: Sĩ số toàn trường, Tỷ lệ chuyên cần, Điểm trung bình khối kèm huy hiệu xu hướng tăng trưởng xanh/đỏ (`trendPositive`).
3. **`Modal.jsx` — Khung Hộp Thoại Tương Tác Nổi**:
   - Tệp mã nguồn: [src/components/shared/Modal.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/Modal.jsx)
   - Lớp phủ mờ nền (backdrop blur) căn giữa màn hình phục vụ việc sửa học sinh, duyệt đơn nghỉ học hoặc xác nhận chốt khóa điểm.
4. **`StatusBadge.jsx` — Huy Hiệu Trạng Thái Thống Nhất**:
   - Tệp mã nguồn: [src/components/shared/StatusBadge.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/StatusBadge.jsx)
   - Chuẩn hóa màu sắc trạng thái: `LOCKED` (đã khóa sổ điểm), `APPROVED` (đã duyệt), `PENDING` (chờ duyệt), `PAID` (đã đóng học phí).

---

### 3.6. Bảo Vệ Tuyến Đường Với `ProtectedRoute.jsx` Và `AppRouter.jsx`
- **Tập tin mã nguồn**: [src/routes/AppRouter.jsx:L63-L115](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/routes/AppRouter.jsx#L63-L115) và [src/components/auth/ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx)
- **Nguyên lý bọc hai lớp**:
  1. Lớp ngoài: `<Route element={<MainLayout />}>` bảo đảm tất cả các trang bên trong đều có Sidebar và Header. Các trang công khai như [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) nằm ngoài `MainLayout` nên hiển thị tràn toàn màn hình.
  2. Lớp trong: `<Route element={<ProtectedRoute roles={[ROLES.BGH]} />}>` kiểm tra quyền. Nếu người dùng cố tình gõ URL không thuộc quyền hạn của mình, hệ thống lập tức chặn lại và chuyển hướng về [UnauthorizedPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/UnauthorizedPage.jsx).

---

## 4. GIẢI THÍCH TƯỜNG TẬN VỀ DOCKER & CONTAINERIZATION

### 4.1. Khái Niệm Cốt Lõi: Image, Container, Dockerfile Và Docker Compose

Khi báo cáo với Giảng viên, bạn cần phân biệt rạch ròi 4 khái niệm này:

1. **Docker Image (Bản đóng gói mẫu - Khuôn đúc)**:
   - Là một gói phần mềm tĩnh chỉ đọc, chứa toàn bộ mã nguồn, thư viện runtime, công cụ hệ thống và cấu hình cần thiết để ứng dụng có thể chạy được ở bất kỳ máy tính nào mà không bị lỗi thiếu môi trường ("It works on my machine").
   - Ví dụ trong hệ thống: `postgres:15-alpine` và Image máy chủ Node.js được build từ Dockerfile.
2. **Docker Container (Thực thể hoạt động - Ngôi nhà được xây từ khuôn)**:
   - Là một tiến trình thực thi cô lập được tạo ra từ Docker Image. Container có hệ thống tệp riêng, cổng mạng riêng và bộ nhớ RAM riêng nhưng dùng chung nhân Linux với máy chủ thật (Host OS), giúp khởi động siêu tốc chỉ trong vài giây (nhẹ hơn máy ảo Virtual Machine rất nhiều).
3. **Dockerfile (Kịch bản xây dựng Image)**:
   - Là tệp văn bản chứa các chỉ thị từng bước để đóng gói mã nguồn thành một Docker Image.
4. **Docker Compose (Điều phối đa dịch vụ - Multi-container Orchestration)**:
   - Là công cụ điều phối cho phép khởi chạy và liên kết nhiều container (ví dụ: Container CSDL và Container Backend) chạy chung trong một mạng nội bộ ảo thông qua một tệp cấu hình duy nhất [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml).

---

### 4.2. Giải Phẫu Tệp Điều Phối Hạ Tầng `docker-compose.yml`

Tập tin cấu hình: [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml)

```yaml
version: '3.8'

services:
  # 1. DỊCH VỤ CƠ SỞ DỮ LIỆU POSTGRESQL
  postgres-db:
    image: postgres:15-alpine          # Bản PostgreSQL 15 trên nền Alpine Linux (~80MB)
    container_name: htqllh_postgres    # Đặt tên định danh cố định cho container
    restart: always                    # Tự khởi động lại khi gặp sự cố
    environment:
      POSTGRES_DB: school_management   # Tên cơ sở dữ liệu mặc định
      POSTGRES_USER: postgres          # Tài khoản quản trị
      POSTGRES_PASSWORD: postgres      # Mật khẩu quản trị
    ports:
      - "5434:5432"                    # Ánh xạ: Cổng 5434 máy ngoài -> Cổng 5432 bên trong container
    volumes:
      - postgres_data:/var/lib/postgresql/data # Gắn vùng nhớ bền vững
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d school_management"]
      interval: 5s                     # Kiểm tra định kỳ mỗi 5 giây
      timeout: 5s                      # Thời gian chờ tối đa 5 giây
      retries: 5                       # Thử lại 5 lần trước khi báo lỗi

  # 2. DỊCH VỤ MÁY CHỦ BACKEND NODE.JS
  backend-api:
    build:
      context: ./members/member3_Backend_DB/school-management-nodejs
      dockerfile: Dockerfile
    container_name: htqllh_backend
    restart: always
    ports:
      - "8081:8081"
    environment:
      PORT: 8081
      DB_HOST: postgres-db             # Kết nối qua DNS nội bộ của Docker thay vì localhost
      DB_PORT: 5432                    # Cổng nội bộ của dịch vụ CSDL
      DB_NAME: school_management
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: HTQLLH_Super_Secret_JWT_Key_2026
    depends_on:
      postgres-db:
        condition: service_healthy     # Chỉ khởi chạy khi CSDL đã sẵn sàng 100%

volumes:
  postgres_data:                       # Khối lưu trữ vĩnh viễn trên ổ cứng máy chủ
```

#### Ba điểm kỹ thuật đắt giá trong cấu hình Docker Compose:
1. **Tại sao ánh xạ cổng `"5434:5432"`?**:
   Cổng mặc định của PostgreSQL là `5432`. Tuy nhiên, trên máy tính của Giảng viên hoặc thành viên nhóm thường đã cài sẵn một phiên bản PostgreSQL cục bộ chạy cổng 5432. Bằng cách đổi cổng bên ngoài thành `5434`, hệ thống loại bỏ 100% nguy cơ xung đột cổng (`Port Conflict`), trong khi cổng nội bộ bên trong mạng Docker vẫn giữ nguyên là 5432.
2. **Khối lưu trữ bền vững (Named Volume `postgres_data`)**:
   Mặc định khi một Container bị xóa, mọi dữ liệu bên trong sẽ biến mất. Bằng cách khai báo Volume `postgres_data` gắn vào `/var/lib/postgresql/data`, toàn bộ dữ liệu 45 học sinh và điểm số Thông tư 22 được lưu trực tiếp trên ổ cứng vật lý của máy tính chủ. Khi bạn gõ `docker stop` hoặc khởi động lại máy, dữ liệu vẫn nguyên vẹn 100%.
3. **Cơ chế kiểm tra sức khỏe phụ thuộc (`service_healthy`)**:
   Khi gõ lệnh chạy hệ thống, máy chủ Node.js thường khởi động nhanh hơn cơ sở dữ liệu. Nếu Node.js chạy trước mà CSDL chưa sẵn sàng, ứng dụng sẽ bị sập (Crash). Khối `healthcheck` liên tục gửi lệnh `pg_isready`; khi CSDL báo trạng thái Healthy thì Docker Compose mới cho phép dịch vụ `backend-api` khởi chạy.

---

### 4.3. Giải Phẫu Tệp Đóng Gói Máy Chủ Backend `Dockerfile`

Tập tin cấu hình: [members/member3_Backend_DB/school-management-nodejs/Dockerfile](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/Dockerfile)

```dockerfile
# 1. Base Image siêu nhẹ dựa trên Alpine Linux
FROM node:18-alpine

# 2. Tạo thư mục làm việc bên trong container
WORKDIR /app

# 3. Sao chép danh sách phụ thuộc và cài đặt gói sản phẩm (Production)
COPY package*.json ./
RUN npm install --production

# 4. Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# 5. Khai báo cổng lắng nghe của máy chủ Express
EXPOSE 8081

# 6. Thiết lập các biến môi trường mặc định
ENV PORT=8081
ENV NODE_ENV=production

# 7. Lệnh thực thi chính thức khi khởi động Container
CMD ["node", "server.js"]
```

---

### 4.4. Sổ Tay Toàn Diện Các Câu Lệnh Docker CLI Thiết Yếu Phục Vụ Vận Hành Và Báo Cáo

Nhằm phục vụ báo cáo trực tiếp trước Hội đồng và thao tác thực tế trên Terminal, dưới đây là bảng tra cứu đầy đủ các câu lệnh Docker CLI được phân loại theo từng nhóm nghiệp vụ kỹ thuật:

#### 4.4.1. Nhóm Lệnh Điều Phối Đa Dịch Vụ Với Docker Compose
```bash
# 1. Khởi động toàn bộ cụm dịch vụ (CSDL PostgreSQL + Backend API) ở chế độ chạy ngầm (detached)
docker compose up -d

# 2. Tái xây dựng lại Image khi có thay đổi trong Dockerfile hoặc mã nguồn backend mà không dùng bộ nhớ đệm
docker compose build --no-cache

# 3. Khởi động lại cụm dịch vụ và ép buộc tạo lại container
docker compose up -d --build --force-recreate

# 4. Kiểm tra trạng thái hoạt động và cổng ánh xạ của các dịch vụ trong compose
docker compose ps

# 5. Xem nhật ký tổng hợp của toàn bộ các dịch vụ thời gian thực
docker compose logs -f --tail 100

# 6. Xem nhật ký riêng biệt của dịch vụ cơ sở dữ liệu
docker compose logs -f postgres-db

# 7. Khởi động lại một dịch vụ cụ thể mà không làm gián đoạn các dịch vụ khác
docker compose restart backend-api

# 8. Dừng toàn bộ cụm dịch vụ một cách an toàn nhưng giữ nguyên container
docker compose stop

# 9. Dừng và hủy bỏ toàn bộ container, mạng ảo do Compose tạo ra (dữ liệu Volume vẫn được bảo toàn)
docker compose down

# 10. CẢNH BÁO: Hủy toàn bộ container kèm XÓA TOÀN BỘ DỮ LIỆU VOLUME (chỉ dùng khi muốn reset trắng hoàn toàn)
docker compose down -v
```

#### 4.4.2. Nhóm Lệnh Quản Lý Vòng Đời Container Độc Lập
```bash
# 1. Liệt kê danh sách các container đang chạy
docker ps

# 2. Liệt kê toàn bộ các container trong hệ thống (bao gồm cả container đã dừng)
docker ps -a

# 3. Khởi động một container cụ thể đã bị dừng
docker start htqllh_postgres

# 4. Tạm dừng một container đang chạy
docker stop htqllh_postgres

# 5. Khởi động lại nhanh container
docker restart htqllh_postgres

# 6. Xóa vĩnh viễn một container đã dừng
docker rm htqllh_postgres

# 7. Ép buộc dừng và xóa ngay lập tức một container đang hoạt động
docker rm -f htqllh_postgres

# 8. Theo dõi mức độ tiêu thụ tài nguyên phần cứng (CPU %, RAM, Network I/O) thời gian thực của container
docker stats htqllh_postgres htqllh_backend

# 9. Xem danh sách các tiến trình (Processes) đang thực thi bên trong container
docker top htqllh_postgres

# 10. Trích xuất toàn bộ siêu dữ liệu cấu hình chi tiết của container (Địa chỉ IP, Cổng, Mounts, Biến môi trường)
docker inspect htqllh_postgres
```

#### 4.4.3. Nhóm Lệnh Quản Lý Docker Image (Bản Đóng Gói Mẫu)
```bash
# 1. Liệt kê tất cả các Docker Image hiện có trên máy tính
docker images

# 2. Xây dựng Docker Image thủ công từ Dockerfile trong thư mục hiện hành và gắn nhãn (tag)
docker build -t htqllh-backend:v1.0 ./members/member3_Backend_DB/school-management-nodejs

# 3. Xóa một Docker Image khỏi ổ cứng
docker rmi htqllh-backend:v1.0

# 4. Dọn dẹp tất cả các Image rác không còn gắn nhãn (dangling images)
docker image prune -f

# 5. Dọn dẹp tổng thể hệ thống (Xóa toàn bộ container dừng, mạng không dùng, và cache build giải phóng dung lượng đĩa)
docker system prune -a --volumes
```

#### 4.4.4. Nhóm Lệnh Quản Lý Vùng Nhớ Bền Vững (Named Volumes)
```bash
# 1. Liệt kê danh sách các Volume đang lưu trữ trên máy tính
docker volume ls

# 2. Kiểm tra chi tiết đường dẫn vật lý trên ổ cứng của Volume CSDL
docker volume inspect postgres_data

# 3. Sao lưu toàn bộ dữ liệu Volume CSDL ra tệp nén tar trên máy chủ vật lý
docker run --rm -v postgres_data:/volume -v ${PWD}:/backup alpine tar czf /backup/postgres_data_backup.tar.gz -C /volume .

# 4. Khôi phục dữ liệu từ tệp nén tar vào Volume CSDL
docker run --rm -v postgres_data:/volume -v ${PWD}:/backup alpine sh -c "cd /volume && tar xzf /backup/postgres_data_backup.tar.gz"
```

#### 4.4.5. Nhóm Lệnh Tương Tác Trực Tiếp Với Cơ Sở Dữ Liệu PostgreSQL Trong Container
```bash
# 1. Mở cửa sổ tương tác dòng lệnh psql trực tiếp với tư cách quản trị viên postgres
docker exec -it htqllh_postgres psql -U postgres -d school_management

# 2. Thực thi nhanh một câu lệnh SQL từ bên ngoài mà không cần vào terminal psql
docker exec -it htqllh_postgres psql -U postgres -d school_management -c "SELECT class_name, COUNT(*) FROM students GROUP BY class_name;"

# 3. Xuất sao lưu toàn bộ cơ sở dữ liệu ra tệp .sql (Database Dump)
docker exec -t htqllh_postgres pg_dump -U postgres school_management > backup_school_management.sql

# 4. Phục hồi toàn bộ cơ sở dữ liệu từ tệp .sql vào container
docker exec -i htqllh_postgres psql -U postgres -d school_management < backup_school_management.sql

# 5. Kiểm tra sức khỏe của dịch vụ PostgreSQL bằng tiện ích pg_isready
docker exec -it htqllh_postgres pg_isready -U postgres -d school_management
```

---

## 5. MỐI LIÊN KẾT GIỮA API, CLEAN ARCHITECTURE VÀ CƠ SỞ DỮ LIỆU SQL

### 5.1. Hồ Chứa Kết Nối Connection Pooling (`pg.Pool`)
Tập tin mã nguồn: [src/config/db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)

```javascript
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434', 10),
  database: process.env.DB_NAME || 'school_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,                      // Tối đa 10 kết nối đồng thời trong hồ chứa
  idleTimeoutMillis: 10000,     // Thu hồi kết nối sau 10 giây không dùng
  connectionTimeoutMillis: 2000 // Hủy nếu quá 2 giây không lấy được kết nối
});
```

### 5.2. Truy Vấn Tham Số Hóa (Parameterized Queries) Phòng Thủ SQL Injection
Tập tin mã nguồn: [src/repositories/StudentRepository.js:L37-L43](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js#L37-L43)

Hệ thống tuyệt đối **không bao giờ cộng chuỗi SQL trực tiếp**. Mọi giá trị người dùng gửi lên đều được thay thế bằng ký hiệu `$1, $2, ... $10`:
```javascript
const res = await query(
  `INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
  [s.studentCode, s.fullName, s.gender, s.dob, s.className, s.parentName, s.parentPhone, s.gpa, s.academicRank, s.status || 'ACTIVE']
);
```

### 5.3. Điều Phối Giao Dịch Nguyên Tử Unit of Work (`BEGIN`, `COMMIT`, `ROLLBACK`)
Tập tin mã nguồn: [src/utils/UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)

Khi giáo viên thực hiện lưu bảng điểm cả lớp gồm 45 học sinh, hệ thống không cập nhật rời rạc từng em mà gom toàn bộ vào một khối giao dịch nguyên tử:
```sql
BEGIN;                                           -- Bắt đầu giao dịch
UPDATE grade_books SET score_oral = 9.0 WHERE id = 1;
UPDATE grade_books SET score_oral = 8.5 WHERE id = 2;
-- ... thực thi liên tiếp 45 bản ghi
COMMIT;                                          -- Xác nhận vĩnh viễn nếu 45 em đều hợp lệ
-- Nếu có bất kỳ lỗi nào ở học sinh thứ 40 -> Hệ thống tự động phát lệnh:
ROLLBACK;                                        -- Hoàn tác 100%, bảo toàn dữ liệu ban đầu
```

### 5.4. Lược Đồ Dữ Liệu Vật Lý 3NF Và Hệ Thống Chỉ Mục B-Tree
Tập tin DDL: [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql) và [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md)

- **8 Thực thể cốt lõi**: `users`, `school_classes`, `subjects`, `students`, `grade_books`, `attendances`, `leave_requests`, `tuitions`.
- **Hệ thống chỉ mục B-Tree (Indexes) tăng tốc truy vấn**:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);
  CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
  CREATE INDEX IF NOT EXISTS idx_grade_books_search ON grade_books(student_code, subject_name, semester);
  CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON attendances(class_name, att_date);
  ```

---

## 6. BẢN ĐỒ TRA CỨU TOÀN BỘ TẬP TIN MÃ NGUỒN DỰ ÁN

Bảng dưới đây là kim chỉ nam giúp bạn nhấp chuột trực tiếp đến bất kỳ tệp mã nguồn nào trong toàn bộ dự án:

### Phân Hệ Backend (Node.js Express Clean Architecture)
- Khởi động máy chủ & Composition Root: [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js)
- Khai báo gói thư viện phụ thuộc: [package.json](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/package.json)
- Đóng gói ảo hóa Container: [Dockerfile](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/Dockerfile)
- Kết nối CSDL & Khởi tạo bảng tự động: [src/config/db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)
- Bộ nạp dữ liệu mẫu ban đầu: [src/seeders/dataInitializer.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js)
- Giao dịch nguyên tử Unit of Work: [src/utils/UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)
- Ghi vết kiểm toán lịch sử sửa điểm: [src/utils/AuditLogger.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js)
- **Tầng Thực Thể (Entities)**:
  - [src/entities/GradeBook.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js)
  - [src/entities/Student.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/Student.js)
  - [src/entities/User.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/User.js)
- **Tầng Nghiệp Vụ (Services / Use Cases)**:
  - [src/services/GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js)
  - [src/services/StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js)
  - [src/services/AttendanceService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/AttendanceService.js)
  - [src/services/LeaveRequestService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/LeaveRequestService.js)
  - [src/services/TuitionService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/TuitionService.js)
- **Tầng Bộ Điều Khiển (Controllers)**:
  - [src/controllers/AuthController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js)
  - [src/controllers/StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js)
  - [src/controllers/GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js)
  - [src/controllers/AttendanceController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js)
  - [src/controllers/LeaveRequestController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js)
  - [src/controllers/TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js)
  - [src/controllers/ClassController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js)
  - [src/controllers/SubjectController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/SubjectController.js)
- **Tầng Kho Dữ Liệu SQL (Repositories)**:
  - [src/repositories/GradeBookRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js)
  - [src/repositories/StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js)
  - [src/repositories/AttendanceRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js)
  - [src/repositories/LeaveRequestRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js)
  - [src/repositories/TuitionRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/TuitionRepository.js)
  - [src/repositories/UserRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js)
  - [src/repositories/ClassRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/ClassRepository.js)
  - [src/repositories/SubjectRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/SubjectRepository.js)

---

### Phân Hệ Frontend (React 18 & Vite SPA)
- Điểm gắn kết DOM: [index.html](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/index.html) và [src/main.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/main.jsx)
- Cấu hình đóng gói Vite & Tailwind: [vite.config.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/vite.config.js), [tailwind.config.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/tailwind.config.js), [src/index.css](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/index.css)
- Bộ định tuyến & Bảo vệ vai trò: [src/routes/AppRouter.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/routes/AppRouter.jsx) và [src/components/auth/ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx)
- Quản lý phiên xác thực Token: [src/context/AuthContext.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/context/AuthContext.jsx)
- Giao tiếp mạng HTTP Client & Stubs: [src/api/client.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/api/client.js) và [src/api/stubs.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/api/stubs.js)
- Xuất dữ liệu Excel SheetJS: [src/utils/exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/utils/exportEngine.js)
- **Khung Bố Cục Giao Diện (Layouts)**:
  - [src/components/layout/MainLayout.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/MainLayout.jsx)
  - [src/components/layout/Sidebar.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Sidebar.jsx)
  - [src/components/layout/Header.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Header.jsx)
- **Linh Kiện Khung Dùng Chung (Shared UI)**:
  - [src/components/shared/DataTable.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/DataTable.jsx)
  - [src/components/shared/KpiCard.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/KpiCard.jsx)
  - [src/components/shared/Modal.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/Modal.jsx)
  - [src/components/shared/StatusBadge.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/StatusBadge.jsx)
- **Các Màn Hình Chức Năng Tiêu Biểu**:
  - Sổ điểm điện tử môn học: [src/pages/gv/GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx)
  - Điểm danh học sinh: [src/pages/gv/AttendancePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/AttendancePage.jsx)
  - Quản lý hồ sơ học sinh: [src/pages/students/StudentListPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/students/StudentListPage.jsx)
  - Bảng điều khiển Ban Giám Hiệu: [src/pages/bgh/BGHDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx)
  - Cổng thông tin phụ huynh: [src/pages/communication/ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx)

---

### Phân Hệ Hạ Tầng Triển Khai & Kiểm Thử
- Kịch bản kiểm thử tự động toàn bộ 10 API: [test-api.mjs](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/test-api.mjs)
- Cấu hình điều phối hạ tầng: [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml)
- Bản phác thảo CSDL SQL chuẩn: [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql)
- Sơ đồ quan hệ thực thể ERD: [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md)
- Slide thuyết trình toàn khung bảo vệ đồ án: [Sprint/index.html](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/Sprint/index.html)

---

---

## 7. BỘ CÂU HỎI PHẢN BIỆN CỦA GIẢNG VIÊN VÀ HƯỚNG DẪN TRẢ LỜI (DEFENSE Q&A BANK)

Tài liệu tổng hợp các câu hỏi hóc búa nhất mà Giảng viên thường đặt ra khi phản biện đồ án Phát Triển Dự Án Phần Mềm, chia theo 3 chuyên đề: Layout Components, RESTful API (Clean Architecture) và Docker (Containerization).

---

### CHUYÊN ĐỀ 1: LAYOUT COMPONENTS VÀ KIẾN TRÚC FRONTEND REACT

#### Câu 1: Em hãy giải thích mô hình Application Shell trong `MainLayout.jsx` và tại sao dùng `<Outlet />` thay vì reload lại trang?
- **Tập tin minh chứng**: [src/components/layout/MainLayout.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/MainLayout.jsx) và [src/routes/AppRouter.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/routes/AppRouter.jsx)
- **Câu trả lời chuẩn**:
  - Hệ thống HTQLLH được xây dựng theo mô hình **Single Page Application (SPA)** với kiến trúc **Application Shell Pattern**. 
  - `MainLayout` đóng vai trò là "bộ vỏ khung" (Shell) cố định bao gồm Sidebar điều hướng bên trái và Header định danh bên trên. Phần thân nội dung thay đổi linh hoạt được chỉ định bởi thẻ `<Outlet />` của thư viện `react-router-dom`.
  - **Lợi ích kỹ thuật**:
    1. **Tối ưu hiệu năng rendering**: Khi người dùng chuyển trang từ Sổ điểm (`/gv/gradebook`) sang Điểm danh (`/gv/attendance`), trình duyệt không hề gửi yêu cầu tải lại toàn bộ tài liệu HTML từ máy chủ (`No Full Page Reload`). 
    2. **Giữ nguyên trạng thái (State Persistence)**: Phiên đăng nhập, trạng thái thu gọn Sidebar và bộ đệm tài nguyên không bị mất đi. Trình duyệt chỉ việc tháo gỡ (unmount) Component cũ và gắn kết (mount) Component mới vào vị trí `<Outlet />`, giảm thời gian phản hồi từ ~1500ms xuống dưới 50ms.

#### Câu 2: Phân quyền hiển thị menu trên `Sidebar.jsx` hoạt động ra sao? Nếu người dùng cố tình thay đổi URL trình duyệt thì hệ thống xử lý như thế nào?
- **Tập tin minh chứng**: [src/components/layout/Sidebar.jsx:L16-L35](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Sidebar.jsx#L16-L35), [src/components/auth/ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx)
- **Câu trả lời chuẩn**:
  - Hệ thống thực hiện cơ chế bảo mật hai tầng (Two-Tier Security):
    1. **Tầng trực quan (Sidebar UI Filtering)**: Trong `Sidebar.jsx`, mảng `navItems` được lọc thông qua điều kiện `item.roles.includes(currentUser.role)`. Giáo viên chỉ thấy các mục của giáo viên (Sổ điểm, Điểm danh), Ban Giám Hiệu thấy Báo cáo tổng hợp, Phụ huynh chỉ thấy Cổng tra cứu.
    2. **Tầng phòng thủ tuyến đường (Router Guarding)**: Nếu người dùng có vai trò Phụ huynh cố tình gõ URL `/bgh/dashboard` trên thanh địa chỉ, Component [ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx) sẽ kiểm tra vai trò hiện tại với mảng quyền được cấp phép `roles={[ROLES.BGH]}`. Khi phát hiện vi phạm, hệ thống chặn truy cập ngay lập tức và chuyển hướng người dùng đến trang [UnauthorizedPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/UnauthorizedPage.jsx).
    3. Ngoài ra, tại máy chủ Backend, các API nhạy cảm đều được bảo vệ bởi middleware `authorize([ROLES.BGH])`, ngăn chặn triệt để mọi hành vi can thiệp trái phép qua Postman/cURL.

#### Câu 3: Làm thế nào `Header.jsx` cập nhật được tên người dùng và huy hiệu vai trò (Role Badge) theo thời gian thực?
- **Tập tin minh chứng**: [src/components/layout/Header.jsx:L10-L28](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Header.jsx#L10-L28) và [src/context/AuthContext.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/context/AuthContext.jsx)
- **Câu trả lời chuẩn**:
  - Hệ thống sử dụng **React Context API** (`AuthContext`) để chia sẻ trạng thái người dùng toàn cục mà không gặp hiện tượng truyền props lòng vòng (Prop Drilling).
  - Trong `Header.jsx`, hook `useAuth()` trích xuất đối tượng `currentUser`. Bất cứ khi nào người dùng đăng nhập hoặc đổi tài khoản từ thanh Dev Bar, `AuthContext` cập nhật giá trị `state`, kích hoạt cơ chế Reactive Re-render giúp Header cập nhật tức thì:
    - Họ tên người dùng hiển thị: `currentUser.name`.
    - Huy hiệu vai trò ánh xạ theo từ điển: `ROLE_LABELS[currentUser.role]` và gán màu sắc chuyên biệt (`bg-purple-100 text-purple-700` cho BGH, `bg-blue-100 text-blue-700` cho GVCN).

#### Câu 4: Trong trang nhập điểm `GradebookPage.jsx`, bảng `DataTable.jsx` xử lý việc cố định cột học sinh (Sticky Column) và căn chỉnh điểm số như thế nào?
- **Tập tin minh chứng**: [src/components/shared/DataTable.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/shared/DataTable.jsx) và [src/pages/gv/GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/gv/GradebookPage.jsx)
- **Câu trả lời chuẩn**:
  - Sổ điểm điện tử môn học chứa rất nhiều cột: Điểm kiểm tra miệng, Điểm 15 phút, Điểm 1 tiết, Điểm giữa kỳ, Điểm cuối kỳ và Điểm trung bình môn.
  - Khi màn hình bị tràn ngang (Horizontal Overflow), thuộc tính `stickyFirstColumn` trong `DataTable.jsx` sẽ gán lớp CSS `sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]` cho cột Mã số và Họ tên học sinh. Nhờ đó, giáo viên cuộn ngang sang phải để nhập điểm cuối kỳ mà vẫn nhận diện chính xác tên từng học sinh.
  - Về mặt thẩm mỹ số học, cột điểm số áp dụng thuộc tính `font-mono tabular-nums text-right` giúp toàn bộ dấu chấm thập phân thẳng hàng dọc chuẩn mực theo tiêu chuẩn công nghệ tài chính và học vụ chuyên nghiệp.

#### Câu 5: Hệ thống có hỗ trợ in ấn báo cáo học vụ (Print Friendly) và tuân thủ chuẩn tương phản giao diện (WCAG) ra sao?
- **Tập tin minh chứng**: [src/components/layout/Sidebar.jsx:L18](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Sidebar.jsx#L18) và [src/index.css](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/index.css)
- **Câu trả lời chuẩn**:
  - **In ấn chuẩn mực (Print Optimization)**: Khung Sidebar và Header được gán lớp CSS `print:hidden`. Khi người dùng nhấn tổ hợp phím `Ctrl + P` để in phiếu điểm hoặc danh sách lớp, toàn bộ thanh công cụ và menu điều hướng tự động ẩn đi, vùng nội dung trung tâm tự giãn rộng 100% trang giấy trắng A4 mà không bị lãng phí mực in.
  - **Chuẩn trợ năng màu sắc (WCAG 2.1 AA)**: Hệ thống sử dụng bảng màu thuần sáng học vụ (Pure Light Theme), tỷ lệ tương phản giữa chữ xám đậm `#1E293B` trên nền trắng `#FFFFFF` đạt 13.5:1 (vượt xa chuẩn tối thiểu 4.5:1 của WCAG), giúp giáo viên và phụ huynh nhìn rõ thông tin trong mọi điều kiện ánh sáng.

---

### CHUYÊN ĐỀ 2: RESTFUL API VÀ KIẾN TRÚC CLEAN ARCHITECTURE

#### Câu 6: Tại sao nhóm lại chọn kiến trúc Clean Architecture cho Backend? RESTful API đóng vai trò gì trong kiến trúc này?
- **Tập tin minh chứng**: [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js) và [src/services/StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js)
- **Câu trả lời chuẩn**:
  - **Lý do chọn Clean Architecture**: Để tách biệt rạch ròi quy tắc nghiệp vụ học vụ (Business Rules) khỏi hạ tầng công nghệ bên ngoài (Database, Framework HTTP). Điều này bảo đảm mã nguồn dễ bảo trì, dễ viết kiểm thử tự động (Unit Test), và khi thay đổi cơ sở dữ liệu (từ PostgreSQL sang MySQL/MongoDB) thì các quy tắc tính điểm học lực Thông tư 22 trong Service không cần sửa đổi bất kỳ dòng mã nào.
  - **Vai trò của RESTful API**: Trong Clean Architecture, RESTful API chỉ là một **External Driver / Interface Adapter** (Cổng giao tiếp ngoại vi). Express.js nhận các yêu cầu HTTP (GET, POST, PUT, DELETE), chuyển giao cho Controller bóc tách dữ liệu để gọi Use Case (Service). RESTful API giúp chuẩn hóa định dạng trao đổi JSON, phục vụ đồng thời cả ứng dụng Web React và ứng dụng Mobile sau này.

#### Câu 7: Controller, Service và Repository phân định trách nhiệm ra sao? Tại sao không viết câu lệnh SQL trực tiếp trong Controller?
- **Tập tin minh chứng**:
  - Controller: [src/controllers/StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js)
  - Service: [src/services/StudentService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js)
  - Repository: [src/repositories/StudentRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js)
- **Câu trả lời chuẩn**:
  - **Controller (Slim Controller)**: Chỉ làm nhiệm vụ điều phối HTTP: Lấy `req.params`, `req.query`, `req.body`, gọi phương thức của Service tương ứng, và trả về mã trạng thái HTTP (200, 201, 400) kèm cấu trúc JSON chuẩn.
  - **Service (Nghiệp vụ cốt lõi)**: Chứa toàn bộ logic kiểm tra hợp lệ: Xác thực học sinh có tồn tại không, tính toán điểm trung bình môn, phân loại học lực Tốt/Khá/Đạt theo Thông tư 22, và điều phối giao dịch Unit of Work. Service hoàn toàn không biết `req` hay `res` là gì.
  - **Repository (Truy cập dữ liệu)**: Chỉ thuần túy thực thi các câu lệnh SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) thông qua `pg.Pool`.
  - **Tại sao không viết SQL trực tiếp trong Controller?**: Viết SQL trong Controller sẽ vi phạm nguyên lý Trách nhiệm duy nhất (Single Responsibility Principle - SRP), dẫn đến "Fat Controller". Khi đó, logic nghiệp vụ bị gắn chặt với framework Express; việc viết Unit Test bắt buộc phải giả lập toàn bộ đối tượng HTTP phức tạp và không thể tái sử dụng logic ở các kênh khác (như Cron Job hay CLI).

#### Câu 8: Khi gọi `GET /api/students?className=10A1`, vòng đời xử lý diễn ra như thế nào từ lúc gửi yêu cầu đến khi nhận kết quả?
- **Tập tin minh chứng**: [src/controllers/StudentController.js:L9-L18](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js#L9-L18), [src/services/StudentService.js:L9-L12](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js#L9-L12), [src/repositories/StudentRepository.js:L10-L16](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js#L10-L16)
- **Câu trả lời chuẩn**:
  Vòng đời gồm 5 chặng kế tiếp:
  1. **Chặng 1 (Nhận diện tuyến đường)**: Máy chủ Express tiếp nhận yêu cầu HTTP GET, so khớp chuỗi đường dẫn `/api/students` và chuyển giao quyền xử lý cho hàm `getStudents(req, res)` của `StudentController`.
  2. **Chặng 2 (Trích xuất tham số)**: Controller lấy biến lọc `req.query.className` (giá trị là `"10A1"`) và gọi `studentService.getAllStudents("10A1")`.
  3. **Chặng 3 (Thực thi nghiệp vụ & truy vấn SQL)**: `StudentService` chuyển tiếp tham số xuống `StudentRepository.findByClass("10A1")`. Repository mượn một kết nối từ `pg.Pool` và thực thi câu lệnh SQL có tham số hóa:
     ```sql
     SELECT * FROM students WHERE class_name = $1 ORDER BY student_code ASC;
     ```
     với tham số `['10A1']`.
  4. **Chặng 4 (Ánh xạ thực thể Entity)**: Dữ liệu thô từ bảng PostgreSQL được ánh xạ (map) thành các đối tượng `Student` độc lập thuộc tầng Domain Entity.
  5. **Chặng 5 (Phản hồi HTTP)**: Controller đóng gói mảng danh sách học sinh vào khuôn JSON chuẩn:
     ```json
     { "success": true, "data": [ ... ], "total": 45 }
     ```
     và phản hồi về phía Frontend với mã trạng thái `200 OK`.

#### Câu 9: Nhóm phòng chống tấn công SQL Injection như thế nào trong các câu truy vấn cơ sở dữ liệu?
- **Tập tin minh chứng**: [src/repositories/StudentRepository.js:L37-L43](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js#L37-L43)
- **Câu trả lời chuẩn**:
  - Nhóm tuân thủ tuyệt đối quy tắc **không bao giờ ghép chuỗi ký tự thô** vào câu lệnh SQL (`No String Concatenation`).
  - Toàn bộ các thao tác dữ liệu đều sử dụng **Truy vấn tham số hóa (Parameterized Queries / Prepared Statements)** của thư viện `pg`.
  - Mọi dữ liệu do người dùng nhập vào được truyền dưới dạng mảng tham số riêng biệt thông qua các ký hiệu placeholder `$1, $2, $3...`:
    ```javascript
    await query(
      `SELECT * FROM students WHERE student_code = $1`,
      [studentCode]
    );
    ```
  - Phía máy chủ cơ sở dữ liệu PostgreSQL sẽ phân tích cú pháp (parse) và biên dịch câu lệnh SQL trước, sau đó mới gán giá trị tham số dưới dạng dữ liệu văn bản thuần túy (Literals). Ngay cả khi kẻ tấn công nhập chuỗi độc hại như `' OR '1'='1`, cơ sở dữ liệu vẫn coi đó là một chuỗi mã học sinh bình thường và không thể làm biến đổi cấu trúc ngữ nghĩa của truy vấn SQL.

#### Câu 10: Khi giáo viên lưu bảng điểm cho 45 học sinh cùng lúc, nếu học sinh thứ 40 bị lỗi thì dữ liệu 39 học sinh trước đó sẽ ra sao? Nhóm xử lý giao dịch nguyên tử (Unit of Work) như thế nào?
- **Tập tin minh chứng**: [src/utils/UnitOfWork.js:L18-L45](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js#L18-L45) và [src/services/GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js)
- **Câu trả lời chuẩn**:
  - Nếu cập nhật từng học sinh rời rạc, khi học sinh thứ 40 bị lỗi sẽ dẫn đến tình trạng "dữ liệu mồ côi" (Inconsistent Data): 39 em đã có điểm mới, các em còn lại giữ điểm cũ.
  - Để giải quyết bài toán này, nhóm đã cài đặt mẫu thiết kế **Unit of Work** bọc toàn bộ chuỗi thao tác bên trong một **Database Transaction** tuân thủ đầy đủ tính chất **ACID**:
    1. Bước 1: Mở giao dịch bằng lệnh `BEGIN;`.
    2. Bước 2: Thực thi cập nhật tuần tự điểm số cho từng học sinh trên cùng một Client kết nối.
    3. Bước 3: Nếu tất cả 45 bản ghi đều hợp lệ, phát lệnh `COMMIT;` để lưu kết quả vĩnh viễn vào ổ đĩa.
    4. Bước 4: Nếu có bất kỳ ngoại lệ nào phát sinh ở học sinh thứ 40, khối `catch` lập tức kích hoạt lệnh `ROLLBACK;`. Toàn bộ dữ liệu của 39 học sinh trước đó được hoàn tác sạch sẽ 100%, trạng thái bảng điểm quay về thời điểm nguyên vẹn ban đầu.

#### Câu 11: Sự khác biệt và quy chuẩn sử dụng các mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500) trong hệ thống của nhóm?
- **Tập tin minh chứng**: [src/controllers/StudentController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js) và [src/controllers/AuthController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js)
- **Câu trả lời chuẩn**:
  Hệ thống chuẩn hóa phản hồi RESTful theo chuẩn RFC 9110:
  - **`200 OK`**: Yêu cầu xử lý thành công và trả về dữ liệu (ví dụ: lấy danh sách học sinh `GET /api/students`, cập nhật điểm `PUT /api/gradebooks`).
  - **`201 Created`**: Tạo mới tài nguyên thành công trên cơ sở dữ liệu (ví dụ: thêm mới một hồ sơ học sinh `POST /api/students`).
  - **`400 Bad Request`**: Dữ liệu gửi lên sai định dạng hoặc vi phạm quy tắc nghiệp vụ (ví dụ: điểm số nhập vào là 15 điểm hoặc thiếu trường họ tên).
  - **`401 Unauthorized`**: Người dùng chưa gửi kèm Token xác thực JWT hoặc Token đã hết hạn.
  - **`403 Forbidden`**: Người dùng đã đăng nhập nhưng không có thẩm quyền truy cập tài nguyên (ví dụ: Phụ huynh cố tình gọi API xóa học sinh của Ban Giám Hiệu).
  - **`404 Not Found`**: Không tìm thấy tài nguyên tương ứng với mã định danh (ví dụ: tìm kiếm học sinh với mã `HS9999` không có trong hệ thống).
  - **`500 Internal Server Error`**: Lỗi ngoại lệ hệ thống không mong muốn phát sinh từ máy chủ hoặc sập kết nối cơ sở dữ liệu.

---

### CHUYÊN ĐỀ 3: DOCKER VÀ HẠ TẦNG CƠ SỞ DỮ LIỆU CONTAINER

#### Câu 12: Docker Container khác gì so với Máy ảo (Virtual Machine)? Tại sao nhóm dùng Docker thay vì cài trực tiếp PostgreSQL lên máy chủ?
- **Tập tin minh chứng**: [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml) và [Dockerfile](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/Dockerfile)
- **Câu trả lời chuẩn**:
  - **So sánh Container và Máy ảo (VM)**:
    - Máy ảo (như VMware, VirtualBox) yêu cầu cài đặt trọn vẹn một hệ điều hành khách (Guest OS) kèm bộ ảo hóa Hypervisor, tiêu tốn hàng Gigabyte RAM và mất từ 1-3 phút để khởi động.
    - Docker Container chia sẻ chung nhân hệ điều hành máy chủ (Host OS Kernel) và cô lập tiến trình bằng công nghệ cgroups và namespaces của Linux. Nhờ đó, Container chỉ chiếm vài chục Megabyte RAM và khởi động chỉ trong 1 đến 2 giây.
  - **Tại sao dùng Docker thay vì cài PostgreSQL trực tiếp?**:
    1. **Tính nhất quán môi trường (Environment Parity)**: Đảm bảo CSDL trên máy sinh viên, máy giảng viên và máy chủ Cloud chạy chính xác cùng phiên bản PostgreSQL 15 Alpine, loại bỏ triệt để lỗi xung đột môi trường.
    2. **Đơn giản hóa việc thiết lập (Zero Setup)**: Giảng viên hoặc thành viên nhóm mới chỉ cần gõ đúng một câu lệnh `docker compose up -d` là toàn bộ cơ sở dữ liệu và máy chủ backend tự khởi chạy đầy đủ mà không cần cài đặt rườm rà.

#### Câu 13: Cấu hình `5434:5432` trong `docker-compose.yml` có ý nghĩa gì? Tại sao lại chọn số cổng 5434?
- **Tập tin minh chứng**: [docker-compose.yml:L14](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml#L14)
- **Câu trả lời chuẩn**:
  - Cú pháp ánh xạ cổng (Port Forwarding) của Docker có định dạng `HOST_PORT:CONTAINER_PORT`.
  - Cổng `5432` bên phải là cổng mặc định mà dịch vụ PostgreSQL đang lắng nghe bên trong mạng nội bộ của Container.
  - Cổng `5434` bên trái là cổng mở ra trên máy chủ vật lý (Host Machine) để các công cụ bên ngoài (như DBeaver, pgAdmin hoặc máy chủ Node.js chạy cục bộ) có thể kết nối vào.
  - **Lý do chọn cổng 5434**: Rất nhiều máy tính của lập trình viên và giảng viên đã cài sẵn một bản PostgreSQL cục bộ chạy cổng mặc định `5432`. Nếu cấu hình ánh xạ `5432:5432`, lệnh khởi động sẽ bị lỗi `Bind for 0.0.0.0:5432 failed: port is already allocated` (Xung đột cổng). Việc ánh xạ sang `5434` giúp hệ thống hoạt động trơn tru 100% trên mọi máy tính mà không gây gián đoạn các dự án khác.

#### Câu 14: Khi tắt hoặc xóa container PostgreSQL (`docker rm`), dữ liệu điểm số và học sinh có bị mất không? Giải thích cơ chế Volume?
- **Tập tin minh chứng**: [docker-compose.yml:L16-L17](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml#L16-L17) và [docker-compose.yml:L45-L46](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml#L45-L46)
- **Câu trả lời chuẩn**:
  - **Dữ liệu hoàn toàn KHÔNG bị mất**.
  - **Giải thích cơ chế Named Volume**: Bản chất Container là vô trạng thái (Stateless/Ephemeral); nếu ghi dữ liệu trực tiếp vào tầng ghi của Container thì khi container bị xóa, dữ liệu sẽ mất theo. Để giải quyết, nhóm đã cấu hình **Named Volume** có tên `postgres_data` gắn vào thư mục `/var/lib/postgresql/data` của PostgreSQL.
  - Volume này thực chất là một vùng thư mục chuyên dụng nằm trực tiếp trên ổ cứng vật lý của hệ điều hành máy chủ do Docker Engine quản lý độc lập. Khi container bị tắt (`docker stop`), xóa bỏ (`docker rm`) hoặc nâng cấp lên phiên bản Image mới, vùng lưu trữ vật lý này vẫn tồn tại nguyên vẹn. Khi một container mới được tạo lại, Docker chỉ việc gắn (mount) lại Volume `postgres_data` là toàn bộ 45 học sinh và lịch sử điểm số được phục hồi ngay lập tức. Dữ liệu chỉ mất khi người dùng chủ động gõ lệnh xóa volume `docker compose down -v`.

#### Câu 15: Tại sao trong cấu hình `docker-compose.yml` dịch vụ backend lại có chỉ thị `depends_on` với điều kiện `service_healthy`? Nếu không có thì chuyện gì xảy ra?
- **Tập tin minh chứng**: [docker-compose.yml:L41-L43](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml#L41-L43) và [docker-compose.yml:L18-L23](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml#L18-L23)
- **Câu trả lời chuẩn**:
  - Dịch vụ máy chủ Express Node.js khởi động rất nhanh (chỉ mất khoảng 0.5 giây), trong khi tiến trình cơ sở dữ liệu PostgreSQL cần từ 3 đến 5 giây để nạp tệp cấu hình, khởi tạo WAL log và mở cổng tiếp nhận kết nối.
  - **Nếu chỉ dùng `depends_on: [postgres-db]` thông thường**: Docker Compose chỉ đợi container CSDL được bật lên là lập tức cho phép Backend chạy ngay. Lúc này CSDL vẫn đang trong giai đoạn khởi động chưa sẵn sàng lắng nghe; máy chủ Node.js thực hiện lệnh kết nối `pool.connect()` sẽ bị từ chối (`ECONNREFUSED`), dẫn đến sập ứng dụng (Crash Loop) và container backend bị thoát (Exit 1).
  - **Giải pháp `service_healthy`**: Nhóm đã thiết lập bộ kiểm tra sức khỏe `healthcheck` chạy lệnh `pg_isready -U postgres -d school_management` mỗi 5 giây. Chỉ khi nào PostgreSQL phản hồi mã trạng thái 0 (Sẵn sàng 100%), trạng thái container chuyển sang `healthy` thì Docker Compose mới cấp quyền cho container `backend-api` khởi chạy. Cơ chế này bảo đảm hệ thống khởi động ổn định tuyệt đối mà không cần can thiệp thủ công.

#### Câu 16: Nếu muốn triển khai toàn bộ hệ thống này lên một máy chủ đám mây (Cloud VPS Ubuntu), nhóm sẽ thực hiện các bước như thế nào?
- **Tập tin minh chứng**: [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml) và [members/member2_Frontend/vite.config.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/vite.config.js)
- **Câu trả lời chuẩn**:
  Quy trình triển khai tiêu chuẩn Production gồm 5 bước:
  1. **Bước 1 (Chuẩn bị máy chủ)**: Đăng ký một máy chủ ảo Cloud VPS (như AWS EC2, DigitalOcean hoặc Linode chạy Ubuntu 22.04 LTS), cài đặt Docker Engine và Docker Compose Plugin.
  2. **Bước 2 (Kéo mã nguồn)**: Clone kho mã nguồn từ GitHub:
     ```bash
     git clone https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem.git
     ```
  3. **Bước 3 (Đóng gói ứng dụng Frontend)**: Chạy lệnh `npm run build` trong thư mục frontend để xuất gói tĩnh HTML/CSS/JS siêu tối ưu vào thư mục `dist/`.
  4. **Bước 4 (Cấu hình Nginx làm Reverse Proxy & Cấp chứng chỉ SSL HTTPS)**: Cài đặt máy chủ Web Nginx để điều hướng:
     - Tên miền `https://school.domain.com` phục vụ các tệp tĩnh Frontend.
     - Đường dẫn `https://school.domain.com/api/` được chuyển tiếp (proxy pass) vào cổng `8081` của backend container.
     - Kích hoạt HTTPS miễn phí thông qua công cụ Certbot (Let's Encrypt).
  5. **Bước 5 (Kích hoạt tự động)**: Chạy lệnh `docker compose up -d` để khởi động cơ sở dữ liệu và backend ngầm định; thiết lập dịch vụ giám sát tự khởi động lại khi máy chủ reboot thông qua chính sách `restart: always`.

---

*Tài liệu được lưu trữ chính thức tại kho mã nguồn của đồ án phục vụ công tác đối soát, bảo vệ chuyên đề và chuyển giao kỹ thuật.*
