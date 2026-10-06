# BrainStorm Tuần 1: Phân Tích SRS - Hệ Thống Quản Lý Trường Học (School Management System - SMS)

Tài liệu phân tích Chi tiết Yêu cầu Phần mềm (SRS - Software Requirements Specification), xác định các Actors (Tác nhân tương tác), Ma trận Phân quyền (RBAC Matrix), các FC (Functional Categories / Feature Components - Phân hệ tính năng), Quy tắc Nghiệp vụ (Business Rules) và Căn cứ Pháp lý Tham khảo cho Hệ thống Quản lý Trường học.

---

## 1. Danh sách Actors và Mô tả Vai trò (Actors Description)

| STT | Actor (Tác nhân) | Mã Vai trò | Mô tả vai trò & Quyền hạn chi tiết |
| :--- | :--- | :--- | :--- |
| 1 | **Admin / Ban Giám Hiệu** *(System Administrator / Principal)* | `ROLE_ADMIN` | Quản trị toàn bộ hệ thống; tạo, cấp quyền và khóa tài khoản; cấu hình năm học, học kỳ; quản lý danh mục khối, lớp, môn học; phân công giảng dạy cho GVBM và phân công GVCN; phê duyệt báo cáo tổng kết toàn trường; duyệt cấp quyền mở lại sổ điểm đã khóa. |
| 2 | **Giáo viên Chủ nhiệm** *(Form Teacher)* | `ROLE_HOMEROOM_TEACHER` | Điểm danh chuyên cần hàng ngày cho lớp chủ nhiệm; duyệt đơn xin nghỉ học từ phụ huynh; nhập đánh giá Hạnh kiểm học kỳ/cả năm; theo dõi tổng quát tình hình học tập; xem học bạ, liên lạc và gửi thông báo trực tiếp tới phụ huynh của lớp. |
| 3 | **Giáo viên Bộ môn** *(Subject Teacher)* | `ROLE_SUBJECT_TEACHER` | Điểm danh theo từng tiết học phụ trách; nhập và chỉnh sửa điểm thành phần (miệng, 15 phút, 1 tiết, giữa kỳ, cuối kỳ) cho các lớp được phân công; tổng kết điểm trung bình môn (TBM); gửi yêu cầu khóa sổ điểm bộ môn sau khi hoàn thành. |
| 4 | **Học sinh** *(Student)* | `ROLE_STUDENT` | Tra cứu kết quả học tập cá nhân (bảng điểm chi tiết các môn, điểm trung bình tích lũy GPA hệ 10 và hệ 4); xem thời khóa biểu, lịch kiểm tra, lịch thi; xem nhật ký điểm danh chuyên cần; nhận thông báo chung từ nhà trường và giáo viên. |
| 5 | **Phụ huynh** *(Parent)* | `ROLE_PARENT` | Sử dụng như Sổ liên lạc điện tử; xem kết quả học tập, điểm số và hạnh kiểm của con em; gửi đơn xin nghỉ học trực tuyến; nhận thông báo điểm danh/vắng học tức thời; xem chi tiết thông báo học phí, lịch sử thanh toán và biên lai điện tử. |

---

## 2. Ma trận Phân quyền Chi tiết (RBAC Permission Matrix)

*Ký hiệu: **C** (Create - Tạo), **R** (Read - Xem), **U** (Update - Cập nhật), **D** (Delete - Xóa), **A** (Approve - Phê duyệt), **L** (Lock - Khóa/Mở).*

| Phân hệ / Đối tượng dữ liệu | Admin | GV Chủ nhiệm | GV Bộ môn | Học sinh | Phụ huynh |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Quản lý Tài khoản & Phân quyền | C / R / U / D | R (Xem lớp) | R (Xem lớp) | R (Cá nhân) | R (Cá nhân) |
| Cấu hình Năm học / Môn / Lớp | C / R / U / D | R | R | R | R |
| Hồ sơ Học sinh | C / R / U / D | R / U (Lớp CN) | R (Lớp dạy) | R (Cá nhân) | R (Cá nhân) |
| Phân công Giảng dạy & TKB | C / R / U / D | R | R | R | R |
| Sổ điểm Thành phần & TBM | R / L | R (Xem lớp CN) | C / R / U (Lớp dạy) | R (Cá nhân) | R (Cá nhân) |
| Đánh giá Hạnh kiểm | R / A | C / R / U (Lớp CN) | - | R (Cá nhân) | R (Cá nhân) |
| Điểm danh Chuyên cần | R | C / R / U (Hàng ngày) | C / R / U (Theo tiết) | R (Cá nhân) | R (Cá nhân) |
| Đơn xin nghỉ học | R | R / A (Lớp CN) | R (Lớp dạy) | - | C / R / U |
| Thông báo & Sổ liên lạc | C / R / U / D | C / R / U (Lớp CN) | R | R | R |
| Quản lý Học phí & Thu chi | C / R / U / D | R (Xem lớp CN) | - | R (Cá nhân) | R / U (Thanh toán) |
| Báo cáo & Xuất Excel/PDF | C / R / U / D | R / U (Lớp CN) | R (Bộ môn) | R (Phiếu điểm) | R (Phiếu điểm) |

