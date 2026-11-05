import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { withTransaction } from '../config/db.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordResetTokenRepository } from '../repositories/PasswordResetTokenRepository.js';
import { EmailService } from './EmailService.js';

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 24;

const TOKEN_TTL_MINUTES = 15;
const COOLDOWN_SECONDS = 60;      // tối thiểu 60 giây giữa 2 lần yêu cầu của cùng một tài khoản
const MAX_REQUESTS_PER_HOUR = 5;  // tối đa 5 yêu cầu/giờ cho mỗi tài khoản
const BCRYPT_ROUNDS = 10;         // khớp với hash hiện có ($2a$10$...)

/** Token ngẫu nhiên 256 bit có entropy cao nên SHA-256 là đủ (và cho phép tra cứu theo hash). */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export class PasswordResetService {
    /**
     * Xử lý yêu cầu quên mật khẩu. KHÔNG throw và KHÔNG trả kết quả khác nhau
     * giữa "email có tồn tại" và "email không tồn tại", để không lộ thông tin tài khoản.
     */
    static async requestReset(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user) return;

        // Giới hạn tần suất theo tài khoản (bổ sung cho rate limit theo IP)
        if ((await PasswordResetTokenRepository.countCreatedSince(user.id, COOLDOWN_SECONDS)) > 0) return;
        if ((await PasswordResetTokenRepository.countCreatedSince(user.id, 3600)) >= MAX_REQUESTS_PER_HOUR) return;

        const rawToken = crypto.randomBytes(32).toString('hex'); // 64 ký tự hex
        const tokenHash = hashToken(rawToken);

        await withTransaction(async (db) => {
            // Chỉ token mới nhất có hiệu lực
            await PasswordResetTokenRepository.invalidateActiveByUser(user.id, db);
            await PasswordResetTokenRepository.create(
                { userId: user.id, tokenHash, ttlMinutes: TOKEN_TTL_MINUTES },
                db
            );
        });

        PasswordResetTokenRepository.deleteStale().catch(() => { });

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

        // Không await: thời gian phản hồi API không phụ thuộc việc email tồn tại hay không.
        EmailService.sendPasswordResetEmail({
            to: user.email,
            fullName: user.full_name,
            resetLink,
            expiresInMinutes: TOKEN_TTL_MINUTES,
        }).catch((err) => {
            console.error('[PasswordReset] Gửi email thất bại:', err.message);
        });
    }

    /**
     * Đặt lại mật khẩu bằng token.
     * Trả về true nếu thành công, false nếu token không hợp lệ / hết hạn / đã dùng.
     * Đổi mật khẩu + đánh dấu token đã dùng + tăng token_version nằm trong cùng một transaction.
     */
    static async resetPassword(rawToken, newPassword) {
        const tokenHash = hashToken(rawToken);

        return withTransaction(async (db) => {
            const userId = await PasswordResetTokenRepository.consume(tokenHash, db);
            if (!userId) return false;

            const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
            const updated = await UserRepository.updatePasswordAndRevokeSessions(userId, passwordHash, db);
            if (!updated) {
                throw new Error('Không cập nhật được mật khẩu: tài khoản không tồn tại.');
            }

            // Vô hiệu hóa nốt các token khác còn hiệu lực của tài khoản này
            await PasswordResetTokenRepository.invalidateActiveByUser(userId, db);
            return true;
        });
    }
}