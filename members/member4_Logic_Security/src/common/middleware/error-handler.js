import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NUMERIC_OUT_OF_RANGE = '22003';

function body(requestId, code, message, details) {
  const error = { code, message };
  if (details !== undefined) {
    error.details = details;
  }
  return { success: false, error, requestId };
}

/** Nơi DUY NHẤT sinh response lỗi. */
export function createErrorHandler({ logger, isProduction }) {
  // Express nhận diện error-handler qua đúng 4 tham số nên _next phải có mặt
  return (err, req, res, _next) => {
    if (err instanceof AppError) {
      return res.status(err.status).json(body(req.id, err.code, err.message, err.details));
    }
    if (err?.type === 'entity.parse.failed') {
      return res
        .status(400)
        .json(body(req.id, ERROR_CODES.BAD_REQUEST, 'Body không phải JSON hợp lệ'));
    }
    if (err?.type === 'entity.too.large') {
      return res
        .status(413)
        .json(body(req.id, ERROR_CODES.PAYLOAD_TOO_LARGE, 'Dữ liệu gửi lên quá lớn'));
    }
    if (err?.code === PG_UNIQUE_VIOLATION) {
      return res.status(409).json(body(req.id, ERROR_CODES.CONFLICT, 'Dữ liệu đã tồn tại'));
    }
    if (err?.code === PG_FOREIGN_KEY_VIOLATION || err?.code === PG_NUMERIC_OUT_OF_RANGE) {
      return res
        .status(422)
        .json(body(req.id, ERROR_CODES.VALIDATION_ERROR, 'Dữ liệu không hợp lệ'));
    }
    logger.error({ err, requestId: req.id }, 'unhandled error');
    const message = isProduction ? 'Lỗi hệ thống' : `Lỗi hệ thống: ${err?.message ?? 'unknown'}`;
    return res.status(500).json(body(req.id, ERROR_CODES.INTERNAL_ERROR, message));
  };
}
