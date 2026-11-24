# Hướng Dẫn Chi Tiết Kết Nối Plugin, Extension & Nền Tảng Đám Mây

Dự án: **Hệ thống Quản lý Lớp học & Học vụ THPT (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** — Đại học Hoa Sen (HSU)  
Chủ nhiệm đề tài / PM: **Võ Duy Bình (DYBInh2k5)**  
Ngày cập nhật: **24/11/2026**

---

## 1. TỔNG QUAN HỆ SINH THÁI CÔNG CỤ & KẾT NỐI (ECOSYSTEM OVERVIEW)

Hệ thống HTQLLH được thiết kế để vận hành linh hoạt trên cả **môi trường cục bộ (Local / Docker)** lẫn **môi trường đám mây thực tế (Cloud Serverless Production)**. Để lập trình viên, ban giám khảo và người dùng có thể phát triển, kiểm thử, giám sát và vận hành hệ thống một cách tối ưu, dưới đây là danh mục chi tiết các **VS Code Extensions**, **AI & MCP Plugins**, cùng các **Cloud Services** cần kết nối.

```
+-----------------------------------------------------------------------------------+
|                        HỆ SINH THÁI HTQLLH / EDUMANAGE PRO                        |
+-----------------------------------------------------------------------------------+
|  [VS Code Extensions]    |  [Cloud Platforms]       |  [AI MCP Plugins]          |
|  - PostgreSQL Client     |  - Vercel (Frontend SPA) |  - Vercel CLI Plugin       |
|  - Thunder Client        |  - Vercel (Backend API)  |  - Neon PostgreSQL Plugin  |
|  - Docker Desktop Ext    |  - Neon PostgreSQL Cloud |  - Trello MCP Plugin       |
|  - ESLint & Tailwind CSS |  - GitHub & Bitbucket    |  - Canva Design Plugin     |
|                          |  - Jira, ClickUp, Trello |  - Chrome DevTools Plugin  |
+-----------------------------------------------------------------------------------+
```

---

## 2. DANH MỤC EXTENSION TRÊN VISUAL STUDIO CODE (IDE EXTENSIONS)

Khi mở mã nguồn dự án trong **VS Code** hoặc **Cursor IDE**, lập trình viên nên cài đặt các tiện ích mở rộng sau:

### 2.1. PostgreSQL Client Extension
- **Mã Extension:** `ckolkman.vscode-postgres` hoặc `mtxr.sqltools`
- **Mục đích:** Kết nối trực tiếp vào CSDL PostgreSQL (cả Local Docker cổng `5434` lẫn Neon Cloud Serverless) để duyệt bảng, kiểm tra dữ liệu và chạy truy vấn SQL mà không cần cài đặt thêm DBeaver hay pgAdmin nặng máy.
- **Cấu hình kết nối Neon Cloud:**
  - **Host:** `ep-wispy-rain-be6an41h-pooler.c-9.us-east-2.aws.neon.tech`
  - **Database:** `neondb`
  - **User:** `neondb_owner`
  - **Port:** `5432`
  - **SSL Mode:** `Require`
  - **Connection String:**
    ```text
    postgresql://neondb_owner:npg_rgyP6vbZsR7U@ep-wispy-rain-be6an41h-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```

### 2.2. Thunder Client (hoặc Postman for VS Code)
- **Mã Extension:** `rangav.vscode-thunder-client`
- **Mục đích:** Thực thi và kiểm thử trực tiếp 100% các endpoint RESTful API ngay trong IDE mà không cần mở ứng dụng ngoài.
- **Bộ dữ liệu đã cấu hình sẵn trong dự án:**
  - Collection Core: `docs/HTQLLH_ThunderClient_Part1_Core.json`
  - Collection Services: `docs/HTQLLH_ThunderClient_Part2_Services.json`
  - Môi trường biến (Environment): `docs/HTQLLH_ThunderClient_Environment.json`
  - Biến URL cơ sở:
    - **Local:** `http://localhost:8081/api`
    - **Cloud Production:** `https://htqllh-backend.vercel.app/api`

### 2.3. Docker Extension
- **Mã Extension:** `ms-azuretools.vscode-docker`
- **Mục đích:** Xem cây tiến trình, logs thời gian thực, quản lý và khởi động nhanh cụm container:
  - `htqllh_postgres` (CSDL quan hệ PostgreSQL)
  - `htqllh_backend` (Express.js Backend API)
  - `htqllh_frontend` (Nginx React Web App)

### 2.4. Tailwind CSS IntelliSense & ESLint
- **Mã Extension:** `bradlc.vscode-tailwindcss`, `dbaeumer.vscode-eslint`
- **Mục đích:** Tự động hoàn thiện cú pháp utility classes, cảnh báo lỗi mã nguồn JavaScript/JSX theo chuẩn Airbnb / Clean Code.

---

## 3. DANH MỤC NỀN TẢNG ĐÁM MÂY (CLOUD PLATFORMS & SERVICES)

Hệ thống HTQLLH chính thức được triển khai trên 3 trụ cột đám mây:

### 3.1. Vercel Serverless Hosting
- **Tài khoản chủ sở hữu:** `dybinh2k5`
- **Dự án 1 (Frontend SPA):**
  - **Tên dự án:** `htqllh-frontend`
  - **URL Trực Tuyến:** [https://htqllh-frontend.vercel.app](https://htqllh-frontend.vercel.app)
  - **Thư mục gốc:** `members/member2_Frontend`
  - **Biến môi trường:** `VITE_API_BASE_URL=https://htqllh-backend.vercel.app/api`
- **Dự án 2 (Backend RESTful API):**
  - **Tên dự án:** `htqllh-backend`
  - **URL Trực Tuyến:** [https://htqllh-backend.vercel.app](https://htqllh-backend.vercel.app)
  - **Thư mục gốc:** `members/member3_Backend_DB/school-management-nodejs`
  - **Biến môi trường:**
    - `DATABASE_URL=postgresql://neondb_owner:npg_rgyP6vbZsR7U@ep-wispy-rain-be6an41h-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require`
    - `JWT_SECRET=htqllh_super_secret_jwt_key_2026_school_management_production`
    - `FRONTEND_URL=https://htqllh-frontend.vercel.app`
    - `NODE_ENV=production`

### 3.2. Neon PostgreSQL Serverless Cloud Database
- **Tổ chức:** `org-soft-night-29973884`
- **Mã dự án:** `mute-forest-60091582` (Tên: `HTQLLH`)
- **Phân nhánh mặc định:** `production` (`br-shiny-waterfall-be...`)
- **Vùng máy chủ (Region):** AWS US East 2 (Ohio)
- **Phiên bản:** PostgreSQL 18.7
- **Số bảng dữ liệu:** 18/18 bảng chuẩn 3NF
- **Số lượng tài khoản đã nạp:** 53 tài khoản RBAC, 16 học sinh chuẩn, 5 lớp THPT

### 3.3. Dual-Remote Git Repositories
- **GitHub Repository:** [https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem](https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem)
- **Bitbucket Repository:** [https://bitbucket.org/codyisme27205/pt_da_pm](https://bitbucket.org/codyisme27205/pt_da_pm)
- **Cơ chế:** Đã cấu hình Dual Push URL trên nhánh `main`. Mỗi lệnh `git push` tự động đẩy mã nguồn đến cả 2 máy chủ git.

---

## 4. DANH MỤC PLUGIN TRÍ TUỆ NHÂN TẠO & GIAO THỨC BỐI CẢNH (AI & MCP PLUGINS)

Hệ thống hỗ trợ các Model Context Protocol (MCP) Plugins cho phép trợ lý AI tương tác với các công cụ nghiệp vụ:

| Tên Plugin | Trạng Thái | Vai Trò & Tác Vụ Cụ Thể Trong Dự Án |
| :--- | :---: | :--- |
| **Vercel CLI / MCP** | 🟢 Đang hoạt động | Quản lý triển khai đám mây, nạp biến môi trường và alias domain production. |
| **Neon Cloud Database** | 🟢 Đang hoạt động | Kết nối, khởi tạo cấu trúc DDL, nạp dữ liệu mẫu và chạy truy vấn tham số hóa. |
| **Trello MCP (`trello_trello`)** | 🟢 Đang hoạt động | Đồng bộ toàn diện 30 thẻ PBI (150 SP) lên Trello Kanban Board: [https://trello.com/b/gkdRNT57](https://trello.com/b/gkdRNT57/htqllh-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-l%E1%BB%9Bp-h%E1%BB%8Dc-h%E1%BB%8Dc-v%E1%BB%A5-edumanage-pro). |
| **Canva MCP (`canva_canva`)** | 🟢 Đã tích hợp | Đồng bộ và chỉnh sửa trực tiếp nội dung bộ slide thuyết trình cuối kỳ (`DAHZQ9j_ouU`). |
| **Chrome DevTools MCP** | 🟢 Đang hoạt động | Tự động hóa kiểm thử trình duyệt, chụp ảnh màn hình giao diện, audit Lighthouse. |
| **Stitch MCP** | 🟢 Đang hoạt động | Sinh mã bố cục giao diện và xuất tài liệu thiết kế. |
| **ClickUp Plugin (`clickup_clickup`)** | 🟢 Đã đồng bộ | Quản lý 30 tasks / PBIs trên không gian dự án ClickUp (Space Group 2_PTDAPM). |
| **Jira Cloud Plugin** | 🟢 Đã đồng bộ | Quản lý thẻ công việc trên Jira Kanban Board (KAN-112 -> KAN-141). |
| **Postman MCP (`postman_postman`)** | 🟡 Tùy chọn | Chạy kiểm thử tự động toàn bộ API Collection và kiểm tra tính tuân thủ hợp đồng giao tiếp. |

---

## 5. TẠI SAO CÁC PLUGIN OAUTH YÊU CẦU ĐĂNG NHẬP LẠI VÀ CÁCH XỬ LÝ

- **Bản chất kỹ thuật:** Các plugin của bên thứ ba (Notion, ClickUp, Canva, Figma) sử dụng chuẩn xác thực **OAuth 2.0**. Để bảo vệ tài khoản người dùng, các Access Token đều có thời gian sống hữu hạn (Token Time-to-Live). Sau một khoảng thời gian không tương tác hoặc khi khởi động phiên làm việc mới, Antigravity sẽ yêu cầu người dùng xác nhận đăng nhập lại để đảm bảo tính an toàn.
- **Tính độc lập của hệ thống:** Dự án HTQLLH **hoàn toàn không bị phụ thuộc** vào việc các plugin này có kết nối hay không. Mã nguồn, CSDL đám mây, API và giao diện Web đều đã được triển khai độc lập trên Vercel và Neon. Bạn chỉ cần bấm kết nối lại plugin khi có nhu cầu sử dụng AI để thao tác trực tiếp trên các nền tảng đó.

---

## 6. HƯỚNG DẪN KIỂM THỬ VẬN HÀNH NHANH (QUICK SMOKE TEST)

1. Mở trình duyệt và truy cập: **[https://htqllh-frontend.vercel.app](https://htqllh-frontend.vercel.app)**
2. Nhấn vào mục **"Tài khoản thử nghiệm" (1-Click Demo Accounts)** ở góc dưới form đăng nhập.
3. Chọn một trong các vai trò muốn trải nghiệm:
   - **Ban Giám Hiệu:** `admin` hoặc `bgh.admin` (Mật khẩu: `123456`)
   - **GV Chủ Nhiệm (10A1):** `gvcn.10a1` (Mật khẩu: `123456`)
   - **GV Bộ Môn:** `gv.an` (Mật khẩu: `123456`)
   - **Học Sinh:** `hs.anh` (Mật khẩu: `123456`)
   - **Phụ Huynh:** `ph.hs0001` (Mật khẩu: `123456`)
4. Bấm **"Đăng Nhập"** ➔ Hệ thống lập tức nhận diện vai trò từ Neon Database và điều hướng thẳng vào Dashboard học vụ tương ứng!
