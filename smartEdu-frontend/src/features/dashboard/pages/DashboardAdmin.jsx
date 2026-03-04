/**
 * features/dashboard/pages/DashboardAdmin.jsx
 *
 * PRODUCTION STANDARD:
 * ✅ Skeleton loading (tidak kosong saat fetch)
 * ✅ Error state dengan retry
 * ✅ Empty state per section
 * ✅ Safe optional chaining di setiap field
 * ✅ ZERO default HTML styling
 * ✅ Fully responsive (sm/md/lg breakpoints)
 * ✅ Warna semantik: hijau=sukses, merah=error, kuning=warning, biru=info
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  AlertTriangle,
  Activity,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  UserX,
  Inbox,
} from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import dashboardService from "../services/dashboardService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

const rupiah = (n) =>
  n != null
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n)
    : "Rp 0";

const fmtTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const actionMap = {
  login: { text: "Login", cls: "bg-blue-100 text-blue-700" },
  logout: { text: "Logout", cls: "bg-slate-100 text-slate-600" },
  tambah_siswa: {
    text: "Tambah Siswa",
    cls: "bg-emerald-100 text-emerald-700",
  },
  tambah_guru: { text: "Tambah Guru", cls: "bg-green-100 text-green-700" },
  tambah_tugas: { text: "Buat Tugas", cls: "bg-amber-100 text-amber-700" },
  input_nilai: { text: "Input Nilai", cls: "bg-purple-100 text-purple-700" },
  pembayaran: { text: "Pembayaran", cls: "bg-indigo-100 text-indigo-700" },
};

const getActionLabel = (action) =>
  actionMap[action] ?? {
    text: action?.replace(/_/g, " ") ?? "Aktivitas",
    cls: "bg-gray-100 text-gray-600",
  };

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-6 pb-8">
    {/* Hero */}
    <SkeletonPulse className="h-36 rounded-2xl" />
    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <SkeletonPulse className="h-10 w-10 rounded-xl" />
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-7 w-28" />
          <SkeletonPulse className="h-2 w-16" />
        </div>
      ))}
    </div>
    {/* Kehadiran bar */}
    <SkeletonPulse className="h-24 rounded-2xl" />
    {/* 2 col section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <SkeletonPulse className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, j) => (
            <SkeletonPulse key={j} className="h-14 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    <div className="text-center">
      <p className="font-semibold text-gray-800 text-lg">
        Gagal memuat dashboard
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Periksa koneksi lalu coba lagi
      </p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
    >
      <RefreshCw className="w-4 h-4" />
      Coba Lagi
    </button>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-600">{title}</p>
    {description && (
      <p className="text-xs text-gray-400 max-w-[200px]">{description}</p>
    )}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, label, value, sub, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
    <div
      className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <span className="text-xs font-medium text-emerald-600">{trend}</span>
      </div>
    )}
  </div>
);

// ─── Progress Row (Progres Nilai Guru) ───────────────────────────────────────
const ProgressRow = ({ item }) => {
  const pct = item?.persen_selesai ?? 0;
  const barColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-gray-700 truncate">
            {item?.nama ?? "—"}
          </p>
          <span className="text-xs font-bold text-gray-500 ml-2 flex-shrink-0">
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          {item?.sudah_dinilai ?? 0} / {item?.total_tugas ?? 0} tugas dinilai
        </p>
      </div>
    </div>
  );
};

// ─── Log Row ──────────────────────────────────────────────────────────────────
const LogRow = ({ log }) => {
  const action = getActionLabel(log?.action);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 -mx-1 px-1 rounded-lg transition-colors">
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Activity className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[130px]">
            {log?.user?.name ?? "Sistem"}
          </p>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${action.cls}`}
          >
            {action.text}
          </span>
        </div>
        {log?.description && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {log.description}
          </p>
        )}
      </div>
      <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
        {fmtTime(log?.created_at)}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getAdmin();
      // Laravel response: { success, message, data: { ... } }
      setData(res?.data ?? res);
    } catch (err) {
      console.error("[DashboardAdmin] fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={fetchData} />;
  if (!data) return null;

  // ── Safe field mapping ────────────────────────────────────────────────────
  const totalSiswa = data?.total_siswa_aktif ?? 0;
  const totalGuru = data?.total_guru_aktif ?? 0;
  const totalStaf = data?.total_staf_aktif ?? 0;
  const kehadiran = data?.kehadiran_hari_ini ?? {};
  const progresNilai = data?.progres_input_nilai ?? [];
  const pemasukanSPP = data?.pemasukan_spp_bulan_ini ?? 0;
  const jumlahMenunggak = data?.jumlah_siswa_menunggak ?? 0;
  const logAktivitas = data?.log_aktivitas ?? [];

  const persenHadir = kehadiran?.persen_hadir ?? 0;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative">
          <p className="text-slate-400 text-sm font-medium">{greeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-black mt-0.5 tracking-tight">
            {user?.name ?? "Administrator"}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Berikut ringkasan aktivitas sekolah hari ini
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => navigate("/dashboard/siswa")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Users className="w-4 h-4" />
              Data Siswa
            </button>
            <button
              onClick={() => navigate("/dashboard/pengumuman")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Buat Pengumuman
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-indigo-500"
          label="Siswa Aktif"
          value={totalSiswa.toLocaleString("id-ID")}
          sub="Terdaftar semester ini"
        />
        <StatCard
          icon={GraduationCap}
          iconBg="bg-emerald-500"
          label="Guru Aktif"
          value={totalGuru.toLocaleString("id-ID")}
          sub={`${totalStaf} staf pendukung`}
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-amber-500"
          label="Pemasukan SPP"
          value={rupiah(pemasukanSPP)}
          sub="Bulan ini"
        />
        <StatCard
          icon={UserX}
          iconBg="bg-red-500"
          label="Siswa Menunggak"
          value={jumlahMenunggak.toLocaleString("id-ID")}
          sub="Belum bayar SPP"
        />
      </div>

      {/* ── Kehadiran Hari Ini ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              Kehadiran Hari Ini
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Total: {kehadiran?.total ?? 0} siswa
            </p>
          </div>
          <span className="text-2xl font-black text-emerald-600">
            {persenHadir}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${persenHadir}%` }}
          />
        </div>

        {/* Breakdown pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Hadir",
              value: kehadiran?.hadir ?? 0,
              cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "Sakit",
              value: kehadiran?.sakit ?? 0,
              cls: "bg-yellow-50 text-yellow-700 border-yellow-100",
            },
            {
              label: "Izin",
              value: kehadiran?.izin ?? 0,
              cls: "bg-blue-50 text-blue-700 border-blue-100",
            },
            {
              label: "Alpa",
              value: kehadiran?.alpa ?? 0,
              cls: "bg-red-50 text-red-700 border-red-100",
            },
          ].map(({ label, value, cls }) => (
            <div
              key={label}
              className={`flex flex-col items-center p-3 rounded-xl border ${cls}`}
            >
              <span className="text-lg font-black">{value}</span>
              <span className="text-xs font-medium mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-Column Section: Progres Nilai + Log Aktivitas ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Progres Input Nilai Guru */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">
              Progres Input Nilai Guru
            </h2>
            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {progresNilai.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Semua nilai sudah diinput"
              description="Tidak ada guru yang pending input nilai"
            />
          ) : (
            <div>
              {progresNilai.slice(0, 6).map((item) => (
                <ProgressRow key={item?.guru_id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Log Aktivitas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Log Aktivitas</h2>
            <span className="text-xs text-gray-400">
              {logAktivitas.length} aktivitas
            </span>
          </div>

          {logAktivitas.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Belum ada aktivitas"
              description="Log aktivitas akan muncul di sini"
            />
          ) : (
            <div>
              {logAktivitas.slice(0, 8).map((log, i) => (
                <LogRow key={log?.id ?? i} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
