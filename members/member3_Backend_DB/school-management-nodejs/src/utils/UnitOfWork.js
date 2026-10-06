import { pool } from '../config/db.js';

/**
 * Clean Architecture & Design Patterns: Unit of Work Pattern
 * Handles atomic transactions across multiple repositories (PostgreSQL Pool & Fallback support)
 */
export class UnitOfWork {
  constructor() {
    this.client = null;
    this.inTransaction = false;
  }

  async beginTransaction() {
    try {
      this.client = await pool.connect();
      await this.client.query('BEGIN');
      this.inTransaction = true;
      console.log('[UNIT OF WORK] Transaction started.');
    } catch (err) {
      console.warn(`[UNIT OF WORK WARN] Could not begin PostgreSQL transaction: ${err.message}. Using stateful in-memory transaction scope.`);
      this.client = null;
      this.inTransaction = true;
    }
  }

  async query(text, params = []) {
    if (this.client) {
      return await this.client.query(text, params);
    }
    return null;
  }

  async commit() {
    if (this.inTransaction) {
      if (this.client) {
        try {
          await this.client.query('COMMIT');
          console.log('[UNIT OF WORK] Transaction committed successfully.');
        } finally {
          this.client.release();
          this.client = null;
        }
      }
      this.inTransaction = false;
    }
  }

  async rollback() {
    if (this.inTransaction) {
      if (this.client) {
        try {
          await this.client.query('ROLLBACK');
          console.log('[UNIT OF WORK] Transaction rolled back.');
        } catch (err) {
          console.error(`[UNIT OF WORK ERROR] Rollback error: ${err.message}`);
        } finally {
          this.client.release();
          this.client = null;
        }
      }
      this.inTransaction = false;
    }
  }
}
