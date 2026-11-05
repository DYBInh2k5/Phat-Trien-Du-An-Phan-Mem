import { ClassRepository } from '../repositories/ClassRepository.js';

const GVCN_NOT_ASSIGNED_SENTINEL = '__NO_CLASS__';

/**
 * resolveGvcnClass — Middleware chạy SAU authenticateToken.
 *
 * Với role GVCN: tra lớp chủ nhiệm bằng homeroom_teacher_id FK (trusted user.id từ JWT).
 *   - Có lớp  → req.gvcnClassName = class_name
 *   - Không có lớp → req.gvcnClassName = '__NO_CLASS__' (sentinel, controllers từ chối 403)
 * Với role khác: req.gvcnClassName = null (không hạn chế).
 *
 * KHÔNG dùng username, full_name hay bất kỳ dữ liệu nào từ frontend.
 */
export async function resolveGvcnClass(req, res, next) {
  try {
    if (req.user?.role !== 'GVCN') {
      req.gvcnClassName = null;
      return next();
    }

    const userId = req.user.id;
    const homeroomClass = await ClassRepository.findByHomeroomTeacherId(userId);

    if (!homeroomClass) {
      req.gvcnClassName = GVCN_NOT_ASSIGNED_SENTINEL;
    } else {
      req.gvcnClassName = homeroomClass.class_name;
    }

    return next();
  } catch (err) {
    console.error('[dataAccessMiddleware] resolveGvcnClass error:', err.message);
    req.gvcnClassName = GVCN_NOT_ASSIGNED_SENTINEL;
    return next();
  }
}

export { GVCN_NOT_ASSIGNED_SENTINEL };
