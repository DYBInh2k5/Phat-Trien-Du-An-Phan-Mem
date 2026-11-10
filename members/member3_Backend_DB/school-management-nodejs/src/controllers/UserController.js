import { UserService } from '../services/UserService.js';

/**
 * UserController — Tầng HTTP cho quản lý người dùng (Settings).
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class UserController {
  /**
   * GET /api/users
   * Lấy danh sách toàn bộ người dùng.
   */
  static async getUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ success: true, data: users });
    } catch (err) {
      console.error('[UserController] getUsers error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/users
   * Tạo người dùng mới.
   * Body: { username, password, fullName, email, role, isActive? }
   */
  static async createUser(req, res) {
    try {
      const created = await UserService.createUser(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error('[UserController] createUser error:', err);
      const status = err.message.includes('đã tồn tại') ? 409 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/users/:id
   * Cập nhật thông tin người dùng.
   * Body: { fullName?, email?, role?, isActive?, password? }
   */
  static async updateUser(req, res) {
    try {
      const updated = await UserService.updateUser(Number(req.params.id), req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[UserController] updateUser error:', err);
      const status = err.message.includes('Không tìm thấy') ? 404 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Vô hiệu hóa tài khoản.
   */
  static async deactivateUser(req, res) {
    try {
      const updated = await UserService.deactivateUser(Number(req.params.id));
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[UserController] deactivateUser error:', err);
      const status = err.message.includes('Không tìm thấy') ? 404 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/users/:id
   * Xóa hẳn tài khoản (chỉ áp dụng cho tài khoản đã bị vô hiệu hóa).
   */
  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(Number(req.params.id));
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[UserController] deleteUser error:', err);
      const status = err.message.includes('Không tìm thấy') ? 404 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }
}
