# Huong Dan Demo Chuyen De: Xac Thuc va Phan Quyen (JWT + RBAC)

**Tuan:** 7
**Chu de:** Xac thuc JSON Web Token (JWT) va Phan quyen theo Vai tro (Role-Based Access Control - RBAC)
**Phan cong:**

| Thanh vien | Vai tro |
|---|---|
| Nguyen Minh Quoc Bao | Tester / Kiem thu bao mat JWT + RBAC |
| Vo Hoang Son | Logic & Security - trien khai jwtAuthMiddleware va rbacMiddleware |

---

## Phan 1: Chuan Bi

### 1.1 Moi truong can kiem tra truoc khi quay video

- Frontend dang chay tai: `http://localhost:5173`
- Backend dang chay tai: `http://localhost:8081`
- PostgreSQL Docker Container dang chay tai cong `5434`, ten CSDL: `school_management`
- Trinh duyet: Google Chrome (de su dung DevTools F12)
- Xoa sach localStorage truoc khi bat dau demo: F12 > Application > Local Storage > Click phai > Clear

### 1.2 Bang tai khoan demo (5 vai tro)

| STT | Vai tro | Ten dang nhap | Mat khau | Mo ta quyen han |
|---|---|---|---|---|
| 1 | Ban Giam Hieu (BGH) | `bgh.admin` | `123456` | Toan quyen he thong, xem bao cao tong |
| 2 | Giao Vien Chu Nhiem (GVCN) | `gvcn.10a1` | `123456` | Quan ly lop 10A1, diem danh, phep hoc sinh |
| 3 | Giao Vien Bo Mon (GV) | `gv.an` | `123456` | Nhap diem, xuat so diem mon hoc |
| 4 | Hoc Sinh (HS) | `hs.anh` | `123456` | Chi xem diem, diem danh ca nhan |
| 5 | Phu Huynh (PH) | `ph.anh` | `123456` | Chi xem thong tin con em |

### 1.3 Tong quan kien truc bao mat

```
Client (React)                  Server (Node.js/Express)
--------------------            --------------------------------
LoginPage                ---->  POST /api/auth/login
  |                               |-- AuthController.login()
  |                               |-- jwt.sign(payload, secret, { expiresIn: '24h' })
  |<-- { token, user } ---------- |-- Tra ve JWT Token
  |
AuthContext.login()
  |-- localStorage.setItem('htqllh_user', JSON.stringify({ username, role, token }))
  |-- setUser(userObj)

Khi goi API bao ve:
  |-- axios headers: Authorization: Bearer <token>
  |
Server: jwtAuthMiddleware.authenticateToken()
  |-- Lay token tu header
  |-- jwt.verify(token, JWT_SECRET)
  |-- neu hop le: req.user = payload, next()
  |-- neu thieu: 401 Unauthorized
  |-- neu het han/sai: 403 Forbidden

Server: rbacMiddleware.authorizeRoles(...allowedRoles)
  |-- Kiem tra req.user.role co nam trong danh sach allowedRoles khong
  |-- Neu sai vai tro: 403 Forbidden
```

---

## Phan 2: Kich Ban Demo (8 Tinh Huong)

### Demo 6.1 - Xem localStorage truoc khi dang nhap

**Muc tieu:** Chung minh rang truoc khi dang nhap, khong co token nao duoc luu.

**Cac buoc thuc hien:**
1. Mo trinh duyet, vao `http://localhost:5173/login`
2. Nhan **F12** de mo Chrome DevTools
3. Chuyen sang tab **Application**
4. Mo thanh ben trai: **Local Storage** > `http://localhost:5173`
5. Quan sat: hoan toan trong, khong co key `htqllh_user`

**Giai thich cho nguoi xem:**
> "Truoc khi dang nhap, localStorage hoan toan trong. He thong khong luu bat ky thong tin nao, dam bao an toan cho nguoi dung."

---

### Demo 6.2 - Giao dien trang dang nhap (LoginPage)

**Muc tieu:** Gioi thieu giao dien LoginPage voi 5 tab vai tro, he thong tinh nang 1-Click Demo.

