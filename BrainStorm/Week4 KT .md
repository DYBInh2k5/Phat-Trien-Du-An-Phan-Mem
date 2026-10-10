# BrainStorm Tuần 4: Chuyên Đề Nghiên Cứu Kiến Trúc Phần Mềm & Thiết Kế Clean Architecture Hệ Thống Quản Lý Trường Học (HTQLLH)

Tài liệu nghiên cứu chuyên sâu về Kiến trúc Phần mềm (Software Architecture), khảo sát và so sánh 5 mô hình kiến trúc tiêu biểu: **3-Layer Architecture**, **N-Layer Architecture**, **Clean Architecture**, **Event-Driven Architecture** và **Microservice Architecture**; nghiên cứu chuyên sâu nền tảng Backend **Node.js**, **Express.js**, cơ chế **Event Loop / Non-blocking I/O** và thiết kế chi tiết mô hình **Clean Architecture kết hợp Node.js & PostgreSQL** cho **Hệ thống Quản lý Trường học (HTQLLH)**.

---

## BẢNG PHÂN CÔNG NHIỆM VỤ THÀNH VIÊN

| STT | Họ và tên | Nhiệm vụ phân công | Tỷ lệ hoàn thành |
| :---: | :--- | :--- | :---: |
| 1 | **Võ Duy Bình** | Nghiên cứu 3-Layer Architecture và N-Layer Architecture; trình bày khái niệm, cấu trúc, nguyên lý hoạt động, ưu điểm, hạn chế và trường hợp sử dụng | 20% |
| 2 | **Nguyễn Minh Quốc Bảo** | Nghiên cứu Event-Driven Architecture và Microservice Architecture; trình bày khái niệm, cấu trúc, cơ chế hoạt động, ưu điểm, hạn chế và trường hợp sử dụng | 20% |
| 3 | **Trần Quang Vinh** | Nghiên cứu Node.js, Event Loop, Non-blocking I/O, Express.js, RESTful API; phân tích Node.js kết hợp Clean Architecture, đề xuất cấu trúc Backend và thực hiện phần kết luận | 20% |
| 4 | **Võ Hoàng Sơn** | Xây dựng mục tiêu nghiên cứu, phạm vi nghiên cứu, giới hạn nghiên cứu; định hướng nội dung và thống nhất phạm vi báo cáo; rà soát nội dung báo cáo | 20% |
| 5 | **Huỳnh Trung Tính** | Thực hiện so sánh 5 kiến trúc, phân tích lý do lựa chọn Clean Architecture; nghiên cứu sâu các thành phần, Dependency Rule, luồng xử lý và ví dụ áp dụng vào hệ thống quản lý trường học | 20% |

---

## CHƯƠNG I: MỤC TIÊU VÀ PHẠM VI NGHIÊN CỨU

### 1.1. Mục tiêu nghiên cứu
Chuyên đề tập trung khảo sát và đánh giá 5 mô hình kiến trúc phần mềm phổ biến, gồm:
- 3-Layer Architecture.
- N-Layer Architecture.
- Clean Architecture.
- Event-Driven Architecture.
- Microservice Architecture.

Trên cơ sở so sánh các kiến trúc theo những tiêu chí như cấu trúc, phân tách trách nhiệm, khả năng bảo trì, kiểm thử, mở rộng và độ phức tạp triển khai, chuyên đề lựa chọn **Clean Architecture** để phân tích chuyên sâu.

Sau khi xác định kiến trúc, chuyên đề nghiên cứu **Node.js** làm nền tảng phát triển backend và xem xét cách tổ chức backend Node.js kết hợp Express.js và PostgreSQL theo Clean Architecture.

