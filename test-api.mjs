/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: test-api.mjs
 * Vai trò: Kịch Bản Kiểm Thử Tự Động Toàn Bộ RESTful API (Automated API Smoke Test)
 * Mục đích:
 *   - Kiểm tra tính sẵn sàng của 10 đầu mút API cốt lõi trên Backend Express.
 *   - Đo lường thời gian phản hồi (Latency / Response Time) theo mili-giây.
 *   - Kiểm tra mã trạng thái HTTP trả về (Status Code 200, 201) và tính hợp lệ của JSON.
 *   - Phục vụ báo cáo trực tiếp trước Hội đồng và nghiệm thu kỹ thuật.
 * 
 * Lệnh chạy:
 *   node test-api.mjs
 * ==============================================================================
 */

// Địa chỉ cơ sở của máy chủ Backend Node.js
const BASE_URL = 'http://localhost:8081';

/**
 * Danh mục 10 ca kiểm thử đầu mút API quan trọng của hệ thống
 */
const endpoints = [
  { name: '1. Kiểm tra Sức khỏe Hệ thống (Health Check)', method: 'GET', url: '/api/health' },
  { name: '2. Lấy Toàn bộ Danh sách Học sinh (Students)', method: 'GET', url: '/api/students' },
  { name: '3. Lọc Danh sách Học sinh theo Lớp 10A1', method: 'GET', url: '/api/students?className=10A1' },
  { name: '4. Tra cứu Sổ điểm điện tử Lớp 10A1', method: 'GET', url: '/api/gradebook?className=10A1' },
  { name: '5. Lấy Danh sách Điểm danh Chuyên cần', method: 'GET', url: '/api/attendance' },
  { name: '6. Lấy Danh sách Đơn xin Nghỉ phép từ Phụ huynh', method: 'GET', url: '/api/leave-requests' },
  { name: '7. Lấy Danh mục Học phí & Tình trạng đóng tiền', method: 'GET', url: '/api/tuition' },
  { name: '8. Lấy Danh mục Lớp học toàn trường', method: 'GET', url: '/api/classes' },
  { name: '9. Lấy Danh mục Môn học giảng dạy', method: 'GET', url: '/api/subjects' },
  {
    name: '10. Xác thực Đăng nhập Người dùng (Auth Login)',
    method: 'POST',
    url: '/api/auth/login',
    body: { username: 'admin', password: '123', role: 'ROLE_ADMIN' }
  }
];

/**
 * Hàm điều phối thực thi chuỗi kiểm thử tự động
 * @async
 */
async function runTests() {
  console.log('================================================================');
  console.log('  KẾT QUẢ KIỂM THỬ TOÀN DIỆN CÁC ĐẦU MÚT RESTful API (HTQLLH)');
  console.log(`  Target Backend: ${BASE_URL}`);
  console.log('================================================================\n');

  let passCount = 0;
  let failCount = 0;

  // Lặp tuần tự qua từng đầu mút API để thực thi kiểm thử
  for (const ep of endpoints) {
    try {
      const options = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.body) {
        options.body = JSON.stringify(ep.body);
      }

      // Đo thời gian bắt đầu gửi yêu cầu mạng
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}${ep.url}`, options);
      // Đo độ trễ phản hồi
      const duration = Date.now() - startTime;
      const data = await res.json();

      // Kiểm tra mã trạng thái HTTP: thành công nếu < 400
      if (res.ok || res.status < 400) {
        passCount++;
        const preview = Array.isArray(data)
          ? `[Mảng ${data.length} bản ghi]`
          : JSON.stringify(data).substring(0, 60) + '...';
        console.log(`[PASS] ${ep.name}`);
        console.log(`       Method: ${ep.method} | URL: ${ep.url} | Status: ${res.status} | Thời gian: ${duration}ms`);
        console.log(`       Dữ liệu trả về: ${preview}\n`);
      } else {
        failCount++;
        console.log(`[FAIL] ${ep.name}`);
        console.log(`       Status: ${res.status} | Thông báo: ${data.message || 'Lỗi không xác định'}\n`);
      }
    } catch (err) {
      failCount++;
      console.log(`[FAIL] ${ep.name}`);
      console.log(`       Lỗi kết nối mạng: ${err.message}\n`);
    }
  }

  // Tổng kết kết quả sau khi duyệt hết các đầu mút
  console.log('================================================================');
  console.log(`  TỔNG KẾT: ${passCount}/${endpoints.length} API THÀNH CÔNG (PASS) | ${failCount} THẤT BẠI (FAIL)`);
  console.log('================================================================');
}

// Kích hoạt chạy kịch bản kiểm thử
runTests();
