import { z } from 'zod';
import { dateStringSchema } from '../../common/http/schemas.js';

export const conductQuery = z.strictObject({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
