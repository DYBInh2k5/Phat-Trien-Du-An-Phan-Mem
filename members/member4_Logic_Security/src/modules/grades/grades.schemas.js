import { z } from 'zod';
import { paginationShape, sortSchema } from '../../common/http/pagination.js';
import {
  idParamSchema,
  schoolYearSchema,
  scoreSchema,
  semesterSchema,
} from '../../common/http/schemas.js';

export { idParamSchema };

const optionalScore = scoreSchema.nullable().optional();
const scoreFields = {
  scoreOral: optionalScore,
  score15m: optionalScore,
  score1Hour: optionalScore,
  scoreMidTerm: optionalScore,
  scoreFinalTerm: optionalScore,
};
const subjectName = z.string().trim().min(1).max(50);
const booleanQuery = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const listGradeBooksQuery = z.strictObject({
  ...paginationShape,
  classId: z.coerce.number().int().positive(),
  subjectName: subjectName.optional(),
  semester: semesterSchema.optional(),
  schoolYear: schoolYearSchema.optional(),
  includeDeleted: booleanQuery,
  sort: sortSchema(
    ['studentCode', 'studentName', 'averageScore', 'subjectName', 'id'],
    'studentCode',
  ),
});

export const termQuery = z.strictObject({
  semester: semesterSchema.optional(),
  schoolYear: schoolYearSchema.optional(),
});

export const createGradeBody = z.strictObject({
  studentId: z.number().int().positive(),
  subjectName,
  semester: semesterSchema,
  schoolYear: schoolYearSchema,
  ...scoreFields,
});

export const updateGradeBody = z
  .strictObject(scoreFields)
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Cần gửi ít nhất một cột điểm để sửa',
  });

export const bulkGradesBody = z.strictObject({
  classId: z.number().int().positive(),
  subjectName,
  semester: semesterSchema,
  schoolYear: schoolYearSchema,
  entries: z
    .array(z.strictObject({ studentId: z.number().int().positive(), ...scoreFields }))
    .min(1)
    .max(100)
    .refine((entries) => new Set(entries.map((e) => e.studentId)).size === entries.length, {
      message: 'entries không được trùng studentId',
    }),
});

export const recalculateBody = z.strictObject({
  semester: semesterSchema,
  schoolYear: schoolYearSchema,
});

export const lockBody = z.strictObject({
  classId: z.number().int().positive(),
  semester: semesterSchema,
  schoolYear: schoolYearSchema,
  note: z.string().trim().max(500).optional(),
});

export const unlockBody = z.strictObject({
  classId: z.number().int().positive(),
  semester: semesterSchema,
  schoolYear: schoolYearSchema,
  reason: z.string().trim().min(10, 'Lý do mở khóa tối thiểu 10 ký tự').max(500),
});

export const listLocksQuery = z.strictObject({ ...paginationShape });