---

## 3. Phân tích Chi tiết Các Phân hệ Chức năng (FC - Functional Components)

### FC-01: Phân hệ Quản lý Tài khoản & Phân quyền (Authentication & Authorization)
- **FC-01.1**: Đăng nhập / Đăng xuất an toàn bằng Mã định danh (ID) và Mật khẩu.
- **FC-01.2**: Phân quyền hệ thống theo 5 vai trò (RBAC: Admin, Homeroom Teacher, Subject Teacher, Student, Parent).
- **FC-01.3**: Đổi mật khẩu cá nhân, khôi phục mật khẩu tự động qua Email xác nhận hoặc Mã OTP.
- **FC-01.4**: Tự động khóa tài khoản khi nhập sai mật khẩu quá 5 lần liên tiếp.
- **FC-01.5**: Quản lý phiên làm việc (Session & JWT Refresh Token Management), tự động đăng xuất sau 30 phút vô hiệu.
- **FC-01.6**: Ghi nhật ký truy cập và lưu vết thao tác người dùng (Audit Log) đảm bảo tính minh bạch.

### FC-02: Phân hệ Quản lý Hồ sơ Học sinh & Lớp học (Student & Class Management)
- **FC-02.1**: Quản lý hồ sơ học sinh toàn diện (Họ tên, ngày sinh, giới tính, dân tộc, địa chỉ, ảnh đại diện, thông tin phụ huynh, sức khỏe ban đầu).
- **FC-02.2**: Quản lý danh mục Khối lớp (Khối 10, 11, 12 hoặc các khối học), Lớp học, sĩ số tối đa (35 - 45 học sinh/lớp).
- **FC-02.3**: Xếp lớp tự động/thủ công, chuyển lớp, phân loại trạng thái học sinh (*Đang học, Thôi học, Chuyển trường, Đã tốt nghiệp*).
- **FC-02.4**: Quản lý hồ sơ Khen thưởng, Kỷ luật và tiền sử quá trình học tập của từng học sinh.
- **FC-02.5**: Bộ lọc và công cụ tìm kiếm học sinh thông minh theo Lớp, Khối, Họ tên, Mã học sinh, Học lực.

### FC-03: Phân hệ Quản lý Giảng dạy & Thời khóa biểu (Teaching & Schedule Management)
- **FC-03.1**: Quản lý danh mục Môn học (Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, GDCD,...), số tiết/tuần, hệ số môn.
- **FC-03.2**: Phân công giảng dạy cho Giáo viên bộ môn theo Lớp và phân công Giáo viên chủ nhiệm.
- **FC-03.3**: Khởi tạo và hiển thị Thời khóa biểu trực quan dạng ma trận Thứ (Thứ 2 - Thứ 7) và Tiết học (Sáng/Chiều).
- **FC-03.4**: Thuật toán tự động kiểm tra trùng lịch dạy của Giáo viên và trùng phòng học khi xếp thời khóa biểu.
- **FC-03.5**: Quản lý đăng ký đổi tiết dạy, dạy bù và cập nhật lịch báo giảng trực tuyến.

### FC-04: Phân hệ Sổ điểm Điện tử & Đánh giá (Grade & Academic Assessment)
- **FC-04.1**: Nhập và chỉnh sửa điểm thành phần (Điểm kiểm tra thường xuyên/miệng, Điểm 15 phút, Điểm 1 tiết, Điểm Giữa kỳ, Điểm Cuối kỳ).
- **FC-04.2**: Cơ chế tự động tính Điểm trung bình môn (TBM) theo đúng trọng số quy định của Bộ Giáo dục & Đào tạo.
- **FC-04.3**: Tự động tính Điểm trung bình tích lũy học kỳ/cả năm (GPA Hệ 10.0 và Quy đổi Hệ 4.0).
- **FC-04.4**: Thuật toán tự động xếp loại Học lực quy chuẩn (*Xuất sắc, Giỏi, Khá, Trung bình, Yếu, Kém*) kết hợp điều kiện khống môn học.
- **FC-04.5**: Nhập, theo dõi và đánh giá Hạnh kiểm học sinh theo từng học kỳ/cả năm (*Tốt, Khá, Trung bình, Yếu*).
- **FC-04.6**: Quy trình Khóa/Mở chốt sổ điểm 2 cấp: GVBM khóa sổ điểm -> Ban Giám Hiệu duyệt mở lại khi có đơn phúc khảo.
- **FC-04.7**: Quản lý đơn xin phúc khảo điểm và lưu lại lịch sử sửa điểm cũ/điểm mới.

