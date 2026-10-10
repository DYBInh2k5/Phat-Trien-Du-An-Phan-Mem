# BrainStorm Tuần 5: Chuyên Đề Nghiên Cứu Mẫu Thiết Kế Phần Mềm (Design Patterns) & Áp Dụng Cho Hệ Thống Quản Lý Trường Học (HTQLLH)

Tài liệu nghiên cứu chuyên sâu về các Mẫu thiết kế phần mềm (Design Patterns) và Nguyên lý thiết kế hướng đối tượng (SOLID), khảo sát chi tiết 6 mẫu & nguyên lý cốt lõi: **MVC**, **MVVM**, **Repository Pattern**, **Unit of Work**, **Dependency Inversion Principle (DIP)** và **Dependency Injection (DI)**; đối chiếu với hiện trạng mã nguồn thực tế và đề xuất lộ trình áp dụng cho **Hệ thống Quản lý Trường học (HTQLLH)**.

---

## BẢNG PHÂN CÔNG NHIỆM VỤ THÀNH VIÊN

| STT | Họ và tên | Nhiệm vụ phân công | Tỷ lệ hoàn thành |
| :---: | :--- | :--- | :---: |
| 1 | **Võ Duy Bình** | Tìm hiểu MVC và MVVM: khái niệm, cấu trúc, nguyên lý hoạt động, ưu/nhược điểm, trường hợp sử dụng và ví dụ minh họa | 20% |
| 2 | **Nguyễn Minh Quốc Bảo** | Tìm hiểu Repository Pattern: khái niệm, cấu trúc, nguyên lý hoạt động, ưu/nhược điểm, trường hợp sử dụng và ví dụ minh họa | 20% |
| 3 | **Trần Quang Vinh** | Tìm hiểu Unit of Work: khái niệm, quản lý giao dịch, ưu/nhược điểm, trường hợp sử dụng và ví dụ minh họa | 20% |
| 4 | **Võ Hoàng Sơn** | Tìm hiểu Dependency Inversion Principle và Dependency Injection: khái niệm, phân biệt hai khái niệm, vòng đời đối tượng, ví dụ minh họa; rà soát nội dung báo cáo | 20% |
| 5 | **Huỳnh Trung Tính** | Tổng hợp và so sánh 6 mẫu và nguyên lý; xây dựng các bảng so sánh, đánh giá khả năng áp dụng; biên soạn phần kết luận và sơ đồ | 20% |

---

## CHƯƠNG I: MỤC TIÊU VÀ PHẠM VI NGHIÊN CỨU

### 1. Mục tiêu
Mục tiêu của chuyên đề là tìm hiểu các mẫu thiết kế và nguyên lý thiết kế phổ biến trong phát triển phần mềm hướng đối tượng, làm rõ mỗi mẫu giải quyết vấn đề nào và đặt trách nhiệm ở đâu trong mã nguồn. Kết quả nghiên cứu hỗ trợ nhóm quyết định áp dụng mẫu nào cho **Hệ thống Quản lý Trường học (HTQLLH)**, thay vì chọn mẫu chỉ vì tên gọi quen thuộc.

Hệ thống phục vụ Ban Giám hiệu, giáo viên chủ nhiệm, giáo viên bộ môn, học sinh và phụ huynh, với các phân hệ quản lý học sinh, lớp học, môn học, sổ điểm, điểm danh và học phí. Các phân hệ dùng chung dữ liệu và có những thao tác cần tính toàn vẹn cao, điển hình là giáo viên lưu bảng điểm của cả lớp 45 học sinh trong một lần. Vì vậy, cách tổ chức mã cần giúp nhóm thống nhất quy tắc xử lý, tránh sao chép công thức tính điểm ở nhiều nơi và tránh để lỗi ở một bản ghi làm hỏng dữ liệu của cả lớp.

### 2. Giới hạn nghiên cứu
Chuyên đề khảo sát 6 nội dung: MVC và MVVM (mẫu tổ chức tầng giao diện), Repository Pattern và Unit of Work (mẫu tổ chức tầng dữ liệu), Dependency Inversion Principle (DIP) và Dependency Injection (DI) (nguyên lý và kỹ thuật quản lý phụ thuộc).
Cần phân biệt bản chất: MVC, MVVM, Repository và Unit of Work là các mẫu thiết kế; DIP là một nguyên lý trong bộ nguyên lý SOLID; DI là một kỹ thuật hiện thực hóa nguyên lý đó. Sáu nội dung không phải là sáu phương án thay thế cho nhau, mà thường được dùng phối hợp trong cùng một hệ thống.

