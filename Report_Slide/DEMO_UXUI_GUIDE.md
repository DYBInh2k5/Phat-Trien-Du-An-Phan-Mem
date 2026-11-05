# HƯỚNG DẪN DEMO CHUYÊN ĐỀ UX/UI
## Chuyên đề 1 (Tuần 2): Nghiên Cứu & Thiết Kế Giao Diện Người Dùng
### Hệ thống: HTQLLH / EduManage Pro — Đại học Hoa Sen (SW320DV01)

```
================================================================================
Vị trí tệp : Report_Slide/DEMO_UXUI_GUIDE.md
Mục đích   : Kịch bản quay video demo chuyên đề UX/UI (Tuần 2)
Thời điểm  : 30/10/2026 — Tuần 7 / 15 Tuần Học kỳ 2631
GitHub     : https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
================================================================================
```

---

## PHẦN 1: CHUẨN BỊ TRƯỚC KHI QUAY VIDEO

### 1.1 Yêu cầu tối thiểu
- Hệ thống Frontend React đang chạy tại `http://localhost:5173`
- Có thể demo offline (không cần Backend hoặc Docker) nhờ cơ chế Offline Stubs dự phòng
- Trình duyệt: Google Chrome hoặc Microsoft Edge (để dùng DevTools mô phỏng thiết bị)
- Màn hình đủ rộng để thấy Sidebar và nội dung chính đồng thời

### 1.2 Khởi động Frontend (nếu chưa chạy)
```bash
cd members\member2_Frontend
npm run dev
# => Kết quả mong đợi: "Local: http://localhost:5173/"
```

### 1.3 Bố cục màn hình khi quay video
```
+----------------------------------------------+-----------------------------+
|  TRÌNH DUYỆT (http://localhost:5173)          |  VS CODE (xem mã nguồn)    |
|  [Giao diện hệ thống HTQLLH]                  |  [LoginPage / Sidebar]     |
+----------------------------------------------+-----------------------------+
```

---

## PHẦN 2: KỊCH BẢN DEMO TỪNG TÍNH NĂNG UX/UI

---

### DEMO 2.1: Trang Đăng Nhập 5 Vai Trò + 1-Click Demo Login
**Thời lượng gợi ý: 3–4 phút**

**Vị trí mã nguồn:**
```
members/member2_Frontend/src/pages/auth/LoginPage.jsx
members/member2_Frontend/src/context/AuthContext.jsx
```

**Kịch bản tường thuật:**

> "Đây là trang đăng nhập trung tâm của hệ thống HTQLLH. Thiết kế UX đặt trọng tâm vào tốc độ trải nghiệm: hội đồng chấm thi không cần nhớ tài khoản — chỉ cần bấm vào tab vai trò và nhấn Đăng nhập nhanh."

**5 tab vai trò trên giao diện:**

| Tab | Vai trò | Tài khoản demo | Mô tả chức năng |
|:---|:---|:---|:---|
| BGH | Ban Giám Hiệu | bgh.admin / 123456 | Quản trị điều hành, phê duyệt sổ điểm toàn trường |
| GVCN | GV Chủ Nhiệm | gvcn.10a1 / 123456 | Điểm danh, duyệt đơn nghỉ, quản lý lớp 10A1 |
| GV Bộ Môn | Giáo viên | gv.an / 123456 | Nhập điểm, tính GPA, khóa sổ điểm môn Toán |
| Học Sinh | Học sinh | hs.anh / 123456 | Xem bảng điểm cá nhân, thời khóa biểu |
| Phụ Huynh | Phụ huynh | ph.anh / 123456 | Sổ liên lạc điện tử, nộp đơn xin nghỉ |

**Thao tác demo:**
1. Mở `http://localhost:5173` — trang LoginPage hiển thị 5 tab vai trò
2. Bấm lần lượt từng tab (BGH → GVCN → GV → HS → PH) — mô tả vai trò thay đổi theo từng tab
3. Bấm tab **BGH** → nhấn nút **"Đăng nhập nhanh (1-Click)"**
4. Hệ thống chuyển thẳng vào Dashboard BGH mà không cần gõ mật khẩu
5. Nói: "Tính năng 1-Click Demo Login phục vụ việc trải nghiệm nhanh, không thay thế quy trình đăng nhập thật"

---