### FC-05: Phân hệ Điểm danh & Chuyên cần (Attendance Management)
- **FC-05.1**: Điểm danh chuyên cần hàng ngày (GVCN) hoặc theo từng tiết học (GVBM) trên giao diện Web/Mobile.
- **FC-05.2**: Quản lý trạng thái chuyên cần chi tiết: *Có mặt, Vắng có phép, Vắng không phép, Đi trễ*.
- **FC-05.3**: Phụ huynh nộp Đơn xin nghỉ học trực tuyến qua Sổ liên lạc điện tử; GVCN tiếp nhận và phê duyệt.
- **FC-05.4**: Tự động gửi thông báo/cảnh báo tức thời tới Phụ huynh khi học sinh vắng mặt không rõ lý do.
- **FC-05.5**: Thống kê tỷ lệ chuyên cần theo tháng/học kỳ và tự động đưa ra cảnh báo nguy cơ bị cấm thi do vắng quá 20% số tiết.

### FC-06: Phân hệ Quản lý Học phí & Thu chi (Tuition & Fee Management)
- **FC-06.1**: Khởi tạo và phát hành thông báo học phí theo tháng/học kỳ (gồm Học phí chính khóa, Tiền bán trú, BHYT, Cơ sở vật chất, Học bổng/Miễn giảm).
- **FC-06.2**: Theo dõi và cập nhật trạng thái thanh toán (*Chưa thanh toán, Đã thanh toán, Còn nợ, Thanh toán một phần*).
- **FC-06.3**: Tích hợp cổng thanh toán trực tuyến mô phỏng (Mã QR VietQR, VNPAY/MoMo) giúp phụ huynh đóng tiền dễ dàng.
- **FC-06.4**: Tự động xuất biên lai/hóa đơn thu tiền điện tử gửi tới tài khoản Phụ huynh.

### FC-07: Phân hệ Sổ liên lạc Điện tử & Báo cáo (Communication & Reporting)
- **FC-07.1**: Đăng tải thông báo chung toàn trường và tin nhắn trao đổi riêng giữa GVCN với Phụ huynh.
- **FC-07.2**: Thống kê phổ điểm (Biểu đồ phân bố điểm số) toàn lớp, toàn khối để đánh giá chất lượng giảng dạy.
- **FC-07.3**: Xuất báo cáo danh sách học sinh và bảng điểm tổng hợp lớp ra file **Excel** (chuẩn định dạng SheetJS).
- **FC-07.4**: Xuất Phiếu báo điểm cá nhân, Học bạ điện tử và Biên lai thu học phí ra file **PDF** (chuẩn định dạng jsPDF).

### FC-08: Ánh Xạ Phân Hệ Chức Năng Với Frontend Components (`members/member2_Frontend/src/pages/`)
- **FC-08.1**: `LoginPage.jsx` - Giao diện Đăng nhập đa vai trò, chọn Role, nhập mật khẩu và xử lý xác thực Token.
- **FC-08.2**: `BGHReportCenterPage.jsx` & `BGHAttendanceMonitorPage.jsx` - Portal dành cho Admin / Ban Giám Hiệu theo dõi báo cáo sĩ số, tỷ lệ chuyên cần và phổ điểm toàn trường.
- **FC-08.3**: `SystemSettingsPage.jsx` - Quản lý danh mục khối, lớp, năm học, môn học và cấu hình khóa/mở sổ điểm hệ thống.
- **FC-08.4**: `GradebookPage.jsx` - Sổ điểm điện tử dành cho Giáo viên bộ môn (nhập điểm miệng, 15p, 1 tiết, GK, CK, tự động tính TBM).
- **FC-08.5**: `AttendancePage.jsx` - Giao diện điểm danh chuyên cần dành cho GVCN/GVBM với các lựa chọn: Có mặt, Vắng có phép, Vắng không phép, Đi trễ.
- **FC-08.6**: `StudentSchedulePage.jsx` - Thời khóa biểu và Bảng điểm cá nhân dành cho Học sinh/Phụ huynh.
- **FC-08.7**: `ParentCommunicationPage.jsx` - Sổ liên lạc điện tử, đơn xin nghỉ học và thanh toán học phí cho Phụ huynh.

### FC-09: Chi Tiết Danh Sách Sơ Đồ & Mô Tả Use Cases Cho 5 Tác Nhân (Use Case Specifications)

#### FC-09.1: Use Cases Tác Nhân Học Sinh (`ROLE_STUDENT`)

| Mã Use Case | Tên Use Case | Mô tả chi tiết chức năng | Điều kiện tiên quyết |
| :--- | :--- | :--- | :--- |
| **UC-STU-01** | Đăng nhập / Đăng xuất | Xác thực bằng Mã học sinh (Mã HS) và mật khẩu cá nhân vào hệ thống. | Đã có tài khoản Học sinh active. |
| **UC-STU-02** | Đổi / Khôi phục mật khẩu | Thay đổi mật khẩu cá nhân hoặc yêu cầu gửi mã OTP khôi phục mật khẩu. | Đăng nhập thành công hoặc có Email/SĐT. |
| **UC-STU-03** | Xem Thời khóa biểu & Lịch thi | Tra cứu thời khóa biểu các tiết học hàng tuần và lịch thi học kỳ trực quan. | Đã được xếp lớp và phân công TKB. |
| **UC-STU-04** | Xem Thông báo chung | Tiếp nhận thông báo chính thức từ Nhà trường, BGH và Giáo viên bộ môn. | Đã đăng nhập hệ thống. |
| **UC-STU-05** | Tra cứu Điểm & GPA | Xem bảng điểm chi tiết thành phần các môn, ĐTB môn (TBM), GPA hệ 10 và hệ 4. | Đã có điểm nhập từ GVBM. |
| **UC-STU-06** | Xem Nhật ký Chuyên cần | Tra cứu lịch sử điểm danh hàng ngày và tổng số buổi vắng mặt/đi trễ. | GVCN/GVBM đã điểm danh. |
| **UC-STU-07** | Nộp Đơn xin Phúc khảo | Gửi đơn đề nghị kiểm tra lại điểm bài thi khi phát hiện sai sót. | Trong thời hạn phúc khảo quy định. |