### 1.2. Phạm vi nghiên cứu
Phạm vi nghiên cứu gồm ba nội dung chính:
- **Kiến trúc phần mềm**: Khảo sát cấu trúc, đặc điểm, ưu điểm, hạn chế và phạm vi áp dụng của 5 kiến trúc; thực hiện so sánh và lựa chọn kiến trúc phù hợp.
- **Clean Architecture**: Phân tích cấu trúc các thành phần chính (Entities, Use Cases, Interface Adapters, Frameworks & Drivers), trách nhiệm của từng lớp, quy tắc phụ thuộc (Dependency Rule) và luồng xử lý một yêu cầu trong hệ thống.
- **Node.js Backend**: Nghiên cứu Node.js ở vai trò nền tảng backend, bao gồm Event Loop, cơ chế non-blocking I/O, xử lý bất đồng bộ (async/await), Express.js, REST API và kết nối cơ sở dữ liệu PostgreSQL. Đồng thời phân tích cách đặt các thành phần Node.js vào cấu trúc Clean Architecture.
- Các ví dụ minh họa được xây dựng dựa trên Hệ thống Quản lý Trường học, tập trung vào các nghiệp vụ học sinh, lớp học, môn học và điểm số.

### 1.3. Giới hạn nghiên cứu
- Chuyên đề tập trung vào phân tích kiến trúc và công nghệ nền tảng, không triển khai hệ thống dạng phân tán phức tạp ở giai đoạn đầu.
- Trong 5 kiến trúc được khảo sát, Clean Architecture là kiến trúc được phân tích chuyên sâu; các kiến trúc còn lại chủ yếu phục vụ việc so sánh và lựa chọn.

---

## CHƯƠNG II: NGHIÊN CỨU VÀ PHÂN TÍCH CÁC KIẾN TRÚC PHẦN MỀM

### 2.1. 3-Layer Architecture (Kiến trúc 3 Tầng)

#### 2.1.1. Khái niệm & Cấu trúc
3-Layer Architecture tổ chức ứng dụng thành 3 lớp tuần tự theo trách nhiệm:
- **Presentation Layer**: Tiếp nhận thao tác từ người dùng và hiển thị kết quả.
- **Business Logic Layer (BLL)**: Xử lý nghiệp vụ và các quy tắc của hệ thống.
- **Data Access Layer (DAL)**: Thực hiện truy vấn và lưu trữ dữ liệu.
Luồng xử lý cơ bản: `Presentation` $\rightarrow$ `Business Logic` $\rightarrow$ `Data Access` $\rightarrow$ `Database`.

#### 2.1.2. Ưu điểm & Hạn chế
- **Ưu điểm**: Cấu trúc đơn giản, dễ tiếp cận; phân tách trách nhiệm rõ ràng; phù hợp ứng dụng quy mô nhỏ và vừa; dễ tổ chức mã nguồn theo nhóm chức năng ban đầu.
- **Hạn chế**: Business Logic bị phụ thuộc trực tiếp vào Data Access; khi nghiệp vụ phát triển lớn, lớp Business Logic dễ trở nên phức tạp; thay đổi công nghệ hạ tầng (đổi CSDL) có thể ảnh hưởng dây chuyền đến các lớp bên trên.

---

### 2.2. N-Layer Architecture (Kiến trúc Đa Tầng)

#### 2.2.1. Khái niệm & Cấu trúc
N-Layer Architecture mở rộng cách phân lớp của 3-Layer bằng cách chia ứng dụng thành nhiều lớp chuyên biệt hơn:
`Presentation` $\rightarrow$ `API` $\rightarrow$ `Application` $\rightarrow$ `Business` $\rightarrow$ `Data Access` $\rightarrow$ `Database`.
Ngoài các lớp chính, hệ thống có thêm các thành phần như DTO (Data Transfer Object), Mapper, Authentication và Logging.

#### 2.2.2. Ưu điểm & Hạn chế
- **Ưu điểm**: Phân tách trách nhiệm chi tiết hơn 3-Layer; dễ mở rộng khi số lượng chức năng tăng; có thể tổ chức riêng DTO và Mapper; dễ thay đổi một thành phần nếu duy trì ranh giới tốt.
- **Hạn chế**: Nhiều lớp làm tăng số lượng tệp và thành phần cần quản lý; luồng xử lý dài; việc chia lớp quá mức có thể tạo ra các lớp trung gian không cần thiết (Boilerplate code).

