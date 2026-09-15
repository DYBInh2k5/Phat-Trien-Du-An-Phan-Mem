# Bảng Công Nghệ & Phân Công Nhiệm Vụ 5 Thành Viên Nhóm

Dự án **Hệ thống Quản lý Trường học (School Management System - SMS)** - Môn học **Phát triển dự án phần mềm (SW320DV01)**.

---

## 🛠️ 1. Lựa chọn Công nghệ Chính thức (Official Tech Stack)

| STT | Chuyên đề | Công nghệ Lựa chọn | Phạm vi Ứng dụng trong Dự án SMS |
| :--- | :--- | :--- | :--- |
| **1** | **UI/UX** | **Web Application** | Giao diện Web Portal đa vai trò (Admin, Teacher, Student, Parent), hỗ trợ Responsive PC & Mobile. |
| **2** | **Database** | **PostgreSQL** | Cơ sở dữ liệu quan hệ ACID quản lý Học sinh, Lớp học, Môn học, Bảng điểm, Thời khóa biểu. |
| **3** | **Architecture** | **Clean Architecture** *(3-Layer)* | Tách biệt các lớp Presentation (UI) ↔ Domain (Logic tính GPA) ↔ Infrastructure (CSDL/Store). |
| **4** | **Design Pattern** | **MVC + Repository Pattern + DI + Unit of Work** | Chuẩn hóa cấu trúc mã nguồn, trừu tượng hóa Data Access và quản lý giao dịch CSDL toàn vẹn. |
| **5** | **Export** | **Excel + PDF** | **Excel**: Bảng điểm lớp, danh sách học sinh.<br>**PDF**: Học bạ điện tử, Phiếu báo điểm, Biên lai học phí. |
| **6** | **Auth & Security** | **JWT (JSON Web Token) + CORS** | Xác thực Token mã hóa phân quyền RBAC 4 vai trò & Bảo mật chia sẻ tài nguyên CORS. |
| **7** | **Logging** | **Centralized Logging** | Ghi nhật ký lịch sử sửa điểm (Audit Log) đảm bảo tính minh bạch. |
| **8** | **Testing** | **Unit Test** | Kiểm thử các hàm logic tính toán GPA, xếp loại Học lực & Hạnh kiểm. |

---

## 👥 2. Phân Công Nhiệm Vụ 5 Thành Viên (5-Member Assignment Matrix)

| Thành viên | Phân công Vai trò (Role) | Phân hệ Phụ trách (Modules) | Thư mục Công việc trên GitHub |
| :--- | :--- | :--- | :--- |
| **Thành viên 1** *(Vũ Duy Bình - Leader)* | **Project Manager & Business Analyst (PM/BA)** | Quản lý tiến độ, SRS Requirements, UAT Test Plan, Báo cáo Tuần | [`members/member1_PM_BA/`](members/member1_PM_BA/)<br>`docs/`, `BrainStorm/` |
| **Thành viên 2** | **UI/UX & Lead Frontend Developer** | Design System (Glassmorphism, CSS Tokens), Layout Portal, Multi-Role Dashboard UI | [`members/member2_Frontend/`](members/member2_Frontend/)<br>`src/css/`, `src/index.html` |
| **Thành viên 3** | **Database Architect & Backend Dev** | Sơ đồ PostgreSQL ERD, Clean Architecture, Repository Pattern, Store & MockData | [`members/member3_Backend_DB/`](members/member3_Backend_DB/)<br>`src/js/store.js`, `src/js/mockData.js`, `database/` |
| **Thành viên 4** | **Security & Core Academic Logic Dev** | Auth JWT, Phân quyền RBAC, Thuật toán tính GPA hệ 10/4, Sổ điểm điện tử & Khóa sổ điểm | [`members/member4_Logic_Security/`](members/member4_Logic_Security/)<br>`src/js/auth.js`, `src/js/modules/gradeModule.js` |
| **Thành viên 5** | **Feature Module Dev & QA/DevOps** | Phân hệ Điểm danh, Học phí, Export Engine (Excel/PDF), Unit Testing & Audit Logging | [`members/member5_Modules_QA/`](members/member5_Modules_QA/)<br>`src/js/modules/attendanceModule.js`, `tests/` |

---

## 📂 3. Cấu trúc Thư mục Làm việc của Nhóm trên GitHub

```
PT_DA_PM/
├── members/
│   ├── member1_PM_BA/          # Thư mục làm việc của PM/BA (Vũ Duy Bình)
│   ├── member2_Frontend/       # Thư mục làm việc của Frontend Developer
│   ├── member3_Backend_DB/     # Thư mục làm việc của Backend & Database Architect
│   ├── member4_Logic_Security/ # Thư mục làm việc của Logic & Security Specialist
│   └── member5_Modules_QA/     # Thư mục làm việc của Module Specialist & QA
├── docs/                       # Tài liệu thiết kế & phân tích SRS
├── BrainStorm/                 # Nhật ký tiến độ theo từng tuần (Week1.md, Week2.md,...)
├── src/                        # Mã nguồn ứng dụng Web SMS
│   ├── css/                    # Stylesheets & Design System
│   ├── js/                     # JavaScript Modules & Logic
│   └── index.html              # Web Application Portal
├── Tech.md                     # Bảng công nghệ & Phân công nhiệm vụ nhóm
├── README.md                   # Tổng quan dự án chính
├── syllabus.md                 # Khung nội dung kỹ thuật
├── timeline.md                 # Lịch trình 8 tuần
└── resources.md                # Tài nguyên tham khảo
```