```mermaid
graph LR
    subgraph StudentBoundary ["Hệ Thống Quản Lý Trường Học (SMS) - Học Sinh"]
        UC_S1["UC-STU-01: Đăng nhập / Đăng xuất"]
        UC_S2["UC-STU-02: Đổi / Khôi phục mật khẩu"]
        UC_S3["UC-STU-03: Xem Thời khóa biểu & Lịch thi"]
        UC_S4["UC-STU-04: Xem Thông báo chung từ Nhà trường/Giáo viên"]
        UC_S5["UC-STU-05: Tra cứu Điểm chi tiết & GPA (Hệ 10/Hệ 4)"]
        UC_S6["UC-STU-06: Xem Nhật ký Điểm danh Chuyên cần"]
        UC_S7["UC-STU-07: Nộp Đơn xin Phúc khảo điểm"]
    end

    Student["Học sinh (ROLE_STUDENT)"] --> UC_S1
    Student --> UC_S2
    Student --> UC_S3
    Student --> UC_S4
    Student --> UC_S5
    Student --> UC_S6
    Student --> UC_S7
```

---

#### FC-09.2: Use Cases Tác Nhân Giáo Viên Chủ Nhiệm (`ROLE_HOMEROOM_TEACHER`)

| Mã Use Case | Tên Use Case | Mô tả chi tiết chức năng | Điều kiện tiên quyết |
| :--- | :--- | :--- | :--- |
| **UC-GVCN-01** | Đăng nhập / Đăng xuất | Xác thực bằng Mã giáo viên (Mã GV) và mật khẩu vào hệ thống. | Tài khoản GVCN hoạt động. |
| **UC-GVCN-02** | Đổi / Khôi phục mật khẩu | Thay đổi mật khẩu tài khoản cá nhân. | Đã đăng nhập hệ thống. |
| **UC-GVCN-03** | Xem Hồ sơ Học sinh Lớp CN | Tra cứu lý lịch, thông tin phụ huynh, sơ yếu lý lịch học sinh lớp chủ nhiệm. | Được phân công GVCN lớp. |
| **UC-GVCN-04** | Xem Thời khóa biểu Lớp CN | Xem lịch học và lịch giảng dạy của lớp chủ nhiệm theo từng tuần. | Hệ thống đã phát hành TKB. |
| **UC-GVCN-05** | Điểm danh Chuyên cần Hàng ngày | Ghi nhận trạng thái: Có mặt, Vắng có phép, Vắng không phép, Đi trễ đầu giờ. | Trong buổi học hàng ngày. |
| **UC-GVCN-06** | Tiếp nhận & Duyệt Đơn nghỉ học | Xem và bấm Duyệt/Từ chối đơn xin nghỉ học gửi trực tuyến từ Phụ huynh. | Phụ huynh đã gửi đơn. |
| **UC-GVCN-07** | Nhập & Đánh giá Hạnh kiểm | Đánh giá xếp loại Hạnh kiểm (Tốt, Khá, Trung bình, Yếu) theo Thông tư 22. | Cuối học kỳ / Cuối năm học. |
| **UC-GVCN-08** | Xem Sổ điểm Lớp CN | Xem bảng điểm tổng hợp tất cả các môn học và GPA tổng kết của lớp chủ nhiệm. | GVBM đã nhập điểm. |
| **UC-GVCN-09** | Gửi Thông báo / Sổ liên lạc | Gửi tin nhắn, thông báo họp phụ huynh hoặc cảnh báo học tập tới Phụ huynh. | Đã kết nối danh bạ phụ huynh. |
| **UC-GVCN-10** | Xuất Báo cáo / Phiếu điểm Lớp CN | Xuất danh sách học sinh, phiếu báo điểm cá nhân ra file Excel/PDF. | Đã hoàn thành đánh giá. |

