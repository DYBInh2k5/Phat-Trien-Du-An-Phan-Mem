import { ERROR_CODES } from './error-codes.js';

/** Lỗi nghiệp vụ "đã biết". Chỉ error-handler mới biến nó thành HTTP response. */
export class AppError extends Error {
  /**
   * @param {{ status: number, code: string, message: string, details?: unknown }} params
   */
  constructor({ status, code, message, details }) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const make = (status, code) => (message, details) =>
  new AppError({ status, code, message, details });

/** Factory để ném lỗi gọn: throw Errors.notFound('Học sinh') */
export const Errors = Object.freeze({
  badRequest: make(400, ERROR_CODES.BAD_REQUEST),
  unauthenticated: (message = 'Chưa đăng nhập hoặc token không hợp lệ') =>
    new AppError({ status: 401, code: ERROR_CODES.UNAUTHENTICATED, message }),
  tokenExpired: () =>
    new AppError({ status: 401, code: ERROR_CODES.TOKEN_EXPIRED, message: 'Token đã hết hạn' }),
  invalidCredentials: () =>
    new AppError({
      status: 401,
      code: ERROR_CODES.INVALID_CREDENTIALS,
      message: 'Sai tên đăng nhập hoặc mật khẩu',
    }),
  refreshTokenInvalid: () =>
    new AppError({
      status: 401,
      code: ERROR_CODES.REFRESH_TOKEN_INVALID,
      message: 'Refresh token không hợp lệ, đã hết hạn hoặc đã bị thu hồi',
    }),
  forbidden: (message = 'Bạn không có quyền thực hiện thao tác này') =>
    new AppError({ status: 403, code: ERROR_CODES.FORBIDDEN, message }),
  notFound: (what = 'Tài nguyên') =>
    new AppError({ status: 404, code: ERROR_CODES.NOT_FOUND, message: `${what} không tồn tại` }),
  conflict: make(409, ERROR_CODES.CONFLICT),
  gradebookLocked: () =>
    new AppError({
      status: 409,
      code: ERROR_CODES.GRADEBOOK_LOCKED,
      message: 'Sổ điểm đã chốt, không thể chỉnh sửa',
    }),
  gradebookAlreadyLocked: () =>
    new AppError({
      status: 409,
      code: ERROR_CODES.GRADEBOOK_ALREADY_LOCKED,
      message: 'Sổ điểm này đã được chốt trước đó',
    }),
  alreadyDeleted: () =>
    new AppError({ status: 409, code: ERROR_CODES.ALREADY_DELETED, message: 'Bản ghi đã bị xóa' }),
  notDeleted: () =>
    new AppError({ status: 409, code: ERROR_CODES.NOT_DELETED, message: 'Bản ghi chưa bị xóa' }),
  validation: (details) =>
    new AppError({
      status: 422,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Dữ liệu không hợp lệ',
      details,
    }),
  tooManyRequests: (message = 'Thao tác quá nhanh, vui lòng thử lại sau') =>
    new AppError({ status: 429, code: ERROR_CODES.TOO_MANY_REQUESTS, message }),
});
