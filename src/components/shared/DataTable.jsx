/**
 * DataTable — Reusable Excel-like data table.
 *
 * Props:
 *   columns         {Array<{ key, header, render?, className?, cellClassName? }>} Column definitions
 *   data            {Array<object>}  Row data array
 *   stickyFirstColumn {boolean?}     If true, fixes first column with sticky positioning
 *   emptyMessage    {string?}        Text when data is empty (default: 'Không có dữ liệu')
 */
export default function DataTable({ columns, data, stickyFirstColumn = false, emptyMessage = 'Không có dữ liệu' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table
        className="w-full border-collapse text-data-table"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap',
                  stickyFirstColumn && idx === 0 ? 'sticky left-0 z-10 bg-[#f8fafc]' : '',
                  col.className ?? '',
                ].filter(Boolean).join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#94a3b8] text-body-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                style={{ height: '44px' }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className={[
                      'px-4 py-2 text-[#1e293b] whitespace-nowrap',
                      stickyFirstColumn && colIdx === 0 ? 'sticky left-0 z-10 bg-white' : '',
                      col.cellClassName ?? '',
                    ].filter(Boolean).join(' ')}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
