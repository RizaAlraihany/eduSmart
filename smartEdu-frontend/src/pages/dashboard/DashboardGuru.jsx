import {
  Calendar, ClipboardCheck, TrendingUp, Bell, Users,
  BookOpen, Plus, FileText, AlertTriangle, CheckCircle2,
  ChevronRight, Clock, GraduationCap, Target, Activity,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "—";

const sisaHari = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon, bgIcon, label, value, sub, urgent }) => (
  <div className={`bg-white rounded-2xl shadow-sm border p-5 ${urgent ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
    <div className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className={`text-2xl font-bold mt-0.5 ${urgent ? "text-red-600" : "text-gray-900"}`}>{value ?? "—"}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl ${color} hover:shadow-md transition-all duration-200 active:scale-95`}
  >
    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
      {icon}
    </div>
    <span className="text-xs font-semibold text-center leading-tight">{label}</span>
  </button>
);

const JadwalRow = ({ jadwal }) => (
  <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-colors">
    <div className="text-center bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-emerald-100 flex-shrink-0 min-w-[52px]">
      <p className="text-xs font-bold text-emerald-700">{jadwal.jam_mulai?.slice(0, 5)}</p>
      <p className="text-[10px] text-gray-400">s/d</p>
      <p className="text-xs font-bold text-emerald-700">{jadwal.jam_selesai?.slice(0, 5)}</p>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
      </p>
      <p className="text-xs text-gray-500">
        {jadwal.kelas?.nama_kelas ?? "—"}
        {jadwal.ruangan && ` · ${jadwal.ruangan}`}
      </p>
    </div>
    <button
      className="flex-shrink-0 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
      onClick={() => {/* navigate to absensi with jadwal filter */}}
    >
      Absensi
    </button>
  </div>
);

