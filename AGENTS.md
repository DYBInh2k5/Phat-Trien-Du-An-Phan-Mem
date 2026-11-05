# Quy định Cập nhật Dự án Hàng tuần (Weekly Project Rule)

- Khi làm việc theo từng tuần, luôn tạo tệp tiến độ mới trong thư mục `BrainStorm/` (`Week1.md`, `Week2.md`, `Week3.md`,..., `Week8.md`).
- Đồng bộ thông tin hoàn thành vào `timeline.md` và `README.md`.
- Đảm bảo commit và push code/tài liệu lên GitHub repository `DYBInh2k5/Phat-Trien-Du-An-Phan-Mem` sau mỗi tuần hoàn thành.

# Quy định Bắt buộc Chú thích Mã nguồn (Code Commenting & Documentation Rule)

- BẮT BUỘC: Khi tạo mới hoặc chỉnh sửa bất kỳ tệp mã nguồn nào (Frontend, Backend, Script kiểm thử, CSDL), PHẢI kèm theo ghi chú (comments) giải thích chi tiết, rõ ràng bằng tiếng Việt.
- Nội dung chú thích bao gồm:
  1. Header đầu tệp: Mục đích tệp, vị trí trong kiến trúc (Clean Architecture / React Layout / Database Layer), tác giả và ngày tạo/cập nhật.
  2. JSDoc chuẩn cho từng hàm, phương thức, lớp: Ý nghĩa nghiệp vụ, tham số đầu vào (`@param`), kết quả trả về (`@returns`), các lỗi/ngoại lệ có thể xảy ra (`@throws`).
  3. Chú thích nội dòng (Inline comments): Giải thích các thuật toán phức tạp, công thức tính điểm Thông tư 22, câu truy vấn SQL tham số hóa ($1, $2), giao dịch Unit of Work, phân quyền RBAC, cơ chế hook React, State và Side Effects.
  4. Tuyệt đối KHÔNG viết mã nguồn trần mà thiếu tài liệu chú thích giải nghĩa.
