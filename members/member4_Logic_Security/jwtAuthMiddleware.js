/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member4_Logic_Security/jwtAuthMiddleware.js
 * Vai trò: Middleware Xác Thực Danh Tính Người Dùng Bằng Token JWT (Stateless)
 * Kiến trúc: Clean Architecture - Security Middleware
 * Tác giả: Trần Quang Vinh (Logic & Security Lead)
 * Ngày cập nhật: 17/11/2026
 * Mô tả:
 *   - Trích xuất tiêu đề Authorization: Bearer <token>.
 *   - Xác thực chữ ký bí mật JWT_SECRET với thuật toán an toàn HMAC-SHA256.
 *   - Gắn payload người dùng vào req.user hoặc trả mã HTTP 401/403 nếu không hợp lệ.
 * ==============================================================================
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'HTQLLH_Super_Secret_JWT_Key_2026';

/**
 * Middleware xác thực JSON Web Token
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {Function} next - Callback chuyển tiếp
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Lỗi xác thực: Thiếu Token xác thực JWT (401 Unauthorized).'
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Lỗi phân quyền: Token JWT không hợp lệ hoặc đã hết hạn (403 Forbidden).'
    });
  }
}

/**
 * Hàm sinh mã JWT có thời hạn 24 giờ
 * @param {Object} payload - Dữ liệu người dùng
 * @returns {string} Token JWT
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
