# THÔNG TIN THÀNH VIÊN 1: PROJECT MANAGER & LEAD BUSINESS ANALYST (PM / BA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: VÕ DUY BÌNH (TRƯỞNG NHÓM / PM & LEAD BA)
TÀI KHOẢN JIRA CLOUD: Duy Bình (bron@reputyze.asia)
TÀI KHOẢN CLICKUP: Bình Võ Duy (binh.vd01500@sinhvien.hoasen.edu.vn)
MÃ SỐ SINH VIÊN / GITHUB: DYBInh2k5
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member1_PM_BA/README.md
BẢNG JIRA KANBAN BOARD: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
KHÔNG GIAN DỰ ÁN CLICKUP: https://app.clickup.com/1100320000025585/v/s/1100320000109903
BẢN SLIDE TRÌNH CHIẾU CANVA: https://www.canva.com/d/75iOEEpReWqgOuN
CẨM NANG LẬP TRÌNH & SỬA CODE: docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md
NGÀY CẬP NHẬT: 15/11/2026 (TUẦN 10 / 15 TUẦN HỌC KỲ 2631 — HOÀN TẤT 100% TASKS)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD & CLICKUP

> **Ghi chú chuẩn hóa theo quy chuẩn Agile Scrum & Hội đồng Đồ án HSU**:  
> Thẻ Jira và ClickUp quản lý trực tiếp các **Product Backlog Items (PBIs)** cốt lõi của phần mềm với đầy đủ Deadline, Phân tầng Clean Architecture, Code Snippet, Lệnh cURL kiểm thử, Kịch bản UAT Demo 3 phút và Smart Commit.  
> **100% các Task do Võ Duy Bình phụ trách hiện đã chuyển sang trạng thái DONE / COMPLETE.**

| Mã Module | Mã Jira | Mã ClickUp | Tên PBI / Nhiệm Vụ Phụ Trách | RTM / Use Case | Story Points | Hạn Chót (Deadline) | Trạng Thái | Liên Kết Mã Nguồn / Tài Liệu |
| :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Module 1** | **[KAN-114](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-114)** | `z8qgvcdgay` | **PBI-25: Quản Trị Người Dùng & Phân Quyền BGH**: CRUD tài khoản, Khóa user, Đổi mật khẩu | `REQ-AUTH-02`<br>`UC-ADM-02` | 5 SP | 18/10/2026 | **DONE** | [UserController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/UserController.js)<br>[SystemSettingsPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/SystemSettingsPage.jsx) |
| **Module 3** | **[KAN-117](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-117)** | `z8qgvcdgb2` | **PBI-14: Xếp Thời Khóa Biểu & Chống Xung Đột Tiết**: Phân công giảng dạy, Thuật toán TKB | `REQ-SCHED-01`<br>`UC-ADM-03` | 5 SP | 25/10/2026 | **DONE** | [ScheduleController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js)<br>[ScheduleAdminPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/ScheduleAdminPage.jsx) |
| **Module 9** | **[KAN-134](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-134)** | `z8qgvcdgbk` | **PBI-24: Hóa Đơn Học Phí & Cổng VietQR BGH**: Quản lý thu học phí, Khen thưởng & Kỷ luật | `REQ-FEE-01`<br>`UC-ADM-07` | 5 SP | 22/11/2026 | **DONE** | [TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js)<br>[BGHTuitionPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHTuitionPage.jsx) |
| **Module 10** | **[KAN-137](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-137)** | `z8qgvcdgbp` | **PBI-23: Thống Kê Phổ Điểm & Xét Danh Hiệu BGH**: Báo cáo học vụ, Tiêu chuẩn TT22 | `REQ-REP-01`<br>`UC-ADM-06` | 5 SP | 15/11/2026 | **DONE** | [ReportController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js)<br>[BGHReportCenterPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHReportCenterPage.jsx) |
| **Module 10** | **[KAN-138](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-138)** | `z8qgvcdgbq` | **PBI-19: Khảo Sát Dịch Vụ & QA Acceptance**: Bộ kiểm thử tự động, Đánh giá chất lượng | `REQ-QA-01`<br>`UC-ALL-01` | 5 SP | 22/11/2026 | **DONE** | [unitTestingSuite.test.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/tests/unitTestingSuite.test.js)<br>[HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md) |
| **TỔNG** | — | — | **5 Phân Hệ Cốt Lõi BGH & Quản Trị Hệ Thống** | **Bao phủ 100% Nghiệp vụ PM/BA** | **25 SP** | **Tuần 10** | **DONE** | **Tỷ lệ đóng góp: ~20% toàn hệ thống** |

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Quản lý tiến độ Agile Kanban**: Thiết lập 27 Tasks chuẩn PBI, phân bổ 5 Sprints, nhãn phân loại, ước lượng thời gian và hạn chót trên Jira Cloud & ClickUp.
- **Đặc tả yêu cầu phần mềm IEEE 830**: Biên soạn chi tiết 43 Use Cases cho 5 nhóm tác nhân (BGH, GVCN, GVBM, Học sinh, Phụ huynh) tại [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md).
- **Chuẩn hóa khung quy chế Thông tư 22/2021/TT-BGDĐT**: Lập công thức tính ĐTBmhk chia 9, tiêu chuẩn xếp loại học lực 4 mức và quy trình khóa sổ điểm 4 bước.
- **Biên soạn bộ hồ sơ kỹ thuật chuyên sâu**:
  + [docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md)
  + [docs/CHI_TIET_CONG_NGHE_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_CONG_NGHE_HE_THONG.md)
  + [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md)
  + [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md)
  + [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md)

