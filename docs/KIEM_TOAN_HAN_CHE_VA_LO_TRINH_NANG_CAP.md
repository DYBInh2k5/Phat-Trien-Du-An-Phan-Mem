# BÁO CÁO KIỂM TOÁN KIẾN TRÚC, ĐÁNH GIÁ THIẾU SÓT & LỘ TRÌNH NÂNG CẤP HỆ THỐNG
# (ARCHITECTURAL AUDIT, GAP ANALYSIS & PRODUCTION ROADMAP)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC & HỌC VỤ THPT (HTQLLH / EDUMANAGE PRO)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN - HSU)
CHỦ TRÌ KIỂM TOÁN: VÕ DUY BÌNH (PROJECT MANAGER & LEAD BA / LEAD REVIEWER)
ĐƠN VỊ THẨM ĐỊNH: TOÀN THỂ BAN PHÁT TRIỂN 5 THÀNH VIÊN (TEAM GROUP 2)
NGÀY LẬP BÁO CÁO: 25/11/2026 (TUẦN 11 / 15 TUẦN HỌC KỲ 2631)
TRẠNG THÁI HIỆN TẠI: 400/400 TESTS PASS (100% XANH) | VERCEL & NEON DB PRODUCTION LIVE
MỤC ĐÍCH: BÁO CÁO ĐỘC LẬP, KHÁCH QUAN, TOÀN DIỆN VỀ NHỮNG ĐIỂM HẠN CHẾ CỐT LÕI,
          RỦI RO TIỀM ẨN VÀ KẾ HOẠCH NÂNG CẤP HỆ THỐNG LÊN CHUẨN DOANH NGHIỆP (ENTERPRISE)
================================================================================
```

---

## 1. TỔNG QUAN HIỆN TRẠNG HỆ THỐNG

Sau 11 tuần triển khai tích cực theo phương pháp luận Agile/Scrum, hệ thống HTQLLH đã đạt được những cột mốc kỹ thuật quan trọng:
- Hoàn thành **43 Use Cases** chuẩn SRS IEEE 830 và **30 Product Backlog Items (150 Story Points)** chia đều chính xác **30 SP (20.0%)** cho 5 thành viên.
- Kiến trúc Clean Architecture 4 tầng phân tách rõ ràng giữa Controller, Service, Repository và Entity.
- Kiểm thử tự động đạt **400 / 400 tests PASS (100% Xanh tuyệt đối)**.
- Triển khai thành công trên môi trường đám mây Vercel Serverless (Frontend & Backend) và Neon Cloud PostgreSQL (18 bảng chuẩn 3NF).

Tuy nhiên, khi đối chiếu với một **Hệ thống Quản lý Học vụ Chuyên nghiệp Cấp Sở / Cấp Trường Thực tế** và quy chế đào tạo Thông tư 22/2021/TT-BGDĐT, hệ thống vẫn tồn tại các hạn chế kỹ thuật cần được phân tích thẳng thắn và có lộ trình nâng cấp rõ ràng.

---

## 2. BẢNG PHÂN TÍCH 10 THIẾU SÓT & HẠN CHẾ CỐT LÕI (GAP ANALYSIS)

### 2.1. Phân hệ Bảo mật, Xác thực & Phân quyền (Security & Authorization)

#### ⚠️ Hạn chế 1: Các Tuyến Đường Backend Chưa Gắn Middleware Xác Thực (P0 - Khẩn cấp)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/server.js` (Dòng 192, 194, 210, 214).
- **Hiện trạng kỹ thuật**:
  - `app.get('/api/leave-requests', LeaveRequestController.getLeaveRequests);`
  - `app.put('/api/leave-requests/:id/approve', LeaveRequestController.approveLeaveRequest);`
  - `app.post('/api/classes', ClassController.createClass);`
  - `app.post('/api/subjects', SubjectController.createSubject);`
