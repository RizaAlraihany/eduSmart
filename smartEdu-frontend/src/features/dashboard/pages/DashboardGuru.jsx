import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ClipboardCheck,
  Users,
  BookOpen,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Target,
  Bell,
  RefreshCw,
  PlayCircle,
  PenLine,
  XCircle,
  Layers,
} from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { dashboardService } from "@/features/dashboard/services/dashboardService";

// Helpers 

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

// Pak / Bu berdasarkan data guru jika tersedia, fallback ke user
const sapaanGuru = (nama = "") => {
  const lower = nama.toLowerCase();
  // Cek prefiks nama (Ibu, Bu, Siti, Indah, dll)
  const perempuan = [
    "ibu",
    "bu ",
    "siti",
    "indah",
    "rina",
    "ani",
    "dra.",
    "dra ",
  ];
  const isPeF = perempuan.some((p) => lower.startsWith(p));
  return isPeF ? "Bu" : "Pak";
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "—";

const sisaHari = (deadline) => {
  if (!deadline) return null;
  return Math.ceil(
    (new Date(deadline).setHours(23, 59, 59) - Date.now()) /
      (1000 * 60 * 60 * 24),
  );
};

// Klasifikasi urgensi deadline
const deadlineInfo = (sisa) => {
  if (sisa === null) return { label: "", cls: "", bar: "" };
  if (sisa < 0)
    return {
      label: `${Math.abs(sisa)} hari lewat`,
      cls: "text-red-600",
      bar: "bg-red-500",
      badge: "bg-red-100 text-red-700 border-red-200",
    };
  if (sisa === 0)
    return {
      label: "Hari ini!",
      cls: "text-red-600",
      bar: "bg-red-500",
      badge: "bg-red-100 text-red-700 border-red-200",
    };
  if (sisa <= 2)
    return {
      label: `${sisa} hari lagi`,
      cls: "text-orange-600",
      bar: "bg-orange-400",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
    };
  if (sisa <= 5)
    return {
      label: `${sisa} hari lagi`,
      cls: "text-amber-600",
      bar: "bg-amber-400",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    label: `${sisa} hari lagi`,
    cls: "text-gray-400",
    bar: "bg-gray-300",
    badge: "bg-gray-100 text-gray-500 border-gray-200",
  };
};

// Loading Skeleton 

const Sk = ({ h = "h-4", w = "w-full", cls = "" }) => (
  <div className={`${h} ${w} ${cls} bg-gray-200 rounded-lg animate-pulse`} />
);

const Loading = () => (
  <div className="space-y-5 pb-8">
    <div className="bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl h-36 animate-pulse" />
    <div className="grid grid-cols-2 gap-3">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-4 h-24 animate-pulse"
        />
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      {[...Array(3)].map((_, i) => (
        <Sk key={i} h="h-16" cls="rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <Sk h="h-5" w="w-40" />
          {[...Array(3)].map((_, j) => (
            <Sk key={j} h="h-14" cls="rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Error State 

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    <div className="text-center">
      <p className="font-semibold text-gray-700">Gagal memuat dashboard</p>
      <p className="text-sm text-gray-400 mt-1">
        Periksa koneksi lalu coba lagi
      </p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" /> Coba Lagi
    </button>
  </div>
);

// Sub-components 

const StatCard = ({ icon, bgIcon, label, value, sub, urgent }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
      urgent ? "border-red-200 bg-red-50/30" : "border-gray-100"
    }`}
  >
    <div
      className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center mb-3`}
    >
      {icon}
    </div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p
      className={`text-2xl font-bold mt-0.5 leading-tight ${
        urgent ? "text-red-600" : "text-gray-900"
      }`}
    >
      {value ?? "—"}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// Tombol aksi cepat di atas (primary style)
const PrimaryAction = ({ icon, label, subLabel, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-md text-left w-full ${color}`}
  >
    <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold leading-tight">{label}</p>
      {subLabel && (
        <p className="text-[10px] mt-0.5 opacity-75 leading-tight">
          {subLabel}
        </p>
      )}
    </div>
    <ChevronRight className="w-4 h-4 ml-auto opacity-60 flex-shrink-0" />
  </button>
);

// Row jadwal — dengan tombol "Mulai Kelas / Isi Absensi"
const JadwalRow = ({ jadwal, onAbsensi }) => {
  const filled = jadwal.absensi_filled;
  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
        filled
          ? "bg-gray-50 border-gray-100"
          : "bg-emerald-50/70 hover:bg-emerald-50 border-emerald-100"
      }`}
    >
      {/* Jam */}
      <div
        className={`text-center rounded-lg px-2.5 py-1.5 shadow-sm border flex-shrink-0 min-w-[54px] ${
          filled ? "bg-gray-100 border-gray-200" : "bg-white border-emerald-100"
        }`}
      >
        <p
          className={`text-xs font-bold tabular-nums ${
            filled ? "text-gray-400" : "text-emerald-700"
          }`}
        >
          {jadwal.jam_mulai?.slice(0, 5) ?? "—"}
        </p>
        <div
          className={`w-4 mx-auto my-0.5 border-t border-dashed ${
            filled ? "border-gray-300" : "border-emerald-200"
          }`}
        />
        <p
          className={`text-xs font-bold tabular-nums ${
            filled ? "text-gray-400" : "text-emerald-500"
          }`}
        >
          {jadwal.jam_selesai?.slice(0, 5) ?? "—"}
        </p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-semibold truncate ${
              filled ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
          </p>
          {filled && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5" /> Absensi Terisi
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {jadwal.kelas?.nama_kelas ?? "—"}
          {jadwal.ruangan ? ` · ${jadwal.ruangan}` : ""}
        </p>
      </div>

      {/* CTA Button */}
      {!filled ? (
        <button
          onClick={() => onAbsensi(jadwal)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-xl transition-colors active:scale-95"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Isi Absensi</span>
          <span className="sm:hidden">Absensi</span>
        </button>
      ) : (
        <button
          onClick={() => onAbsensi(jadwal)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      )}
    </div>
  );
};

// Row tugas pending grading — dengan progress bar penilaian
const TugasPendingRow = ({ tugas }) => {
  const sisa = sisaHari(tugas.tanggal_deadline);
  const info = deadlineInfo(sisa);
  const pct = tugas.persen_selesai ?? 0;
  const isKritis = sisa !== null && sisa <= 2;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isKritis
          ? "bg-red-50/70 border-red-200"
          : sisa !== null && sisa <= 5
            ? "bg-amber-50/50 border-amber-100"
            : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Header baris */}
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isKritis ? "bg-red-100" : "bg-amber-100"
          }`}
        >
          <Clock
            className={`w-4 h-4 ${isKritis ? "text-red-600" : "text-amber-600"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug truncate">
                {tugas.judul}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {tugas.kelas?.nama_kelas ?? "—"} ·{" "}
                {tugas.mata_pelajaran?.nama_mapel ?? "—"}
              </p>
            </div>
            {info.badge && sisa !== null && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap ${info.badge}`}
              >
                {info.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress penilaian */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
          <span>
            <span className="font-semibold text-gray-700">
              {tugas.sudah_dinilai ?? 0}
            </span>
            /{tugas.total_siswa ?? 0} siswa dinilai
          </span>
          <span className="font-bold text-gray-600">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${info.bar || "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Tenggat:{" "}
          <span className="font-medium text-gray-600">
            {fmtDate(tugas.tanggal_deadline)}
          </span>
        </p>
      </div>
    </div>
  );
};

// Alert strip — absensi belum diisi
const AlertAbsensi = ({ kelasBelumAbsen, onNavigate }) => {
  if (!kelasBelumAbsen || kelasBelumAbsen.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bell className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-800">
            {kelasBelumAbsen.length} kelas belum diisi absensinya
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Hari ini Anda belum mengisi absensi untuk:{" "}
            <span className="font-semibold">
              {kelasBelumAbsen
                .map(
                  (j) =>
                    `${j.kelas?.nama_kelas ?? "—"} (${j.mata_pelajaran?.nama_mapel ?? "—"} ${j.jam_mulai?.slice(0, 5) ?? ""})`,
                )
                .join(", ")}
            </span>
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="flex-shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
        >
          Isi Sekarang
        </button>
      </div>
    </div>
  );
};

// Main Component 

const DashboardGuru = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getGuru();
      // Response: { success, message, data: { nama, nip, ... } }
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Dashboard guru fetch error:", err);
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

  // ── Field mapping — sinkron DashboardController::guru() ──
  const namaGuru = data.nama ?? user?.name ?? "Guru";
  const nip = data.nip ?? "";
  const jumlahKelasHariIni = data.jumlah_kelas_hari_ini ?? 0;
  const totalKelasSemester = data.total_kelas_semester_ini ?? 0;
  const jumlahTugasPerluNilai = data.jumlah_tugas_perlu_dinilai ?? 0;
  const jadwalHariIni = data.jadwal_hari_ini ?? [];
  const kelasBelumAbsen = data.kelas_belum_absen ?? [];
  const adaKlasBelumAbsen =
    data.ada_kelas_belum_absen ?? kelasBelumAbsen.length > 0;
  const tugasPendingGrading = data.tugas_pending_grading ?? [];
  const pengumuman = data.pengumuman ?? [];

 
  const totalSiswaPerwalian = data.total_siswa_perwalian ?? null;

  const sapaan = sapaanGuru(namaGuru);

  // Handler navigate ke absensi
  const handleAbsensi = (jadwal) => {
    navigate(
      `/dashboard/absensi?jadwal_id=${jadwal.id}&tanggal=${new Date().toISOString().split("T")[0]}`,
    );
  };

  // Ada tugas kritis (deadline ≤ 2 hari)
  const adaTugasKritis = tugasPendingGrading.some((t) => {
    const s = sisaHari(t.tanggal_deadline);
    return s !== null && s <= 2;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Hero Sapaan */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-5 right-5 opacity-10 pointer-events-none">
          <GraduationCap className="w-20 h-20" />
        </div>
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight tracking-tight">
            {sapaan} {namaGuru}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {nip && (
              <span className="text-xs bg-white/20 text-emerald-100 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                NIP: {nip}
              </span>
            )}
            <span className="text-xs bg-white/10 text-emerald-200 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          {/* Mini stats di hero */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl font-black">{jumlahKelasHariIni}</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">
                Kelas Hari Ini
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black">{totalKelasSemester}</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">Total Kelas</p>
            </div>
            {jumlahTugasPerluNilai > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-amber-300">
                    {jumlahTugasPerluNilai}
                  </p>
                  <p className="text-[10px] text-emerald-300 mt-0.5">
                    Perlu Dinilai
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions (Primary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PrimaryAction
          icon={<Plus className="w-5 h-5 text-white" />}
          label="Buat Tugas Harian"
          subLabel="Tambah tugas baru untuk kelas Anda"
          color="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-sm"
          onClick={() => navigate("/dashboard/nilai")}
        />
        <PrimaryAction
          icon={<Target className="w-5 h-5 text-white" />}
          label="Input Nilai PTS / PAS"
          subLabel="Masukkan nilai ujian semester"
          color="bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-sm"
          onClick={() => navigate("/dashboard/nilai")}
        />
      </div>

      {/* Alert: Kelas belum absensi */}
      {adaKlasBelumAbsen && (
        <AlertAbsensi
          kelasBelumAbsen={kelasBelumAbsen}
          onNavigate={() => navigate("/dashboard/absensi")}
        />
      )}

      {/* Alert: Tugas deadline kritis */}
      {adaTugasKritis && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">
              Tenggat penilaian hampir habis!
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Ada tugas yang harus segera dinilai sebelum batas waktu berakhir.
              Prioritaskan sekarang.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/nilai")}
            className="flex-shrink-0 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            Nilai Sekarang
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          bgIcon="bg-emerald-100"
          label="Kelas Diajar Hari Ini"
          value={jumlahKelasHariIni}
          sub={jumlahKelasHariIni > 0 ? "Jadwal aktif" : "Tidak ada jadwal"}
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5 text-amber-500" />}
          bgIcon="bg-amber-100"
          label="Tugas Need Grading"
          value={tugasPendingGrading.length}
          sub={
            jumlahTugasPerluNilai > 0
              ? `${jumlahTugasPerluNilai} siswa belum dinilai`
              : "Semua sudah dinilai"
          }
          urgent={tugasPendingGrading.length > 0}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Total Kelas Semester"
          value={totalKelasSemester}
          sub={
            totalSiswaPerwalian != null
              ? `${totalSiswaPerwalian} siswa total`
              : "Semester ini"
          }
        />
      </div>

      {/* Jadwal Mengajar Hari Ini */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">
                Jadwal Mengajar Hari Ini
              </h2>
              {jadwalHariIni.length > 0 && (
                <p className="text-[10px] text-gray-400">
                  {jadwalHariIni.length} sesi ·{" "}
                  {kelasBelumAbsen.length === 0
                    ? "Semua absensi terisi ✓"
                    : `${kelasBelumAbsen.length} belum diisi`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/jadwal")}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-0.5 transition-colors"
          >
            Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {jadwalHariIni.length > 0 ? (
          <div className="space-y-2.5">
            {jadwalHariIni.map((j) => (
              <JadwalRow key={j.id} jadwal={j} onAbsensi={handleAbsensi} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                Tidak ada jadwal hari ini
              </p>
              <p className="text-xs mt-0.5">Selamat beristirahat, {sapaan}!</p>
            </div>
          </div>
        )}
      </div>

      {/* Pending Actions: Tugas Belum Dinilai */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">
                Pending: Tugas Belum Dinilai
              </h2>
              {tugasPendingGrading.length > 0 && (
                <p className="text-[10px] text-gray-400">
                  {tugasPendingGrading.length} tugas · {jumlahTugasPerluNilai}{" "}
                  siswa menunggu nilai
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tugasPendingGrading.length > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                {tugasPendingGrading.length}
              </span>
            )}
            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-0.5 transition-colors"
            >
              Input Nilai <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {tugasPendingGrading.length > 0 ? (
          <>
            {/* Legend deadline */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {[
                { dot: "bg-red-500", label: "Kritis (≤2 hari)" },
                { dot: "bg-amber-400", label: "Segera (≤5 hari)" },
                { dot: "bg-gray-300", label: "Normal" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                  <span className="text-[10px] text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-0.5">
              {tugasPendingGrading.map((t) => (
                <TugasPendingRow key={t.id} tugas={t} />
              ))}
            </div>

            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="mt-4 w-full text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2.5 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
            >
              <PenLine className="w-4 h-4" />
              Beri Nilai Sekarang
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                Semua tugas sudah dinilai!
              </p>
              <p className="text-xs mt-0.5">
                Tidak ada pending penilaian saat ini
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pengumuman */}
      {pengumuman.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Pengumuman</h2>
                <p className="text-[10px] text-gray-400">
                  {pengumuman.length} pengumuman aktif
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/pengumuman")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 transition-colors"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {pengumuman.map((p) => {
              const tipeMap = {
                urgent: {
                  bar: "border-red-400",
                  bg: "bg-red-50",
                  badge: "bg-red-100 text-red-700",
                },
                penting: {
                  bar: "border-amber-400",
                  bg: "bg-amber-50",
                  badge: "bg-amber-100 text-amber-700",
                },
                biasa: {
                  bar: "border-blue-300",
                  bg: "bg-blue-50",
                  badge: "bg-blue-100 text-blue-700",
                },
              };
              const s = tipeMap[p.tipe] ?? tipeMap.biasa;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 border-l-4 rounded-r-xl ${s.bar} ${s.bg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {p.judul}
                    </p>
                    {p.tipe && p.tipe !== "biasa" && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${s.badge}`}
                      >
                        {p.tipe}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {p.isi}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {fmtShortDate(p.tanggal_mulai)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Refresh */}
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

export default DashboardGuru;
