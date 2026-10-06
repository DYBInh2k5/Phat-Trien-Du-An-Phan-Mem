import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'HTQLLH_Super_Secret_JWT_Key_2026';

/**
 * Member 4: Logic & Security - JWT Authentication Middleware
 * Validates JSON Web Token in HTTP Authorization Header (Bearer <token>)
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

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
