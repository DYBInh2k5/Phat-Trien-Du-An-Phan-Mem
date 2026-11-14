/**
 * TỆP: members/member1_PM_BA/check_clickup.js
 * MỤC ĐÍCH: Kiểm tra chi tiết và toàn diện hiện trạng ClickUp Workspace của dự án:
 *           - Danh sách Lists (Modules)
 *           - Danh sách Tasks trong từng List
 *           - Trạng thái, Story Points, Tags, Phân công thành viên
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

async function checkClickUp() {
  console.log('================================================================');
  console.log(' KIỂM TRA HIỆN TRẠNG DỮ LIỆU CLICKUP WORKSPACE');
  console.log(` Space ID: ${SPACE_ID} | Folder ID: ${FOLDER_ID}`);
  console.log('================================================================\n');

  try {
    const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, { headers });
    const data = await res.json();
    const lists = data.lists || [];

    console.log(`[TỔNG SỐ LISTS / MODULES]: ${lists.length} Lists\n`);

    let totalTasks = 0;
    const summary = [];

    for (const list of lists) {
      const taskRes = await fetch(`${CLICKUP_API_BASE}/list/${list.id}/task?include_closed=true`, { headers });
      const taskData = await taskRes.json();
      const tasks = taskData.tasks || [];
      totalTasks += tasks.length;

      summary.push({
        id: list.id,
        name: list.name,
        taskCount: tasks.length,
        tasks: tasks.map(t => ({
          id: t.id,
          name: t.name,
          status: t.status ? t.status.status : 'unknown',
          tags: (t.tags || []).map(tag => tag.name),
          priority: t.priority ? t.priority.priority : 'none',
          assignees: (t.assignees || []).map(a => a.username)
        }))
      });
    }

    console.log(`[TỔNG SỐ TASKS ĐÃ TẠO]: ${totalTasks} Tasks\n`);

    for (const item of summary) {
      console.log(`----------------------------------------------------------------`);
      console.log(`📁 ${item.name} (ID: ${item.id}) -> Có ${item.taskCount} tasks:`);
      for (const t of item.tasks) {
        console.log(`   - [${t.status.toUpperCase()}] ${t.name} (Tags: ${t.tags.join(', ') || 'None'})`);
      }
    }

    console.log('\n================================================================');
    console.log(` TỔNG KẾT: ${lists.length} Lists | ${totalTasks} Tasks`);
    console.log('================================================================');

  } catch (err) {
    console.error('LỖI KHI GỌI CLICKUP API:', err.message);
  }
}

checkClickUp();
