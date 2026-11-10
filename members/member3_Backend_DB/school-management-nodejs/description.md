## Tóm Tắt

Pull Request này hoàn thiện toàn bộ **15 Use Case còn thiếu** được xác định trong báo cáo đối chiếu, đồng thời sửa các lỗi phát sinh sau khi tích hợp. Phạm vi thay đổi bao gồm: kết nối API thật thay thế mockdata cho frontend học sinh/phụ huynh, bổ sung hệ thống middleware xác thực JWT đầy đủ ở backend, implement export engine thực tế, và sửa một loạt lỗi dữ liệu liên quan đến phân quyền theo role.

Tổng cộng: **115 files** thay đổi, +14,841 / −4,158 dòng, **50 files mới** được thêm vào.

---

## Thay Đổi Đã Thực Hiện

### Frontend (`members/member2_Frontend`)

#### Chức năng mới
- **Quên mật khẩu / Đặt lại mật khẩu** (`ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`): flow hoàn chỉnh qua email, tích hợp với backend `POST /api/auth/forgot-password` và `POST /api/auth/reset-password` có rate limiting.
- **Trang quản lý học phí BGH** (`BGHTuitionPage.jsx`): KPI cards tổng thu/đã thu/còn lại, bảng học phí có filter theo lớp và trạng thái (UC-ADM-07).
- **Trang thông báo** (`NotificationsPage.jsx`): hiển thị thông báo cho role BGH, GVCN và Học sinh (UC-STU-04).
- **Form nhập hạnh kiểm inline** trong `GVCNDashboardPage`: select Tốt/Khá/Trung bình/Yếu, gọi `PUT /api/students/:id/conduct` (UC-GVCN-07).

#### Kết nối API thật (thay thế mockdata)
- `StudentSchedulePage` → `fetchScheduleTemplates()` thay vì `timetableSlots` từ mockData (UC-STU-03).
- `StudentGradebookPage` → `fetchGradeBook()` với resolve đúng `studentCode` từ JWT (UC-STU-05).
- `StudentAttendancePage` → `fetchAttendance()` + `submitLeaveRequest()` gọi API thật (UC-STU-06, UC-STU-07).
- `ParentPortalPage` → `fetchGradeBook()`, `fetchTuitions()`, `POST /api/leave-requests`, `POST /api/tuition/pay` tất cả gọi API thật; loại bỏ hoàn toàn `DEFAULT_TUITION` mockdata (UC-PAR-04, 05, 06, 07, 08).

#### Sửa lỗi hiển thị
- `mapApiRow()` trong `StudentGradebookPage` và `normalize()` trong `ParentPortalPage`: đọc đúng cả `snake_case` (từ PostgreSQL) và `camelCase` (từ DTO).
- `GradeBookRepository.findByStudentCode`: JOIN bảng `subjects` để lấy tên môn đầy đủ (Tiếng Anh, Hóa học...) thay vì code viết tắt (ANH, HOA).
- `ParentPortalPage`: de-duplicate dòng theo `subjectName`, chỉ hiển thị HK1, bỏ fallback mockdata.
- Cột "Cuối HK" trong bảng điểm học sinh sử dụng đúng `scores.final` thay vì `scores.semester`.

#### Kiểm thử Frontend
- Thêm 3 file Vitest test: `AttendancePage.test.jsx`, `GradebookPage.test.jsx`, `SystemSettingsPage.test.jsx`.

---

### Backend (`members/member3_Backend_DB`)