const TugasBelumDinilaiRow = ({ tugas }) => {
  const sisa = sisaHari(tugas.tanggal_deadline);
  const lewat = sisa !== null && sisa < 0;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${lewat ? "bg-red-50 border-red-200" : "bg-amber-50/60 border-amber-100"}`}>
      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lewat ? "bg-red-100" : "bg-amber-100"}`}>
        <Clock className={`w-4 h-4 ${lewat ? "text-red-600" : "text-amber-600"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{tugas.judul}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {tugas.kelas?.nama_kelas ?? "—"} · {tugas.mata_pelajaran?.nama_mapel ?? "—"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-gray-600">{fmtDate(tugas.tanggal_deadline)}</p>
        <p className={`text-[10px] font-bold mt-0.5 ${lewat ? "text-red-600" : "text-amber-600"}`}>
          {lewat ? "Tenggat lewat!" : `${sisa} hari lagi`}
        </p>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardGuru = ({ data }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── field mapping sinkron DashboardController (update) ──
  const jadwal            = data?.jadwal_hari_ini         ?? [];
  const kelasDiajar       = data?.kelas_diampu             ?? 0;
  const tugasBelumDinilai = data?.tugas_belum_dinilai      ?? [];
  const totalNilaiInput   = data?.total_nilai_diinput      ?? 0;
  const totalTugasAktif   = data?.total_tugas_aktif        ?? 0;
  const pengumuman        = data?.pengumuman_terbaru       ?? [];
  const absensiStats      = data?.absensi_bulan_ini        ?? {};
  const detailKelas       = data?.detail_kelas_diampu      ?? [];

  // Absensi belum diisi hari ini (jadwal yang belum punya absensi)
  const jadwalTanpaAbsensi = jadwal.filter((j) => !j.absensi_filled);

  return (
    <div className="space-y-5 pb-8">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">{user?.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-white/20 text-emerald-100 px-3 py-1 rounded-full font-medium">
              👨‍🏫 Guru
            </span>
            <span className="text-xs bg-white/10 text-emerald-200 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Alert: Tugas mendesak ── */}
      {tugasBelumDinilai.some((t) => sisaHari(t.tanggal_deadline) !== null && sisaHari(t.tanggal_deadline) <= 2) && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Tenggat penilaian hampir habis!</p>
            <p className="text-xs text-red-600 mt-0.5">
              Ada tugas yang harus segera dinilai sebelum batas waktu berakhir.
            </p>
          </div>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          bgIcon="bg-emerald-100" label="Kelas Hari Ini"
          value={jadwal.length} sub="Jadwal aktif"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100" label="Kelas Diampu"
          value={kelasDiajar} sub="Total kelas"
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5 text-amber-500" />}
          bgIcon="bg-amber-100" label="Perlu Dinilai"
          value={tugasBelumDinilai.length} sub="Tugas belum dinilai"
          urgent={tugasBelumDinilai.length > 0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          bgIcon="bg-purple-100" label="Input Nilai"
          value={totalNilaiInput} sub="Total semester ini"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span> Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<Plus className="w-5 h-5 text-emerald-600" />}
            label="Buat Tugas Harian"
            color="border-2 border-dashed border-emerald-200 bg-emerald-50 text-emerald-700"
            onClick={() => navigate("/dashboard/nilai")}
          />
          <QuickAction
            icon={<Target className="w-5 h-5 text-purple-600" />}
            label="Input Nilai PTS / PAS"
            color="border-2 border-dashed border-purple-200 bg-purple-50 text-purple-700"
            onClick={() => navigate("/dashboard/nilai")}
          />
          <QuickAction
            icon={<ClipboardCheck className="w-5 h-5 text-blue-600" />}
            label="Isi Absensi"
            color="border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700"
            onClick={() => navigate("/dashboard/absensi")}
          />
          <QuickAction
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            label="Lihat Jadwal"
            color="border-2 border-dashed border-amber-200 bg-amber-50 text-amber-700"
            onClick={() => navigate("/dashboard/jadwal")}
          />
        </div>
      </div>

      {/* ── Jadwal Hari Ini ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Jadwal Mengajar Hari Ini</h2>
              {jadwal.length > 0 && (
                <p className="text-xs text-gray-400">{jadwal.length} sesi · klik Absensi untuk isi daftar hadir</p>
              )}
            </div>
          </div>
          <button onClick={() => navigate("/dashboard/jadwal")}
            className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5">
            Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {jadwal.length > 0 ? (
          <div className="space-y-2">
            {jadwal.map((j) => <JadwalRow key={j.id} jadwal={j} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            <p className="text-sm text-gray-400">Tidak ada jadwal mengajar hari ini</p>
          </div>
        )}
      </div>

      {/* ── Tugas Belum Dinilai ── */}
      {tugasBelumDinilai.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Tugas Menunggu Penilaian</h2>
                <p className="text-xs text-gray-400">Segera beri nilai sebelum tenggat</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              {tugasBelumDinilai.length} tugas
            </span>
          </div>
          <div className="space-y-2">
            {tugasBelumDinilai.map((t) => <TugasBelumDinilaiRow key={t.id} tugas={t} />)}
          </div>
          <button
            onClick={() => navigate("/dashboard/nilai")}
            className="mt-3 w-full text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2.5 hover:bg-amber-100 transition-colors"
          >
            Beri Nilai Sekarang →
          </button>
        </div>
      )}

      {/* ── Statistik Absensi Bulan Ini ── */}
      {Object.keys(absensiStats).length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-800">Statistik Absensi Bulan Ini</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: "hadir", label: "Hadir",  cls: "bg-emerald-100 text-emerald-700" },
              { key: "sakit", label: "Sakit",  cls: "bg-blue-100 text-blue-700" },
              { key: "izin",  label: "Izin",   cls: "bg-amber-100 text-amber-700" },
              { key: "alpa",  label: "Alpa",   cls: "bg-red-100 text-red-700" },
            ].map(({ key, label, cls }) => (
              <div key={key} className={`rounded-xl p-3 text-center ${cls}`}>
                <p className="text-xl font-black">{absensiStats[key] ?? 0}</p>
                <p className="text-xs font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2 col: Kelas Diampu + Pengumuman ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Kelas Diampu */}
        {detailKelas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-800">Kelas yang Diajar</h2>
            </div>
            <div className="space-y-2">
              {detailKelas.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{k.nama_kelas}</p>
                    <p className="text-xs text-gray-400">{k.tingkat}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                    {k.siswas?.length ?? 0} siswa
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pengumuman Internal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800">Pengumuman</h2>
            </div>
            <button onClick={() => navigate("/dashboard/pengumuman")}
              className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5">
              Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {pengumuman.length > 0 ? (
            <div className="space-y-2.5">
              {pengumuman.map((p) => {
                const s = {
                  urgent:  "border-red-400 bg-red-50",
                  penting: "border-amber-400 bg-amber-50",
                  biasa:   "border-blue-300 bg-blue-50",
                }[p.tipe] ?? "border-blue-300 bg-blue-50";
                return (
                  <div key={p.id} className={`p-3.5 border-l-4 rounded-r-xl ${s}`}>
                    <p className="text-sm font-semibold text-gray-800">{p.judul}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.isi}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2">
              <BookOpen className="w-7 h-7 text-gray-200" />
              <p className="text-sm text-gray-400">Tidak ada pengumuman</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardGuru;