import { z } from 'zod';
import { paginationShape } from '../../common/http/pagination.js';

const nullableId = z.union([z.number().int().positive(), z.null()]);

export const listStudentsQuery = z.strictObject({
  ...paginationShape,
  classId: z.coerce.number().int().positive().optional(),
  unassigned: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  q: z.string().trim().min(1).max(50).optional(),
});

/** classId = null => rút học sinh khỏi lớp. */
export const assignStudentClassBody = z.strictObject({ classId: nullableId });

/** teacherUserId = null => bỏ GVCN của lớp. */
export const assignClassTeacherBody = z.strictObject({ teacherUserId: nullableId });
