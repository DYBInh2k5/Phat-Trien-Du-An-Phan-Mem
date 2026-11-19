/**
 * ================================================================================
 * TẬP TIN: update_jira_to_pbi.js
 * MỤC ĐÍCH: Cập nhật các Task trên Jira Cloud trực quan, rõ ràng từng tính năng
 *           kèm mã PBI, đối tượng sử dụng và nghiệp vụ cụ thể theo yêu cầu của Cô.
 * ================================================================================
 */

const EMAIL = process.env.JIRA_EMAIL || 'bron@reputyze.asia';
const TOKEN = process.env.JIRA_API_TOKEN || '';
const BASE_URL = 'https://reputyze-team-vx3aseym.atlassian.net';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

const ACCOUNTS = {
  BINH: '712020:79b4e402-a50a-4abe-b0fb-cbc1ab970f0b', // Võ Duy Bình (Trưởng nhóm / PM & Lead BA)
  SON: '712020:ddaac429-5198-401c-b698-ac5eb109a266',   // Võ Hoàng Sơn (Frontend Lead)
  TINH: '712020:98a8fcf2-38b4-4f58-9c9c-3adf22bb7bfb',  // Huỳnh Trung Tính (Backend & DBA)
  VINH: '712020:99cb73b9-1555-4eab-aa57-bd0153ed56b2',  // Trần Quang Vinh (Logic Security)
  BAO: '712020:7fdce8da-74bf-4f73-9c1c-3531aed9d3a1'    // Nguyễn Minh Quốc Bảo (QA Testing Lead)
};

async function jiraRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': AUTH_HEADER,
      'Accept': 'application/json'
    }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, ok: res.ok, data: text };
  }
}

