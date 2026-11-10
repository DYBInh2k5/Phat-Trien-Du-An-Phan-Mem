import { UserRepository } from '../repositories/UserRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  PasswordResetService,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../services/PasswordResetService.js';

const FORGOT_PASSWORD_MESSAGE =
  'Nếu email này đã đăng ký trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (kể cả mục Spam).';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_REGEX = /^[a-f0-9]{64}$/;

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
        tv: user.token_version ?? 0, // dùng để vô hiệu hóa JWT cũ khi đổi mật khẩu
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // 5b. Lấy lớp chủ nhiệm nếu là GVCN (clean architecture: query qua repository)
      let className = null;
      if (user.role === 'GVCN') {
        const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
        className = homeroomClass?.class_name ?? null;
      }

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
          className,
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

      // Lấy lớp chủ nhiệm nếu là GVCN (clean architecture: query qua repository)
      let className = null;
      if (user.role === 'GVCN') {
        const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
        className = homeroomClass?.class_name ?? null;
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.full_name,
          role: user.role,
          className,
        },
      });
    } catch (err) {
      console.error('[AuthController] /me error:', err.message);
      return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }

  static async forgotPassword(req, res) {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || email.length > 255 || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email hợp lệ.' });
    }

    try {
      await PasswordResetService.requestReset(email);
    } catch (err) {
      // Chỉ ghi log. Vẫn trả phản hồi chung để không lộ thông tin tài khoản.
      console.error('[AuthController] forgotPassword error:', err.message);
    }

    return res.status(200).json({ success: true, message: FORGOT_PASSWORD_MESSAGE });
  }

  static async resetPassword(req, res) {
    const { token, newPassword } = req.body || {};

    if (typeof token !== 'string' || !RESET_TOKEN_REGEX.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
        code: 'INVALID_OR_EXPIRED_TOKEN',
      });
    }

    // Kiểm tra mật khẩu TRƯỚC khi dùng token, để nhập sai định dạng không làm mất token.
    if (
      typeof newPassword !== 'string' ||
      newPassword.length < PASSWORD_MIN_LENGTH ||
      newPassword.length > PASSWORD_MAX_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Mật khẩu mới phải có từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.`,
        code: 'INVALID_PASSWORD_FORMAT',
      });
    }

    try {
      const ok = await PasswordResetService.resetPassword(token, newPassword);
      if (!ok) {
        return res.status(400).json({
          success: false,
          message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
          code: 'INVALID_OR_EXPIRED_TOKEN',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
      });
    } catch (err) {
      console.error('[AuthController] resetPassword error:', err.message);
      return res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại sau.' });
    }
  }
}
