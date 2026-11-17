# 2. Kiến trúc tổng thể

[← Tổng quan](01-tong-quan.md) · [Mục lục](README.md) · [Tiếp: Clean Architecture →](03-clean-architecture.md)

## 2.1. Kiểu kiến trúc

Hệ thống là một **monolith dạng module** (modular monolith), bên trong chia **tầng** theo tinh thần Clean Architecture:

- **Theo chiều dọc**: chia theo **nghiệp vụ** (`auth`, `users`, `classes`, `grades`, `conduct`, `academic`).
  Mỗi module tự chứa route, controller, service, schema, repository của mình.
- **Theo chiều ngang**: trong mỗi module, code chia tầng **Route → Controller → Service → Repository/Domain**,
  phụ thuộc chỉ đi **một chiều từ ngoài vào trong**.

```mermaid
flowchart TB
    subgraph L1["Tầng ngoài cùng – Framework & hạ tầng"]
        EX["Express 5, helmet, cors, pino"]
        PG["pg (PostgreSQL driver)"]
        JWT["jsonwebtoken, bcryptjs"]
    end
    subgraph L2["Tầng adapter – chuyển đổi dữ liệu"]
        RT["Routes + Middleware<br/>(authenticate, can, validate)"]
        CT["Controllers<br/>HTTP ⇄ lời gọi service"]
        RP["Repositories<br/>SQL ⇄ object camelCase"]
    end
    subgraph L3["Tầng ứng dụng – Use case"]
        SV["Services<br/>auth, users, classes, grades, conduct"]
    end
    subgraph L4["Tầng lõi – Domain"]
        DM["academic/domain<br/>TBM, GPA, xếp loại, hạnh kiểm<br/>(hàm thuần)"]
        PL["access-policy, permissions<br/>(quy tắc phân quyền thuần)"]
    end

    EX --> RT --> CT --> SV
    SV --> DM
    SV --> PL
    SV --> RP --> PG
    SV -. "qua interface được inject" .-> JWT
```

> Mũi tên = "phụ thuộc vào / gọi tới". Tầng lõi **không import** bất cứ thứ gì của tầng ngoài.
> Phân tích chi tiết từng nguyên tắc ở [Clean Architecture](03-clean-architecture.md).

## 2.2. Các module và quan hệ giữa chúng

```mermaid
flowchart LR
    subgraph common["common/ (dùng chung)"]
        AUTHC["auth/<br/>token-service, session-store,<br/>password-hasher, permissions,<br/>access-policy, account-links,<br/>audit-logger, password-generator"]
        ERR["errors/<br/>AppError, ERROR_CODES"]
        HTTP["http/<br/>response, pagination, schemas"]
        MWS["middleware/<br/>authenticate, can, validate,<br/>rate-limit, request-id,<br/>not-found, error-handler"]
        LOG["logging/"]
    end

    AUTH["modules/auth"]
    USERS["modules/users"]
    CLASSES["modules/classes"]
    GRADES["modules/grades"]
    CONDUCT["modules/conduct"]
    STUD["modules/students<br/>(repository đọc)"]
    ACAD["modules/academic/domain"]

    AUTH --> USERS
    AUTH --> STUD
    USERS --> STUD
    CLASSES --> STUD
    CLASSES --> USERS
    GRADES --> STUD
    GRADES --> ACAD
    CONDUCT --> STUD
    CONDUCT --> ACAD

    AUTH & USERS & CLASSES & GRADES & CONDUCT --> common
```

| Module            | Trách nhiệm                                                                         | Endpoint gốc                                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `auth`            | Đăng nhập, refresh, logout, `/me`, đổi mật khẩu, chuyển vai trò                     | `/api/v1/auth/*`                                             |
| `users`           | Admin cấp tài khoản, liệt kê, reset mật khẩu                                        | `/api/v1/users/*`                                            |
| `classes`         | Danh sách lớp, tìm học sinh, phân lớp, phân GVCN                                    | `/api/v1/classes`, `/api/v1/students`                        |
| `grades`          | Sổ điểm, tổng kết học kỳ, tính lại, khóa/mở khóa sổ                                 | `/api/v1/grade-books/*`, `/students/:id/*`, `/grade-locks/*` |
| `conduct`         | Gợi ý hạnh kiểm từ điểm danh                                                        | `/api/v1/students/:id/conduct-suggestion`                    |
| `students`        | Chỉ có repository: đọc bảng `students`, `school_classes`, `subjects`, `attendances` | –                                                            |
| `academic/domain` | Hàm thuần tính toán học thuật, không biết HTTP hay DB                               | –                                                            |