---

### 2.3. Clean Architecture (Kiến trúc Sạch)

#### 2.3.1. Khái niệm & Cấu trúc
Clean Architecture tổ chức hệ thống theo các vòng đồng tâm, trong đó quy tắc nghiệp vụ cốt lõi nằm ở trung tâm và độc lập hoàn toàn với các yếu tố bên ngoài như giao diện, framework và cơ sở dữ liệu.
Bốn vòng tròn đồng tâm gồm:
`Entities` $\rightarrow$ `Use Cases` $\rightarrow$ `Interface Adapters` $\rightarrow$ `Frameworks & Drivers`.

- **Entities**: Chứa các quy tắc nghiệp vụ cốt lõi của miền bài toán (Domain Business Rules).
- **Use Cases**: Thực hiện các nghiệp vụ cụ thể của hệ thống (Application Business Rules).
- **Interface Adapters**: Chuyển đổi dữ liệu giữa Use Cases và các thành phần bên ngoài (Controllers, Repositories, Presenters).
- **Frameworks & Drivers**: Chứa các công nghệ cụ thể như Web Framework (Express.js), Database (PostgreSQL) và các thư viện bên ngoài.

#### 2.3.2. Dependency Rule (Quy tắc Phụ thuộc)
Nguyên tắc quan trọng nhất: **Dependency chỉ được hướng từ bên ngoài vào bên trong**.
Entities và Use Cases không được phụ thuộc trực tiếp vào Controller, Database hoặc Framework.
Đối với Database, Use Case sử dụng một abstraction (Repository Interface), còn phần triển khai (Repository Implementation) nằm ở lớp ngoài cùng:
`Use Case` $\rightarrow$ `Repository Interface` $\leftarrow$ `Repository Implementation` $\rightarrow$ `Database`.

#### 2.3.3. Ưu điểm & Hạn chế
- **Ưu điểm**: Tách biệt nghiệp vụ khỏi công nghệ; kiểm soát hướng phụ thuộc rõ ràng; kiểm thử Use Case độc lập cực kỳ thuận lợi; dễ dàng thay đổi Framework hoặc Database; phù hợp với hệ thống có nghiệp vụ học vụ phức tạp cần bảo trì lâu dài.
- **Hạn chế**: Thiết kế phức tạp hơn mô hình phân lớp đơn giản; cần viết thêm Interface, DTO, Mapper; chi phí thiết kế ban đầu cao hơn.

---

### 2.4. Event-Driven Architecture (EDA - Kiến trúc Hướng Sự kiện)

#### 2.4.1. Khái niệm & Các thành phần chính
EDA tổ chức giao tiếp giữa các thành phần dựa trên Event (thông tin mô tả một sự kiện đã xảy ra, ví dụ `StudentMarkedAbsent`).
- **Event Producer**: Phát Event sau khi một sự kiện xảy ra trong hệ thống.
- **Event**: Dữ liệu mô tả sự kiện (chứa `studentId`, `classId`, `date`, `absenceType`).
- **Event Broker**: Tiếp nhận và phân phối Event đến các bên đăng ký (Message Broker).
- **Event Consumer**: Nhận và xử lý Event một cách độc lập.
Luồng cơ bản: `Producer` $\rightarrow$ `Event` $\rightarrow$ `Broker` $\rightarrow$ `Consumers`.

#### 2.4.2. Cơ chế hoạt động & Đánh giá
- **Ví dụ trong trường học**: Sau khi giáo viên hoàn tất điểm danh, hệ thống phát sự kiện `StudentMarkedAbsent`. Event này đồng thời kích hoạt:
  1. *Notification Service*: Gửi thông báo đến ứng dụng của phụ huynh.
  2. *Statistics Service*: Cập nhật tỷ lệ chuyên cần của lớp.
  3. *Audit Service*: Ghi nhật ký thao tác.
