import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  DollarSign,
  ClipboardCheck,
  Bell,
  Plus,
  FileText,
  Megaphone,
  TrendingUp,
  AlertCircle,
  UserPlus,
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

const rupiah = (n) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon, bgIcon, label, value, sub, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-start justify-between">
      <div
        className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-3">{value ?? "—"}</p>
    <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl ${color} hover:shadow-md transition-all duration-200 group text-center`}
  >
    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs font-bold leading-tight">{label}</span>
  </button>
);

const PengumumanItem = ({ p }) => {
  const tipeColor = {
    urgent: "border-red-400 bg-red-50",
    penting: "border-amber-400 bg-amber-50",
    biasa: "border-blue-300 bg-blue-50",
  };
  return (
    <div
      className={`p-3.5 border-l-4 rounded-r-xl ${tipeColor[p.tipe] ?? tipeColor.biasa}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{p.judul}</p>
        {p.tipe === "urgent" && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
            URGENT
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.isi}</p>
    </div>
  );
};

// ─── Komponen utama ───────────────────────────────────────────────────────────
const DashboardAdmin = ({ data }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 right-16 w-32 h-32 bg-white/5 rounded-full" />
        <p className="text-slate-300 text-sm font-medium">{greeting()},</p>
        <h1 className="text-2xl font-black mt-0.5 leading-tight">
          {user?.name}
        </h1>
        <span className="inline-block mt-2 text-xs bg-white/20 text-slate-200 px-3 py-1 rounded-full font-medium">
          🏫 Administrator
        </span>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Total Siswa Aktif"
          value={data?.total_siswa ?? 0}
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-green-600" />}
          bgIcon="bg-green-100"
          label="Total Guru Aktif"
          value={data?.total_guru ?? 0}
        />
        <StatCard
          icon={<School className="w-5 h-5 text-orange-500" />}
          bgIcon="bg-orange-100"
          label="Total Kelas"
          value={data?.total_kelas ?? 0}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-purple-600" />}
          bgIcon="bg-purple-100"
          label="Mata Pelajaran"
          value={data?.total_mapel ?? 0}
        />
      </div>

      {/* ── Stats Row 2: Keuangan & Absensi ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Tagihan Belum Dibayar
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.pembayaran_pending ?? 0}
            </p>
            <p className="text-xs text-red-500 font-medium">siswa menunggak</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Absensi Hari Ini
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.absensi_hari_ini ?? 0}
            </p>
            <p className="text-xs text-gray-400">record tercatat</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">⚡ Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<UserPlus className="w-5 h-5 text-blue-600" />}
            label="Tambah Siswa"
            color="bg-blue-50 text-blue-700 border border-blue-100"
            onClick={() => navigate("/dashboard/siswa")}
          />
          <QuickAction
            icon={<GraduationCap className="w-5 h-5 text-green-600" />}
            label="Tambah Guru"
            color="bg-green-50 text-green-700 border border-green-100"
            onClick={() => navigate("/dashboard/guru")}
          />
          <QuickAction
            icon={<Megaphone className="w-5 h-5 text-amber-600" />}
            label="Buat Pengumuman"
            color="bg-amber-50 text-amber-700 border border-amber-100"
            onClick={() => navigate("/dashboard/pengumuman")}
          />
          <QuickAction
            icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            label="Data Pembayaran"
            color="bg-purple-50 text-purple-700 border border-purple-100"
            onClick={() => navigate("/dashboard/pembayaran")}
          />
        </div>
      </div>

      {/* ── Pengumuman Terbaru ── */}
      {data?.pengumuman_terbaru?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800">Pengumuman Terbaru</h2>
            </div>
            <button
              onClick={() => navigate("/dashboard/pengumuman")}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Lihat semua →
            </button>
          </div>
          <div className="space-y-3">
            {data.pengumuman_terbaru.map((p) => (
              <PengumumanItem key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