```mermaid
graph LR
    subgraph HomeroomTeacherBoundary ["Hệ Thống Quản Lý Trường Học (SMS) - GVCN"]
        UC_H1["UC-GVCN-01: Đăng nhập / Đăng xuất"]
        UC_H2["UC-GVCN-02: Đổi / Khôi phục mật khẩu"]
        UC_H3["UC-GVCN-03: Xem Hồ sơ Học sinh Lớp chủ nhiệm"]
        UC_H4["UC-GVCN-04: Xem Thời khóa biểu Lớp chủ nhiệm"]
        UC_H5["UC-GVCN-05: Điểm danh Chuyên cần Hàng ngày"]
        UC_H6["UC-GVCN-06: Tiếp nhận & Duyệt Đơn xin nghỉ học"]
        UC_H7["UC-GVCN-07: Nhập & Đánh giá Hạnh kiểm"]
        UC_H8["UC-GVCN-08: Xem Sổ điểm & Kết quả Học tập Lớp CN"]
        UC_H9["UC-GVCN-09: Gửi Thông báo / Sổ liên lạc tới Phụ huynh"]
        UC_H10["UC-GVCN-10: Xuất Báo cáo / Phiếu điểm Lớp CN (Excel/PDF)"]
    end

    HomeroomTeacher["Giáo viên Chủ nhiệm (ROLE_HOMEROOM_TEACHER)"] --> UC_H1
    HomeroomTeacher --> UC_H2
    HomeroomTeacher --> UC_H3
    HomeroomTeacher --> UC_H4
    HomeroomTeacher --> UC_H5
    HomeroomTeacher --> UC_H6
    HomeroomTeacher --> UC_H7
    HomeroomTeacher --> UC_H8
    HomeroomTeacher --> UC_H9
    HomeroomTeacher --> UC_H10
```

---

#### FC-09.3: Use Cases Tác Nhân Phụ Huynh (`ROLE_PARENT`)

| Mã Use Case | Tên Use Case | Mô tả chi tiết chức năng | Điều kiện tiên quyết |
| :--- | :--- | :--- | :--- |
| **UC-PAR-01** | Đăng nhập / Đăng xuất | Xác thực bằng tài khoản Phụ huynh liên kết với Mã học sinh của con. | Đã liên kết tài khoản con em. |
| **UC-PAR-02** | Đổi / Khôi phục mật khẩu | Đổi mật khẩu hoặc nhận mã khôi phục qua SĐT/Email. | Đã đăng ký tài khoản. |
| **UC-PAR-03** | Xem Thông báo từ GVCN | Nhận thông báo lớp, thông báo học tập và tin nhắn từ Giáo viên chủ nhiệm. | GVCN đã gửi thông báo. |
| **UC-PAR-04** | Xem Bảng điểm & Hạnh kiểm | Tra cứu chi tiết điểm kiểm tra các môn, ĐTB môn và đánh giá hạnh kiểm của con. | Hệ thống đã có điểm. |
| **UC-PAR-05** | Xem Lịch sử Điểm danh | Theo dõi tình hình chuyên cần hàng ngày và số buổi nghỉ học của con. | Đã có dữ liệu điểm danh. |
| **UC-PAR-06** | Gửi Đơn xin nghỉ học Trực tuyến | Điền ngày nghỉ và lý do (ốm, việc gia đình) gửi trực tiếp tới GVCN. | Trước hoặc trong ngày nghỉ. |
| **UC-PAR-07** | Xem Thông báo Học phí | Tra cứu danh mục các khoản cần đóng (Học phí, BHYT, Tiền bán trú, Đồng phục). | Nhà trường đã phát hành đợt thu. |
| **UC-PAR-08** | Thanh toán Học phí Trực tuyến | Thanh toán các khoản thu bằng mã VietQR, VNPAY hoặc ví MoMo. | Đã liên kết cổng thanh toán. |
| **UC-PAR-09** | Xem & Tải Biên lai PDF | Tải biên lai xác nhận thu tiền điện tử định dạng PDF về máy. | Thanh toán thành công. |

```mermaid
graph LR
    subgraph ParentBoundary ["Hệ Thống Quản Lý Trường Học (SMS) - Phụ Huynh"]
        UC_P1["UC-PAR-01: Đăng nhập / Đăng xuất"]
        UC_P2["UC-PAR-02: Đổi / Khôi phục mật khẩu"]
        UC_P3["UC-PAR-03: Xem Thông báo & Nhận tin nhắn từ GVCN"]
        UC_P4["UC-PAR-04: Xem Bảng điểm & Đánh giá Hạnh kiểm của Con"]
        UC_P5["UC-PAR-05: Xem Lịch sử Điểm danh Chuyên cần"]
        UC_P6["UC-PAR-06: Gửi Đơn xin nghỉ học Trực tuyến"]
        UC_P7["UC-PAR-07: Xem Thông báo Học phí & Chi tiết các khoản"]
        UC_P8["UC-PAR-08: Thanh toán Học phí Trực tuyến (QR/VNPAY/MoMo)"]
        UC_P9["UC-PAR-09: Xem & Tải Biên lai Thu tiền Điện tử (PDF)"]
    end

    Parent["Phụ huynh (ROLE_PARENT)"] --> UC_P1
    Parent --> UC_P2
    Parent --> UC_P3
    Parent --> UC_P4
    Parent --> UC_P5
    Parent --> UC_P6
    Parent --> UC_P7
    Parent --> UC_P8
    Parent --> UC_P9
```

---

#### FC-09.4: Use Cases Tác Nhân Giáo Viên Bộ Môn (`ROLE_SUBJECT_TEACHER`)

