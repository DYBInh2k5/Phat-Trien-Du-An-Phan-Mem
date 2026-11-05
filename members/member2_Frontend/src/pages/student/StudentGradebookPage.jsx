import { useState, useEffect } from 'react';
import { fetchGradeBook, submitGradeReviewRequest } from '../../api/stubs.js';

/** Map API semester string → number */
function parseSemester(sem) {
  if (sem === 'HK1' || sem === 1 || sem === '1') return 1;
  if (sem === 'HK2' || sem === 2 || sem === '2') return 2;
  return 1;
}

/** Map one API grade row → shape expected by the UI.
 *  Handles both snake_case (DB rows) and camelCase (DTO rows).
 */
function mapApiRow(row) {
  // Normalize: support both snake_case and camelCase field names
  const subjectName   = row.subjectName   ?? row.subject_name_full ?? row.subject_name   ?? '';
  const scoreOral     = row.scoreOral     ?? row.score_oral     ?? null;
  const score15m      = row.score15m      ?? row.score_15m      ?? null;
  const score1hour    = row.score1Hour    ?? row.score1hour     ?? row.score_1hour    ?? null;
  const scoreMidTerm  = row.scoreMidTerm  ?? row.score_mid_term ?? null;
  const scoreFinalTerm= row.scoreFinalTerm?? row.score_final_term?? null;
  const averageScore  = row.averageScore  ?? row.average_score  ?? null;
  const gradeLetter   = row.gradeLetter   ?? row.grade_letter   ?? '';

  return {
    subjectId:   subjectName,
    subjectName: subjectName,
    semester:    parseSemester(row.semester),
    scores: {
      oral:      scoreOral      != null ? [parseFloat(scoreOral)]      : [],
      test15min: score15m       != null ? [parseFloat(score15m)]       : [],
      test45min: score1hour     != null ? [parseFloat(score1hour)]     : [],
      semester:  scoreMidTerm   != null ? parseFloat(scoreMidTerm)     : null,
      final:     scoreFinalTerm != null ? parseFloat(scoreFinalTerm)   : null,
      average:   averageScore   != null ? parseFloat(averageScore)     : null,
    },
    gradeLetter: gradeLetter,
  };
}

