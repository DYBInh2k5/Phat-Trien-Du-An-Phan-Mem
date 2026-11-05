# KỊCH BẢN THUYẾT TRÌNH BÁO CÁO ĐỒ ÁN & DEMO HỆ THỐNG QUẢN LÝ HỌC VỤ (HTQLLH)
## GIAI ĐOẠN BÁO CÁO: TỪ PHÂN TÍCH SRS ĐẾN KIẾN TRÚC & MẪU THIẾT KẾ (DESIGN PATTERNS)
*(Bao gồm: SRS -> Chuyên đề 1: UI/UX -> Chuyên đề 2: CSDL & Lưu Trữ -> Chuyên đề 3: Kiến Trúc -> Chuyên đề 4: Mẫu Thiết Kế Patterns -> Live Demo Prototype)*

- **Tên đề tài**: Hệ thống Quản lý Lớp học & Học vụ (HTQLLH / School Management System - SMS)
- **Môn học**: Phát triển Dự án Phần mềm (SW320DV01 - 3 Tín chỉ) - Đại học Hoa Sen (HSU)
- **Chủ nhiệm Đề tài & Lead BA**: Võ Duy Bình
- **Nhóm sinh viên thực hiện**: Võ Duy Bình (Member 1 - PM & BA), Võ Hoàng Sơn (Member 2 - Dev Frontend), Huỳnh Trung Tính (Member 3 - Dev Backend), Trần Quang Vinh (Member 4 - Logic Security), Nguyễn Minh Quốc Bảo (Member 5 - Tester)
- **Phạm vi học phần trên lớp**: Báo cáo các giai đoạn nền tảng theo tiến độ môn học (SRS -> UI/UX -> Database -> Kiến trúc phần mềm -> Design Patterns).
- **Điểm đột phá của nhóm**: Chủ động hoàn thiện vượt trước tiến độ lý thuyết của lớp, hiện thực hóa toàn bộ hồ sơ phân tích thành một phiên bản chạy thực tế (**Working Prototype**) kết nối trực tiếp CSDL PostgreSQL thật, áp dụng đầy đủ Clean Architecture và Design Patterns.
- **Thời lượng dự kiến**: 15 – 20 phút (Thuyết trình lý thuyết & hồ sơ kỹ thuật: 10 phút; Live Demo hệ thống thực tế: 7 phút; Hỏi đáp Q&A: 3 phút).

---

## MỤC LỤC KỊCH BẢN

