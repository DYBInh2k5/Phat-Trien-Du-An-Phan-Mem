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
| 1 | **Võ Duy Bình** | Trưởng nhóm / Project Manager & Lead BA | 20% | **100%** | Điều phối toàn diện dự án; lập tài liệu SRS, Use Cases, RTM; chủ trì biên soạn các báo cáo chuyên đề và quản lý kho lưu trữ GitHub. |
| 2 | **Nguyễn Minh Quốc Bảo** | Frontend Developer & System Architect | 20% | **100%** | Nghiên cứu công nghệ lưu trữ PostgreSQL; thiết kế giao diện UI Portal; lập trình các màn hình Dashboard BGH và Giáo viên. |
| 3 | **Trần Quang Vinh** | Backend Architect & Database Developer | 20% | **100%** | Thiết kế kiến trúc Clean Architecture, kết nối CSDL PostgreSQL; xây dựng REST API Controllers và Unit of Work. |
| 4 | **Võ Hoàng Sơn** | Security Specialist & Logic Developer | 20% | **100%** | Nghiên cứu nguyên lý DIP & DI; lập trình thuật toán tính điểm TBM/GPA; triển khai middleware xác thực JWT và phân quyền RBAC. |
| 5 | **Huỳnh Trung Tính** | Modules Specialist & QA Lead | 20% | **100%** | Triển khai Export Engine (Excel SheetJS, PDF jsPDF); xây dựng bộ kiểm thử tự động `unitTestingSuite.test.js`; cấu hình Docker và CI/CD. |
| - | **TỔNG CỘNG** | **Toàn thể Nhóm Dự án** | **100%** | **100%** | **HOÀN THÀNH XUẤT SẮC ĐỒ ÁN** |

---

## CHƯƠNG III. KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN (PRESENTATION OUTLINE)

1. **Phần 1: Giới thiệu Đề tài & Bối cảnh (3 phút - Võ Duy Bình)**:
   - Sự cần thiết của việc số hóa quản lý trường học.
   - Phạm vi 5 vai trò người dùng (BGH, GVCN, GVBM, Học sinh, Phụ huynh) và 43 Use Cases.
2. **Phần 2: Kiến trúc Hệ thống & Cơ sở Dữ liệu (4 phút - Trần Quang Vinh & Nguyễn Minh Quốc Bảo)**:
   - Trình bày kiến trúc Clean Architecture và mô hình Docker Compose.
   - Sơ đồ cơ sở dữ liệu quan hệ PostgreSQL ERD và tối ưu hóa hiệu năng.
3. **Phần 3: Thuật toán Nghiệp vụ & Bảo mật (4 phút - Võ Hoàng Sơn)**:
   - Thuật toán tính điểm có trọng số, xếp loại học lực theo quy chế.
   - Cơ chế xác thực không trạng thái JWT và phòng ngự tấn công CSRF/CORS.
4. **Phần 4: Demo Trực tiếp Sản phẩm (5 phút - Cả nhóm)**:
   - Đăng nhập và demo luồng nghiệp vụ 5 vai trò trên React Frontend.
   - Demo xuất sổ điểm Excel và phiếu báo điểm PDF.
   - Demo lưu vết sửa điểm trong nhật ký kiểm toán (Audit Log).
5. **Phần 5: Kiểm thử QA & Kết luận (4 phút - Huỳnh Trung Tính & Võ Duy Bình)**:
   - Báo cáo kết quả kiểm thử tự động Unit Test (Pass 100%) và nghiệm thu UAT.
   - Bài học kinh nghiệm và định hướng phát triển tương lai.
