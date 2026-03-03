import {
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Bell,
  Users,
  BookOpen,
  Plus,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// ─── Helper ───────────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon, bgIcon, label, value, sub }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div
      className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center mb-3`}
    >
      {icon}
    </div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? "—"}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed ${color} hover:shadow-md transition-all duration-200 group`}
  >
    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs font-semibold text-center leading-tight">
      {label}
    </span>
  </button>
);

const JadwalRow = ({ jadwal }) => (
  <div className="flex items-center gap-4 p-3.5 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors">
    <div className="w-2 h-10 bg-green-400 rounded-full flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
      </p>
      <p className="text-xs text-gray-500">
        {jadwal.kelas?.nama_kelas ?? "—"} · {jadwal.ruangan ?? "—"}
      </p>
    </div>
    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
      {jadwal.jam_mulai?.slice(0, 5)} – {jadwal.jam_selesai?.slice(0, 5)}
    </span>
  </div>
);

// ─── Komponen utama ───────────────────────────────────────────────────────────
const DashboardGuru = ({ data }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ── Hero / Sapaan ── */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 right-8 w-24 h-24 bg-white/5 rounded-full" />

        <p className="text-emerald-200 text-sm font-medium">{greeting()},</p>
        <h1 className="text-2xl font-black mt-0.5 leading-tight">
          {user?.name}
        </h1>
        <span className="inline-block mt-2 text-xs bg-white/20 text-emerald-100 px-3 py-1 rounded-full font-medium">
          👨‍🏫 Guru
        </span>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-green-600" />}
          bgIcon="bg-green-100"
          label="Kelas Hari Ini"
          value={data?.jadwal_hari_ini?.length ?? 0}
          sub="Jadwal aktif"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Kelas Diampu"
          value={data?.kelas_diampu ?? 0}
          sub="Total kelas"
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5 text-amber-500" />}
          bgIcon="bg-amber-100"
          label="Tugas Dinilai"
          value={data?.tugas_dinilai ?? 0}
          sub="Sudah dinilai"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          bgIcon="bg-purple-100"
          label="Input Nilai"
          value={data?.total_nilai_input ?? 0}
          sub="Total input"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">⚡ Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<Plus className="w-5 h-5 text-green-600" />}
            label="Input Nilai Harian"
            color="border-green-200 bg-green-50 text-green-700"
            onClick={() => navigate("/dashboard/nilai")}
          />
          <QuickAction
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            label="Input Nilai PTS / PAS"
            color="border-purple-200 bg-purple-50 text-purple-700"
            onClick={() => navigate("/dashboard/nilai")}
          />
          <QuickAction
            icon={<ClipboardCheck className="w-5 h-5 text-blue-600" />}
            label="Input Absensi"
            color="border-blue-200 bg-blue-50 text-blue-700"
            onClick={() => navigate("/dashboard/absensi")}
          />
          <QuickAction
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            label="Lihat Jadwal"
            color="border-amber-200 bg-amber-50 text-amber-700"
            onClick={() => navigate("/dashboard/jadwal")}
          />
        </div>
      </div>

      {/* ── 2 kolom: Jadwal Hari Ini + Pengumuman ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-bold text-gray-800">
              Jadwal Mengajar Hari Ini
            </h2>
          </div>

          {data?.jadwal_hari_ini?.length ? (
            <div className="space-y-2">
              {data.jadwal_hari_ini.map((j) => (
                <JadwalRow key={j.id} jadwal={j} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <span className="text-3xl">✨</span>
              <p className="text-sm text-gray-400">
                Tidak ada jadwal mengajar hari ini
              </p>
            </div>
          )}
        </div>

        {/* Pengumuman Internal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="font-bold text-gray-800">Pengumuman</h2>
          </div>

          {data?.pengumuman_terbaru?.length ? (
            <div className="space-y-3">
              {data.pengumuman_terbaru.map((p) => {
                const tipeColor = {
                  urgent: "border-red-400 bg-red-50",
                  penting: "border-amber-400 bg-amber-50",
                  biasa: "border-blue-300 bg-blue-50",
                };
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 border-l-4 rounded-r-xl ${tipeColor[p.tipe] ?? tipeColor.biasa}`}
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {p.judul}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {p.isi}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <BookOpen className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">
                Tidak ada pengumuman terbaru
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardGuru;
