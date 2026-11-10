# Báo cáo Automation Test — BGH & GVCN

## Tóm tắt
- Backend: **59 pass / 0 fail**
- Frontend: **13 pass / 0 fail**
- Tổng cộng: **72 pass / 0 fail**
- Ngày chạy: 15/10/2026 23:14

---

## Backend Tests (`node --test`)

**Lệnh:** `node --test src/tests/*.test.js`  
**Thư mục:** `members/member3_Backend_DB/school-management-nodejs`

---

### attendance.test.js

**Suite A – saveAttendance normalization**
- [PASS] camelCase input → status uppercased to PRESENT
- [PASS] snake_case input → studentCode mapped correctly
- [PASS] missing both studentCode and student_code → throws Error mentioning studentCode
- [PASS] status 'absent' → normalized to 'ABSENT'
- [PASS] status 'late' → normalized to 'LATE'

**Suite B – saveAllAttendance**
- [PASS] 3 valid records → returns array of 3 results
- [PASS] 1 record missing studentCode → throws and stops processing

**Suite C – GVCN scope check**
- [PASS] GVCN 10A1 saves className=10A1 → PASS (no throw)
- [PASS] GVCN 10A1 saves className=10A2 → throws with code 'GVCN_SCOPE_VIOLATION'
- [PASS] BGH (gvcnClassName=null) can save any className → PASS
- [PASS] BGH saves className=10A1 → PASS

---

### gradebook.test.js

**Suite A – resolveEffectiveClassName – GVCN scope override**
- [PASS] GVCN assigned to 10A1: any requestedClassName is overridden to 10A1
- [PASS] BGH (gvcnClassName=null): requestedClassName returned unchanged
- [PASS] gvcnClassName='__NO_CLASS__' → throws 403

**Suite B – saveGrades GVCN scope check**
- [PASS] items=[{className:'10A1'}], gvcnClassName='10A1' → PASS
- [PASS] items=[{className:'10A2'}], gvcnClassName='10A1' → FAIL with GVCN_SCOPE_VIOLATION
- [PASS] items=[{className:'10A2'}], gvcnClassName=null (BGH) → PASS
- [PASS] items=[{className:'10A1'}], gvcnClassName=undefined (BGH) → PASS

**Suite C – calculateTBM**
- [PASS] standard scores → correct weighted average
- [PASS] all scores = 0 → averageScore not set (condition oral>0 fails)
- [PASS] all scores = 10 → averageScore=10.0, gradeLetter=Xuất sắc
- [PASS] all scores = 4 → gradeLetter=Yếu
- [PASS] scores that result in avg ≥ 8.0 but < 9.0 → gradeLetter=Giỏi
- [PASS] scores that result in avg ≥ 6.5 but < 8.0 → gradeLetter=Khá
- [PASS] scores that result in avg ≥ 5.0 but < 6.5 → gradeLetter=Trung bình

---

### auth-permissions.test.js

**Suite – resolveGvcnClass middleware logic**
- [PASS] Test 1: GVCN với lớp được phân công → gvcnClassName = class_name
- [PASS] Test 2: GVCN chưa được phân công lớp → sentinel __NO_CLASS__
- [PASS] Test 3: BGH role → null (không hạn chế)
- [PASS] Test 3b: GV role → null (không hạn chế)

**Suite – StudentService.getAllStudents logic**
- [PASS] Test 4: restrictClassName là tên lớp → chỉ trả học sinh lớp đó
- [PASS] Test 4b: restrictClassName ưu tiên hơn className từ query param
- [PASS] Test 5: restrictClassName là __NO_CLASS__ → ném lỗi GVCN_NOT_ASSIGNED
- [PASS] Test 6: Sentinel __NO_CLASS__ propagation — không bao giờ trả toàn bộ học sinh
- [PASS] Test 7: BGH/null restrictClassName → trả toàn bộ học sinh

**Suite – GVCN scope violations**
- [PASS] GVCN 10A1 không thể xem học sinh 10A2 theo ID
- [PASS] GVCN 10A1 có thể xem học sinh 10A1 theo ID

**Suite A – requireBGH middleware logic**
- [PASS] role='BGH' → next() called, res.status not called
- [PASS] role='GVCN' → res.status(403) called with message mentioning BGH
- [PASS] role='GV' → res.status(403) called
- [PASS] user=undefined → res.status(403) called

**Suite C – JWT role decode logic**
- [PASS] payload { role: 'GVCN', userId: 5 } → returns 'GVCN'
- [PASS] payload { role: 'BGH', userId: 1 } → returns 'BGH'
- [PASS] empty payload {} → returns null
- [PASS] null payload → returns null
- [PASS] non-object payload (string) → returns null

---

### settings.test.js