- **Ưu điểm**: Giảm phụ thuộc trực tiếp; dễ dàng thêm Consumer mới mà không sửa Producer; rất phù hợp cho các tác vụ nền và xử lý bất đồng bộ.
- **Hạn chế**: Luồng xử lý khó theo dõi hơn giao tiếp trực tiếp; gỡ lỗi phức tạp; xuất hiện tính nhất quán cuối cùng (Eventual Consistency); cần bổ sung hạ tầng message broker và chi phí vận hành.

---

### 2.5. Microservice Architecture (Kiến trúc Vi dịch vụ)

#### 2.5.1. Khái niệm & Cấu trúc
Microservice chia hệ thống thành nhiều dịch vụ nhỏ, tương đối độc lập, mỗi dịch vụ phụ trách một phạm vi nghiệp vụ riêng (Student Service, Subject Service, Grade Service, Notification Service, Authentication Service).
Các thành phần hỗ trợ: API Gateway, Service Discovery, Message Broker, Database riêng biệt cho từng dịch vụ.

#### 2.5.2. Ưu điểm & Hạn chế
- **Ưu điểm**: Các Service có thể triển khai và mở rộng độc lập; giảm phạm vi ảnh hưởng khi sửa đổi một chức năng; cho phép các nhóm phát triển làm việc độc lập.
- **Hạn chế**: Độ phức tạp vận hành rất cao; quản lý giao tiếp mạng giữa các service phức tạp; phát sinh vấn đề nhất quán dữ liệu phân tán; không phù hợp nếu quy mô hệ thống chưa đủ lớn để bù đắp chi phí vận hành.

---

### 2.6. Phân loại 3 Cấp độ Kiến trúc

Năm kiến trúc trên không hoàn toàn nằm ở cùng một cấp độ so sánh:

| Cấp độ | Kiến trúc | Vấn đề giải quyết |
| :--- | :--- | :--- |
| **Tổ chức bên trong ứng dụng** | 3-Layer, N-Layer, Clean Architecture | Phân chia trách nhiệm và kiểm soát phụ thuộc giữa các tầng mã nguồn |
| **Giao tiếp giữa các thành phần** | Event-Driven Architecture | Cách thức các thành phần trao đổi thông tin bất đồng bộ |
| **Chia và triển khai hệ thống** | Microservice Architecture | Cách chia hệ thống thành các dịch vụ độc lập có thể triển khai riêng biệt |

Do đó, các kiến trúc có thể được kết hợp: chẳng hạn một dịch vụ có thể áp dụng Clean Architecture bên trong và sử dụng Event-Driven để xử lý thông báo gửi cho phụ huynh.

---

## CHƯƠNG III: SO SÁNH VÀ LỰA CHỌN KIẾN TRÚC

### 3.1. Bảng So Sánh 5 Kiến Trúc Phần Mềm

| Tiêu chí Đánh giá | 3-Layer | N-Layer | Clean Architecture (Chốt) | Event-Driven | Microservice |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Độ phức tạp** | Thấp | Trung bình | **Trung bình - cao** | Cao | Cao |
| **Phân tách trách nhiệm** | Khá | Tốt | **Rất tốt** | Tốt | Rất tốt |
| **Khả năng bảo trì** | Tốt | Tốt | **Rất tốt** | Khá | Tốt |
| **Khả năng kiểm thử nghiệp vụ** | Khá | Tốt | **Rất tốt** | Khá | Tốt |
| **Mức độ phụ thuộc** | Trung bình | Trung bình | **Thấp (DIP)** | Thấp giữa Producer/Consumer | Thấp giữa các Service |
| **Khả năng mở rộng** | Khá | Tốt | **Tốt** | Tốt | Rất tốt |
| **Độ phức tạp vận hành** | Thấp | Thấp - trung bình | **Thấp (Triển khai đơn khối)** | Trung bình - cao | Cao |
| **Phù hợp với đồ án** | Tốt | Tốt | **Rất tốt (Tối ưu nhất)** | Bổ sung (Xử lý thông báo) | Thấp (Chi phí quá cao) |

