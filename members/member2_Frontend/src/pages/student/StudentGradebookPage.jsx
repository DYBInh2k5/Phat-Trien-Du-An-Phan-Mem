import { useState } from 'react';
import { grades, students, subjects, classes } from '../../data/mockData.js';

export default function StudentGradebookPage() {
  const [selectedSemester, setSelectedSemester] = useState(1);
  
  // Mock current student — HS001 Nguyễn Thị Ánh lớp 10A1
  const student = students.find(s => s.id === 'HS001');
  const classInfo = classes.find(c => c.id === student?.classId);
  
  // Lọc điểm theo semester
  const studentGrades = grades.filter(g => 
    g.studentId === 'HS001' && g.semester === selectedSemester
  );
  
  // Tính GPA trung bình
  const avgGPA = studentGrades.length > 0
    ? (studentGrades.reduce((sum, g) => sum + g.scores.average, 0) / studentGrades.length).toFixed(2)
    : '—';

  // Grade color helper
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

  // --- In hoc ba dang popup de chi in data ---
  const handlePrintGradebook = () => {
    const label = selectedSemester === 1 ? 'Hoc ky 1' : 'Hoc ky 2';

    const ts  = 'border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:11pt;margin-bottom:20pt';
    const th  = 'background:#e8edf8;border:1px solid #b0b8d0;padding:6px 10px;text-align:left;font-size:10pt;font-weight:bold';
    const thn = th + ';text-align:center';
    const tc  = 'border:1px solid #c8d0e0;padding:5px 10px;font-size:10pt';
    const tcn = tc + ';text-align:center';

    // Build bang diem
    const rows = studentGrades.map(g => {
      const subj = subjects.find(s => s.id === g.subjectId);
      const avg  = g.scores.average;
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
        '<td style="' + tc + '">' + (subj?.name ?? g.subjectId) + '</td>' +
        '<td style="' + tcn + '">' + g.scores.oral.join(', ') + '</td>' +
        '<td style="' + tcn + '">' + g.scores.test15min.join(', ') + '</td>' +
        '<td style="' + tcn + '">' + g.scores.test45min.join(', ') + '</td>' +
        '<td style="' + tcn + '">' + g.scores.semester + '</td>' +
        '<td style="' + avgStyle + '">' + (avg?.toFixed(1) ?? '---') + '</td>' +
        '<td style="' + tcn + '">' + xl2 + '</td>' +
        '</tr>';
    }).join('');

    const avgGPANum = studentGrades.length > 0
      ? (studentGrades.reduce((s, g) => s + g.scores.average, 0) / studentGrades.length).toFixed(2)
      : '---';

    const html = '<!DOCTYPE html><html lang="vi"><head>' +
      '<meta charset="UTF-8">' +
      '<title>Hoc ba - ' + (student?.name ?? 'Hoc sinh') + '</title>' +
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
          '<div class="school">TRƯỜNG THPT --- EduManage PRO</div>' +
          '<h1>HOC BA SO HOC SINH</h1>' +
          '<div class="meta">' +
            '<strong>' + (student?.name ?? '---') + '</strong> &nbsp;|&nbsp; ' +
            'Ma HS: HS-2024-001 &nbsp;|&nbsp; ' +
            'Lop: ' + (classInfo?.name ?? '---') + ' &nbsp;|&nbsp; ' +
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
      '<div class="footer">Ban sao hoc ba dien tu co gia tri tuong duong ban goc --- He thong EduManage PRO</div>' +
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

    return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#004ac6]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#eff4ff] text-[#004ac6] flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-[#e5eeff]">
              {student?.name?.split(' ').pop()?.[0] ?? 'H'}
            </div>
            <div className="absolute bottom-0 right-0 bg-[#004ac6] text-white p-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[14px] block">verified</span>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-headline-md font-semibold text-[#0f172a]">{student?.name ?? 'Học sinh'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-medium ${xl.cls}`}>{xl.label}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-[#64748b]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-[#004ac6]">badge</span> Mã HS: <strong className="text-[#0f172a]">HS-2024-001</strong></span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-[#004ac6]">school</span> Lớp: <strong className="text-[#0f172a]">{classInfo?.name}</strong></span>
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
            { label: 'ĐTB Học kỳ', value: avgGPA, sub: '/ 10.0', icon: 'grade', color: 'text-[#004ac6]' },
            { label: 'Xếp loại', value: xl.label, sub: 'Học lực', icon: 'stars', color: 'text-[#15803d]' },
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
              </tr>
            </thead>
            <tbody>
              {studentGrades.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#94a3b8]">Chưa có dữ liệu điểm học kỳ này.</td></tr>
              ) : studentGrades.map(g => {
                const subj = subjects.find(s => s.id === g.subjectId);
                const avg = g.scores.average;
                const xl2 = xepLoai(avg);
                return (
                  <tr key={g.subjectId} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors" style={{ height: '48px' }}>
                    <td className="px-4 py-2 font-medium text-[#0f172a] whitespace-nowrap">{subj?.name ?? g.subjectId}</td>
                    <td className="px-4 py-2 text-center text-[#475569]">{g.scores.oral.join(', ')}</td>
                    <td className="px-4 py-2 text-center text-[#475569]">{g.scores.test15min.join(', ')}</td>
                    <td className="px-4 py-2 text-center text-[#475569]">{g.scores.test45min.join(', ')}</td>
                    <td className="px-4 py-2 text-center text-[#475569]">{g.scores.semester}</td>
                    <td className={`px-4 py-2 text-center font-semibold text-body-md whitespace-nowrap ${gradeBg(avg)} ${gradeColor(avg)}`}>
                      {avg?.toFixed(1) ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${xl2.cls}`}>{xl2.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {studentGrades.length > 0 && (
          <div className="px-6 py-3 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
            <span className="text-body-sm text-[#64748b]">Điểm trung bình tất cả môn</span>
            <span className="text-body-md font-bold text-[#004ac6]" style={{ fontVariantNumeric: 'tabular-nums' }}>{avgGPA} / 10.0</span>
          </div>
        )}
      </div>
    </div>
  );
}
