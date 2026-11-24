# BẢN ĐỒ CHI TIẾT 30 TASKS (JIRA / CLICKUP / CODE MAPPING) CHO LEADER

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC & HỌC VỤ THPT (HTQLLH - THPT HSU)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
NGƯỜI LẬP: VÕ DUY BÌNH (PROJECT MANAGER & LEAD BA / LEAD REVIEWER)
VỊ TRÍ TÀI LIỆU: docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md
BẢNG TRELLO KANBAN: https://trello.com/b/gkdRNT57/htqllh-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-l%E1%BB%9Bp-h%E1%BB%8Dc-h%E1%BB%8Dc-v%E1%BB%A5-edumanage-pro
BẢNG JIRA KANBAN: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
KHÔNG GIAN CLICKUP: https://app.clickup.com/1100320000025585/v/s/1100320000109903
NGÀY HOÀN THÀNH: 24/11/2026 (TUẦN 11 / 15 TUẦN HỌC KỲ 2631 - PHIÊN BẢN V4.0 TOÀN DIỆN)
MỤC ĐÍCH: BẢNG TRA CỨU NHANH DÀNH RIÊNG CHO LEADER ĐỂ QUẢN LÝ, THEO DÕI, REVIEW
          VÀ TRẢ LỜI CHÍNH XÁC TỪNG TASK: AI LÀM, LÀM GÌ, TỆP CODE NÀO, HÀM NÀO!
================================================================================
```

---

## 1. BẢNG TỔNG HỢP NHANH PHÂN CÔNG 5 THÀNH VIÊN (CHUẨN HÓA CÂN BẰNG 100% — 30 SP / NGƯỜI)

| STT | Thành Viên | Vai Trò Chuyên Trách | Tài Khoản Jira / ClickUp | Số Tasks Phụ Trách | Story Points | Tỷ Lệ Đóng Góp |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **1** | **VÕ DUY BÌNH** | **Lead PM & BA, Lead Reviewer** | `Duy Bình` / `binh.vd01500` | **6 Tasks** (`PBI-25, 14, 24, 23, 19, 29`) | **30 SP** | **20.0%** |
| **2** | **VÕ HOÀNG SƠN** | **Dev Frontend Lead** | `Sonvohoang` / `sonvohoang58` | **6 Tasks** (`PBI-05, 08, 10, 11, 18, 28`) | **30 SP** | **20.0%** |
| **3** | **HUỲNH TRUNG TÍNH** | **Dev Backend & DBA Lead** | `Huỳnh Trung Tính` / `trungtinhh284` | **6 Tasks** (`PBI-03, 04, 06, 13, 17a, 29`) | **30 SP** | **20.0%** |
| **4** | **TRẦN QUANG VINH** | **Core Logic & Security Lead** | `tqvcontacts` / `tqvcontacts` | **6 Tasks** (`PBI-01, 02, 07, 09, 20, 30`) | **30 SP** | **20.0%** |
| **5** | **NGUYỄN MINH QUỐC BẢO** | **QA/QC Testing Lead & Export** | `Bảo Nguyễn` / `119437050` | **6 Tasks** (`PBI-21, 17c, 22, 17b, 16, 15`) | **30 SP** | **20.0%** |
| **TỔNG** | **CẢ NHÓM (5 Người)** | **Đồ Án Phần Mềm HTQLLH** | **3 Nền tảng (Trello, Jira & ClickUp)** | **30 Tasks (PBIs)** | **150 SP** | **100% CÂN BẰNG** |

---

## 2. MA TRẬN CHI TIẾT 27 TASKS — ÁNH XẠ JIRA / CLICKUP / FILE CODE / HÀM THỰC THI

### 🔹 MODULE 1: XÁC THỰC, PHÂN QUYỀN RBAC & QUẢN TRỊ TÀI KHOẢN (AUTH & RBAC)

#### Task 1: `PBI-01` | Jira: `KAN-112` | ClickUp: `z8qgvcdg9p`
* **Tên Task**: Đăng nhập JWT vô trạng thái & Nút 1-Click Demo Login 5 vai trò (BGH, GVCN, GVBM, HS, PH).
* **Người thực hiện**: **Trần Quang Vinh** (Backend Auth) & **Võ Hoàng Sơn** (Frontend UI).
* **Nghiệp vụ / Làm gì**:
  - Cấp phát JWT token có hạn 24h chứa `id`, `username`, `role`.
  - Mã hóa mật khẩu một chiều bằng thuật toán `bcryptjs` (salt 10 vòng).
  - Nút chuyển nhanh vai trò 1-Click trên trang đăng nhập để hỗ trợ chấm đồ án và kiểm thử nhanh.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js`
  - Backend Service: `members/member4_Logic_Security/jwtAuthMiddleware.js` (hoặc `members/member4_Logic_Security/src/services/AuthService.js`)
  - Frontend Page: `members/member2_Frontend/src/pages/auth/LoginPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `AuthController.login`: Nhận `{ username, password }`, kiểm tra bcrypt, ký `jwt.sign()`.
  - `AuthController.getMe`: Lấy thông tin phiên hiện tại từ Header `Authorization: Bearer <token>`.
  - `LoginPage.handleQuickLogin(role)`: Tự động điền tài khoản mẫu và đăng nhập tự động trong 0.5s.

#### Task 2: `PBI-02` | Jira: `KAN-113` | ClickUp: `z8qgvcdg9u`
* **Tên Task**: Middleware RBAC kiểm soát phân quyền 5 cấp bậc & Chặn truy cập trái phép (Anti-IDOR).
* **Người thực hiện**: **Trần Quang Vinh** (Core Logic & Security).
* **Nghiệp vụ / Làm gì**:
  - Kiểm tra tính hợp lệ của Token và giải mã payload.
  - Chặn các truy cập vượt quyền (ví dụ: PH gọi API sửa điểm trả về HTTP 403 Forbidden).
  - Phòng chống tấn công tráo quyền IDOR giữa các lớp học.
* **Tệp mã nguồn tương ứng**:
  - Middleware Backend: `members/member4_Logic_Security/rbacMiddleware.js`
  - Middleware Express: `members/member3_Backend_DB/school-management-nodejs/src/middleware/authMiddleware.js`
  - Frontend Guard: `members/member2_Frontend/src/components/auth/ProtectedRoute.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `authenticateToken(req, res, next)`: Middleware giải mã JWT, gán `req.user`.
  - `authorizeRoles(...allowedRoles)`: Middleware kiểm tra `req.user.role`.
  - `ProtectedRoute`: Component React điều hướng người dùng chưa đăng nhập về `/login`.

