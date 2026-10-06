import { ClassRepository } from '../repositories/ClassRepository.js';

export class ClassController {
  static async getClasses(req, res) {
    try {
      const classes = await ClassRepository.findAll();
      return res.json(classes);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createClass(req, res) {
    try {
      const created = await ClassRepository.create(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
