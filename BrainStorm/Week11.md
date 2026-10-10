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

- **Võ Duy Bình (PM)**: Xây dựng tiêu chí đánh giá tải và giám sát benchmark.
- **Trần Quang Vinh (Member 3)**: Phân tích Query Execution Plan (`EXPLAIN ANALYZE`) và thiết lập Composite Indexes.
- **Nguyễn Minh Quốc Bảo (Member 2)**: Cấu hình phân tầng bộ nhớ đệm Redis và kiểm thử phản hồi giao diện.
- **Trạng thái tuần 11**: Tốc độ phản hồi API danh mục giảm từ 180ms xuống dưới 15ms.