- **Tác động & Rủi ro**: Người dùng bên ngoài không cần đăng nhập có thể dùng `curl` hoặc Postman gửi request để xem danh sách đơn nghỉ học, tự duyệt đơn nghỉ học hoặc thêm môn học/lớp học tùy tiện.
- **Giải pháp xử lý**: Gắn ngay middleware `authenticateToken` và `authorizeRoles('BGH', 'GVCN')` vào các route này.

#### ⚠️ Hạn chế 2: JWT Stateless Chưa Có Cơ Chế Hủy Phiên Khi Đăng Xuất (P1)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js`.
- **Hiện trạng kỹ thuật**: Khi người dùng ấn nút "Đăng xuất" (Logout), Frontend chỉ thực hiện xóa token khỏi `localStorage`. Bản thân chuỗi JWT vẫn còn hiệu lực 24 giờ trên server.
- **Tác động & Rủi ro**: Nếu token bị kẻ xấu sao chép trước đó (qua XSS hoặc mạng công cộng), token vẫn tiếp tục gọi được API cho đến khi hết hạn.
- **Giải pháp xử lý**: Tận dụng cột `token_version` đã được thiết kế sẵn trong bảng `users` (`schema.sql` dòng 34). Mỗi khi đăng xuất hoặc đổi mật khẩu, backend tăng `token_version = token_version + 1`, middleware `authenticateToken` sẽ so khớp version này để từ chối token cũ.

#### ⚠️ Hạn chế 3: Thiếu Chữ Ký Số Xác Thực Webhook Cổng Thanh Toán VietQR (P1)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js` (`handleWebhook`).
- **Hiện trạng kỹ thuật**: API Webhook nhận callback học phí đang nhận body trực tiếp mà chưa kiểm tra chữ ký bí mật `x-signature` từ Cổng thanh toán (như VietQR Napas/PayOS).
- **Tác động & Rủi ro**: Kẻ tấn công có thể giả lập bản tin Webhook ngân hàng để gạch nợ khống học phí cho học sinh.
- **Giải pháp xử lý**: Tích hợp middleware xác thực chữ ký HMAC-SHA256:
  ```javascript
  const expectedSig = crypto.createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
                            .update(req.rawBody)
                            .digest('hex');
  if (req.headers['x-signature'] !== expectedSig) return res.status(401).json({ message: 'Invalid Signature' });
  ```

---

### 2.2. Phân hệ Nghiệp vụ Học vụ & Pháp lý (Business Logic & TT22)

#### ⚠️ Hạn chế 4: Chưa Hỗ Trợ Môn Học Đánh Giá Bằng Nhận Xét (Đạt / Chưa đạt) (P2)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js` và `database/schema.sql`.
- **Hiện trạng kỹ thuật**: Bảng `grade_books` chỉ có các cột điểm số thực (`score_oral`, `score_15m`, `score_1hour`, `score_mid_term`, `score_final_term`, `average_score`). Hàm `calculateTBM` luôn tính trung bình chia 9 cho mọi môn.
- **Đối chiếu Thông tư 22/2021/TT-BGDĐT**: Các môn *Giáo dục thể chất, Nghệ thuật (Âm nhạc, Mỹ thuật), Hoạt động trải nghiệm hướng nghiệp, Giáo dục địa phương* **KHÔNG** chấm điểm số mà chỉ đánh giá bằng nhận xét: **Đạt (Đ)** hoặc **Chưa đạt (CĐ)** và không tham gia tính điểm trung bình môn học kỳ.
- **Giải pháp xử lý**: Bổ sung cột `evaluation_type VARCHAR(20) DEFAULT 'SCORE'` trong bảng `subjects`. Khi môn là `COMMENT`, giao diện chỉ hiển thị radio chọn `Đ` / `CĐ` và bảng điểm không tính ĐTBmhk.

