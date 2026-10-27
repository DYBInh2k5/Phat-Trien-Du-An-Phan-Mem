# THÔNG TIN THÀNH VIÊN 1: PROJECT MANAGER & LEAD BUSINESS ANALYST (PM / BA)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
THÀNH VIÊN: VÕ DUY BÌNH (TRƯỞNG NHÓM / PM & LEAD BA)
MÃ SỐ SINH VIÊN / GITHUB: DYBInh2k5
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
VỊ TRÍ TÀI LIỆU: members/member1_PM_BA/README.md
NGÀY CẬP NHẬT: 27/10/2026
================================================================================
```

---

## 1. VỊ TRÍ & VAI TRÒ CHÍNH TRONG HỆ THỐNG

- **Chức danh đảm nhiệm**: Trưởng nhóm dự án (Project Manager - PM) & Trưởng nhóm Phân tích Nghiệp vụ (Lead Business Analyst - BA).
- **Vị trí trong quy trình phát triển**:
  - Chịu trách nhiệm cao nhất về tiến độ, chất lượng giao phẩm và tính đúng đắn của toàn bộ hệ thống HTQLLH.
  - Cầu nối nghiệp vụ giữa Quy chế giáo dục THPT của Bộ Giáo dục & Đào tạo (Thông tư 22/2021/TT-BGDĐT) với đội ngũ kỹ thuật Frontend, Backend, Database và QA.

---

## 2. NHIỆM VỤ ĐÃ HOÀN THÀNH TRÊN HỆ THỐNG

### 2.1 Quản Trị Dự Án & Điều Phối Tiến Độ (Project Management)
- Thiết lập và quản lý lộ trình 15 tuần của dự án tại [timeline.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/timeline.md), bảo đảm 100% các cột mốc hoàn thành đúng hạn.
- Phân công nhiệm vụ, định biên khối lượng công việc đồng đều cho 5 thành viên (mỗi thành viên đóng góp 20% KPI).
- Thiết lập quy định chuẩn mực mã nguồn và chú thích tiếng Việt bắt buộc tại [AGENTS.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/AGENTS.md).
- Quản lý tổng thể kho lưu trữ GitHub `DYBInh2k5/Phat-Trien-Du-An-Phan-Mem` và tệp chỉ dẫn chính [README.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md).

### 2.2 Đặc Tả Yêu Cầu Phần Mềm (Software Requirements Specification - SRS)
- Thu thập, chuẩn hóa và biên soạn tài liệu đặc tả 43 Use Cases cho 5 nhóm tác nhân (Actors) tại [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md).
- Thiết kế 5 sơ đồ Mermaid phân rã chức năng và 4 Sequence Diagrams cho các luồng nghiệp vụ cốt lõi.
- Xây dựng tài liệu phân tích hệ thống chi tiết tại [docs/project2_specs.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/project2_specs.md).
- Lập Ma trận Truy xuất Yêu cầu (Requirements Traceability Matrix - RTM) tại [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md).

### 2.3 Chuẩn Hóa Khung Nghiệp Vụ Học Vụ & Pháp Lý Giáo Dục
- Biên soạn tài liệu nghiệp vụ chi tiết [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) đặc tả:
  + Công thức tính điểm trung bình môn học kỳ (ĐTBmhk) theo Thông tư 22/2021/TT-BGDĐT.
  + Tiêu chuẩn xếp loại học lực 4 mức (Tốt, Khá, Đạt, Chưa đạt).
  + Quy trình khóa sổ điểm 4 bước (`DRAFT` -> `SUBMITTED` -> `APPROVED` -> `LOCKED`).
  + Nghiệp vụ chuyên cần học đường và ngưỡng cảnh báo vắng quá 20% số tiết quy định.

### 2.4 Đồng Thiết Kế Trải Nghiệm Người Dùng (UI/UX)
- Cùng Member 2 xây dựng kiến trúc phân luồng 5 Dashboards tương ứng với 5 vai trò (BGH, GVCN, GVBM, Học sinh, Phụ huynh).
- Xây dựng trang mô phỏng tương tác 3 bước trực quan của Repository Pattern tại [docs/pattern_demo.html](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/pattern_demo.html).

### 2.5 Kiểm Thử Nghiệm Thu Người Dùng (User Acceptance Testing - UAT)
- Xây dựng kế hoạch và kịch bản nghiệm thu tại [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md) bao quát 43 Use Cases đạt kết quả Pass 100%.

---

## 3. DANH MỤC TÀI LIỆU & TỆP MÃ NGUỒN PHỤ TRÁCH CHÍNH

| Tệp / Thư mục | Vai Trò & Đóng Góp Kỹ Thuật |
| :--- | :--- |
| [README.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/README.md) | Cổng thông tin tổng quan của toàn bộ kho lưu trữ dự án |
| [timeline.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/timeline.md) | Bảng theo dõi tiến độ tuần và quản lý trạng thái hoàn thành |
| [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md) | Đặc tả 43 Use Cases, sơ đồ phân rã và tuần tự cho 5 vai trò |
| [docs/CHI_TIET_NGHIEP_VU_HE_THONG.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/CHI_TIET_NGHIEP_VU_HE_THONG.md) | Cẩm nang nghiệp vụ học vụ toàn diện theo Thông tư 22 |
| [docs/Requirements_Traceability_Matrix.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/Requirements_Traceability_Matrix.md) | Ma trận RTM kết nối nghiệp vụ với mã nguồn và kiểm thử |
| [docs/UAT_Testing_Plan.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/UAT_Testing_Plan.md) | Kịch bản nghiệm thu người dùng 4 đối tượng |
| [docs/pattern_demo.html](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docs/pattern_demo.html) | Ứng dụng web mô phỏng trực quan tương tác 3 bước của Repository Pattern |