## 2.3. Vòng đời một request

Ví dụ: GVCN sửa điểm cuối kỳ `PUT /api/v1/grade-books/15` với body `{ "scoreFinalTerm": 9 }`.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant MW as Middleware chung
    participant AU as authenticate
    participant CAN as can('grade:write')
    participant VA as validate(zod)
    participant CT as GradesController
    participant SV as GradesService
    participant DM as Domain (academic)
    participant RP as Repositories
    participant DB as PostgreSQL

    C->>MW: PUT /api/v1/grade-books/15<br/>Authorization: Bearer <access>
    MW->>MW: gán X-Request-Id, log, helmet, CORS, parse JSON
    MW->>AU: next()
    AU->>AU: verify JWT (chữ ký, hạn, typ=access)
    AU->>AU: sessionStore.isRevoked(sid, userId, ims)?
    AU->>RP: usersRepository.findById(sub)
    RP->>DB: SELECT ... FROM users
    AU-->>CAN: req.user = {id, role đọc từ DB, sid, ...}
    CAN->>CAN: PERMISSIONS['grade:write'] chứa role?
    CAN-->>VA: next()
    VA->>VA: params + body qua zod strictObject
    VA-->>CT: req.valid = {params:{id:15}, body:{scoreFinalTerm:9}}
    CT->>SV: updateGrade(req.user, 15, body)
    SV->>DB: BEGIN
    SV->>RP: findById(15) FOR UPDATE
    SV->>SV: canManageClass? (tầng 2 RBAC)
    SV->>RP: isPeriodLocked(lớp, HK, năm)?
    SV->>DM: calcSubjectAverage + classify
    SV->>RP: updateScores(...)
    SV->>SV: đồng bộ GPA/học lực học sinh (kỳ hiện hành)
    SV->>DB: COMMIT
    SV-->>CT: grade đã cập nhật
    CT-->>C: 200 {"success":true,"data":{...}}
```

Nếu **bất kỳ bước nào** ném lỗi, lỗi đi thẳng xuống `error-handler` (bước cuối của pipeline), transaction tự `ROLLBACK`:

```mermaid
flowchart LR
    X["Bất kỳ tầng nào<br/>throw Errors.xxx()"] --> EH["error-handler"]
    EH --> A{"Loại lỗi?"}
    A -- "AppError" --> R1["status + code của lỗi"]
    A -- "JSON hỏng" --> R2["400 BAD_REQUEST"]
    A -- "Body quá 1MB" --> R3["413 PAYLOAD_TOO_LARGE"]
    A -- "PG 23505 unique" --> R4["409 CONFLICT"]
    A -- "PG 23503 / 22003" --> R5["422 VALIDATION_ERROR"]
    A -- "Lỗi lạ" --> R6["500 INTERNAL_ERROR<br/>+ log stack trace"]
```

## 2.4. Pipeline middleware (thứ tự là có chủ đích)

Khai báo trong [`src/app.js`](../src/app.js):

```mermaid
flowchart TB
    R1["1. requestId<br/>nhận hoặc sinh X-Request-Id"] --> R2["2. pino-http<br/>log mỗi request (4xx=WARN, 5xx=ERROR)"]
    R2 --> R3["3. helmet<br/>header bảo mật"]
    R3 --> R4["4. cors<br/>chỉ origin trong CORS_ORIGINS"]
    R4 --> R5["5. express.json limit 1mb"]
    R5 --> R6["6. GET /health (kiểm tra DB)"]
    R6 --> R7["7. Router các module<br/>/api/v1/..."]
    R7 --> R8["8. notFoundHandler<br/>404 JSON"]
    R8 --> R9["9. errorHandler<br/>nơi DUY NHẤT sinh response lỗi"]
