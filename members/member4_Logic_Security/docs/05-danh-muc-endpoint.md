# 5. Danh mục endpoint

[← RESTful API](04-restful-api.md) · [Mục lục](README.md) · [Tiếp: Xác thực và phân quyền →](06-xac-thuc-phan-quyen.md)

Tiền tố chung: `http://localhost:3000/api/v1`. Mọi body là JSON. Ký hiệu quyền:
**A** = ADMIN, **T** = TEACHER, **S** = STUDENT, **P** = PARENT, 🔒 = có kiểm tra **quyền sở hữu** trong service
(GVCN chỉ lớp mình, học sinh chỉ mình, phụ huynh chỉ con mình).

## 5.1. Bảng tổng hợp

| Method | Path                               | Quyền (permission)             | Mô tả ngắn                             |
| ------ | ---------------------------------- | ------------------------------ | -------------------------------------- |
| GET    | `/health` (không có `/api/v1`)     | Public                         | Server + DB còn sống                   |
| POST   | `/auth/login`                      | Public, rate limit             | Đăng nhập                              |
| POST   | `/auth/refresh`                    | Public, rate limit             | Đổi refresh token lấy cặp token mới    |
| POST   | `/auth/logout`                     | Đăng nhập                      | Thu hồi phiên hiện tại                 |
| POST   | `/auth/logout-all`                 | Đăng nhập                      | Thu hồi mọi phiên của mình             |
| GET    | `/auth/me`                         | Đăng nhập                      | Thông tin mình + liên kết học sinh/lớp |
| PUT    | `/auth/password`                   | Đăng nhập, rate limit          | Tự đổi mật khẩu                        |
| POST   | `/auth/switch-role`                | Đăng nhập (A cho impersonate)  | Chuyển vai trò / đăng nhập thay        |
| POST   | `/auth/switch-back`                | Đang impersonate               | Quay về tài khoản gốc                  |
| POST   | `/users`                           | A (`user:manage`)              | Cấp tài khoản                          |
| GET    | `/users`                           | A (`user:manage`)              | Danh sách tài khoản                    |
| POST   | `/users/:id/reset-password`        | A (`user:manage`)              | Reset mật khẩu → mật khẩu tạm          |
| GET    | `/classes`                         | A (`class:manage`)             | Danh sách lớp, GVCN, sĩ số             |
| PUT    | `/classes/:id/teacher`             | A (`class:manage`)             | Phân / bỏ GVCN                         |
| GET    | `/students`                        | A (`class:manage`)             | Tìm học sinh                           |
| PUT    | `/students/:id/class`              | A (`class:manage`)             | Phân / chuyển / rút lớp                |
| GET    | `/grade-books`                     | A, T (`grade:write`) 🔒        | Sổ điểm của một lớp                    |
| POST   | `/grade-books`                     | A, T (`grade:write`) 🔒        | Tạo một dòng điểm                      |
| POST   | `/grade-books/bulk`                | A, T (`grade:write`) 🔒        | Nhập điểm hàng loạt                    |
| PUT    | `/grade-books/:id`                 | A, T (`grade:write`) 🔒        | Sửa điểm                               |
| DELETE | `/grade-books/:id`                 | A, T (`grade:delete`) 🔒       | Xóa mềm                                |
| POST   | `/grade-books/:id/restore`         | A (`grade:restore`)            | Khôi phục dòng đã xóa                  |
| GET    | `/students/:id/grades`             | A, T, S, P (`grade:read`) 🔒   | Điểm từng môn                          |
| GET    | `/students/:id/summary`            | A, T, S, P (`grade:read`) 🔒   | Tổng kết học kỳ: TBM, GPA, học lực     |
| GET    | `/students/:id/conduct-suggestion` | A, T, S, P (`conduct:read`) 🔒 | Gợi ý hạnh kiểm                        |
| POST   | `/classes/:id/recalculate`         | A, T (`grade:write`) 🔒        | Tính lại TBM/GPA cả lớp                |
| GET    | `/grade-locks`                     | A, T (`grade:lock`)            | Danh sách kỳ đã chốt                   |
| POST   | `/grade-locks`                     | A, T (`grade:lock`) 🔒         | Chốt sổ                                |
| POST   | `/grade-locks/unlock`              | A (`grade:unlock`)             | Mở khóa sổ (bắt buộc lý do)            |

