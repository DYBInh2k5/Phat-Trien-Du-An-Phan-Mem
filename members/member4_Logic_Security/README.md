# HTQLLH – Member 4: Auth, RBAC & Academic Logic (Node.js · Express 5 · PostgreSQL)

JavaScript (ESM) chạy thẳng, **không đổi `db/schema.sql`** (file của nhóm, mount nguyên bản). Mọi thứ cần thêm đều dùng
các bảng/cột có sẵn.

 **Tài liệu kỹ thuật đầy đủ** (kiến trúc, Clean Architecture, RESTful API, bảo mật, nghiệp vụ, dữ liệu – có sơ đồ Mermaid):
[`docs/README.md`](docs/README.md)

## Chạy nhanh

```bash
cp .env.example .env              # sửa 2 JWT secret (>= 32 ký tự, khác nhau)
docker compose up -d              # Postgres 16, tự nạp db/schema.sql lần đầu
npm install
npm run seed:admin                # tạo admin từ ADMIN_USERNAME / ADMIN_PASSWORD (chạy lại an toàn)
npm run seed:demo                 # (tuỳ chọn) thêm gv.an, HS001, HS001-PH để demo
npm run dev                       # http://localhost:3000   GET /health
```

Không dùng docker: `npm run db:init` để áp `db/schema.sql` lên DB sẵn có.

Log: ở dev in đẹp kiểu NestJS (`[HTQLLH] pid - thời gian  LOG [Context] nội dung +ms`), lúc khởi động liệt kê mọi route và
in link `http://localhost:PORT` (Ctrl+Click để mở). Production mặc định ghi JSON. Đổi bằng `LOG_FORMAT=pretty|json`.

