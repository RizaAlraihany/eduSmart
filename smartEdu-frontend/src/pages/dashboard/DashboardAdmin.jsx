import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  UserPlus,
  Megaphone,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Shield,
  FileBarChart,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dataService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

const rupiah = (n) =>
  n != null ? `Rp ${Number(n).toLocaleString("id-ID")}` : "Rp 0";

const fmtLogTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtShortDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const actionLabel = (action) => {
  const map = {
    login: { text: "Login", cls: "bg-blue-100 text-blue-700" },
    logout: { text: "Logout", cls: "bg-slate-100 text-slate-600" },
    tambah_siswa: {
      text: "Tambah Siswa",
      cls: "bg-emerald-100 text-emerald-700",
    },
    tambah_guru: { text: "Tambah Guru", cls: "bg-green-100 text-green-700" },
    tambah_tugas: { text: "Buat Tugas", cls: "bg-amber-100 text-amber-700" },
    update_tugas: { text: "Edit Tugas", cls: "bg-amber-100 text-amber-600" },
    hapus_tugas: { text: "Hapus Tugas", cls: "bg-red-100 text-red-700" },
    input_nilai: { text: "Input Nilai", cls: "bg-purple-100 text-purple-700" },
    tambah_kelas: { text: "Tambah Kelas", cls: "bg-teal-100 text-teal-700" },
    pembayaran: { text: "Pembayaran", cls: "bg-indigo-100 text-indigo-700" },
  };
  return (
    map[action] ?? {
      text: action?.replace(/_/g, " ") ?? "—",
      cls: "bg-gray-100 text-gray-600",
    }
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const Skeleton = ({ h = "h-4", w = "w-full", cls = "" }) => (
  <div className={`${h} ${w} ${cls} bg-gray-200 rounded-lg animate-pulse`} />
);

const Loading = () => (
  <div className="space-y-5 pb-8">
    <div className="bg-gradient-to-br from-slate-300 to-slate-200 rounded-2xl h-32 animate-pulse" />
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <Skeleton h="h-10" w="w-10" cls="rounded-xl" />
          <Skeleton h="h-3" w="w-20" />
          <Skeleton h="h-7" w="w-28" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-5 h-48 animate-pulse" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} h="h-12" cls="rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    <div className="text-center">
      <p className="font-semibold text-gray-700">
        Gagal memuat dashboard admin
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Periksa koneksi dan coba lagi
      </p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" /> Coba Lagi
    </button>
  </div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon, bgIcon, label, value, sub, accent, badge }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
      accent ?? "border-gray-100"
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      {badge && (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}
        >
          {badge.text}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">
      {value ?? "—"}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed transition-all duration-200 hover:shadow-sm active:scale-95 ${color}`}
  >
    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
      {icon}
    </div>
    <span className="text-xs font-semibold text-center leading-tight">
      {label}
    </span>
  </button>
);

// ─── Grafik Kehadiran SVG Native ──────────────────────────────────────────────

const GrafikKehadiran = ({ kehadiran }) => {
  // kehadiran: { hadir, sakit, izin, alpa, total, persen_hadir }
  const { hadir = 0, sakit = 0, izin = 0, alpa = 0, total = 0 } = kehadiran;
  const data = [
    { label: "Hadir", value: hadir, color: "#10b981", bg: "bg-emerald-500" },
    { label: "Sakit", value: sakit, color: "#60a5fa", bg: "bg-blue-400" },
    { label: "Izin", value: izin, color: "#f59e0b", bg: "bg-amber-400" },
    { label: "Alpa", value: alpa, color: "#f87171", bg: "bg-red-400" },
  ];

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 80;
  const barW = 32;
  const gap = 24;
  const chartW = data.length * (barW + gap);

  return (
    <div>
      {/* Bar chart SVG */}
      <div
        className="flex items-end gap-2 justify-around px-2 mb-3"
        style={{ height: `${chartH + 24}px` }}
      >
        {data.map((d) => {
          const barH =
            total > 0
              ? Math.max(4, Math.round((d.value / maxVal) * chartH))
              : 4;
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div
              key={d.label}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <span className="text-[10px] font-bold text-gray-600">
                {pct}%
              </span>
              <div
                className={`w-full max-w-[48px] rounded-t-lg transition-all duration-700 ${d.bg}`}
                style={{ height: `${barH}px` }}
              />
              <span className="text-[10px] text-gray-500 font-medium">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Count badges */}
      <div className="grid grid-cols-4 gap-2">
        {data.map((d) => (
          <div key={d.label} className="text-center bg-gray-50 rounded-xl py-2">
            <p className="text-base font-black text-gray-800">{d.value}</p>
            <p className="text-[10px] text-gray-400">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Progress Bar Guru ────────────────────────────────────────────────────────

const ProgresGuruRow = ({ item }) => {
  const pct = item.persen_selesai ?? 0;
  const statusCls =
    pct === 100
      ? "text-emerald-600 bg-emerald-100"
      : pct >= 50
        ? "text-amber-600 bg-amber-100"
        : "text-red-600 bg-red-100";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-700 truncate">
            {item.nama}
          </p>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusCls}`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              pct === 100
                ? "bg-emerald-500"
                : pct >= 50
                  ? "bg-amber-400"
                  : "bg-red-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {item.sudah_dinilai} / {item.total_tugas} tugas dinilai
        </p>
      </div>
    </div>
  );
};

// ─── Log Aktivitas Row ────────────────────────────────────────────────────────

const LogRow = ({ log }) => {
  const action = actionLabel(log.action);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 -mx-1 px-1 rounded-lg transition-colors">
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Activity className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
            {log.user?.name ?? "Sistem"}
          </p>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${action.cls}`}
          >
            {action.text}
          </span>
          {log.model_type && (
            <span className="text-[10px] text-gray-400">
              · {log.model_type}
            </span>
          )}
        </div>
        {log.description && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-relaxed">
            {log.description}
          </p>
        )}
      </div>
      <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
        {fmtLogTime(log.created_at)}
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

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getAdmin();
      // Response: { success, message, data: { total_siswa_aktif, ... } }
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Dashboard admin fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState onRetry={fetchData} />;
  if (!data) return null;

  // ── Field mapping — sinkron dengan DashboardController::admin() ──
  const totalSiswaAktif = data.total_siswa_aktif ?? 0;
  const totalGuruAktif = data.total_guru_aktif ?? 0;
  const totalStafAktif = data.total_staf_aktif ?? 0;
  const kehadiranHariIni = data.kehadiran_hari_ini ?? {};
  const persenHadir = kehadiranHariIni.persen_hadir ?? 0;
  const progresNilaiGuru = data.progres_input_nilai ?? [];
  const pemasukanSPP = data.pemasukan_spp_bulan_ini ?? 0;
  const jumlahMenunggak = data.jumlah_siswa_menunggak ?? 0;
  const logAktivitas = data.log_aktivitas ?? [];

  // Hitung rata-rata progres nilai semua guru
  const avgProgresNilai =
    progresNilaiGuru.length > 0
      ? Math.round(
          progresNilaiGuru.reduce(
            (sum, g) => sum + (g.persen_selesai ?? 0),
            0,
          ) / progresNilaiGuru.length,
        )
      : 0;

  const totalGuruBelumNilai = progresNilaiGuru.filter(
    (g) => g.belum_dinilai > 0,
  ).length;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 right-20 w-36 h-36 bg-indigo-500/20 rounded-full pointer-events-none" />
        <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
          <Shield className="w-20 h-20" />
        </div>
        <div className="relative">
          <p className="text-slate-300 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight tracking-tight">
            {user?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs bg-white/20 text-slate-200 px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              🏫 Administrator
            </span>
            <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {/* Mini stats di hero */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl font-black">{totalSiswaAktif}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Siswa Aktif</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black">{totalGuruAktif}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Guru Aktif</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black">{persenHadir}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Hadir Hari Ini
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Cards 6-grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Total Siswa Aktif"
          value={totalSiswaAktif}
          sub="Terdaftar & aktif"
          badge={{ text: "Siswa", cls: "bg-blue-100 text-blue-600" }}
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
          bgIcon="bg-emerald-100"
          label="Total Guru Aktif"
          value={totalGuruAktif}
          sub={`${totalStafAktif} staf admin`}
          badge={{ text: "Pengajar", cls: "bg-emerald-100 text-emerald-600" }}
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5 text-teal-600" />}
          bgIcon="bg-teal-100"
          label="Kehadiran Hari Ini"
          value={`${persenHadir}%`}
          sub={`${kehadiranHariIni.hadir ?? 0} dari ${kehadiranHariIni.total ?? 0} siswa`}
          accent={persenHadir < 75 ? "border-red-200" : "border-gray-100"}
          badge={
            persenHadir < 75
              ? { text: "Rendah", cls: "bg-red-100 text-red-600" }
              : { text: "Baik", cls: "bg-emerald-100 text-emerald-600" }
          }
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          bgIcon="bg-purple-100"
          label="Progres Input Nilai"
          value={`${avgProgresNilai}%`}
          sub={
            totalGuruBelumNilai > 0
              ? `${totalGuruBelumNilai} guru belum selesai`
              : "Semua tugas sudah dinilai"
          }
          accent={avgProgresNilai < 50 ? "border-amber-200" : "border-gray-100"}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          bgIcon="bg-green-100"
          label="Pemasukan SPP Bulan Ini"
          value={rupiah(pemasukanSPP)}
          sub="Status: lunas"
          badge={{ text: "SPP", cls: "bg-green-100 text-green-600" }}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          bgIcon="bg-red-100"
          label="Siswa Menunggak"
          value={jumlahMenunggak}
          sub="SPP belum dibayar"
          accent={jumlahMenunggak > 0 ? "border-red-200" : "border-gray-100"}
          badge={
            jumlahMenunggak > 0
              ? { text: "Perhatian", cls: "bg-red-100 text-red-600" }
              : { text: "Aman", cls: "bg-emerald-100 text-emerald-600" }
          }
        />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-base">⚡</span>
          </div>
          <h2 className="font-bold text-gray-800">Aksi Cepat</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<UserPlus className="w-5 h-5 text-blue-600" />}
            label="Tambah Siswa"
            color="border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
            onClick={() => navigate("/dashboard/siswa")}
          />
          <QuickAction
            icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
            label="Tambah Guru"
            color="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
            onClick={() => navigate("/dashboard/guru")}
          />
          <QuickAction
            icon={<Megaphone className="w-5 h-5 text-amber-600" />}
            label="Buat Pengumuman"
            color="border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100"
            onClick={() => navigate("/dashboard/pengumuman")}
          />
          <QuickAction
            icon={<FileBarChart className="w-5 h-5 text-violet-600" />}
            label="Laporan Kehadiran"
            color="border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100"
            onClick={() => navigate("/dashboard/absensi")}
          />
        </div>
        {/* Baris kedua quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <QuickAction
            icon={<BookOpen className="w-5 h-5 text-teal-600" />}
            label="Data Kelas"
            color="border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100"
            onClick={() => navigate("/dashboard/kelas")}
          />
          <QuickAction
            icon={<DollarSign className="w-5 h-5 text-orange-600" />}
            label="Pembayaran SPP"
            color="border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100"
            onClick={() => navigate("/dashboard/pembayaran")}
          />
          <QuickAction
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            label="Input Nilai"
            color="border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-300 hover:bg-purple-100"
            onClick={() => navigate("/dashboard/nilai")}
          />
          <QuickAction
            icon={<Calendar className="w-5 h-5 text-indigo-600" />}
            label="Jadwal Pelajaran"
            color="border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100"
            onClick={() => navigate("/dashboard/jadwal")}
          />
        </div>
      </div>

      {/* ── Grafik + Progres Nilai ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grafik Kehadiran Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Kehadiran Hari Ini</h2>
                <p className="text-[10px] text-gray-400">
                  Total {kehadiranHariIni.total ?? 0} catatan kehadiran
                </p>
              </div>
            </div>
            <span
              className={`text-lg font-black ${
                persenHadir >= 80
                  ? "text-emerald-600"
                  : persenHadir >= 60
                    ? "text-amber-600"
                    : "text-red-500"
              }`}
            >
              {persenHadir}%
            </span>
          </div>

          {/* Progress bar keseluruhan */}
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  persenHadir >= 80
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                    : persenHadir >= 60
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-gradient-to-r from-red-400 to-red-500"
                }`}
                style={{ width: `${persenHadir}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400">
              {kehadiranHariIni.hadir ?? 0} hadir dari{" "}
              {kehadiranHariIni.total ?? 0} siswa
            </p>
          </div>

          {/* Bar chart breakdown */}
          {kehadiranHariIni.total > 0 ? (
            <GrafikKehadiran kehadiran={kehadiranHariIni} />
          ) : (
            <div className="flex flex-col items-center py-8 gap-2 text-gray-400">
              <BarChart3 className="w-10 h-10 opacity-20" />
              <p className="text-sm">Belum ada data kehadiran hari ini</p>
            </div>
          )}
        </div>

        {/* Progres Input Nilai Per Guru */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Progres Input Nilai</h2>
                <p className="text-[10px] text-gray-400">
                  Rata-rata {avgProgresNilai}% tugas sudah dinilai
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 transition-colors"
            >
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar global */}
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-700"
                style={{ width: `${avgProgresNilai}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{totalGuruBelumNilai} guru belum selesai</span>
              <span>
                {
                  progresNilaiGuru.filter((g) => g.persen_selesai === 100)
                    .length
                }{" "}
                guru selesai
              </span>
            </div>
          </div>

          {/* Per-guru list */}
          {progresNilaiGuru.length > 0 ? (
            <div className="max-h-56 overflow-y-auto pr-0.5">
              {progresNilaiGuru.map((g) => (
                <ProgresGuruRow key={g.guru_id} item={g} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2 text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              <p className="text-sm">Belum ada data progres nilai</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Log Aktivitas ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Aktivitas Terbaru</h2>
              <p className="text-[10px] text-gray-400">
                {logAktivitas.length} log terakhir sistem
              </p>
            </div>
          </div>
          {logAktivitas.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
              {logAktivitas.length} entri
            </span>
          )}
        </div>

        {logAktivitas.length > 0 ? (
          <>
            {/* Header tabel */}
            <div className="grid grid-cols-[1fr_auto] text-[10px] font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-100 mb-1">
              <span>Pengguna · Aksi · Detail</span>
              <span>Waktu</span>
            </div>
            <div className="divide-y divide-transparent">
              {logAktivitas.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-10 gap-2 text-gray-400">
            <Activity className="w-10 h-10 opacity-20" />
            <p className="text-sm">Belum ada aktivitas tercatat</p>
          </div>
        )}
      </div>

      {/* ── Alert Siswa Menunggak ────────────────────────────────────────────── */}
      {jumlahMenunggak > 0 && (
        <button
          onClick={() => navigate("/dashboard/pembayaran")}
          className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors text-left group"
        >
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              {jumlahMenunggak} siswa memiliki tunggakan SPP
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Klik untuk lihat dan kelola data pembayaran
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ── Refresh button ────────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-1">
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Perbarui Data
        </button>
      </div>
    </div>
  );
};

export default DashboardAdmin;
