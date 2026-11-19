import pg from 'pg';

// NUMERIC (OID 1700) mặc định về string. Ta parse ở mapper/domain nên giữ nguyên.
export function createPool(databaseUrl) {
  return new pg.Pool({ connectionString: databaseUrl, max: 10 });
}
