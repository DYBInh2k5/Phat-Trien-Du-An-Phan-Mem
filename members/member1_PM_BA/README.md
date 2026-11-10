# THÔNG TIN THÀNH VIÊN 1: PROJECT MANAGER & LEAD BUSINESS ANALYST (PM / BA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: VÕ DUY BÌNH (TRƯỞNG NHÓM / PM & LEAD BA)
TÀI KHOẢN JIRA CLOUD: Duy Bình (bron@reputyze.asia)
MÃ SỐ SINH VIÊN / GITHUB: DYBInh2k5
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member1_PM_BA/README.md
NGÀY CẬP NHẬT: 27/10/2026 (TUẦN 7 / 15 TUẦN HỌC KỲ 2631)
================================================================================
```

---

## 1. BẢNG PHÂN CÔNG MODULE VÀ NHIỆM VỤ CỤ THỂ TRÊN JIRA CLOUD

> **Ghi chú chuẩn hóa theo góp ý của Giảng viên hướng dẫn**:  
> Thẻ Jira chỉ quản lý các **Module lớn (Epics)** và **Module con (Tasks/Stories)** cấu thành phần mềm, không đưa các thẻ chuyên đề, báo cáo tuần hay hồ sơ cá nhân lên bảng Kanban.

| Mã Module Lớn | Mã Thẻ Jira | Tên Module Nhỏ / Nhiệm Vụ Phụ Trách | Use Case | Story Points | Trạng Thái | Liên Kết Mã Nguồn / Tài Liệu |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **EPIC-02** | **KAN-05** | **Quản Lý Danh Mục Khối & Lớp Học**: Ràng buộc sĩ số $\le 45$ HS, niên khóa | `UC-ADM-03` | 3 SP | **DONE** | [ClassController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ClassController.js) |
| **EPIC-02** | **KAN-07** | **Phân Công Giảng Dạy & Đào Tạo**: Phân công GVCN, GVBM theo môn học và lớp | `UC-ADM-05` | 3 SP | **DONE** | [CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) |
| **EPIC-03** | **KAN-08** | **Ma Trận Thời Khóa Biểu Tuần**: Phân bổ tiết học Thứ 2 - Thứ 7 (Tiết 1-5 sáng/chiều) | `UC-GVCN-02`<br>`UC-GVBM-02` | 3 SP | **DONE** | [TimetablePage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/timetable/TimetablePage.jsx) |
| **EPIC-03** | **KAN-09** | **Thuật Toán Chống Xung Đột Lịch Dạy**: Kiểm tra trùng tiết giáo viên và phòng học | Nghiệp vụ TKB | 2 SP | **DONE** | [ScheduleController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ScheduleController.js) |
| **EPIC-03** | **KAN-10** | **Quản Lý Lịch Thi Học Kỳ**: Lập kế hoạch phòng thi, giám thị và môn thi HK1/HK2 | `UC-ADM-04` | 2 SP | **DONE** | [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) |
| **EPIC-08** | **KAN-25** | **Sổ Liên Lạc Điện Tử & Kênh Phụ Huynh**: Quy trình tra cứu điểm, chuyên cần cho PH | `UC-PAR-01` | 3 SP | **DONE** | [ParentPortalPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/communication/ParentPortalPage.jsx) |
| **EPIC-09** | **KAN-28** | **Quản Lý Danh Mục Học Phí & VietQR**: Phân loại khoản thu, sinh mã QR VietQR NAPAS 247 | `UC-ADM-07`<br>`UC-PAR-04` | 3 SP | **DONE** | [TuitionController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js) |
| **EPIC-09** | **KAN-29** | **Chuẩn Hóa Biên Lai Thu Tiền Điện Tử**: Sinh mã giao dịch, biên lai PDF trường HSU | `UC-PAR-04` | 2 SP | **DONE** | [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member5_Modules_QA/exportEngine.js) |
| **EPIC-10** | **KAN-32** | **Thống Kê Phổ Điểm & Xét Khen Thưởng**: Tiêu chí danh hiệu HS Xuất sắc, Giỏi Thông tư 22 | `UC-ADM-06` | 4 SP | **DONE** | [ReportController.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/ReportController.js) |
| **TỔNG** | — | **5 Module Lớn (Module 2, 3, 8, 9, 10)** | **Bao phủ nghiệp vụ** | **22 SP** | **DONE** | **Tỷ lệ đóng góp: ~20% toàn hệ thống** |

### Tài Liệu Phân Tích & Quản Trị Hệ Thống Đồng Thời Phụ Trách:
- **Đặc tả yêu cầu phần mềm IEEE 830 & 43 Use Cases**: [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md)
- **Ma trận truy xuất yêu cầu RTM Matrix (10 chiều, RACI)**: [Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md)
- **Chuẩn hóa khung pháp lý Thông tư 22/2021/TT-BGDĐT**: [CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md)
- **Sơ đồ Use Case tổng thể & 5 sơ đồ phân rã vai trò**: [UML_DIAGRAMS.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UML_DIAGRAMS.md)

---

## 2. TIẾN ĐỘ & PHÂN ĐỊNH CHI TIẾT THEO CỘT MỐC THỜI GIAN

### 2.1 Phần Việc Đã Hoàn Thành (Tuần 1 -> Tuần 6)
- **Quản lý tiến độ Agile Kanban**: Thiết lập 91+ thẻ, 11 Epics, 9 Components và 6 Fix Versions trên Jira Cloud, đồng bộ 100% với repository GitHub.
- **Đặc tả yêu cầu phần mềm IEEE 830**: Biên soạn chi tiết 43 Use Cases cho 5 nhóm tác nhân (BGH, GVCN, GVBM, Học sinh, Phụ huynh) tại [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md).
- **Chuẩn hóa khung quy chế Thông tư 22**: Lập công thức tính ĐTBmhk chia 9, tiêu chuẩn xếp loại học lực 4 mức và quy trình khóa sổ điểm 4 bước.
- **Biên soạn bộ hồ sơ kỹ thuật chuyên sâu**:
  + [docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/GIAI_THICH_TOAN_DIEN_API_LAYOUT_DOCKER.md) (91KB).
  + [docs/CHI_TIET_CONG_NGHE_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_CONG_NGHE_HE_THONG.md) (61KB).
  + [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) (16KB).
  + [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md).
  + [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md).

### 2.2 Phần Việc Đang Thực Hiện (Tuần 7 - Thời Điểm Hiện Tại: 27/10/2026)
- **Điều phối tích hợp hệ thống Xác thực JWT & Phân quyền RBAC 5 Roles** (Thẻ Jira [KAN-71](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-71)).
- Kiểm duyệt luồng điều hướng bảo vệ tuyến đường `ProtectedRoute.jsx` trên Frontend và middleware `rbacMiddleware.js` trên Backend.
- Hoàn thiện báo cáo tiến độ tuần 7 tại [BrainStorm/Week7.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week7.md).

### 2.3 Phần Việc Sắp Thực Hiện (Tuần 8 -> Tuần 15)
- **Tuần 8 (02/11 - 08/11/2026)**: Giám sát tích hợp Centralized Audit Logging (`AuditLogger.js`, thẻ `KAN-27`).
- **Tuần 9 (09/11 - 15/11/2026)**: Thẩm định bộ kiểm thử tự động QA Unit Testing Suite (`KAN-32`).
- **Tuần 10 - 12**: Điều phối tối ưu hóa hiệu năng CSDL, đóng gói container Docker Compose và thiết lập CI/CD GitHub Actions.
- **Tuần 13 - 14**: Tổ chức nghiệm thu kỹ thuật UAT 43 Use Cases và hoàn thiện Cẩm nang Hướng dẫn Sử dụng.
- **Tuần 15**: Chủ trì tổng kết dự án, hoàn thiện kịch bản thuyết trình bảo vệ đồ án [docs/KICH_BAN_DEMO.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/KICH_BAN_DEMO.md) (`KAN-100`) và đánh giá chỉ số KPI 5 thành viên.

---

## 3. DANH MỤC TÀI LIỆU QUẢN TRỊ TRỰC TIẾP

| Tệp / Thư mục | Vai Trò & Đóng Góp Kỹ Thuật |
| :--- | :--- |
| [README.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md) | Cổng thông tin tổng quan của toàn bộ kho lưu trữ dự án |
| [timeline.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/timeline.md) | Bảng theo dõi tiến độ tuần và quản lý trạng thái hoàn thành |
| [docs/JIRA_KANBAN_MAPPING.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/JIRA_KANBAN_MAPPING.md) | Cẩm nang ánh xạ toàn diện 91+ thẻ Jira, 9 Components, 6 Releases và Issue Links |
| [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md) | Đặc tả 43 Use Cases, sơ đồ phân rã và tuần tự cho 5 vai trò |
| [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) | Cẩm nang nghiệp vụ học vụ toàn diện theo Thông tư 22 |
| [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md) | Ma trận RTM kết nối nghiệp vụ với mã nguồn và kiểm thử |
| [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md) | Kịch bản nghiệm thu người dùng 4 đối tượng |
| [docs/KICH_BAN_DEMO.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/KICH_BAN_DEMO.md) | Kịch bản thuyết trình bảo vệ đồ án và kiểm chứng live demo |