Bối cảnh minh họa là ứng dụng Web quản lý trường học của nhóm: giao diện dùng React 18, Vite và Tailwind CSS; backend dùng Node.js với Express (ES Module) và thư viện `pg` kết nối PostgreSQL; xác thực dùng JWT; triển khai bằng Docker Compose.

---

## CHƯƠNG II: NGHIÊN CỨU VÀ PHÂN TÍCH CÁC MẪU THIẾT KẾ

### 1. MVC (Model-View-Controller)

#### 1.1. Khái niệm & Cấu trúc
MVC là mẫu tổ chức tầng giao diện của ứng dụng thành ba thành phần:
- **Model**: Nắm giữ dữ liệu và quy tắc nghiệp vụ.
- **View**: Trình bày thông tin cho người dùng.
- **Controller**: Tiếp nhận thao tác của người dùng và điều phối giữa hai thành phần còn lại.
Trong HTQLLH, hệ thống áp dụng biến thể MVC tách đôi: Controller và Model ở backend (Node.js/Express), View ở frontend (React SPA), giao tiếp thông qua hợp đồng RESTful API.

#### 1.2. Đối chiếu Ba Thành phần MVC với Mã Nguồn Dự Án
| Thành phần | Thành phần hiện có trong source | Nhận xét đối chiếu |
| :--- | :--- | :--- |
| **Model** | Entity `GradeBook`; hàm tính điểm | Cần thống nhất một nơi tính điểm duy nhất ở backend thay vì lặp lại |
| **View** | `GradebookPage.jsx`; `StudentListPage.jsx` | Đã có giao diện React; hàm tính điểm ở frontend chỉ dùng để xem trước (preview) |
| **Controller** | Các Controller trong `controllers/` | Cần giữ Controller mỏng (Slim Controller), chỉ điều phối gọi Service/Use Case |

#### 1.3. Ưu điểm & Hạn chế
- **Ưu điểm**: Tách giao diện khỏi xử lý nghiệp vụ; dễ phân công công việc giữa frontend và backend; framework Express hỗ trợ tự nhiên.
- **Hạn chế**: Dễ mắc lỗi Fat Controller (nhồi nhét kiểm tra dữ liệu, tính điểm và truy vấn SQL vào Controller); không tự giải quyết được việc quản lý giao dịch CSDL phức tạp (cần Repository và Unit of Work hỗ trợ).

---

### 2. MVVM (Model-View-ViewModel)

#### 2.1. Khái niệm & Cấu trúc
MVVM tổ chức tầng giao diện trong đó:
- **Model**: Dữ liệu và quy tắc nghiệp vụ gốc (tại backend API).
- **View**: Giao diện hiển thị trực quan.
- **ViewModel**: Nắm giữ trạng thái giao diện (UI State) và các lệnh người dùng thực hiện; View liên kết (data binding) với ViewModel để tự cập nhật khi trạng thái thay đổi.

Trong React (sử dụng luồng dữ liệu 1 chiều), một custom hook quản lý state và hành động của một màn hình đóng vai trò theo tinh thần MVVM:
```javascript
// Minh họa ViewModel dạng custom hook trong React cho màn hình nhập điểm
function useGradeSheet(classId, subjectId, api) {
    const [rows, setRows] = useState([]);
    const [status, setStatus] = useState('idle'); // idle | saving | saved | error

    const setScore = (studentId, field, value) => {
        setRows(rs => rs.map(r => r.studentId === studentId ? { ...r, [field]: value } : r));
    };

    const save = async () => {
        setStatus('saving');
        try {
            await api.saveGrades({ classId, subjectId, rows });
            setStatus('saved');
        } catch (e) {
            setStatus('error');
        }
    };

    return { rows, status, setScore, save };
}
```

#### 2.2. Đánh giá Áp dụng
MVVM phù hợp với các màn hình có trạng thái phức tạp (bảng nhập điểm nhiều ô, dashboard thống kê). Với các trang tĩnh hoặc form đơn giản, nhóm không cần áp dụng đồng loạt để tránh tăng độ phức tạp không cần thiết.

---

### 3. Repository Pattern

#### 3.1. Khái niệm & Cấu trúc
Repository là lớp trung gian giữa nghiệp vụ và nơi lưu trữ dữ liệu, làm cho kho dữ liệu trông như một tập hợp đối tượng trong bộ nhớ (Martin Fowler). Tầng nghiệp vụ gọi các thao tác `findByStudent`, `save` mà không cần biết dữ liệu được lưu bằng câu lệnh SQL nào.

