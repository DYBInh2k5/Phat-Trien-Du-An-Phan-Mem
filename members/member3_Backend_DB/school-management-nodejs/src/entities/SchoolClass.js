/**
 * Clean Architecture - Entity Layer: SchoolClass Domain Model
 */
export class SchoolClass {
  constructor(data = {}) {
    this.id = data.id;
    this.className = data.className || data.class_name;
    this.class_name = this.className;
    this.gradeLevel = data.gradeLevel || data.grade_level;
    this.grade_level = this.gradeLevel;
    this.gvcnName = data.gvcnName || data.gvcn_name;
    this.gvcn_name = this.gvcnName;
  }
}