import { query } from '../config/db.js';

// Mặc định chạy trực tiếp trên pool. Truyền `db` (client của transaction) để chạy trong transaction.
const defaultDb = { query };

/**
 * Lưu ý: cột `used_at` được dùng cho cả 2 trường hợp
 *  - token đã được dùng để đặt lại mật khẩu
 *  - token bị vô hiệu hóa vì người dùng yêu cầu token mới hơn
 * Cả hai đều có nghĩa là "không còn dùng được nữa".
 */
export class PasswordResetTokenRepository {
    static async create({ userId, tokenHash, ttlMinutes }, db = defaultDb) {
        // Dùng đồng hồ của PostgreSQL để tính hạn, tránh lệch múi giờ giữa Node và DB.
        const res = await db.query(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 minute'))
       RETURNING id, expires_at`,
            [userId, tokenHash, ttlMinutes]
        );
        return res.rows[0];
    }

    /**
     * Kiểm tra và đánh dấu đã dùng trong CÙNG MỘT câu lệnh (nguyên tử).
     * Hai request đồng thời với cùng một token thì chỉ một request nhận được user_id.
     * Trả về user_id nếu token hợp lệ, ngược lại trả về null.
     */
    static async consume(tokenHash, db = defaultDb) {
        const res = await db.query(
            `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        RETURNING user_id`,
            [tokenHash]
        );
        return res.rows[0]?.user_id ?? null;
    }

    /** Vô hiệu hóa mọi token còn hiệu lực của một tài khoản. */
    static async invalidateActiveByUser(userId, db = defaultDb) {
        await db.query(
            `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE user_id = $1 AND used_at IS NULL`,
            [userId]
        );
    }

    /** Đếm số token đã tạo cho tài khoản trong `seconds` giây gần đây (dùng để giới hạn tần suất). */
    static async countCreatedSince(userId, seconds, db = defaultDb) {
        const res = await db.query(
            `SELECT COUNT(*)::int AS total
         FROM password_reset_tokens
        WHERE user_id = $1
          AND created_at > NOW() - ($2::int * INTERVAL '1 second')`,
            [userId, seconds]
        );
        return res.rows[0].total;
    }

    /** Dọn các token đã hết hạn từ lâu để bảng không phình to. */
    static async deleteStale(db = defaultDb) {
        await db.query(`DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days'`);
    }
}