# Đặc Tả Kỹ Thuật RESTful API (API Specification Document)

Hệ thống: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & Lead BA: **Võ Duy Bình (PM / Lead BA)**  
Backend Architect: **Trần Quang Vinh (Member 3)**  

---

## 1. QUY CHUẨN THIẾT KẾ API (GENERAL CONVENTIONS)

- **Base URL**: `http://localhost:8081/api`
- **Định dạng dữ liệu**: `JSON (application/json)`
- **Mã hóa ký tự**: `UTF-8`
- **Cơ chế xác thực**: `JSON Web Token (JWT)` gửi qua Header: `Authorization: Bearer <token>`
- **Chuẩn mã phản hồi HTTP**:
  - `200 OK`: Thực thi thành công và trả về dữ liệu.
  - `201 Created`: Tạo mới tài nguyên thành công.
  - `400 Bad Request`: Dữ liệu gửi lên không hợp lệ.
  - `401 Unauthorized`: Chưa xác thực hoặc Token hết hạn.
  - `403 Forbidden`: Người dùng không có quyền truy cập vào endpoint này.
  - `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
  - `500 Internal Server Error`: Lỗi xử lý nội bộ phía máy chủ.

---

## 2. PHÂN HỆ XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & USER APIs)

### 2.1. Đăng nhập hệ thống (User Login)
- **Endpoint**: `POST /api/auth/login`
- **Quyền hạn**: Mọi người dùng (Public)
- **Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "Thầy Hiệu Trưởng - Nguyễn Văn An",
      "role": "ROLE_ADMIN",
      "email": "bgh@truonghoc.edu.vn"
    }
  }
}
```

### 2.2. Lấy thông tin người dùng hiện tại (Get Current Profile)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "ROLE_ADMIN"
  }
}
```

---

## 3. PHÂN HỆ QUẢN LÝ HỌC SINH & LỚP HỌC (STUDENT & CLASS APIs)

### 3.1. Danh sách học sinh toàn trường / theo lớp (Get Student List)
- **Endpoint**: `GET /api/students`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?classId=10A1&page=1&limit=20`
- **Quyền hạn**: `ROLE_ADMIN`, `ROLE_HOMEROOM_TEACHER`, `ROLE_SUBJECT_TEACHER`
- **Response 200 OK**:
```json
{
  "success": true,
  "total": 40,
  "data": [
    {
      "studentCode": "HS001",
      "fullName": "Nguyễn Thị Ánh",
      "gender": "Nữ",
      "dob": "2010-05-15",
      "className": "10A1",
      "parentPhone": "0901234567",
      "status": "Đang theo học"
    }
  ]
}
```

---

## 4. PHÂN HỆ SỔ ĐIỂM & ĐÁNH GIÁ HỌC LỰC (GRADEBOOK APIs)

### 4.1. Lấy bảng điểm của lớp theo môn học (Get Gradebook by Class & Subject)
- **Endpoint**: `GET /api/gradebook`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?classId=10A1&subjectCode=TOAN&semester=HK1`
- **Quyền hạn**: `ROLE_ADMIN`, `ROLE_HOMEROOM_TEACHER`, `ROLE_SUBJECT_TEACHER`
- **Response 200 OK**:
```json
{
  "success": true,
  "className": "10A1",
  "subjectName": "Toán Học",
  "semester": "Học kỳ 1",
  "isLocked": false,
  "data": [
    {
      "studentCode": "HS001",
      "fullName": "Nguyễn Thị Ánh",
      "scoreOral": 8.0,
      "score15min": 9.0,
      "score1period": 8.0,
      "scoreMidterm": 8.5,
      "scoreFinal": 9.0,
      "scoreTbm": 8.7,
      "academicRank": "Giỏi"
    }
  ]
}
```

### 4.2. Cập nhật điểm thành phần học sinh (Update Student Grades)
- **Endpoint**: `PUT /api/gradebook/save`
- **Headers**: `Authorization: Bearer <token>`
- **Quyền hạn**: `ROLE_ADMIN`, `ROLE_SUBJECT_TEACHER`
- **Request Body**:
```json
{
  "classId": "10A1",
  "subjectCode": "TOAN",
  "studentCode": "HS001",
  "grades": {
    "scoreOral": 9.0,
    "score15min": 9.5,
    "score1period": 8.5,
    "scoreMidterm": 9.0,
    "scoreFinal": 9.0
  }
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Cập nhật điểm thành công và ghi nhận nhật ký kiểm toán!",
  "data": {
    "scoreTbm": 9.0,
    "academicRank": "Xuất sắc"
  }
}
```

### 4.3. Khóa / Mở khóa sổ điểm học kỳ (Lock / Unlock Gradebook)
- **Endpoint**: `POST /api/gradebook/lock`
- **Headers**: `Authorization: Bearer <token>`
- **Quyền hạn**: Chỉ dành riêng cho `ROLE_ADMIN`
- **Request Body**:
```json
{
  "semester": "HK1",
  "year": "2026-2027",
  "isLocked": true
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Đã chốt sổ điểm Học kỳ 1 niên khóa 2026-2027 sang trạng thái Đóng băng!"
}
```

---

## 5. PHÂN HỆ ĐIỂM DANH & CHUYÊN CẦN (ATTENDANCE APIs)

### 5.1. Điểm danh theo ngày (Submit Daily Attendance)
- **Endpoint**: `POST /api/attendance`
- **Headers**: `Authorization: Bearer <token>`
- **Quyền hạn**: `ROLE_ADMIN`, `ROLE_HOMEROOM_TEACHER`
- **Request Body**:
```json
{
  "classId": "10A1",
  "date": "2026-10-10",
  "records": [
    { "studentCode": "HS001", "status": "PRESENT", "note": "" },
    { "studentCode": "HS002", "status": "ABSENT_EXCUSED", "note": "Gia đình có việc bận" },
    { "studentCode": "HS003", "status": "ABSENT_UNEXCUSED", "note": "Không phép" }
  ]
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Lưu bảng điểm danh lớp 10A1 ngày 2026-10-10 thành công!"
}
```

---

## 6. PHÂN HỆ NHẬT KÝ KIỂM TOÁN HỆ THỐNG (AUDIT LOGGING APIs)

### 6.1. Tra cứu vết sửa đổi dữ liệu (Get Audit Logs)
- **Endpoint**: `GET /api/audit-logs`
- **Headers**: `Authorization: Bearer <token>`
- **Quyền hạn**: Chỉ dành riêng cho `ROLE_ADMIN`
- **Query Params**: `?action=GRADE_UPDATE&user=gv_toan&limit=50`
- **Response 200 OK**:
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 104,
      "timestamp": "2026-10-10T10:15:30.123Z",
      "user": "gv_toan",
      "role": "ROLE_SUBJECT_TEACHER",
      "action": "GRADE_UPDATE",
      "entity": "GradeBook",
      "entityId": "HS001_TOAN",
      "previousValue": "8.0",
      "newValue": "9.0",
      "ipAddress": "192.168.1.15"
    }
  ]
}
```