#### API Endpoints mới
- **Auth**: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`
- **Học sinh**: `PUT /api/students/:id/conduct` (nhập hạnh kiểm)
- **Thời khóa biểu**: `GET/POST/DELETE /api/schedules`, `GET /api/schedules/templates`
- **Sổ điểm**: `GET /api/gradebook/page-data`, `POST /api/gradebook/save-spreadsheet`, `POST /api/gradebook/closure/submit`, `POST /api/gradebook/closure/request-unlock`, `POST/GET /api/gradebook/review-request(s)`
- **Dashboard**: `GET /api/dashboard/bgh`, `GET /api/dashboard/gvcn`, `PATCH /api/dashboard/gvcn/leave-requests/:id`
- **Quản lý tài khoản**: `GET/POST/PUT/PATCH/DELETE /api/users`
- **Sổ liên lạc**: `GET /api/communication/page-data`, `/contacts`, `/students`, `/messages`, `POST /communication/notifications`
- **Báo cáo BGH**: `GET /api/reports/bgh`, `POST /api/reports/bgh/approve-unlock`, `POST /api/reports/bgh/approve`
- **Phân quyền**: `GET/PUT /api/settings/permissions`
- **Thông báo**: `GET/PATCH /api/notifications`

#### Middleware mới
- `authMiddleware.js`: xác thực JWT (`authenticateToken`), kiểm tra `token_version` để vô hiệu hóa token cũ khi đổi mật khẩu.
- `dataAccessMiddleware.js`: `resolveGvcnClass` — enforce GVCN chỉ truy cập dữ liệu lớp chủ nhiệm của mình qua `homeroom_teacher_id` FK.
- `rateLimiters.js`: rate limiting cho `forgot-password` và `reset-password`.

#### Sửa lỗi Business Logic
- **Đơn xin nghỉ học**: `LeaveRequestService` tự động resolve `class_name`, `student_name`, `student_id` từ bảng `parent_students` khi phụ huynh nộp đơn — tránh lưu `NULL` vào DB khiến GVCN không thấy đơn.
- **Dữ liệu học phí và bảng điểm**: `TuitionController` và `GradeBookController` tự động resolve đúng `studentCode` từ JWT của PH/HS thay vì tin vào query parameter từ frontend.
- **Route bảo mật**: thêm `authenticateToken` vào `GET /api/tuition`, `POST /api/tuition/pay`, `POST /api/leave-requests`.

#### Thay đổi Business Logic
- **Công thức TBM** (`GradeBookService.calculateTBM`): chuyển sang mẫu số cố định = 9 theo BR-01. Ô điểm chưa nhập (NULL) được tính là 0 thay vì bỏ qua — tránh điểm tổng bất hợp lý khi chỉ nhập một vài cột.

#### Schema Database (thêm mới qua migration trong `db.js`)
- Bảng `schedule_templates`: lịch cố định hàng tuần, không gắn với tuần cụ thể.
- Bảng `parent_students`: liên kết tài khoản phụ huynh với học sinh.
- Bảng `password_reset_tokens`: quản lý token đặt lại mật khẩu.
- Bảng `grade_book_closures`: trạng thái chốt/mở khóa sổ điểm.
- Bảng `notifications` (mở rộng): thêm `read_at`, `sender_role`, `related_class`, `related_semester`.
- Bảng `parent_messages` (mở rộng): thêm `conversation_type`, `sender_id`, `read_at`.
- Cột `school_classes.homeroom_teacher_id`: FK liên kết GVCN với lớp chủ nhiệm.
- Cột `users.email`, `token_version`, `is_active`.

#### Kiểm thử Backend
- Thêm 6 file test: `attendance.test.js`, `auth-permissions.test.js`, `communication-rbac.test.js`, `gradebook.test.js`, `gvcn-scope.test.js`, `settings.test.js`.

---

### Export Engine (`members/member5_Modules_QA`)
- `exportEngine.js`: thay thế 3 hàm stub (`exportGradeBookToExcel`, `exportReportCardToPDF`, `exportTuitionReceiptToPDF`) bằng implementation thực dùng SheetJS cho Excel và HTML string cho PDF.
- `unitTestingSuite.test.js`: thêm 17 unit test mới bao phủ 15 use case. Kết quả: **44/44 assertions PASS**.

---

### Root Workspace
- Thêm `package.json` ở thư mục gốc với script `npm run dev` dùng `concurrently` để khởi động frontend và backend cùng lúc bằng một lệnh duy nhất.

---

## Chi Tiết Kỹ Thuật

### Files/Modules quan trọng

| File | Loại | Ý nghĩa |
|------|------|---------|
| `server.js` | Modified | Thêm 40+ routes, tích hợp full JWT middleware và CORS |
| `src/middleware/dataAccessMiddleware.js` | Added | Phân quyền dữ liệu GVCN theo `homeroom_teacher_id` FK |
| `src/services/GradeBookService.js` | Modified | Công thức TBM mẫu số cố định = 9 |
| `src/controllers/GradeBookController.js` | Modified | Resolve `studentCode` từ JWT cho HS và PH |
| `src/services/LeaveRequestService.js` | Modified | Auto-resolve thông tin học sinh từ `parent_students` |
| `src/controllers/TuitionController.js` | Modified | Resolve học sinh từ JWT, bảo vệ bằng `authenticateToken` |
| `src/repositories/GradeBookRepository.js` | Modified | JOIN `subjects` để lấy tên môn đầy đủ |
| `StudentGradebookPage.jsx` | Modified | Normalize snake_case/camelCase, sửa field mapping |
| `ParentPortalPage.jsx` | Modified | Bỏ mockdata, kết nối toàn bộ tab với API thật |

### Dependencies mới
- **Root**: `concurrently ^9.1.2` (dev)
- **Backend**: `nodemailer` (gửi email reset password), `express-rate-limit` (rate limiting)

---

## Tích Hợp Frontend–Backend

- **JWT flow**: `client.js` tự động đính kèm `Authorization: Bearer <token>` vào mọi request; backend middleware `authenticateToken` xác thực và inject `req.user`.
- **GVCN data scope**: middleware `resolveGvcnClass` inject `req.gvcnClassName` từ `homeroom_teacher_id` FK — Controller/Service dùng giá trị này thay vì tin vào query param từ frontend.
- **PH/HS data isolation**: `GradeBookController`, `TuitionController`, `LeaveRequestService` đều resolve đúng học sinh từ `req.user.id` thông qua `parent_students` JOIN hoặc `users.full_name` lookup — frontend không cần truyền `studentCode` chính xác.
- **Sổ liên lạc**: `CommunicationController` phân quyền theo role: PH chỉ thấy BGH và GVCN lớp của con; GVCN chỉ thấy phụ huynh lớp chủ nhiệm.

---

## Kiểm Thử

### Đã thực hiện
- Unit test backend: 6 file test (attendance, auth-permissions, communication-rbac, gradebook, gvcn-scope, settings) chạy bằng `node:test`.
- Unit test frontend: 3 file Vitest test (AttendancePage, GradebookPage, SystemSettingsPage).
- Unit test export engine: 44/44 assertions PASS trên `unitTestingSuite.test.js`.
- Kiểm thử thủ công: luồng đăng nhập, nhập điểm GVCN, xem điểm học sinh, nộp đơn nghỉ học phụ huynh, duyệt đơn GVCN, xem học phí.

### Chưa được kiểm thử tự động
- Luồng quên mật khẩu end-to-end (yêu cầu cấu hình SMTP thực).
- Tích hợp thanh toán VietQR/MoMo (chưa có gateway thực).
- Test trên môi trường có PostgreSQL chạy thật (các test hiện dùng fallback in-memory).

---

## Ghi Chú

### Breaking Changes
- `GET /api/tuition` và `POST /api/tuition/pay` **yêu cầu JWT** từ phiên bản này. Client gọi không có token sẽ nhận HTTP 401.
- `POST /api/leave-requests` **yêu cầu JWT** để backend tự resolve thông tin học sinh.
- Công thức tính TBM thay đổi: các bản ghi điểm cũ trong DB đang dùng công thức động (weight-based) sẽ có `average_score` khác so với công thức mới (mẫu số cố định = 9). Cần lưu lại để backend recalculate.

### Yêu cầu Database Migration
- Không cần chạy migration thủ công — tất cả `CREATE TABLE IF NOT EXISTS` và `ALTER TABLE ADD COLUMN IF NOT EXISTS` được thực thi tự động khi server khởi động lần đầu qua `initDatabaseSchema()`.

### Yêu cầu cấu hình
- `JWT_SECRET` trong `.env` (hoặc giá trị mặc định `htqllh-secret-key-2025` được dùng nếu không có).
- `SMTP_*` variables cần thiết cho chức năng quên mật khẩu (`EmailService`); nếu không cấu hình, route vẫn hoạt động nhưng email không được gửi.

### Known Issues
- `exportEngine.js` của `member5_Modules_QA` trả về HTML string cho PDF thay vì file `.pdf` thực — cần tích hợp thêm `jsPDF` hoặc Puppeteer nếu muốn xuất file PDF thực sự.
- Trang lịch kiểm tra & thi (`StudentExamsPage`) vẫn dùng hardcoded data vì chưa có bảng `exam_schedules` trong schema.
