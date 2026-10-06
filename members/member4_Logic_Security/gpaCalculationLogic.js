/**
 * Member 4: Logic & Security - Business Logic: Weighted GPA 10/4 & Academic Rank Evaluation
 */

export function calculateAverageSubjectScore(scores = {}) {
  const oral = parseFloat(scores.oral || scores.scoreOral || 0);
  const m15 = parseFloat(scores.m15 || scores.score15m || 0);
  const h1 = parseFloat(scores.h1 || scores.score1Hour || 0);
  const mid = parseFloat(scores.mid || scores.scoreMidTerm || 0);
  const finalScore = parseFloat(scores.final || scores.scoreFinalTerm || 0);

  // Weight: Oral x 1 + 15m x 1 + 1Hour x 2 + MidTerm x 2 + FinalTerm x 3 = 9
  const weightedSum = oral * 1 + m15 * 1 + h1 * 2 + mid * 2 + finalScore * 3;
  const average = weightedSum / 9;
  return Math.round(average * 10) / 10;
}

export function evaluateAcademicRank(gpa) {
  if (gpa >= 8.0) return 'Giỏi';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5.0) return 'Trung bình';
  return 'Yếu';
}

export function convertGPA10To4(gpa10) {
  if (gpa10 >= 8.5) return 4.0;
  if (gpa10 >= 7.0) return 3.0;
  if (gpa10 >= 5.5) return 2.0;
  if (gpa10 >= 4.0) return 1.0;
  return 0.0;
}
