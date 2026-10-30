# Hướng Dẫn Demo Chuyên Đề: Xuất Báo Cáo (Export Engine)

**Tuần:** 6  
**Chủ đề:** Xuất báo cáo đa định dạng (Excel, PDF, CSV) từ sổ điểm điện tử  
**Phân công:**

| Thành viên | Vai trò |
|---|---|
| Nguyễn Minh Quốc Bảo | Tester / Phát triển chức năng Export |
| Võ Hoàng Sơn | Frontend - tích hợp giao diện xuất báo cáo |

---

## Phần 1: Chuẩn Bị

### 1.1 Môi trường cần kiểm tra trước

- Frontend đang chạy tại: `http://localhost:5173`
- Backend đang chạy tại: `http://localhost:8081`
- Đã đăng nhập với tài khoản **Giáo viên Bộ môn**: `gv.an / 123456`
- Trình duyệt đã tắt chế độ chặn tải file (download blocker)
- Có sẵn Microsoft Excel hoặc Google Sheets để mở file `.xlsx` sau khi tải

### 1.2 Tổng quan kỹ thuật Export Engine

| Định dạng | Thư viện / Kỹ thuật | Mục đích sử dụng |
|---|---|---|
| Excel (.xlsx) | SheetJS (`xlsx` v0.18.5) - xử lý phía Client | Giáo viên chỉnh sửa tiếp trên máy tính |
| PDF (in ấn) | `window.open()` + HTML template + `window.print()` | Hồ sơ học bạ pháp lý, lưu trữ chính thức |
| CSV (văn bản) | Xuất thủ công bằng chuỗi phân cách dấu phẩy | Sao lưu dữ liệu, nhập vào hệ thống khác |

**File nguồn chính:**
[exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/utils/exportEngine.js)

---

## Phần 2: Kịch Bản Demo

### Bước 1: Đăng nhập và điều hướng đến Sổ điểm (nhìn vào trình duyệt)

1. Mở trình duyệt, truy cập: `http://localhost:5173`
2. Chọn tab **Giáo viên Bộ môn**, nhấn nút đăng nhập một chạm
3. Hệ thống chuyển hướng vào giao diện chính
4. Chọn menu **Sổ điểm điện tử** → chọn lớp **10A1** → môn **Toán**

> **Ghi chú:** Lúc này màn hình hiển thị bảng điểm học sinh với cột Họ tên, Điểm miệng, Điểm 15 phút, Điểm 1 tiết, Điểm cuối kỳ, Điểm trung bình.

### Bước 2: Xuất file Excel (nhìn vào trình duyệt và thư mục Downloads)

Nhấn nút **"Xuất Excel"** trên giao diện `GradebookPage.jsx`.

Trình duyệt sẽ tự động tải xuống file `.xlsx`. Tên file theo định dạng:

```
SoDiem_10A1_Toan_2026-10-30.xlsx
```

Mở file vừa tải trong Microsoft Excel hoặc Google Sheets để kiểm tra:
- Hàng đầu là tiêu đề cột (Header) được tô đậm
- Độ rộng cột tự động khớp với nội dung (auto-fit)
- Font chữ hỗ trợ tiếng Việt đầy đủ

### Bước 3: Giải thích hàm exportToExcel trong VS Code (nhìn vào VS Code)

Mở file `src/utils/exportEngine.js`, chỉ ra hàm đầu tiên:

```javascript
// src/utils/exportEngine.js
// Mục đích: Cung cấp 2 hàm xuất báo cáo - Excel và PDF
// Vị trí: Tầng Utilities (Frontend) - xử lý hoàn toàn phía trình duyệt (Client-side)
// Thư viện: SheetJS (xlsx v0.18.5) cho Excel, window.print() cho PDF
// Tác giả: Nguyễn Minh Quốc Bảo | Ngày tạo: 2026

import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu ra file Excel (.xlsx).
 * Toàn bộ quá trình xử lý diễn ra trên trình duyệt, không cần gửi dữ liệu lên server.
 *
 * @param {string} filename  - Tên file xuất ra (không cần đuôi .xlsx)
 * @param {string} sheetName - Tên sheet trong file Excel
 * @param {Array}  headers   - Mảng tên cột tiêu đề, ví dụ: ['Họ tên', 'Điểm TB']
 * @param {Array}  rows      - Mảng các dòng dữ liệu, mỗi dòng là một mảng giá trị
 */
export function exportToExcel(filename, sheetName, headers, rows) {
  // Ghép hàng tiêu đề và các dòng dữ liệu thành mảng 2 chiều (Array of Arrays)
  const data = [headers, ...rows];

  // Chuyển mảng 2 chiều thành đối tượng Sheet của SheetJS
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Tính toán độ rộng từng cột dựa trên độ dài nội dung dài nhất trong cột đó
  const colWidths = headers.map((header, colIndex) => {
    const maxLen = Math.max(
      header.length,
      ...rows.map(row => String(row[colIndex] ?? '').length)
    );
    // wch: width in characters (đơn vị ký tự của SheetJS)
    return { wch: maxLen + 4 };
  });
  worksheet['!cols'] = colWidths;

  // Tạo Workbook và gắn Sheet vào
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Kích hoạt trình duyệt tải file xuống
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
```

> **Ghi chú cho người trình bày:** Nhấn mạnh dòng `XLSX.utils.aoa_to_sheet` - "aoa" là viết tắt của "Array of Arrays". Đây là cách SheetJS nhận dữ liệu đầu vào.

### Bước 4: Xuất PDF / In báo cáo (nhìn vào trình duyệt)

Nhấn nút **"Xuất PDF / In báo cáo"** trên giao diện. Một cửa sổ mới mở ra với giao diện in ấn chuyên nghiệp, bao gồm:

- **Header:** `SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT HSU`
- Tiêu đề báo cáo, tên lớp, môn học
- Ngày xuất tự động: hiển thị ngày hiện tại theo định dạng tiếng Việt
- Bảng điểm đầy đủ

Nhấn **Ctrl + P** để mở hộp thoại Print Preview của trình duyệt.

### Bước 5: Giải thích hàm exportToPDF trong VS Code (nhìn vào VS Code)