#### Task 3: `PBI-25` | Jira: `KAN-114` | ClickUp: `z8qgvcdgay`
* **Tên Task**: Quản trị tài khoản người dùng: Tạo mới, Khóa tài khoản & Đặt lại mật khẩu (BGH).
* **Người thực hiện**: **Võ Duy Bình** (Lead BA & Quản trị BGH) & **Huỳnh Trung Tính** (Backend API).
* **Nghiệp vụ / Làm gì**:
  - Danh sách tài khoản người dùng trong trường có phân trang và tìm kiếm.
  - BGH tạo tài khoản mới cho cán bộ, giáo viên và học sinh.
  - Chức năng Khóa/Mở khóa tài khoản ngay lập tức khi phát hiện vi phạm.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/SystemSettingsPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `UserController.getAllUsers`: Lấy danh sách toàn bộ người dùng kèm trạng thái `is_active`.
  - `UserController.toggleUserStatus`: Đảo ngược trạng thái hoạt động của tài khoản (`UPDATE users SET is_active = NOT is_active`).
  - `UserController.resetPassword`: Đặt lại mật khẩu mặc định `$2a$10$...` (`password123`).

---

### 🔹 MODULE 2: QUẢN TRỊ DANH MỤC & TỔ CHỨC NĂM HỌC

#### Task 4: `PBI-03` | Jira: `KAN-115` | ClickUp: `z8qgvcdgb0`
* **Tên Task**: Khởi tạo & Cấu hình Năm học, Học kỳ, Khối học và Danh mục Lớp học.
* **Người thực hiện**: **Huỳnh Trung Tính** (Dev Backend & DBA).
* **Nghiệp vụ / Làm gì**:
  - Thiết lập Singleton PostgreSQL Connection Pool (tối đa 10 kết nối, timeout 2s).
  - Khởi tạo lược đồ 17 bảng quan hệ chuẩn 3NF và tự động nạp dữ liệu mẫu (Seed Data).
  - Quản lý danh mục khối 10, 11, 12 và danh mục các môn học chuẩn Bộ GD&ĐT.
* **Tệp mã nguồn tương ứng**:
  - Config CSDL: `members/member3_Backend_DB/school-management-nodejs/src/config/db.js`
  - DDL Schema: `database/schema.sql`
  - Seeder Data: `members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js`
  - Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `initDatabaseSchema()`: Chạy các lệnh `CREATE TABLE IF NOT EXISTS` cho 17 bảng.
  - `seedDemoData()`: Chèn tự động dữ liệu mẫu người dùng, môn học và 45 học sinh.
  - `ClassController.getAllClasses`: Lấy danh sách lớp kèm sĩ số và tên GVCN.

#### Task 5: `PBI-04` | Jira: `KAN-116` | ClickUp: `z8qgvcdgb1`
* **Tên Task**: Phân công chuyên môn giảng dạy (GVCN & GVBM) theo Lớp & Môn học.
* **Người thực hiện**: **Huỳnh Trung Tính** (Backend) & **Võ Hoàng Sơn** (Frontend).
* **Nghiệp vụ / Làm gì**:
  - Phân công giáo viên chủ nhiệm cho từng lớp học.
  - Phân công giáo viên bộ môn phụ trách giảng dạy môn theo từng lớp.
  - Báo cáo danh sách phân công chuyên môn đầu năm học.
* **Tệp mã nguồn tương ứng**:
  - Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/SubjectController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/ClassManagementPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `SubjectController.getTeacherAssignments`: Lấy danh sách phân công giáo viên.
  - `ClassController.assignHomeroomTeacher`: Cập nhật `homeroom_teacher_id` cho lớp học.

---

### 🔹 MODULE 3: QUẢN LÝ THỜI KHÓA BIỂU & LỊCH GIẢNG DẠY

#### Task 6: `PBI-14` | Jira: `KAN-117` | ClickUp: `z8qgvcdgb2`
* **Tên Task**: Xếp thời khóa biểu tuần & Tự động phát hiện xung đột lịch dạy/học.
* **Người thực hiện**: **Võ Duy Bình** (Lead BA & Quản trị BGH) & **Trần Quang Vinh** (Thuật toán).
* **Nghiệp vụ / Làm gì**:
  - Lưới thời khóa biểu 5 tiết sáng / chiều từ Thứ 2 đến Thứ 7.
  - Thuật toán kiểm tra xung đột kép: Không cho phép 1 giáo viên dạy 2 lớp cùng 1 tiết; không cho phép 1 phòng học chứa 2 lớp cùng tiết.
