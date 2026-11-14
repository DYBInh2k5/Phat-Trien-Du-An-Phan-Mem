/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/sync_clickup.js
 * MỤC ĐÍCH: Tự động hóa kết nối và đồng bộ toàn bộ cấu trúc dự án Quản lý Lớp học THPT (HTQLLH)
 *           từ Product Backlog sang nền tảng quản trị dự án ClickUp thông qua ClickUp REST API v2.
 *           Bao gồm:
 *             - Space: Group 2_PTDAPM
 *             - Folder: HTQLLH - Hệ Thống Quản Lý Lớp Học
 *             - 10 Lists: 10 Modules nghiệp vụ cốt lõi theo mô hình WBS chuẩn
 *             - 27 Tasks: Toàn bộ User Stories PBI-01 -> PBI-25 kèm Story Points,
 *               tiêu chí chấp nhận (Acceptance Criteria), phân công thành viên và trạng thái.
 * VỊ TRÍ KIẾN TRÚC: Project Management / ClickUp REST API v2 Automation
 * TÁC GIẢ: Võ Duy Bình (Project Manager & Lead BA)
 * NGÀY TẠO: 10/11/2026
 * ================================================================================
 */

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = 'pk_312893818_BAB7P1BIGXITM7OV091B1KXD96WFD1RJ';
const TEAM_ID = '1100320000025585';
const SPACE_ID = '1100320000109903';
const FOLDER_ID = '1100320000138169';

