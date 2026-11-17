// Áp db/schema.sql NGUYÊN BẢN của nhóm lên database (an toàn chạy lại: toàn bộ là IF NOT EXISTS / ON CONFLICT).
// Dùng khi KHÔNG chạy docker-compose (docker đã tự mount schema.sql).
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Thiếu DATABASE_URL');
  process.exit(1);
}

const schemaPath = new URL('../db/schema.sql', import.meta.url);
const sql = await readFile(schemaPath, 'utf8');
const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query(sql);
  console.log('Đã áp dụng db/schema.sql');
} finally {
  await client.end();
}
