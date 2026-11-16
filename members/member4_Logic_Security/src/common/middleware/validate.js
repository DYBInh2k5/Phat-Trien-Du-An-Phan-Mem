import { Errors } from '../errors/app-error.js';

const PARTS = ['params', 'query', 'body'];

/**
 * Validate bằng zod, gán kết quả ĐÃ ÉP KIỂU vào req.valid.{params,query,body}.
 * Controller chỉ đọc req.valid, không bao giờ đọc req.body/req.query thô.
 * Dùng z.strictObject() trong schema để chặn field lạ (mass-assignment).
 * @param {{ params?: import('zod').ZodType, query?: import('zod').ZodType, body?: import('zod').ZodType }} schemas
 */
export function validate(schemas) {
  return (req, _res, next) => {
    const valid = {};
    const details = [];
    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) {
        continue;
      }
      const result = schema.safeParse(req[part] ?? {});
      if (result.success) {
        valid[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({ in: part, field: issue.path.join('.'), message: issue.message });
        }
      }
    }
    if (details.length > 0) {
      return next(Errors.validation(details));
    }
    req.valid = valid;
    return next();
  };
}