const headers = {
  'Authorization': CLICKUP_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Danh mục 10 Modules nghiệp vụ và 27 Product Backlog Items (PBIs)
 */
const MODULES_DATA = [
  {
    moduleNumber: 1,
    name: 'Module 1: Xác Thực, Quản Trị Người Dùng & Phân Quyền (Auth & RBAC)',
    description: 'Xác thực vô trạng thái JWT, phân quyền 5 cấp bậc RBAC (BGH, GVCN, GVBM, HS, PH), 1-Click Demo Login, Quản lý tài khoản',
    tasks: [
      {
        name: 'PBI-01: Đăng nhập JWT vô trạng thái & Nút 1-Click Demo Login 5 vai trò (BGH, GV, HS, PH)',
        description: 'Là Người dùng (BGH / GVCN / GVBM / HS / PH), tôi muốn đăng nhập bằng tài khoản và mật khẩu, để truy cập đúng phân hệ chức năng tương ứng với quyền hạn của mình.\n\nTiêu chí chấp nhận:\n- Nhập đúng user/pass -> JWT token và chuyển hướng Dashboard đúng vai trò\n- 1-Click Demo Login cho 5 vai trò\n- Token JWT thời hạn 24h, lưu localStorage `htqllh_user`\n- Đăng xuất xóa token, chuyển hướng về /login',
        tags: ['Sprint 1', 'Must Have', '3 SP', 'Trần Quang Vinh', 'Võ Hoàng Sơn'],
        priority: 1, // Urgent
        status: 'complete'
      },
      {
        name: 'PBI-02: Middleware RBAC kiểm soát phân quyền 5 cấp bậc & Chặn truy cập trái phép',
        description: 'Là Ban Giám Hiệu, tôi muốn hệ thống tự động chặn mọi truy cập trái phép vào dữ liệu không thuộc thẩm quyền.\n\nTiêu chí chấp nhận:\n- API bảo vệ trả về HTTP 401 khi thiếu JWT token\n- Trả về HTTP 403 khi Token hợp lệ nhưng sai quyền\n- Frontend ProtectedRoute chuyển hướng về /unauthorized khi truy cập URL trái phép',
        tags: ['Sprint 1', 'Must Have', '5 SP', 'Trần Quang Vinh'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-25: Quản trị tài khoản người dùng: Tạo mới, Khóa tài khoản & Đặt lại mật khẩu (BGH)',
        description: 'Là Ban Giám Hiệu, tôi muốn quản lý tài khoản người dùng trong hệ thống (tạo mới, khóa, đặt lại mật khẩu) để kiểm soát quyền truy cập trường học.\n\nTiêu chí chấp nhận:\n- Tạo mới tài khoản 5 vai trò (BGH, GVCN, GVBM, HS, PH)\n- Khóa tài khoản vi phạm (INACTIVE)\n- Đặt lại mật khẩu mặc định kèm yêu cầu đổi pass lần đầu',
        tags: ['Sprint 5', 'Must Have', '5 SP', 'Huỳnh Trung Tính', 'Trần Quang Vinh'],
        priority: 2,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 2,
    name: 'Module 2: Quản Lý Hồ Sơ Học Sinh, Lớp Học & Đào Tạo',
    description: 'Quản lý khối, lớp học, hồ sơ học sinh chuẩn mã HS, phân công chủ nhiệm & giảng dạy bộ môn',
    tasks: [
      {
        name: 'PBI-03: Quản lý danh mục Khối, Lớp học và Hồ sơ học sinh chuẩn mã HS (BGH, GVCN)',
        description: 'Là Ban Giám Hiệu, tôi muốn quản lý danh mục Lớp học và Hồ sơ Học sinh toàn trường để theo dõi sĩ số và sắp xếp lớp đầu năm.\n\nTiêu chí chấp nhận:\n- Thêm/Sửa/Xem danh sách lớp (sĩ số chuẩn 35-45 HS)\n- Mã học sinh duy nhất chuẩn HSxxxxx\n- Khóa ngoại chặn xóa lớp đang có học sinh theo học\n- Lọc học sinh theo lớp và trạng thái',
        tags: ['Sprint 2', 'Must Have', '5 SP', 'Huỳnh Trung Tính', 'Võ Duy Bình'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-04: Phân công Giáo viên chủ nhiệm & Giáo viên bộ môn theo lớp học kỳ (BGH)',
        description: 'Là Ban Giám Hiệu, tôi muốn phân công giáo viên bộ môn dạy từng môn cho từng lớp để xác định thẩm quyền vào điểm.\n\nTiêu chí chấp nhận:\n- Lưu bản ghi bảng teacher_assignments\n- Kiểm tra chặn trùng môn của 1 lớp cho 2 GV trong cùng học kỳ\n- Kiểm tra không phân công 1 GV dạy 2 lớp cùng khung giờ',
        tags: ['Sprint 2', 'Must Have', '5 SP', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'complete'
      }
    ]
  },
  {
    moduleNumber: 3,
    name: 'Module 3: Quản Lý Thời Khóa Biểu & Chống Xung Đột Lịch Dạy',
    description: 'Xếp lịch học tự động, thuật toán chống trùng tiết giáo viên, phòng học và tra cứu lịch tuần',
    tasks: [
      {
        name: 'PBI-14: Xếp thời khóa biểu tự động & Thuật toán chống trùng tiết giáo viên, phòng học',
        description: 'Là Ban Giám Hiệu, tôi muốn hệ thống tự động kiểm tra xung đột khi xếp TKB để không trùng phòng hoặc trùng tiết dạy giáo viên.\n\nTiêu chí chấp nhận:\n- Kiểm tra: 1 GV không dạy 2 lớp cùng tiết trong cùng ngày\n- Kiểm tra: 1 phòng học chuyên dụng không chứa 2 lớp cùng lúc\n- Báo lỗi chi tiết phát hiện xung đột',
        tags: ['Sprint 4', 'Should Have', '5 SP', 'Võ Duy Bình', 'Huỳnh Trung Tính'],
        priority: 2,
        status: 'to do'
      },
      {
        name: 'PBI-21: Tra cứu ma trận Thời khóa biểu tuần & Lịch thi học kỳ (Học sinh, Giáo viên)',
        description: 'Là Học sinh, tôi muốn xem thời khóa biểu học tập và lịch thi của lớp mình để chủ động chuẩn bị bài.\n\nTiêu chí chấp nhận:\n- Hiển thị ma trận tiết học Thứ 2 - Thứ 7: Tên môn, GV, Phòng học\n- Hiển thị lịch thi cuối kỳ khi BGH công bố',
        tags: ['Sprint 2', 'Should Have', '2 SP', 'Võ Duy Bình'],
        priority: 3,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 4,
    name: 'Module 4: Điểm Danh 2 Cấp & Quản Lý Chuyên Cần Học Đường',
    description: 'Điểm danh đầu giờ GVCN, điểm danh theo tiết GVBM, cảnh báo vắng >= 20% và phê duyệt đơn nghỉ học online',
    tasks: [
      {
        name: 'PBI-05: Điểm danh sĩ số lớp đầu giờ & Thống kê vắng có phép / không phép (GVCN)',
        description: 'Là Giáo viên Chủ nhiệm, tôi muốn điểm danh sĩ số lớp đầu giờ mỗi ngày để nắm bắt chuyên cần và cảnh báo phụ huynh.\n\nTiêu chí chấp nhận:\n- Đánh dấu: Có mặt (PRESENT), Vắng phép (EXCUSED), Vắng không phép (ABSENT), Trễ (LATE)\n- Lưu vào bảng attendances\n- Phụ huynh xem được trạng thái vắng của con',
        tags: ['Sprint 2', 'Must Have', '3 SP', 'Võ Hoàng Sơn', 'Nguyễn Minh Quốc Bảo'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-06: Điểm danh học sinh chi tiết theo từng tiết giảng dạy trên lớp (GVBM)',
        description: 'Là Giáo viên Bộ môn, tôi muốn điểm danh học sinh trong tiết học mình giảng dạy để phát hiện trốn tiết giữa buổi.\n\nTiêu chí chấp nhận:\n- Điểm danh theo tiết 1 đến tiết 5\n- Ghi nhận giáo viên điểm danh qua recorded_by\n- Tổng hợp chung vào sổ chuyên cần',
        tags: ['Sprint 4', 'Should Have', '3 SP', 'Võ Hoàng Sơn'],
        priority: 2,
        status: 'complete'
      },
      {
        name: 'PBI-07: Màn hình giám sát chuyên cần toàn trường & Tự động cảnh báo vắng >= 20% cấm thi (BGH)',
        description: 'Là Ban Giám Hiệu, tôi muốn màn hình tự động lọc các học sinh vắng quá 20% số tiết để kịp thời xử lý nguy cơ cấm thi.\n\nTiêu chí chấp nhận:\n- Công thức: (Số buổi vắng / Tổng buổi học) * 100%\n- Gắn nhãn đỏ cảnh báo khi tỷ lệ vắng >= 20%',
        tags: ['Sprint 4', 'Must Have', '5 SP', 'Võ Hoàng Sơn', 'Nguyễn Minh Quốc Bảo'],
        priority: 1,
        status: 'to do'
      },
      {
        name: 'PBI-17c: Tiếp nhận, Phê duyệt đơn xin nghỉ học và Tự động đồng bộ sang Sổ điểm danh (GVCN)',
        description: 'Là Giáo viên Chủ nhiệm, tôi muốn duyệt đơn xin nghỉ học từ phụ huynh và hệ thống tự động đồng bộ sang sổ điểm danh.\n\nTiêu chí chấp nhận:\n- GVCN duyệt đơn PENDING -> APPROVED\n- Trạng thái điểm danh ngày nghỉ tự động đổi thành EXCUSED (Có phép)\n- Từ chối đơn REJECTED giữ nguyên ABSENT',
        tags: ['Sprint 4', 'Must Have', '3 SP', 'Võ Hoàng Sơn', 'Võ Duy Bình'],
        priority: 1,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 5,
    name: 'Module 5: Sổ Điểm Điện Tử & Đánh Giá Học Vụ Thông Tư 22',
    description: 'Lưới nhập điểm Spreadsheet, công thức ĐTBmhk chia 9 chuẩn Thông tư 22, khóa sổ 2 cấp, xem GPA và đánh giá hạnh kiểm',
    tasks: [
      {
        name: 'PBI-08: Lưới nhập điểm Spreadsheet tương tác (Miệng, 15p, 1 tiết, GK, CK) cho lớp 45 HS',
        description: 'Là Giáo viên Bộ môn, tôi muốn nhập điểm thành phần trên giao diện lưới Spreadsheet cố định cột Mã và Tên để thao tác nhanh.\n\nTiêu chí chấp nhận:\n- Kiểm tra giá trị nhập trong khoảng [0.0, 10.0]\n- Khóa nhập khi sổ điểm ở trạng thái LOCKED',
        tags: ['Sprint 3', 'Must Have', '8 SP', 'Võ Hoàng Sơn', 'Trần Quang Vinh'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-09: Thuật toán tính ĐTBmhk mẫu số chia 9 & Tự động xếp loại học lực chuẩn Thông tư 22',
        description: 'Là Giáo viên Bộ môn, tôi muốn hệ thống tự động tính ĐTBmhk theo đúng Thông tư 22.\n\nTiêu chí chấp nhận:\n- Công thức: ĐTBmhk = (TX1 + TX2 + TX3*2 + GK*2 + CK*3) / 9 làm tròn 1 số thập phân\n- Xếp loại: >= 8.0 Tốt, >= 6.5 Khá, >= 5.0 Đạt, < 5.0 Chưa đạt',
        tags: ['Sprint 3', 'Must Have', '5 SP', 'Trần Quang Vinh'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-10: Cơ chế chốt khóa sổ điểm điện tử 2 cấp (OPEN -> SUBMITTED -> LOCKED) (BGH)',
        description: 'Là Ban Giám Hiệu, tôi muốn thực hiện chốt khóa sổ điểm học kỳ để ngăn chặn mọi hành vi chỉnh sửa sau khi công bố.\n\nTiêu chí chấp nhận:\n- Chuyển trạng thái sang LOCKED chặn mọi lệnh ghi đè\n- BGH mở lại kèm lý do ghi vào Audit Log',
        tags: ['Sprint 3', 'Must Have', '5 SP', 'Trần Quang Vinh', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-20: Cổng xem bảng điểm chi tiết các môn học & Điểm GPA hệ 10 / hệ 4.0 dành cho Học sinh',
        description: 'Là Học sinh, tôi muốn tra cứu bảng điểm chi tiết các môn học và GPA để tự theo dõi kết quả học tập.\n\nTiêu chí chấp nhận:\n- Hiển thị từng điểm thành phần và ĐTBmhk\n- Quy đổi GPA hệ 10 và hệ 4.0\n- Học sinh chỉ xem được điểm của chính mình',
        tags: ['Sprint 3', 'Must Have', '3 SP', 'Võ Hoàng Sơn', 'Trần Quang Vinh'],
        priority: 2,
        status: 'to do'
      },
      {
        name: 'PBI-22: Đánh giá xếp loại hạnh kiểm học sinh cuối học kỳ & Nhận xét rèn luyện (GVCN)',
        description: 'Là Giáo viên Chủ nhiệm, tôi muốn nhập đánh giá hạnh kiểm cuối kỳ để hoàn thiện học bạ điện tử.\n\nTiêu chí chấp nhận:\n- Chọn mức: Tốt / Khá / Đạt / Chưa đạt kèm nhận xét tối đa 500 ký tự\n- Hiển thị sang cổng phụ huynh',
        tags: ['Sprint 5', 'Should Have', '3 SP', 'Võ Hoàng Sơn'],
        priority: 2,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 6,
    name: 'Module 6: Giao Dịch Dữ Liệu ACID, Mẫu Thiết Kế & CSDL',
    description: 'Unit of Work Pattern bảo toàn ACID lưu điểm 45 HS, Repository Pattern trừu tượng hóa SQL và Connection Pool pg.Pool',
    tasks: [
      {
        name: 'PBI-11: Triển khai Repository Pattern trừu tượng hóa SQL & Tối ưu tải sổ điểm dưới 2 giây',
        description: 'Là Giáo viên Bộ môn, tôi muốn hệ thống phản hồi nhanh khi tải sổ điểm của lớp 45 học sinh dưới 2 giây.\n\nTiêu chí chấp nhận:\n- GradeBookRepository đóng gói toàn bộ SQL\n- Service không chứa câu lệnh SQL trực tiếp\n- Dễ dàng thay thế CSDL không ảnh hưởng nghiệp vụ',
        tags: ['Sprint 3', 'Must Have', '8 SP', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-12: Cài đặt Unit of Work bảo toàn ACID lưu điểm đồng thời 45 học sinh (Commit/Rollback)',
        description: 'Là Giáo viên Bộ môn, tôi muốn điểm toàn bộ lớp được lưu theo nguyên tắc tất-cả-hoặc-không-có-ai.\n\nTiêu chí chấp nhận:\n- Nếu 45 HS hợp lệ -> COMMIT\n- Nếu 1 HS gặp sự cố -> ROLLBACK toàn bộ, không lưu chắp vá',
        tags: ['Sprint 3', 'Must Have', '8 SP', 'Trần Quang Vinh', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'complete'
      },
      {
        name: 'PBI-18: Cấu hình Singleton Connection Pool pg.Pool 20 client chịu tải cao giờ cao điểm',
        description: 'Là Người dùng, tôi muốn hệ thống phản hồi ổn định khi nhiều giáo viên vào điểm cùng lúc, không bị timeout.\n\nTiêu chí chấp nhận:\n- Khởi tạo Singleton pg.Pool tại config/db.js\n- Giải phóng kết nối tự động về pool sau mỗi query',
        tags: ['Sprint 5', 'Must Have', '3 SP', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'complete'
      }
    ]
  },
  {
    moduleNumber: 7,
    name: 'Module 7: Nhật Ký Kiểm Toán (Audit Trail) & An Toàn Ứng Dụng',
    description: 'Lưu vết lịch sử sửa điểm tự động: Người sửa, điểm cũ, điểm mới, IP, thời gian, chống xóa sửa bảng log',
    tasks: [
      {
        name: 'PBI-13: Dịch vụ Audit Trail tự động ghi nhật ký sửa điểm (Người sửa, điểm cũ/mới, IP, giờ)',
        description: 'Là Ban Giám Hiệu, tôi muốn hệ thống tự động ghi nhật ký kiểm toán mỗi khi có thao tác sửa điểm để ngăn ngừa tiêu cực.\n\nTiêu chí chấp nhận:\n- Ghi nhận: user_id, student_id, old_score, new_score, reason, ip, timestamp\n- Bảng audit_logs chỉ INSERT và SELECT, cấm UPDATE/DELETE',
        tags: ['Sprint 4', 'Must Have', '5 SP', 'Trần Quang Vinh', 'Huỳnh Trung Tính'],
        priority: 1,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 8,
    name: 'Module 8: Sổ Liên Lạc Điện Tử & Kênh Giao Tiếp Phụ Huynh',
    description: 'Cổng tra cứu kết quả học tập cho phụ huynh, nộp đơn xin nghỉ học online và nhận thông báo chuyên cần',
    tasks: [
      {
        name: 'PBI-17a: Cổng Sổ liên lạc điện tử: Tra cứu kết quả học tập, điểm số và số buổi vắng của con (Phụ huynh)',
        description: 'Là Phụ huynh, tôi muốn xem điểm số và hạnh kiểm của con theo từng học kỳ trên sổ liên lạc điện tử.\n\nTiêu chí chấp nhận:\n- Xem điểm chi tiết từng môn, xếp loại học lực, hạnh kiểm\n- Xem số buổi vắng phép, không phép, đi trễ\n- Chỉ xem được đúng dữ liệu con em mình',
        tags: ['Sprint 4', 'Must Have', '3 SP', 'Võ Hoàng Sơn', 'Võ Duy Bình'],
        priority: 1,
        status: 'to do'
      },
      {
        name: 'PBI-17b: Nộp đơn xin phép nghỉ học trực tuyến kèm lý do gửi trực tiếp đến GVCN (Phụ huynh)',
        description: 'Là Phụ huynh, tôi muốn nộp đơn xin nghỉ học trực tuyến gửi đến GVCN thay vì viết đơn giấy.\n\nTiêu chí chấp nhận:\n- Form: Từ ngày, Đến ngày, Lý do nghỉ\n- Đơn lưu vào leave_requests với trạng thái PENDING\n- Theo dõi trạng thái duyệt PENDING / APPROVED / REJECTED',
        tags: ['Sprint 4', 'Must Have', '3 SP', 'Võ Hoàng Sơn', 'Võ Duy Bình'],
        priority: 1,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 9,
    name: 'Module 9: Quản Lý Học Phí & Thanh Toán Trực Tuyến VietQR',
    description: 'Hóa đơn học phí, tạo mã VietQR động tự động điền số tiền và nội dung, gạch nợ tức thì và sinh biên lai điện tử',
    tasks: [
      {
        name: 'PBI-24: Quản lý hóa đơn học phí, Thanh toán trực tuyến quét mã VietQR tự động & Xuất biên lai PDF',
        description: 'Là Phụ huynh, tôi muốn xem thông báo học phí và quét mã VietQR thanh toán trực tuyến nhanh chóng.\n\nTiêu chí chấp nhận:\n- Hiển thị số tiền, hạn nộp, trạng thái UNPAID / PAID\n- Mã VietQR tự động chuẩn Napas 247\n- Thanh toán xong tự động đổi status sang PAID và tải biên lai PDF',
        tags: ['Sprint 5', 'Must Have', '5 SP', 'Võ Duy Bình', 'Nguyễn Minh Quốc Bảo'],
        priority: 1,
        status: 'to do'
      }
    ]
  },
  {
    moduleNumber: 10,
    name: 'Module 10: Báo Cáo Học Vụ & Động Cơ Xuất Báo Cáo Excel/PDF',
    description: 'Xuất file Excel .xlsx chuẩn SheetJS, in ấn PDF học bạ khổ A4 jsPDF, thống kê phổ điểm toàn trường và bộ test QA 68 ca',
    tasks: [
      {
        name: 'PBI-15: Động cơ xuất Bảng điểm tổng hợp của lớp ra file Excel .xlsx chuẩn SheetJS (GVBM, GVCN)',
        description: 'Là Giáo viên Bộ môn, tôi muốn xuất bảng điểm lớp ra file Excel (.xlsx) để in ấn và lưu trữ hồ sơ sổ điểm.\n\nTiêu chí chấp nhận:\n- Xuất .xlsx chuẩn SheetJS xử lý Client-side\n- Tự động căn chỉnh độ rộng cột, tiêu đề in đậm\n- Tên file chuẩn: SoDiem_[TenLop]_[Mon]_[HocKy].xlsx',
        tags: ['Sprint 5', 'Must Have', '3 SP', 'Nguyễn Minh Quốc Bảo', 'Huỳnh Trung Tính'],
        priority: 2,
        status: 'to do'
      },
      {
        name: 'PBI-16: Xuất và in ấn Phiếu báo điểm học kỳ & Học bạ điện tử ra file PDF chuẩn khổ A4 (jsPDF)',
        description: 'Là Giáo viên / Phụ huynh, tôi muốn xem và in phiếu báo điểm học kỳ ra file PDF để lưu hồ sơ pháp lý.\n\nTiêu chí chấp nhận:\n- Quốc hiệu, tiêu ngữ SỞ GIÁO DỤC VÀ ĐÀO TẠO\n- Hỗ trợ nút In / Lưu PDF chuẩn khổ A4\n- Đầy đủ thông tin học sinh, điểm môn, xếp loại',
        tags: ['Sprint 5', 'Should Have', '3 SP', 'Nguyễn Minh Quốc Bảo', 'Võ Hoàng Sơn'],
        priority: 2,
        status: 'to do'
      },
      {
        name: 'PBI-23: Báo cáo thống kê phổ điểm toàn trường & Tự động xét danh hiệu HS Xuất sắc, Giỏi (BGH)',
        description: 'Là Ban Giám Hiệu, tôi muốn xem thống kê phổ điểm và danh sách khen thưởng toàn trường.\n\nTiêu chí chấp nhận:\n- Biểu đồ phổ điểm từng môn tỷ lệ % Tốt / Khá / Đạt / Chưa đạt\n- Danh sách HS Xuất sắc, Giỏi và HS cần rèn luyện hè',
        tags: ['Sprint 5', 'Should Have', '5 SP', 'Võ Duy Bình', 'Nguyễn Minh Quốc Bảo'],
        priority: 2,
        status: 'to do'
      },
      {
        name: 'PBI-19: Bộ kiểm thử tự động QA 68 test cases bảo đảm thuật toán Thông tư 22 & Bảo mật RBAC',
        description: 'Là QA Lead, tôi muốn có bộ kiểm thử tự động bao phủ các thuật toán nghiệp vụ cốt lõi.\n\nTiêu chí chấp nhận:\n- Bộ test unitTestingSuite.test.js 68 test cases\n- Tỷ lệ đạt 100% (Pass Rate 100%)\n- Kịch bản UAT testing plan đầy đủ',
        tags: ['Sprint 5', 'Must Have', '5 SP', 'Nguyễn Minh Quốc Bảo'],
        priority: 1,
        status: 'to do'
      }
    ]
  }
];

/**
 * Lấy danh sách các List hiện có trong Folder
 * @returns {Promise<Array>} Danh sách lists
 */
async function getExistingLists() {
  const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, { headers });
  const data = await res.json();
  return data.lists || [];
}

/**
 * Tạo một List mới trong Folder nếu chưa tồn tại
 * @param {string} name - Tên List (Module)
 * @param {string} content - Mô tả List
 * @returns {Promise<string>} List ID
 */
async function getOrCreateList(name, content) {
  const existing = await getExistingLists();
  const found = existing.find(l => l.name === name);
  if (found) {
    console.log(`[EXISTING LIST] ${name} (ID: ${found.id})`);
    return found.id;
  }

  const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, content })
  });
  const data = await res.json();
  console.log(`[CREATED LIST] ${name} (ID: ${data.id})`);
  return data.id;
}

/**
 * Tạo một Task trong List ClickUp
 * @param {string} listId - ID của List chứa Task
 * @param {Object} task - Thông tin task
 */
async function createTask(listId, task) {
  try {
    const res = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: task.name,
        description: task.description,
        tags: task.tags,
        priority: task.priority,
        status: task.status
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`  -> [TẠO TASK THÀNH CÔNG] ${task.name.slice(0, 45)}... (ID: ${data.id})`);
    } else {
      console.warn(`  -> [TẠO TASK THẤT BÀI] ${task.name}:`, data);
    }
  } catch (error) {
    console.error(`  -> [LỖI TẠO TASK]:`, error.message);
  }
}

/**
 * Hàm điều phối chính đồng bộ toàn bộ 10 Modules và 27 Tasks lên ClickUp
 */
async function syncAllToClickUp() {
  console.log('================================================================');
  console.log(' BẮT ĐẦU ĐỒNG BỘ DỰ ÁN HTQLLH SANG CLICKUP (API v2)');
  console.log(` Space ID: ${SPACE_ID} | Folder ID: ${FOLDER_ID}`);
  console.log('================================================================\n');

  for (const mod of MODULES_DATA) {
    console.log(`\n=== Đang xử lý ${mod.name} ===`);
    const listId = await getOrCreateList(mod.name, mod.description);

    for (const task of mod.tasks) {
      await createTask(listId, task);
    }
  }

  console.log('\n================================================================');
  console.log(' HOÀN TẤT ĐỒNG BỘ 10 MODULES & 27 TASKS LÊN CLICKUP THÀNH CÔNG!');
  console.log(' Link Workspace: https://app.clickup.com/1100320000025585');
  console.log('================================================================');
}

syncAllToClickUp();