#### 3.2. Cấu trúc và Minh họa Code
```javascript
// Interface trừu tượng trong JavaScript (nêu hợp đồng)
class GradeRepository {
    async findByStudent(studentId, subjectId, semester) {
        throw new Error('Not implemented');
    }
    async save(grade) {
        throw new Error('Not implemented');
    }
}

// Cài đặt cụ thể với PostgreSQL (nhận client của một transaction)
class PgGradeRepository extends GradeRepository {
    constructor(client) {
        super();
        this.client = client;
    }

    async findByStudent(studentId, subjectId, semester) {
        const res = await this.client.query(
            `SELECT * FROM grades WHERE student_id = $1 AND subject_id = $2 AND semester = $3`,
            [studentId, subjectId, semester]
        );
        return res.rows;
    }

    async save(g) {
        await this.client.query(
            `INSERT INTO grades (student_id, subject_id, semester, score_tbm, academic_rank)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (student_id, subject_id, semester)
             DO UPDATE SET score_tbm = EXCLUDED.score_tbm, academic_rank = EXCLUDED.academic_rank`,
            [g.studentId, g.subjectId, g.semester, g.scoreTbm, g.academicRank]
        );
    }
}
```

Repository nhận connection client từ một transaction thay vì tự mở kết nối riêng, nhờ đó có thể phối hợp nhiều repository trong cùng một giao dịch qua Unit of Work.

---

### 4. Unit of Work Pattern

#### 4.1. Khái niệm & Hai Mức Hiểu
Unit of Work gom các thao tác thay đổi dữ liệu thuộc cùng một giao dịch nghiệp vụ và hoàn tất chúng như một khối:
- **Mức đầy đủ**: Theo dõi các đối tượng mới, đã sửa và đã xóa rồi ghi một lần khi commit (như trong Hibernate, JPA).
- **Mức rút gọn**: Bảo đảm nhiều thao tác cùng nằm trong một transaction trên một kết nối CSDL duy nhất, cùng commit hoặc cùng rollback. Đây là mức phù hợp với thư viện `pg` thuần của dự án.

#### 4.2. Cấu trúc Minh họa Code Unit of Work
```javascript
class UnitOfWork {
    constructor(pool) {
        this.pool = pool;
    }

    // Chạy một nhóm thao tác trong MỘT transaction trên MỘT connection
    async run(work) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await work({ grades: new PgGradeRepository(client) });
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}
```

Khi giáo viên lưu bảng điểm của 45 học sinh, nếu bản ghi thứ 40 bị lỗi, toàn bộ 39 bản ghi trước đó được rollback, bảo đảm dữ liệu CSDL không bị lệch hoặc dở dang.

---

### 5. Dependency Inversion Principle (DIP)

#### 5.1. Khái niệm
DIP là chữ D trong bộ nguyên lý SOLID:
1. *Module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào abstraction.*
2. *Abstraction không nên phụ thuộc vào chi tiết. Chi tiết phải phụ thuộc vào abstraction.*

Hướng phụ thuộc trong mã nguồn ngược với hướng luồng điều khiển lúc chạy: lúc chạy, nghiệp vụ gọi xuống CSDL; trong mã nguồn, cả hai cùng hướng vào Interface (hợp đồng nghiệp vụ sở hữu).

---

### 6. Dependency Injection (DI)

#### 6.1. Khái niệm & Composition Root
Dependency Injection là kỹ thuật cung cấp các đối tượng phụ thuộc từ bên ngoài vào class tiêu thụ (thường qua Constructor Injection), thay vì để class tự `new` hoặc import cứng.
Trong Node.js và Express, việc lắp ghép đối tượng được thực hiện tập trung tại **Composition Root** (`server.js`):

```javascript
class SaveGradesUseCase {
    constructor(unitOfWork) { // Constructor Injection
        this.unitOfWork = unitOfWork;
    }

    async execute({ semester, rows }) {
        return this.unitOfWork.run(async ({ grades }) => {
            for (const r of rows) {
                // Công thức tính TBM hệ số 1, 1, 2, 2, 3 chia tổng trọng số 9
                const totalScore = (r.oral * 1) + (r.fifteenMin * 1) + (r.test45 * 2) + (r.midterm * 2) + (r.final * 3);
                const avg = parseFloat((totalScore / 9).toFixed(1));
                const rank = avg >= 8.0 ? 'Giỏi' : (avg >= 6.5 ? 'Khá' : 'Trung bình');

                await grades.save({
                    studentId: r.studentId,
                    subjectId: r.subjectId,
                    semester,
                    scoreTbm: avg,
                    academicRank: rank,
                });
            }
            return { saved: rows.length };
        });
    }
}

// Composition Root tại server.js:
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const unitOfWork = new UnitOfWork(pool);
const saveGradesUseCase = new SaveGradesUseCase(unitOfWork);
const gradeBookController = new GradeBookController(saveGradesUseCase);
```