| Mã Use Case | Tên Use Case | Mô tả chi tiết chức năng | Điều kiện tiên quyết |
| :--- | :--- | :--- | :--- |
| **UC-GVBM-01** | Đăng nhập / Đăng xuất | Xác thực tài khoản bằng Mã GVBM và mật khẩu. | Tài khoản active. |
| **UC-GVBM-02** | Đổi / Khôi phục mật khẩu | Đổi mật khẩu tài khoản cá nhân. | Đã đăng nhập. |
| **UC-GVBM-03** | Xem Thời khóa biểu cá nhân | Tra cứu lịch dạy theo từng ngày/tiết của các lớp phụ trách. | BGH đã xếp TKB. |
| **UC-GVBM-04** | Xem Danh sách Học sinh | Xem danh sách học sinh theo từng lớp được phân công giảng dạy. | Được phân công lớp dạy. |
| **UC-GVBM-05** | Đăng ký Đổi tiết / Báo giảng | Cập nhật tiến độ báo giảng hoặc gửi yêu cầu đổi tiết dạy cho GV khác. | Trước thời điểm tiết dạy. |
| **UC-GVBM-06** | Điểm danh Theo tiết học | Điểm danh học sinh hiện diện trong tiết học môn phụ trách. | Trong giờ học môn đó. |
| **UC-GVBM-07** | Nhập & Chỉnh sửa Điểm | Nhập điểm Miệng, 15 phút, 1 tiết, Giữa kỳ và Cuối kỳ cho học sinh. | Sổ điểm môn chưa bị khóa. |
| **UC-GVBM-08** | Gửi Yêu cầu Khóa sổ điểm | Bấm chốt khóa sổ điểm bộ môn sau khi hoàn thành nhập điểm học kỳ. | Đã nhập đầy đủ cột điểm. |
| **UC-GVBM-09** | Xuất Bảng điểm Môn học | Xuất bảng điểm môn học của lớp phụ trách ra file Excel/PDF. | Đã nhập điểm thành phần. |
| **UC-GVBM-10** | Tự động Tính Điểm TBM | Hệ thống tự động tính TBM theo trọng số Thông tư 22 khi nhập điểm. | Đã có đủ cột điểm bắt buộc. |

```mermaid
graph LR
    subgraph SubjectTeacherBoundary ["Hệ Thống Quản Lý Trường Học (SMS) - GVBM"]
        UC_T1["UC-GVBM-01: Đăng nhập / Đăng xuất"]
        UC_T2["UC-GVBM-02: Đổi / Khôi phục mật khẩu"]
        UC_T3["UC-GVBM-03: Xem Thời khóa biểu cá nhân"]
        UC_T4["UC-GVBM-04: Xem Danh sách Học sinh Lớp giảng dạy"]
        UC_T5["UC-GVBM-05: Đăng ký Đổi tiết dạy / Báo giảng"]
        UC_T6["UC-GVBM-06: Điểm danh Chuyên cần Theo tiết"]
        UC_T7["UC-GVBM-07: Nhập & Chỉnh sửa Điểm thành phần"]
        UC_T8["UC-GVBM-08: Gửi Yêu cầu Khóa sổ điểm Bộ môn"]
        UC_T9["UC-GVBM-09: Xuất Bảng điểm Môn học (Excel/PDF)"]
        UC_T10["UC-GVBM-10: Tự động Tính Điểm Trung bình môn (TBM)"]
    end

    SubjectTeacher["Giáo viên Bộ môn (ROLE_SUBJECT_TEACHER)"] --> UC_T1
    SubjectTeacher --> UC_T2
    SubjectTeacher --> UC_T3
    SubjectTeacher --> UC_T4
    SubjectTeacher --> UC_T5
    SubjectTeacher --> UC_T6
    SubjectTeacher --> UC_T7
    SubjectTeacher --> UC_T8
    SubjectTeacher --> UC_T9
    SubjectTeacher --> UC_T10
```

---

#### FC-09.5: Use Cases Tác Nhân Admin / Ban Giám Hiệu (`ROLE_ADMIN`)

| Mã Use Case | Tên Use Case | Mô tả chi tiết chức năng | Điều kiện tiên quyết |
| :--- | :--- | :--- | :--- |
| **UC-ADM-01** | Đăng nhập & Quản trị | Đăng nhập tài khoản Quản trị viên tối cao (System Admin / Principal). | Quyền ROLE_ADMIN. |
| **UC-ADM-02** | Quản lý Tài khoản & RBAC | Tạo mới, phân quyền, sửa thông tin và vô hiệu hóa tài khoản 5 vai trò. | Đã đăng nhập Admin. |
| **UC-ADM-03** | Quản lý Danh mục Trường | Cấu hình năm học, danh mục Khối, Lớp, Môn học, Phân công GVBM & GVCN. | Đã khởi tạo năm học mới. |
| **UC-ADM-04** | Duyệt & Khóa/Mở Sổ điểm | Khóa sổ điểm toàn trường hoặc duyệt mở lại sổ điểm khi có đơn phúc khảo. | Có yêu cầu từ GVBM/BGH. |
| **UC-ADM-05** | Giám sát Chuyên cần | Theo dõi tỷ lệ chuyên cần toàn trường, cảnh báo tự động các lớp $< 80\%$. | Dữ liệu điểm danh hàng ngày. |
| **UC-ADM-06** | Xuất Báo cáo Thống kê | Thống kê phổ điểm, danh hiệu thi đua, xuất báo cáo tổng kết toàn trường (Excel/PDF). | Đã hoàn thành chốt điểm. |
| **UC-ADM-07** | Quản lý Học phí & Thu chi | Tạo danh mục đợt thu học phí, theo dõi tổng số tiền đã thu/còn nợ toàn trường. | Đã lập kế hoạch tài chính. |

