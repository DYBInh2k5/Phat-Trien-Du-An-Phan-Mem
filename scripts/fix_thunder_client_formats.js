/**
 * @file fix_thunder_client_formats.js
 * @description Chuẩn hóa định dạng tệp Thunder Client Collection & Environment theo đúng chuẩn v1.1 của extension Thunder Client.
 * Khắc phục triệt để lỗi "Failed to Import: 1 files - HTQLLH_ThunderClient_Collection.json / Environment.json".
 * @author Võ Duy Bình (Trưởng nhóm / PM & Lead BA)
 * @date 2026-11-15
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Đọc Postman collection gốc làm nguồn chuẩn dữ liệu
const postmanPath = path.join(__dirname, '../docs/HTQLLH_Postman_Collection.json');
const postmanRaw = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

const colId = '4bf7c729-fa80-498c-8f3b-e01e4a6e1101';
const envId = '5cf8d839-fa80-498c-8f3b-e01e4a6e1102';
const now = new Date().toISOString();

const folders = [];
const requests = [];

let folderSort = 10000;
let reqSort = 1000;

// Duyệt qua từng thư mục và request trong Postman collection
postmanRaw.item.forEach((folderItem, fIdx) => {
  const folderId = crypto.randomUUID();
  folders.push({
    _id: folderId,
    name: folderItem.name,
    containerId: '',
    created: now,
    sortNum: folderSort
  });
  folderSort += 10000;

  if (folderItem.item && Array.isArray(folderItem.item)) {
    folderItem.item.forEach((reqItem) => {
      const reqId = crypto.randomUUID();
      const headers = [];
      if (reqItem.request.header && Array.isArray(reqItem.request.header)) {
        reqItem.request.header.forEach(h => {
          headers.push({ name: h.key, value: h.value });
        });
      }

      let body = { type: 'json', raw: '', form: [] };
      if (reqItem.request.body && reqItem.request.body.raw) {
        body.raw = reqItem.request.body.raw;
      }

      let rawUrl = '';
      if (typeof reqItem.request.url === 'string') {
        rawUrl = reqItem.request.url;
      } else if (reqItem.request.url && reqItem.request.url.raw) {
        rawUrl = reqItem.request.url.raw;
      }

      requests.push({
        _id: reqId,
        colId: colId,
        containerId: folderId,
        name: reqItem.name,
        url: rawUrl,
        method: reqItem.request.method || 'GET',
        sortNum: reqSort,
        created: now,
        modified: now,
        headers: headers,
        params: [],
        body: body,
        tests: []
      });
      reqSort += 1000;
    });
  }
});

// Cấu trúc chuẩn theo đặc tả của Thunder Client v1.1
const thunderCollection = {
  client: 'Thunder Client',
  clientName: 'Thunder Client',
  collectionName: 'HTQLLH — School Management System (THPT HSU)',
  collectionId: colId,
  dateExported: now,
  version: '1.1',
  folders: folders,
  requests: requests
};

const thunderEnvironment = {
  client: 'Thunder Client',
  clientName: 'Thunder Client',
  environmentName: 'HTQLLH Local (Port 8081)',
  environmentId: envId,
  dateExported: now,
  version: '1.1',
  variables: [
    {
      name: 'baseUrl',
      value: 'http://localhost:8081'
    },
    {
      name: 'jwtToken',
      value: ''
    }
  ]
};

// Ghi ra thư mục docs/ (để import thủ công)
const docsColPath = path.join(__dirname, '../docs/HTQLLH_ThunderClient_Collection.json');
const docsEnvPath = path.join(__dirname, '../docs/HTQLLH_ThunderClient_Environment.json');
fs.writeFileSync(docsColPath, JSON.stringify(thunderCollection, null, 2), 'utf8');
fs.writeFileSync(docsEnvPath, JSON.stringify(thunderEnvironment, null, 2), 'utf8');

// Ghi ra thư mục thunder-tests/ (để sync workspace)
const ttColPath = path.join(__dirname, '../thunder-tests/thunderCollection.json');
const ttEnvPath = path.join(__dirname, '../thunder-tests/thunderEnvironment.json');
fs.writeFileSync(ttColPath, JSON.stringify(thunderCollection, null, 2), 'utf8');
fs.writeFileSync(ttEnvPath, JSON.stringify(thunderEnvironment, null, 2), 'utf8');

// Cũng xuất thêm một bản Postman Collection chuẩn v2.1 gọn gàng
const postmanEnv = {
  id: envId,
  name: 'HTQLLH Local (Port 8081)',
  values: [
    {
      key: 'baseUrl',
      value: 'http://localhost:8081',
      type: 'default',
      enabled: true
    },
    {
      key: 'jwtToken',
      value: '',
      type: 'secret',
      enabled: true
    }
  ],
  _postman_variable_scope: 'environment',
  _postman_exported_at: now,
  _postman_exported_using: 'Postman/10.0.0'
};
const docsPostmanEnvPath = path.join(__dirname, '../docs/HTQLLH_Postman_Environment.json');
fs.writeFileSync(docsPostmanEnvPath, JSON.stringify(postmanEnv, null, 2), 'utf8');

console.log(`✅ Đã xuất thành công:`);
console.log(`- Folders: ${folders.length}`);
console.log(`- Requests: ${requests.length}`);
console.log(`- Files:`);
console.log(`  + ${docsColPath}`);
console.log(`  + ${docsEnvPath}`);
console.log(`  + ${ttColPath}`);
console.log(`  + ${ttEnvPath}`);
console.log(`  + ${docsPostmanEnvPath}`);
