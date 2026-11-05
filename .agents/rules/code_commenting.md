# Quy định Chú thích Mã nguồn Dự án (Code Commenting & Documentation Rule)

## 1. Nguyên Tắc Cốt Lõi
Mọi thành viên và trợ lý AI khi làm việc trên kho mã nguồn `DYBInh2k5/Phat-Trien-Du-An-Phan-Mem` bắt buộc phải kèm theo chú thích (comments) giải nghĩa chi tiết bằng tiếng Việt trong từng tệp mã nguồn.

## 2. Tiêu Chuẩn Chú Thích Cho Từng Thành Phần

### 2.1. Phân Hệ Backend (Node.js Express Clean Architecture)
- **Header đầu tệp**: Khai báo rõ vị trí tầng (Domain Entity, Use Case / Service, Interface Adapter / Controller / Repository, Framework & Drivers).
- **JSDoc**: Tất cả các hàm, phương thức của Service, Controller, Repository phải có JSDoc mô tả mục đích, `@param`, `@returns`, `@throws`.
- **Database & SQL**: Giải thích rõ mục đích từng câu truy vấn SQL, cơ chế tham số hóa `$1, $2`, ý nghĩa của các khối `BEGIN`, `COMMIT`, `ROLLBACK` trong giao dịch nguyên tử Unit of Work.
- **Nghiệp vụ học vụ**: Ghi chú rõ công thức quy đổi xếp loại học lực Tốt / Khá / Đạt / Chưa đạt theo Quy chế Thông tư 22/2021/TT-BGDĐT.

### 2.2. Phân Hệ Frontend (React 18 & Vite SPA)
- **Header đầu tệp**: Mô tả nhiệm vụ của Component, vị trí trong cây phân cấp UI (Layout, Shared, Page, Route Guard, Context).
- **Props Documentation**: Chú thích rõ ràng các thuộc tính (props) nhận vào, kiểu dữ liệu và giá trị mặc định.
- **Hooks & State**: Ghi chú mục đích của các state (`useState`), tác vụ phụ (`useEffect`), giá trị ghi nhớ (`useMemo`), hàm gọi lại (`useCallback`).
- **Phân quyền & Điều hướng**: Giải thích luồng kiểm tra quyền truy cập theo vai trò (BGH, GVCN, GVBM, PH).
- **In ấn & Trợ năng**: Ghi chú các lớp CSS phục vụ in ấn (`print:hidden`) và độ tương phản màu sắc.

### 2.3. Tệp Cấu Hình & Script Kiểm Thử
- Giải thích mục đích các biến môi trường, cổng mạng, tham số kết nối, và từng ca kiểm thử API.
