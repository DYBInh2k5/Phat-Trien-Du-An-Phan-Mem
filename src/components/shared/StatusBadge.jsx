const STATUS_STYLES = {
  present:  'bg-[#f0fdf4] text-[#15803d]',
  late:     'bg-[#fff7ed] text-[#c2410c]',
  absent:   'bg-[#fef2f2] text-[#b91c1c]',
  active:   'bg-[#f0fdf4] text-[#15803d]',
  inactive: 'bg-[#fef2f2] text-[#b91c1c]',
  reserved: 'bg-[#fff7ed] text-[#c2410c]',
  sent:     'bg-[#eff4ff] text-[#2563eb]',
  read:     'bg-[#f1f5f9] text-[#334155]',
  pending:  'bg-[#fff7ed] text-[#c2410c]',
};

const STATUS_LABELS_VI = {
  present:  'Có mặt',
  late:     'Đi trễ',
  absent:   'Vắng',
  active:   'Đang học',
  inactive: 'Nghỉ học',
  reserved: 'Bảo lưu',
  sent:     'Đã gửi',
  read:     'Đã đọc',
  pending:  'Chờ xử lý',
};

export default function StatusBadge({ status, label }) {
  const styles = STATUS_STYLES[status] ?? 'bg-[#f1f5f9] text-[#334155]';
  const displayLabel = label ?? STATUS_LABELS_VI[status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${styles}`}
      style={{ height: '22px', lineHeight: '22px' }}
    >
      {displayLabel}
    </span>
  );
}
