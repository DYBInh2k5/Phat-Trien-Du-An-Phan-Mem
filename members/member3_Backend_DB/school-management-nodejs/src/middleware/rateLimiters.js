import { rateLimit } from 'express-rate-limit';

const tooManyRequests = {
    success: false,
    message: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.',
    code: 'RATE_LIMITED',
};

/** Giới hạn theo IP: 5 yêu cầu quên mật khẩu / 15 phút. */
export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: tooManyRequests,
});

/** Giới hạn theo IP: 10 lần đặt lại mật khẩu / 15 phút (chống dò token). */
export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: tooManyRequests,
});