* **Tệp mã nguồn tương ứng**:
  - Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js`
  - Service: `members/member3_Backend_DB/school-management-nodejs/src/services/ScheduleService.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/ScheduleAdminPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `ScheduleService.validateNoConflict(scheduleEntry)`: Kiểm tra điều kiện xung đột lịch.
  - `ScheduleController.saveSchedule`: Lưu thời khóa biểu của lớp, báo lỗi HTTP 409 nếu trùng lịch.
  - `ScheduleAdminPage`: Giao diện kéo thả hoặc chọn môn xếp tiết thời gian thực.

#### Task 7: `PBI-21` | Jira: `KAN-118` | ClickUp: `z8qgvcdgb3`
* **Tên Task**: Quy trình đăng ký đổi tiết, dạy thay, dạy bù & Phê duyệt trực tuyến (BGH).
* **Người thực hiện**: **Nguyễn Minh Quốc Bảo** (QA Lead) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - Giáo viên bộ môn gửi phiếu yêu cầu đổi tiết hoặc nhờ dạy thay có lý do.
  - Ban Giám Hiệu xem xét lịch trống và phê duyệt trực tuyến.
  - Tự động cập nhật thời khóa biểu tạm thời sau khi duyệt.
* **Tệp mã nguồn tương ứng**:
  - Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js`
  - Frontend Modal: `members/member2_Frontend/src/pages/gv/ScheduleChangeRequestModal.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `ScheduleController.createSwapRequest`: Tạo đơn xin đổi tiết giảng dạy.
  - `ScheduleController.approveSwapRequest`: Phê duyệt và đảo lịch giữa 2 tiết học.

---

### 🔹 MODULE 4: QUẢN LÝ HỒ SƠ HỌC SINH & ĐIỂM DANH CHUYÊN CẦN

#### Task 8: `PBI-05` | Jira: `KAN-119` | ClickUp: `z8qgvcdgb4`
* **Tên Task**: Quản lý hồ sơ học sinh, phân lớp & Nhập danh sách hàng loạt từ file Excel.
* **Người thực hiện**: **Võ Hoàng Sơn** (Dev Frontend Lead) & **Huỳnh Trung Tính** (Backend API).
* **Nghiệp vụ / Làm gì**:
  - Quản lý sơ yếu lý lịch học sinh: Mã định danh, họ tên, ngày sinh, giới tính, CCCD, địa chỉ, phụ huynh.
  - Tính năng Import danh sách học sinh từ file Excel chuẩn đuôi `.xlsx` / `.csv`.
  - Xuất danh sách học sinh theo lớp ra file Excel.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js`
  - Frontend Page: `members/member2_Frontend/src/pages/gv/StudentListPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `StudentController.getAllStudents`: Phân trang, tìm kiếm theo tên hoặc mã định danh.
  - `StudentController.importFromExcel`: Đọc file bằng SheetJS, xác thực dữ liệu và insert hàng loạt.
  - `StudentListPage`: Giao diện bảng danh sách học sinh có bộ lọc lớp và nút thêm nhanh.

#### Task 9: `PBI-06` | Jira: `KAN-120` | ClickUp: `z8qgvcdgb5`
* **Tên Task**: Điểm danh theo tiết/ngày, thống kê vắng & Cảnh báo nghỉ học tự động.
* **Người thực hiện**: **Huỳnh Trung Tính** (Dev Backend) & **Võ Hoàng Sơn** (Frontend).
* **Nghiệp vụ / Làm gì**:
  - GVCN điểm danh đầu giờ sáng/chiều với 4 trạng thái: Có mặt (`PRESENT`), Vắng có phép (`EXCUSED`), Vắng không phép (`UNEXCUSED`), Đi muộn (`LATE`).
  - Tự động thống kê số buổi vắng lũy kế của học sinh.
  - Cảnh báo học sinh nguy cơ bị buộc thôi học theo TT22 nếu nghỉ quá 45 buổi trong 1 năm học.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js`
  - Frontend Page: `members/member2_Frontend/src/pages/gv/AttendancePage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `AttendanceController.recordAttendance`: Lưu danh sách điểm danh cả lớp trong 1 phiên làm việc.
  - `AttendanceController.getClassStats`: Trả về tỷ lệ chuyên cần theo tuần và theo tháng.
  - `AttendancePage`: Giao diện điểm danh 1 chạm với nút "Tất cả có mặt".