**Cac buoc thuc hien:**
1. Quan sat trang `/login` co 5 tab: **BGH / GVCN / GV / Hoc Sinh / Phu Huynh**
2. Click tung tab de thay form tu dong dien thong tin mau
3. Giai thich: Day la chuc nang **1-Click Demo** giup thay co, nguoi dung kiem tra nhanh
4. Giu nguyen tab **GV Bo Mon** (gv.an / 123456)
5. Nhan F12 > chuyen sang tab **Network**, tat bo loc "All"

**Giai thich cho nguoi xem:**
> "LoginPage phan chia ro rang theo 5 vai tro trong truong hoc. De thuan tien kiem thu, he thong co san thong tin dang nhap mau cho tung vai tro."

---

### Demo 6.3 - Quan sat POST /api/auth/login tren Network tab

**Muc tieu:** Xem JWT token duoc tra ve trong HTTP response.

**Cac buoc thuc hien:**
1. Dang o tab Network (F12), bo loc **Fetch/XHR**
2. Quay lai trang web, bam nut **Dang nhap** voi tai khoan `gv.an / 123456`
3. Trong Network tab, xuat hien request **POST login** (hoac **POST /api/auth/login**)
4. Click vao request do
5. Chuyen sang tab **Response**
6. Quan sat JSON response co cau truc:
   ```json
   {
     "success": true,
     "message": "Dang nhap thanh cong",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd2LmFuIiwicm9sZSI6IlJPTEVfU1VCSkVDVF9URUFDSEVSIiwiaWF0IjoxNzM1NTg0MDAwLCJleHAiOjE3MzU2NzA0MDB9.xxxxx",
     "user": { "username": "gv.an", "role": "ROLE_SUBJECT_TEACHER" }
   }
   ```

**Giai thich cho nguoi xem:**
> "JWT Token la mot chuan mo (RFC 7519). No gom 3 phan ngan cach nhau bang dau cham: Header dot Payload dot Signature."

---

### Demo 6.4 - Xem JWT duoc luu vao localStorage

**Muc tieu:** Xem thong tin nguoi dung va token duoc luu trong localStorage.

**Cac buoc thuc hien:**
1. Chuyen sang tab **Application** trong DevTools
2. Vao **Local Storage** > `http://localhost:5173`
3. Tim key `htqllh_user`
4. Click vao, xem gia tri JSON:
   ```json
   {
     "username": "gv.an",
     "role": "ROLE_SUBJECT_TEACHER",
     "name": "gv.an"
   }
   ```
5. Lam noi bat key `htqllh_user` de nguoi xem thay ro

**Giai thich cho nguoi xem:**
> "AuthContext luu thong tin nguoi dung vao localStorage de duy tri phien lam viec. Khi nguoi dung tat trinh duyet roi mo lai, he thong van nho vai tro dang nhap."

**Doan code lien quan - AuthContext.jsx:**
```javascript
// Luu vinh vien vao localStorage de duy tri phien lam viec
localStorage.setItem('htqllh_user', JSON.stringify(userObj));

// Khi tai lai trinh duyet, tu dong doc tu localStorage
const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('htqllh_user') || localStorage.getItem('edumanage_user');
  return stored ? JSON.parse(stored) : null;
});
```

---

### Demo 6.5 - Giai thich cau truc JWT Token

**Muc tieu:** Giai thich 3 phan cua JWT, dem chung minh token khong can tra cuu CSDL.

**Cac buoc thuc hien:**
1. Copy gia tri token tu Network tab (buoc Demo 6.3)
2. Mo tab moi, vao: `https://jwt.io`
3. Dan token vao o "Encoded"
4. Quan sat phan "Decoded":
   ```
   HEADER:
   {
     "alg": "HS256",
     "typ": "JWT"
   }

   PAYLOAD:
   {
     "username": "gv.an",
     "role": "ROLE_SUBJECT_TEACHER",
     "iat": 1735584000,
     "exp": 1735670400
   }

   SIGNATURE:
   HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
   ```
5. Chi ra truong `exp` (expiration): timestamp Unix cua thoi diem het han (24 gio)

**Giai thich cho nguoi xem:**
> "JWT la Stateless: Server khong can luu token vao CSDL. Moi request den Server, Middleware chi can giai ma token, kiem tra Signature bang Secret Key, va doc Payload. Do la su khac biet lon so voi Session truyen thong."

