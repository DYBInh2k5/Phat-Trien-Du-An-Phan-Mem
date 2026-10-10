# BrainStorm Tuần 10: Tích Hợp Hệ Thống, Kiểm Thử Bảo Mật & Phòng Thủ Lỗ Hổng OWASP (Security Hardening)

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI TUẦN 10

### 1. Mục tiêu
Sau khi hoàn thành bộ kiểm thử đơn vị và các phân hệ xuất báo cáo, Tuần 10 tập trung vào việc ghép nối hoàn chỉnh các thành phần (Frontend SPA, Backend API, PostgreSQL, Redis) và tiến hành thẩm định an ninh mạng chuyên sâu. Đảm bảo toàn bộ hệ thống triệt tiêu các lỗ hổng bảo mật Web phổ biến theo tiêu chuẩn OWASP Top 10.

### 2. Các trọng tâm kỹ thuật
1. **Kiểm thử ranh giới phân quyền (Privilege Escalation Testing)**: Đảm bảo học sinh và phụ huynh tuyệt đối không thể gọi trực tiếp API sửa điểm bằng công cụ bên ngoài (Postman/cURL).
2. **Cơ chế Rate Limiting chống Brute Force**: Giới hạn tối đa 5 lần đăng nhập sai liên tiếp trong vòng 15 phút cho mỗi địa chỉ IP.
3. **Lọc dữ liệu đầu vào chống SQL Injection & XSS**: Sử dụng Prepared Statements và thư viện làm sạch chuỗi (DOMPurify/Sanitizer).
4. **Bảo mật Header với Helmet**: Tích hợp các Header an ninh HTTP như Content-Security-Policy (CSP), X-Frame-Options, Strict-Transport-Security.

---

## CHƯƠNG II. KỊCH BẢN PHÒNG THỦ & MÃ NGUỒN TRIỂN KHAI

### 1. Triển khai Rate Limiting trên Express Backend
```javascript
import rateLimit from 'express-rate-limit';

// Giới hạn tần suất gọi API Đăng nhập
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử
  message: {
    success: false,
    message: 'Tài khoản hoặc IP này đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 2. Sơ đồ Ma trận Phòng thủ Đa tầng (Defense-in-Depth)
1. **Tầng 1 (Network/Edge)**: Reverse Proxy Nginx / Cloudflare kiểm tra TLS 1.3 và chặn DDoS cơ bản.
2. **Tầng 2 (Application Gateway)**: Helmet Middleware & Strict CORS Policy chỉ cho phép tên miền trường học.
3. **Tầng 3 (Authentication Middleware)**: Xác thực chữ ký số JWT và kiểm tra thời hạn sống của token.
4. **Tầng 4 (Authorization Middleware)**: RBAC Middleware đối chiếu danh sách quyền với Role Claim trong payload.
5. **Tầng 5 (Data Layer)**: PostgreSQL Parameterized Queries ngăn chặn 100% SQL Injection.

---

## CHƯƠNG III. KẾT QUẢ ĐẠT ĐƯỢC VÀ PHÂN CÔNG THỰC HIỆN

- **Võ Duy Bình (PM)**: Giám sát kế hoạch rà soát lỗ hổng và phê duyệt tài liệu an ninh.
- **Võ Hoàng Sơn (Member 4)**: Cấu hình Rate Limiting, Helmet và kiểm tra tấn công thử nghiệm (Penetration Testing).
- **Trần Quang Vinh (Member 3)**: Kiểm tra toàn bộ câu truy vấn CSDL để đảm bảo 100% Prepared Statements.
- **Trạng thái tuần 10**: Đã nghiệm thu và sẵn sàng bước sang giai đoạn tối ưu hóa hiệu năng.
