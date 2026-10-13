const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const STORAGE_KEY = 'htqllh_auth';

/**
 * Lấy JWT token đang lưu trong localStorage.
 */
function getStoredToken() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.token ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Custom Fetch API Client cho backend Node.js Express + PostgreSQL.
 * Tự động đính kèm JWT token nếu có.
 * Throws lỗi thực sự (không fallback giả) khi API trả HTTP error.
 */
export async function apiClient(endpoint, { body, method = 'GET', headers = {}, ...customConfig } = {}) {
  const token = getStoredToken();

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Tự động đính kèm token nếu có (trừ khi caller tự truyền Authorization)
      ...(token && !headers['Authorization'] ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;
