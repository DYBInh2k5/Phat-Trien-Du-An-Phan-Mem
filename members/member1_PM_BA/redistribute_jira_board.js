/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/redistribute_jira_board.js
 * MỤC ĐÍCH: Điều phối và phân bổ trạng thái các Product Backlog Items (Tasks) và Epics
 *           vào đúng các cột Kanban trên Jira Board (Idea, To Do, In Progress, In Review, Done)
 *           nhằm phản ánh chính xác tiến độ Agile Scrum qua 5 Sprints.
 * TÁC GIẢ: Võ Duy Bình (Project Manager & Lead BA)
 * NGÀY CẬP NHẬT: 10/11/2026
 * VỊ TRÍ KIẾN TRÚC: Project Management / Jira Cloud API Automation
 * ================================================================================
 */

const JIRA_DOMAIN = 'https://reputyze-team-vx3aseym.atlassian.net';
const JIRA_EMAIL = 'bron@reputyze.asia';
const JIRA_API_TOKEN = 'ATATT3xFfGF0xBt0YIVODhhC8f8FaEx_DVCG-1HVrP5loRFDlnEqCAz-zBvF6Lo3GD52CC803sNomKjZmnzIX7bI2lx1lp6XSk5h4-5QbuqjEzSTUKxU_twHpSABPsuhB2DvddQWPzWqhVCHc8uw744tvE3efaAJ9Enb1b9qu5ABuvFFIW0jbHI=64E851C8';

const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// Định nghĩa mã chuyển đổi (Transition IDs) của Kanban Board 2
const TRANSITIONS = {
  IDEA: '11',        // Cột "Idea" (Status ID 10004)
  TODO: '21',        // Cột "To Do" (Status ID 10005)
  IN_PROGRESS: '31', // Cột "In Progress" (Status ID 3)
  IN_REVIEW: '41',   // Cột "In Review" (Status ID 10006)
  DONE: '51'         // Cột "Done" (Status ID 10007)
};

/**
 * Phân bổ trạng thái của 27 Tasks và 10 Epics theo đúng Sprint & Tiến độ thực tế
 */
const STATUS_PLAN = {
  // CỘT 1: IDEA (Ý tưởng, tính năng mở rộng)
  [TRANSITIONS.IDEA]: [
    'KAN-118' // PBI-21: Tra cứu ma trận TKB tuần & Lịch thi học kỳ
  ],

  // CỘT 2: TO DO (Sprint 5 Backlog - Sắp triển khai)
  [TRANSITIONS.TODO]: [
    'KAN-114', // PBI-25: Quản trị tài khoản người dùng BGH
    'KAN-127', // PBI-22: Đánh giá xếp loại hạnh kiểm GVCN
    'KAN-137', // PBI-23: Báo cáo thống kê phổ điểm BGH
    'KAN-138'  // PBI-19: Bộ kiểm thử tự động QA 68 test cases
  ],

  // CỘT 3: IN PROGRESS (Sprint 4-5 Active - Đang phát triển / tinh chỉnh)
  [TRANSITIONS.IN_PROGRESS]: [
    'KAN-6',   // Epic Module 1 (Đang phát triển nốt PBI-25)
    'KAN-10',  // Epic Module 5 (Đang phát triển PBI-20, 22)
    'KAN-13',  // Epic Module 3 (Đang phát triển PBI-14)
    'KAN-14',  // Epic Module 8 (Đang phát triển PBI-17a, 17b)
    'KAN-110', // Epic Module 9 (Đang phát triển PBI-24)
    'KAN-111', // Epic Module 10 (Đang phát triển PBI-15, 16, 23, 19)
    'KAN-117', // PBI-14: Xếp TKB tự động & Thuật toán chống trùng tiết
    'KAN-126', // PBI-20: Cổng HS xem điểm & GPA hệ 10/4
    'KAN-132', // PBI-17a: Sổ liên lạc điện tử PH
    'KAN-133', // PBI-17b: Nộp đơn xin nghỉ học online PH
    'KAN-134'  // PBI-24: Học phí & Thanh toán VietQR
  ],

  // CỘT 4: IN REVIEW (Đang kiểm thử, UAT, Review mã nguồn)
  [TRANSITIONS.IN_REVIEW]: [
    'KAN-9',   // Epic Module 4 (Đang review tính năng điểm danh và duyệt đơn)
    'KAN-12',  // Epic Module 7 (Audit Trail đang review)
    'KAN-121', // PBI-07: Giám sát chuyên cần & Cảnh báo vắng >= 20%
    'KAN-122', // PBI-17c: Phê duyệt đơn nghỉ & Đồng bộ điểm danh
    'KAN-131', // PBI-13: Dịch vụ Audit Trail lưu vết sửa điểm
    'KAN-135', // PBI-15: Động cơ xuất Excel SheetJS
    'KAN-136'  // PBI-16: Động cơ xuất PDF học bạ / phiếu điểm
  ],

  // CỘT 5: DONE (Đã hoàn thành Sprints 1, 2, 3 và kiến trúc cốt lõi)
  [TRANSITIONS.DONE]: [
    'KAN-8',   // Epic Module 2: Quản lý hồ sơ & Lớp học
    'KAN-11',  // Epic Module 6: ACID, Unit of Work & Connection Pool
    'KAN-112', // PBI-01: Đăng nhập JWT & 1-Click Demo Login 5 vai trò
    'KAN-113', // PBI-02: Middleware RBAC kiểm soát 5 cấp bậc
    'KAN-115', // PBI-03: Quản lý Khối, Lớp & Hồ sơ HS
    'KAN-116', // PBI-04: Phân công GVCN & GVBM
    'KAN-119', // PBI-05: Điểm danh sĩ số lớp đầu giờ (GVCN)
    'KAN-120', // PBI-06: Điểm danh học sinh theo tiết dạy (GVBM)
    'KAN-123', // PBI-08: Lưới Spreadsheet nhập điểm 45 HS
    'KAN-124', // PBI-09: Thuật toán tính ĐTBmhk mẫu số chia 9 Thông tư 22
    'KAN-125', // PBI-10: Cơ chế chốt khóa sổ điểm 2 cấp
    'KAN-128', // PBI-11: Repository Pattern trừu tượng hóa SQL
    'KAN-129', // PBI-12: Unit of Work bảo toàn ACID lưu điểm đồng thời
    'KAN-130'  // PBI-18: Singleton Connection Pool pg.Pool 20 clients
  ]
};

