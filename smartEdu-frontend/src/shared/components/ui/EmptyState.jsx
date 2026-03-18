// src/shared/components/ui/EmptyState.jsx
import { FilterX, Database } from "lucide-react";

/**
 * EmptyState — Tampil saat filter belum lengkap atau data kosong
 *
 * Props:
 *   type     - 'filter' | 'empty' (default: 'empty')
 *   title    - Judul empty state
 *   message  - Pesan deskriptif
 *   icon     - Override icon (Lucide component)
 *   action   - ReactNode: tombol aksi opsional
 */
const EmptyState = ({
  type = "empty",
  title,
  message,
  icon: CustomIcon,
  action,
}) => {
  const defaults = {
    filter: {
      icon: FilterX,
      title: title ?? "Filter Belum Lengkap",
      message:
        message ??
        "Silakan pilih Jurusan, Kelas, dan Rombel untuk menampilkan data.",
      bg: "bg-slate-50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-400",
    },
    empty: {
      icon: Database,
      title: title ?? "Tidak Ada Data",
      message: message ?? "Belum ada data yang tersedia.",
      bg: "bg-white",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-400",
    },
  };

  const cfg = defaults[type];
  const Icon = CustomIcon ?? cfg.icon;

  return (
    <div
      className={`${cfg.bg} rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 px-6 text-center`}
    >
      <div
        className={`w-14 h-14 ${cfg.iconBg} rounded-2xl flex items-center justify-center mb-4`}
      >
        <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{cfg.title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        {cfg.message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
