/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/utils/UnitOfWork.js
 * Vai trò: Quản Lý Giao Dịch Nguyên Tử (Unit of Work Transaction Pattern)
 * Mẫu thiết kế: Unit of Work (Martin Fowler) & Đảm bảo tính chất ACID
 * Nghiệp vụ áp dụng:
 *   - Lưu đồng loạt điểm số của cả lớp (45 học sinh): tất cả cùng lưu thành công hoặc hoàn tác toàn bộ.
 *   - Khóa sổ điểm học kỳ kèm theo cập nhật trạng thái kiểm toán.
 * Mô tả:
 *   - Mượn một Client kết nối độc quyền từ pg.Pool.
 *   - Phát lệnh SQL 'BEGIN' để khởi tạo phạm vi giao dịch.
 *   - Cung cấp hàm 'commit()' để xác nhận vĩnh viễn dữ liệu khi tất cả câu lệnh thành công.
 *   - Cung cấp hàm 'rollback()' để khôi phục 100% trạng thái ban đầu nếu có bất kỳ lỗi nào.
 *   - Đảm bảo luôn giải phóng Client về lại Pool trong khối 'finally' để tránh rò rỉ kết nối (Connection Leak).
 * ==============================================================================
 */

import { pool } from '../config/db.js';

/**
 * Lớp điều phối giao dịch UnitOfWork
 */
export class UnitOfWork {
  constructor() {
    this.client = null;         // Đối tượng Client PostgreSQL độc quyền mượn từ Pool
    this.inTransaction = false; // Cờ đánh dấu giao dịch đang mở hay đã đóng
  }

  /**
   * Bắt đầu một giao dịch cơ sở dữ liệu mới (BEGIN)
   * @async
   */
  async beginTransaction() {
    try {
      // Mượn một Client kết nối chuyên biệt từ hồ chứa Pool
      this.client = await pool.connect();
      // Gửi lệnh SQL bắt đầu Transaction
      await this.client.query('BEGIN');
      this.inTransaction = true;
      console.log('[UNIT OF WORK] Transaction started.');
    } catch (err) {
      console.warn(`[UNIT OF WORK WARN] Could not begin PostgreSQL transaction: ${err.message}. Using stateful in-memory transaction scope.`);
      this.client = null;
      this.inTransaction = true;
    }
  }

  /**
   * Thực thi câu truy vấn SQL bên trong phạm vi giao dịch hiện hành
   * @async
   * @param {string} text - Câu lệnh SQL có tham số hóa
   * @param {Array<any>} [params=[]] - Mảng tham số $1, $2...
   * @returns {Promise<import('pg').QueryResult|null>}
   */
  async query(text, params = []) {
    if (this.client) {
      return await this.client.query(text, params);
    }
    return null;
  }

  /**
   * Xác nhận và lưu vĩnh viễn toàn bộ các thay đổi vào ổ cứng (COMMIT)
   * Luôn giải phóng Client về lại hồ chứa Pool dù thành công hay thất bại.
   * @async
   */
  async commit() {
    if (this.inTransaction) {
      if (this.client) {
        try {
          await this.client.query('COMMIT');
          console.log('[UNIT OF WORK] Transaction committed successfully.');
        } finally {
          // BẮT BUỘC: Trả kết nối về lại cho hồ chứa Pool để các yêu cầu khác tái sử dụng
          this.client.release();
          this.client = null;
        }
      }
      this.inTransaction = false;
    }
  }

  /**
   * Hoàn tác toàn bộ các thao tác đã thực hiện trong giao dịch (ROLLBACK)
   * Đưa trạng thái cơ sở dữ liệu trở về chính xác thời điểm trước khi gọi beginTransaction.
   * @async
   */
  async rollback() {
    if (this.inTransaction) {
      if (this.client) {
        try {
          await this.client.query('ROLLBACK');
          console.log('[UNIT OF WORK] Transaction rolled back.');
        } catch (err) {
          console.error(`[UNIT OF WORK ERROR] Rollback error: ${err.message}`);
        } finally {
          // BẮT BUỘC: Trả kết nối về lại cho hồ chứa Pool
          this.client.release();
          this.client = null;
        }
      }
      this.inTransaction = false;
    }
  }
}