#### 6.2. Các Vòng Đời Quản Lý Đối Tượng (DI Lifetimes)

| Mức vòng đời | Ý nghĩa | Cách thể hiện trong Node.js | Ví dụ trong HTQLLH |
| :--- | :--- | :--- | :--- |
| **Transient** | Tạo mới mỗi lần được yêu cầu | Gọi `new` tại nơi dùng hoặc factory function | Đối tượng tính toán không giữ trạng thái dùng chung |
| **Scoped** | Một đối tượng cho mỗi phạm vi (HTTP Request) | Tạo trong middleware hoặc handler của mỗi request | Connection client và Unit of Work cho 1 lần lưu điểm |
| **Singleton** | Một đối tượng duy nhất cho toàn ứng dụng | Tạo một lần tại `server.js` | Connection Pool (`pg.Pool`), Cấu hình môi trường, Service không trạng thái |

#### 6.3. Kiểm thử Độc lập với Đối tượng Giả (Mocking Test)
Nhờ có DI, việc kiểm thử logic nghiệp vụ diễn ra cực nhanh mà không cần kết nối PostgreSQL:
```javascript
// Kiểm thử không cần CSDL thật:
const saved = [];
const fakeRepo = { save: async (g) => saved.push(g) };
const fakeUow = { run: (work) => work({ grades: fakeRepo }) };
const useCase = new SaveGradesUseCase(fakeUow);

await useCase.execute({
    semester: 1,
    rows: [{ studentId: 1, subjectId: 1, oral: 8, fifteenMin: 9, test45: 8, midterm: 9, final: 9 }]
});

// Kết quả kiểm thử:
// Điểm 8, 9, 8, 9, 9 có tổng trọng số 78 / 9 = 8.7 -> saved[0].scoreTbm === 8.7 và saved[0].academicRank === 'Giỏi'
```

---

## CHƯƠNG III: SO SÁNH VÀ ĐÁNH GIÁ

### 1. Phân loại theo 3 Cấp độ Giải quyết Vấn đề

| Cấp độ | Câu hỏi thiết kế | Mẫu và nguyên lý liên quan |
| :--- | :--- | :--- |
| **Tầng giao diện** | Tổ chức mã hiển thị và điều phối thao tác người dùng như thế nào? | **MVC**, **MVVM** |
| **Tầng dữ liệu** | Truy cập dữ liệu và quản lý giao dịch như thế nào? | **Repository Pattern**, **Unit of Work** |
| **Toàn hệ thống** | Các lớp phụ thuộc nhau theo hướng nào và được nối với nhau ra sao? | **DIP (Nguyên lý)**, **DI (Kỹ thuật)** |

---

### 2. So sánh Từng Cặp Cùng Cấp Độ

#### 2.1. So sánh MVC và MVVM
- MVC điều phối luồng request/response giữa Client và Server (Controller mỏng).
- MVVM quản lý trạng thái hiển thị bên trong một màn hình phức tạp tại Frontend (ViewModel / Custom Hook).
- Hai mẫu phối hợp cùng nhau: React UI dùng hook theo tinh thần MVVM gửi request đến Express Controller theo mô hình MVC.

#### 2.2. So sánh Repository và Unit of Work
- **Repository**: Trừu tượng hóa truy cập một loại thực thể (học sinh, điểm số); nghiệp vụ không trực tiếp viết câu lệnh SQL.
- **Unit of Work**: Gom nhiều thao tác ghi trên nhiều Repository vào một giao dịch CSDL duy nhất; đảm bảo toàn vẹn dữ liệu (commit hoặc rollback).

#### 2.3. So sánh DIP, DI và IoC
- **DIP (Dependency Inversion Principle)**: Nguyên lý thiết kế trong SOLID (phụ thuộc vào abstraction).
- **DI (Dependency Injection)**: Kỹ thuật lập trình cụ thể đưa phụ thuộc từ ngoài vào constructor.
- **IoC (Inversion of Control)**: Khái niệm kiến trúc rộng lớn hơn, framework chủ động kiểm soát luồng chạy của chương trình.

---

