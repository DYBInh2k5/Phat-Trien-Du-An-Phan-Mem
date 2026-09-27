# Hướng Dẫn Sử Dụng & Tài Liệu Kỹ Thuật Frontend — Hệ Thống Quản Lý Trường Học (EduManage Pro / SMS)

Thư mục mã nguồn Ứng dụng Web Frontend Single Page Application (SPA) phát triển bằng **React.js + Vite + TailwindCSS** thuộc đề tài **Hệ thống Quản lý Trường học (School Management System - SMS)** — Môn học *Phát triển dự án phần mềm (SW320DV01)* - Đại học Hoa Sen (HSU).

- **Thành viên phụ trách (Frontend Lead)**: Thành viên 2 & Võ Duy Bình (PM)
- **Công nghệ cốt lõi**: React 18, React Router v6, TailwindCSS v3, SheetJS (`xlsx`), jsPDF/Print Engine
- **Trạng thái**: **100% Hoàn thành (Release Candidate)**

---

## 1. Danh Sách 5 Vai Trò Phân Quyền & Tài Khoản Trải Nghiệm Demo

Hệ thống được thiết kế phân quyền nghiêm ngặt theo **5 Vai trò Tác nhân (5 Actors)** chuẩn SRS IEEE 830. Tại màn hình Đăng nhập (`/login`), người dùng có thể nhấp **1-Click Đăng Nhập Nhanh Demo** cho bất kỳ vai trò nào bên dưới:

| STT | Vai Trò (Actor) | Mã Role | Tài Khoản Demo | Mật Khẩu | Trang Dashboard Mặc Định | Chức Năng Chính Phụ Trách |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| 1 | **Ban Giám Hiệu** | `BGH` | `bgh.admin` | `123` | `/bgh/dashboard` | Quản trị hệ thống, duyệt khóa/mở sổ điểm toàn trường, phân công giảng dạy, xem báo cáo tổng hợp & cài đặt tài khoản. |
| 2 | **GV Chủ Nhiệm** | `GVCN` | `gvcn.10a1` | `123` | `/gvcn/dashboard` | Quản lý lớp 10A1, điểm danh hàng ngày, đánh giá Hạnh kiểm học kỳ (BR-05), duyệt đơn xin nghỉ học & nhắn tin với Phụ huynh. |
| 3 | **GV Bộ Môn** | `GV` | `gv.toan` | `123` | `/gv/dashboard` | Điểm danh theo tiết dạy, nhập điểm thành phần (Miệng, 15p, 1 tiết, GK, CK), tự động tính TBM & gửi đơn xin mở khóa sổ điểm phúc khảo. |
| 4 | **Học Sinh** | `HS` | `hs0001` | `123` | `/student/gradebook` | Tra cứu bảng điểm cá nhân, GPA hệ 10 và 4, xếp loại Học lực (Xuất sắc/Giỏi/Khá/TB/Yếu), xem thời khóa biểu, lịch thi & chuyên cần. |
| 5 | **Phụ Huynh** | `PH` | `ph.hs0001` | `123` | `/parent/dashboard` | Sổ liên lạc điện tử con em, nộp đơn xin nghỉ học trực tuyến, nhận thông báo vắng học, tra cứu & đóng học phí kèm in biên lai PDF. |

---

## 2. Chi Tiết Các Phân Hệ Chức Năng (Feature Breakdown)

### 2.1. Phân hệ Đăng Nhập & Bảo Mật (`src/pages/auth/LoginPage.jsx`)
- Giao diện 5 Tab chọn vai trò trực quan (`BGH`, `GVCN`, `GV`, `HS`, `PH`).
- Tự động điền tài khoản mẫu và hỗ trợ nút Đăng nhập Nhanh Demo 1-click.
- Bảo vệ tuyến đường (`ProtectedRoute.jsx`) tự động chuyển hướng khi truy cập trái phép (`/unauthorized`).

### 2.2. Phân hệ Quản lý Sổ Điểm Điện Tử (`src/pages/gv/GradebookPage.jsx`)
- Giao diện dạng Lưới dữ liệu (Spreadsheet) phẳng, cố định cột STT và Tên học sinh khi cuộn ngang.
- Tự động tính Điểm trung bình môn (TBM) theo đúng trọng số quy định Bộ GD&ĐT:
  $$\text{TBM} = \frac{\sum (\text{TX}) + 2 \times \text{GK} + 3 \times \text{CK}}{\text{Tổng hệ số}}$$
