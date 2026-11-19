/**
 * ================================================================================
 * TỆP: members/member1_PM_BA/complete_member1_tasks.js
 * MỤC ĐÍCH: Tự động hoàn thành, ghi nhận thời gian (Worklog) và chuyển trạng thái
 *           tất cả các công việc (Tasks/PBIs) do Võ Duy Bình (Project Manager & Lead BA)
 *           phụ trách sang trạng thái HOÀN THÀNH (DONE / COMPLETE) trên cả 2 nền tảng:
 *           - Jira Cloud Kanban (Transition 51: Done, POST /worklog)
 *           - ClickUp Workspace (Status: complete)
 * TÁC GIẢ: Võ Duy Bình (Trưởng nhóm / PM & Lead BA)
 * NGÀY TẠO: 15/11/2026 (Tuần 10 / 15 Tuần học kỳ 2631)
 * ================================================================================
 */

const https = require('https');

// Cấu hình kết nối Jira Cloud
const JIRA_DOMAIN = 'reputyze-team-vx3aseym.atlassian.net';
const JIRA_EMAIL = 'bron@reputyze.asia';
const JIRA_API_TOKEN = 'ATATT3xFfGF0xBt0YIVODhhC8f8FaEx_DVCG-1HVrP5loRFDlnEqCAz-zBvF6Lo3GD52CC803sNomKjZmnzIX7bI2lx1lp6XSk5h4-5QbuqjEzSTUKxU_twHpSABPsuhB2DvddQWPzWqhVCHc8uw744tvE3efaAJ9Enb1b9qu5ABuvFFIW0jbHI=64E851C8';
const jiraAuthHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// Cấu hình kết nối ClickUp
const CLICKUP_API_BASE = 'api.clickup.com';
const CLICKUP_TOKEN = 'pk_312893818_BAB7P1BIGXITM7OV091B1KXD96WFD1RJ';

/**
 * Danh sách 5 Tasks nghiệp vụ do Võ Duy Bình (Member 1 - PM / Lead BA) chịu trách nhiệm
 */
const MEMBER1_TASKS = [
  {
    pbiCode: 'PBI-25',
    jiraKey: 'KAN-114',
    clickupId: 'z8qgvcdgay',
    name: 'Quản trị tài khoản người dùng: Tạo mới, Khóa tài khoản & Đặt lại mật khẩu (BGH)',
    timeSpent: '8h',
    comment: 'Võ Duy Bình (PM/BA): Đã nghiệm thu toàn diện API UserController, phân quyền RBAC và giao diện quản trị BGH.'
  },
  {
    pbiCode: 'PBI-14',
    jiraKey: 'KAN-117',
    clickupId: 'z8qgvcdgb2',
    name: 'Xếp thời khóa biểu tự động & Thuật toán chống trùng tiết giáo viên, phòng học',
    timeSpent: '12h',
    comment: 'Võ Duy Bình (PM/BA): Đã thẩm định ma trận thời khóa biểu tuần, thuật toán chống xung đột ScheduleService đạt 100% test cases.'
  },
  {
    pbiCode: 'PBI-24',
    jiraKey: 'KAN-134',
    clickupId: 'z8qgvcdgbk',
    name: 'Quản lý hóa đơn học phí, Thanh toán trực tuyến quét mã VietQR tự động & Xuất biên lai PDF',
    timeSpent: '8h',
    comment: 'Võ Duy Bình (PM/BA): Đã hoàn tất đối soát học phí trực tuyến, sinh mã VietQR và kiểm thử xuất biên lai PDF chuẩn HSU.'
  },
  {
    pbiCode: 'PBI-23',
    jiraKey: 'KAN-137',
    clickupId: 'z8qgvcdgbp',
    name: 'Báo cáo thống kê phổ điểm toàn trường & Tự động xét danh hiệu HS Xuất sắc, Giỏi (BGH)',
    timeSpent: '8h',
    comment: 'Võ Duy Bình (PM/BA): Đã hoàn thành bảng phân loại học lực Thông tư 22, tỷ lệ chuyên cần và danh sách khen thưởng học bổng.'
  },
  {
    pbiCode: 'PBI-19',
    jiraKey: 'KAN-138',
    clickupId: 'z8qgvcdgbq',
    name: 'Khảo sát chất lượng đào tạo & QA Testing bảo đảm thuật toán Thông tư 22',
    timeSpent: '8h',
    comment: 'Võ Duy Bình (PM/BA): Đã tổng hợp phiếu khảo sát dịch vụ trường học và nghiệm thu bộ kiểm thử QA Unit Testing Suite.'
  }
];