**Doan code - jwtAuthMiddleware.js:**
```javascript
// Xac thuc JWT trong moi request den API bao ve
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Lay phan sau "Bearer "

  if (!token) {
    // Khong co token: tra ve 401 Unauthorized
    return res.status(401).json({
      success: false,
      message: 'Loi xac thuc: Thieu Token xac thuc JWT (401 Unauthorized).'
    });
  }

  try {
    // Giai ma va xac thuc token bang Secret Key
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // Gan thong tin nguoi dung vao request
    next();          // Cho phep tiep tuc xu ly
  } catch (err) {
    // Token sai hoac het han: tra ve 403 Forbidden
    return res.status(403).json({
      success: false,
      message: 'Loi phan quyen: Token JWT khong hop le hoac da het han (403 Forbidden).'
    });
  }
}

// Tao JWT Token moi khi dang nhap thanh cong
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
```

---

### Demo 6.6 - RBAC: Menu hien thi khac nhau theo vai tro

**Muc tieu:** Minh hoa Role-Based Access Control qua giao dien Sidebar.

**Cac buoc thuc hien:**
1. Hien tai dang dang nhap la **GV Bo Mon (gv.an)**
2. Quan sat Sidebar: Chi thay menu: "So Diem", "Thong Ke", "Xuat Bao Cao"
3. Dang xuat: Click nut Logout o goc phai
4. Dang nhap lai voi **BGH (bgh.admin / 123456)**
5. Quan sat Sidebar: Thay them nhieu menu hon: "Quan Ly Hoc Sinh", "Quan Ly Giao Vien", "Bao Cao Tong Hop", "Cai Dat He Thong"
6. Dang xuat, dang nhap **GVCN (gvcn.10a1 / 123456)**
7. Quan sat: Menu trung gian giua BGH va GV

**Giai thich cho nguoi xem:**
> "RBAC hoat dong bang cach moi Route va Component trong React kiem tra vai tro hien tai. ProtectedRoute nhan vao danh sach vai tro duoc phep, neu vai tro hien tai khong co trong danh sach se tu dong chuyen huong."

**Doan code - rbacMiddleware.js:**
```javascript
// 5 vai tro trong he thong
export const ROLES = {
  ADMIN:              'ROLE_ADMIN',           // Ban Giam Hieu
  HOMEROOM_TEACHER:   'ROLE_HOMEROOM_TEACHER', // Giao Vien Chu Nhiem
  SUBJECT_TEACHER:    'ROLE_SUBJECT_TEACHER',  // Giao Vien Bo Mon
  STUDENT:            'ROLE_STUDENT',          // Hoc Sinh
  PARENT:             'ROLE_PARENT'            // Phu Huynh
};

// Middleware kiem tra vai tro phia Server
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Loi truy cap: Chua dang nhap he thong.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Loi phan quyen: Vai tro ${req.user.role} khong co quyen truy cap chuc nang nay (403 Forbidden).`
      });
    }
    next();
  };
}
```

---

### Demo 6.7 - Thu truy cap URL bi chan (403 Forbidden)

**Muc tieu:** Chung minh ProtectedRoute chong phan quyen o phia Frontend.

**Cac buoc thuc hien:**
1. Dam bao dang dang nhap la **GV Bo Mon (gv.an)** - khong co quyen BGH
2. Tren thanh dia chi trinh duyet, nhap truc tiep URL: `http://localhost:5173/quan-ly-hoc-sinh`
   (hoac bat ky URL nao chi danh cho BGH/GVCN)
3. Nhan Enter
4. He thong tu dong chuyen huong ve trang `/unauthorized`
5. Trang hien thi: "Ban khong co quyen truy cap trang nay (403 Forbidden)"

**Giai thich cho nguoi xem:**
> "Nguoi dung khong the bypass phan quyen bang cach nhap URL tay. ProtectedRoute chay truoc khi Component duoc render, kiem tra vai tro va chuyen huong ngay lap tuc neu sai quyen."

**Doan code - ProtectedRoute.jsx:**
```jsx
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();

  // Buoc 1: Kiem tra xac thuc (Authentication)
  // Neu chua dang nhap -> chuyen huong ve /login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Buoc 2: Kiem tra phan quyen (Authorization)
  // Neu roles duoc quy dinh va vai tro hien tai khong nam trong danh sach -> chuyen huong /unauthorized
  if (roles && !roles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Buoc 3: Hop le -> hien thi noi dung
  return children ?? <Outlet />;
}
```

