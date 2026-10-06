import { UserRepository } from '../repositories/UserRepository.js';
import jwt from 'jsonwebtoken';

export class AuthController {
  static async login(req, res) {
    const { username, password, role } = req.body;

    try {
      const user = await UserRepository.findByUsernameAndRole(username, role);
      if (!user) {
        // Fallback for quick login demo
        const token = jwt.sign({ username, role }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '24h' });
        return res.json({
          success: true,
          message: 'Đăng nhập thành công (Demo Role)',
          user: { username, role, name: username },
          token,
        });
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '24h' });

      return res.json({
        success: true,
        message: 'Đăng nhập hệ thống HTQLLH thành công!',
        user: { id: user.id, username: user.username, name: user.full_name, role: user.role },
        token,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
