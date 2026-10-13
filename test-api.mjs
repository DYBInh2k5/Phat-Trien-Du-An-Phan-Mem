// Kịch bản Kiểm Thử Tự Động Toàn Bộ RESTful API (HTQLLH Automated API Smoke Test)
// Chạy bằng lệnh: node test-api.mjs

const BASE_URL = 'http://localhost:8081';

const endpoints = [
  { name: '1. Kiểm tra Sức khỏe Hệ thống (Health)', method: 'GET', url: '/api/health' },
  { name: '2. Lấy Danh sách Học sinh (Students)', method: 'GET', url: '/api/students' },
  { name: '3. Lọc Học sinh Lớp 10A1', method: 'GET', url: '/api/students?className=10A1' },
  { name: '4. Tra cứu Sổ điểm Lớp 10A1', method: 'GET', url: '/api/gradebook?className=10A1' },
  { name: '5. Lấy Danh sách Điểm danh', method: 'GET', url: '/api/attendance' },
  { name: '6. Lấy Danh sách Đơn xin Nghỉ', method: 'GET', url: '/api/leave-requests' },
  { name: '7. Lấy Danh mục Học phí', method: 'GET', url: '/api/tuition' },
  { name: '8. Lấy Danh mục Lớp học', method: 'GET', url: '/api/classes' },
  { name: '9. Lấy Danh mục Môn học', method: 'GET', url: '/api/subjects' },
  {
    name: '10. Đăng nhập Người dùng (Auth Login)',
    method: 'POST',
    url: '/api/auth/login',
    body: { username: 'admin', password: '123', role: 'ROLE_ADMIN' }
  }
];

async function runTests() {
  console.log('================================================================');
  console.log('  KẾT QUẢ KIỂM THỬ TOÀN DIỆN CÁC ĐẦU MÚT RESTful API (HTQLLH)');
  console.log(`  Target Backend: ${BASE_URL}`);
  console.log('================================================================\n');

  let passCount = 0;
  let failCount = 0;

  for (const ep of endpoints) {
    try {
      const options = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.body) {
        options.body = JSON.stringify(ep.body);
      }

      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}${ep.url}`, options);
      const duration = Date.now() - startTime;
      const data = await res.json();

      if (res.ok || res.status < 400) {
        passCount++;
        const preview = Array.isArray(data)
          ? `[Mang ${data.length} ban ghi]`
          : JSON.stringify(data).substring(0, 60) + '...';
        console.log(`[PASS] ${ep.name}`);
        console.log(`       Method: ${ep.method} | URL: ${ep.url} | Status: ${res.status} | Thoi gian: ${duration}ms`);
        console.log(`       Du lieu tra ve: ${preview}\n`);
      } else {
        failCount++;
        console.log(`[FAIL] ${ep.name}`);
        console.log(`       Status: ${res.status} | Message: ${data.message || 'Loi khong xac dinh'}\n`);
      }
    } catch (err) {
      failCount++;
      console.log(`[FAIL] ${ep.name}`);
      console.log(`       Loi ket noi: ${err.message}\n`);
    }
  }

  console.log('================================================================');
  console.log(`  TONG KET: ${passCount}/${endpoints.length} API THANH CONG (PASS) | ${failCount} THAT BAI (FAIL)`);
  console.log('================================================================');
}

runTests();
