# BrainStorm Tuần 11: Tối Ưu Hóa Hiệu Năng, Indexing CSDL PostgreSQL & Chiến Lược Caching Redis

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI TUẦN 11

### 1. Mục tiêu
Hệ thống trường học có đặc thù tải đột biến vào các thời điểm cao điểm: Đầu năm học (tra cứu thời khóa biểu), kỳ thi cuối kỳ (tra cứu điểm số) và đợt nộp học phí. Mục tiêu của Tuần 11 là nghiên cứu và triển khai chiến lược tối ưu hóa hiệu năng toàn diện từ tầng Cơ sở dữ liệu đến tầng Dịch vụ bộ đệm (Caching Layer), nhằm giảm thời gian phản hồi API xuống dưới 100ms.

### 2. Các giải pháp kỹ thuật trọng tâm
1. **Tối ưu hóa Indexing trên PostgreSQL**:
   - Thiết lập chỉ mục tổng hợp (Composite Indexes) trên các trường thường xuyên `JOIN` và `WHERE`: `(class_id, academic_year)`, `(student_code, subject_code, semester)`.
   - Sử dụng partial indexes cho các học sinh đang trong trạng thái kích hoạt `status = 'ACTIVE'`.
2. **Chiến lược Bộ nhớ đệm phân tán Redis (Cache-Aside Pattern)**:
   - Cache các thông tin tĩnh/ít thay đổi: Danh mục môn học, danh mục lớp học, thông tin trường, biểu phí năm học (TTL = 24 giờ).
   - Cache bảng điểm tổng hợp học kỳ (TTL = 1 giờ, tự động xóa cache khi giáo viên thực hiện lưu điểm mới).
3. **Connection Pooling với pg-pool**: Tối ưu hóa số lượng kết nối tới CSDL từ 10 đến 20 connections đồng thời để tránh tắc nghẽn tài nguyên CPU.

---

## CHƯƠNG II. THIẾT KẾ MÃ NGUỒN VÀ TRUY VẤN TỐI ƯU

### 1. Kịch bản đánh chỉ mục trên PostgreSQL
```sql
-- Đánh chỉ mục tăng tốc tra cứu sổ điểm lớp
CREATE INDEX idx_grades_class_subject_sem 
ON grade_books(class_id, subject_id, semester);

-- Đánh chỉ mục tăng tốc lọc chuyên cần theo ngày
CREATE INDEX idx_attendance_date_class 
ON attendances(attendance_date, class_id);
```

### 2. Kịch bản Cache-Aside với Redis
```javascript
import { redisClient } from '../config/redis.js';

export async function getCachedSubjectList() {
  const cacheKey = 'subjects:active:all';
  const cachedData = await redisClient.get(cacheKey);
  
  if (cachedData) {
    return JSON.parse(cachedData); // Trả về tức thì từ RAM (< 2ms)
  }

  // Nếu Cache Miss, đọc từ PostgreSQL
  const subjects = await subjectRepository.findAllActive();
  await redisClient.setEx(cacheKey, 86400, JSON.stringify(subjects)); // Lưu cache 24h
  return subjects;
}
```

---

## CHƯƠNG III. KẾT QUẢ ĐẠT ĐƯỢC VÀ PHÂN CÔNG THỰC HIỆN

### 1. Phân công trách nhiệm
- **Võ Duy Bình (Member 1 - PM & BA)**: Xây dựng tiêu chí đánh giá tải, giám sát benchmark hiệu năng hệ thống và thẩm định chất lượng hình ảnh, trải nghiệm người dùng (UX/UI).
- **Võ Hoàng Sơn (Member 2 - Dev Frontend)**: 
  - Thay thế hình ảnh AI 3D bằng bộ ảnh nhiếp ảnh học đường thực tế, sắc nét (`school-classroom-hero.jpg` 123KB, giảm 87% dung lượng so với ảnh AI 953KB cũ).
  - Nâng cấp giao diện Danh sách học sinh (`StudentListPage.jsx`): Hỗ trợ hiển thị ảnh thẻ học sinh chân dung chất lượng cao ở cả 2 chế độ (Dạng Thẻ và Dạng Khung Ảnh Thẻ) kèm cơ chế Fallback tự động khi mất mạng.
- **Huỳnh Trung Tính (Member 3 - Dev Backend)**: 
  - Phân tích Query Execution Plan (`EXPLAIN ANALYZE`), thiết lập Composite Indexes và tối ưu Connection Pool PostgreSQL.
  - Di chuyển lược đồ CSDL: Bổ sung cột `avatar VARCHAR(255)` trong bảng `students` và nạp dữ liệu mẫu 16 ảnh chân dung học sinh thực tế.
  - Bổ sung API `GET /api/audit-logs` phục vụ Ban Giám Hiệu tra cứu lịch sử kiểm toán bảo mật.
- **Trần Quang Vinh (Member 4 - Logic Security)**: 
  - Cấu hình phân tầng bộ nhớ đệm Redis (Cache-Aside Pattern) an toàn và tối ưu hóa xử lý bất đồng bộ.
  - Củng cố cơ chế phòng thủ OWASP Top 10 Headers (nosniff, SAMEORIGIN, XSS-Protection).
- **Nguyễn Minh Quốc Bảo (Member 5 - Tester)**: 
  - Thực hiện kiểm thử tải (Load Testing), đo lường chỉ số Latency/Throughput.
  - Duy trì kiểm thử tự động đạt chuẩn tuyệt đối: **400 / 400 tests PASS (100% Xanh)**.
  - Thực thi kiểm thử trực tiếp hệ thống (Live System Testing): **19 / 19 kịch bản PASS (100%)**.

### 2. Tổng kết nghiệm thu kỹ thuật Tuần 11
- **Tối ưu hóa phản hồi API**: Tốc độ phản hồi API danh mục giảm từ 180ms xuống dưới 15ms.
- **Nâng cấp hình ảnh & UX/UI**: Loại bỏ hoàn toàn hình ảnh AI giả tạo; thay thế bằng nhiếp ảnh trường học chân thực và hệ thống ảnh thẻ học sinh chuyên nghiệp.
- **Tình trạng kiểm thử**: **400/400 Unit Tests PASS** + **19/19 Live E2E Tests PASS (100%)**.
