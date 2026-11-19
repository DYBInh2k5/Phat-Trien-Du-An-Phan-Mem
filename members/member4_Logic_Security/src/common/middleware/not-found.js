import { ERROR_CODES } from '../errors/error-codes.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Không tìm thấy đường dẫn ${req.method} ${req.path}`,
    },
    requestId: req.id,
  });
}