#### Task 10: `PBI-07` | Jira: `KAN-121` | ClickUp: `z8qgvcdgb6`
* **Tên Task**: Nhập & Phê duyệt đơn xin nghỉ học trực tuyến (Phụ huynh gửi - GVCN duyệt).
* **Người thực hiện**: **Trần Quang Vinh** (Logic) & **Võ Hoàng Sơn** (Frontend).
* **Nghiệp vụ / Làm gì**:
  - Phụ huynh nộp đơn xin nghỉ học trực tuyến từ cổng liên lạc (chọn ngày, lý do, đính kèm giấy bác sĩ).
  - GVCN nhận thông báo, xem xét lý do và bấm Duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`).
  - Tự động đồng bộ sang bảng điểm danh ngày hôm đó thành trạng thái "Vắng có phép".
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/LeaveRequestController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js`
  - Frontend Page: `members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `LeaveRequestController.createRequest`: Phụ huynh gửi đơn xin nghỉ phép.
  - `LeaveRequestController.reviewRequest`: GVCN cập nhật trạng thái đơn duyệt/từ chối.

#### Task 11: `PBI-17c` | Jira: `KAN-122` | ClickUp: `z8qgvcdgb7`
* **Tên Task**: Báo cáo thống kê chuyên cần, tỷ lệ đi học & Cảnh báo học sinh nguy cơ.
* **Người thực hiện**: **Nguyễn Minh Quốc Bảo** (QA Lead) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - Tổng hợp biểu đồ tỷ lệ đi học chuyên cần theo từng lớp và khối học.
  - Xuất danh sách học sinh vắng trên 10 buổi, 20 buổi và ngưỡng cảnh báo 45 buổi.
* **Tệp mã nguồn tương ứng**:
  - Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/AttendanceController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/AttendanceReportPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `AttendanceController.getAbsenceWarningList`: Lọc học sinh có `total_absent > 15`.

---

### 🔹 MODULE 5: QUẢN LÝ SỔ ĐIỂM ĐIỆN TỬ & ĐÁNH GIÁ THÔNG TƯ 22

#### Task 12: `PBI-08` | Jira: `KAN-123` | ClickUp: `z8qgvcdgb8`
* **Tên Task**: Bảng tính Spreadsheet nhập điểm bộ môn, kiểm tra dải điểm hợp lệ [0.0 - 10.0] & Kiểm soát khóa sổ.
* **Người thực hiện**: **Võ Hoàng Sơn** (Frontend Lead) & **Trần Quang Vinh** (Validation).
* **Nghiệp vụ / Làm gì**:
  - Giao diện bảng tính Spreadsheet trực quan mô phỏng Excel để nhập điểm nhanh bằng phím mũi tên và Enter.
  - Ràng buộc dữ liệu nghiêm ngặt: Chỉ chấp nhận điểm từ `0.0` đến `10.0`, làm tròn 1 chữ số thập phân.
  - Tự động khóa ô nhập liệu khi trạng thái môn học hoặc sổ điểm đã bị Khóa (`LOCKED`).
* **Tệp mã nguồn tương ứng**:
  - Frontend Page: `members/member2_Frontend/src/pages/gv/GradebookPage.jsx`
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeRepository.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `GradeBookController.saveScores`: Lưu danh sách điểm của lớp, kiểm tra quyền giáo viên bộ môn.
  - `GradebookPage`: Component bảng tính có tính năng tự động tính trước ĐTBmhk tạm thời ngay khi nhập.

#### Task 13: `PBI-09` | Jira: `KAN-124` | ClickUp: `z8qgvcdgb9`
* **Tên Task**: Thuật toán tự động tính Điểm trung bình môn (TBM chia 9) & Đánh giá Đạt/Chưa đạt (TT22).
* **Người thực hiện**: **Trần Quang Vinh** (Core Logic & Security Lead).
* **Nghiệp vụ / Làm gì**:
  - Thực hiện công thức tính điểm trung bình môn học kỳ Thông tư 22: Mẫu số chia 9 với 4 ĐĐGtx + 2 ĐĐGgk*2 + 1 ĐĐGck*3.
  - Phân loại môn Đánh giá bằng Nhận xét: Âm nhạc, Mỹ thuật, GDĐP tính theo tỷ lệ số nhận xét Đạt.
* **Tệp mã nguồn tương ứng**:
  - Logic Module: `members/member4_Logic_Security/gpaCalculationLogic.js`
  - Unit Test: `members/member4_Logic_Security/tests/unit/gpa-calculator.test.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `calculateAverageSubjectScore(scores)`: Hàm tính ĐTBmhk chuẩn mẫu số 9.
  - `evaluatePassFailSubject(comments)`: Đánh giá Đạt / Chưa đạt cho các môn nhận xét.

#### Task 14: `PBI-10` | Jira: `KAN-125` | ClickUp: `z8qgvcdgba`
* **Tên Task**: Đánh giá kết quả rèn luyện & Xếp loại học lực cuối kỳ/cả năm theo Thông tư 22 (Tốt, Khá, Đạt, Chưa đạt).
* **Người thực hiện**: **Võ Hoàng Sơn** (Frontend) & **Trần Quang Vinh** (Thuật toán xếp loại).
* **Nghiệp vụ / Làm gì**:
  - Xếp loại học lực tổng thể học sinh thành 4 mức: Tốt, Khá, Đạt, Chưa đạt theo đúng Điều 9 Thông tư 22.
  - Hiện thực cơ chế khống chế môn kéo rớt hạng (ví dụ ĐTB cao nhưng có 1 môn dưới 6.5 bị hạ xuống Khá).