Lỗi chung có thể gặp ở **mọi** endpoint cần đăng nhập: `401 UNAUTHENTICATED` / `401 TOKEN_EXPIRED`,
`403 FORBIDDEN`, `422 VALIDATION_ERROR`, `429 TOO_MANY_REQUESTS` (endpoint có rate limit), `500 INTERNAL_ERROR`.
Các mục dưới chỉ liệt kê lỗi **riêng** của từng endpoint.

---

## 5.2. Auth

### `POST /auth/login`

```json
// Request
{ "username": "gv.mai", "password": "Passw0rd2026" }
// 200
{
  "success": true,
  "data": {
    "accessToken": "eyJ...", "refreshToken": "eyJ...", "tokenType": "Bearer", "expiresIn": 900,
    "user": { "id": 2, "username": "gv.mai", "fullName": "Lê Thị Mai", "role": "TEACHER", "createdAt": "..." }
  }
}
```

- Username không phân biệt hoa thường. Sai user hay sai mật khẩu đều trả **cùng** `401 INVALID_CREDENTIALS`.
- Rate limit: 5 lần/phút cho mỗi cặp (IP + username).

### `POST /auth/refresh`

```json
{ "refreshToken": "eyJ..." }
```

Trả cặp token **mới** (cùng phiên). Refresh token cũ hết hiệu lực ngay; dùng lại → `401 REFRESH_TOKEN_INVALID` và
**cả phiên bị thu hồi** (nghi bị đánh cắp). Rate limit chung 10 lần/phút/IP với `PUT /auth/password`.

### `POST /auth/logout` · `POST /auth/logout-all`

Không body. Trả `200 { "success": true, "data": null }`. `logout` thu hồi phiên hiện tại; `logout-all` thu hồi mọi
token đã cấp cho user trước thời điểm gọi (đăng xuất mọi thiết bị).

### `GET /auth/me`

```json
{
  "success": true,
  "data": {
    "user": { "id": 2, "username": "gv.mai", "fullName": "Lê Thị Mai", "role": "TEACHER" },
    "sessionId": "c1b2...",
    "impersonatedBy": null,
    "linkedStudentIds": [],
    "managedClasses": [{ "id": 2, "className": "10A2" }]
  }
}
```

STUDENT/PARENT có `linkedStudentIds` (id học sinh của mình/con mình); TEACHER có `managedClasses`.

### `PUT /auth/password`

```json
{ "currentPassword": "mat-khau-dang-dung", "newPassword": "MatKhauMoi2026" }
```

| Kết quả           | Khi nào                                                              |
| ----------------- | -------------------------------------------------------------------- |
| 200               | Đổi thành công; **mọi phiên** của user bị thu hồi → đăng nhập lại    |
| 400 `BAD_REQUEST` | Sai mật khẩu hiện tại                                                |
| 403 `FORBIDDEN`   | Đang ở chế độ impersonate (Admin không đổi được mật khẩu người khác) |
| 422               | Mật khẩu mới yếu, hoặc trùng mật khẩu cũ                             |

### `POST /auth/switch-role` · `POST /auth/switch-back`

```json
{ "targetUserId": 7 }      // chỉ ADMIN: đăng nhập thay user 7
{ "targetRole": "TEACHER" } // chỉ khi DEMO_MODE=true: đổi sang tài khoản đầu tiên có role đó
```

Trả **chỉ access token** (không refresh), có `impersonatedBy`. `switch-back` dùng token impersonate để quay về tài
khoản gốc với phiên mới đầy đủ. Không cho impersonate lồng nhau (`403`).

---

## 5.3. Users (chỉ ADMIN)

### `POST /users` – cấp tài khoản

