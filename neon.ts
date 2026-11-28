/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: neon.ts
 * Vai trò: Cấu hình Khởi tạo và Quản trị Dịch vụ Đám mây Neon (Cloud Services Config)
 * Kiến trúc: Clean Architecture - Tầng Hạ Tầng Cơ Sở Dữ Liệu (Database Infrastructure)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày cập nhật: 24/11/2026
 * Mô tả: Cấu hình phân nhánh, auth, aiGateway, realtime, functions và storage trên Neon
 * ==============================================================================
 */

import { defineConfig } from "@neon/config/v1";

/**
 * Cấu hình toàn diện các dịch vụ tích hợp cho dự án HTQLLH trên nền tảng Neon
 */
export default defineConfig({
  // Kích hoạt tính năng xem trước truy vấn Realtime
  preview: {
    realtime: true,
  },
  // Kích hoạt dịch vụ xác thực người dùng tích hợp
  auth: true,
  // Kích hoạt cổng định tuyến AI Gateway
  aiGateway: true,
  // Đăng ký các hàm Serverless Functions
  functions: {
    hello: { name: "Hello World", source: "./hello.ts" },
  },
  // Khởi tạo các kho chứa tệp và đa phương tiện Object Storage
  buckets: {
    // "private" là mặc định; sử dụng "public_read" cho truy cập công khai
    assets: { access: "private" },
  },
  // Chính sách phân nhánh cơ sở dữ liệu động (Branching Policy)
  branch: (branch) => {
    if (branch.isDefault) {
      // Phân nhánh mặc định (production): không ghi đè, sử dụng cấu hình gốc
      return {};
    }
    if (!branch.exists) {
      // Phân nhánh mới tự động hết hạn sau 7 ngày để tiết kiệm tài nguyên
      return { ttl: "7d" };
    }
    // Phân nhánh đã tồn tại: giữ nguyên cấu hình
    return {};
  },
});