```mermaid
graph LR
    subgraph AdminBoundary ["Hệ Thống Quản Lý Trường Học (SMS) - Ban Giám Hiệu / Admin"]
        UC_A1["UC-ADM-01: Đăng nhập / Đăng xuất & Khôi phục mật khẩu"]
        UC_A2["UC-ADM-02: Quản lý Tài khoản & Phân quyền 5 Roles"]
        UC_A3["UC-ADM-03: Quản lý Danh mục Khối, Lớp, Môn & Phân công giảng dạy"]
        UC_A4["UC-ADM-04: Phê duyệt & Mở khóa Sổ điểm Toàn trường"]
        UC_A5["UC-ADM-05: Giám sát Chuyên cần Toàn trường & Cảnh báo < 80%"]
        UC_A6["UC-ADM-06: Quản lý & Xuất Báo cáo Thống kê Toàn trường (Excel/PDF)"]
        UC_A7["UC-ADM-07: Quản lý Danh mục Học phí & Đợt thu"]
    end

    Admin["Ban Giám Hiệu / Admin (ROLE_ADMIN)"] --> UC_A1
    Admin --> UC_A2
    Admin --> UC_A3
    Admin --> UC_A4
    Admin --> UC_A5
    Admin --> UC_A6
    Admin --> UC_A7
```

---

## 4. Quy tắc Nghiệp vụ Hệ thống (Business Rules - BR)

- **BR-01 (Công thức tính TBM)**:  
  $$\text{TBM} = \frac{\sum (\text{Điểm TX}) + 2 \times \text{Điểm GK} + 3 \times \text{Điểm CK}}{\text{Tổng hệ số}}$$  
  *(Điểm làm tròn đến 1 chữ số thập phân).*

- **BR-02 (Điều kiện Xếp loại Học lực Giỏi)**:  
  ĐTB các môn $\ge 8.0$, trong đó môn Toán hoặc Ngữ văn $\ge 8.0$; không có môn nào dưới $6.5$.

- **BR-03 (Quy định Chống Sửa Điểm)**:  
  Sau khi sổ điểm đã chốt khóa, mọi thao tác sửa điểm bắt buộc phải có sự đồng ý phê duyệt của Ban Giám Hiệu và hệ thống tự động ghi nhật ký Audit Log (Thời gian, Người sửa, Điểm cũ, Điểm mới, Lý do).

- **BR-04 (Quy định Chuyên cần)**:  
  Học sinh vắng không phép quá 45 buổi trong một năm học hoặc quá 20% tổng số tiết của môn học sẽ không được lên lớp/bị cấm thi môn đó.

- **BR-05 (Quy định Danh hiệu Thi đua Khen thưởng)**:  
  - *Học sinh Xuất sắc*: ĐTB tất cả các môn $\ge 9.0$, tất cả các môn đánh giá bằng điểm $\ge 8.0$, Hạnh kiểm đạt Tốt.  
  - *Học sinh Giỏi*: ĐTB tất cả các môn $\ge 8.0$, tất cả các môn đánh giá bằng điểm $\ge 6.5$, Hạnh kiểm đạt Tốt.

- **BR-06 (Quy định Rèn luyện Hè & Kiểm tra Khảo sát Thi lại)**:  
  Học sinh có ĐTB cả năm từ $3.5$ đến dưới $5.0$ hoặc có môn học dưới $3.5$ nhưng thuộc diện được rèn luyện hè sẽ phải tham gia kỳ thi lại/kiểm tra đánh giá bổ sung trước khi xét duyệt lên lớp năm học mới.

### Sơ đồ Quy trình Phê duyệt Mở khóa Sổ điểm (Unlock Gradebook Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor GVBM as Giáo viên Bộ môn
    actor BGH as Ban Giám Hiệu / Admin
    participant DB as PostgreSQL Database
    participant Log as Audit Log System

    GVBM->>BGH: Gửi yêu cầu mở khóa sổ điểm (kèm lý do phúc khảo)
    BGH->>BGH: Kiểm tra đơn phúc khảo và chứng từ hợp lệ
    alt Yêu cầu được phê duyệt
        BGH->>DB: Cập nhật trạng thái sổ điểm (IsLocked = False, ExpireIn = 24h)
        DB->>Log: Ghi nhận vết (AdminID, SubjectID, ClassID, UnlockTimestamp)
        BGH-->>GVBM: Thông báo mở khóa thành công trong 24 giờ
        GVBM->>DB: Nhập điểm điều chỉnh sau phúc khảo
        GVBM->>BGH: Khóa lại sổ điểm bộ môn
    else Yêu cầu bị từ chối
        BGH-->>GVBM: Phản hồi lý do từ chối mở khóa
    end
