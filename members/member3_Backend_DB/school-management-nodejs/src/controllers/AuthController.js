import { UserRepository } from '../repositories/UserRepository.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'htqllh-secret-key-2025';
const JWT_EXPIRES_IN = '24h';

export class AuthController {
  /**
   * POST /api/auth/login
   * Body: { username, password, role }
   * Response 200: { success, message, token, user: { id, username, name, role } }
   * Response 400: thiếu trường
   * Response 401: sai mật khẩu / tài khoản không tồn tại
   * Response 500: lỗi server / DB
   */
  static async login(req, res) {
    const { username, password, role } = req.body;

    // 1. Kiểm tra đầu vào
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: username, password và role.',
      });
    }

    try {
      // 2. Tra cứu user theo username và role từ PostgreSQL
      const user = await UserRepository.findByUsernameAndRole(username, role);

      // 3. Kiểm tra tài khoản tồn tại
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản không tồn tại hoặc vai trò không khớp.',
          code: 'USER_NOT_FOUND',
        });
      }

      // 4. So khớp mật khẩu bằng bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mã định danh hoặc mật khẩu không chính xác.',
          code: 'INVALID_PASSWORD',
        });
      }

      // 5. Tạo JWT Token
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // 6. Trả kết quả thành công
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập hệ thống HTQLLH thành công!',
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.full_name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('[AuthController] Login error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        code: 'DB_ERROR',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Trả thông tin user đang đăng nhập (từ JWT token đã decode bởi middleware)
   */
  static async me(req, res) {
    try {
      const user = await UserRepository.findByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.full_name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('[AuthController] /me error:', err.message);
      return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
}
