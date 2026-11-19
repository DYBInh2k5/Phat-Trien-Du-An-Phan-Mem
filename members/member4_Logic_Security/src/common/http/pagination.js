import { z } from 'zod';

export const MAX_LIMIT = 100;

/** Spread vào query schema của mọi endpoint list. */
export const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
};

export function toOffset({ page, limit }) {
  return (page - 1) * limit;
}

export function buildMeta({ page, limit }, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Parse "field" / "-field" theo whitelist => { column, direction } (không bao giờ nối chuỗi người dùng vào SQL). */
export function sortSchema(allowed, defaultSort) {
  return z
    .string()
    .default(defaultSort)
    .refine((value) => allowed.includes(value.replace(/^-/, '')), {
      message: `sort phải thuộc: ${allowed.join(', ')}`,
    });
}

export function parseSort(sort, columnMap) {
  const descending = sort.startsWith('-');
  const key = sort.replace(/^-/, '');
  return { column: columnMap[key], direction: descending ? 'DESC' : 'ASC' };
}
