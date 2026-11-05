# HUONG DAN DEMO HE THONG HTQLLH - DESIGN PATTERNS
## De tai: He Thong Quan Ly Lop Hoc & Hoc Vu THPT (HTQLLH / EduManage Pro)
### Mon hoc: Phat Trien Du An Phan Mem (SW320DV01) — Dai Hoc Hoa Sen (HSU)

```
================================================================================
Vi tri tep: Report_Slide/DEMO_PATTERN_GUIDE.md
Muc dich: Kich ban quay video demo he thong, tap trung trinh bay 4 Design Patterns
Thoi diem: 30/10/2026 (Tuan 7 / 15 Tuan Hoc Ky 2631)
GitHub: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
================================================================================
```

---

## PHAN 1: CHUAN BI TRUOC KHI QUAY VIDEO

### 1.1 Khoi dong he thong

**Buoc 1 — Khoi dong Docker (PostgreSQL)**
```bash
# Mo terminal tai thu muc goc du an
cd "d:\HSU\2631Semester 1(2026-2027)\PT_DA_PM"

# Kiem tra Docker dang chay
docker ps

# Neu chua khoi dong, bat Docker Desktop truoc roi chay:
docker-compose up -d

# Xac nhan PostgreSQL da len
docker ps
# => Ket qua mong doi: Container "htqllh-postgres" trang thai "Up"
```

**Buoc 2 — Khoi dong Backend Node.js**
```bash
cd members\member3_Backend_DB\school-management-nodejs

# Kiem tra da cai dat package
npm install

# Khoi chay server
node server.js
# => Ket qua mong doi: "HTQLLH Backend running on port 8081"
# => Dong log: "[DB] DDL Schema initialized successfully"
# => Dong log: "[SEED] 45 demo students seeded"
```

**Buoc 3 — Khoi dong Frontend React**
```bash
# Mo terminal MOI (giu nguyen terminal backend)
cd members\member2_Frontend
npm run dev
# => Ket qua mong doi: "Local: http://localhost:5173/"
```

**Buoc 4 — Xac nhan he thong san sang**
- Mo trinh duyet, truy cap: `http://localhost:5173`
- Mo tab moi, kiem tra: `http://localhost:8081/api/health`
  - Phai tra ve: `{"status":"UP","service":"HTQLLH Node.js Express Backend",...}`

---

### 1.2 Bo cuc man hinh khi quay video (goi y)

```
+--------------------------------------+----------------------------------+
|  TRINH DUYET (http://localhost:5173) |  IDE (VS Code — xem ma nguon)   |
|                                      |                                  |
|  [Giao dien he thong HTQLLH]         |  [UnitOfWork.js / GradeBook.js]  |
+--------------------------------------+----------------------------------+
|               TERMINAL Backend (node server.js — xem log)              |
+------------------------------------------------------------------------+
```

---

## PHAN 2: KICH BAN DEMO 4 DESIGN PATTERNS

---

### PATTERN 1: REPOSITORY PATTERN
**Thoi luong goi y: 3-4 phut**

#### Muc tieu giai thich
Repository Pattern la lop trung gian giua nghiep vu va co so du lieu. Controller khong biet SQL; chi goi cac phuong thuc nhu `findByUsername`, `findAll`, `create`. Neu sau nay doi sang MongoDB, chi can viet lai Repository ma khong cham vao Controller.

#### Vi tri ma nguon tren VS Code
```
members/member3_Backend_DB/school-management-nodejs/
  src/
    repositories/
      UserRepository.js     <-- MO FILE NAY TRUOC
    controllers/
      AuthController.js     <-- Cho thay Controller goi Repository
    config/
      db.js                 <-- Pool ket noi va ham query()
```

#### Kich ban tuong thuat (doc truoc khi quay)

> "Day la tep `UserRepository.js`. No la lop Repository cua chung toi."

> "Mo hinh Repository hoat dong nhu sau: Controller o tren cap cao khong biet cau SQL nao ca. No chi goi `UserRepository.findByUsernameAndRole(username, role)`."

> "Con ben trong Repository, moi phuong thuc chua mot cau SQL ro rang, duoc tham so hoa bang `$1`, `$2` de chong SQL Injection."