#### ⚠️ Hạn chế 5: Tầng Service Chưa Kiểm Tra Biên Độ Điểm Số (0.0 đến 10.0) (P1)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js` (`calculateTBM`, `saveGradesFromSpreadsheet`).
- **Hiện trạng kỹ thuật**: Frontend đã chặn nhập ký tự lạ, nhưng tại tầng Backend Service chưa có câu lệnh `if (score < 0 || score > 10) throw new Error(...)`.
- **Tác động & Rủi ro**: Nếu người dùng gọi API trực tiếp gửi điểm âm (-5.0) hoặc điểm trên 10 (15.0), hệ thống vẫn tính toán và lưu vào PostgreSQL.
- **Giải pháp xử lý**: Bổ sung validator nghiêm ngặt tại Service:
  ```javascript
  function validateScoreRange(score, fieldName) {
    if (score != null && (isNaN(score) || score < 0 || score > 10)) {
      throw new Error(`Điểm ${fieldName} không hợp lệ (${score}). Điểm số phải từ 0.0 đến 10.0.`);
    }
  }
  ```

---

### 2.3. Phân hệ Cơ sở Dữ liệu & Tính Toàn Vẹn Dữ Liệu (Database & Integrity)

#### ⚠️ Hạn chế 6: Thiếu Cơ Chế Xóa Mềm (Soft Delete) Bảo Tồn Hồ Sơ Học Bạ (P2)
- **Vị trí mã nguồn**: `database/schema.sql` (bảng `students`, `school_classes`).
- **Hiện trạng kỹ thuật**: Các khóa ngoại đều thiết lập `ON DELETE CASCADE` hoặc `ON DELETE SET NULL`. Thao tác xóa hiện tại là Xóa cứng (Hard Delete).
- **Tác động & Rủi ro**: Theo quy định lưu trữ hồ sơ học bạ điện tử của ngành giáo dục, thông tin học sinh và điểm số đã phát sinh không bao giờ được phép xóa vĩnh viễn khỏi CSDL vì mục đích kiểm toán và đối soát pháp lý.
- **Giải pháp xử lý**: Bổ sung `deleted_at TIMESTAMPTZ DEFAULT NULL` và `is_deleted BOOLEAN DEFAULT FALSE`. Khi xóa: `UPDATE students SET deleted_at = NOW(), is_deleted = TRUE WHERE id = $1`.

#### ⚠️ Hạn chế 7: Thiếu Khóa Lạc Quan (Optimistic Locking) Chống Xung Đột Ghi Đè Sổ Điểm (P2)
- **Vị trí mã nguồn**: `members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js`.
- **Hiện trạng kỹ thuật**: Lưu dữ liệu theo cơ chế *Last-Write-Wins*. Nếu 2 giáo viên cùng mở sổ điểm của một lớp và ấn lưu cách nhau 2 giây, người ấn sau sẽ đè mất hoàn toàn dữ liệu người ấn trước mà không có cảnh báo.
- **Giải pháp xử lý**: Bổ sung cột `version INT DEFAULT 1` trên bảng `grade_books`. Khi lưu:
  ```sql
  UPDATE grade_books 
  SET score_oral = $1, score_final_term = $2, version = version + 1 
  WHERE id = $3 AND version = $4;
  -- Nếu rowsAffected === 0 thì báo lỗi HTTP 409 Conflict: "Dữ liệu sổ điểm đã bị người khác thay đổi."
  ```

---

### 2.4. Phân hệ Giao diện & Hiệu Năng Người Dùng (Frontend UI/UX)

#### ⚠️ Hạn chế 8: Thiếu Phân Trang Server-Side (Pagination) Cho Danh Sách Học Sinh (P2)
- **Vị trí mã nguồn**: `members/member2_Frontend/src/pages/students/StudentListPage.jsx`.
- **Hiện trạng kỹ thuật**: Frontend tải toàn bộ danh sách học sinh về bộ nhớ RAM rồi dùng `useMemo` lọc phía client.
- **Tác động & Rủi ro**: Hiện tại với 16–45 học sinh demo thì hoạt động rất mượt mà. Tuy nhiên, nếu áp dụng cho một trường THPT có 2.000–3.000 học sinh, việc render đồng loạt hàng ngàn thẻ DOM sẽ gây đơ lag trình duyệt và tốn băng thông tải trang lần đầu.
- **Giải pháp xử lý**: Xây dựng API chuẩn phân trang `GET /api/students?page=1&limit=20&search=...` và tích hợp component thanh phân trang `PaginationControls.jsx`.