* **Tệp mã nguồn tương ứng**:
  - Logic Module: `members/member4_Logic_Security/gpaCalculationLogic.js`
  - Frontend Page: `members/member2_Frontend/src/pages/gv/AcademicEvaluationPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `evaluateAcademicRank(subjectAverages, conductScore)`: Trả về mức xếp loại Tốt / Khá / Đạt / Chưa đạt.
  - `convertGPA10To4(gpa10)`: Quy đổi điểm hệ 10 sang hệ 4 phục vụ hồ sơ quốc tế.

#### Task 15: `PBI-20` | Jira: `KAN-126` | ClickUp: `z8qgvcdgbb`
* **Tên Task**: Quy trình Khóa sổ điểm 2 cấp (GVBM khóa môn -> BGH khóa toàn trường) & Mở khóa đặc biệt.
* **Người thực hiện**: **Trần Quang Vinh** (Security) & **Huỳnh Trung Tính** (Backend API).
* **Nghiệp vụ / Làm gì**:
  - Cấp 1: GVBM hoàn tất nhập điểm và bấm Khóa môn.
  - Cấp 2: BGH kiểm tra toàn trường và kích hoạt Khóa sổ điểm học kỳ (`grade_book_closures`).
  - Giao dịch ACID đảm bảo toàn vẹn: Sau khi khóa, mọi API cập nhật điểm đều trả về HTTP 403 Forbidden.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/ClosureController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/GradeClosurePage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `ClosureController.lockGradeBook`: Khóa sổ điểm học kỳ.
  - `ClosureController.unlockGradeBook`: Mở khóa đặc biệt dành riêng cho BGH kèm lý do và ghi Audit Log.

#### Task 16: `PBI-22` | Jira: `KAN-127` | ClickUp: `z8qgvcdgbc`
* **Tên Task**: Xuất sổ điểm điện tử, phiếu điểm cá nhân & Báo cáo học vụ sang PDF / Excel.
* **Người thực hiện**: **Nguyễn Minh Quốc Bảo** (QA Lead & Export Engine).
* **Nghiệp vụ / Làm gì**:
  - Xuất bảng điểm chi tiết cả lớp ra file Excel chuẩn cột điểm bằng thư viện `SheetJS (xlsx)`.
  - Xuất Phiếu báo điểm cá nhân gửi phụ huynh và Học bạ điện tử chuẩn mẫu Bộ GD&ĐT bằng `jsPDF`.
* **Tệp mã nguồn tương ứng**:
  - Export Engine: `members/member5_Modules_QA/exportEngine.js`
  - Test Suite: `members/member5_Modules_QA/tests/unitTestingSuite.test.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `exportGradebookToExcel(classData, grades)`: Sinh file bảng tính `.xlsx`.
  - `exportStudentReportCardPDF(studentData, gpaResult)`: Sinh file PDF trang A4 định dạng chuẩn.

---

### 🔹 MODULE 6: THÔNG BÁO & TƯƠNG TÁC SỔ LIÊN LẠC NỘI BỘ

#### Task 17: `PBI-11` | Jira: `KAN-128` | ClickUp: `z8qgvcdgbd`
* **Tên Task**: Bảng tin thông báo toàn trường, phân luồng theo vai trò & Ghim tin quan trọng.
* **Người thực hiện**: **Võ Hoàng Sơn** (Frontend) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - BGH đăng thông báo chung toàn trường hoặc phân luồng thông báo chỉ gửi cho Giáo viên hoặc Phụ huynh.
  - Chức năng ghim tin quan trọng (tin bão lũ, lịch nghỉ Tết, lịch họp phụ huynh).
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/NotificationController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/communication/NoticeBoardPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `NotificationController.broadcast`: Gửi thông báo đến danh sách người dùng theo vai trò.
  - `NoticeBoardPage`: Giao diện danh sách tin tức có huy hiệu phân loại.

#### Task 18: `PBI-12` | Jira: `KAN-129` | ClickUp: `z8qgvcdgbe`
* **Tên Task**: Kênh trao đổi tin nhắn trực tuyến Real-time (Socket.io) giữa GVCN & Phụ huynh.
* **Người thực hiện**: **Trần Quang Vinh** (Logic/Socket) & **Võ Hoàng Sơn** (Frontend).
* **Nghiệp vụ / Làm gì**:
  - Phòng chat trực tiếp 1-1 giữa Phụ huynh học sinh và Giáo viên chủ nhiệm lớp.
  - Truyền nhận tin nhắn thời gian thực qua WebSockets (Socket.io), lưu vết vào bảng `parent_messages`.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/CommunicationController.js`
  - Frontend Component: `members/member2_Frontend/src/pages/communication/LiveChatModal.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `CommunicationController.sendMessage`: Ghi nhận và phát sóng tin nhắn đến socket client.
  - `CommunicationController.getThread`: Tải lại lịch sử hội thoại giữa phụ huynh và GVCN.

#### Task 19: `PBI-18` | Jira: `KAN-130` | ClickUp: `z8qgvcdgbf`
* **Tên Task**: Sổ liên lạc điện tử định kỳ: Tổng hợp Điểm số, Chuyên cần & Nhận xét của GVCN.
* **Người thực hiện**: **Võ Hoàng Sơn** (Dev Frontend Lead) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - Màn hình sổ liên lạc số hóa giúp phụ huynh theo dõi tiến độ học tập hàng tuần của con.
  - Hiển thị nhận xét cá nhân hóa của GVCN về đạo đức, tác phong và học lực.
* **Tệp mã nguồn tương ứng**:
  - Frontend Page: `members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx`
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `StudentController.getStudentFullReport`: Tổng hợp điểm, chuyên cần và nhận xét vào 1 API duy nhất.

---

### 🔹 MODULE 7: QUẢN LÝ HỌC PHÍ, CỔNG THANH TOÁN VIETQR & BIÊN LAI PDF

#### Task 20: `PBI-13` | Jira: `KAN-131` | ClickUp: `z8qgvcdgbg`
* **Tên Task**: Quản lý danh mục khoản thu học phí, đợt thu & Miễn giảm theo đối tượng chính sách.
* **Người thực hiện**: **Huỳnh Trung Tính** (Dev Backend & DBA Lead).
* **Nghiệp vụ / Làm gì**:
  - Thiết lập danh mục khoản thu: Học phí học kỳ, tiền nước uống, bảo hiểm y tế, quỹ hội phụ huynh.
  - Áp dụng chính sách miễn giảm 50%, 100% cho con thương binh, liệt sĩ hoặc hộ nghèo.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js`
  - Backend Repository: `members/member3_Backend_DB/school-management-nodejs/src/repositories/TuitionRepository.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `TuitionController.createTuitionBatch`: Tạo đợt thu học phí cho toàn khối.
  - `TuitionRepository.applyExemption`: Tính toán số tiền thực thu sau khi áp dụng miễn giảm.

