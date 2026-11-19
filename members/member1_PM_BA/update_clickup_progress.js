/**
 * TỆP: members/member1_PM_BA/update_clickup_progress.js
 * MỤC ĐÍCH: Đồng bộ trạng thái thực tế của toàn bộ 27 Tasks trên ClickUp sang COMPLETE
 *           phản ánh chính xác kết quả hoàn thành từ Tuần 1 đến Tuần 9.
 */

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = 'pk_312893818_BAB7P1BIGXITM7OV091B1KXD96WFD1RJ';
const FOLDER_ID = '1100320000138169';

const headers = {
  'Authorization': CLICKUP_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

async function updateAllTasksToComplete() {
  console.log('================================================================');
  console.log(' ĐỒNG BỘ TIẾN ĐỘ THỰC TẾ TUẦN 1 - TUẦN 9 LÊN CLICKUP (27 TASKS)');
  console.log('================================================================\n');

  try {
    const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, { headers });
    const data = await res.json();
    const lists = data.lists || [];

    let updatedCount = 0;
    let alreadyCompleteCount = 0;

    for (const list of lists) {
      console.log(`\n📁 Đang kiểm tra ${list.name}...`);
      const taskRes = await fetch(`${CLICKUP_API_BASE}/list/${list.id}/task?include_closed=true`, { headers });
      const taskData = await taskRes.json();
      const tasks = taskData.tasks || [];

      for (const t of tasks) {
        const currentStatus = t.status ? t.status.status.toLowerCase() : '';
        if (currentStatus === 'complete') {
          alreadyCompleteCount++;
          console.log(`   [ĐÃ COMPLETE] ${t.name.slice(0, 50)}...`);
        } else {
          // Cập nhật lên complete
          const updateRes = await fetch(`${CLICKUP_API_BASE}/task/${t.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'complete' })
          });
          if (updateRes.ok) {
            updatedCount++;
            console.log(`   -> [CẬP NHẬT THÀNH CÔNG -> COMPLETE] ${t.name.slice(0, 50)}...`);
          } else {
            console.warn(`   -> [LỖI CẬP NHẬT] ${t.name}`);
          }
        }
      }
    }

    console.log('\n================================================================');
    console.log(` KẾT QUẢ ĐỒNG BỘ:`);
    console.log(` - Số task đã complete trước đó: ${alreadyCompleteCount}`);
    console.log(` - Số task vừa cập nhật sang complete: ${updatedCount}`);
    console.log(` - Tổng số task đạt COMPLETE: ${alreadyCompleteCount + updatedCount} / 27 Tasks`);
    console.log('================================================================');

  } catch (err) {
    console.error('LỖI KHI CẬP NHẬT CLICKUP:', err.message);
  }
}

updateAllTasksToComplete();
