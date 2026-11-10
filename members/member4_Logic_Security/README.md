# THÔNG TIN THÀNH VIÊN 4: SECURITY ENGINEER & CORE ACADEMIC LOGIC DEVELOPER

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: TRẦN QUANG VINH
VAI TRÒ: CORE LOGIC & SECURITY SPECIALIST (LOGIC SECURITY)
TÀI KHOẢN JIRA CLOUD: tqvcontacts
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member4_Logic_Security/README.md
NGÀY CẬP NHẬT: 27/10/2026 (TUẦN 7 / 15 TUẦN HỌC KỲ 2631)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:  
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Liên Kết Mã Nguồn / Logic |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-01** | **KAN-01** | **Xác Thực JWT Token & Thuật Toán Băm Mật Khẩu**: Cấp phát Bearer Token, bcrypt | Cả 5 Roles | 3 SP | **DONE** | [AuthController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js) |
| **EPIC-01** | **KAN-03** | **Middleware Phân Quyền RBAC 5 Cấp Bậc**: Chặn 403 Forbidden nếu không đủ quyền | `UC-ADM-02` | 2 SP | **DONE** | [authMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/middleware/authMiddleware.js) |
| **EPIC-01** | **KAN-04** | **Quản Lý Ma Trận Quyền `system_settings`**: Phân chia chi tiết quyền hạn 5 vai trò | `UC-ADM-02` | 2 SP | **DONE** | [rbacMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/rbacMiddleware.js) |
| **EPIC-05** | **KAN-15** | **Xác Thực Miền Giá Trị Điểm Số**: Kiểm tra ràng buộc điểm số thuộc đoạn $[0.0, 10.0]$ | `UC-GVBM-04` | 2 SP | **DONE** | [gpaCalculationLogic.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/gpaCalculationLogic.js) |
| **EPIC-05** | **KAN-16** | **Thuật Toán Điểm Trung Bình ĐTBmhk Thông Tư 22**: Chia mẫu số 9, làm tròn 1 số | `UC-GVBM-04` | 3 SP | **DONE** | [gpaCalculationLogic.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/gpaCalculationLogic.js) |
| **EPIC-05** | **KAN-17** | **Logic Xếp Loại Học Lực & Điều Kiện Khống**: Tốt/Khá/Đạt/Chưa đạt, GPA 4.0 | `UC-GVCN-08` | 2 SP | **DONE** | [gpaCalculationLogic.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/gpaCalculationLogic.js) |
| **EPIC-05** | **KAN-18** | **Quy Trình Khóa Sổ Điểm 2 Cấp (State Machine)**: `OPEN` -> `SUBMITTED` -> `LOCKED` | `UC-GVCN-09`<br>`UC-ADM-08` | 2 SP | **DONE** | [GradeBookService.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js) |
| **EPIC-05** | **KAN-19** | **Phân Quyền Bảo Mật Điểm Cá Nhân**: Chỉ học sinh/PH được xem bảng điểm của mình | `UC-STU-02` | 1 SP | **DONE** | [GradeBookController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js) |
| **EPIC-06** | **KAN-20** | **Lập Trình Lớp UnitOfWork Bảo Toàn ACID**: Quản lý `BEGIN`, `COMMIT`, `ROLLBACK` | Toàn hệ thống | 2 SP | **DONE** | [UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js) |
| **EPIC-07** | **KAN-23** | **Dịch Vụ AuditLogger Lưu Vết Không Thể Phủ Nhận**: Ghi nhật ký IP, User, Điểm cũ/mới | `UC-ADM-02` | 2 SP | **DONE** | [AuditLogger.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js) |
| **EPIC-07** | **KAN-24** | **Phòng Thủ Ứng Dụng OWASP (Rate Limiting & Helmet)**: Chống Brute-Force, XSS, Sniff | Toàn hệ thống | 1 SP | **DONE** | [server.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/server.js) |
| **TỔNG** | — | **4 Module Lớn (Module 1, 5, 6, 7)** | **Thuật toán học vụ & An toàn bảo mật** | **22 SP** | **DONE** | **Tỷ lệ đóng góp: ~20% toàn hệ thống** |

