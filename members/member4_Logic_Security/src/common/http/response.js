/**
 * Nơi DUY NHẤT dựng response thành công. Controller chỉ gọi ok()/created().
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {{ page: number, limit: number, total: number, totalPages: number }} [meta]
 */
export function ok(res, data, meta) {
  return res.status(200).json(meta ? { success: true, data, meta } : { success: true, data });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

/** Hành động không có dữ liệu trả về (logout...). Vẫn là JSON, không dùng 204. */
export function done(res) {
  return ok(res, null);
}
