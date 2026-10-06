import { SubjectRepository } from '../repositories/SubjectRepository.js';

export class SubjectController {
  static async getSubjects(req, res) {
    try {
      const subjects = await SubjectRepository.findAll();
      return res.json(subjects);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createSubject(req, res) {
    try {
      const created = await SubjectRepository.create(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
