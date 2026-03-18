// src/shared/components/ui/StatusBadge.jsx

/**
 * StatusBadge — Badge status yang konsisten di semua halaman
 *
 * Props:
 *   status - string: 'aktif' | 'nonaktif' | 'lulus' | 'pindah' | 'hadir' | 'sakit' | 'izin' | 'alpha'
 *   size   - 'sm' | 'md' (default: 'sm')
 *   dot    - boolean: tambahkan dot indicator
 */
const STATUS_MAP = {
  aktif:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Aktif" },
  nonaktif: { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Nonaktif" },
  lulus:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Lulus" },
  pindah:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Pindah" },
  hadir:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Hadir" },
  sakit:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Sakit" },
  izin:     { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Izin" },
  alpha:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     label: "Alpha" },
};

const SIZE_MAP = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const StatusBadge = ({ status, size = "sm", dot = false, label }) => {
  const cfg = STATUS_MAP[status?.toLowerCase()] ?? {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: status ?? "—",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize ${cfg.bg} ${cfg.text} ${SIZE_MAP[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {label ?? cfg.label}
    </span>
  );
};

export default StatusBadge;