1. [Phần 1: Giới thiệu Tổng quan Đề tài & Bối cảnh Nghiệp vụ](#phan-1-gioi-thieu-tong-quan-de-tai--boi-canh-nghiep-vu)
2. [Phần 2: Báo cáo Hồ sơ Tài liệu SRS (Phân Tích Yêu Cầu Phần Mềm)](#phan-2-bao-cao-ho-so-tai-lieu-srs-phan-tich-yeu-cau-phan-mem)
3. [Phần 3: Báo cáo Chuyên đề 1 - Nghiên Cứu & Thiết Kế UI/UX](#phan-3-bao-cao-chuyen-de-1---nghien-cuu--thiet-ke-uiux)
4. [Phần 4: Báo cáo Chuyên đề 2 - Nghiên Cứu Cơ Sở Dữ Liệu & Lưu Trữ (PostgreSQL)](#phan-4-bao-cao-chuyen-de-2---nghien-cuu-co-so-du-lieu--luu-tru-postgresql)
5. [Phần 5: Báo cáo Chuyên đề 3 - Nghiên Cứu Kiến Trúc Phần Mềm (Clean Architecture)](#phan-5-bao-cao-chuyen-de-3---nghien-cuu-kien-truc-phan-mem-clean-architecture)
6. [Phần 6: Báo cáo Chuyên đề 4 - Nghiên Cứu Mẫu Thiết Kế (Design Patterns & SOLID)](#phan-6-bao-cao-chuyen-de-4---nghien-cuu-mau-thiet-ke-design-patterns--solid)
7. [Phần 7: Điểm Đột Phá - Hiện Thực Hóa Working Prototype Vượt Tiến Độ Lớp](#phan-7-diem-dot-pha---hien-thuc-hoa-working-prototype-vuot-tien-do-lop)
8. [Phần 8: Kịch bản Thao tác Live Demo Trực Quan (Từng Bước Kèm Hình Ảnh Minh Họa)](#phan-8-kich-ban-thao-tac-live-demo-truc-quan-tung-buoc-kem-hinh-anh-minh-hoa)
9. [Phần 9: Tổng kết & Định hướng Các Chuyên Đề Kế Tiếp](#phan-9-tong-ket--dinh-huong-cac-chuyen-de-ke-tiep)
10. [Phụ lục: Ngân hàng Câu hỏi & Câu trả lời Phản biện (Q&A) Bảo vệ Học phần](#phu-luc-ngan-hang-cau-hoi--cau-tra-loi-phan-bien-qa-bao-ve-hoc-phan)

---

## PHẦN 1: GIỚI THIỆU TỔNG QUAN ĐỀ TÀI & BỐI CẢNH NGHIỆP VỤ
**Thời lượng**: 1.5 phút  
**Tài liệu tham khảo**: [README.md](file:///d:/HSU/2631Semester%201%282026-2027%29/README.md) | [timeline.md](file:///d:/HSU/2631Semester%201%282026-2027%29/timeline.md)

### Lời thoại thuyết trình (Speaker Notes):
> "Kính thưa Thầy/Cô và các bạn,  
> Hôm nay nhóm chúng em xin đại diện báo cáo kết quả thực hiện đồ án môn **Phát triển Dự án Phần mềm** với đề tài: **Hệ thống Quản lý Lớp học & Học vụ (HTQLLH / School Management System)**.  
> 
> Trong xu thế chuyển đổi số giáo dục, việc quản lý hồ sơ học sinh, sổ điểm điện tử, chuyên cần và liên lạc gia đình - nhà trường tại nhiều cơ sở vẫn còn gặp tình trạng dữ liệu rời rạc, giao diện khó dùng và thiếu tính toàn vẹn khi nhiều giáo viên cùng thao tác.  
> 
> Đề tài của nhóm em hướng tới mục tiêu xây dựng một nền tảng học vụ chuẩn mực, tối ưu hóa quy trình nghiệp vụ cho 5 nhóm đối tượng: Ban Giám Hiệu, Giáo viên Chủ nhiệm, Giáo viên Bộ môn, Học sinh và Phụ huynh.  
> 
> Bám sát chương trình đào tạo trên lớp, báo cáo hôm nay của nhóm sẽ trình bày toàn diện 5 trụ cột kỹ thuật nền tảng:
> 1. Tài liệu Phân tích Yêu cầu Phần mềm (SRS - 43 Use Cases).
> 2. Chuyên đề 1: Thiết kế Giao diện Trải nghiệm Người dùng (UI/UX - Web SPA).
> 3. Chuyên đề 2: Cơ sở Dữ liệu & Lưu trữ (Storage - PostgreSQL 15 chuẩn 3NF).
> 4. Chuyên đề 3: Kiến trúc Phần mềm (Clean Architecture trên Node.js).
> 5. Chuyên đề 4: Mẫu Thiết Kế Phần Mềm (Design Patterns: MVC, MVVM, Repository, Unit of Work, DIP & DI).
> 
> Đặc biệt, nhóm em xin phép chứng minh năng lực kỹ thuật khi đã chủ động đi trước tiến độ lý thuyết của lớp, hiện thực hóa toàn bộ hồ sơ thiết kế thành một phiên bản chạy thực tế (**Working Prototype**) kết nối trực tiếp CSDL PostgreSQL thật để demo trực quan trước Thầy/Cô."

---

## PHẦN 2: BÁO CÁO HỒ SƠ TÀI LIỆU SRS (PHÂN TÍCH YÊU CẦU PHẦN MỀM)
**Thời lượng**: 2 phút  
**Hồ sơ nghiệm thu**: [BrainStorm/Week1 TL SRS .md](file:///d:/HSU/2631Semester%201%282026-2027%29/BrainStorm/Week1%20TL%20SRS%20.md) | [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/USE_CASES.md)

### Nội dung chuyên môn cốt lõi:
1. **5 Tác nhân tương tác (Actors) theo mô hình RBAC**:
   - `ROLE_ADMIN` (Ban Giám Hiệu / Quản trị viên): Quản lý tài khoản, cấu hình năm học, phân công giảng dạy, giám sát toàn trường, thẩm quyền duyệt khóa và mở sổ điểm.
   - `ROLE_HOMEROOM_TEACHER` (Giáo viên Chủ nhiệm): Điểm danh chuyên cần lớp chủ nhiệm, đánh giá hạnh kiểm, theo dõi bảng điểm tổng hợp các môn, tiếp nhận và duyệt đơn xin nghỉ học từ phụ huynh.
   - `ROLE_SUBJECT_TEACHER` (Giáo viên Bộ môn): Điểm danh theo tiết dạy, nhập điểm thành phần môn phụ trách, tính điểm trung bình môn (TBM), gửi yêu cầu khóa sổ điểm.
   - `ROLE_STUDENT` (Học sinh): Tra cứu kết quả học tập cá nhân, GPA hệ 10 và hệ 4, thời khóa biểu, lịch thi, lịch sử chuyên cần.
   - `ROLE_PARENT` (Phụ huynh): Sổ liên lạc điện tử, nhận thông báo chuyên cần của con tức thời, nộp đơn xin nghỉ học trực tuyến, tra cứu học phí.
2. **Ma trận Phân quyền CRUDAL (Create, Read, Update, Delete, Approve, Lock)**:
   - Phân định ranh giới dữ liệu tuyệt đối giữa các vai trò (Ví dụ: GVBM chỉ được phép C/U điểm của lớp mình dạy; GVCN chỉ được duyệt đơn nghỉ học của lớp chủ nhiệm; BGH nắm quyền Lock/Unlock sổ điểm).
3. **Phân rã 7 Phân hệ Chức năng (FC) & 43 Use Cases**:
   - `FC-01`: Quản lý Tài khoản & Phân quyền (6 Use Cases).
   - `FC-02`: Quản lý Hồ sơ Học sinh & Lớp học (5 Use Cases).
   - `FC-03`: Quản lý Giảng dạy & Thời khóa biểu (5 Use Cases).
   - `FC-04`: Sổ điểm Điện tử & Đánh giá Học vụ theo Thông tư 22/2021/TT-BGDĐT (7 Use Cases).
   - `FC-05`: Điểm danh & Chuyên cần (5 Use Cases).
   - `FC-06`: Quản lý Học phí & Thu chi (4 Use Cases).
   - `FC-07`: Sổ liên lạc Điện tử & Báo cáo Thống kê (3 Use Cases).
4. **Căn cứ Pháp lý & Yêu cầu Phi chức năng (NFRs)**:
   - Quy chuẩn tính điểm theo Thông tư 22/2021/TT-BGDĐT.
   - NFRs: Phản hồi API dưới 500ms, toàn vẹn giao dịch ACID, bảo mật chuẩn OWASP Top 10.

### Lời thoại thuyết trình (Speaker Notes):
> "Trong giai đoạn phân tích SRS, nhóm căn cứ vào Thông tư 22 của Bộ Giáo dục & Đào tạo để thiết kế 43 Use Cases phân bổ trong 7 phân hệ chức năng. Trọng tâm của tài liệu SRS là Ma trận phân quyền CRUDAL phân định rõ ràng quyền hạn của 5 nhóm tác nhân. Điểm mấu chốt là bảo đảm tính pháp lý học đường: Giáo viên bộ môn chỉ có quyền nhập điểm cho lớp được phân công; Giáo viên chủ nhiệm quản lý chuyên cần và tiếp nhận đơn nghỉ học; còn Ban Giám Hiệu nắm giữ thẩm quyền duy nhất trong việc khóa và mở sổ điểm."

---

## PHẦN 3: BÁO CÁO CHUYÊN ĐỀ 1 - NGHIÊN CỨU & THIẾT KẾ UI/UX
**Thời lượng**: 2 phút  
**Hồ sơ nghiệm thu**: [BrainStorm/Week2 UXUI .md](file:///d:/HSU/2631Semester%201%282026-2027%29/BrainStorm/Week2%20UXUI%20.md) | [CHUYENDE/Chuyên Đề 1 UXUI.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/CHUYENDE/Chuy%C3%AAn%20%C4%90%E1%BB%81%201%20UXUI.docx)

### Nội dung chuyên môn cốt lõi:
1. **Khảo sát Nền tảng Triển khai (Desktop vs Mobile vs Web SPA)**:
   - *Desktop App (WinForms)*: Khó cài đặt, không hỗ trợ phụ huynh dùng smartphone.
   - *Mobile App thuần*: Khó nhập dữ liệu bảng điểm lớn cho giáo viên.
   - *Web Application (Single Page Application - SPA)*: **Lựa chọn tối ưu nhất**, truy cập đa nền tảng tức thì qua trình duyệt.
2. **Công nghệ Frontend**:
   - Sử dụng **React.js 18** + công cụ đóng gói hiện đại **Vite** + framework định kiểu **TailwindCSS**.
   - Cơ chế Virtual DOM giúp render bảng điểm lớn cực nhanh mà không gây đơ lag.
3. **Triết lý Thiết kế (Design System)**:
   - **Phong cách Sáng (Pure Light Theme)**: Đem lại cảm giác sư phạm, trang nhã, giảm mỏi mắt cho thầy cô khi nhập điểm.
   - **Bố cục 3 khối chuẩn hóa**: Sidebar điều hướng cố định theo vai trò, Header thông báo ngữ cảnh, Content Panel hiển thị bảng số liệu trực quan.
   - **Cổng Đăng Nhập Tích Hợp (Role Switcher)**: Hỗ trợ chuyển đổi nhanh 5 vai trò mượt mà.

### Lời thoại thuyết trình (Speaker Notes):
> "Ở Chuyên đề 1 về UI/UX, nhóm đã lựa chọn kiến trúc Web SPA trên nền tảng React.js 18 và TailwindCSS. Giao diện được thiết kế theo phong cách Pure Light Theme hiện đại, loại bỏ các chi tiết rườm rà để tập trung tối đa vào dữ liệu học sinh và điểm số. Giao diện được cá nhân hóa hoàn toàn: BGH có bảng điều khiển thống kê toàn trường, GV có bảng nhập điểm tối ưu, còn Phụ huynh có cổng sổ liên lạc điện tử thân thiện."

---

## PHẦN 4: BÁO CÁO CHUYÊN ĐỀ 2 - NGHIÊN CỨU CƠ SỞ DỮ LIỆU & LƯU TRỮ (POSTGRESQL)
**Thời lượng**: 2 phút  
**Hồ sơ nghiệm thu**: [BrainStorm/Week3 DB .md](file:///d:/HSU/2631Semester%201%282026-2027%29/BrainStorm/Week3%20DB%20.md) | [CHUYENDE/Chuyên đề 2 Storages.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%202%20Storages.docx) | [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/database/schema.sql)

### Nội dung chuyên môn cốt lõi:
1. **Lựa chọn Hệ Quản trị CSDL (PostgreSQL 15 Containerized)**:
   - Khảo sát giữa MySQL, PostgreSQL và MongoDB.
   - **Lý do chọn PostgreSQL**: Tuân thủ chuẩn giao dịch ACID khắt khe, quan hệ chặt chẽ, tối ưu cho bài toán học vụ, triển khai nhất quán qua Docker.
2. **Mô hình Thực thể Quan hệ (ERD) & 8 Bảng CSDL Cốt lõi**:
   - `users`: Tài khoản, mật khẩu băm, quyền hạn vai trò.
   - `classes`: Khối và danh sách lớp học (10A1, 10A2, 11A1...).
   - `students`: Hồ sơ lý lịch học sinh, mã số học sinh, thông tin liên lạc.
   - `teachers`: Cán bộ giáo viên, môn chuyên trách, phân công chủ nhiệm.
   - `subjects`: Danh mục môn học, số tiết quy định.
   - `grade_books`: Bảng điểm chi tiết với các cột điểm thành phần: Miệng, 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ, TBM, trạng thái khóa sổ.
   - `attendances`: Điểm danh chuyên cần theo ngày và tiết học.
   - `leave_requests`: Đơn xin phép nghỉ học trực tuyến của phụ huynh.
3. **Chuẩn hóa Dữ liệu 3NF & Ràng buộc Toàn vẹn**:
   - Đạt chuẩn 3NF triệt tiêu trùng lặp dữ liệu; khóa ngoại `ON DELETE CASCADE` bảo đảm toàn vẹn liên kết; kiểm tra miền giá trị điểm số ($0.0 \le \text{điểm} \le 10.0$).

### Lời thoại thuyết trình (Speaker Notes):
> "Đối với Chuyên đề 2 về Cơ sở Dữ liệu, nhóm lựa chọn PostgreSQL 15 đóng gói trong Docker Container. Mô hình dữ liệu gồm 8 bảng quan hệ đã được chuẩn hóa về dạng 3NF. Các mối quan hệ giữa học sinh, lớp học, sổ điểm và phân công giảng dạy được ràng buộc toàn vẹn bằng khóa chính, khóa ngoại, đồng thời có các ràng buộc kiểm tra logic trực tiếp ở tầng CSDL để ngăn chặn dữ liệu sai lệch ngay từ đầu."

---

## PHẦN 5: BÁO CÁO CHUYÊN ĐỀ 3 - NGHIÊN CỨU KIẾN TRÚC PHẦN MỀM (CLEAN ARCHITECTURE)
**Thời lượng**: 2 phút  
**Hồ sơ nghiệm thu**: [BrainStorm/Week4 KT .md](file:///d:/HSU/2631Semester%201%282026-2027%29/BrainStorm/Week4%20KT%20.md) | [CHUYENDE/Chuyên đề 3 Kiến trúc.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%203%20Ki%E1%BA%BFn%20tr%C3%BAc.docx) | [school-management-nodejs](file:///d:/HSU/2631Semester%201%282026-2027%29/members/member3_Backend_DB/school-management-nodejs)

### Nội dung chuyên môn cốt lõi:
1. **Khảo sát 5 Mô hình Kiến trúc**:
   - 3-Layer, N-Layer, Clean Architecture, Event-Driven và Microservices.
   - **Quyết định**: Chọn **Clean Architecture (Modular Monolith)**. Tách rời hoàn toàn nghiệp vụ học vụ khỏi Express.js và PostgreSQL, tránh chi phí vận hành mạng phức tạp của Microservices.
2. **Quy tắc Phụ thuộc (Dependency Rule)**:
   - Phụ thuộc chỉ được phép hướng từ ngoài vào trong:  
     `Express / PostgreSQL` $\rightarrow$ `Controllers / Repositories` $\rightarrow$ `Services (Use Cases)` $\rightarrow$ `Entities (Domain Core)`.
3. **Backend Node.js Non-blocking I/O**:
   - Tận dụng cơ chế Event Loop xử lý đồng thời hàng trăm thao tác điểm danh và nhập điểm trong các giờ cao điểm mà không bị tắc nghẽn luồng.

### Lời thoại thuyết trình (Speaker Notes):
> "Tại Chuyên đề 3 về Kiến trúc Phần mềm, nhóm áp dụng Clean Architecture trên nền tảng Backend Node.js. Thay vì viết mã SQL trực tiếp trong các Route của Express, hệ thống chia thành 4 phân tầng độc lập: Entities, Services, Repositories và Controllers. Nhờ quy tắc Dependency Rule, tầng nghiệp vụ như tính điểm hay xét duyệt học vụ không hề phụ thuộc vào CSDL, giúp mã nguồn cực kỳ dễ bảo trì và kiểm thử độc lập."

---

## PHẦN 6: BÁO CÁO CHUYÊN ĐỀ 4 - NGHIÊN CỨU MẪU THIẾT KẾ (DESIGN PATTERNS & SOLID)
**Thời lượng**: 2.5 phút  
**Hồ sơ nghiệm thu**: [BrainStorm/Week5 Pattern .md](file:///d:/HSU/2631Semester%201%282026-2027%29/BrainStorm/Week5%20Pattern%20.md) | [CHUYENDE/Chuyên đề 4 Pattern.docx](file:///d:/HSU/2631Semester%201%282026-2027%29/CHUYENDE/Chuy%C3%AAn%20%C4%91%E1%BB%81%204%20Pattern.docx)

### Nội dung chuyên môn cốt lõi (Khảo sát 6 Mẫu & Nguyên lý thiết kế):
1. **MVC (Model-View-Controller) - Tách biệt Giao diện & Nghiệp vụ**:
   - Áp dụng mô hình MVC tách đôi: Controller và Model nằm ở Backend Node.js/Express; View nằm ở Frontend React SPA; giao tiếp thông qua hợp đồng RESTful API.
   - Giữ Controller mỏng (Slim Controller), chỉ tiếp nhận HTTP request và chuyển giao cho Service.
2. **MVVM (Model-View-ViewModel) - Quản lý Trạng thái Giao diện phức tạp**:
   - Trong React SPA, các custom hook (như hook quản lý bảng điểm) đóng vai trò ViewModel: nắm giữ state cục bộ, kiểm tra hợp lệ tức thì (inline validation) và binding dữ liệu 2 chiều lên bảng nhập điểm trước khi gửi lệnh lưu về backend.
3. **Repository Pattern - Trừu tượng hóa Tầng Lưu trữ Dữ liệu**:
   - Đóng vai trò lớp trung gian giữa Business Logic và CSDL PostgreSQL.
   - Cung cấp các phương thức hướng đối tượng (`StudentRepository`, `GradeBookRepository`), giúp tầng Service thao tác với dữ liệu mà không cần biết câu lệnh SQL cụ thể.
4. **Unit of Work Pattern - Đảm bảo Tính Toàn vẹn Giao dịch (Atomic Transaction)**:
   - **Bài toán thực tế trong trường học**: Khi giáo viên lưu bảng điểm của cả lớp gồm 45 học sinh, hệ thống phải thực hiện 45 lệnh cập nhật.
   - **Giải pháp Unit of Work**: Toàn bộ 45 thao tác được thực thi trên **cùng một kết nối (connection client)** bên trong **một khối transaction (`BEGIN` -> `COMMIT`)**. Nếu có lỗi ở học sinh thứ 40, toàn bộ thao tác được `ROLLBACK` ngay lập tức, ngăn ngừa triệt để tình trạng lệch điểm hoặc dở dang CSDL.
5. **Dependency Inversion Principle (DIP) - Chữ D trong SOLID**:
   - Module cấp cao (Service) không phụ thuộc vào Module cấp thấp (Repository cụ thể). Cả hai cùng phụ thuộc vào Abstraction (Interface).
6. **Dependency Injection (DI) & Composition Root**:
   - Kỹ thuật Constructor Injection: Tiêm các phụ thuộc từ bên ngoài vào Use Case thay vì tự `new` bên trong.
   - Toàn bộ việc khởi tạo và liên kết đối tượng được tập trung tại **Composition Root** (`server.js`), hỗ trợ phân định 3 vòng đời đối tượng:
     * **Transient**: Tạo mới cho mỗi lần tính toán không giữ trạng thái.
     * **Scoped**: Tạo theo từng phạm vi HTTP request (Connection client và Unit of Work cho 1 lần lưu điểm).
     * **Singleton**: Khởi tạo 1 lần duy nhất cho toàn hệ thống (`pg.Pool`, Config).

### Lời thoại thuyết trình (Speaker Notes):
> "Chuyển sang Chuyên đề 4 về Mẫu Thiết Kế Phần Mềm (Design Patterns), nhóm đã nghiên cứu và phối hợp đồng thời 6 mẫu và nguyên lý hướng đối tượng:  
> - Ở tầng giao diện, nhóm áp dụng **MVC tách đôi** và **MVVM** dưới dạng Custom Hook để quản lý trạng thái bảng nhập điểm.  
> - Ở tầng dữ liệu, nhóm sử dụng **Repository Pattern** để trừu tượng hóa câu lệnh SQL, kết hợp chặt chẽ với **Unit of Work Pattern**. Unit of Work giải quyết bài toán cực kỳ quan trọng: khi giáo viên lưu bảng điểm cả lớp 45 học sinh, 45 bản ghi này được quản lý chung trong một transaction duy nhất; chỉ cần một bản ghi lỗi, toàn bộ sẽ được rollback để bảo vệ tính toàn vẹn dữ liệu.  
> - Cuối cùng, thông qua **Dependency Inversion (DIP)** và **Dependency Injection (DI)** tập trung tại Composition Root, các thành phần trong hệ thống hoàn toàn lỏng lẻo (loose coupling), cho phép nhóm dễ dàng mock dữ liệu để viết Unit Test độc lập mà không cần khởi động CSDL."

---

## PHẦN 7: ĐIỂM ĐỘT PHÁ - HIỆN THỰC HÓA WORKING PROTOTYPE VƯỢT TIẾN ĐỘ LỚP
**Thời lượng**: 1 phút

### Lời thoại thuyết trình (Speaker Notes):
> "Kính thưa Thầy/Cô,  
> Điểm ấn tượng nhất mà nhóm chúng em muốn gửi gắm trong buổi báo cáo hôm nay: **Nhóm không chỉ hoàn thành trọn vẹn 100% hồ sơ tài liệu theo tiến độ trên lớp, mà nhóm đã chủ động đi trước một bước lớn: hiện thực hóa toàn bộ thành một phiên bản chạy thực tế (Working Prototype)**.  
> 
> Nhóm không chỉ vẽ wireframe hay viết mã giả trên giấy:
> - Container PostgreSQL thật đã chạy ổn định với 8 bảng và dữ liệu học vụ thực tế.
> - Backend Node.js Clean Architecture với các Repository và Service đã hoạt động trơn tru.
> - Giao diện Web SPA React 18 đã hoàn thiện kết nối cho cả 5 vai trò.
> 
> Sau đây, nhóm xin trân trọng kính mời Thầy/Cô theo dõi phần Live Demo trực tiếp hệ thống đang chạy trên máy tính!"

---

## PHẦN 8: KỊCH BẢN THAO TÁC LIVE DEMO TRỰC QUAN (TỪNG BƯỚC KÈM HÌNH ẢNH MINH HỌA)
**Thời lượng**: 6 - 7 phút  
**Tài nguyên minh họa**: Thư mục chứa 28 ảnh chụp màn hình thực tế [Images](file:///d:/HSU/2631Semester%201%282026-2027%29/Images)

### Chuẩn bị môi trường trước giờ Demo:
1. Docker CSDL PostgreSQL: `docker start htqllh_postgres`
2. Backend API Server: `cd members/member3_Backend_DB/school-management-nodejs && node server.js`
3. Frontend Vite Server: `cd members/member2_Frontend && npm run dev`
4. Trình duyệt Web mở sẵn địa chỉ: `http://localhost:5173/login`

---

### Kịch bản Thao tác Chi Tiết & Lời Dẫn Từng Màn Hình:

#### BƯỚC 1: CỔNG ĐĂNG NHẬP PHÂN QUYỀN (LOGIN PORTAL)
- **Thao tác**: Mở màn hình đăng nhập `http://localhost:5173/login`.
- **Dẫn chứng tài liệu**: [01_Dang_Nhap.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/01_Dang_Nhap.png).
- **Lời dẫn**:  
  > "Màn hình đầu tiên là Cổng Đăng Nhập thống nhất của hệ thống. Giao diện Pure Light Theme tinh gọn với thanh Role Switcher gồm 5 tab vai trò: BGH, GVCN, GV Bộ Môn, Học Sinh và Phụ Huynh. Nhấp vào mỗi tab sẽ tự động điền tài khoản mẫu và hỗ trợ đăng nhập 1-chạm để kiểm tra phân quyền RBAC."

#### BƯỚC 2: PHÂN HỆ BAN GIÁM HIỆU (BGH - Thầy Hiệu Trưởng Trần Quốc Bảo)
- **Thao tác**: Chọn tab **BGH** -> Nhấn **Đăng Nhập Nhanh 1-Chạm** (`bgh.admin / 123456`).
- **Màn hình demo**:
  1. **Dashboard Quản trị BGH** ([02_BGH_Dashboard.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/02_BGH_Dashboard.png)): Số liệu thống kê toàn trường, biểu đồ tỷ lệ chuyên cần hôm nay, cảnh báo học vụ vĩ mô.
  2. **Quản lý Sổ Điểm Toàn Trường** ([03_BGH_So_Diem.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/03_BGH_So_Diem.png)): Giám sát sổ điểm các lớp; thực hiện quyền phê duyệt Khóa hoặc Mở khóa sổ điểm.
  3. **Hồ sơ Học Sinh & Giám sát Chuyên cần** ([04_BGH_Hoc_Sinh.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/04_BGH_Hoc_Sinh.png) & [05_BGH_Diem_Danh.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/05_BGH_Diem_Danh.png)): Tìm kiếm hồ sơ học sinh, giám sát chuyên cần theo khối lớp.
  4. **Trung tâm Báo Cáo Học Vụ** ([07_BGH_Bao_Cao.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/07_BGH_Bao_Cao.png)): Phổ điểm thống kê học lực và hạnh kiểm.
- **Lời dẫn**:  
  > "Phân hệ BGH cung cấp bức tranh quản trị toàn diện, kết nối dữ liệu trực tiếp từ PostgreSQL và kiểm soát tính toàn vẹn của sổ điểm toàn trường."

#### BƯỚC 3: PHÂN HỆ GIÁO VIÊN CHỦ NHIỆM (GVCN - Cô Lê Minh Châu, Lớp 10A1)
- **Thao tác**: Chuyển vai trò sang **GVCN** (`gvcn.10a1 / 123456`).
- **Màn hình demo**:
  1. **Dashboard Lớp Chủ Nhiệm** ([10_GVCN_Dashboard.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/10_GVCN_Dashboard.png)): Sĩ số lớp 10A1, tỷ lệ chuyên cần buổi sáng.
  2. **Điểm Danh Chuyên Cần Lớp** ([11_GVCN_Diem_Danh.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/11_GVCN_Diem_Danh.png)): Điểm danh hàng ngày: Có mặt, Vắng có phép, Vắng không phép.
  3. **Sổ Điểm Tổng Hợp Lớp** ([12_GVCN_So_Diem.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/12_GVCN_So_Diem.png)): Theo dõi bảng điểm tổng hợp tất cả các môn của lớp chủ nhiệm.
  4. **Sổ Liên Lạc & Duyệt Đơn Nghỉ Học** ([15_GVCN_Lien_Lac_Phu_Huynh.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/15_GVCN_Lien_Lac_Phu_Huynh.png)): Tiếp nhận đơn xin nghỉ học từ phụ huynh và thực hiện thao tác Duyệt trực tiếp.
- **Lời dẫn**:  
  > "GVCN theo dõi sát nề nếp lớp: Điểm danh vào đầu giờ, tiếp nhận lý do nghỉ học từ phụ huynh và đối chiếu bảng điểm tổng hợp."

#### BƯỚC 4: PHÂN HỆ GIÁO VIÊN BỘ MÔN (GV - Thầy Nguyễn Văn An, Môn Toán)
- **Thao tác**: Chuyển vai trò sang **GV Bộ Môn** (`gv.an / 123456`).
- **Màn hình demo**:
  1. **Dashboard Giáo Viên Bộ Môn** ([16_GV_Dashboard.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/16_GV_Dashboard.png)): Danh sách các lớp được phân công dạy môn Toán.
  2. **Nhập Điểm Thành Phần Bộ Môn** ([17_GV_So_Diem.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/17_GV_So_Diem.png)): Nhập điểm miệng, 15 phút, 1 tiết, học kỳ; hệ thống tự động tính điểm TBM. Áp dụng Unit of Work khi lưu điểm cả lớp.
  3. **Thời Khóa Biểu Giảng Dạy** ([19_GV_Thoi_Khoa_Bieu.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/19_GV_Thoi_Khoa_Bieu.png)): Xem lịch dạy các tiết trong tuần.
- **Lời dẫn**:  
  > "Tuân thủ chặt chẽ RBAC, giáo viên bộ môn chỉ có quyền truy cập và nhập điểm cho đúng môn Toán tại các lớp mình phụ trách giảng dạy."

#### BƯỚC 5: PHÂN HỆ HỌC SINH & PHỤ HUYNH (HS & PH)
- **Thao tác**: Đăng nhập tài khoản Học Sinh `hs.anh` và Phụ Huynh `ph.hs0001`.
- **Màn hình demo**:
  1. **Bảng Điểm Cá Nhân Học Sinh** ([20_HS_Bang_Diem.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/20_HS_Bang_Diem.png)): Học sinh tự tra cứu điểm số, học lực, lịch thi ([23_HS_Lich_Thi.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/23_HS_Lich_Thi.png)).
  2. **Cổng Phụ Huynh & Sổ Liên Lạc** ([24_PH_Cong_Phu_Huynh.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/24_PH_Cong_Phu_Huynh.png)): Theo dõi chuyên cần và học lực của con.
  3. **Nộp Đơn Xin Nghỉ Học Trực Tuyến** ([25_PH_Don_Xin_Nghi_Hoc.png](file:///d:/HSU/2631Semester%201%282026-2027%29/Images/25_PH_Don_Xin_Nghi_Hoc.png)): Phụ huynh gửi đơn xin nghỉ có ngày và lý do rõ ràng, lưu thẳng vào bảng `leave_requests`.
- **Lời dẫn**:  
  > "Phân hệ Học sinh và Phụ huynh hoàn thiện mối liên kết gia đình - nhà trường, giúp phụ huynh nắm bắt kịp thời tình hình của con em mình."

---

## PHẦN 9: TỔNG KẾT & ĐỊNH HƯỚNG CÁC CHUYÊN ĐỀ KẾ TIẾP
**Thời lượng**: 1 phút

### Lời thoại thuyết trình (Speaker Notes):
> "Kính thưa Thầy/Cô,  
> Nhìn lại toàn bộ chặng đường từ phân tích yêu cầu SRS đến Chuyên đề 4 Mẫu Thiết Kế Phần Mềm, nhóm đã:
> 1. Xây dựng tài liệu SRS 43 Use Cases chuẩn mực kết hợp Thông tư 22/BGDĐT.
> 2. Thiết kế giao diện UI/UX Sáng chuyên nghiệp trên nền tảng React 18 SPA.
> 3. Hiện thực hóa CSDL PostgreSQL 8 bảng chuẩn 3NF đảm bảo tính toàn vẹn ACID.
> 4. Áp dụng Clean Architecture và các Mẫu thiết kế (Repository, Unit of Work, DIP & DI) giúp mã nguồn chặt chẽ, an toàn giao dịch.
> 5. Hiện thực hóa thành công **Working Prototype** chạy thực tế vượt trước tiến độ lý thuyết của lớp.
> 
> Trên nền móng vững chắc này, trong các tuần tiếp theo, nhóm sẽ tiếp tục triển khai các chuyên đề kế tiếp: Xây dựng công cụ kết xuất báo cáo Excel/PDF (Chuyên đề 5), Nâng cấp bảo mật JWT & CORS (Chuyên đề 6), Nhật ký kiểm toán sửa điểm (Chuyên đề 7) và Kiểm thử tự động QA Suite (Chuyên đề 8).
> 
> Nhóm xin chân thành cảm ơn Thầy/Cô đã chú ý theo dõi và rất mong nhận được những góp ý quý báu từ Thầy/Cô!"

---

## PHỤ LỤC: NGÂN HÀNG CÂU HỎI & CÂU TRẢ LỜI PHẢN BIỆN (Q&A) BẢO VỆ HỌC PHẦN

### Nhóm câu hỏi về SRS & Nghiệp vụ:
- **Câu hỏi**: *Căn cứ nào để nhóm xây dựng công thức tính điểm và xếp loại học lực?*
  - **Trả lời**: Căn cứ theo Thông tư 22/2021/TT-BGDĐT. Điểm TBM tính theo trọng số: Thường xuyên (hệ số 1), Giữa kỳ (hệ số 2) và Cuối kỳ (hệ số 3). Xếp loại học lực kết hợp điều kiện khống các môn Toán, Văn, Ngoại ngữ.

### Nhóm câu hỏi về UI/UX:
- **Câu hỏi**: *Tại sao nhóm chọn Pure Light Theme mà không chọn Dark Theme?*
  - **Trả lời**: Môi trường học đường đòi hỏi sự rõ ràng. Thao tác nhập bảng điểm gồm hàng trăm ô số thập phân trên nền tối dễ gây mỏi mắt và nhầm lẫn. Giao diện sáng đạt chuẩn tương phản cao WCAG 2.1 giúp giáo viên tập trung và thao tác chính xác nhất.

### Nhóm câu hỏi về Cơ sở Dữ liệu:
- **Câu hỏi**: *Nếu học sinh chuyển lớp hoặc chuyển trường thì dữ liệu điểm cũ xử lý ra sao?*
  - **Trả lời**: Nhờ thiết kế có bảng `classes` và `grade_books` riêng biệt, điểm số được gắn với `student_id`, `school_year` và `semester`. Khi chuyển lớp, bản ghi lịch sử điểm của học kỳ cũ vẫn được bảo lưu toàn vẹn mà không bị ghi đè.

### Nhóm câu hỏi về Kiến trúc Phần mềm:
- **Câu hỏi**: *Điểm khác biệt lớn nhất giữa Clean Architecture và 3-Layer trong đồ án này là gì?*
  - **Trả lời**: Trong 3-Layer, tầng Business Logic phụ thuộc trực tiếp vào tầng Data Access. Trong Clean Architecture, nhóm áp dụng nguyên lý đảo ngược phụ thuộc (DIP): Tầng Service chỉ phụ thuộc vào Repository Interface trừu tượng. Việc truy vấn PostgreSQL nằm ở lớp ngoài cùng, do đó logic nghiệp vụ hoàn toàn độc lập và có thể kiểm thử không cần CSDL thật.

### Nhóm câu hỏi về Mẫu Thiết Kế (Design Patterns & SOLID):
- **Câu hỏi**: *Tại sao cần dùng Unit of Work Pattern khi đã có Repository Pattern?*
  - **Trả lời**: Repository Pattern chỉ quản lý truy vấn dữ liệu cho từng thực thể riêng rẽ. Khi giáo viên lưu bảng điểm của cả lớp 45 học sinh, nếu thực hiện 45 lệnh độc lập mà bản ghi thứ 40 bị lỗi, 39 bản ghi trước đã lưu vào CSDL sẽ gây sai lệch dữ liệu. Unit of Work gom toàn bộ 45 thao tác vào **cùng một transaction trên một kết nối duy nhất**, cùng commit hoặc cùng rollback, bảo đảm tính nguyên tử (Atomicity).

- **Câu hỏi**: *Dependency Injection (DI) được tổ chức ở đâu trong mã nguồn Node.js của nhóm?*
  - **Trả lời**: Nhóm sử dụng Constructor Injection và thiết lập tại **Composition Root** (`server.js`). Tại đây, `pg.Pool` được tạo dưới dạng Singleton, Unit of Work được tạo theo Scoped của giao dịch, và được tiêm vào các Service và Controller. Nhờ vậy, mã nguồn không bị coupling cứng và dễ dàng tiêm Mock Repository khi viết Unit Test.

---

*Tài liệu được hoàn thiện bởi Lead BA Võ Duy Bình & Toàn thể thành viên nhóm Đồ án HTQLLH - HSU 2026.*