| Lệnh                              | Việc                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run lint` / `lint:fix`       | ESLint (chặn `==`, `var`, `res.json` trực tiếp, `console`, biến thừa...)                     |
| `npm run format` / `format:check` | Prettier                                                                                     |
| `npm test`                        | Toàn bộ test (unit + tích hợp). Test tích hợp tự bỏ qua nếu không có `TEST_DATABASE_URL`     |
| `npm run test:unit`               | Chỉ unit test (không cần DB, chạy vài giây)                                                  |
| `npm run test:integration`        | Chỉ test tích hợp (cần `TEST_DATABASE_URL`)                                                  |
| `npm run test:coverage`           | Toàn bộ test + **báo cáo coverage HTML** tại `coverage/index.html`; **fail nếu dưới ngưỡng** |
| `npm run test:coverage:unit`      | Coverage của riêng unit test (không cần DB, không kiểm ngưỡng)                               |
| `npm run postman:generate`        | Sinh lại `postman/*.json` từ `scripts/generate-postman.js`                                   |
| `npm run postman:run`             | Chạy collection bằng newman (server phải đang chạy)                                          |

```bash
# ⚠ test tích hợp XÓA users / grade_books / attendances => chỉ trỏ vào DB thử nghiệm riêng
createdb htqllh_test && psql htqllh_test -f db/schema.sql
export TEST_DATABASE_URL=postgres://htqllh:htqllh_dev@localhost:5432/htqllh_test
npm test                  # chạy tất cả
npm run test:coverage     # thêm báo cáo HTML -> mở coverage/index.html bằng trình duyệt
```

## Test và coverage

```text
tests/
  helpers/harness.js              Dựng app + DB thật cho test tích hợp (reset dữ liệu, login, kiểm tra lỗi)
  unit/                           Không cần DB
    academic.test.js                TBM, GPA 10/4, xếp loại, hạnh kiểm (có ví dụ tính tay)
    token-service.test.js           JWT: hết hạn, sai chữ ký, alg=none, nhầm loại token
    session-store.test.js           Thu hồi phiên, phát hiện dùng lại refresh token, dọn bộ nhớ
    access-policy.test.js           Ownership: role x quan hệ (Student/Parent/Teacher/Admin)
    permissions.test.js             Ma trận quyền viết tay độc lập với code
    http-layer.test.js              Response, error handler, validate, phân trang, sort, schemas
    config-and-infra.test.js        Cấu hình env, transaction, health, CORS, bcrypt
    auth-service.test.js            Login/refresh/switch-role/switch-back/authenticate (giả repo)
    users-service.test.js           Đăng ký có xác minh, Admin cấp tài khoản, reset mật khẩu
  integration/                    Postgres thật
    api.integration.test.js         Luồng nghiệp vụ end-to-end
    edge-cases.integration.test.js  Rate limit, ma trận RBAC mọi endpoint, IDOR, nhánh lỗi, seed script
```

Coverage dùng **lệnh có sẵn của Node** (`node --test --experimental-test-coverage`, cần Node >= 22.8), không cần c8.
Ngưỡng (lines >= 98, functions >= 95, branches >= 95) nằm ở `scripts/run-tests.js`. Node chỉ có reporter
text/lcov nên `scripts/coverage-html.js` (không phụ thuộc thư viện) dựng HTML từ `coverage/lcov.info`:
`coverage/index.html` (tổng quan) + `coverage/files/*.html` (từng file, dòng đỏ = chưa chạy, ◐ = thiếu nhánh).
`src/server.js` được loại khỏi coverage. Lưu ý: coverage native chỉ tính file đã được load khi test.

## Makefile

`make help` liệt kê lệnh: `make up`, `make db-init`, `make seed-demo`, `make dev`, `make lint`,
`make test`, `make test-unit`, `make coverage`, `make postman-run`, `make ci`, `make clean`.
Đặt DB test: `make test TEST_DATABASE_URL=postgres://user:pass@localhost:5432/htqllh_test`.
(Windows không có `make` thì dùng `npm run ...` tương đương.)

## Postman

Import 2 file trong `postman/`:

- `HTQLLH.postman_collection.json`: 95 request, 7 nhóm (0. Health → 6. Phân quyền), mỗi request có test. Admin đăng nhập rồi **tự cấp** tài khoản `gv.mai` (GVCN 10A2), `HS005`, `HS005-PH` (mật khẩu `newUserPassword` = `Passw0rd2026`), sau đó ba tài khoản này đăng nhập. Chạy **tuần tự** bằng Collection Runner;
  token và id tự lưu vào biến collection, chạy lại nhiều lần không hỏng.
- `HTQLLH-Local.postman_environment.json`: `baseUrl`, tài khoản Admin và `newUserPassword` (sinh từ `.env`: `PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`; đổi `.env` thì chạy lại `npm run postman:generate`).

Điều kiện: đã `npm run seed:admin` (không cần `seed:demo`), server đang chạy. Nếu bật rate limit (đăng nhập 5 lần/phút theo IP + username; refresh và đổi mật khẩu
10 lần/phút theo IP) thì chạy lại collection sau khoảng 1 phút. Quick Role Switcher theo `targetRole` trả 200 khi
`DEMO_MODE=true`, 403 khi tắt; collection chấp nhận cả hai.

```bash
npm run postman:run -- --env-var baseUrl=http://localhost:3000     # newman
```

## Cấp tài khoản: chỉ Admin

Không có tự đăng ký. **Mọi** tài khoản do Admin tạo qua `POST /users`; người dùng chỉ tự **đăng nhập** (`POST /auth/login`).

**Mật khẩu**:

- Mỗi người **tự đổi** mật khẩu của mình qua `PUT /auth/password` với `{ currentPassword, newPassword }`.
- **Quên mật khẩu** thì liên hệ Admin. Admin gọi `POST /users/:id/reset-password` (không có body): server sinh mật khẩu
  tạm ngẫu nhiên 12 ký tự, trả về **một lần duy nhất** (DB chỉ lưu hash). Admin chuyển cho người dùng, người dùng đăng
  nhập rồi tự đổi. Admin không tự đặt được mật khẩu cho người khác.
- Đổi hoặc reset xong thì mọi phiên cũ của người đó bị thu hồi.

| Role        | Cách có tài khoản                                                   | Ghi chú                                                                 |
| ----------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **ADMIN**   | **Seed** (`npm run seed:admin`) hoặc Admin khác cấp (`POST /users`) | Admin đầu tiên lấy từ `ADMIN_USERNAME` / `ADMIN_PASSWORD` trong `.env`  |
| **TEACHER** | Admin cấp `{ role, username, fullName, password }`                  | Họ tên phải trùng `school_classes.gvcn_name` thì mới là GVCN của lớp đó |
| **STUDENT** | Admin cấp `{ role, studentCode, password }`                         | Mã học sinh phải có thật và đang học. Username = mã HS (vd `HS001`)     |
| **PARENT**  | Admin cấp `{ role, studentCode, password, fullName? }`              | Username = `HS001-PH`                                                   |

**Phân lớp và GVCN (Admin):** `PUT /students/:id/class` gán học sinh vào lớp, GVCN của lớp đó quản lý ngay.
`PUT /classes/:id/teacher` phân giáo viên làm GVCN (ghi họ tên giáo viên vào `school_classes.gvcn_name`). Vì GVCN nối
với tài khoản theo **họ tên**, hệ thống từ chối (409) nếu có hai giáo viên trùng họ tên.

**Liên kết user ↔ dữ liệu (vì schema không có cột nối)** – xem `src/common/auth/account-links.js`:
STUDENT/PARENT nối theo username; TEACHER nối theo họ tên với `gvcn_name`.

## Phân quyền

Hai tầng. Tầng 1 `can('<permission>')` (route), tầng 2 ownership (`common/auth/access-policy.js`, gọi trong service).

| Chức năng                                | Admin |        Teacher        |   Student   |   Parent    |
| ---------------------------------------- | :---: | :-------------------: | :---------: | :---------: |
| Quản lý user (`/users`)                  |   ✔   |           ✘           |      ✘      |      ✘      |
| Xem điểm / tổng kết / gợi ý hạnh kiểm    |   ✔   | 🔒 lớp mình chủ nhiệm | 🔒 của mình | 🔒 con mình |
| Xem sổ điểm cả lớp                       |   ✔   | 🔒 lớp mình chủ nhiệm |      ✘      |      ✘      |
| Nhập/sửa/xóa mềm điểm, bulk, recalculate |   ✔   |        🔒 GVCN        |      ✘      |      ✘      |
| Khôi phục điểm đã xóa                    |   ✔   |           ✘           |      ✘      |      ✘      |
| Khóa sổ                                  |   ✔   |        🔒 GVCN        |      ✘      |      ✘      |
| Mở khóa sổ (bắt buộc lý do)              |   ✔   |           ✘           |      ✘      |      ✘      |

## API (`/api/v1`, mọi body là JSON)

| Method       | Path                                                                                  | Quyền                                                         |
| ------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| POST         | `/auth/login` · `/auth/refresh`                                                       | Public (rate limit)                                           |
| POST         | `/auth/logout` · `/auth/logout-all` · `/auth/switch-role` · `/auth/switch-back`       | Đăng nhập                                                     |
| GET          | `/auth/me`                                                                            | Đăng nhập                                                     |
| PUT          | `/auth/password`                                                                      | Đăng nhập – tự đổi mật khẩu của chính mình                    |
| POST         | `/users/:id/reset-password`                                                           | Admin – reset khi user quên, trả mật khẩu tạm ngẫu nhiên      |
| GET          | `/classes`                                                                            | Admin – danh sách lớp, GVCN, sĩ số                            |
| PUT          | `/classes/:id/teacher`                                                                | Admin – phân GVCN `{ teacherUserId }` (`null` = bỏ GVCN)      |
| GET          | `/students?classId=&unassigned=&q=`                                                   | Admin – tìm học sinh                                          |
| PUT          | `/students/:id/class`                                                                 | Admin – phân/chuyển lớp `{ classId }` (`null` = rút khỏi lớp) |
| POST / GET   | `/users`                                                                              | Admin                                                         |
| GET / POST   | `/grade-books` (list theo `classId` / tạo)                                            | Admin, GVCN                                                   |
| POST         | `/grade-books/bulk`                                                                   | Admin, GVCN                                                   |
| PUT / DELETE | `/grade-books/:id` (sửa / xóa mềm)                                                    | Admin, GVCN                                                   |
| POST         | `/grade-books/:id/restore`                                                            | Admin                                                         |
| GET          | `/students/:id/grades` · `/students/:id/summary` · `/students/:id/conduct-suggestion` | Theo ownership                                                |
| POST         | `/classes/:id/recalculate`                                                            | Admin, GVCN                                                   |
| GET / POST   | `/grade-locks` (danh sách / khóa sổ)                                                  | Admin, GVCN                                                   |
| POST         | `/grade-locks/unlock`                                                                 | Admin                                                         |

Response chuẩn (`src/common/http/response.js`):

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 } }
{ "success": false, "error": { "code": "GRADEBOOK_LOCKED", "message": "...", "details": [] }, "requestId": "..." }
```

Mã lỗi nằm ở `src/common/errors/error-codes.js`. Client dựa vào `error.code`, không dựa vào `message`.

## Kiến trúc (Clean / Layered, DI thủ công)

```
Route -> authenticate -> can(permission) -> validate(zod) -> Controller -> Service -> Repository -> PostgreSQL
                                                                           \-> Domain (hàm thuần: TBM, GPA, xếp loại)
```

| Tầng                               | Được                                                    | Không được                       |
| ---------------------------------- | ------------------------------------------------------- | -------------------------------- |
| Controller (`*.controller.js`)     | đọc `req.valid`, gọi service, `ok()/created()/done()`   | logic nghiệp vụ, SQL, `res.json` |
| Service (`*.service.js`)           | nghiệp vụ, transaction, ownership, `throw Errors.xxx()` | đụng `req/res`                   |
| Repository (`*.repository.js`)     | SQL tham số hóa, map snake_case -> camelCase            | logic nghiệp vụ                  |
| Domain (`modules/academic/domain`) | hàm thuần, có unit test                                 | import DB/HTTP                   |

`src/container.js` là nơi duy nhất nối các tầng. Giữ JS "không lỏng" bằng: zod `strictObject` ở mọi đầu vào (chặn field lạ),
`req.valid` thay vì `req.body`, hằng `Object.freeze`, ESLint nghiêm, lỗi có `code`, test.

Thêm endpoint mới: schema (zod) -> repository -> service -> controller -> route (`authenticate, can(), validate()`) -> test.

## Những gì phải làm khác vì KHÔNG đổi schema (đọc kỹ)

| Yêu cầu                        | Cách làm                                                                                                                | Giới hạn                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Khóa/mở chốt sổ                | `grade_books.status`: `APPROVED` ↔ `LOCKED` theo (lớp, học kỳ, năm)                                                     | Không lưu được _ai khóa / lúc nào_ trong DB (chỉ có audit log)                                           |
| Xóa mềm điểm                   | `grade_books.status = 'DELETED'`, mọi truy vấn đọc loại trừ                                                             | Không có `deleted_by/deleted_at`                                                                         |
| Chống trùng điểm               | Khóa tư vấn Postgres (`pg_advisory_xact_lock`) + kiểm tra trước khi ghi                                                 | Không có UNIQUE index đảm bảo ở tầng DB                                                                  |
| Điểm "chưa nhập"               | Cột điểm cho phép `NULL` (không `NOT NULL`) nên lưu `NULL`, khác với `0`                                                | Dòng cũ có `DEFAULT 0.0` vẫn là 0                                                                        |
| Phiên đăng nhập / thu hồi      | JWT stateless + **bộ nhớ trong** (`session-store.js`)                                                                   | **Mất khi restart server**, không chia sẻ nhiều instance. Muốn bền: cần bảng `refresh_tokens` hoặc Redis |
| Audit log                      | Ghi log JSON có cấu trúc (field `audit`)                                                                                | Chưa truy vấn được qua API                                                                               |
| Xóa mềm **user**               | **Chưa làm** (`users` không có cột trạng thái)                                                                          | Cần thêm cột `is_active/deleted_at` mới làm được                                                         |
| Lưu **hạnh kiểm** chính thức   | **Chưa làm**; chỉ có `GET /students/:id/conduct-suggestion` (gợi ý từ điểm danh)                                        | Cần bảng `conduct_records`                                                                               |
| Import Excel/CSV (form-data)   | **Chưa làm**                                                                                                            | Tách riêng khi cần                                                                                       |
| `students.gpa / academic_rank` | Chỉ cập nhật cho **học kỳ hiện hành** (`CURRENT_SEMESTER`, `CURRENT_SCHOOL_YEAR`); thiếu môn => `0.0` + "Chưa xếp loại" | Bảng chỉ lưu 1 giá trị/học sinh                                                                          |

## Cần team chốt (đang là giá trị mặc định, nằm ở một chỗ để sửa)

- **Quy chế xếp loại**: đề ghi 5 mức (Xuất sắc/Giỏi/Khá/TB/Yếu) nhưng lại nhắc "Thông tư 22" – hai thứ này không khớp nhau.
  Đang làm đúng 5 mức ở `modules/academic/domain/policies.js`; thêm quy chế khác = thêm một policy cùng hình dạng, chọn qua `GRADING_POLICY`.
  **Ngưỡng hiện tại cần đối chiếu văn bản gốc của trường.**
- Hệ số điểm (miệng 1, 15' 1, 1 tiết 2, giữa kỳ 2, cuối kỳ 3) – `domain/average.js`.
- Bảng quy đổi hệ 4.0 – `domain/gpa.js`.
- Giá trị trạng thái điểm danh (`ABSENT`, `EXCUSED`, `LATE`...) – `domain/conduct.js` – **đối chiếu với module Điểm danh của member khác**.
- Quick Role Switcher: `DEMO_MODE=true` cho phép ai đăng nhập rồi đổi sang bất kỳ role nào – **chỉ dùng demo**, production bị chặn khởi động