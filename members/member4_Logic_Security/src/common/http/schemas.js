import { z } from 'zod';

export const idParamSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export const semesterSchema = z.enum(['HK1', 'HK2']);

export const schoolYearSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, 'schoolYear phải có dạng YYYY-YYYY')
  .refine((value) => Number(value.slice(5)) === Number(value.slice(0, 4)) + 1, {
    message: 'Năm sau phải bằng năm trước + 1 (vd 2025-2026)',
  });

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: 'Ngày không hợp lệ',
  });

/** Điểm 0-10, tối đa 1 chữ số thập phân. */
export const scoreSchema = z
  .number()
  .min(0, 'Điểm phải từ 0 đến 10')
  .max(10, 'Điểm phải từ 0 đến 10')
  .refine((value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9, {
    message: 'Điểm chỉ được có tối đa 1 chữ số thập phân',
  });

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, {
    message: 'Mật khẩu quá dài (tối đa 72 byte)',
  })
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: 'Mật khẩu phải có cả chữ và số',
  });
