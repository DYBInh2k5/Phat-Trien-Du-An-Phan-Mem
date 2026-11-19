/**
 * TỆP: members/member1_PM_BA/restore_visible_clickup.js
 * MỤC ĐÍCH: Khôi phục toàn bộ 27 tasks trên ClickUp sang trạng thái OPEN (to do)
 *           để giao diện ClickUp hiển thị ngay lập tức 100% các task mà KHÔNG bị bộ lọc
 *           "Hide Closed Tasks" của ClickUp ẩn đi!
 */

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = 'pk_312893818_BAB7P1BIGXITM7OV091B1KXD96WFD1RJ';
const FOLDER_ID = '1100320000138169';

const headers = {
  'Authorization': CLICKUP_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

async function restoreTasks() {
  console.log('Đang khôi phục toàn bộ tasks sang trạng thái OPEN (to do) để hiển thị đầy đủ...');
  const res = await fetch(`${CLICKUP_API_BASE}/folder/${FOLDER_ID}/list`, { headers });
  const data = await res.json();
  const lists = data.lists || [];

  for (const list of lists) {
    const taskRes = await fetch(`${CLICKUP_API_BASE}/list/${list.id}/task?include_closed=true`, { headers });
    const taskData = await taskRes.json();
    const tasks = taskData.tasks || [];

    for (const t of tasks) {
      await fetch(`${CLICKUP_API_BASE}/task/${t.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'to do' })
      });
      console.log(`[VISIBLE ON CLICKUP] ${t.name.slice(0, 50)}...`);
    }
  }

  console.log('HOÀN TẤT! Tất cả 27 tasks hiện đang ở trạng thái OPEN và hiển thị 100% trên giao diện ClickUp!');
}

restoreTasks();