### 2.2 Phần Việc Đã Hoàn Thành (Tuần 7 -> Tuần 9)
- **Điều phối tích hợp Xác thực JWT & Phân quyền RBAC 5 Roles**: Kiểm duyệt middleware `rbacMiddleware.js` và `ProtectedRoute.jsx`.
- **Giám sát kiến trúc Clean Architecture & CSDL PostgreSQL 3NF**: Thẩm định Singleton Connection Pool, Flyway Migrations và Repository Pattern.
- **Thẩm định quy trình Khóa sổ điểm điện tử & Audit Trail**: Cơ chế bảo toàn điểm số học sinh chống gian lận.

### 2.3 Phần Việc Hoàn Thành Tuần 10 (Hiện Tại: 15/11/2026 — HOÀN TẤT 100%)
- **Cẩm nang Lập trình & Sửa mã nguồn (Developer Handbook)**:
  + Biên soạn thành công [docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md) (978 dòng) với quy trình 5 bước phát triển, cấu trúc thư mục, quy tắc parameterized SQL, giao dịch Unit of Work và danh mục đường link kỹ thuật chính thức.
- **Đồng bộ Deadline & Đoạn mã mẫu cho 27 Tasks trên Jira & ClickUp**:
  + Thiết lập 100% Start Date & Due Date (Deadline) từ Sprint 1 đến Sprint 5.
  + Nhúng trực tiếp Code Snippet thực thi, cURL kiểm thử, Kịch bản Demo 3 phút và Smart Commit vào nội dung mô tả của từng thẻ.
- **Phân công Assignee Chuẩn xác Đúng người Đúng vị trí**:
  + Phân chia cân đối 27 Tasks cho 5 thành viên nhóm (~20% khối lượng/người).
- **Hoàn thành 100% các Tasks cá nhân phụ trách**:
  + Chuyển trạng thái cả 5 Tasks (`KAN-114`, `KAN-117`, `KAN-134`, `KAN-137`, `KAN-138`) sang **Done** trên Jira Cloud và **complete** trên ClickUp.
  + Ghi nhận đầy đủ thời gian làm việc (Worklog: 8h-12h/task) minh chứng khối lượng đóng góp.

---

## 3. DANH MỤC CÔNG CỤ & SCRIPTS QUẢN TRỊ TRỰC TIẾP

| Tệp Script / Tài liệu | Mục đích & Đóng góp Quản trị |
| :--- | :--- |
| [members/member1_PM_BA/complete_member1_tasks.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member1_PM_BA/complete_member1_tasks.js) | Tự động nghiệm thu, ghi nhận Worklog và chuyển trạng thái Done trên Jira & ClickUp |
| [members/member1_PM_BA/enrich_clickup_and_jira.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member1_PM_BA/enrich_clickup_and_jira.js) | Đồng bộ 11 mục chi tiết, Deadline và Assignee cho toàn bộ 27 PBIs |
| [members/member1_PM_BA/restore_visible_clickup.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member1_PM_BA/restore_visible_clickup.js) | Khôi phục và đảm bảo 100% task luôn hiển thị trên giao diện ClickUp |
| [docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/BANG_CHI_TIET_27_TASKS_JIRA_CLICKUP_CODE_MAP.md) | Bản đồ chi tiết 27 tasks: ánh xạ Jira/ClickUp, file code và hàm thực thi cho Leader |
| [docs/TONG_QUAN_TOAN_BO_HE_THONG_CHO_LEADER.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/TONG_QUAN_TOAN_BO_HE_THONG_CHO_LEADER.md) | Cẩm nang tổng quan 10 modules, kiến trúc và điều hành 322 tests cho Leader |
| [README.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md) | Cổng thông tin tổng quan của toàn bộ kho lưu trữ dự án |
| [timeline.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/timeline.md) | Bảng theo dõi tiến độ tuần và quản lý trạng thái hoàn thành |
| [docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/HUONG_DAN_LAP_TRINH_VA_SUA_CODE.md) | Cẩm nang lập trình, sửa mã nguồn và danh mục tutorial chính thức |
| [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md) | Ma trận RTM kết nối nghiệp vụ với mã nguồn và kiểm thử |
| [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md) | Kịch bản nghiệm thu người dùng 43 Use Cases |
