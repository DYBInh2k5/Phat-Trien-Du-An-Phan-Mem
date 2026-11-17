# 8. Dữ liệu

[← Nghiệp vụ sổ điểm](07-nghiep-vu-so-diem.md) · [Mục lục](README.md) · [Tiếp: Vận hành và kiểm thử →](09-van-hanh-kiem-thu.md)

`db/schema.sql` là **file chung của nhóm**, được mount nguyên bản vào Postgres (docker) và **không được sửa**.
Phần này mô tả các bảng, quan hệ thật trong DB, và các quan hệ "logic" mà code tự duy trì.

## 8.1. Sơ đồ ER

Nét liền = khóa ngoại thật trong schema. Nét đứt = liên kết **theo quy ước** do code duy trì (không có khóa ngoại).

```mermaid
erDiagram
    SCHOOL_CLASSES ||--o{ STUDENTS : "class_name (FK)"
    STUDENTS ||--o{ GRADE_BOOKS : "student_id (FK)"
    STUDENTS ||--o{ ATTENDANCES : "student_id (FK)"
    STUDENTS ||--o{ LEAVE_REQUESTS : "student_id (FK)"
    SUBJECTS ||..o{ GRADE_BOOKS : "subject_name = name (quy ước)"
    USERS ||..o| STUDENTS : "STUDENT: username = student_code"
    USERS ||..o| STUDENTS : "PARENT: username = student_code + '-PH'"
    USERS ||..o{ SCHOOL_CLASSES : "TEACHER: full_name = gvcn_name"

    USERS {
        int id PK
        varchar username UK
        varchar password "hash bcrypt"
        varchar full_name
        varchar role "ADMIN|TEACHER|STUDENT|PARENT"
        timestamp created_at
    }
    SCHOOL_CLASSES {
        int id PK
        varchar class_name UK
        int grade_level
        varchar gvcn_name "họ tên GVCN"
    }
    STUDENTS {
        int id PK
        varchar student_code UK
        varchar full_name
        varchar dob
        varchar class_name FK
        varchar parent_name
        varchar parent_phone
        numeric gpa "kỳ hiện hành"
        varchar academic_rank "kỳ hiện hành"
        varchar status "ACTIVE|..."
    }
    SUBJECTS {
        int id PK
        varchar code UK "MATH, LIT..."
        varchar name
        int credits
    }
    GRADE_BOOKS {
        int id PK
        int student_id FK
        varchar student_code
        varchar class_name
        varchar subject_name
        varchar semester "HK1|HK2"
        varchar school_year "2025-2026"
        numeric score_oral
        numeric score_15m
        numeric score_1hour
        numeric score_mid_term
        numeric score_final_term
        numeric average_score "server tính"
        varchar grade_letter "server tính"
        varchar status "APPROVED|LOCKED|DELETED"
    }
    ATTENDANCES {
        int id PK
        int student_id FK
        varchar att_date
        varchar status
    }
    LEAVE_REQUESTS {
        int id PK
        int student_id FK
    }
    TUITIONS {
        int id PK
        varchar student_code
    }
```

## 8.2. Module này đọc/ghi bảng nào

| Bảng                         | Đọc | Ghi | Ghi gì                                                         |
| ---------------------------- | :-: | :-: | -------------------------------------------------------------- |
| `users`                      |  ✔  |  ✔  | Tạo tài khoản, đổi/reset mật khẩu                              |
| `grade_books`                |  ✔  |  ✔  | Điểm, TBM, xếp loại môn, `status`                              |
| `students`                   |  ✔  |  ✔  | `gpa`, `academic_rank` (kỳ hiện hành); `class_name` (phân lớp) |
| `school_classes`             |  ✔  |  ✔  | `gvcn_name` (phân GVCN)                                        |
| `subjects`                   |  ✔  |     |                                                                |
| `attendances`                |  ✔  |     | Đếm theo trạng thái để gợi ý hạnh kiểm                         |
| `leave_requests`, `tuitions` |     |     | Thuộc module khác                                              |

> Ghi vào `students.class_name` và `school_classes.gvcn_name` là phần **phân lớp / phân GVCN** do Admin thực hiện.
> Hai bảng này thuộc phạm vi của thành viên khác → cần thống nhất với nhóm để không làm trùng chức năng.

## 8.3. Những gì phải làm khác vì không đổi schema