```javascript
/**
 * Xuất báo cáo dạng PDF thông qua cơ chế in của trình duyệt.
 * Tạo một cửa sổ mới chứa HTML được định dạng sẵn, sau đó gọi window.print().
 * Hỗ trợ font Unicode tiếng Việt (UTF-8).
 *
 * @param {string} title    - Tiêu đề chính của báo cáo
 * @param {string} subtitle - Tiêu đề phụ (tên lớp, môn học)
 * @param {Array}  headers  - Mảng tên cột tiêu đề
 * @param {Array}  rows     - Mảng các dòng dữ liệu
 */
export function exportToPDF(title, subtitle, headers, rows) {
  // Ngày xuất tự động theo định dạng tiếng Việt: ngày/tháng/năm
  const exportDate = new Date().toLocaleDateString('vi-VN');

  // Tạo chuỗi HTML cho các hàng dữ liệu trong bảng
  const tableRows = rows
    .map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`)
    .join('');

  // Template HTML hoàn chỉnh với CSS nội tuyến để đảm bảo hiển thị đúng khi in
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body        { font-family: 'Times New Roman', Times, serif; font-size: 13px; }
        .school-header { text-align: center; font-weight: bold; margin-bottom: 8px; }
        table       { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td      { border: 1px solid #333; padding: 6px 10px; text-align: center; }
        th          { background-color: #f0f0f0; font-weight: bold; }
        .footer     { margin-top: 12px; font-size: 12px; color: #555; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="school-header">
        SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT HSU
      </div>
      <div class="school-header">${title}</div>
      <div>${subtitle} | Ngày xuất: ${exportDate}</div>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Tài liệu được tạo tự động bởi Hệ thống Quản lý Học tập HTQLLH</div>
    </body>
    </html>
  `;

  // Mở cửa sổ mới, ghi nội dung HTML vào và kích hoạt lệnh in
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
```

> **Ghi chú cho người trình bày:** Giải thích `@media print { .no-print { display: none; } }` - các nút bấm sẽ bị ẩn đi khi in thực tế.

---

## Phần 3: Thứ Tự Quay Video và Thời Lượng

| Thứ tự | Nội dung | Người thực hiện | Thời lượng |
|---|---|---|---|
| 1 | Giới thiệu tổng quan 3 định dạng xuất | Nguyễn Minh Quốc Bảo | 30 giây |
| 2 | Đăng nhập và điều hướng vào Sổ điểm 10A1 Toán | Võ Hoàng Sơn | 30 giây |
| 3 | Nhấn "Xuất Excel" - file tải xuống tự động | Nguyễn Minh Quốc Bảo | 30 giây |
| 4 | Mở file .xlsx trong Excel - kiểm tra dữ liệu | Nguyễn Minh Quốc Bảo | 45 giây |
| 5 | VS Code - giải thích `exportToExcel()` và SheetJS | Nguyễn Minh Quốc Bảo | 90 giây |
| 6 | Nhấn "Xuất PDF" - cửa sổ in mở ra | Võ Hoàng Sơn | 30 giây |
| 7 | Ctrl+P - Print Preview với header trường học | Võ Hoàng Sơn | 30 giây |
| 8 | VS Code - giải thích `exportToPDF()` và HTML template | Nguyễn Minh Quốc Bảo | 90 giây |
| **Tổng** | | | **~6 phút** |

---

## Phần 4: Câu Hỏi Thường Gặp

**Câu 1: Tại sao không xử lý xuất Excel trên Backend (Node.js) mà lại xử lý trên Client?**

> Xử lý phía Client (trình duyệt) giảm tải cho máy chủ. Với SheetJS, dữ liệu đã có sẵn trên trình duyệt sau khi tải từ API, không cần gửi lại lên server để tạo file. Điều này giảm độ trễ và tiết kiệm băng thông.

**Câu 2: Vì sao chọn SheetJS mà không dùng thư viện khác?**

> SheetJS (xlsx) là thư viện phổ biến nhất cho việc xử lý file Excel trong môi trường JavaScript, hỗ trợ đầy đủ định dạng `.xlsx` (Office Open XML), hoạt động hoàn toàn phía Client, không cần server, và có tài liệu đầy đủ.

**Câu 3: PDF xuất ra có phải là file .pdf thực sự không?**

> Không hoàn toàn. Kỹ thuật sử dụng là `window.print()` của trình duyệt. Khi người dùng chọn "Lưu thành PDF" trong hộp thoại in, hệ điều hành tạo ra file PDF. Đây là cách tiếp cận đơn giản, không cần thư viện nặng như `pdfmake` hay `jsPDF`, vẫn đảm bảo chất lượng in ấn.

**Câu 4: Auto-fit column width trong Excel hoạt động như thế nào?**

> Hàm `exportToExcel` duyệt qua tất cả các ô trong từng cột để tìm chuỗi dài nhất, sau đó gán thuộc tính `wch` (width in characters) cho mảng `!cols` của SheetJS. SheetJS sẽ áp dụng độ rộng này khi tạo file `.xlsx`.

---

## Phần 5: Đường Dẫn Mã Nguồn

| File | Đường dẫn |
|---|---|
| Export Engine | [exportEngine.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/utils/exportEngine.js) |
| Trang Sổ điểm | [GradebookPage.jsx](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/GradebookPage.jsx) |
| Frontend root | [member2_Frontend/](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/) |