### 3.2. Lý do Lựa chọn Clean Architecture
1. **Phù hợp với đặc điểm nghiệp vụ**: Hệ thống có nhiều nhóm nghiệp vụ học vụ (học sinh, lớp, môn, điểm số, điểm danh, học phí, tài khoản). Clean Architecture giúp tách các quy tắc nghiệp vụ cốt lõi khỏi giao diện Web và CSDL PostgreSQL.
2. **Kiểm soát hướng phụ thuộc**: Dependency Rule bảo đảm Controller, Express.js và PostgreSQL không trở thành dependency của business logic.
3. **Hỗ trợ bảo trì và mở rộng**: Khi thay đổi công thức tính điểm TBM hoặc điều kiện sửa điểm, chỉ cần thay đổi trong Use Case hoặc Entity mà không ảnh hưởng tầng Controller và Database.
4. **Hỗ trợ kiểm thử (Testability)**: Các Use Case có thể được kiểm thử độc lập với CSDL thật bằng cách sử dụng các Mock/Fake Repository.
5. **Phù hợp với quy mô dự án**: Clean Architecture cho phép duy trì một backend thống nhất (Modular Monolith) nhưng vẫn có ranh giới rõ ràng, tránh sự phức tạp vận hành mạng của Microservice.

---

## CHƯƠNG IV: PHÂN TÍCH CHI TIẾT CLEAN ARCHITECTURE

### 4.1. Các Thành phần Chính
1. **Entities**: Chứa quy tắc nghiệp vụ cốt lõi (Student, Teacher, Subject, Grade, Class, Tuition).
2. **Use Cases**: Điều phối luồng nghiệp vụ phục vụ từng chức năng (EnterGrade, CalculateGPA, MarkAttendance, PayTuition).
3. **Interface Adapters**: Chuyển đổi dữ liệu (Controller, Presenter, DTO, Repository Implementation).
4. **Frameworks & Drivers**: Công nghệ cụ thể bên ngoài (Node.js runtime, Express.js framework, PostgreSQL database).

### 4.2. Dependency Rule và Cơ chế Trừu tượng hóa (Abstraction)
Thay vì: `Use Case` $\rightarrow$ `PostgreSQL`  
Clean Architecture áp dụng:  
`Use Case` $\rightarrow$ `IGradeRepository (Interface)` $\leftarrow$ `GradeRepositoryPostgreSQL` $\rightarrow$ `PostgreSQL`.

```
                         Express.js
                              │
                              ▼
                         Controller
                              │
                              ▼
                          Use Case
                         /        \
                        ▼          ▼
                    Entity    Repository Interface
                                   ▲
                                   │ implements
                                   │
                         Repository Implementation
                                   │
                                   ▼
                              PostgreSQL
```

### 4.3. Ví dụ Luồng Xử lý Nghiệp vụ Nhập Điểm (EnterGrade)
1. **Client**: Gửi request `POST /api/grades` với dữ liệu `{ studentId: 101, subjectId: 5, score: 8.5 }`.
2. **Controller**: `GradeController` tiếp nhận request, kiểm tra định dạng đầu vào cơ bản và chuyển dữ liệu cho `EnterGradeUseCase`.
3. **Use Case**: `EnterGradeUseCase` thực hiện:
   - Kiểm tra học sinh và môn học tồn tại.
   - Kiểm tra giáo viên có quyền nhập điểm cho lớp/môn này.
   - Kiểm tra giá trị điểm hợp lệ ($0.0 \le \text{score} \le 10.0$).
   - Kiểm tra trạng thái sổ điểm (chưa bị khóa).
   - Gọi abstraction `IGradeRepository.save(grade)`.
4. **Repository Implementation**: `GradeRepositoryPostgreSQL` thực thi câu lệnh SQL với PostgreSQL.
5. **Kết quả**: Trả kết quả ngược lại Use Case $\rightarrow$ Controller $\rightarrow$ HTTP Response JSON cho Client.