```json
{ "role": "TEACHER", "username": "gv.mai", "fullName": "Lê Thị Mai", "password": "Passw0rd2026" }
{ "role": "ADMIN",   "username": "admin2", "fullName": "Quản trị 2", "password": "Passw0rd2026" }
{ "role": "STUDENT", "studentCode": "HS005", "password": "Passw0rd2026" }
{ "role": "PARENT",  "studentCode": "HS005", "password": "Passw0rd2026", "fullName": "Đặng Văn Nam" }
```

- STUDENT: username **= mã học sinh**, họ tên lấy từ bảng `students`. PARENT: username = `<mã>-PH`,
  `fullName` không bắt buộc (mặc định `parent_name`).
- TEACHER mới: response có thêm `managedClasses` (lớp mà họ tên giáo viên trùng `gvcn_name`).
- Lỗi: `404` học sinh không tồn tại hoặc đã nghỉ; `409 CONFLICT` username đã tồn tại (không phân biệt hoa thường).

### `GET /users?role=&q=&sort=&page=&limit=`

`sort` ∈ `username`, `fullName`, `createdAt`, `id` (thêm `-` để giảm dần). Không bao giờ trả `passwordHash`.

### `POST /users/:id/reset-password`

Không body. Server sinh mật khẩu tạm 12 ký tự, trả **một lần**, kèm `Cache-Control: no-store`:

```json
{
  "success": true,
  "data": { "userId": 5, "username": "HS003", "temporaryPassword": "k7XmP3qRt9aZ" }
}
```

Mọi phiên cũ của user bị thu hồi. Admin **không** tự đặt được mật khẩu cho người khác.

---

## 5.4. Phân lớp và GVCN (chỉ ADMIN)

| Endpoint                                             | Body / Query                                   | Kết quả và lỗi riêng                                                                      |
| ---------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `GET /classes`                                       | –                                              | `[{ id, className, gradeLevel, gvcnName, studentCount, gvcnTeachers[] }]`                 |
| `PUT /classes/:id/teacher`                           | `{ "teacherUserId": 7 }` hoặc `null` (bỏ GVCN) | `404` lớp/giáo viên; `400` user không phải TEACHER; `409` trùng họ tên với giáo viên khác |
| `GET /students?classId=&unassigned=&q=&page=&limit=` | –                                              | `[{ id, studentCode, fullName, className, status }]` + `meta`                             |
| `PUT /students/:id/class`                            | `{ "classId": 1 }` hoặc `null` (rút khỏi lớp)  | `404` học sinh/lớp; `400` học sinh không còn `ACTIVE`                                     |

---

## 5.5. Sổ điểm

Cột điểm (đều 0–10, tối đa 1 chữ số thập phân, `null` = chưa nhập):
`scoreOral` (miệng), `score15m` (15 phút), `score1Hour` (1 tiết), `scoreMidTerm` (giữa kỳ), `scoreFinalTerm` (cuối kỳ).
`averageScore` và `gradeLetter` **do server tính**, gửi lên sẽ bị 422.

### `POST /grade-books`

```json
{
  "studentId": 5,
  "subjectName": "Toán Học",
  "semester": "HK1",
  "schoolYear": "2025-2026",
  "scoreOral": 9,
  "score15m": 8.5,
  "score1Hour": 8,
  "scoreMidTerm": 9,
  "scoreFinalTerm": 9.5
}
```

`201` → dòng điểm với `averageScore: 8.9`, `gradeLetter: "Giỏi"`. Lỗi riêng: `403` không phải GVCN của học sinh;
`404` học sinh/môn; `409 CONFLICT` đã có điểm môn này trong kỳ (dùng `PUT`) hoặc học sinh không còn học;
`409 GRADEBOOK_LOCKED` kỳ đã chốt.

### `POST /grade-books/bulk`

```json
{
  "classId": 2,
  "subjectName": "Ngữ Văn",
  "semester": "HK1",
  "schoolYear": "2025-2026",
  "entries": [{ "studentId": 5, "scoreMidTerm": 9, "scoreFinalTerm": 9 }]
}
```

Chưa có thì tạo, có rồi thì cập nhật. **Một transaction**: một dòng sai → không dòng nào được ghi.
Trả `{ created, updated, items }`. Học sinh không thuộc lớp → `422` chỉ rõ `entries.<i>.studentId`.

