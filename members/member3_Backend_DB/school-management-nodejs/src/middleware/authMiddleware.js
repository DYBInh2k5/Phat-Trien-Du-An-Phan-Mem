import jwt from 'jsonwebtoken';

/**
 * Middleware xác thực JWT Token.
 * - Lấy token từ header Authorization: Bearer <token>
 * - Xác minh chữ ký và thời hạn token
 * - Gắn thông tin user (id, username, role) vào req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'htqllh-secret-key-2025');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ. Vui lòng đăng nhập lại.',
      code: 'TOKEN_INVALID',
    });
  }
}

/**
 * Middleware kiểm tra quyền (role-based).
 * @param {string[]} allowedRoles - Danh sách roles được phép truy cập
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${allowedRoles.join(', ')}.`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}