```

---

## 5. Yêu cầu Phi chức năng Chi tiết (NFR - Non-Functional Requirements)

- **Bảo mật (Security)**:
  - Mã hóa mật khẩu bằng thuật toán BCrypt.
  - Xác thực Token JWT với chữ ký mã hóa SSL/TLS (HTTPS).
  - Phòng chống các lỗ hổng bảo mật tiêu chuẩn OWASP (SQL Injection, XSS, CSRF).
  - Phân quyền theo đường dẫn API (Route Authorization).
- **Tính toàn vẹn Dữ liệu (Data Integrity)**:
  - Ràng buộc giá trị điểm thành phần hợp lệ nằm trong khoảng từ `0.0` đến `10.0`.
  - Sử dụng giao dịch CSDL (Database Transactions) đảm bảo tính ACID khi cập nhật điểm hoặc thu học phí hàng loạt.
- **Hiệu năng & Độ sẵn sàng (Performance & Availability)**:
  - Thời gian phản hồi API (Response Time) $< 1$ giây với các truy vấn thông thường.
  - Thời gian tải bảng điểm lớp có sĩ số 45 học sinh $< 500\text{ms}$.
  - Độ sẵn sàng hệ thống (Availability) đạt $99.9\%$, hỗ trợ sao lưu dữ liệu tự động hàng ngày (Daily Auto-Backup).
- **Tính Khả dụng & Tương thích (Usability & Compatibility)**:
  - Giao diện chuẩn UX/UI hiện đại, thân thiện, dễ nhìn cho người lớn tuổi (Giáo viên, Phụ huynh).
  - Tương thích Responsive mượt mà trên tất cả các trình duyệt phổ biến (Chrome, Firefox, Safari, Edge) và thiết bị di động (iOS, Android).

---

## 6. Tài liệu Tham khảo & Căn cứ Pháp lý (References & Legal Framework)

### 6.1. Căn cứ Pháp lý & Quy chế Đào tạo (Legal & Educational Decrees)
- **Thông tư 22/2021/TT-BGDĐT**: Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông của Bộ Giáo dục & Đào tạo.  
  *Ứng dụng*: Công thức tính điểm trung bình môn, GPA, tiêu chuẩn xếp loại Học lực và đánh giá Hạnh kiểm.
- **Thông tư 32/2020/TT-BGDĐT**: Ban hành Điều lệ trường trung học cơ sở, trường trung học phổ thông và trường phổ thông có nhiều cấp học.  
  *Ứng dụng*: Xác định vai trò, quyền hạn và trách nhiệm của Ban Giám Hiệu, Giáo viên Chủ nhiệm, Giáo viên Bộ môn, Học sinh và Phụ huynh.
- **Nghị định 13/2023/NĐ-CP**: Nghị định của Chính phủ về bảo vệ dữ liệu cá nhân.  
  *Ứng dụng*: Ràng buộc pháp lý về bảo mật thông tin hồ sơ lý lịch học sinh, phụ huynh và tài chính học phí.

### 6.2. Tiêu chuẩn Kỹ thuật & Thiết kế Phần mềm (Technical Standards & Architecture)
- **IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018**: Recommended Practice for Software Requirements Specifications.  
  *Ứng dụng*: Khung chuẩn quốc tế cấu trúc tài liệu Phân tích Yêu cầu Phần mềm (SRS).
- **OWASP Top 10 Web Application Security Risks**: Open Web Application Security Project.  
  *Phạm vi áp dụng*: Tiêu chuẩn phòng chống lỗ hổng bảo mật Web (SQL Injection, XSS, CSRF, Broken Access Control).
- **RFC 7519 (JSON Web Token - JWT Specification)**: Internet Engineering Task Force (IETF).  
  *Phạm vi áp dụng*: Chuẩn xác thực phân quyền Token RBAC không trạng thái (Stateless Authorization).
- **PostgreSQL 15 Documentation & ACID Compliance Standards**: PostgreSQL Global Development Group.  
  *Phạm vi áp dụng*: Thiết kế và tối ưu hóa Cơ sở Dữ liệu Quan hệ cho điểm số và học phí.

### 6.3. Liên kết Công cụ & Thư viện Mở Tham khảo (Online Technical Documentation Links)
- **SheetJS (xlsx) Documentation**: [https://sheetjs.com](https://sheetjs.com) (Thư viện xuất và xử lý dữ liệu Excel phía Client/Server).
- **jsPDF API Reference**: [https://rawgit.com/MrRio/jsPDF/master/docs/index.html](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) (Thư viện khởi tạo và xuất PDF Học bạ/Biên lai).
- **Cổng Thông tin Điện tử Bộ GD&ĐT**: [https://moet.gov.vn](https://moet.gov.vn) (Tra cứu quy chế, văn bản pháp luật ngành giáo dục).
