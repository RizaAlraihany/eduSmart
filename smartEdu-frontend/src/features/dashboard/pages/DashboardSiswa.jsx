import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ClipboardCheck,
  DollarSign,
  Calendar,
  FileText,
  Bell,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  Award,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { dashboardService } from "../../../services/dataService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

const rupiah = (n) => (n ? `Rp ${Number(n).toLocaleString("id-ID")}` : "Rp 0");

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

const badgeNilai = (n) => {
  const v = Number(n);
  if (v >= 90) return { text: "A", cls: "bg-emerald-100 text-emerald-700" };
  if (v >= 80) return { text: "B+", cls: "bg-blue-100 text-blue-700" };
  if (v >= 75) return { text: "B", cls: "bg-indigo-100 text-indigo-700" };
  if (v >= 60) return { text: "C", cls: "bg-amber-100 text-amber-700" };
  return { text: "D", cls: "bg-red-100 text-red-700" };
};

// Sinkron dengan 3 status dari endpoint baru:
// tugas_belum_dikerjakan, tugas_menunggu_nilai, tugas_terdekat (dari index lama)
const getStatusTugas = (tugas, listMenungguNilai = []) => {
  const isMenunggu = listMenungguNilai.some((t) => t.id === tugas.id);
  if (isMenunggu) {
    return {
      label: "Menunggu Penilaian",
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
      dot: "bg-amber-400",
      icon: Clock,
    };
  }
  const sisa = sisaHari(tugas.tanggal_deadline);
  if (sisa !== null && sisa <= 0) {
    return {
      label: "Terlambat",
      cls: "bg-red-100 text-red-700 border border-red-200",
      dot: "bg-red-500",
      icon: AlertCircle,
    };
  }
  if (sisa !== null && sisa <= 2) {
    return {
      label: "Segera!",
      cls: "bg-red-100 text-red-700 border border-red-200",
      dot: "bg-red-500",
      icon: AlertCircle,
    };
  }
  return {
    label: "Belum Dikerjakan",
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    icon: FileText,
  };
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const SkeletonBlock = ({ h = "h-4", w = "w-full", cls = "" }) => (
  <div className={`${h} ${w} ${cls} bg-gray-200 rounded-lg animate-pulse`} />
);

const Loading = () => (
  <div className="space-y-5 pb-8">
    {/* Hero skeleton */}
    <div className="bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl p-6 h-32 animate-pulse" />
    {/* Cards skeleton */}
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <SkeletonBlock h="h-10" w="w-10" cls="rounded-xl" />
          <SkeletonBlock h="h-3" w="w-16" />
          <SkeletonBlock h="h-7" w="w-20" />
          <SkeletonBlock h="h-3" w="w-24" />
        </div>
      ))}
    </div>
    {/* Jadwal + Tugas skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <SkeletonBlock h="h-8" w="w-8" cls="rounded-lg" />
            <SkeletonBlock h="h-5" w="w-32" />
          </div>
          {[...Array(3)].map((_, j) => (
            <SkeletonBlock key={j} h="h-14" cls="rounded-xl" />
          ))}
        </div>
      ))}
    </div>
    {/* Tabel nilai skeleton */}
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <SkeletonBlock h="h-5" w="w-40" />
      {[...Array(4)].map((_, i) => (
        <SkeletonBlock key={i} h="h-12" cls="rounded-xl" />
      ))}
    </div>
  </div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const SummaryCard = ({ icon, bgIcon, label, value, sub, accent }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${
      accent ?? "border-gray-100"
    }`}
  >
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 ${bgIcon} rounded-xl flex items-center justify-center flex-shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">
        {label}
      </p>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 leading-tight">
        {value}
      </p>
      {sub && (
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">
          {sub}
        </p>
      )}
    </div>
  </div>
);

const JadwalCard = ({ jadwal, index }) => (
  <div
    className="flex items-center gap-3 p-3.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    {/* Jam */}
    <div className="text-center bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-indigo-100 flex-shrink-0 min-w-[52px]">
      <p className="text-xs font-bold text-indigo-700 tabular-nums">
        {jadwal.jam_mulai?.slice(0, 5) ?? "—"}
      </p>
      <div className="w-4 mx-auto my-0.5 border-t border-dashed border-indigo-200" />
      <p className="text-xs font-bold text-indigo-500 tabular-nums">
        {jadwal.jam_selesai?.slice(0, 5) ?? "—"}
      </p>
    </div>
    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">
        {jadwal.guru?.nama ?? "—"}
        {jadwal.ruangan ? ` · ${jadwal.ruangan}` : ""}
      </p>
    </div>
    {/* Kode mapel */}
    {jadwal.mata_pelajaran?.kode_mapel && (
      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded flex-shrink-0">
        {jadwal.mata_pelajaran.kode_mapel}
      </span>
    )}
  </div>
);

const TugasItem = ({ tugas, statusInfo }) => {
  const sisa = sisaHari(tugas.tanggal_deadline);
  const StatusIcon = statusInfo.icon;
  return (
    <div className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all group">
      {/* Status dot */}
      <div
        className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusInfo.dot}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug truncate">
              {tugas.judul}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {tugas.mata_pelajaran?.nama_mapel ?? "—"}
              {tugas.guru?.nama ? ` · ${tugas.guru.nama}` : ""}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${statusInfo.cls}`}
          >
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            Tenggat:{" "}
            <span className="font-medium text-gray-600">
              {fmtDate(tugas.tanggal_deadline)}
            </span>
          </p>
          {sisa !== null && (
            <p
              className={`text-[10px] font-bold ${
                sisa <= 0
                  ? "text-red-500"
                  : sisa <= 2
                    ? "text-orange-500"
                    : "text-gray-400"
              }`}
            >
              {sisa <= 0
                ? sisa === 0
                  ? "Hari ini!"
                  : `${Math.abs(sisa)} hari lewat`
                : `${sisa} hari lagi`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Tabel papan nilai PTS & PAS
const PapanNilai = ({ rekapPTS, rekapPAS }) => {
  // Gabungkan semua mapel dari PTS dan PAS
  const allMapel = [
    ...new Set([
      ...rekapPTS.map((r) => r.mapel),
      ...rekapPAS.map((r) => r.mapel),
    ]),
  ].filter(Boolean);

  if (allMapel.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
        <BarChart3 className="w-10 h-10 opacity-30" />
        <p className="text-sm">Belum ada data nilai ujian</p>
      </div>
    );
  }

  const getPTS = (mapel) => rekapPTS.find((r) => r.mapel === mapel);
  const getPAS = (mapel) => rekapPAS.find((r) => r.mapel === mapel);

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[380px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
              Mata Pelajaran
            </th>
            <th className="text-center text-xs font-semibold text-blue-600 pb-3 px-3 w-20">
              PTS
            </th>
            <th className="text-center text-xs font-semibold text-violet-600 pb-3 px-3 w-20">
              PAS
            </th>
            <th className="text-center text-xs font-semibold text-gray-500 pb-3 pl-3 w-16">
              KKM
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {allMapel.map((mapel) => {
            const pts = getPTS(mapel);
            const pas = getPAS(mapel);
            const kkm = pts?.kkm ?? pas?.kkm ?? 75;
            const nilaiPTS = pts?.nilai ?? null;
            const nilaiPAS = pas?.nilai ?? null;

            const cellCls = (val) => {
              if (val === null) return "text-gray-300 font-medium";
              return val >= kkm
                ? "text-emerald-600 font-bold"
                : "text-red-500 font-bold";
            };

            return (
              <tr key={mapel} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 pr-4">
                  <p className="text-sm font-medium text-gray-700 leading-tight">
                    {mapel}
                  </p>
                </td>
                <td className="py-3 px-3 text-center">
                  {nilaiPTS !== null ? (
                    <span className={`text-sm ${cellCls(nilaiPTS)}`}>
                      {nilaiPTS}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {nilaiPAS !== null ? (
                    <span className={`text-sm ${cellCls(nilaiPAS)}`}>
                      {nilaiPAS}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 pl-3 text-center">
                  <span className="text-xs text-gray-400 font-medium">
                    {kkm}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-gray-400">≥ KKM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[10px] text-gray-400">&lt; KKM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="text-[10px] text-gray-400">Belum ada nilai</span>
        </div>
      </div>
    </div>
  );
};

const PengumumanItem = ({ item }) => {
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
  const s = tipeMap[item.tipe] ?? tipeMap.biasa;

  return (
    <div className={`p-3.5 border-l-4 rounded-r-xl ${s.bar} ${s.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 leading-snug">
          {item.judul}
        </p>
        {item.tipe && item.tipe !== "biasa" && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${s.badge}`}
          >
            {item.tipe}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
        {item.isi}
      </p>
      <p className="text-[10px] text-gray-400 mt-1.5">
        {fmtShortDate(item.tanggal_mulai)}
      </p>
    </div>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────

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
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Coba Lagi
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardSiswa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getSiswa();
      // Response: { success, message, data: { nama, kelas, ... } }
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Dashboard siswa fetch error:", err);
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

  // ── Field mapping — sinkron dengan DashboardController::siswa() ──
  const nama = data.nama ?? user?.name ?? "Siswa";
  const namaKelas = data.kelas ?? "";
  const tingkat = data.tingkat ?? "";
  const rataNilaiTugas =
    data.rata_nilai_tugas != null
      ? Number(data.rata_nilai_tugas).toFixed(1)
      : "—";
  const persenKehadiran =
    data.persen_kehadiran != null
      ? `${Number(data.persen_kehadiran).toFixed(1)}%`
      : "—";
  const sisaTagihan = data.sisa_tagihan ?? 0;
  const detailTagihan = data.detail_tagihan ?? [];
  const jadwalHariIni = data.jadwal_hari_ini ?? [];
  const tugasBelumDikerjakan = data.tugas_belum_dikerjakan ?? [];
  const tugasMenungguNilai = data.tugas_menunggu_nilai ?? [];
  const rekapPTS = data.rekap_pts ?? [];
  const rekapPAS = data.rekap_pas ?? [];
  const pengumuman = data.pengumuman ?? [];

  // Gabungkan semua tugas untuk To-Do list: belum dikerjakan + menunggu nilai
  const allTugas = [
    ...tugasBelumDikerjakan.map((t) => ({ ...t, _src: "belum" })),
    ...tugasMenungguNilai.map((t) => ({ ...t, _src: "menunggu" })),
  ];
  // Deduplicate by id (tugas bisa muncul di keduanya jika query overlap)
  const tugasUnik = allTugas.filter(
    (t, idx, self) => self.findIndex((x) => x.id === t.id) === idx,
  );

  const adaTagihan = detailTagihan.length > 0 || sisaTagihan > 0;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Hero Sapaan ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-12 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-500/20 rounded-full pointer-events-none" />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight tracking-tight">
            {nama}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {(namaKelas || tingkat) && (
              <span className="text-xs bg-white/20 text-indigo-100 px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                📚 {tingkat ? `Kelas ${tingkat} · ` : ""}
                {namaKelas}
              </span>
            )}
            <span className="text-xs bg-white/10 text-indigo-200 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Alert Tagihan ────────────────────────────────────────────────────── */}
      {adaTagihan && (
        <button
          onClick={() => navigate("/dashboard/pembayaran")}
          className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-orange-100 transition-colors text-left group"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800">
              Ada {detailTagihan.length || "beberapa"} tagihan belum dibayar
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Total {rupiah(sisaTagihan)} — tap untuk lihat detail
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-orange-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Nilai Rata-rata Tugas"
          value={rataNilaiTugas}
          sub="Semester ini"
        />
        <SummaryCard
          icon={
            <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          }
          bgIcon="bg-emerald-100"
          label="Kehadiran"
          value={persenKehadiran}
          sub="Bulan ini"
          accent={
            data.persen_kehadiran != null && data.persen_kehadiran < 75
              ? "border-red-200"
              : "border-gray-100"
          }
        />
        <SummaryCard
          icon={
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          }
          bgIcon="bg-orange-100"
          label="Tagihan SPP"
          value={adaTagihan ? rupiah(sisaTagihan) : "Lunas ✓"}
          sub={
            adaTagihan
              ? `${detailTagihan.length} tagihan`
              : "Tidak ada tunggakan"
          }
          accent={adaTagihan ? "border-orange-200" : "border-gray-100"}
        />
      </div>

      {/* ── Jadwal & Tugas ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  Jadwal Hari Ini
                </h2>
                {jadwalHariIni.length > 0 && (
                  <p className="text-[10px] text-gray-400">
                    {jadwalHariIni.length} mata pelajaran
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/jadwal")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 transition-colors"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jadwalHariIni.length > 0 ? (
            <div className="space-y-2">
              {jadwalHariIni.map((j, i) => (
                <JadwalCard key={j.id} jadwal={j} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2 text-gray-400">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-medium">Tidak ada jadwal hari ini</p>
              <p className="text-xs">Selamat beristirahat!</p>
            </div>
          )}
        </div>

        {/* To-Do Tugas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  Daftar Tugas
                </h2>
                {tugasUnik.length > 0 && (
                  <p className="text-[10px] text-gray-400">
                    {tugasUnik.length} tugas perlu perhatian
                  </p>
                )}
              </div>
            </div>
            {tugasUnik.length > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                {tugasUnik.length}
              </span>
            )}
          </div>

          {/* Badge legend */}
          {tugasUnik.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-gray-400">
                  Belum/Terlambat
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-gray-400">
                  Menunggu Penilaian
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-[10px] text-gray-400">
                  Belum Dikerjakan
                </span>
              </div>
            </div>
          )}

          {tugasUnik.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
              {tugasUnik.map((tugas) => {
                const statusInfo = getStatusTugas(tugas, tugasMenungguNilai);
                return (
                  <TugasItem
                    key={tugas.id}
                    tugas={tugas}
                    statusInfo={statusInfo}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2 text-gray-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-200" />
              <p className="text-sm font-medium text-gray-500">
                Semua tugas beres!
              </p>
              <p className="text-xs">Tidak ada tugas yang perlu diselesaikan</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Papan Nilai PTS & PAS ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                Papan Nilai
              </h2>
              <p className="text-[10px] text-gray-400">
                Rekap PTS & PAS Semester Ini
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

        {/* Header PTS / PAS */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-blue-700">PTS</span>
            <span className="text-[10px] text-blue-400 hidden sm:inline">
              (Penilaian Tengah Semester)
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-xs font-bold text-violet-700">PAS</span>
            <span className="text-[10px] text-violet-400 hidden sm:inline">
              (Penilaian Akhir Semester)
            </span>
          </div>
        </div>

        <PapanNilai rekapPTS={rekapPTS} rekapPAS={rekapPAS} />
      </div>

      {/* ── Pengumuman ────────────────────────────────────────────────────────── */}
      {pengumuman.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  Pengumuman
                </h2>
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
            {pengumuman.map((p) => (
              <PengumumanItem key={p.id} item={p} />
            ))}
          </div>
        </div>
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

export default DashboardSiswa;