#### Task 21: `PBI-17a` | Jira: `KAN-132` | ClickUp: `z8qgvcdgbh`
* **Tên Task**: Tích hợp Cổng thanh toán VietQR động NAPAS 247 & Tự động gạch nợ học phí qua Webhook.
* **Người thực hiện**: **Huỳnh Trung Tính** (Backend) & **Trần Quang Vinh** (Fintech Logic).
* **Nghiệp vụ / Làm gì**:
  - Sinh mã VietQR động chuẩn EMVCo chứa thông tin tài khoản nhà trường, đúng số tiền nợ và nội dung giao dịch duy nhất (`HTQLLH_<STUDENT_ID>_<TERM>`).
  - Webhook mô phỏng và endpoint xác thực đối soát tự động chuyển trạng thái khoản thu sang `PAID`.
* **Tệp mã nguồn tương ứng**:
  - Backend Helper: `members/member3_Backend_DB/school-management-nodejs/src/utils/vietQrHelper.js`
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js`
  - Frontend Modal: `members/member2_Frontend/src/components/VietQrPaymentModal.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `generateVietQRUrl`: Tạo chuỗi mã QR theo chuẩn NAPAS 247 và checksum CRC16.
  - `TuitionController.processWebhook`: Gạch nợ hóa đơn ngay khi nhận tín hiệu chuyển khoản.
  - `VietQrPaymentModal.jsx`: Hộp thoại hiển thị QR, đếm ngược 15 phút và kiểm tra giao dịch mỗi 3s.

#### Task 22: `PBI-17b` | Jira: `KAN-133` | ClickUp: `z8qgvcdgbi`
* **Tên Task**: Xuất hóa đơn / Biên lai điện tử PDF chuẩn A4 & Tra cứu lịch sử công nợ học phí.
* **Người thực hiện**: **Nguyễn Minh Quốc Bảo** (QA Lead) & **Võ Hoàng Sơn** (Frontend).
* **Nghiệp vụ / Làm gì**:
  - Xuất phiếu biên lai thu tiền học phí điện tử PDF trang A4 có watermark, mã hóa đơn, mộc đỏ và chữ ký số kế toán.
  - Lưu trữ lịch sử giao dịch thanh toán trong bảng `payments`.
* **Tệp mã nguồn tương ứng**:
  - Frontend Helper: `members/member2_Frontend/src/utils/exportTuitionReceiptPDF.js`
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `exportTuitionReceiptPDF(paymentData)`: Khởi tạo jsPDF, vẽ khung hóa đơn chuẩn quy chế tài chính trường học.
  - `TuitionController.getPaymentHistory`: Trả về lịch sử giao dịch theo học sinh.

#### Task 23: `PBI-24` | Jira: `KAN-134` | ClickUp: `z8qgvcdgbk`
* **Tên Task**: Báo cáo tài chính, thống kê công nợ tồn đọng & Tỷ lệ thu học phí theo Khối/Lớp (BGH).
* **Người thực hiện**: **Võ Duy Bình** (Lead PM & BA) & **Huỳnh Trung Tính** (Backend API).
* **Nghiệp vụ / Làm gì**:
  - Dashboard tài chính dành cho Hiệu trưởng: Thống kê tổng số tiền đã thu, công nợ còn lại, tỷ lệ hoàn thành theo lớp.
  - Gửi thông báo nhắc nhở nộp học phí tự động đến các phụ huynh chưa hoàn tất.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/BGHTuitionPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `TuitionController.getOverviewStats`: Trả về tổng tiền, số học sinh đã nộp và số còn nợ.
  - `BGHTuitionPage`: Biểu đồ hình tròn tỷ lệ thu tiền và bảng danh sách công nợ chi tiết.

---

### 🔹 MODULE 8: BÁO CÁO THỐNG KÊ, NHẬT KÝ KIỂM TOÁN & DASHBOARD BGH

#### Task 24: `PBI-15` | Jira: `KAN-135` | ClickUp: `z8qgvcdgbl`
* **Tên Task**: Bảng điều khiển (Dashboard) số liệu học vụ & Tài chính thời gian thực (BGH).
* **Người thực hiện**: **Võ Hoàng Sơn** (Dev Frontend Lead) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - Bảng điều khiển trung tâm cho Hiệu trưởng và BGH: Tổng số học sinh toàn trường, tỷ lệ đi học hôm nay, tỷ lệ học lực Giỏi/Khá.
  - Widget thống kê nhanh các việc cần xử lý (đơn xin nghỉ chờ duyệt, yêu cầu đổi tiết).
* **Tệp mã nguồn tương ứng**:
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx`
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/DashboardController.js`
* **Hàm / Component / Chức năng code cụ thể**:
  - `DashboardController.getSummary`: Cung cấp toàn bộ KPI học vụ cho trang chủ BGH.
  - `BGHDashboardPage`: Giao diện thẻ chỉ số (Cards) và biểu đồ trực quan Recharts/Chart.js.

#### Task 25: `PBI-16` | Jira: `KAN-136` | ClickUp: `z8qgvcdgbm`
* **Tên Task**: Báo cáo tổng kết học kỳ & Năm học theo biểu mẫu chuẩn của Sở/Phòng GD&ĐT.
* **Người thực hiện**: **Nguyễn Minh Quốc Bảo** (QA Lead) & **Huỳnh Trung Tính** (Backend).
* **Nghiệp vụ / Làm gì**:
  - Kết xuất báo cáo tổng hợp chất lượng giáo dục 2 mặt: Học lực và Rèn luyện.
  - Biểu mẫu xuất chuẩn định dạng nộp báo cáo Phòng GD&ĐT và Sở GD&ĐT.
