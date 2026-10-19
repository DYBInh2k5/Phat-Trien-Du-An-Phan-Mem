/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/api/client.js
 * Vai trò: Trình Điều Khiển Kết Nối Mạng HTTP (Network HTTP Client)
 * Giao thức: RESTful API - JSON over HTTP Fetch API
 * Mô tả:
 *   - Điểm nút tập trung kết nối giữa Frontend React và Backend Express.
 *   - Tự động tiền tố URL cơ sở từ biến môi trường VITE_API_BASE_URL (mặc định http://localhost:8081/api).
 *   - Chuẩn hóa tiêu đề Header 'Content-Type: application/json'.
 *   - Tự động tuần tự hóa (JSON.stringify) dữ liệu gửi lên trong phần thân (Body).
 *   - Bắt và bóc tách thông báo lỗi chi tiết từ máy chủ khi mã phản hồi khác 2xx.
 * ==============================================================================
 */

// Địa chỉ gốc của máy chủ API Backend (lấy từ biến môi trường Vite hoặc mặc định cổng 8081)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

/**
 * Hàm gọi API tổng quát (Wrapper xung quanh Fetch API chuẩn)
 * @async
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/students', '/gradebooks')
 * @param {Object} [options] - Cấu hình yêu cầu HTTP
 * @param {Object} [options.body] - Dữ liệu tải trọng cần gửi lên (Payload object)
 * @param {string} [options.method='GET'] - Phương thức HTTP (GET, POST, PUT, DELETE, PATCH)
 * @param {Object} [options.headers={}] - Các tiêu đề HTTP bổ sung
 * @param {Object} [options.customConfig] - Các thiết lập khác của fetch (như credentials, signal)
 * @returns {Promise<Object>} Dữ liệu JSON phản hồi từ Backend
 * @throws {Error} Ngoại lệ kèm theo mã trạng thái status và dữ liệu chi tiết data
 */
export async function apiClient(endpoint, { body, method = 'GET', headers = {}, ...customConfig } = {}) {
  // Cấu hình các thiết lập chuẩn cho yêu cầu mạng
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  // Nếu có dữ liệu gửi đi (body), chuyển đổi đối tượng Javascript thành chuỗi JSON
  if (body) {
    config.body = JSON.stringify(body);
  }

  // Chuẩn hóa địa chỉ URL đầy đủ (hỗ trợ cả URL tương đối và tuyệt đối)
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    // Thực thi gửi yêu cầu mạng qua Fetch API
    const response = await fetch(url, config);

    // Giải mã kết quả trả về từ dạng JSON (nếu không parse được trả về null an toàn)
    const data = await response.json().catch(() => null);

    // Kiểm tra mã trạng thái HTTP (200-299 là thành công)
    if (!response.ok) {
      // Trích xuất thông báo lỗi từ phía backend hoặc tạo thông điệp chuẩn HTTP
      const errorMsg = data?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Trả về dữ liệu thành công cho nơi gọi (Component / Service)
    return data;
  } catch (err) {
    // Ghi cảnh báo ra cửa sổ điều khiển Console hỗ trợ kiểm lỗi mạng
    console.warn(`[API Client Warning] URL: ${url} - `, err.message);
    throw err;
  }
}

export default apiClient;