### DEMO 2.2: Giao Diện Responsive — Thích Ứng Mọi Kích Thước Màn Hình
**Thời lượng gợi ý: 2 phút**

**Vị trí mã nguồn:**
```
members/member2_Frontend/tailwind.config.js
members/member2_Frontend/src/components/layout/MainLayout.jsx
```

**Kịch bản tường thuật:**

> "Giao diện xây dựng theo nguyên tắc Mobile-First của Tailwind CSS. Khác với WinForms chỉ chạy trên màn hình máy tính Windows, hệ thống này tự co giãn từ điện thoại 375px đến màn hình 4K."

**Thao tác demo:**
1. Đang ở màn hình đầy đủ: Sidebar hiển thị ở bên trái, nội dung chiếm phần còn lại
2. Nhấn F12 mở DevTools → bấm **Toggle Device Toolbar** (biểu tượng điện thoại)
3. Chọn **iPhone SE** (375px) — Sidebar tự động ẩn, bố cục chuyển sang layout dọc mobile
4. Chọn **iPad Air** (820px) — Sidebar thu nhỏ hoặc hiện trở lại tùy cấu hình breakpoint
5. Thoát DevTools, quay về màn hình đầy đủ
6. Nói: "Tailwind dùng các prefix `sm:`, `md:`, `lg:` để điều khiển bố cục theo từng điểm gãy màn hình"

---

### DEMO 2.3: Sidebar Động Theo Vai Trò (RBAC-Driven Navigation)
**Thời lượng gợi ý: 3 phút**

**Vị trí mã nguồn:**
```
members/member2_Frontend/src/components/layout/Sidebar.jsx
members/member2_Frontend/src/components/auth/ProtectedRoute.jsx
members/member2_Frontend/src/routes/AppRouter.jsx
```

**Kịch bản tường thuật:**

> "Sidebar không phải menu cố định. Nó đọc vai trò người dùng từ AuthContext và chỉ hiển thị các mục menu mà vai trò đó được phép truy cập."

**Thao tác demo:**
1. Đang đăng nhập **BGH** → Sidebar hiển thị đầy đủ: Dashboard, Báo cáo, Quản lý học sinh, Thời khóa biểu, Học phí
2. Đăng xuất → Đăng nhập **GV Bộ Môn** → Sidebar chỉ còn: Sổ điểm điện tử, Điểm danh
3. Đăng xuất → Đăng nhập **Học Sinh** → Sidebar chỉ còn: Bảng điểm cá nhân, Thời khóa biểu, Chuyên cần
4. Thử gõ tay URL của BGH khi đang là GV → hệ thống redirect về trang `/unauthorized` (403)
5. Nói: "ProtectedRoute so khớp `role` hiện tại với mảng `roles[]` được phép, nếu không hợp lệ sẽ chặn và chuyển hướng"

---

### DEMO 2.4: Dashboard BGH — Tổng Quan Chỉ Số KPI Giáo Dục
**Thời lượng gợi ý: 2 phút**

**Vị trí mã nguồn:**
```
members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx
members/member2_Frontend/src/pages/bgh/BGHReportCenterPage.jsx
```

**Kịch bản tường thuật:**

> "Dashboard BGH tổng hợp các chỉ số KPI: tỷ lệ chuyên cần, phổ điểm theo lớp, phân loại học lực. Hiệu trưởng nắm toàn bộ tình hình trường mà không cần mở từng sổ điểm."

**Thao tác demo:**
1. Đăng nhập vai trò **BGH**
2. Trang Dashboard hiển thị các thẻ KPI: Tổng học sinh, Tỷ lệ chuyên cần, Số học sinh Giỏi/Khá/TB/Yếu
3. Vào **Trung tâm Báo cáo** → xem bảng thống kê phân loại theo lớp và môn học
4. Nói: "Dữ liệu được kéo từ PostgreSQL thật qua RESTful API, không dùng dữ liệu cứng"

---

### DEMO 2.5: Tailwind CSS — Pure Light Theme & Thiết Kế Nhất Quán
**Thời lượng gợi ý: 2 phút**

**Vị trí mã nguồn:**
```
members/member2_Frontend/src/components/layout/Sidebar.jsx
members/member2_Frontend/src/components/layout/Header.jsx
```