* **Tệp mã nguồn tương ứng**:
  - Backend Controller: `members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/BGHReportCenterPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `ReportController.getSemesterSummary`: Tạo bảng tổng hợp số lượng và tỷ lệ % từng mức xếp loại.

#### Task 26: `PBI-23` | Jira: `KAN-137` | ClickUp: `z8qgvcdgbp`
* **Tên Task**: Nhật ký kiểm toán hệ thống (Audit Trail) & Giám sát truy vết thay đổi điểm số.
* **Người thực hiện**: **Võ Duy Bình** (Lead BA & Giám sát) & **Trần Quang Vinh** (Security Lead).
* **Nghiệp vụ / Làm gì**:
  - Cơ chế ghi vết tự động bất biến (Append-only) vào bảng `audit_logs`.
  - Ghi nhận chi tiết: Ai sửa, sửa vào thời gian nào, địa chỉ IP, giá trị điểm cũ và giá trị điểm mới.
  - Màn hình tra cứu vết kiểm toán dành cho BGH để thanh tra học vụ và phòng ngừa tiêu cực sửa điểm.
* **Tệp mã nguồn tương ứng**:
  - Backend Utility: `members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js`
  - Frontend Page: `members/member2_Frontend/src/pages/bgh/AuditLogPage.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `AuditLogger.log(action, user, entity, entityId, details)`: Ghi nhận sự kiện vào CSDL.
  - `AuditLogPage`: Bảng tra cứu lịch sử sửa đổi với bộ lọc theo người thực hiện và đối tượng.

---

### 🔹 MODULE 9: CỔNG THÔNG TIN PHỤ HUYNH & HỌC SINH TẬP TRUNG

#### Task 27: `PBI-19` | Jira: `KAN-138` | ClickUp: `z8qgvcdgbq`
* **Tên Task**: Cổng thông tin Học sinh & Phụ huynh: Tra cứu điểm, Thời khóa biểu, Chuyên cần & QA Acceptance.
* **Người thực hiện**: **Võ Duy Bình** (Lead PM & BA) & **Võ Hoàng Sơn** (Dev Frontend).
* **Nghiệp vụ / Làm gì**:
  - Trang tổng quan dành riêng cho phụ huynh: Theo dõi điểm số các môn học của con theo thời gian thực.
  - Xem thời khóa biểu trong tuần, số buổi vắng học, nộp tiền học phí VietQR và tải biên lai PDF.
  - Kế hoạch nghiệm thu chấp nhận người dùng UAT bao quát đầy đủ 43 Use Cases hệ thống.
* **Tệp mã nguồn tương ứng**:
  - Frontend Page: `members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx`
  - QA Suite: `members/member5_Modules_QA/tests/unitTestingSuite.test.js`
  - Tài liệu UAT: `docs/UAT_Testing_Plan.md`
* **Hàm / Component / Chức năng code cụ thể**:
  - `ParentPortalPage`: Cổng tích hợp đầy đủ 4 tab: Điểm số, Chuyên cần, Học phí, Đơn từ.
  - `runSystemUnitTests()`: Bộ kiểm thử tự động 136 ca test đảm bảo toàn bộ hệ thống hoạt động chính xác.

---