### 3. Đối Chiếu Hiện Trạng Mã Nguồn và 5 Khoảng Cách Cần Xử Lý

Đối chiếu với mã nguồn thực tế của dự án, nhóm nhận diện 5 điểm khoảng cách kỹ thuật:
1. **Tệp `UnitOfWork.js` đã có nhưng chưa được dùng**: Các repository đang gọi truy vấn trên pool chung thay vì connection client của Unit of Work.
2. **`saveAllGrades()` lưu từng bản ghi bằng vòng lặp**: Nếu bản ghi thứ $k$ bị lỗi, $k-1$ bản ghi trước đó đã lưu vào CSDL, gây tình trạng lưu dở bảng điểm.
3. **Service và Repository là class static**: Khi import tĩnh, không thể thay thế bằng Repository giả để chạy Unit Test.
4. **Repository có dữ liệu mẫu fallback và hàm `query()` nuốt lỗi**: Khi kết nối CSDL lỗi, hàm trả về null hoặc mảng mẫu, che giấu lỗi thực tế của PostgreSQL.
5. **Công thức tính điểm bị lặp ở 4 nơi**: Cần thống nhất một hàm tính điểm duy nhất tại backend (`GradeBookService.calculateTBM`), phía frontend chỉ dùng để xem trước (preview).

---

### 4. Quyết Định Lựa Chọn và Thứ Tự Thực Hiện

| Thứ tự ưu tiên | Nội dung | Quyết định | Lý do & Vị trí áp dụng |
| :---: | :--- | :--- | :--- |
| **1** | **DI và DIP** | Áp dụng trước | Nền tảng cho các mẫu khác; chuyển Service & Repository từ class static sang class có constructor nhận phụ thuộc; lắp ghép tại `server.js` |
| **2** | **Unit of Work** | Áp dụng ngay sau | Ngăn ngừa dữ liệu lưu dở; gắn Repository vào client của Unit of Work; áp dụng cho lưu bảng điểm cả lớp, thu học phí và điểm danh |
| **3** | **Repository** | Giữ và dọn dẹp | Đã có các Repository; dọn dẹp chuyển dữ liệu mẫu sang `InMemoryRepository` để kiểm thử; để lỗi CSDL nổi lên cho Controller bắt lỗi |
| **4** | **MVC** | Giữ nguyên | Giữ Controller mỏng, điều phối nghiệp vụ; tập trung logic tính điểm ở một nơi tại backend |
| **-** | **MVVM** | Không bắt buộc | Chỉ tách custom hook cho trang nhập điểm `GradebookPage` nếu logic giao diện quá phức tạp; không áp dụng toàn hệ thống |

---

## CHƯƠNG IV: KẾT LUẬN

1. Sáu nội dung nghiên cứu (MVC, MVVM, Repository, Unit of Work, DIP, DI) thuộc ba cấp độ khác nhau, bổ trợ cho nhau tạo thành một kiến trúc phần mềm hoàn chỉnh, an toàn và dễ kiểm thử.
2. Việc áp dụng các mẫu thiết kế này là quy ước tổ chức mã nguồn, không làm thay đổi stack công nghệ đã chốt của dự án (React, Vite, Tailwind CSS, Node.js, Express, PostgreSQL, Docker Compose).
3. Thứ tự triển khai chuẩn hóa: Bắt đầu từ DI & DIP, kế tiếp là kích hoạt Unit of Work cho phân hệ sổ điểm, chuẩn hóa Repository và giữ Controller mỏng theo MVC.

---

## CHƯƠNG V: TÀI LIỆU THAM KHẢO

1. **Martin Fowler**. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.
   - Repository Pattern: [https://martinfowler.com/eaaCatalog/repository.html](https://martinfowler.com/eaaCatalog/repository.html)
   - Unit of Work: [https://martinfowler.com/eaaCatalog/unitOfWork.html](https://martinfowler.com/eaaCatalog/unitOfWork.html)
2. **Robert C. Martin**. *Agile Software Development, Principles, Patterns, and Practices*. Prentice Hall, 2002 (Dependency Inversion Principle).
3. **Microsoft Learn**. *Dependency Injection in .NET*: [https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)
4. **MDN Web Docs**. *MVC Pattern Glossary*: [https://developer.mozilla.org/en-US/docs/Glossary/MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
5. **Microsoft Learn**. *Model-View-ViewModel (MVVM)*: [https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm)
6. **Mã nguồn dự án Phat-Trien-Du-An-Phan-Mem**: Tài liệu nội bộ nhóm thực hiện đề tài Xây dựng Hệ thống Quản lý Trường học.