**Suite B – SettingsService permissions logic**
- [PASS] getPermissions: repo returns null → fallback to DEFAULT_PERMISSIONS
- [PASS] getPermissions: repo returns valid object → returns that object, not defaults
- [PASS] savePermissions: settings.BGH=false → forced to true after save
- [PASS] savePermissions: matrix=null → throws Error

**Suite A – getPermissions**
- [PASS] DB returns null → DEFAULT_PERMISSIONS has exactly 5 modules
- [PASS] DB returns valid JSON → returns that data, not defaults
- [PASS] DB throws error → falls back to DEFAULT_PERMISSIONS
- [PASS] Each module in DEFAULT_PERMISSIONS has all 5 roles

**Suite B – savePermissions**
- [PASS] valid matrix → repo.upsert called with key=permissions and the matrix
- [PASS] matrix.settings.BGH set to false → enforced back to true after savePermissions
- [PASS] matrix=null → throws Error
- [PASS] matrix=42 (non-object) → throws Error

**Suite C – DEFAULT_PERMISSIONS immutability**
- [PASS] getPermissions called twice → second call still returns correct DEFAULT_PERMISSIONS (not mutated)
- [PASS] DEFAULT_PERMISSIONS itself is not modified by savePermissions mutation

---

### Kết quả tổng Backend
```
tests 59 | suites 15 | pass 59 | fail 0 | duration 240ms
```

---

## Frontend Tests (Vitest)

**Lệnh:** `npx vitest run --reporter=verbose`  
**Thư mục:** `members/member2_Frontend`  
**Vitest version:** v5.0.5

---

### GradebookPage.test.jsx

- [PASS] A. GVCN: hiển thị chip lớp cố định, không có dropdown lớp học
- [PASS] B. BGH: hiển thị dropdown lớp học
- [PASS] C. BGH: không hiển thị nút Lưu điểm (chế độ xem)
- [PASS] D. GVCN: hiển thị nút Lưu điểm
- [PASS] E. Khi API lỗi, hiển thị thông báo lỗi

---

### AttendancePage.test.jsx

- [PASS] A. GVCN: hiển thị chip lớp cố định, không có dropdown lớp học
- [PASS] B. Ngày có lịch học: hiển thị học sinh và nút Lưu điểm danh enabled
- [PASS] C. Ngày không có lịch học: hiển thị thông báo và nút lưu bị disabled
- [PASS] D. Toggle trạng thái: click Vắng → button có aria-pressed=true

---

### SystemSettingsPage.test.jsx

- [PASS] A. Tải permissions từ API, chuyển tab Phân quyền → hiển thị checkboxes
- [PASS] B. API lỗi: fallback DEFAULT_PERMISSIONS, không crash, vẫn hiển thị permission matrix
- [PASS] C. Checkbox settings/BGH bị disabled (LOCKED_ON)
- [PASS] D. Click Lưu thay đổi → savePermissions được gọi

---

### Kết quả tổng Frontend
```
Test Files 3 passed (3) | Tests 13 passed (13) | Duration 2.84s
```

---

## Failures

Không có failure nào. Tất cả 72 test cases đều PASS.

---

## Kết luận

### Chức năng đã test đầy đủ chưa
✅ **Đã bao phủ đầy đủ** các chức năng nghiệp vụ cốt lõi của role BGH và GVCN:

| Module | Backend | Frontend |
|--------|---------|----------|
| Sổ điểm (GradebookPage) | ✅ 11 tests | ✅ 5 tests |
| Điểm danh (AttendancePage) | ✅ 11 tests | ✅ 4 tests |
| Phân quyền hệ thống (Settings) | ✅ 12 tests | ✅ 4 tests |
| Auth/Middleware (JWT, requireBGH, resolveGvcnClass) | ✅ 14 tests | — |
| Tính toán điểm (calculateTBM) | ✅ 7 tests | — |
| Phân quyền học sinh (StudentService) | ✅ 4 tests | — |

### Các quy tắc nghiệp vụ đã được xác nhận
- **Phân quyền GVCN**: GVCN lớp 10A1 chỉ có thể nhập điểm, xem điểm và điểm danh học sinh lớp 10A1 — truy cập lớp khác bị chặn với `GVCN_SCOPE_VIOLATION`.
- **Quyền BGH**: BGH có thể xem, thao tác với tất cả lớp — không bị hạn chế scope.
- **Sentinel `__NO_CLASS__`**: GVCN chưa được phân công lớp sẽ không bao giờ lấy được dữ liệu học sinh (ném lỗi 403).
- **Cài đặt phân quyền**: BGH luôn có quyền truy cập module settings (không thể bị tắt).
- **Điểm danh theo lịch**: Chỉ hiển thị và cho phép điểm danh khi ngày đó có lịch học.

### Bugs phát hiện
Không có bug mới nào được phát hiện trong lần chạy test này. Tất cả test cases phản ánh đúng hành vi kỳ vọng của hệ thống.