---

## CHƯƠNG V: NGHIÊN CỨU VÀ LỰA CHỌN CÔNG NGHỆ BACKEND

### 5.1. Tổng quan Node.js
Node.js là một môi trường runtime cho phép thực thi JavaScript ở phía máy chủ, được xây dựng trên JavaScript Engine V8 của Google. Node.js cung cấp các API cần thiết để xử lý HTTP request, đọc ghi tệp, và kết nối CSDL, kết hợp hệ sinh thái npm phong phú.

Phân biệt vai trò các thành phần trong hệ thống:
| Thành phần | Vai trò |
| :--- | :--- |
| **JavaScript** | Ngôn ngữ lập trình xuyên suốt từ Frontend đến Backend |
| **Node.js** | Môi trường runtime thực thi JavaScript phía máy chủ |
| **Express.js** | Framework xây dựng ứng dụng Web và RESTful API trên Node.js |
| **PostgreSQL** | Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu |

### 5.2. Kiến trúc và Cơ chế Hoạt động của Node.js
1. **Mô hình Event Loop & Non-blocking I/O**:
   - Node.js sử dụng mô hình đơn luồng sự kiện (Single-Threaded Event Loop) kết hợp cơ chế non-blocking I/O.
   - Khi một request cần truy vấn PostgreSQL, Node.js ủy quyền tác vụ I/O cho luồng nền và tiếp tục nhận các request khác trong thời gian chờ kết quả. Khi thao tác I/O hoàn thành, callback/Promise được đưa trở lại Event Loop để phản hồi cho client.
2. **Xử lý Bất đồng bộ với async/await**:
   - Giúp mã nguồn rõ ràng, tránh callback hell khi thực hiện các chuỗi truy vấn dữ liệu học vụ.

### 5.3. Express.js và Vai trò Xây dựng RESTful API
- **Route & Controller**: Định nghĩa các endpoint chuẩn REST (`GET /api/students`, `POST /api/grades`, `PUT /api/grades/:id`, `DELETE /api/students/:id`). Controller chỉ tiếp nhận request, gọi Use Case và trả response, không chứa công thức nghiệp vụ.
- **Middleware**: Thực hiện các tác vụ dùng chung xuyên suốt: Authentication (xác thực JWT), Authorization (kiểm tra quyền RBAC), Request Validation, Logging và Error Handling tập trung.

### 5.4. So Sánh Node.js với Spring Boot và ASP.NET Core

| Tiêu chí | Node.js (Selected) | Spring Boot | ASP.NET Core |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ** | JavaScript / TypeScript | Java | C# |
| **Môi trường thực thi** | Node.js Runtime (V8) | JVM | .NET Runtime |
| **Xử lý bất đồng bộ** | Rất tốt (Event Loop non-blocking) | Tốt (Reactive/Virtual Threads) | Tốt (Async/Await Task) |
| **Xây dựng REST API** | Rất nhanh, gọn nhẹ | Toàn diện, chuẩn doanh nghiệp | Toàn diện, hiệu năng cao |
| **Hệ sinh thái** | npm (Khổng lồ) | Maven / Gradle | NuGet |
| **Độ linh hoạt** | Rất cao | Trung bình (Nhiều cấu hình) | Khá |
| **Phù hợp với dự án HTQLLH** | **Tối ưu nhất (Dùng chung JS với React)** | Tốt nhưng nặng | Tốt nhưng phức tạp hơn |

