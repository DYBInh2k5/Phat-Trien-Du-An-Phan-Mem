# TIẾN ĐỘ THỰC HIỆN DỰ ÁN - TUẦN 9 (09/11/2026 - 15/11/2026)
## CHUYÊN ĐỀ 8: KIỂM THỬ PHẦN MỀM & ĐẢM BẢO CHẤT LƯỢNG (SOFTWARE TESTING & QA), ĐỒNG BỘ TOÀN DIỆN CÔNG CỤ QUẢN TRỊ (JIRA, CLICKUP, CANVA) VÀ CẨM NANG CSDL POSTGRESQL EXTENSION

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
GIAI ĐOẠN: TUẦN 9 / 15 TUẦN NGHIÊN CỨU & PHÁT TRIỂN
THỜI ĐIỂM CẬP NHẬT: 12/11/2026 (TUẦN 9 HOÀN THÀNH XUẤT SẮC 100%)
TÀI LIỆU CHUYÊN ĐỀ CHI TIẾT: BrainStorm/Week9 Testing .md & CHUYENDE/Chuyên đề 8 Testing.docx
KHO LƯU TRỮ GITHUB: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
KHO LƯU TRỮ BITBUCKET: https://bitbucket.org/codyisme27205/pt_da_pm
JIRA KANBAN BOARD: https://reputyze-team-vx3aseym.atlassian.net/jira/software/projects/KAN/boards/2
CLICKUP WORKSPACE: https://app.clickup.com/1100320000025585/v/s/1100320000109903
CANVA PRESENTATION: https://www.canva.com/d/75iOEEpReWqgOuN
================================================================================
```

---

## 1. MỤC TIÊU & NHIỆM VỤ TRỌNG TÂM TUẦN 9

Trong Tuần 9 (09/11/2026 - 15/11/2026), nhóm 2 đã hoàn thành toàn diện 4 trụ cột kỹ thuật và quản trị đồ án cốt lõi:

1. **Chuyên đề 8 - Kiểm thử Phần mềm & Đảm bảo Chất lượng (QA/QC Testing Suite)**:
   - Nghiên cứu và triển khai chiến lược kiểm thử tự động 3 tầng (Unit Test, Integration/Security Test, UAT Scenario Test).
   - Backend Test Suite: 68/68 test cases đạt **100% PASS** (kiểm tra tính điểm Thông tư 22, chuyển đổi GPA 4.0, khóa sổ điểm 2 cấp, phân quyền RBAC 5 vai trò, xuất báo cáo Excel & PDF).
   - Frontend Vitest Suite: 13/13 test cases đạt **100% PASS** (kiểm tra render giao diện Sổ điểm, Điểm danh, Đăng nhập 1-Click Demo Login, phân quyền thanh điều hướng Sidebar).

2. **Đồng bộ Toàn diện Các Công cụ Quản lý Dự án Trực tuyến (Project Governance Sync)**:
   - **Jira Cloud Kanban Board**: Cập nhật chuẩn hóa toàn bộ các Epics (KAN-1 đến KAN-9), Stories và Tasks theo đúng tiến độ thực tế, liên kết chặt chẽ với mã nguồn và tài liệu.
   - **ClickUp Workspace**: Đồng bộ cấu trúc 10 Modules nghiệp vụ và 27 Tasks chi tiết thuộc không gian `Space Group 2_PTDAPM` và thư mục `Folder HTQLLH`.
   - **Slide Trình Chiếu Đồ Án Canva**: Cập nhật tự động thông tin 5 thành viên chính xác (Võ Duy Bình, Huỳnh Trung Tính, Võ Hoàng Sơn, Trần Quang Vinh, Nguyễn Minh Quốc Bảo), phản ánh hiện trạng tuần 8-9 (100% Pass test và sẵn sàng tích hợp) và liên kết quản trị Jira/ClickUp lên slide trực tuyến.

3. **Biên soạn Cẩm nang Hướng dẫn Kết nối & Thao tác PostgreSQL Extension trên IDE**:
   - Xuất bản tài liệu chuyên biệt [docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md) hướng dẫn toàn bộ thành viên trong nhóm cách kết nối IDE với CSDL Docker PostgreSQL (cổng 5434).
   - Hướng dẫn chi tiết các tính năng nâng cao: chỉnh sửa trực tiếp trên bảng (Inline Grid Edit), tự động gợi ý mã SQL (Autocomplete), xuất dữ liệu Excel/CSV/JSON, trích xuất mã DDL và tối ưu hóa truy vấn qua `EXPLAIN ANALYZE`.
   - Cung cấp Top 10 câu lệnh SQL mẫu phục vụ kiểm tra dữ liệu thực tế của 8 bảng CSDL 3NF.

4. **Duy trì Cơ chế Đồng bộ Song song 2 Remote (Dual-Remote Git)**:
   - Cam kết mọi commit tài liệu và mã nguồn đều được cập nhật song song lên cả hai kho lưu trữ chính thức: GitHub và Bitbucket thông qua một lệnh `git push origin main`.

---

## 2. BẢNG PHÂN CÔNG & ĐÁNH GIÁ ĐÓNG GÓP 5 THÀNH VIÊN TUẦN 9

| STT | Mã Thẻ Jira | Họ và Tên | Vai Trò Đảm Nhiệm | Nhiệm Vụ Phân Công Cụ Thể Tuần 9 | Trạng Thái Đóng Góp |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | [KAN-33](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-33) | **Võ Duy Bình** | **Project Manager & Lead BA** | Điều phối toàn diện tiến độ tuần 9, đồng bộ Slide Canva trực tuyến, liên kết Jira Kanban & ClickUp Workspace, biên soạn tài liệu cẩm nang CSDL và rà soát yêu cầu nghiệp vụ. | 100% Hoàn thành (Xuất sắc) |
| 2 | [KAN-34](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-34) | **Võ Hoàng Sơn** | **Dev Frontend** | Chạy bộ kiểm thử Frontend Vitest (13/13 test cases PASS), kiểm tra độ tương thích giao diện Responsive trên màn hình Desktop và Mobile, tối ưu hóa hiển thị bảng điểm. | 100% Hoàn thành (Xuất sắc) |
| 3 | [KAN-35](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-35) | **Huỳnh Trung Tính** | **Dev Backend & DBA** | Chuẩn hóa tài liệu kết nối PostgreSQL Extension, rà soát hiệu năng các câu truy vấn SQL 3NF, kiểm thử tính toàn vẹn của giao dịch Unit of Work khi cập nhật điểm đồng loạt. | 100% Hoàn thành (Xuất sắc) |
| 4 | [KAN-36](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-36) | **Trần Quang Vinh** | **Logic Security** | Kiểm tra bảo mật ma trận phân quyền 5 vai trò (RBAC), kiểm thử cơ chế xác thực JWT và ngăn chặn truy cập trái phép vào các endpoint quản trị BGH/GVCN. | 100% Hoàn thành (Xuất sắc) |
| 5 | [KAN-37](https://reputyze-team-vx3aseym.atlassian.net/browse/KAN-37) | **Nguyễn Minh Quốc Bảo** | **Tester (QA Lead)** | Chủ trì Chuyên đề 8 Testing, thực thi bộ test tự động backend `unitTestingSuite.test.js` (68/68 PASS), lập báo cáo ma trận truy xuất nguồn gốc yêu cầu (RTM) và kế hoạch UAT. | 100% Hoàn thành (Xuất sắc) |

---

## 3. DANH MỤC TÀI LIỆU HOÀN THIỆN ĐỒNG BỘ TRONG TUẦN 9

1. **Cẩm nang PostgreSQL Extension trên IDE**:
   - Đường dẫn: [docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md)
   - Tích hợp vào: [README.md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/README.md) (Mục 5.5) và [members/member3_Backend_DB/README.md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/members/member3_Backend_DB/README.md).
2. **Ma trận Truy xuất Yêu cầu Phần mềm (RTM PDF)**:
   - Đường dẫn: `docs/Requirements_Traceability_Matrix.pdf`
3. **Slide Báo cáo Đồ án Canva Trực tuyến**:
   - Đường dẫn: [https://www.canva.com/d/75iOEEpReWqgOuN](https://www.canva.com/d/75iOEEpReWqgOuN) (16 slides được chuẩn hóa thông tin 5 thành viên và tiến độ thực tế).
4. **Báo cáo Chuyên đề 8 - Kiểm thử Phần mềm**:
   - Đường dẫn: [BrainStorm/Week9 Testing .md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/BrainStorm/Week9%20Testing%20.md) và [CHUYENDE/Chuyên đề 8 Testing.docx](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%208%20Testing.docx).
5. **Lộ trình Dự án Tổng thể**:
   - Đường dẫn: [timeline.md](file:///d:/HSU/2631Semester%201(2026-2027)/PT_DA_PM/timeline.md).
