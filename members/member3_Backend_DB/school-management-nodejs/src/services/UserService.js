import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';

const SALT_ROUNDS = 10;

/**
 * UserService — Business logic cho quản lý người dùng (Settings).
 * Không chứa SQL, chỉ gọi Repository và xử lý logic.
 */
export class UserService {
  /** Normalize DB row → frontend DTO */
  static toDto(row) {
    return {
      id:        row.id,
      name:      row.full_name,
      username:  row.username,
      email:     row.email || '',
      role:      row.role,
      isActive:  row.is_active ?? true,
      createdAt: row.created_at,
    };
  }

  /** Lấy toàn bộ danh sách người dùng. */
  static async getAllUsers() {
    const rows = await UserRepository.findAll();
    return rows.map(this.toDto);
  }

  /**
   * Tạo người dùng mới. Hash password trước khi lưu.
   * @param {{ username, password, fullName, email, role, isActive }} data
   */
  static async createUser(data) {
    const { username, password, fullName, email, role, isActive } = data;
    if (!username || !password || !fullName || !role) {
      throw new Error('Thiếu thông tin bắt buộc: username, password, fullName, role');
    }
    const existing = await UserRepository.findByUsername(username);
    if (existing) throw new Error(`Tên đăng nhập "${username}" đã tồn tại`);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await UserRepository.create({
      username,
      password: passwordHash,
      fullName,
      email:    email || null,
      role,
      isActive: isActive !== false,
    });
    return this.toDto(created);
  }

  /**
   * Cập nhật thông tin user. Chỉ hash password nếu truyền password mới.
   * Finding 2: Nếu role thay đổi từ GVCN sang role khác, tự động xóa phân công lớp chủ nhiệm
   * ở backend để tránh trạng thái không nhất quán khi frontend request homeroom thất bại.
   * @param {number} id
   * @param {{ fullName?, email?, role?, isActive?, password? }} data
   */
  static async updateUser(id, data) {
    const existing = await UserRepository.findById(id);
    if (!existing) throw new Error(`Không tìm thấy tài khoản id=${id}`);

    const updatePayload = {
      fullName: data.fullName,
      email:    data.email,
      role:     data.role,
      isActive: data.isActive,
    };

    if (data.password && data.password.trim() !== '') {
      updatePayload.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updated = await UserRepository.update(id, updatePayload);

    // Finding 2: nếu role đổi từ GVCN sang role khác → dọn phân công lớp chủ nhiệm
    // Thực hiện ở tầng Service để atomic với updateUser, không phụ thuộc vào frontend
    if (existing.role === 'GVCN' && data.role && data.role !== 'GVCN') {
      await ClassRepository.removeHomeroom(id);
    }

    return this.toDto(updated);
  }

  /**
   * Vô hiệu hóa tài khoản (is_active = false).
   * Finding 5: Nếu user là GVCN, tự động xóa phân công lớp chủ nhiệm ở backend
   * để tránh lớp bị khóa với homeroom_teacher_id trỏ vào tài khoản disabled.
   * @param {number} id
   */
  static async deactivateUser(id) {
    const existing = await UserRepository.findById(id);
    if (!existing) throw new Error(`Không tìm thấy tài khoản id=${id}`);

    // Finding 5: cascade xóa phân công homeroom trước khi deactivate
    if (existing.role === 'GVCN') {
      await ClassRepository.removeHomeroom(id);
    }

    const updated = await UserRepository.deactivate(id);
    return this.toDto(updated);
  }

  /**
   * Xóa hẳn tài khoản. Chỉ cho phép xóa tài khoản đã bị vô hiệu hóa.
   * @param {number} id
   */
  static async deleteUser(id) {
    const existing = await UserRepository.findById(id);
    if (!existing) throw new Error(`Không tìm thấy tài khoản id=${id}`);
    if (existing.is_active) throw new Error('Chỉ có thể xóa tài khoản đã bị vô hiệu hóa');
    const deleted = await UserRepository.deleteById(id);
    if (!deleted) throw new Error('Xóa tài khoản thất bại');
    return { id };
  }
}