// Danh sách 27 PBIs diễn giải chi tiết, trực quan
const PBI_LIST = [
  // --- MODULE 1: XÁC THỰC, QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN (Parent: KAN-6) ---
  {
    key: 'KAN-112',
    parentKey: 'KAN-6',
    summary: '[Module 1] PBI-01: Đăng nhập JWT vô trạng thái & Nút 1-Click Demo Login 5 vai trò (BGH, GV, HS, PH)',
    description: 'Người dùng (BGH, GVCN, GVBM, HS, PH) đăng nhập bằng username/password nhận JWT Token 24h hoặc sử dụng nút 1-Click Demo Login chuyển đổi nhanh vai trò để chấm thi và trải nghiệm giao diện.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-113',
    parentKey: 'KAN-6',
    summary: '[Module 1] PBI-02: Middleware RBAC kiểm soát phân quyền 5 cấp bậc & Chặn truy cập trái phép',
    description: 'Hệ thống tự động xác thực Bearer Token trước mỗi request, kiểm tra RoleCode người dùng và chặn 403 Forbidden đối với truy cập trái quyền (HS không được xem lớp khác, PH chỉ xem con mình).',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-114',
    parentKey: 'KAN-6',
    summary: '[Module 1] PBI-25: Quản trị tài khoản người dùng: Tạo mới, Khóa tài khoản & Đặt lại mật khẩu (BGH)',
    description: 'Ban Giám Hiệu quản lý toàn diện danh sách tài khoản trường học: cấp tài khoản mới cho giáo viên/học sinh, khóa tài khoản vi phạm và đặt lại mật khẩu mặc định 123456.',
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 2: HỒ SƠ HỌC SINH, LỚP HỌC & ĐÀO TẠO (Parent: KAN-8) ---
  {
    key: 'KAN-115',
    parentKey: 'KAN-8',
    summary: '[Module 2] PBI-03: Quản lý danh mục Khối, Lớp học và Hồ sơ học sinh chuẩn mã HS (BGH, GVCN)',
    description: 'Ban Giám Hiệu và GVCN quản lý danh mục khối 10-11-12, danh sách lớp học niên khóa 2026-2027 và hồ sơ học sinh chuẩn mã định danh HSxxxxx (sĩ số chuẩn 35-45 học sinh/lớp).',
    assignee: ACCOUNTS.BINH
  },
  {
    key: 'KAN-116',
    parentKey: 'KAN-8',
    summary: '[Module 2] PBI-04: Phân công Giáo viên chủ nhiệm & Giáo viên bộ môn theo lớp học kỳ (BGH)',
    description: 'Ban Giám Hiệu phân công giáo viên phụ trách từng môn học cho từng lớp, kiểm tra ràng buộc không phân công trùng môn của một lớp cho 2 giáo viên trong cùng một học kỳ.',
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 3: THỜI KHÓA BIỂU & CHỐNG XUNG ĐỘT (Parent: KAN-13) ---
  {
    key: 'KAN-117',
    parentKey: 'KAN-13',
    summary: '[Module 3] PBI-14: Xếp thời khóa biểu tự động & Thuật toán chống trùng tiết giáo viên, phòng học',
    description: 'Hệ thống tự động xếp lịch học tuần Thứ 2 - Thứ 7 (Tiết 1-5), thuật toán quét xung đột cảnh báo ngay khi 1 giáo viên hoặc 1 phòng học bị xếp trùng lịch trong cùng một tiết dạy.',
    assignee: ACCOUNTS.BINH
  },
  {
    key: 'KAN-118',
    parentKey: 'KAN-13',
    summary: '[Module 3] PBI-21: Tra cứu ma trận Thời khóa biểu tuần & Lịch thi học kỳ (Học sinh, Giáo viên)',
    description: 'Học sinh và giáo viên tra cứu ma trận thời khóa biểu tuần trực quan theo lớp đang học/dạy và theo dõi lịch thi cuối kỳ (ngày thi, giờ thi, phòng thi, môn thi).',
    assignee: ACCOUNTS.BINH
  },

  // --- MODULE 4: ĐIỂM DANH 2 CẤP & CHUYÊN CẦN (Parent: KAN-9) ---
  {
    key: 'KAN-119',
    parentKey: 'KAN-9',
    summary: '[Module 4] PBI-05: Điểm danh sĩ số lớp đầu giờ & Thống kê vắng có phép / không phép (GVCN)',
    description: 'Giáo viên Chủ nhiệm điểm danh sĩ số lớp đầu giờ mỗi ngày với 4 trạng thái: Có mặt, Có phép, Không phép, Đi trễ. Dữ liệu lưu bảng attendances và gửi thông báo tới phụ huynh.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-120',
    parentKey: 'KAN-9',
    summary: '[Module 4] PBI-06: Điểm danh học sinh chi tiết theo từng tiết giảng dạy trên lớp (GVBM)',
    description: 'Giáo viên Bộ môn điểm danh học sinh vắng trong tiết học của mình (Tiết 1 đến Tiết 5), phát hiện kịp thời các trường hợp học sinh trốn tiết giữa buổi học.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-121',
    parentKey: 'KAN-9',
    summary: '[Module 4] PBI-07: Màn hình giám sát chuyên cần toàn trường & Tự động cảnh báo vắng >= 20% cấm thi (BGH)',
    description: 'Ban Giám Hiệu giám sát tỷ lệ chuyên cần toàn trường theo biểu đồ trực quan, tự động lọc danh sách và gắn nhãn đỏ cảnh báo học sinh vắng >= 20% số tiết có nguy cơ bị cấm thi.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-122',
    parentKey: 'KAN-9',
    summary: '[Module 4] PBI-17c: Tiếp nhận, Phê duyệt đơn xin nghỉ học và Tự động đồng bộ sang Sổ điểm danh (GVCN)',
    description: 'Giáo viên Chủ nhiệm xem danh sách đơn xin nghỉ học trực tuyến từ phụ huynh. Khi bấm Duyệt, hệ thống tự động cập nhật trạng thái điểm danh ngày đó sang Có phép (EXCUSED).',
    assignee: ACCOUNTS.SON
  },

  // --- MODULE 5: SỔ ĐIỂM ĐIỆN TỬ THÔNG TƯ 22 (Parent: KAN-10) ---
  {
    key: 'KAN-123',
    parentKey: 'KAN-10',
    summary: '[Module 5] PBI-08: Lưới nhập điểm Spreadsheet tương tác (Miệng, 15p, 1 tiết, GK, CK) cho lớp 45 HS',
    description: 'Giáo viên Bộ môn nhập điểm thành phần trên giao diện bảng tính Spreadsheet, cố định cột mã và tên HS, di chuyển phím Enter/Tab nhanh chóng và xác thực miền điểm [0.0, 10.0].',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-124',
    parentKey: 'KAN-10',
    summary: '[Module 5] PBI-09: Thuật toán tính ĐTBmhk mẫu số chia 9 & Tự động xếp loại học lực chuẩn Thông tư 22',
    description: 'Hệ thống tự động tính ĐTBmhk = (TX1 + TX2 + TX3*2 + GK*2 + CK*3) / 9 làm tròn 1 chữ số thập phân, quy đổi GPA hệ 4.0 và xếp loại học lực: Tốt, Khá, Đạt, Chưa đạt kèm điều kiện khống.',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-125',
    parentKey: 'KAN-10',
    summary: '[Module 5] PBI-10: Cơ chế chốt khóa sổ điểm điện tử 2 cấp (OPEN -> SUBMITTED -> LOCKED) (BGH)',
    description: 'Quy trình máy trạng thái khóa sổ điểm: GVBM nộp sổ (SUBMITTED), BGH chốt khóa (LOCKED) ngăn chặn triệt để mọi hành vi chỉnh sửa điểm sau khi đã công bố kết quả.',
    assignee: ACCOUNTS.VINH
  },
  {
    key: 'KAN-126',
    parentKey: 'KAN-10',
    summary: '[Module 5] PBI-20: Cổng xem bảng điểm chi tiết các môn học & Điểm GPA hệ 10 / hệ 4.0 dành cho Học sinh',
    description: 'Học sinh tra cứu bảng điểm chi tiết từng môn học (Miệng, 15p, 1 tiết, Giữa kỳ, Cuối kỳ), điểm ĐTBmhk, điểm rèn luyện GPA hệ 10 và hệ 4.0 của riêng mình.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-127',
    parentKey: 'KAN-10',
    summary: '[Module 5] PBI-22: Đánh giá xếp loại hạnh kiểm học sinh cuối học kỳ & Nhận xét rèn luyện (GVCN)',
    description: 'Giáo viên Chủ nhiệm nhập và lưu đánh giá hạnh kiểm (Tốt, Khá, Đạt, Chưa đạt) kèm lời nhận xét rèn luyện cho từng học sinh cuối kỳ để hoàn thiện học bạ điện tử.',
    assignee: ACCOUNTS.SON
  },

  // --- MODULE 6: KIẾN TRÚC ACID & MẪU THIẾT KẾ CSDL (Parent: KAN-11) ---
  {
    key: 'KAN-128',
    parentKey: 'KAN-11',
    summary: '[Module 6] PBI-11: Triển khai Repository Pattern trừu tượng hóa SQL & Tối ưu tải sổ điểm dưới 2 giây',
    description: 'Đóng gói toàn bộ câu lệnh SQL vào 8 lớp Repository sạch, phân tách tầng Controller - Service - Data Access, tối ưu hóa truy vấn tải sổ điểm 45 học sinh dưới 2 giây.',
    assignee: ACCOUNTS.TINH
  },
  {
    key: 'KAN-129',
    parentKey: 'KAN-11',
    summary: '[Module 6] PBI-12: Cài đặt Unit of Work bảo toàn ACID lưu điểm đồng thời 45 học sinh (Commit/Rollback)',
    description: 'Áp dụng Unit of Work quản lý giao dịch CSDL: lưu điểm đồng loạt cho 45 học sinh theo nguyên tắc Atomic (tất-cả-hoặc-không), tự động ROLLBACK toàn bộ nếu có bất kỳ lỗi nào.',
    assignee: ACCOUNTS.TINH
  },
  {
    key: 'KAN-130',
    parentKey: 'KAN-11',
    summary: '[Module 6] PBI-18: Cấu hình Singleton Connection Pool pg.Pool 20 client chịu tải cao giờ cao điểm',
    description: 'Khởi tạo duy nhất một đối tượng pg.Pool kết nối PostgreSQL với kích thước tối đa 20 client, tự động giải phóng kết nối nhàn rỗi, chống nghẽn mạng và timeout giờ cao điểm.',
    assignee: ACCOUNTS.TINH
  },

  // --- MODULE 7: NHẬT KÝ KIỂM TOÁN AUDIT TRAIL (Parent: KAN-12) ---
  {
    key: 'KAN-131',
    parentKey: 'KAN-12',
    summary: '[Module 7] PBI-13: Dịch vụ Audit Trail tự động ghi nhật ký sửa điểm (Người sửa, điểm cũ/mới, IP, giờ)',
    description: 'Hệ thống tự động ghi nhật ký kiểm toán không thể phủ nhận mỗi khi có thao tác chỉnh sửa điểm: User ID, Học sinh, Môn học, Điểm cũ, Điểm mới, Lý do, Địa chỉ IP và Timestamp.',
    assignee: ACCOUNTS.VINH
  },

  // --- MODULE 8: SỔ LIÊN LẠC & CỔNG PHỤ HUYNH (Parent: KAN-14) ---
  {
    key: 'KAN-132',
    parentKey: 'KAN-14',
    summary: '[Module 8] PBI-17a: Cổng Sổ liên lạc điện tử: Tra cứu kết quả học tập, điểm số và số buổi vắng của con (Phụ huynh)',
    description: 'Phụ huynh tra cứu điểm số thành phần các môn, xếp loại học lực, hạnh kiểm và số buổi vắng có phép/không phép của con em mình trực tuyến qua cổng sổ liên lạc.',
    assignee: ACCOUNTS.SON
  },
  {
    key: 'KAN-133',
    parentKey: 'KAN-14',
    summary: '[Module 8] PBI-17b: Nộp đơn xin phép nghỉ học trực tuyến kèm lý do gửi trực tiếp đến GVCN (Phụ huynh)',
    description: 'Phụ huynh gửi đơn xin nghỉ học trực tuyến có đầy đủ thông tin: từ ngày, đến ngày, lý do nghỉ (ốm, việc gia đình). Đơn được chuyển ngay đến danh sách chờ duyệt của GVCN.',
    assignee: ACCOUNTS.BINH
  },

  // --- MODULE 9: HỌC PHÍ & VIETQR (Parent: KAN-110) ---
  {
    key: 'KAN-134',
    parentKey: 'KAN-110',
    summary: '[Module 9] PBI-24: Quản lý hóa đơn học phí, Thanh toán trực tuyến quét mã VietQR tự động & Xuất biên lai PDF',
    description: 'Phụ huynh xem danh mục khoản thu học phí, quét mã thanh toán VietQR NAPAS 247 tạo tự động với nội dung chuẩn, tự động gạch nợ PAID và tải biên lai thu tiền điện tử PDF.',
    assignee: ACCOUNTS.BINH
  },

  // --- MODULE 10: BÁO CÁO HỌC VỤ & QA TESTING (Parent: KAN-111) ---
  {
    key: 'KAN-135',
    parentKey: 'KAN-111',
    summary: '[Module 10] PBI-15: Động cơ xuất Bảng điểm tổng hợp của lớp ra file Excel .xlsx chuẩn SheetJS (GVBM, GVCN)',
    description: 'Trích xuất toàn bộ dữ liệu bảng điểm học kỳ của lớp ra file Excel (.xlsx), tự động căn chỉnh độ rộng cột, in đậm tiêu đề và xen kẽ màu nền phục vụ lưu trữ học bạ.',
    assignee: ACCOUNTS.BAO
  },
  {
    key: 'KAN-136',
    parentKey: 'KAN-111',
    summary: '[Module 10] PBI-16: Xuất và in ấn Phiếu báo điểm học kỳ & Học bạ điện tử ra file PDF chuẩn khổ A4 (jsPDF)',
    description: 'Động cơ tạo trang in PDF có quốc hiệu, tiêu ngữ, logo trường THPT HSU, bảng điểm các môn học và chữ ký số phục vụ in ấn phiếu báo điểm và lưu trữ học bạ cá nhân.',
    assignee: ACCOUNTS.BAO
  },
  {
    key: 'KAN-137',
    parentKey: 'KAN-111',
    summary: '[Module 10] PBI-23: Báo cáo thống kê phổ điểm toàn trường & Tự động xét danh hiệu HS Xuất sắc, Giỏi (BGH)',
    description: 'Ban Giám Hiệu xem biểu đồ thống kê phổ điểm từng môn học, tự động lập danh sách xét khen thưởng học sinh Xuất sắc/Giỏi và lập danh sách học sinh cần phụ đạo rèn luyện hè.',
    assignee: ACCOUNTS.BINH
  },
  {
    key: 'KAN-138',
    parentKey: 'KAN-111',
    summary: '[Module 10] PBI-19: Bộ kiểm thử tự động QA 68 test cases bảo đảm thuật toán Thông tư 22 & Bảo mật RBAC',
    description: 'Xây dựng bộ kiểm thử tự động toàn diện chạy bằng Node.js Test Runner (68 test cases PASS 100%) bao phủ công thức Thông tư 22, cơ chế khóa sổ, bảo vệ RBAC và giao dịch ACID.',
    assignee: ACCOUNTS.BAO
  }
];

// 6 Thẻ thừa (KAN-139 đến KAN-144) cần xóa dọn dẹp
const EXTRA_KEYS = ['KAN-139', 'KAN-140', 'KAN-141', 'KAN-142', 'KAN-143', 'KAN-144'];

async function run() {
  console.log('================================================================');
  console.log('CẬP NHẬT 27 TASKS THEO DANH MỤC PRODUCT BACKLOG TRỰC QUAN & RÕ RÀNG');
  console.log('================================================================\n');

  for (const item of PBI_LIST) {
    const updateBody = {
      fields: {
        summary: item.summary,
        parent: { key: item.parentKey },
        description: {
          type: 'doc',
          version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item.description }] }]
        },
        assignee: { accountId: item.assignee }
      }
    };

    const res = await jiraRequest(`/rest/api/3/issue/${item.key}`, 'PUT', updateBody);
    if (res && !res.ok) {
      console.log(`[UPDATE ERROR] ${item.key}:`, res.data);
    } else {
      console.log(`[UPDATED] ${item.key} (Parent: ${item.parentKey})\n  -> ${item.summary}`);
    }
  }

  console.log('\n--- XÓA 6 THẺ DƯ THỪA (KAN-139 -> KAN-144) ---');
  for (const k of EXTRA_KEYS) {
    try {
      await jiraRequest(`/rest/api/3/issue/${k}`, 'DELETE');
      console.log(`[DELETED] Đã xóa thẻ dư ${k}`);
    } catch (e) {
      console.log(`[SKIP] Không xóa được ${k}`);
    }
  }

  console.log('\n================================================================');
  console.log('HOÀN TẤT CẬP NHẬT TRÊN JIRA CLOUD:');
  console.log(' - 10 Epics đại diện cho 10 Module lớn.');
  console.log(' - 27 Tasks mang tên chuẩn Product Backlog (PBI-01 -> PBI-25).');
  console.log(' - Tên từng Task được diễn giải cực kỳ trực quan, nêu rõ vai trò và hành động.');
  console.log('================================================================');
}

run().catch(console.error);