```

| Vị trí                   | Vì sao đặt ở đó                                                                  |
| ------------------------ | -------------------------------------------------------------------------------- |
| `requestId` đầu tiên     | Mọi log và mọi response lỗi sau đó đều mang cùng một id để truy vết              |
| log trước bảo mật        | Request bị chặn vẫn được ghi log                                                 |
| `json` sau `cors`        | Không tốn công parse body của request bị CORS chặn                               |
| `notFound` sau router    | Chỉ chạy khi không route nào khớp                                                |
| `errorHandler` cuối cùng | Express nhận diện error handler qua 4 tham số; mọi `throw`/`next(err)` đổ về đây |

Trong từng route, thứ tự luôn là **`authenticate → can(permission) → validate(schema) → controller`**:

- `authenticate` trước `can` vì phải biết **ai** rồi mới biết **có quyền không**.
- `can` trước `validate`: người không có quyền nhận 403 ngay, không cần biết dữ liệu gửi lên đúng hay sai
  (tránh lộ cấu trúc API cho người không có quyền).
- Kiểm tra **quyền sở hữu** (học sinh này có phải của bạn không) nằm trong **service**, vì cần đọc DB.

## 2.5. Composition root – nơi duy nhất nối các tầng

[`src/container.js`](../src/container.js) tạo mọi đối tượng và **tiêm** (inject) phụ thuộc vào nhau. Không file nào khác
tự `new`/`create` phụ thuộc của mình.

```mermaid
flowchart TB
    CFG["config (env.js)"] --> CONT
    POOL["pg Pool"] --> CONT
    LOGR["logger"] --> CONT
    CONT["buildContainer()"]

    CONT --> AUD["auditLogger(logger)"]
    CONT --> HASH["passwordHasher(rounds)"]
    CONT --> SS["sessionStore()"]
    CONT --> TS["tokenService(secrets, TTL)"]

    CONT --> UR["usersRepository(pool)"]
    CONT --> SR["studentsRepository(pool)"]
    CONT --> GR["gradesRepository(pool)"]
    CONT --> CR["classesRepository(pool)"]

    TS & SS & UR --> AUTHN["authenticate"]
    UR & SR & HASH & SS & AUD --> USV["usersService"]
    UR & SR & HASH & TS & SS & AUD --> ASV["authService"]
    GR & SR & AUD & POL["policy xếp loại"] --> GSV["gradesService"]
    SR --> CSV["conductService"]
    CR & SR & UR & AUD --> CLSV["classesService"]

    ASV --> R1["/auth router"]
    USV --> R2["/users router"]
    GSV --> R3["grades router"]
    CSV --> R4["conduct router"]
    CLSV --> R5["classes router"]
    AUTHN --> R1 & R2 & R3 & R4 & R5
```

Lợi ích cụ thể:

1. **Test dễ:** unit test truyền repository giả (object có vài hàm) vào service, không cần DB.
2. **Đổi hạ tầng không sửa nghiệp vụ:** ví dụ thay `sessionStore` trong RAM bằng Redis chỉ cần viết object mới cùng
   giao diện (`revokeSession`, `revokeAllForUser`, `isRevoked`, `markRefreshUsed`) và đổi **một dòng** trong container.
3. **Thấy toàn cảnh phụ thuộc ở một file**, không có "phụ thuộc ẩn" do `import` singleton rải rác.

## 2.6. Khởi động và tắt êm

```mermaid
sequenceDiagram
    participant OS as Hệ điều hành
    participant S as server.js
    participant CFG as loadConfig
    participant APP as createApp
    participant DB as Pool

    S->>CFG: đọc process.env (đã nạp từ .env)
    CFG-->>S: config đã kiểm tra (sai => throw, dừng ngay)
    S->>S: createLogger(pretty | json)
    S->>DB: createPool(DATABASE_URL)
    S->>APP: createApp({config, pool, logger})
    S->>S: listen(PORT), in danh sách route + link localhost
    OS-->>S: SIGINT / SIGTERM
    S->>S: server.close() (ngừng nhận request mới)
    S->>DB: pool.end()
    S->>OS: exit(0) (quá 10s thì exit(1))
```

- **Fail fast:** thiếu `DATABASE_URL`, JWT secret ngắn hơn 32 ký tự, hai secret trùng nhau, hoặc bật `DEMO_MODE` ở
  production → server **không khởi động** và in rõ lỗi.
- `createApp` **không gọi `listen`** để test tích hợp có thể dựng app trên cổng ngẫu nhiên.