### 🔹 MODULE 11: TỐI ƯU HÓA HIỆU NĂNG, CONTAINER HÓA & NHẬN DIỆN THƯƠNG HIỆU SỐ
*(Danh sách ClickUp: [Module 11](https://app.clickup.com/1100320000025585/v/l/li/1100320000181297) - ID: `1100320000181297`)*

#### Task 28: `PBI-28` | Jira: `KAN-139` | ClickUp: `z8qgvcjdqc` ([Xem Task](https://app.clickup.com/t/z8qgvcjdqc))
* **Tên Task**: Tối ưu hóa hiệu năng Frontend: Phân tách mã nguồn Lazy Loading (Code-Splitting), giảm 95.5% bundle & Chuẩn hóa React Router v7.
* **Người thực hiện**: **Võ Hoàng Sơn** (Dev Frontend Lead) & **Võ Duy Bình** (Lead Reviewer).
* **Story Points**: **5 SP**
* **Trạng thái**: **COMPLETE (ĐÃ HOÀN THÀNH)**
* **Nghiệp vụ / Làm gì**:
  - Tái cấu trúc bộ định tuyến với `React.lazy()` và `Suspense` cho toàn bộ 25 phân hệ học vụ.
  - Phân tách vendor chunks (`vendor-react`, `vendor-xlsx`) trong cấu hình Vite.
  - Giảm dung lượng tệp khởi tạo `index.js` từ 821 kB xuống 37.14 kB (giảm 95.5%), loại bỏ hoàn toàn cảnh báo 500 kB.
  - Bật cờ `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` triệt tiêu 100% cảnh báo trên console trình duyệt và kiểm thử Vitest.
  - Dọn sạch 1.6 MB tệp ảnh tĩnh tồn dư trong thư mục `public/`.
* **Tệp mã nguồn tương ứng**:
  - `members/member2_Frontend/src/routes/AppRouter.jsx`
  - `members/member2_Frontend/vite.config.js`
  - `members/member2_Frontend/src/App.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `PageLoadingFallback`: Component hiển thị spinner mượt mà trong quá trình nạp module con theo yêu cầu.
  - `manualChunks(id)`: Hàm phân loại thư viện vendor phục vụ bộ nhớ đệm trình duyệt tối ưu.

#### Task 29: `PBI-29` | Jira: `KAN-140` | ClickUp: `z8qgvcjdqy` ([Xem Task](https://app.clickup.com/t/z8qgvcjdqy))
* **Tên Task**: Đóng gói Docker Compose Fullstack 3 Phân tầng (Nginx SPA, Node.js Express, PostgreSQL 16) phục vụ Triển khai 1-Click Production.
* **Người thực hiện**: **Huỳnh Trung Tính** (Dev Backend & DBA Lead) & **Võ Duy Bình** (Lead PM & BA).
* **Story Points**: **5 SP**
* **Trạng thái**: **COMPLETE (ĐÃ HOÀN THÀNH)**
* **Nghiệp vụ / Làm gì**:
  - Xây dựng Multi-stage Dockerfile cho Frontend React SPA (Node.js 20 Alpine builder -> Nginx Alpine phục vụ tệp tĩnh).
  - Cấu hình Nginx reverse proxy `/api/` tự động định tuyến sang Backend container và SPA fallback routing (`try_files $uri $uri/ /index.html`).
  - Cập nhật tệp `docker-compose.yml` điều phối mạng cầu nối (Bridge Network) kết nối thông suốt 3 phân tầng.
* **Tệp mã nguồn tương ứng**:
  - `members/member2_Frontend/Dockerfile`
  - `members/member2_Frontend/nginx.conf`
  - `docker-compose.yml`
* **Hàm / Component / Chức năng code cụ thể**:
  - `docker compose up -d --build`: Khởi chạy tự động 1-click cả 3 dịch vụ `postgres-db`, `backend-api`, `frontend-spa`.

#### Task 30: `PBI-30` | Jira: `KAN-141` | ClickUp: `z8qgvcjdqz` ([Xem Task](https://app.clickup.com/t/z8qgvcjdqz))
* **Tên Task**: Thiết kế Bộ nhận diện Thương hiệu Trường học Số HSU Digital Campus, Vector Emblem & Cổng Đăng nhập Enterprise SSO.
* **Người thực hiện**: **Trần Quang Vinh** (Security Lead) & **Võ Hoàng Sơn** (Frontend UI/UX).
* **Story Points**: **5 SP**
* **Trạng thái**: **COMPLETE (ĐÃ HOÀN THÀNH)**
* **Nghiệp vụ / Làm gì**:
  - Thiết kế vector emblem chính thức `logo-hsu.svg` (Hoa Sen vàng HSU, Mũ cử nhân, Khiên xanh hoàng gia), đồng bộ Favicon, Header Avatar trực quan, Sidebar Header.
  - Tái thiết kế Cổng Đăng Nhập chuẩn Enterprise Single Sign-On: Tự động nhận diện vai trò từ CSDL PostgreSQL (không bắt người dùng chọn vai trò thủ công), loại bỏ hoàn toàn các nhãn thử nghiệm prototype/vibe-coding, tích hợp ngăn kéo tài khoản kiểm thử bảo mật.
* **Tệp mã nguồn tương ứng**:
  - `members/member2_Frontend/public/logo-hsu.svg`
  - `members/member2_Frontend/src/pages/auth/LoginPage.jsx`
  - `members/member2_Frontend/src/components/layout/Sidebar.jsx`
  - `members/member2_Frontend/src/components/layout/Header.jsx`
* **Hàm / Component / Chức năng code cụ thể**:
  - `AuthController.login`: Tự động truy vấn vai trò thực tế từ bảng `users` khi không nhận được tham số `role`.
  - `LoginPage.jsx`: Giao diện SSO bảo mật SSL 256-bit chuẩn cổng thông tin giáo dục chính thống.

---

## 3. HƯỚNG DẪN DÀNH CHO LEADER KHI CẦN TRA CỨU HOẶC TRẢ LỜI CÔ

1. **Khi Cô hỏi bất kỳ chức năng nào (Ví dụ: "Ai làm tính năng thanh toán học phí VietQR?")**:
   - Mở ngay tài liệu này $\rightarrow$ Tìm `VietQR` $\rightarrow$ Thấy ngay: **Task `PBI-17a` (`KAN-132`) do Trần Quang Vinh & Huỳnh Trung Tính phụ trách Backend (`TuitionController.js`, `vietQrHelper.js`), Võ Hoàng Sơn làm Frontend (`VietQrPaymentModal.jsx`), và em (Võ Duy Bình) làm màn hình báo cáo BGH (`PBI-24`)**.
2. **Khi Cô hỏi: "Code hàm tính điểm Thông tư 22 nằm ở đâu?"**:
   - Chỉ ngay: **Task `PBI-09` (`KAN-124`) nằm tại file `members/member4_Logic_Security/gpaCalculationLogic.js`, hàm `calculateAverageSubjectScore` chia đúng mẫu số 9**.
3. **Khi Cô hỏi: "Hệ thống tối ưu hiệu năng và đóng gói thế nào?"**:
   - Trả lời ngay: **"Dạ hệ thống đã được nhóm tối ưu hóa trong Task `PBI-28` (Code-Splitting giảm 95.5% bundle còn 37KB) và `PBI-29` (Docker Compose Fullstack 3 phân tầng do bạn Huỳnh Trung Tính và em phụ trách)"**.
4. **Khi Cô hỏi: "Làm sao em biết được các bạn có làm thật hay không?"**:
   - Trình bày: **"Toàn bộ 30 tasks này đều đã được đồng bộ lên Jira Cloud (`KAN-112` đến `KAN-141`) và ClickUp, có đầy đủ commit ID, phân bổ Story Points cân bằng tuyệt đối 30 SP mỗi bạn (20%), người phụ trách rõ ràng và đã được em trực tiếp review mã nguồn trước khi merge vào nhánh `main`"**.
