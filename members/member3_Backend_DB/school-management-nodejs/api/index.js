/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/api/index.js
 * Vai trò: Vercel Serverless Function Adapter cho Express Backend
 * Kiến trúc: Clean Architecture - Tầng Ngoại Vi / Adapter Đám Mây (Cloud Adapter)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày tạo: 24/11/2026
 * Mô tả: Chuyển tiếp toàn bộ HTTP request đến cá thể Express app trên nền tảng Vercel
 * ==============================================================================
 */

import app from '../server.js';

/**
 * Xuất mặc định bộ xử lý yêu cầu HTTP serverless function
 * @param {import('http').IncomingMessage} req - Đối tượng yêu cầu HTTP
 * @param {import('http').ServerResponse} res - Đối tượng phản hồi HTTP
 * @returns {void}
 */
export default app;
