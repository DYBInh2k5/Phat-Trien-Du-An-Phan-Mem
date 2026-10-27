# TIẾN ĐỘ THỰC HIỆN DỰ ÁN - TUẦN 7 (26/10/2026 - 01/11/2026)
## CHUYÊN ĐỀ 6: XÁC THỰC, PHÂN QUYỀN RBAC & BẢO MẬT HỆ THỐNG (JWT & SECURITY)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
GIAI ĐOẠN: TUẦN 7 / 15 TUẦN NGHIÊN CỨU & PHÁT TRIỂN
THỜI ĐIỂM CẬP NHẬT: 27/10/2026
TÀI LIỆU CHUYÊN ĐỀ CHI TIẾT: BrainStorm/Week7 Authentication Authorization .md
MÃ THẺ JIRA: KAN-71 (In Progress / Đang Thực Hiện)
================================================================================
```

---

## 1. MỤC TIÊU & NHIỆM VỤ TRỌNG TÂM TUẦN 7

Tuần 7 (từ ngày 26/10/2026 đến 01/11/2026, mốc thời điểm đánh giá là 27/10/2026) tập trung vào nghiên cứu và hiện thực hóa phân hệ Xác thực (Authentication) và Phân quyền (Authorization) theo chuẩn bảo mật ứng dụng Web hiện đại:
1. Nghiên cứu lý thuyết chuyên sâu về JSON Web Token (JWT RFC 7519), cơ chế CORS (Cross-Origin Resource Sharing) và kỹ thuật chống tấn công CSRF.
2. Xây dựng Middleware phân quyền kiểm soát truy cập dựa trên vai trò (RBAC - Role-Based Access Control) cho 5 nhóm tác nhân: Ban Giám Hiệu, Giáo viên Chủ nhiệm, Giáo viên Bộ môn, Học sinh và Phụ huynh.
3. Hiện thực hóa màn hình Đăng nhập tập trung kèm tính năng 1-Click Demo Login cho phép hội đồng thẩm định đăng nhập trải nghiệm tức thời các vai trò mà không cần gõ mật khẩu.
4. Đóng gói mã nguồn Middleware xác thực tích hợp vào Backend Clean Architecture và bảo vệ các tuyến đường Frontend với ProtectedRoute.

---

## 2. BẢNG PHÂN CÔNG & ĐÁNH GIÁ ĐÓNG GÓP 5 THÀNH VIÊN TUẦN 7

| STT | Mã Thẻ Jira | Họ và Tên | Vai Trò Đảm Nhiệm | Nhiệm Vụ Phân Công Cụ Thể | Trạng Thái Đóng Góp |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Điều phối tiến độ tuần 7, cập nhật bảng Kanban, rà soát ma trận truy xuất quyền hạn (RBAC Matrix) và tài liệu hóa quy trình. | 100% Hoàn thành |
| 2 | [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend** | Lập trình giao diện `LoginPage.jsx` 5 Tabs, tích hợp 1-Click Demo Login và bảo vệ tuyến đường với `ProtectedRoute.jsx` trên React 18. | 100% Hoàn thành |
| 3 | [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend** | Hiện thực hóa tầng điều khiển Auth Controller trong Backend Express, truy vấn bảng `users`, mã hóa mật khẩu và cấp phát JWT. | 100% Hoàn thành |
| 4 | [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security** | Chủ trì nghiên cứu cơ chế bảo mật JWT/CORS/CSRF, xây dựng `jwtAuthMiddleware.js` và `rbacMiddleware.js` đa tầng. | 100% Hoàn thành |
| 5 | [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester** | Xây dựng ca kiểm thử bảo mật API xác thực, kiểm tra mã lỗi 401 Unauthorized và 403 Forbidden khi truy cập vượt quyền. | 100% Hoàn thành |

---

## 3. CÁC KẾT QUẢ KỸ THUẬT ĐẠT ĐƯỢC

### 3.1 Về Mặt Nghiên Cứu Học Thuật
- Hoàn thành tài liệu chuyên đề [Week7 Authentication Authorization .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week7%20Authentication%20Authorization%20.md) và tệp báo cáo [Chuyên đề 6 Authentication Authorization.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%206%20Authentication%20Authorization.docx).
- So sánh toàn diện giữa Xác thực có trạng thái (Session/Cookie) và Xác thực không trạng thái (JWT Token):
  + JWT giúp Server không tốn tài nguyên RAM lưu session, dễ dàng mở rộng chiều ngang (Horizontal Scaling) và hoàn toàn tương thích với kiến trúc Single Page Application (SPA).

### 3.2 Về Mặt Mã Nguồn Hiện Thực
- Tệp Middleware xác thực: `members/member4_Logic_Security/jwtAuthMiddleware.js` và `src/middlewares/authMiddleware.js`.
- Tệp Middleware phân quyền: `members/member4_Logic_Security/rbacMiddleware.js`.
- Giao diện đăng nhập: `members/member2_Frontend/src/pages/auth/LoginPage.jsx`.
- Bộ định tuyến bảo vệ: `members/member2_Frontend/src/components/common/ProtectedRoute.jsx`.

---

## 4. KẾ HOẠCH BÀN GIAO & BƯỚC TIẾP THEO (TUẦN 8)

1. Hoàn tất kiểm thử nghiệm thu phân hệ xác thực trên môi trường local.
2. Chuẩn bị bước sang **Tuần 8 (02/11/2026 - 08/11/2026)**:
   - Chuyên đề 7: Ghi nhật ký kiểm toán trung tâm (Centralized Audit Logging) lưu vết lịch sử sửa điểm ([KAN-27](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-27) & [KAN-72](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-72)).
   - Đồng bộ bảng Jira Kanban và cập nhật tài liệu báo cáo tuần kế tiếp.