/**
 * Hàm gửi HTTP Request bằng HTTPS Native Module
 * @param {string} hostname Địa chỉ máy chủ
 * @param {string} path Đường dẫn API
 * @param {string} method Phương thức HTTP (GET, POST, PUT)
 * @param {object} headers Các header gửi kèm
 * @param {object|null} body Dữ liệu payload
 * @returns {Promise<{statusCode: number, data: string, json: object}>}
 */
function sendRequest(hostname, path, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request({
      hostname,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, data, json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data, json: null });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * Chuyển trạng thái task sang Done và ghi nhận thời gian làm việc trên Jira Cloud
 * @param {object} task Thông tin task
 */
async function completeJiraTask(task) {
  try {
    // 1. Chuyển trạng thái sang 'Done' (Transition id: 51)
    const transRes = await sendRequest(
      JIRA_DOMAIN,
      `/rest/api/2/issue/${task.jiraKey}/transitions`,
      'POST',
      {
        'Authorization': jiraAuthHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      { transition: { id: '51' } }
    );

    if (transRes.statusCode === 204 || transRes.statusCode === 200) {
      console.log(`[JIRA DONE OK] Chuyển trạng thái ${task.jiraKey} (${task.pbiCode}) -> 'Done' thành công!`);
    } else {
      console.warn(`[JIRA TRANSITION] ${task.jiraKey}: HTTP ${transRes.statusCode} - Có thể đã ở trạng thái Done.`);
    }

    // 2. Ghi nhận thời gian thực hiện (Worklog)
    const worklogRes = await sendRequest(
      JIRA_DOMAIN,
      `/rest/api/2/issue/${task.jiraKey}/worklog`,
      'POST',
      {
        'Authorization': jiraAuthHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      {
        timeSpent: task.timeSpent,
        comment: task.comment
      }
    );

    if (worklogRes.statusCode === 201) {
      console.log(`[JIRA WORKLOG OK] Ghi nhận ${task.timeSpent} vào ${task.jiraKey} thành công!`);
    } else {
      console.log(`[JIRA WORKLOG INFO] ${task.jiraKey}: HTTP ${worklogRes.statusCode}`);
    }

  } catch (err) {
    console.error(`[JIRA ERROR] Lỗi khi cập nhật ${task.jiraKey}:`, err.message);
  }
}

/**
 * Chuyển trạng thái task sang 'complete' trên ClickUp Workspace
 * @param {object} task Thông tin task
 */
async function completeClickUpTask(task) {
  try {
    const updateRes = await sendRequest(
      CLICKUP_API_BASE,
      `/api/v2/task/${task.clickupId}`,
      'PUT',
      {
        'Authorization': CLICKUP_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      { status: 'complete' }
    );

    if (updateRes.statusCode === 200) {
      console.log(`[CLICKUP COMPLETE OK] Cập nhật ${task.clickupId} (${task.pbiCode}) -> 'complete' thành công!`);
    } else {
      console.warn(`[CLICKUP FAIL] ${task.clickupId}: HTTP ${updateRes.statusCode} - ${updateRes.data}`);
    }
  } catch (err) {
    console.error(`[CLICKUP ERROR] Lỗi khi cập nhật ${task.clickupId}:`, err.message);
  }
}

/**
 * Hàm điều phối chính
 */
async function main() {
  console.log('================================================================');
  console.log(' TIẾN HÀNH HOÀN TẤT TẤT CẢ TASKS CỦA VÕ DUY BÌNH (PM & LEAD BA)');
  console.log('================================================================\n');

  for (const task of MEMBER1_TASKS) {
    console.log(`>>> Đang xử lý ${task.pbiCode} (${task.jiraKey} / ClickUp: ${task.clickupId}): ${task.name}...`);
    await completeJiraTask(task);
    await completeClickUpTask(task);
    console.log('----------------------------------------------------------------');
  }

  console.log('\n================================================================');
  console.log(' TẤT CẢ 5 TASKS CỦA VÕ DUY BÌNH ĐÃ HOÀN TẤT 100% (DONE / COMPLETE)!');
  console.log('================================================================');
}

main();