**Doan code can giai thich:**
```javascript
// UserRepository.js — Lop Repository cho doi tuong User
export class UserRepository {
  // Phuong thuc tim kiem theo ten dang nhap va vai tro
  static async findByUsernameAndRole(username, role) {
    const res = await query(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      [username, role]
    );
    return res.rows[0] || null;
  }
}
```

> "Va Controller `AuthController.js` chi viet: `UserRepository.findByUsernameAndRole(...)`. No khong can biet SQL, khong can biet PostgreSQL hay MySQL."

**Thao tac demo tren giao dien:**
1. Vao trang dang nhap `http://localhost:5173`
2. Nhap tai khoan: `admin` / `admin123` / vai tro `BGH`
3. Bam **Dang nhap**
4. Trong terminal, chi cho log: `[HTTP API] POST /api/auth/login`
5. Noi: "Luc nay, AuthController goi UserRepository, Repository trao doi voi PostgreSQL, tra ve token JWT."

---

### PATTERN 2: UNIT OF WORK PATTERN
**Thoi luong goi y: 4-5 phut**

#### Muc tieu giai thich
Unit of Work bao dam: khi GVCN luu bang diem 45 hoc sinh cung luc, neu hoc sinh thu 40 bi loi — toan bo 39 ban ghi truoc do se bi ROLLBACK. Du lieu khong bao gio bi dan do hay lech.

#### Vi tri ma nguon tren VS Code
```
src/
  utils/
    UnitOfWork.js     <-- MO FILE NAY
  controllers/
    GradeBookController.js
```

#### Kich ban tuong thuat

> "Hay nhin vao `UnitOfWork.js`. Day la Pattern quan trong nhat cua he thong chung toi."

> "Ham `beginTransaction()` muon mot Client ket noi rieng tu Pool, roi goi `BEGIN` de bat dau pham vi giao dich."

**Doan code can giai thich:**
```javascript
// UnitOfWork.js — Quan ly giao dich nguyen tu
export class UnitOfWork {
  async beginTransaction() {
    this.client = await pool.connect(); // Muon Client rieng
    await this.client.query('BEGIN');   // Mo giao dich
    this.inTransaction = true;
  }

  async commit() {
    await this.client.query('COMMIT'); // Xac nhan vinh vien
    this.client.release();             // Tra ket noi ve Pool
  }

  async rollback() {
    await this.client.query('ROLLBACK'); // Hoan tac toan bo
    this.client.release();
  }
}
```

> "Khi tat ca 45 ban ghi luu thanh cong, goi `commit()`. Neu bat ky ban ghi nao loi, goi `rollback()`, dam bao tinh ACID."

**Thao tac demo tren giao dien:**
1. Dang nhap voi vai tro **GVCN** (Giao vien chu nhiem)
2. Vao muc **So diem dien tu**
3. Chon lop `10A1`, mon `Toan`, hoc ky `HK1`
4. Nhap diem cho 3-5 hoc sinh (thay doi gia tri)
5. Bam **Luu bang diem**
6. Trong terminal, chi log:
   - `[UNIT OF WORK] Transaction started.`
   - `[UNIT OF WORK] Transaction committed successfully.`
7. Noi: "He thong vua xu ly toan bo bang diem trong 1 giao dich duy nhat. Thanh cong hoac that bai toan bo."

---

### PATTERN 3: MVC (Model - View - Controller)
**Thoi luong goi y: 3-4 phut**

#### Muc tieu giai thich
He thong tach biet thanh 3 lop: Model (Entity du lieu), View (React UI), Controller (Express API). Ba lop giao tiep qua RESTful API, khong phu thuoc truc tiep vao nhau.

#### So do kien truc (ve tay len bang hoac trinh bay slide)
```
[VIEW - React 18 SPA :5173]
         |  HTTP JSON
         v
[CONTROLLER - Express :8081]
         |  goi phuong thuc
         v
[MODEL - GradeBook.js Entity]
         |  UnitOfWork + Repository
         v
[DATABASE - PostgreSQL :5434]
```

