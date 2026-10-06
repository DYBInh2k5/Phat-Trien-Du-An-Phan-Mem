import { TuitionRepository } from '../repositories/TuitionRepository.js';

export class TuitionService {
  static async getTuitions({ className, studentCode }) {
    if (studentCode) {
      return await TuitionRepository.findByStudentCode(studentCode);
    }
    if (className) {
      return await TuitionRepository.findByClassName(className);
    }
    return await TuitionRepository.findAll();
  }

  static async payTuition(studentCode, amount) {
    const tuitions = await TuitionRepository.findByStudentCode(studentCode);
    if (!tuitions || tuitions.length === 0) {
      throw new Error(`Tuition record not found for student: ${studentCode}`);
    }

    const t = tuitions[0];
    const currentPaid = parseFloat(t.amount_paid || t.amountPaid || 0);
    const amountDue = parseFloat(t.amount_due || t.amountDue || 0);
    const newPaid = currentPaid + amount;

    let status = 'UNPAID';
    if (newPaid >= amountDue) {
      status = 'PAID';
    } else if (newPaid > 0) {
      status = 'PARTIAL';
    }

    const receiptNo = `BL-2024-${Date.now() % 10000}`;
    t.amountPaid = newPaid;
    t.status = status;
    t.receiptNo = receiptNo;

    const saved = await TuitionRepository.save(t);
    return { saved, receiptNo };
  }
}
