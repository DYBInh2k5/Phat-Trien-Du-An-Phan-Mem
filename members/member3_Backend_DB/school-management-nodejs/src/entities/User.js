/**
 * Clean Architecture - Entity Layer: User Domain Model
 */
export class User {
  constructor({ id, username, password, fullName, full_name, role, createdAt, created_at }) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.fullName = fullName || full_name;
    this.full_name = this.fullName;
    this.role = role;
    this.createdAt = createdAt || created_at;
  }
}