| Nhu cầu                       | Cách làm hiện tại                                                | Giới hạn                                                  |
| ----------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| Liên kết tài khoản ↔ học sinh | Quy ước username (`HS001`, `HS001-PH`), server tự suy ra khi cấp | Đổi mã học sinh thì phải đổi username tương ứng           |
| Liên kết giáo viên ↔ lớp      | So khớp họ tên với `gvcn_name` (chuẩn hóa)                       | Trùng họ tên → API phân GVCN từ chối; nên có `teacher_id` |
| Khóa sổ                       | `grade_books.status` `APPROVED ↔ LOCKED` theo (lớp, kỳ, năm)     | Không lưu "ai khóa, lúc nào" trong DB (chỉ có audit log)  |
| Xóa mềm điểm                  | `status = 'DELETED'`, truy vấn đọc loại trừ                      | Không có `deleted_by`, `deleted_at`                       |
| Chống trùng điểm              | Advisory lock + kiểm tra trước khi ghi                           | Không có UNIQUE index ở tầng DB                           |
| Điểm "chưa nhập"              | Lưu `NULL` (cột cho phép NULL), khác `0`                         | Dòng cũ dùng `DEFAULT 0.0` vẫn là 0                       |
| Phiên đăng nhập / thu hồi     | JWT + danh sách thu hồi trong RAM                                | Mất khi restart, không chia sẻ nhiều instance             |
| Audit                         | Log có cấu trúc                                                  | Chưa truy vấn qua API                                     |
| GPA nhiều kỳ                  | Tính động từ `grade_books` mỗi lần xem tổng kết                  | Cột `students.gpa` chỉ phản ánh kỳ hiện hành              |
| Ngày tháng                    | Cột `VARCHAR` dạng `YYYY-MM-DD`, so sánh chuỗi đúng thứ tự       | Không có kiểu `DATE` thật                                 |

## 8.4. Đề xuất nâng cấp schema (khi nhóm cho phép)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "user_id"
    USERS ||--o| STUDENTS : "user_id (thay quy ước username)"
    USERS ||--o{ SCHOOL_CLASSES : "gvcn_user_id (thay so họ tên)"
    SCHOOL_CLASSES ||--o{ GRADE_LOCKS : "class_id"
    USERS ||--o{ AUDIT_LOGS : "actor_id"

    REFRESH_TOKENS {
        uuid jti PK
        int user_id FK
        uuid session_id
        timestamp expires_at
        timestamp used_at
        timestamp revoked_at
    }
    GRADE_LOCKS {
        int id PK
        int class_id FK
        varchar semester
        varchar school_year
        int locked_by
        timestamp locked_at
        text unlock_reason
    }
    AUDIT_LOGS {
        bigint id PK
        int actor_id FK
        varchar action
        varchar entity
        varchar entity_id
        jsonb before
        jsonb after
        timestamp created_at
    }
```

Kèm theo: `UNIQUE (student_id, subject_name, semester, school_year) WHERE status <> 'DELETED'` trên `grade_books`,
cột `users.is_active`, bảng `conduct_records`. Nhờ kiến trúc phân tầng, các thay đổi này chủ yếu nằm ở **repository** và
`session-store`, service gần như giữ nguyên.

## 8.5. Ánh xạ tên: DB ⇄ code ⇄ API

| DB (snake_case)    | Domain        | API / DTO (camelCase)    |
| ------------------ | ------------- | ------------------------ |
| `score_oral`       | `oral`        | `scoreOral`              |
| `score_15m`        | `quarterHour` | `score15m`               |
| `score_1hour`      | `oneHour`     | `score1Hour`             |
| `score_mid_term`   | `midTerm`     | `scoreMidTerm`           |
| `score_final_term` | `finalTerm`   | `scoreFinalTerm`         |
| `average_score`    | –             | `averageScore`           |
| `grade_letter`     | –             | `gradeLetter`            |
| `full_name`        | –             | `fullName`               |
| `password`         | –             | **không bao giờ trả ra** |

Một nguồn sự thật cho bảng trên: `src/modules/grades/grade.mapper.js` (`SCORE_FIELDS`). Repository là nơi duy nhất
chuyển `snake_case` sang `camelCase`; kiểu `NUMERIC` (Postgres trả về chuỗi) được đổi sang `Number` ở mapper.