**Dòng code minh họa trên VS Code:**
```jsx
// Sidebar.jsx — Utility-First CSS với Tailwind, không viết CSS thủ công
<nav className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm min-h-screen">
  <div className="p-4 border-b border-slate-100">
    <h1 className="text-lg font-bold text-blue-700">HTQLLH</h1>
    <p className="text-xs text-slate-500">Hệ thống Quản lý Lớp học</p>
  </div>
</nav>
```

**Kịch bản tường thuật:**

> "Không một dòng CSS thủ công nào được viết riêng lẻ. Tất cả class đều đến từ Tailwind — `bg-white`, `border-slate-200`, `text-blue-700`. Kết quả là giao diện trắng sáng, nhất quán trên toàn bộ 28 màn hình chức năng."

---

## PHẦN 3: THỨ TỰ QUAY VIDEO VÀ THỜI LƯỢNG

| STT | Nội dung | Thời lượng | Ghi chú |
|:---:|:---|:---:|:---|
| 1 | Giới thiệu: Tại sao chọn Web SPA thay vì WinForms | 2 phút | 3 lý do: đa nền tảng, không cài đặt, cập nhật tập trung |
| 2 | Demo 2.1: Trang đăng nhập 5 vai trò + 1-Click | 4 phút | Bấm qua 5 tab, thử 1-Click BGH |
| 3 | Demo 2.2: Responsive (DevTools) | 2 phút | Toggle Device Toolbar, iPhone SE |
| 4 | Demo 2.3: Sidebar thay đổi theo vai trò | 3 phút | Chuyển BGH → GV → HS, thử URL trái phép |
| 5 | Demo 2.4: Dashboard BGH | 2 phút | Các thẻ KPI và Trung tâm Báo cáo |
| 6 | Demo 2.5: Tailwind CSS — mã nguồn Sidebar | 2 phút | VS Code song song trình duyệt |
| 7 | Kết luận: So sánh React với Angular và Vue.js | 1 phút | Lý do chọn React 18 + Vite |

**Tổng thời lượng dự kiến: khoảng 16 phút**

---

## PHẦN 4: CÂU TRẢ LỜI NGẮN GỌN NẾU BỊ HỎI THÊM

### "Tại sao chọn Web thay vì WinForms?"
> "WinForms chỉ chạy trên Windows, yêu cầu cài đặt từng máy, không responsive. Web chạy trên mọi thiết bị, cập nhật tập trung, phụ huynh dùng điện thoại cũng xem được sổ liên lạc."

### "Tại sao chọn React thay vì Angular hay Vue.js?"
> "React có Virtual DOM tối ưu render, hệ sinh thái lớn nhất, tích hợp tốt với Vite và Tailwind. Angular yêu cầu TypeScript bắt buộc và độ phức tạp cao hơn mức cần thiết cho dự án này."

### "Tailwind CSS khác gì Bootstrap?"
> "Bootstrap cung cấp component dựng sẵn với style cố định dễ bị nhận ra. Tailwind chỉ cung cấp class tiện ích — nhóm tự thiết kế giao diện từ đầu, không bị ràng buộc bởi theme Bootstrap."

### "1-Click Demo Login có an toàn không?"
> "Đây là tính năng chỉ dành cho môi trường demo và báo cáo. Trong môi trường Production thật, chỉ giữ form đăng nhập chuẩn với mật khẩu được băm bằng bcryptjs 10 vòng muối."

---

## PHẦN 5: ĐƯỜNG DẪN MÃ NGUỒN THAM KHẢO

- **Trang đăng nhập**: [LoginPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx)
- **Khung giao diện chính**: [MainLayout.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/MainLayout.jsx)
- **Sidebar điều hướng**: [Sidebar.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/layout/Sidebar.jsx)
- **Bảo vệ tuyến đường**: [ProtectedRoute.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx)
- **Ngữ cảnh xác thực**: [AuthContext.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/context/AuthContext.jsx)
- **Cấu hình Tailwind**: [tailwind.config.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/tailwind.config.js)
- **Dashboard BGH**: [BGHDashboardPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/bgh/BGHDashboardPage.jsx)
- **Tài liệu nghiên cứu tuần 2**: [BrainStorm/Week2 UXUI .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week2%20UXUI%20.md)

---

*Tài liệu phục vụ quay video demo chuyên đề UX/UI — Môn học Phát triển Dự án Phần mềm (SW320DV01), Đại học Hoa Sen (HSU), Học kỳ 2631.*
