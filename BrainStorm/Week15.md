# BrainStorm Tuần 15: Tổng Kết Toàn Diện Dự Án, Kịch Bản Thuyết Trình Đồ Án & Đánh Giá KPI 5 Thành Viên

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. TỔNG KẾT TOÀN DIỆN KẾT QUẢ ĐẠT ĐƯỢC (15 TUẦN)

Trải qua 15 tuần làm việc theo quy trình phát triển phần mềm chuẩn mực, nhóm 5 thành viên đã hoàn thành 100% mục tiêu đồ án môn học "Phát triển dự án phần mềm":

1. **Bộ Hồ sơ Báo cáo Chuyên đề Chuyên sâu (8 Chuyên đề `.docx`)**:
   - Chuyên đề 1: Nghiên cứu công nghệ thiết kế giao diện UI/UX Web Application.
   - Chuyên đề 2: Khảo sát và phân tích cơ sở dữ liệu quan hệ và NoSQL (PostgreSQL, MySQL, MongoDB).
   - Chuyên đề 3: Khảo sát và phân tích các kiến trúc phần mềm (Clean Architecture, N-Tier, Microservices).
   - Chuyên đề 4: Khảo sát các mẫu thiết kế hướng đối tượng (MVC, MVVM, Repository, Unit of Work, DIP & DI).
   - Chuyên đề 5: Nghiên cứu và phát triển phân hệ xuất báo cáo & định dạng dữ liệu (Excel, PDF, CSV).
   - Chuyên đề 6: Nghiên cứu hệ thống xác thực, phân quyền và bảo mật Web (JWT, CORS, CSRF, RBAC).
   - Chuyên đề 7: Nghiên cứu và xây dựng hệ thống nhật ký kiểm toán tập trung (Centralized Audit Logging).
   - Chuyên đề 8: Nghiên cứu và triển khai chiến lược kiểm thử phần mềm & QA (Unit, Integration, Security, UAT).

2. **Hồ sơ Phân tích & Kiến trúc Hoàn chỉnh**:
   - Tài liệu đặc tả 43 Use Cases (`USE_CASES.md`) kèm sơ đồ phân rã Mermaid và Sequence Diagrams.
   - Sơ đồ thực thể quan hệ cơ sở dữ liệu (`database/ERD.md`) và tập lệnh DDL PostgreSQL (`database/schema.sql`).
   - Ma trận truy xuất yêu cầu RTM (`docs/Requirements_Traceability_Matrix.md`) và Kế hoạch UAT (`docs/UAT_Testing_Plan.md`).
   - Hướng dẫn triển khai nhanh (`docs/DEPLOYMENT_GUIDE.md`) và Đặc tả REST API (`docs/API_SPECIFICATION.md`).

3. **Sản phẩm Mã nguồn Hoạt động 100% (Working Software)**:
   - Frontend React SPA hiện đại, responsive, hỗ trợ 5 vai trò người dùng.
   - Backend Node.js Express 4-Layer Clean Architecture, kết nối PostgreSQL, hỗ trợ Docker Compose.
   - Bộ Test Suite tự động đạt tỷ lệ vượt qua tuyệt đối (Pass Rate 100%).

---

## CHƯƠNG II. BẢNG ĐÁNH GIÁ ĐÓNG GÓP & KPI 5 THÀNH VIÊN NHÓM

| STT | Họ và tên | Vai trò trong Dự án | Trọng số Đóng góp | Tỷ lệ Hoàn thành | Đánh giá Đóng góp |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Võ Duy Bình** | Trưởng nhóm / Project Manager & Lead BA | 20% | **100%** | Điều phối toàn diện dự án, phân bổ Sprint trên Jira Kanban; lập tài liệu đặc tả SRS IEEE 830, Use Cases, RTM; chuẩn hóa quy chế Thông tư 22 và quản lý tiến độ 15 tuần. |
| 2 | **Võ Hoàng Sơn** | Dev Frontend (Frontend Developer) | 20% | **100%** | Thiết kế UI/UX Wireframes 8 màn hình; lập trình ứng dụng Web SPA Responsive trên React 18, Vite, TailwindCSS; xây dựng 5 cổng portal cho 5 nhóm vai trò người dùng. |
| 3 | **Huỳnh Trung Tính** | Dev Backend (Backend Developer) | 20% | **100%** | Thiết kế kiến trúc Clean Architecture 4 tầng trên Node.js/Express; thiết kế và chuẩn hóa CSDL quan hệ PostgreSQL đạt dạng chuẩn 3NF; xây dựng REST API và các dịch vụ đào tạo. |
| 4 | **Trần Quang Vinh** | Logic Security (Core Logic & Security Specialist) | 20% | **100%** | Xây dựng thuật toán tính ĐTBmhk chia 9 và xếp loại Thông tư 22; triển khai xác thực JWT, Middleware RBAC 5 Roles; cài đặt Unit of Work bảo toàn ACID và Audit Trail. |
| 5 | **Nguyễn Minh Quốc Bảo** | Tester (QA/QC Testing Lead) | 20% | **100%** | Xây dựng kịch bản kiểm thử UAT Plan toàn diện cho 5 nhóm tác nhân; phát triển bộ kiểm thử tự động QA Unit Testing Suite; thẩm định chất lượng giao phẩm và kiểm thử tải hệ thống. |
| - | **TỔNG CỘNG** | **Toàn thể Nhóm Dự án** | **100%** | **100%** | **HOÀN THÀNH XUẤT SẮC ĐỒ ÁN** |

---

## CHƯƠNG III. KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN (PRESENTATION OUTLINE)

1. **Phần 1: Giới thiệu Đề tài & Bối cảnh (3 phút - Võ Duy Bình)**:
   - Sự cần thiết của việc số hóa quản lý trường học.
   - Phạm vi 5 vai trò người dùng (BGH, GVCN, GVBM, Học sinh, Phụ huynh) và 43 Use Cases.
2. **Phần 2: Kiến trúc Hệ thống & Cơ sở Dữ liệu (4 phút - Huỳnh Trung Tính & Võ Hoàng Sơn)**:
   - Trình bày kiến trúc Clean Architecture 4 tầng và mô hình kết nối PostgreSQL.
   - Thiết kế giao diện trực quan 5 Portals trên React SPA và Wireframes.
3. **Phần 3: Thuật toán Nghiệp vụ, Bảo mật & Kiểm thử (4 phút - Trần Quang Vinh & Nguyễn Minh Quốc Bảo)**:
   - Thuật toán tính điểm có trọng số ĐTBmhk chia 9, xếp loại Thông tư 22, bảo toàn giao dịch ACID.
   - Cơ chế xác thực không trạng thái JWT, phân quyền RBAC 5 Roles và bộ kiểm thử tự động QA Suite.
4. **Phần 4: Demo Trực tiếp Sản phẩm (5 phút - Cả nhóm)**:
   - Đăng nhập và demo luồng nghiệp vụ 5 vai trò trên React Frontend.
   - Demo xuất sổ điểm Excel và phiếu báo điểm PDF.
   - Demo lưu vết sửa điểm trong nhật ký kiểm toán (Audit Log).
5. **Phần 5: Kiểm thử QA & Kết luận (4 phút - Huỳnh Trung Tính & Võ Duy Bình)**:
   - Báo cáo kết quả kiểm thử tự động Unit Test (Pass 100%) và nghiệm thu UAT.
   - Bài học kinh nghiệm và định hướng phát triển tương lai.
