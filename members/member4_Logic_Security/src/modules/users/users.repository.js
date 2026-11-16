import { parseSort } from '../../common/http/pagination.js';

const COLUMNS = 'id, username, password, full_name, role, created_at';

const toUser = (row) =>
  row && {
    id: row.id,
    username: row.username,
    passwordHash: row.password,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };

/** Không bao giờ trả passwordHash ra ngoài. */
export const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
});

const SORT_COLUMNS = {
  username: 'username',
  fullName: 'full_name',
  createdAt: 'created_at',
  id: 'id',
};
const escapeLike = (value) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

export function createUsersRepository(pool) {
  const exec = (client) => client ?? pool;
  return {
    async findById(id, client) {
      const { rows } = await exec(client).query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
      return toUser(rows[0]);
    },
    /** Không phân biệt hoa/thường. */
    async findByUsername(username, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM users WHERE lower(username) = lower($1) LIMIT 1`,
        [username],
      );
      return toUser(rows[0]);
    },
    async findFirstByRole(role, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM users WHERE role = $1 ORDER BY id LIMIT 1`,
        [role],
      );
      return toUser(rows[0]);
    },
    async create({ username, passwordHash, fullName, role }, client) {
      const { rows } = await exec(client).query(
        `INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)
         RETURNING ${COLUMNS}`,
        [username, passwordHash, fullName, role],
      );
      return toUser(rows[0]);
    },
    async updatePassword(id, passwordHash, client) {
      const { rowCount } = await exec(client).query(
        'UPDATE users SET password = $2 WHERE id = $1',
        [id, passwordHash],
      );
      return rowCount === 1;
    },
    async listByRole(role, client) {
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS} FROM users WHERE role = $1 ORDER BY id`,
        [role],
      );
      return rows.map(toUser);
    },
    async list({ role, q, sort, limit, offset }, client) {
      const { column, direction } = parseSort(sort, SORT_COLUMNS);
      const { rows } = await exec(client).query(
        `SELECT ${COLUMNS}, COUNT(*) OVER()::int AS total
         FROM users
         WHERE ($1::text IS NULL OR role = $1)
           AND ($2::text IS NULL OR username ILIKE $2 ESCAPE '\\' OR full_name ILIKE $2 ESCAPE '\\')
         ORDER BY ${column} ${direction}, id
         LIMIT $3 OFFSET $4`,
        [role ?? null, q ? `%${escapeLike(q)}%` : null, limit, offset],
      );
      return { items: rows.map(toUser), total: rows[0]?.total ?? 0 };
    },
  };
}
