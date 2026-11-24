/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: hello.ts
 * Vai trò: Neon Serverless Function mẫu (Demo Function Endpoint)
 * Kiến trúc: Clean Architecture - Tầng Hạ Tầng Đám Mây (Cloud Serverless Functions)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày tạo: 24/11/2026
 * Mô tả: Điểm cuối hàm Serverless Function trên nền tảng Neon
 * ==============================================================================
 */

/**
 * Hàm serverless phản hồi thông điệp chào mừng từ Neon Functions
 * @async
 * @function hello
 * @returns {Promise<Response>} Đối tượng phản hồi chuẩn Web Fetch API
 */
export default async function hello(): Promise<Response> {
  // Trả về phản hồi HTTP dạng văn bản thuần
  return new Response("Hello from Neon Functions - HTQLLH Project");
}