---

### Demo 6.8 - Dang xuat: Xoa token khoi localStorage

**Muc tieu:** Chung minh qua trinh ket thuc phien lam viec an toan.

**Cac buoc thuc hien:**
1. Mo F12 > Application > Local Storage
2. Quan sat: key `htqllh_user` dang ton tai
3. Click nut **Dang xuat** tren giao dien
4. He thong chuyen huong ve trang `/login`
5. Quay lai F12 > Application > Local Storage
6. Quan sat: key `htqllh_user` da bi xoa hoan toan
7. Thu bam nut "Back" trinh duyet: he thong van chuyen huong ve `/login` (khong the quay lai)

**Giai thich cho nguoi xem:**
> "Khi dang xuat, AuthContext goi localStorage.removeItem() de xoa token. Dong thoi setUser(null) pha vu trang thai React, tat ca ProtectedRoute phat hien isAuthenticated = false va chuyen huong. Day la quy trinh logout an toan."

**Doan code - AuthContext.jsx:**
```javascript
// Ham dang xuat: xoa token va reset trang thai
const logout = () => {
  localStorage.removeItem('htqllh_user');
  localStorage.removeItem('edumanage_user');
  setUser(null); // keo theo tat ca ProtectedRoute re-render va redirect ve /login
};
```

---

## Phan 3: Bang Thu Tu Quay Video (~18 phut)

| STT | Kich ban | Thoi gian uoc tinh | Diem nhan manh |
|---|---|---|---|
| 1 | Mo dau: tong quan JWT + RBAC, lich su | 1 phut | Viet lich su ra bang, giai thich tai sao khong dung Session |
| 2 | Demo 6.1: Kiem tra localStorage truoc khi dang nhap | 1 phut | F12 > Application > Local Storage - trong |
| 3 | Demo 6.2: Giao dien LoginPage + 5 tab vai tro | 2 phut | Click tung tab, giai thich y nghia 1-Click Demo |
| 4 | Demo 6.3: Network tab - POST /api/auth/login | 2 phut | Chi ro token trong Response JSON |
| 5 | Demo 6.4: localStorage sau khi dang nhap | 1 phut | key htqllh_user xuat hien |
| 6 | Demo 6.5: jwt.io - giai thich 3 phan JWT | 3 phut | Header, Payload (role, exp), Signature |
| 7 | Demo 6.5: Code jwtAuthMiddleware.js | 2 phut | jwt.verify(), 401 vs 403 |
| 8 | Demo 6.6: RBAC sidebar khac nhau theo vai tro | 2 phut | Doi chieu GV vs BGH vs GVCN |
| 9 | Demo 6.6: Code rbacMiddleware.js | 1 phut | authorizeRoles(), ROLES constants |
| 10 | Demo 6.7: URL bi chan - ProtectedRoute | 1 phut | Nhap URL tay -> redirect /unauthorized |
| 11 | Demo 6.8: Dang xuat - xoa localStorage | 1 phut | localStorage.removeItem() -> /login |
| 12 | Tong ket: So sanh JWT vs Session | 1 phut | Bang so sanh, loi ich Stateless |

**Tong cong: ~18 phut**

---

## Phan 4: Cau Hoi Va Tra Loi Thuong Gap

### Cau hoi 1: Tai sao chon JWT thay vi Session truyen thong?

**Tra loi:**

| Tieu chi | Session | JWT |
|---|---|---|
| Luu tru | Server (RAM/CSDL) | Client (localStorage/cookie) |
| Kha nang mo rong | Kho (can dung chung Session store) | De (Stateless, moi Server deu xac thuc duoc) |
| Hieu suat | Tra cuu CSDL moi request | Giai ma tai cho, khong can CSDL |
| Bao mat | Session ID co the bi an cap | Token co the bi an cap nhung co thoi han |
| Thich hop | Ung dung don gian | REST API, Microservices |

> Ket luan: He thong HTQLLH dung REST API nen JWT la lua chon phu hop hon.

### Cau hoi 2: JWT Token bi an cap thi sao?

**Tra loi:**
- JWT co thoi han 24 gio (`expiresIn: '24h'`), sau do tu dong vo hieu hoa
- He thong khong luu token o Server nen khong the thu hoi (revoke) ngay lap tuc
- Giai phap nang cao: Dung Refresh Token + Blacklist (chua trien khai trong phiem ban hien tai)
- HTTPS dam bao ma hoa truyen tai, giam nguy co man-in-the-middle

