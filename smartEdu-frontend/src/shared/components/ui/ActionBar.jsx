// src/shared/components/ui/ActionBar.jsx
import { RefreshCw } from "lucide-react";

/**
 * ActionBar — Toolbar standar: Search+Filter (kiri) | Refresh+CTA (kanan)
 *
 * Props:
 *   left     - ReactNode: search field, filter dropdown, dsb.
 *   right    - ReactNode: tombol refresh, tambah data, dsb.
 *   loading  - boolean: disable refresh jika true
 *   onRefresh - callback refresh (opsional, jika tidak pakai slot)
 */
const ActionBar = ({ left, right, loading = false, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Kiri: Search + Filter */}
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {left}
      </div>

      {/* Kanan: Refresh + CTA */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh data"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
        {right}
      </div>
    </div>
  );
};

export default ActionBar;
