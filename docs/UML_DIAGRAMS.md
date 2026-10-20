# TÀI LIỆU THIẾT KẾ MÔ HÌNH HÓA UML TOÀN DIỆN (UML SPECIFICATIONS)
## HỆ THỐNG QUẢN LÝ TRƯỜNG HỌC (HTQLLH / SCHOOL MANAGEMENT SYSTEM)

- **Đơn vị thực hiện**: Nhóm Đồ Án Phát Triển Dự Án Phần Mềm - Đại học Hoa Sen (HSU)
- **Tiêu chuẩn kỹ thuật**: Chuẩn UML 2.5 (Unified Modeling Language) & IEEE 830 SRS
- **Hệ quản trị CSDL liên kết**: PostgreSQL 15 chuẩn 3NF (Xem [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md))
- **Mã nguồn thực thi**: Node.js Express Clean Architecture & React 18 SPA

---

## MỤC LỤC
1. [Sơ Đồ Use Case Tổng Thể & Phân Rã (Use Case Diagrams)](#1-sơ-đồ-use-case-tổng-thể--phân-rã-use-case-diagrams)
2. [Sơ Đồ Lớp Kiến Trúc Clean Architecture (Class Diagram)](#2-sơ-đồ-lớp-kiến-trúc-clean-architecture-class-diagram)
3. [Các Sơ Đồ Tuần Tự Nghiệp Vụ Cốt Lõi (Sequence Diagrams)](#3-các-sơ-đồ-tuần-tự-nghiệp-vụ-cốt-lõi-sequence-diagrams)
   - [3.1. SD-01: Xác thực & Đăng nhập Hệ thống (Authentication & RBAC)](#31-sd-01-xác-thực--đăng-nhập-hệ-thống-authentication--rbac)
   - [3.2. SD-02: Nhập Điểm, Tính ĐTB Môn Thông Tư 22 & Khóa Sổ Điểm](#32-sd-02-nhập-điểm-tính-đtb-môn-thông-tư-22--khóa-sổ-điểm)
   - [3.3. SD-03: Điểm Danh Chuyên Cần & Duyệt Đơn Nghỉ Học](#33-sd-03-điểm-danh-chuyên-cần--duyệt-đơn-nghỉ-học)
   - [3.4. SD-04: Thu Học Phí Trực Tuyến & Xuất Biên Lai PDF](#34-sd-04-thu-học-phí-trực-tuyến--xuất-biên-lai-pdf)
4. [Sơ Đồ Hoạt Động Quy Trình Tính Điểm Học Vụ (Activity Diagram)](#4-sơ-đồ-hoạt-động-quy-trình-tính-điểm-học-vụ-activity-diagram)
5. [Sơ Đồ Triển Khai Hạ Tầng Docker (Deployment Diagram)](#5-sơ-đồ-triển-khai-hạ-tầng-docker-deployment-diagram)

---

## 1. SƠ ĐỒ USE CASE TỔNG THỂ & PHÂN RÃ (USE CASE DIAGRAMS)

Hệ thống HTQLLH phục vụ 5 nhóm tác nhân (Actors) chính:
- **Ban Giám Hiệu (BGH / Admin)**
- **Giáo Viên Chủ Nhiệm (GVCN)**
- **Giáo Viên Bộ Môn (GV)**
- **Phụ Huynh Học Sinh (PH)**
- **Học Sinh (HS)**

```mermaid
graph TB
    subgraph SystemBoundary ["Hệ Thống Quản Lý Lớp Học & Học Vụ (HTQLLH)"]
        UC_AUTH(["Xác thực & Đăng nhập (JWT Auth)"])
        UC_SCHEDULE(["Quản lý Thời khóa biểu & Giảng dạy"])
        UC_GRADE(["Sổ điểm Điện tử & Tính GPA Thông tư 22"])
        UC_ATTEND(["Điểm danh Chuyên cần & Quản lý Nghỉ học"])
        UC_TUITION(["Học phí & Thanh toán Trực tuyến"])
        UC_REPORT(["Trích xuất Báo cáo Học vụ (Excel / PDF)"])
        UC_ADMIN(["Quản trị Hệ thống & Phân quyền"])
    end

    Admin["Ban Giám Hiệu / Admin"] --> UC_AUTH
    Admin --> UC_ADMIN
    Admin --> UC_GRADE
    Admin --> UC_ATTEND
    Admin --> UC_REPORT

    GVCN["Giáo viên Chủ nhiệm"] --> UC_AUTH
    GVCN --> UC_ATTEND
    GVCN --> UC_GRADE
    GVCN --> UC_REPORT

    GVBM["Giáo viên Bộ môn"] --> UC_AUTH
    GVBM --> UC_GRADE
    GVBM --> UC_ATTEND
    GVBM --> UC_SCHEDULE

    Student["Học sinh"] --> UC_AUTH
    Student --> UC_SCHEDULE
    Student --> UC_GRADE
    Student --> UC_ATTEND

    Parent["Phụ huynh"] --> UC_AUTH
    Parent --> UC_ATTEND
    Parent --> UC_GRADE
    Parent --> UC_TUITION
    Parent --> UC_REPORT
```

*Chi tiết toàn bộ đặc tả 43 Use Cases được lưu trữ tại: [USE_CASES.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/USE_CASES.md).*

---

## 2. SƠ ĐỒ LỚP KIẾN TRÚC CLEAN ARCHITECTURE (CLASS DIAGRAM)

Sơ đồ lớp minh họa sự phân chia ranh giới theo Clean Architecture giữa các tầng: Domain Entities -> Use Cases (Services) -> Interface Adapters (Controllers, Repositories) -> Infrastructure (Database, Unit of Work, Audit Logger).

```mermaid
classDiagram
    %% TẦNG THỰC THỂ MIỀN (DOMAIN ENTITIES)
    class Student {
        +int id
        +string studentCode
        +string fullName
        +string gender
        +string dob
        +string className
        +string parentName
        +string parentPhone
        +float gpa
        +string academicRank
        +string status
        +constructor(data)
    }

    class GradeBook {
        +int id
        +int studentId
        +string studentCode
        +string studentName
        +string className
        +string subjectName
        +string semester
        +string schoolYear
        +float scoreOral
        +float score15m
        +float score1Hour
        +float scoreMidTerm
        +float scoreFinalTerm
        +float averageScore
        +string gradeLetter
        +string status
        +calculateAverage() float
    }

    class User {
        +int id
        +string username
        +string password
        +string fullName
        +string role
        +Date createdAt
        +validatePassword(rawPassword) boolean
    }

    %% TẦNG NGHIỆP VỤ (USE CASES / SERVICES)
    class StudentService {
        +getAllStudents(className) Promise~Student[]~
        +getStudentById(id) Promise~Student~
        +createStudent(data) Promise~Student~
        +updateStudent(id, data) Promise~Student~
        +calculateAcademicPerformance(studentId) Promise~Student~
        +evaluateAcademicRank(gpa) string
    }

    class GradeBookService {
        +getGrades(filter) Promise~GradeBook[]~
        +saveGrade(gradeBook) Promise~GradeBook~
        +saveAllGrades(gradeBooks) Promise~GradeBook[]~
        +lockGradeSheet(className, subjectName) Promise~void~
        +unlockGradeSheet(className, subjectName) Promise~void~
        +calculateTBM(gb) GradeBook
    }

    %% TẦNG KHO DỮ LIỆU (REPOSITORIES)
    class StudentRepository {
        +findAll() Promise~Student[]~
        +findById(id) Promise~Student~
        +findByStudentCode(code) Promise~Student~
        +findByClassName(className) Promise~Student[]~
        +create(student) Promise~Student~
        +update(id, student) Promise~Student~
    }

    class GradeBookRepository {
        +findAll() Promise~GradeBook[]~
        +findById(id) Promise~GradeBook~
        +findByStudentCode(code) Promise~GradeBook[]~
        +findByClassName(className) Promise~GradeBook[]~
        +findByClassNameAndSubjectName(className, subject) Promise~GradeBook[]~
        +save(gradeBook) Promise~GradeBook~
        +updateStatusByClassAndSubject(className, subject, status) Promise~void~
    }

    %% TẦNG BỘ ĐIỀU KHIỂN (CONTROLLERS)
    class StudentController {
        +getStudents(req, res) Promise
        +getStudentById(req, res) Promise
        +createStudent(req, res) Promise
        +updateStudent(req, res) Promise
        +calculateGPA(req, res) Promise
    }

    class GradeBookController {
        +getGradeBook(req, res) Promise
        +saveGrades(req, res) Promise
        +lockGradeSheet(req, res) Promise
        +unlockGradeSheet(req, res) Promise
    }

    %% TẦNG HẠ TẦNG & GIAO DỊCH (INFRASTRUCTURE & TRANSACTION)
    class UnitOfWork {
        -client pgClient
        -boolean inTransaction
        +beginTransaction() Promise
        +query(text, params) Promise
        +commit() Promise
        +rollback() Promise
    }

    class AuditLogger {
        +log(entry) Object
        +getAuditLogs(filter) Object[]
    }

    %% QUAN HỆ TƯƠNG TÁC GIỮA CÁC LỚP
    StudentController ..> StudentService : điều phối nghiệp vụ
    GradeBookController ..> GradeBookService : điều phối nghiệp vụ

    StudentService ..> StudentRepository : truy xuất dữ liệu
    StudentService ..> GradeBookRepository : tổng hợp điểm GPA
    StudentService ..> Student : tạo thực thể

    GradeBookService ..> GradeBookRepository : truy xuất dữ liệu
    GradeBookService ..> GradeBook : tạo thực thể & tính ĐTBmhk
    GradeBookService ..> UnitOfWork : giao dịch nguyên tử 45 em
    GradeBookService ..> AuditLogger : ghi vết lịch sử sửa điểm

    StudentRepository ..> Student : ánh xạ dữ liệu SQL
    GradeBookRepository ..> GradeBook : ánh xạ dữ liệu SQL
```

---

## 3. CÁC SƠ ĐỒ TUẦN TỰ NGHIỆP VỤ CỐT LÕI (SEQUENCE DIAGRAMS)

### 3.1. SD-01: Xác thực & Đăng nhập Hệ thống (Authentication & RBAC)
```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (BGH/GV/PH/HS)
    participant UI as LoginPage.jsx
    participant Controller as AuthController
    participant Service as AuthService
    participant Repo as UserRepository
    participant DB as PostgreSQL DB

    User->>UI: Nhập Username, Password & Chọn Role
    UI->>Controller: POST /api/auth/login { username, password, role }
    Controller->>Service: authenticate(username, password, role)
    Service->>Repo: findByUsernameAndRole(username, role)
    Repo->>DB: SELECT * FROM users WHERE username = $1 AND role = $2
    DB-->>Repo: Trả về bản ghi User (PasswordHash)
    Repo-->>Service: User Entity Object
    Service->>Service: So khớp mật khẩu
    alt Mật khẩu hợp lệ
        Service->>Service: Sinh JWT Token phân quyền RBAC
        Service-->>Controller: { token, user: { username, role, fullName } }
        Controller-->>UI: HTTP 200 OK + Payload JSON
        UI->>UI: Lưu Token vào LocalStorage & Chuyển hướng Dashboard
        UI-->>User: Giao diện Trang chủ tương ứng quyền hạn
    else Mật khẩu không chính xác
        Service-->>Controller: Báo lỗi xác thực (401)
        Controller-->>UI: HTTP 401 Unauthorized
        UI-->>User: Hiển thị thông báo "Tài khoản hoặc mật khẩu không đúng"
    end
```

---

### 3.2. SD-02: Nhập Điểm, Tính ĐTB Môn Thông Tư 22 & Khóa Sổ Điểm
```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giáo viên Bộ môn
    participant UI as GradebookPage.jsx
    participant Controller as GradeBookController
    participant Service as GradeBookService
    participant UOW as UnitOfWork (Transaction)
    participant DB as PostgreSQL DB
    participant Audit as AuditLogger

    Teacher->>UI: Nhập điểm thành phần & Bấm "Lưu Bảng Điểm"
    UI->>Controller: POST /api/gradebook/save [ { studentCode, scoreOral, ... } ]
    Controller->>Service: saveAllGrades(gradeBooks[])
    Service->>Service: Kiểm tra ràng buộc hợp lệ (0 <= Điểm <= 10)
    Service->>Service: Áp dụng công thức trọng số Thông tư 22 (chia 9)
    Service->>UOW: beginTransaction()
    UOW->>DB: BEGIN TRANSACTION;
    loop Lặp qua 45 học sinh
        Service->>UOW: query(INSERT / UPDATE grade_books)
        UOW->>DB: Cập nhật dòng dữ liệu
    end
    alt Tất cả 45 học sinh đều hợp lệ
        Service->>UOW: commit()
        UOW->>DB: COMMIT TRANSACTION;
        Service->>Audit: AuditLogger.log("SAVE_GRADEBOOK_BATCH")
        Service-->>Controller: Thành công
        Controller-->>UI: HTTP 200 OK
        UI-->>Teacher: Thông báo "Đã lưu sổ điểm thành công"
    else Có lỗi tại học sinh thứ 40
        Service->>UOW: rollback()
        UOW->>DB: ROLLBACK TRANSACTION;
        Service-->>Controller: Ngoại lệ lỗi
        Controller-->>UI: HTTP 400 Bad Request
        UI-->>Teacher: Báo lỗi & Giữ nguyên dữ liệu ban đầu
    end
```

---

### 3.3. SD-03: Điểm Danh Chuyên Cần & Duyệt Đơn Nghỉ Học
```mermaid
sequenceDiagram
    autonumber
    actor Parent as Phụ huynh
    actor Teacher as Giáo viên Chủ nhiệm
    participant UI as AttendancePage.jsx
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant DB as PostgreSQL DB

    Parent->>UI: Nộp Đơn xin nghỉ học trực tuyến (Lý do: Ốm)
    UI->>Controller: POST /api/leave-requests { studentCode, fromDate, reason }
    Controller->>DB: INSERT INTO leave_requests (status = 'PENDING')
    DB-->>Controller: Lưu thành công
    
    Teacher->>UI: Mở danh sách đơn xin nghỉ
    UI->>Teacher: Hiển thị đơn chờ duyệt
    Teacher->>UI: Bấm "Duyệt Đơn"
    UI->>Controller: PUT /api/leave-requests/{id}/approve
    Controller->>DB: UPDATE leave_requests SET status = 'APPROVED'
    
    Teacher->>UI: Mở bảng điểm danh ngày
    Teacher->>UI: Đánh dấu "Vắng có phép" cho học sinh đã duyệt đơn
    UI->>Controller: POST /api/attendance/save { className, attDate, records[] }
    Controller->>Service: recordAttendance()
    Service->>DB: INSERT INTO attendances ...
    Controller-->>UI: Điểm danh hoàn tất
```

---

### 3.4. SD-04: Thu Học Phí Trực Tuyến & Xuất Biên Lai PDF
```mermaid
sequenceDiagram
    autonumber
    actor Parent as Phụ huynh
    participant UI as ParentCommunicationPage.jsx
    participant Controller as TuitionController
    participant Export as ExportEngine (jsPDF)
    participant DB as PostgreSQL DB

    Parent->>UI: Mở mục Học phí con em
    UI->>Parent: Hiển thị số tiền nợ & Mã VietQR chuyển khoản
    Parent->>UI: Quét mã QR thanh toán ngân hàng
    UI->>Controller: POST /api/tuition/pay { studentCode, amountPaid, receiptNo }
    Controller->>DB: UPDATE tuitions SET status = 'PAID', amount_paid = amount_due
    DB-->>Controller: Cập nhật thành công
    Controller-->>UI: Trạng thái đổi sang "ĐÃ ĐÓNG"
    
    Parent->>UI: Bấm "Tải Biên Lai Thu Tiền (PDF)"
    UI->>Export: exportTuitionReceiptToPDF(tuitionData)
    Export->>Export: Tạo tệp PDF biên lai đóng học phí khổ A4
    Export-->>Parent: Tải tệp PDF về máy thành công
```

---

## 4. SƠ ĐỒ HOẠT ĐỘNG QUY TRÌNH TÍNH ĐIỂM HỌC VỤ (ACTIVITY DIAGRAM)

Sơ đồ quy trình tính Điểm trung bình môn (ĐTBmhk) và xếp loại học lực theo Quy chế Thông tư 22/2021/TT-BGDĐT:

```mermaid
flowchart TD
    Start([Bắt đầu tính điểm]) --> InputScores[/Nhập điểm: Miệng, 15p, 1 tiết, Giữa kỳ, Cuối kỳ/]
    InputScores --> Validate{Đầy đủ cột điểm?}
    Validate -- Chưa đủ --> PendingState[Giữ trạng thái chờ nhập tiếp]
    Validate -- Đã đủ --> CalcFormula["Áp dụng trọng số: ĐTBmhk = (Miệng*1 + 15p*1 + 1tiết*2 + GiữaKỳ*2 + CuốiKỳ*3) / 9"]
    CalcFormula --> RoundScore[Làm tròn 1 chữ số thập phân]
    
    RoundScore --> CheckRank{Xét điểm ĐTBmhk}
    CheckRank -- ">= 9.0" --> RankXS[Xếp loại: Xuất sắc]
    CheckRank -- "8.0 - 8.9" --> RankG[Xếp loại: Giỏi]
    CheckRank -- "6.5 - 7.9" --> RankK[Xếp loại: Khá]
    CheckRank -- "5.0 - 6.4" --> RankTB[Xếp loại: Trung bình]
    CheckRank -- "< 5.0" --> RankY[Xếp loại: Yếu]

    RankXS --> SaveDB[(Lưu vào bảng grade_books)]
    RankG --> SaveDB
    RankK --> SaveDB
    RankTB --> SaveDB
    RankY --> SaveDB
    
    SaveDB --> End([Kết thúc quy trình])
```

---

## 5. SƠ ĐỒ TRIỂN KHAI HẠ TẦNG DOCKER (DEPLOYMENT DIAGRAM)

Sơ đồ triển khai cấu trúc Containerization theo [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml):

```mermaid
graph TB
    subgraph HostMachine ["Máy Chủ Vật Lý (Host Machine / Developer Laptop)"]
        Browser["Trình Duyệt Web (Chrome / Edge)"]
        
        subgraph DockerEngine ["Docker Engine Virtual Network (Bridge)"]
            subgraph BackendContainer ["Container: htqllh_backend"]
                NodeRuntime["Node.js 18 Alpine Runtime"]
                ExpressApp["Express.js Server (Port 8081)"]
                CleanArch["Clean Architecture Layers (Controllers/Services/Repos)"]
            end

            subgraph DatabaseContainer ["Container: htqllh_postgres"]
                PostgresService["PostgreSQL 15 Alpine Engine"]
                InternalDB["Database: school_management (Port 5432)"]
                Healthcheck["Healthcheck: pg_isready"]
            end
        end

        subgraph PersistentStorage ["Ổ Cứng Vật Lý Bền Vững (Host Storage)"]
            NamedVolume[("Docker Volume: postgres_data\n/var/lib/postgresql/data")]
        end

        FrontendVite["Frontend Web Server (Vite Port 5173)"]
    end

    Browser -- "HTTP Requests (Port 5173)" --> FrontendVite
    Browser -- "RESTful API (Port 8081)" --> ExpressApp
    FrontendVite -- "HTTP Fetch API Client" --> ExpressApp
    ExpressApp -- "Internal DNS: postgres-db:5432" --> InternalDB
    InternalDB --- NamedVolume
```

---

*Tài liệu được lưu trữ chính thức tại kho mã nguồn của đồ án phục vụ công tác đối soát, thẩm định đồ án và phản biện chuyên đề tốt nghiệp.*