- Phân biệt 2 chế độ: **Chế độ Chỉnh sửa cho GV** và **Chế độ Chỉ Xem (Read-only) cho BGH**.
- Nút **Xin mở khóa / Phúc khảo**: Mở Modal đệ trình đơn xin sửa điểm gửi Ban Giám Hiệu theo quy định BR-03.

### 2.3. Phân hệ Điểm Danh & Giám Sát Chuyên Cần (`src/pages/gv/AttendancePage.jsx`)
- Hỗ trợ 2 chế độ: **Điểm danh Hàng ngày (GVCN)** và **Điểm danh Theo tiết (GVBM)**.
- Các trạng thái chuyên cần: *Có mặt, Vắng có phép, Vắng không phép, Đi trễ*.
- Cảnh báo học sinh vắng $> 20\%$ tiết học có nguy cơ cấm thi (`BGHAttendanceMonitorPage.jsx`).

### 2.4. Phân hệ Cổng GV Chủ Nhiệm (`src/pages/gv/GVCNDashboardPage.jsx`)
- Dashboard quản lý lớp 10A1 (Sĩ số 45).
- Đánh giá Hạnh kiểm học kỳ/cả năm (*Tốt, Khá, Trung bình, Yếu*) theo Thông tư 22/2021/TT-BGDĐT.
- Tiếp nhận và phê duyệt/từ chối Đơn xin nghỉ học từ Phụ huynh.

### 2.5. Phân hệ Cổng Phụ Huynh & Sổ Liên Lạc (`src/pages/communication/ParentPortalPage.jsx`)
- Tra cứu bảng điểm & Sổ liên lạc điện tử con em.
- Form nộp **Đơn Xin Nghỉ Học Trực Tuyến** gửi Giáo viên Chủ nhiệm.
- Tra cứu khoản thu học phí, nút thanh toán QR mô phỏng và **In Biên Lai Thu Học Phí (PDF)**.

### 2.6. Engine Xuất Báo Cáo Excel & PDF (`src/utils/exportEngine.js`)
- **Xuất Excel (`exportToExcel`)**: Tự động tính độ rộng cột và xuất file `.xlsx` chuẩn định dạng SheetJS.
- **Xuất PDF (`exportToPDF`)**: Tạo giao diện trang in chính thức (*SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT HSU*), hỗ trợ xem trước và in/lưu PDF.

---

## 3. Cấu Trúc Thư Mục Mã Nguồn (`src/`)

```
src/
├── api/                  # RESTful API Stubs mô phỏng (stubs.js)
├── components/           # UI Components dùng chung
│   ├── auth/            # Guard bảo vệ tuyến đường (ProtectedRoute.jsx)
│   ├── layout/          # MainLayout, Sidebar navigation, Header
│   └── shared/          # Modal, DataTable, KpiCard, StatusBadge
├── constants/            # Định nghĩa Roles (roles.js) & Routes (routes.js)
├── context/              # Quản lý Trạng thái Xác thực (AuthContext.jsx)
├── data/                 # CSDL Giả lập (mockData.js - 45 học sinh, sổ điểm, TKB, học phí)
├── pages/                # Các trang giao diện cho 5 vai trò
│   ├── auth/            # LoginPage.jsx, UnauthorizedPage.jsx
│   ├── bgh/             # BGHDashboardPage.jsx, BGHReportCenterPage.jsx, SystemSettingsPage.jsx, BGHAttendanceMonitorPage.jsx, ScheduleAdminPage.jsx
│   ├── gv/              # GVDashboardPage.jsx, GVCNDashboardPage.jsx, GradebookPage.jsx, AttendancePage.jsx
│   ├── communication/   # ParentCommunicationPage.jsx, ParentPortalPage.jsx
│   ├── schedule/        # TimetablePage.jsx
│   ├── student/         # StudentGradebookPage.jsx, StudentAttendancePage.jsx, StudentSchedulePage.jsx, StudentExamsPage.jsx
│   └── students/        # StudentListPage.jsx
├── routes/               # Bộ điều hướng tuyến đường AppRouter.jsx
└── utils/                # Tiện ích Xuất Báo cáo exportEngine.js (Excel & PDF)
```

---

## 4. Hướng Dẫn Khởi Chạy Dự Án

### Bước 1: Di chuyển vào thư mục Frontend
```bash
cd members/member2_Frontend
```

### Bước 2: Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### Bước 3: Chạy máy chủ phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc truy cập địa chỉ local: `http://localhost:5173/`.

### Bước 4: Kiểm tra đóng gói Production Bundle (Build Check)
```bash
npm run build
```
Lệnh sẽ thực thi `vite build` và kiểm tra 100% tính hợp lệ của mã nguồn mà không phát sinh bất kỳ lỗi nào.
