/**
 * KpiCard — Reusable KPI metric card component.
 *
 * Props:
 *   label         {string}   Descriptive label shown above the value
 *   value         {string|number} Main metric value (displayed with data-metric style)
 *   icon          {string}   Material Symbol name for the icon
 *   trend         {string?}  Optional trend text, e.g. '+4.2%'
 *   trendPositive {boolean?} true → green chip, false → red chip
 *
 * Requirements: 5.5, 6.2, 18.5
 */
export default function KpiCard({ label, value, icon, trend, trendPositive }) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-col gap-3">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-[#64748b]">{label}</span>
        {icon && (
          <span
            className="material-symbols-outlined text-[20px] text-[#64748b]"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Center: metric value */}
      <div className="text-data-metric text-[#0f172a] font-semibold leading-none">
        {value}
      </div>

      {/* Bottom: trend chip */}
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 text-label-sm font-medium px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-[#f0fdf4] text-[#16a34a]'
                : 'bg-[#fef2f2] text-[#dc2626]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[12px]"
              aria-hidden="true"
            >
              {trendPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
