import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'htqllh-secret-key-2025';

/**
 * Xác thực JWT và kiểm tra token còn "đời" hiện tại của tài khoản hay không.
 * Khi đặt lại mật khẩu, users.token_version tăng lên nên mọi JWT cũ (mang tv cũ) bị từ chối.
 * Token cấp trước khi có tính năng này không có `tv` -> coi là 0, vẫn hợp lệ cho đến lần đặt lại mật khẩu đầu tiên.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Thiếu token xác thực.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }

  try {
    const state = await UserRepository.findAuthStateById(decoded.id);
    if (!state || state.token_version !== (decoded.tv ?? 0)) {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.',
        code: 'TOKEN_REVOKED',
      });
    }
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('[authMiddleware] Lỗi kiểm tra phiên:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
}