### 5.5. Lý do Lựa chọn Node.js cho Dự án
- **Đồng nhất ngôn ngữ**: Cho phép sử dụng JavaScript cho cả React Frontend và Backend.
- **Phù hợp với các tác vụ I/O**: Hệ thống trường học chủ yếu đọc/ghi CSDL PostgreSQL và xử lý HTTP API, rất phù hợp với Non-blocking I/O của Node.js.
- **Hệ sinh thái phong phú**: Thư viện `pg`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv` hỗ trợ đầy đủ.
- **Phù hợp triển khai Docker**: Khởi động nhanh, tốn ít tài nguyên bộ nhớ so với JVM.

### 5.6. Cấu trúc Thư mục Backend Node.js theo Clean Architecture
Backend được tổ chức theo cấu trúc chuẩn Clean Architecture:

```
school-management-nodejs/
├── src/
│   ├── entities/                      # Vòng 1: Domain Entities & Quy tắc cốt lõi
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Grade.js
│   │   └── Class.js
│   │
│   ├── use-cases/                     # Vòng 2: Nghiệp vụ ứng dụng
│   │   ├── EnterGrade.js
│   │   ├── CalculateGPA.js
│   │   ├── MarkAttendance.js
│   │   └── CreateStudent.js
│   │
│   ├── interfaces/                    # Vòng 3: Adapters chuyển đổi dữ liệu
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── StudentController.js
│   │   │   └── GradeController.js
│   │   └── repositories/              # Interface định nghĩa hợp đồng
│   │       ├── IStudentRepository.js
│   │       └── IGradeRepository.js
│   │
│   ├── infrastructure/                # Vòng 4: Công nghệ & Chi tiết cụ thể
│   │   ├── database/
│   │   │   └── postgres.js            # Kết nối PostgreSQL (pg Pool)
│   │   └── repositories/              # Triển khai thao tác SQL thật
│   │       ├── StudentRepositoryPostgreSQL.js
│   │       └── GradeRepositoryPostgreSQL.js
│   │
│   ├── routes/                        # Định tuyến Express
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── gradeRoutes.js
│   │   └── index.js
│   │
│   └── app.js                         # Cấu hình Express App & Middleware
│
├── server.js                          # Composition Root: Khởi động Server & kết nối
└── package.json
```

Theo định hướng này, hệ thống được triển khai ban đầu dưới dạng một Backend đơn khối (Modular Monolith) sử dụng Node.js + Express.js và PostgreSQL, mã nguồn được phân tách chặt chẽ theo Clean Architecture.

---

## CHƯƠNG VI: KẾT LUẬN

1. Báo cáo chuyên đề đã hoàn thành khảo sát và so sánh 5 kiến trúc phần mềm (3-Layer, N-Layer, Clean Architecture, Event-Driven, Microservice), đồng thời khẳng định Clean Architecture là giải pháp tối ưu nhất cho Hệ thống Quản lý Trường học.
2. Clean Architecture bảo vệ các quy tắc nghiệp vụ học vụ cốt lõi khỏi sự phụ thuộc vào framework và CSDL, giúp việc bảo trì, mở rộng và kiểm thử tự động trở nên dễ dàng.
3. Node.js kết hợp cùng Express.js và PostgreSQL là nền tảng công nghệ phù hợp nhất cho dự án, mang lại tốc độ phản hồi cao, khả năng xử lý I/O bất đồng bộ vượt trội và tính đồng nhất ngôn ngữ JavaScript toàn hệ thống.

---

## CHƯƠNG VII: TÀI LIỆU THAM KHẢO

1. **The Clean Architecture**: Robert C. Martin (Uncle Bob).  
   Link: [https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. **Node.js Documentation**: OpenJS Foundation.  
   Link: [https://nodejs.org/docs/latest/api/](https://nodejs.org/docs/latest/api/)
3. **Express.js Guide**: StrongLoop & OpenJS Foundation.  
   Link: [https://expressjs.com/](https://expressjs.com/)
4. **Software Architecture Patterns Guide**: Martin Fowler.  
   Link: [https://martinfowler.com/architecture/](https://martinfowler.com/architecture/)
5. **PostgreSQL Documentation**: PostgreSQL Global Development Group.  
   Link: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
6. **Mã nguồn dự án Phat-Trien-Du-An-Phan-Mem**: Tài liệu nội bộ nhóm thực hiện đề tài Xây dựng Hệ thống Quản lý Trường học.