export default function StudentGradebookPage() {
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grade review modal state
  const [reviewModal, setReviewModal] = useState(null); // null | { subjectName, currentScore, semester }
  const [reviewReason, setReviewReason] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Student info from localStorage or fallback
  const userJson = (() => {
    try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('htqllh_auth')); } catch { return null; }
  })();
  const storedUser = userJson?.user ?? userJson;
  const studentCode = storedUser?.studentCode ?? storedUser?.username ?? 'HS001';
  const studentName = storedUser?.fullName ?? storedUser?.name ?? 'Nguyễn Thị Ánh';
  const className   = storedUser?.className ?? '10A1';

  useEffect(() => {
    setLoading(true);
    fetchGradeBook(studentCode)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllGrades(data.map(mapApiRow));
        } else {
          setAllGrades([]);
        }
      })
      .catch(() => setAllGrades([]))
      .finally(() => setLoading(false));
  }, [studentCode]);

  // Filter by selected semester
  const studentGrades = allGrades.filter(g => g.semester === selectedSemester);

  // GPA
  const avgGPA = studentGrades.length > 0 && studentGrades.every(g => g.scores.average != null)
    ? (studentGrades.reduce((sum, g) => sum + g.scores.average, 0) / studentGrades.length).toFixed(2)
    : '—';

  // Grade color helpers
  const gradeColor = (v) => {
    if (!v && v !== 0) return 'text-[#64748b]';
    if (v < 5) return 'text-[#dc2626] font-bold';
    if (v >= 8) return 'text-[#16a34a] font-semibold';
    return 'text-[#0f172a]';
  };
  const gradeBg = (v) => {
    if (!v && v !== 0) return '';
    if (v < 5) return 'bg-[#fef2f2]';
    if (v >= 8) return 'bg-[#f0fdf4]';
    return '';
  };
  const xepLoai = (gpa) => {
    if (gpa >= 9) return { label: 'Xuất sắc', cls: 'bg-[#f0fdf4] text-[#15803d]' };
    if (gpa >= 8) return { label: 'Giỏi', cls: 'bg-[#eff4ff] text-[#2563eb]' };
    if (gpa >= 6.5) return { label: 'Khá', cls: 'bg-[#fff7ed] text-[#c2410c]' };
    if (gpa >= 5) return { label: 'Trung bình', cls: 'bg-[#f1f5f9] text-[#475569]' };
    return { label: 'Yếu', cls: 'bg-[#fef2f2] text-[#b91c1c]' };
  };
  const xl = xepLoai(parseFloat(avgGPA));

  // Print handler (unchanged logic, adapted for API data)
  const handlePrintGradebook = () => {
    const label = selectedSemester === 1 ? 'Hoc ky 1' : 'Hoc ky 2';
    const ts  = 'border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:11pt;margin-bottom:20pt';
    const th  = 'background:#e8edf8;border:1px solid #b0b8d0;padding:6px 10px;text-align:left;font-size:10pt;font-weight:bold';
    const thn = th + ';text-align:center';
    const tc  = 'border:1px solid #c8d0e0;padding:5px 10px;font-size:10pt';
    const tcn = tc + ';text-align:center';

    const rows = studentGrades.map(g => {
      const avg = g.scores.average;
      let xl2 = 'Trung binh';
      if (avg >= 9) xl2 = 'Xuat sac';
      else if (avg >= 8) xl2 = 'Gioi';
      else if (avg >= 6.5) xl2 = 'Kha';
      else if (avg < 5) xl2 = 'Yeu';
      const avgStyle = avg >= 8
        ? tcn + ';color:#15803d;font-weight:bold'
        : avg < 5
          ? tcn + ';color:#dc2626;font-weight:bold;background:#fef2f2'
          : tcn + ';font-weight:bold';
      return '<tr>' +
        '<td style="' + tc + '">' + g.subjectName + '</td>' +
        '<td style="' + tcn + '">' + (g.scores.oral.join(', ') || '—') + '</td>' +
        '<td style="' + tcn + '">' + (g.scores.test15min.join(', ') || '—') + '</td>' +
        '<td style="' + tcn + '">' + (g.scores.test45min.join(', ') || '—') + '</td>' +
        '<td style="' + tcn + '">' + (g.scores.final ?? '—') + '</td>' +
        '<td style="' + avgStyle + '">' + (avg?.toFixed(1) ?? '---') + '</td>' +
        '<td style="' + tcn + '">' + xl2 + '</td>' +
        '</tr>';
    }).join('');

    const avgGPANum = studentGrades.length > 0
      ? (studentGrades.reduce((s, g) => s + (g.scores.average ?? 0), 0) / studentGrades.length).toFixed(2)
      : '---';

    const html = '<!DOCTYPE html><html lang="vi"><head>' +
      '<meta charset="UTF-8">' +
      '<title>Hoc ba - ' + studentName + '</title>' +
      '<style>' +
        '@page { margin: 1.5cm; }' +
        'body { font-family: Arial, sans-serif; color: #0b1c30; }' +
        '.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16pt; padding-bottom: 10pt; border-bottom: 2px solid #004ac6; }' +
        '.school { font-size: 11pt; color: #64748b; }' +
        'h1 { font-size: 14pt; margin: 0 0 3pt; color: #0b1c30; }' +
        '.meta { font-size: 10pt; color: #475569; line-height: 1.7; }' +
        '.meta strong { color: #0b1c30; }' +
        '.footer { margin-top: 14pt; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8pt; }' +
        '@media print { body { margin: 0; } }' +
      '</style>' +
      '</head><body>' +
      '<div class="header">' +
        '<div>' +
          '<div class="school">TRƯỜNG THPT HSU --- HTQLLH</div>' +
          '<h1>HOC BA SO HOC SINH</h1>' +
          '<div class="meta">' +
            '<strong>' + studentName + '</strong> &nbsp;|&nbsp; ' +
            'Ma HS: ' + studentCode + ' &nbsp;|&nbsp; ' +
            'Lop: ' + className + ' &nbsp;|&nbsp; ' +
            'GVCN: Le Minh Chau' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;font-size:10pt;color:#64748b;">' +
          label + ' &nbsp;&bull;&nbsp; 2024-2025<br>' +
          'Ngay in: ' + new Date().toLocaleDateString("vi-VN") +
        '</div>' +
      '</div>' +
      '<table style="' + ts + '">' +
        '<thead><tr>' +
          '<th style="' + th + '">Mon hoc</th>' +
          '<th style="' + thn + '">Mieng</th>' +
          '<th style="' + thn + '">15 phut</th>' +
          '<th style="' + thn + '">1 tiet</th>' +
          '<th style="' + thn + '">Cuoi HK</th>' +
          '<th style="' + thn + '">Diem TB</th>' +
          '<th style="' + thn + '">Xep loai</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr>' +
          '<td colspan="5" style="' + tc + ';font-weight:bold;text-align:right">Diem trung binh tat ca mon:</td>' +
          '<td style="' + tcn + ';font-weight:bold;color:#004ac6;font-size:12pt">' + avgGPANum + '</td>' +
          '<td style="' + tcn + '"></td>' +
        '</tr></tfoot>' +
      '</table>' +
      '<div class="footer">Ban sao hoc ba dien tu co gia tri tuong duong ban goc --- He thong HTQLLH</div>' +
      '</body></html>';

    const popup = window.open('', '_blank', 'width=900,height=680,scrollbars=yes');
    if (!popup) {
      alert('Trinh duyet dang chan popup. Vui long cho phep popup cho trang nay roi thu lai.');
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    setTimeout(() => { try { popup.print(); } catch(e) {} }, 400);
  };

  // Grade review request submit handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewReason.trim() || !reviewModal) return;
    setReviewSubmitting(true);
    try {
      await submitGradeReviewRequest({
        studentCode,
        subjectName: reviewModal.subjectName,
        semester: reviewModal.semesterLabel,
        schoolYear: '2024-2025',
        reason: reviewReason,
        currentScore: reviewModal.currentScore,
      });
      setReviewModal(null);
      setReviewReason('');
      alert('Đã gửi yêu cầu phúc khảo thành công. Giáo viên sẽ xem xét và phản hồi trong thời gian sớm nhất.');
    } catch (err) {
      alert(err.message || 'Gửi yêu cầu phúc khảo thất bại. Vui lòng thử lại.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#004ac6]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#eff4ff] text-[#004ac6] flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-[#e5eeff]">
              {studentName.split(' ').pop()?.[0] ?? 'H'}
            </div>
            <div className="absolute bottom-0 right-0 bg-[#004ac6] text-white p-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[14px] block">verified</span>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-headline-md font-semibold text-[#0f172a]">{studentName}</h1>
              {!loading && <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-medium ${xl.cls}`}>{xl.label}</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-[#64748b]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-[#004ac6]">badge</span> Mã HS: <strong className="text-[#0f172a]">{studentCode}</strong></span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-[#004ac6]">school</span> Lớp: <strong className="text-[#0f172a]">{className}</strong></span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-[#004ac6]">supervisor_account</span> GVCN: <strong className="text-[#0f172a]">Lê Minh Châu</strong></span>
            </div>
          </div>
          {/* Quick actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button type="button" onClick={handlePrintGradebook} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004ac6] text-white text-label-md font-medium hover:bg-[#003ea8] transition-colors shadow-elevation-1">
              <span className="material-symbols-outlined text-[18px]">print</span>
              In học bạ (PDF)
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#f1f5f9]">
          {[
            { label: 'ĐTB Học kỳ', value: loading ? '…' : avgGPA, sub: '/ 10.0', icon: 'grade', color: 'text-[#004ac6]' },
            { label: 'Xếp loại', value: loading ? '…' : xl.label, sub: 'Học lực', icon: 'stars', color: 'text-[#15803d]' },
            { label: 'Thứ hạng lớp', value: '03', sub: '/ 42 HS', icon: 'leaderboard', color: 'text-[#0f172a]' },
            { label: 'Hạnh kiểm', value: 'Tốt', sub: '100% nề nếp', icon: 'sentiment_very_satisfied', color: 'text-[#15803d]' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#f8fafc] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-sm text-[#64748b]">{kpi.label}</span>
                <span className={`material-symbols-outlined text-[18px] ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <div className={`text-data-metric font-bold ${kpi.color}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{kpi.value}</div>
              <div className="text-label-sm text-[#94a3b8] mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">table_chart</span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Bảng điểm chi tiết</h2>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedSemester} onChange={e => setSelectedSemester(Number(e.target.value))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-body-sm text-[#0f172a] bg-white focus:outline-none focus:border-[#004ac6]">
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-[#f1f5f9] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                  <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Môn học</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Miệng</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">15 phút</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">1 tiết</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Cuối HK</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider font-bold">Điểm TB</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Xếp loại</th>
                  <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Phúc khảo</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[#94a3b8]">Chưa có dữ liệu điểm học kỳ này.</td></tr>
                ) : studentGrades.map(g => {
                  const avg = g.scores.average;
                  const xl2 = xepLoai(avg ?? 0);
                  const semLabel = selectedSemester === 1 ? 'HK1' : 'HK2';
                  return (
                    <tr key={g.subjectId} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '48px' }}>
                      <td className="px-4 py-2 font-medium text-[#0f172a] whitespace-nowrap">{g.subjectName}</td>
                      <td className="px-4 py-2 text-center text-[#475569]">{g.scores.oral.join(', ') || '—'}</td>
                      <td className="px-4 py-2 text-center text-[#475569]">{g.scores.test15min.join(', ') || '—'}</td>
                      <td className="px-4 py-2 text-center text-[#475569]">{g.scores.test45min.join(', ') || '—'}</td>
                      <td className="px-4 py-2 text-center text-[#475569]">{g.scores.final ?? '—'}</td>
                      <td className={`px-4 py-2 text-center font-semibold text-body-md whitespace-nowrap ${gradeBg(avg)} ${gradeColor(avg)}`}>
                        {avg?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${xl2.cls}`}>{xl2.label}</span>
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          title="Yêu cầu phúc khảo điểm môn này"
                          onClick={() => {
                            setReviewModal({ subjectName: g.subjectName, currentScore: avg, semesterLabel: semLabel });
                            setReviewReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fdba74] text-label-sm font-medium transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">rate_review</span>
                          Phúc khảo
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && studentGrades.length > 0 && (
          <div className="px-6 py-3 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
            <span className="text-body-sm text-[#64748b]">Điểm trung bình tất cả môn</span>
            <span className="text-body-md font-bold text-[#004ac6]" style={{ fontVariantNumeric: 'tabular-nums' }}>{avgGPA} / 10.0</span>
          </div>
        )}
      </div>

      {/* Grade Review Request Modal (UC-GVBM-09) */}
      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 id="review-modal-title" className="text-headline-sm font-bold text-[#0f172a]">Yêu Cầu Phúc Khảo Điểm</h3>
                <p className="text-label-sm text-[#64748b] mt-0.5">Gửi đơn đến Giáo Viên Bộ Môn</p>
              </div>
              <button
                type="button"
                onClick={() => { setReviewModal(null); setReviewReason(''); }}
                className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Info fields (readonly) */}
            <div className="space-y-3 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="flex justify-between text-body-sm">
                <span className="text-[#64748b]">Môn học</span>
                <span className="font-semibold text-[#0f172a]">{reviewModal.subjectName}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-[#64748b]">Điểm hiện tại (TB)</span>
                <span className={`font-bold ${reviewModal.currentScore != null && reviewModal.currentScore < 5 ? 'text-[#dc2626]' : 'text-[#004ac6]'}`}>
                  {reviewModal.currentScore != null ? reviewModal.currentScore.toFixed(1) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-[#64748b]">Học kỳ</span>
                <span className="font-semibold text-[#0f172a]">{reviewModal.semesterLabel}</span>
              </div>
            </div>

            {/* Review reason form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="review-reason" className="block text-label-sm font-semibold text-[#334155]">
                  Lý do yêu cầu phúc khảo <span className="text-[#dc2626]">*</span>
                </label>
                <textarea
                  id="review-reason"
                  required
                  rows={4}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Mô tả lý do bạn cho rằng điểm cần được xem xét lại (Ví dụ: Tôi nghĩ bài thi cuối kỳ bị chấm sai câu 3, 5...)..."
                  className="w-full border border-[#cbd5e1] rounded-lg p-3 text-body-sm text-[#0f172a] focus:border-[#004ac6] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setReviewModal(null); setReviewReason(''); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewReason.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-xs transition-colors disabled:opacity-60"
                >
                  {reviewSubmitting ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  {reviewSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