/**
 * Thực hiện chuyển trạng thái (transition) cho một Issue trên Jira Cloud
 * @param {string} issueKey - Mã issue (ví dụ: KAN-112)
 * @param {string} transitionId - Mã transition tương ứng với cột đích
 */
async function transitionIssue(issueKey, transitionId) {
  try {
    const res = await fetch(`${JIRA_DOMAIN}/rest/api/3/issue/${issueKey}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transition: { id: transitionId }
      })
    });

    if (res.status === 204) {
      console.log(`[THÀNH CÔNG] Issue ${issueKey} -> Transition ${transitionId}`);
    } else {
      const err = await res.text();
      console.warn(`[CẢNH BÁO] Issue ${issueKey} transition ${transitionId} thất bại: ${res.status} - ${err}`);
    }
  } catch (error) {
    console.error(`[LỖI] Issue ${issueKey}:`, error.message);
  }
}

/**
 * Hàm điều phối chính: Lần lượt phân bổ các Issue vào đúng các cột Kanban
 */
async function run() {
  console.log('=== BẮT ĐẦU ĐIỀU PHỐI CÁC CỘT TRÊN JIRA KANBAN BOARD ===');

  for (const [transitionId, issueKeys] of Object.entries(STATUS_PLAN)) {
    console.log(`\n--- Phân bổ ${issueKeys.length} issues vào Transition ${transitionId} ---`);
    for (const key of issueKeys) {
      await transitionIssue(key, transitionId);
    }
  }

  console.log('\n=== HOÀN TẤT ĐIỀU PHỐI KANBAN BOARD! KIỂM TRA LẠI TRẠNG THÁI... ===');

  // Kiểm tra lại toàn bộ phân bố trên Jira
  const checkRes = await fetch(`${JIRA_DOMAIN}/rest/api/3/search/jql`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jql: 'project = KAN ORDER BY key ASC',
      maxResults: 100,
      fields: ['summary', 'issuetype', 'status']
    })
  });

  const checkData = await checkRes.json();
  const summaryCount = {};
  checkData.issues.forEach(i => {
    const s = i.fields.status.name;
    summaryCount[s] = (summaryCount[s] || 0) + 1;
  });

  console.log('\n=== TỔNG HỢP CÁC CỘT KANBAN SAU KHI PHÂN BỔ ===');
  console.table(summaryCount);
}

run();