#### ⚠️ Hạn chế 9: Giao Tiếp Sổ Liên Lạc & Thông Báo Chưa Có Real-time WebSocket (P3)
- **Vị trí mã nguồn**: `members/member2_Frontend/src/pages/communication/ParentCommunicationPage.jsx`, `NotificationsPage.jsx`.
- **Hiện trạng kỹ thuật**: Tin nhắn trao đổi giữa Phụ huynh và Giáo viên chủ nhiệm đang sử dụng cơ chế Polling (tải lại dữ liệu định kỳ hoặc khi F5 trang).
- **Tác động & Rủi ro**: Tin nhắn không được đẩy ngay lập tức (Push), phụ huynh gửi tin nhắn thì giáo viên phải chuyển tab hoặc tải lại mới thấy tin mới.
- **Giải pháp xử lý**: Tích hợp thư viện **Socket.io** hoặc giao thức **Server-Sent Events (SSE)** để khi phụ huynh gửi tin, màn hình giáo viên lập tức hiển thị thông báo toast và tin nhắn nảy tức thì.

#### ⚠️ Hạn chế 10: Trải Nghiệm Bảng Tính Sổ Điểm Trên Thiết Bị Di Động Màn Hình Nhỏ (P3)
- **Vị trí mã nguồn**: `members/member2_Frontend/src/pages/gv/GradebookPage.jsx`.
- **Hiện trạng kỹ thuật**: Bảng Spreadsheet thiết kế tối ưu cho máy tính để bàn (Desktop / Laptop) với nhiều cột điểm số (Miệng, 15p, 1 tiết, Giữa kỳ, Cuối kỳ). Khi xem trên điện thoại thông minh, người dùng phải cuộn ngang liên tục.
- **Giải pháp xử lý**: Bổ sung chế độ chuyển đổi linh hoạt sang **Card View** trên màn hình `< 768px` (Mobile) và thiết lập cơ chế **Sticky Column** cố định 2 cột "Mã HS" và "Họ và Tên" khi cuộn ngang.

---

## 3. DANH MỤC 6 TASKS MỞ RỘNG (PBI-31 ĐẾN PBI-36) ĐỒNG BỘ TRÊN 3 NỀN TẢNG QUẢN TRỊ DỰ ÁN

Để đảm bảo tính liên tục và chuyên nghiệp theo chuẩn Agile/Scrum, nhóm đã lập kế hoạch mở rộng thêm **6 Tasks Cải tiến & Hoàn thiện** được đồng bộ trực tiếp lên **ClickUp, Trello và Jira**:

| Mã Task | Tên Nhiệm Vụ Cải Tiến / Nâng Cấp | Mức Ưu Tiên | Phân Hệ | Thành Viên Đảm Nhận | Trạng Thái ClickUp |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **PBI-31** | **Vá lỗi phân quyền & Bảo mật các route hở trong server.js** (leave-requests, classes, subjects) | **P0 (Khẩn cấp)** | Module 1 (Auth & RBAC) | Trần Quang Vinh | `COMPLETE (Đã vá & kiểm thử)` |
| **PBI-32** | **Kiểm tra biên độ điểm số 0.0 - 10.0 ở tầng Service Backend** chống gian lận & nhập sai | **P1 (Cao)** | Module 5 (Sổ điểm TT22) | Trần Quang Vinh | `COMPLETE (Đã vá & kiểm thử)` |
| **PBI-33** | **Nghiên cứu mở rộng Môn học Đánh giá bằng Nhận xét (Đ/CĐ)** theo chuẩn Thông tư 22 | **P2 (Vừa)** | Module 5 (Sổ điểm TT22) | Huỳnh Trung Tính | `TO DO` ([Xem ClickUp](https://app.clickup.com/1100320000025585/v/l/li/1100320000181297)) |
| **PBI-34** | **Tích hợp Chữ ký số HMAC-SHA256 Webhook VietQR & Token Invalidation khi Logout** | **P1 (Cao)** | Module 9 (Học phí VietQR) | Huỳnh Trung Tính | `TO DO` ([Xem ClickUp](https://app.clickup.com/1100320000025585/v/l/li/1100320000181297)) |
| **PBI-35** | **Thiết kế API Phân trang Server-side (Page/Limit)** cho Danh sách Học sinh & Sổ điểm | **P2 (Vừa)** | Module 2 (Hồ sơ học sinh) | Võ Hoàng Sơn | `TO DO` ([Xem ClickUp](https://app.clickup.com/1100320000025585/v/l/li/1100320000181297)) |
| **PBI-36** | **Cơ chế Xóa mềm (Soft Delete) bảo tồn lịch sử học bạ & Optimistic Locking** chống xung đột | **P2 (Vừa)** | Module 6 (ACID & CSDL) | Võ Duy Bình | `TO DO` ([Xem ClickUp](https://app.clickup.com/1100320000025585/v/l/li/1100320000181297)) |

---

## 4. MA TRẬN PHÂN LOẠI & LỘ TRÌNH THỰC THI (SPRINT ROADMAP)

```
                     MỨC ĐỘ ẢNH HƯỞNG CAO
                               |
              [P0] PBI-31      |     [P1] PBI-32, PBI-34
        Vá các route hở        |    Validate điểm 0-10 &
        bảo mật trong server   |    Chữ ký số Webhook VietQR
    ---------------------------+---------------------------
              [P2] PBI-35      |     [P2] PBI-33, PBI-36
        Phân trang Server-side |    Môn học nhận xét Đ/CĐ &
        tránh quá tải UI       |    Soft Delete hồ sơ học bạ
                               |
                     MỨC ĐỘ ẢNH HƯỞNG VỪA
```

- **Giai đoạn Nghiệm thu Đồ án (Tuần 11 - Hiện tại)**: Tập trung xử lý dứt điểm **P0 (PBI-31)** và **P1 (PBI-32)** nhằm bảo đảm hệ thống vững chắc và an toàn tuyệt đối khi Hội đồng chấm thi kiểm thử trực tiếp trên bản Live.
- **Giai đoạn Đóng gói Release v1.0 (Tuần 12 - Tuần 13)**: Triển khai các tính năng nâng cao PBI-33, PBI-34, PBI-35, PBI-36 phục vụ bản phát hành hoàn thiện.

---

## 5. TÌNH TRẠNG ĐỒNG BỘ 3 NỀN TẢNG QUẢN LÝ DỰ ÁN AGILE

1. **ClickUp Workspace**: [Space Group 2_PTDAPM](https://app.clickup.com/1100320000025585/v/s/1100320000109903)
   - Toàn bộ **30/30 tasks ban đầu** đã được cập nhật trạng thái **`COMPLETE (100% Hoàn Thành)`**.
   - Đã tạo thành công **6 Tasks Nâng cấp (PBI-31 -> PBI-36)** tại Danh sách Module 11/12 để theo dõi tiến trình hoàn thiện tiếp theo.
2. **Trello Kanban Board**: [https://trello.com/b/gkdRNT57](https://trello.com/b/gkdRNT57/htqllh-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-l%E1%BB%9Bp-h%E1%BB%8Dc-h%E1%BB%8Dc-v%E1%BB%A5-edumanage-pro)
   - Thiết lập đầy đủ 5 cột tiến độ Kanban phục vụ theo dõi trực quan luồng phát triển.
3. **Jira Cloud Project**: [https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN](https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN)
   - Tệp nhập khẩu dự án `docs/jira_import_product_backlog.csv` đã được cập nhật đồng bộ các Epics và Tasks tương ứng.
