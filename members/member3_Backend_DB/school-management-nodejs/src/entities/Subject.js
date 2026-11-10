/**
 * Clean Architecture - Entity Layer: Subject Domain Model
 */
export class Subject {
  constructor(data = {}) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.credits = data.credits || 1;
  }
}