#### Vi tri ma nguon tren VS Code
```
src/
  entities/
    GradeBook.js        <-- MODEL: Thuc the nghiep vu
  controllers/
    GradeBookController.js  <-- CONTROLLER: Dieu phoi luong xu ly
members/member2_Frontend/src/
  pages/gv/
    GradebookPage.jsx   <-- VIEW: Giao dien nguoi dung
```

#### Kich ban tuong thuat

> "MVC trong he thong chung toi co dac diem la tach doi: Controller va Model o Backend, View o Frontend, giao tiep bang REST API."

**Doan code Model can giai thich:**
```javascript
// GradeBook.js — Model (Entity mien nghiep vu)
export class GradeBook {
  calculateAverage() {
    // Trong so Thong tu 22: Mieng*1 + 15p*1 + 1tiet*2 + GiuaKy*2 + CuoiKy*3 chia cho 9
    const avg = (
      this.scoreOral * 1 + this.score15m * 1 +
      this.score1Hour * 2 + this.scoreMidTerm * 2 +
      this.scoreFinalTerm * 3
    ) / 9;
    this.averageScore = Math.round(avg * 10) / 10;

    // Tu dong xep loai
    if (this.averageScore >= 9.0)      this.gradeLetter = 'Xuat sac';
    else if (this.averageScore >= 8.0) this.gradeLetter = 'Gioi';
    else if (this.averageScore >= 6.5) this.gradeLetter = 'Kha';
    else if (this.averageScore >= 5.0) this.gradeLetter = 'Trung binh';
    else                               this.gradeLetter = 'Yeu';
  }
}
```

> "GradeBook Entity chua cong thuc tinh diem ĐTBmhk theo Thong tu 22 cua Bo GD&DT. Model tu tinh diem va tu xep loai — khong can Controller lam viec nay."

**Thao tac demo tren giao dien:**
1. Dang nhap vai tro **GVCN**
2. Vao **So diem**, nhap diem cac cot: Mieng, 15p, 1tiet, GiuaKy, CuoiKy
3. He thong hien thi ngay ket qua TBM va xep loai (Gioi / Kha / TB)
4. Noi: "Cong thuc tinh diem duoc dong goi trong GradeBook Entity, khong bi lap lai o nhieu noi."

---

### PATTERN 4: SINGLETON PATTERN (Connection Pool)
**Thoi luong goi y: 2-3 phut**

#### Muc tieu giai thich
Singleton dam bao chi co **duy nhat mot** doi tuong `pg.Pool` trong toan he thong. Moi Controller, moi Repository deu dung chung mot Pool nay, tranh lang phi RAM va tranh tran ket noi CSDL.

#### Vi tri ma nguon tren VS Code
```
src/
  config/
    db.js     <-- MO FILE NAY: export const pool = new Pool({...})
```

#### Kich ban tuong thuat

> "Day la `db.js`. Chung toi khoi tao `pool` mot lan duy nhat va `export` no ra. Bat ky file nao `import { pool }` deu nhan ve CUNG MOT doi tuong Pool."

**Doan code can giai thich:**
```javascript
// db.js — Singleton Connection Pool
const { Pool } = pg;

// Chi tao MO T Pool duy nhat trong toan bo vong doi ung dung
export const pool = new Pool({
  host: 'localhost',
  port: 5434,
  database: 'school_management',
  max: 10,                      // Toi da 10 ket noi dong thoi
  idleTimeoutMillis: 10000,     // Thu hoi ket noi sau 10 giay nhan roi
  connectionTimeoutMillis: 2000 // Huy neu qua 2 giay khong muon duoc
});
```

> "Tat ca Repository nhu `UserRepository`, `GradeBookController` deu goi `import { pool }` — cung dung 1 Pool. Day la Singleton Pattern."

**Thao tac demo:**
1. Hien thi file `db.js` tren VS Code
2. Hien thi `UserRepository.js` — chi `import { query } from '../config/db.js'`
3. Hien thi `UnitOfWork.js` — cung `import { pool } from '../config/db.js'`
4. Noi: "Ca hai file deu import tu cung mot noi, dung cung mot instance Pool."

---