### Cau hoi 3: Tai sao khong luu token trong Cookie?

**Tra loi:**
- He thong HTQLLH la SPA (Single Page Application) voi React
- localStorage de su dung voi JavaScript, khong gui len Server tu dong (tranh CSRF)
- Cookie httpOnly an toan hon nhung can cau hinh phuc tap hon (SameSite, Secure, Domain)
- Trong moi truong hoc tap, localStorage du don gian va minh bac qua trinh

### Cau hoi 4: RBAC duoc trien khai o may tang?

**Tra loi:**
- **Tang Frontend (React):** ProtectedRoute kiem tra `role` tu AuthContext, redirect neu sai quyen
- **Tang Backend (Express):** `rbacMiddleware.authorizeRoles(...roles)` kiem tra `req.user.role` truoc khi xu ly request
- **Nguyen tac:** Luon kiem tra o ca hai tang. Frontend RBAC chi la UX, Backend RBAC moi la lop bao mat that su

### Cau hoi 5: JWT Secret Key duoc bao ve nhu the nao?

**Tra loi:**
- Secret Key duoc luu trong bien moi truong: `process.env.JWT_SECRET`
- Fallback mac dinh la `HTQLLH_Super_Secret_JWT_Key_2026` chi dung trong moi truong phat trien
- Trong moi truong san xuat: Luu trong `.env` file, KHONG commit len Git (.gitignore)
- Secret Key manh gom chu hoa, chu thuong, so, ky tu dac biet, do dai toi thieu 32 ky tu

---

## Phan 5: Duong Dan Ma Nguon

| Thu muc | Tap tin | Mo ta |
|---|---|---|
| `members/member4_Logic_Security/` | [`jwtAuthMiddleware.js`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/jwtAuthMiddleware.js) | JWT xac thuc Middleware: authenticateToken() va generateToken() |
| `members/member4_Logic_Security/` | [`rbacMiddleware.js`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member4_Logic_Security/rbacMiddleware.js) | RBAC phan quyen Middleware: authorizeRoles(), ROLES constants |
| `members/member2_Frontend/src/context/` | [`AuthContext.jsx`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/context/AuthContext.jsx) | React Context quan ly trang thai xac thuc, login/logout |
| `members/member2_Frontend/src/components/auth/` | [`ProtectedRoute.jsx`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/components/auth/ProtectedRoute.jsx) | Route Guard: kiem tra Authentication va Authorization |
| `members/member2_Frontend/src/pages/auth/` | [`LoginPage.jsx`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member2_Frontend/src/pages/auth/LoginPage.jsx) | Trang dang nhap voi 5 tab vai tro va 1-Click Demo |
| `members/member3_Backend_DB/.../` | [`AuthController.js`](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/controllers/AuthController.js) | xu ly dang nhap, goi generateToken() tra ve JWT |

---

## Phan 6: Ghi Chu Them

### Tai khoan demo chinh cho video

- **Tai khoan chinh:** `gv.an / 123456` (Giao Vien Bo Mon - vai tro trung tam)
- **Doi chieu BGH:** `bgh.admin / 123456` (toan quyen)
- **Doi chieu GVCN:** `gvcn.10a1 / 123456` (quyen trung gian)

### Thu tu hien thi tren video

```
[1] Gioi thieu JWT - [2] Truoc dang nhap (localStorage trong)
    |
[3] Dang nhap GV.AN - [4] Network POST login - [5] localStorage co token
    |
[6] jwt.io giai thich - [7] Code jwtAuthMiddleware
    |
[8] Sidebar RBAC - [9] Doi sang BGH - [10] Sidebar BGH khac GV
    |
[11] Thu URL bi chan - [12] Dang xuat - [13] Tong ket
```

### Luu y quan trong khi quay

- Phong to cua so Chrome DevTools de nguoi xem thay ro
- Dung dau con tro chi tro vao tung truong khi giai thich JSON response
- Giai thich ro tai sao ma loi 401 va 403 la KHAC NHAU:
  - 401 Unauthorized: CHUA xac thuc (thieu token)
  - 403 Forbidden: DA xac thuc nhung SAI quyen (sai vai tro)