### `PUT /grade-books/:id`

Chỉ gửi cột cần đổi: `{ "scoreFinalTerm": 9 }`. Phải có ít nhất một cột. Lỗi: `404` không có/đã xóa;
`409 GRADEBOOK_LOCKED`.

### `DELETE /grade-books/:id` · `POST /grade-books/:id/restore`

Xóa mềm (`status = DELETED`). Xóa lại → `409 ALREADY_DELETED`. Khôi phục (chỉ ADMIN) dòng chưa xóa → `409 NOT_DELETED`;
đã có dòng khác cùng học sinh/môn/kỳ → `409 CONFLICT`.

### `GET /grade-books?classId=...`

| Query                                   | Ghi chú                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `classId`                               | **Bắt buộc**                                                                    |
| `subjectName`, `semester`, `schoolYear` | Lọc; thiếu kỳ thì dùng kỳ hiện hành (`CURRENT_SEMESTER`, `CURRENT_SCHOOL_YEAR`) |
| `includeDeleted=true`                   | Chỉ ADMIN                                                                       |
| `sort`                                  | `studentCode` (mặc định), `studentName`, `averageScore`, `subjectName`, `id`    |

### `GET /students/:id/grades` · `GET /students/:id/summary`

Query tùy chọn `semester`, `schoolYear` (thiếu → kỳ hiện hành). `summary` trả (số liệu minh họa, `subjects` có đủ 5 môn):

```json
{
  "studentId": 5,
  "studentName": "Đặng Thị Giang",
  "className": "10A2",
  "semester": "HK1",
  "schoolYear": "2025-2026",
  "subjects": [
    {
      "subjectName": "Toán Học",
      "credits": 2,
      "averageScore": 8.9,
      "score4": 4,
      "gradeLetter": "Giỏi",
      "isComplete": true
    }
  ],
  "gpa10": 8.4,
  "gpa4": 3.57,
  "academicRank": "Giỏi",
  "isComplete": true,
  "isLocked": false,
  "policy": "LEGACY_5_LEVELS"
}
```

Công thức chi tiết: [Nghiệp vụ sổ điểm](07-nghiep-vu-so-diem.md).

### `POST /classes/:id/recalculate`

Body `{ "semester": "HK1", "schoolYear": "2025-2026" }`. Tính lại TBM/xếp loại mọi dòng điểm của lớp và đồng bộ
GPA/học lực vào bảng `students`. Trả `{ processed, gradesUpdated, studentsUpdated }`.

---

## 5.6. Khóa sổ

| Endpoint                   | Body                                                            | Kết quả / lỗi riêng                                                                  |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `POST /grade-locks`        | `{ classId, semester, schoolYear, note? }`                      | `201 { lockedRows, summary }`; `409 GRADEBOOK_ALREADY_LOCKED`; `404` kỳ chưa có điểm |
| `POST /grade-locks/unlock` | `{ classId, semester, schoolYear, reason }` (reason ≥ 10 ký tự) | `200 { unlockedRows, reason }`; `409 CONFLICT` kỳ chưa chốt                          |
| `GET /grade-locks`         | `page`, `limit`                                                 | `[{ className, semester, schoolYear, lockedRows }]`                                  |

Khi kỳ đã chốt, mọi thao tác ghi (tạo, sửa, xóa, khôi phục, bulk, tính lại) trên lớp + kỳ đó → `409 GRADEBOOK_LOCKED`,
kể cả với ADMIN (phải mở khóa trước, và việc mở khóa được ghi audit kèm lý do).

---

## 5.7. Hạnh kiểm

### `GET /students/:id/conduct-suggestion?from=2025-09-01&to=2026-01-31`

```json
{
  "studentId": 5,
  "from": "2025-09-01",
  "to": "2026-01-31",
  "absenceStats": { "excused": 1, "unexcused": 0, "late": 2 },
  "suggestedConduct": "Tốt",
  "note": "Chỉ là gợi ý từ dữ liệu chuyên cần. Hạnh kiểm chính thức do giáo viên chủ nhiệm quyết định."
}
```

`from > to` → `422`.