## PHAN 3: THU TU QUAY VIDEO THEO KICH BAN

| STT | Noi dung | Thoi luong | Luu y |
|:---:|:---|:---:|:---|
| 1 | Gioi thieu de tai, kien truc tong quat | 2 phut | Trinh bay slide hoac so do tay |
| 2 | Chay he thong len (Docker + Backend + Frontend) | 2 phut | Cho thay terminal log ro rang |
| 3 | Demo **Repository Pattern** | 4 phut | Mo VS Code song song voi trinh duyet |
| 4 | Demo **Unit of Work** — Luu bang diem | 5 phut | Chi ro terminal log COMMIT/ROLLBACK |
| 5 | Demo **MVC** — Entity GradeBook tinh diem | 3 phut | So sanh View React voi Controller Backend |
| 6 | Demo **Singleton Pool** | 2 phut | Mo 2 file cung import pool |
| 7 | Ket luan — Loi ich ket hop 4 Pattern | 2 phut | Nhan manh tinh ACID, kha nang mo rong |

**Tong thoi luong du kien: khoang 20 phut**

---

## PHAN 4: CAC CAU GIAI THICH NGAN GON KHI BI HOI

### "Repository Pattern khac gi goi SQL truc tiep?"
> "Khi goi SQL truc tiep trong Controller, neu doi CSDL phai sua tat ca Controller. Voi Repository, chi sua 1 lop Repository. Controller khong biet SQL, khong biet PostgreSQL hay MySQL."

### "Unit of Work giai quyet van de gi?"
> "Khi luu bang diem 45 hoc sinh, neu hoc sinh thu 40 bi loi (du lieu sai, vi pham rang buoc), khong co UoW thi 39 ban ghi truoc do van duoc luu — du lieu bi lech. UoW bao dam tat ca cung thanh cong hoac tat ca cung rollback."

### "MVC va Clean Architecture khac gi nhau?"
> "MVC la pattern to chuc lop giao dien. Clean Architecture la nguyen ly to chuc toan bo he thong, trong do MVC chi la mot phan cua tang ngoai vi. He thong chung toi dung Clean Architecture 4 tang: Entity, Use Case, Interface Adapter, Framework — trong do Controller va View la tang ngoai cung."

### "Tai sao dung Singleton cho Pool?"
> "PostgreSQL co gioi han so ket noi. Neu moi request tao mot Pool moi, he thong co the mo hang tram ket noi cung luc lam chet CSDL. Singleton bao dam chi co 1 Pool voi toi da 10 ket noi, duoc tai su dung hieu qua."

---

## PHAN 5: THONG TIN DE TAI VA NHOM

| Thanh vien | Vai tro | Pattern phu trach |
|:---|:---|:---|
| Vo Duy Binh | Truong nhom / PM / Lead BA | MVC tong the, dieu phoi Jira |
| Vo Hoang Son | Dev Frontend | Observer (React State), Component Composition |
| Huynh Trung Tinh | Dev Backend / DBA | Repository Pattern, Singleton Pool |
| Tran Quang Vinh | Logic Security | Unit of Work, JWT Auth |
| Nguyen Minh Quoc Bao | Tester QA/QC | Kiem thu UoW rollback, Mock Repository |

---

## PHAN 6: DUONG DAN TAI LIEU THAM KHAO

- **Kho GitHub**: https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
- **Slide Canva**: https://www.canva.com/d/YLrratHffoqRdvK
- **Bao cao chi tiet**: [Report_Slide/report.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/Report_Slide/report.md)
- **Nghien cuu Pattern**: [BrainStorm/Week5 Pattern .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week5%20Pattern%20.md)
- **Ma nguon UnitOfWork**: [UnitOfWork.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js)
- **Ma nguon GradeBook**: [GradeBook.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js)
- **Ma nguon UserRepository**: [UserRepository.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js)
- **Ma nguon db.js (Singleton Pool)**: [db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)

---

*Tai lieu duoc tao nham ho tro qua trinh quay video demo cho mon hoc Phat Trien Du An Phan Mem (SW320DV01), Dai Hoc Hoa Sen (HSU), Hoc ky 2631.*