### Khung Nghiệp Vụ Cốt Lõi & An Toàn Ứng Dụng Đồng Thời Phụ Trách:
- **Công thức ĐTBmhk Thông tư 22/2021/TT-BGDĐT**: $(ĐĐG_{tx\_m} + ĐĐG_{tx\_15p} + ĐĐG_{tx\_1t} \times 2 + ĐĐG_{gk} \times 2 + ĐĐG_{ck} \times 3) / 9$
- **Hàng rào bảo mật Stateless JWT & RBAC 5 Roles**: [jwtAuthMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/jwtAuthMiddleware.js)
- **Cơ chế chống gian lận & lưu vết Audit Trail**: [AuditLogger.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js)
- **Sơ đồ tuần tự bảo mật SD-01, SD-02 và Activity Diagram khóa sổ**: [UML_DIAGRAMS.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UML_DIAGRAMS.md)

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Cài đặt thuật toán học vụ Thông tư 22/2021/TT-BGDĐT**:
  + Mô đun [gpaCalculationLogic.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/gpaCalculationLogic.js):
    `ĐTBmhk = (ĐĐGtx_mieng + ĐĐGtx_15p + ĐĐGtx_1tiet*2 + ĐĐGgk*2 + ĐĐGck*3) / 9`
  + Làm tròn 1 chữ số thập phân, quy đổi sang GPA hệ 4.0 và xếp loại học lực 4 mức chuẩn Bộ GD&ĐT (Tốt, Khá, Đạt, Chưa đạt).
- **Cài đặt máy trạng thái khóa sổ điểm (Gradebook State Machine)**:
  + Chặn sửa điểm trái phép khi sổ điểm ở trạng thái `LOCKED`, chỉ cho phép sửa khi có phê duyệt mở khóa từ Ban Giám Hiệu.
- **Nghiên cứu & mô hình hóa UML**:
  + Vẽ các sơ đồ tuần tự SD-01 (JWT & RBAC), SD-02 (ACID Transaction) và Activity Diagram tính điểm khóa sổ.
  + Hoàn thành Báo cáo Chuyên đề 4 tại [CHUYENDE/Chuyên đề 4 Pattern.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx) (`KAN-91`).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - Thời Điểm Hiện Tại: 27/10/2026)
- **Hoàn thiện giải pháp Xác thực Stateless JWT & Phân quyền RBAC 5 Roles (Thẻ Jira [KAN-7](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-7), [KAN-15](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-15), [KAN-71](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-71))**:
  + Middleware xác thực [jwtAuthMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/jwtAuthMiddleware.js) kiểm tra Bearer Token, kiểm tra chữ ký và hạn sử dụng token.
  + Middleware phân quyền [rbacMiddleware.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/rbacMiddleware.js) thực thi ma trận RBAC cho 5 nhóm vai trò (`ADMIN`, `GVCN`, `GVBM`, `STUDENT`, `PARENT`).
  + Hoàn thành Báo cáo Chuyên đề 6 tại [CHUYENDE/Chuyên đề 6 Authentication Authorization.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx) (`KAN-93`).

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 8 -> Tuần 15)
- **Tuần 8 (02/11 - 08/11/2026)**: Triển khai giải pháp bảo mật dữ liệu và ghi nhật ký kiểm toán [BrainStorm/Week8 Logging .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week8%20Logging%20.md) (`KAN-27`, `KAN-72`).
- **Tuần 10**: Đánh giá và kiểm thử phòng thủ toàn diện các lỗ hổng theo tiêu chuẩn OWASP Top 10 (SQL Injection, XSS, Broken Object Level Authorization - BOLA).

---

## 3. DANH MỤC TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục mã nguồn | Vai Trò & Chức Năng Kỹ Thuật Cụ Thể |
| :--- | :--- |
| `members/member4_Logic_Security/jwtAuthMiddleware.js` | Middleware xác thực chữ ký số JSON Web Token độc lập |
| `members/member4_Logic_Security/rbacMiddleware.js` | Middleware kiểm tra quyền hạn Role-Based Access Control |
| `members/member4_Logic_Security/gpaCalculationLogic.js` | Thuật toán tính ĐTBmhk, GPA hệ 10/4 và xếp loại Thông tư 22 |
| `src/middlewares/authMiddleware.js` | Middleware tích hợp trong Backend Node.js Express chính |
| `CHUYENDE/Chuyên đề 4 Pattern.docx` | Báo cáo nghiên cứu Chuyên đề 4 Mẫu thiết kế & ACID Word |
| `CHUYENDE/Chuyên đề 6 Authentication.docx` | Báo cáo nghiên cứu Chuyên đề 6 Xác thực & RBAC Word |
