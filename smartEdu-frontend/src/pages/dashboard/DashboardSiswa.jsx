import {
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  BarChart3,
  Target,
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

const rupiah = (n) => (n ? `Rp ${Number(n).toLocaleString("id-ID")}` : "Rp 0");

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "—";

const sisaHari = (deadline) => {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );
  return diff;
};

const badgeNilai = (n) => {
  if (n >= 90)
    return {
      text: "A",
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  if (n >= 80)
    return {
      text: "B+",
      cls: "bg-blue-100 text-blue-700 border border-blue-200",
    };
  if (n >= 75)
    return {
      text: "B",
      cls: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    };
  if (n >= 60)
    return {
      text: "C",
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
    };
  return { text: "D", cls: "bg-red-100 text-red-700 border border-red-200" };
};

const statusTugas = (t) => {
  if (t.nilais?.length > 0)
    return {
      label: "Sudah Dinilai",
      cls: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    };
  const sisa = sisaHari(t.tanggal_deadline);
  if (sisa !== null && sisa <= 2)
    return {
      label: "Segera!",
      cls: "bg-red-100 text-red-700",
      icon: AlertCircle,
    };
  return {
    label: "Belum Dikerjakan",
    cls: "bg-gray-100 text-gray-600",
    icon: Clock,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SummaryCard = ({ icon, bgIcon, label, value, sub, accent }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-3 ${accent ?? "border-gray-100"}`}
  >
    <div
      className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const JadwalCard = ({ jadwal }) => (
  <div className="flex items-center gap-3 p-3.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors">
    <div className="text-center bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-indigo-100 flex-shrink-0 min-w-[52px]">
      <p className="text-xs font-bold text-indigo-600">
        {jadwal.jam_mulai?.slice(0, 5)}
      </p>
      <p className="text-[10px] text-gray-400">s/d</p>
      <p className="text-xs font-bold text-indigo-600">
        {jadwal.jam_selesai?.slice(0, 5)}
      </p>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {jadwal.guru?.nama ?? jadwal.guru?.user?.name ?? "—"}
        {jadwal.ruangan && ` · ${jadwal.ruangan}`}
      </p>
    </div>
  </div>
);

const TugasItem = ({ tugas }) => {
  const status = statusTugas(tugas);
  const StatusIcon = status.icon;
  const sisa = sisaHari(tugas.tanggal_deadline);
  return (
    <div className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all">
      <div
        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${status.cls}`}
      >
        <StatusIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug">
          {tugas.judul}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {tugas.mata_pelajaran?.nama_mapel ?? "—"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-gray-600">
          {fmtDate(tugas.tanggal_deadline)}
        </p>
        {sisa !== null && (
          <p
            className={`text-[10px] font-medium mt-0.5 ${sisa <= 2 ? "text-red-500" : "text-gray-400"}`}
          >
            {sisa === 0 ? "Hari ini" : sisa < 0 ? "Lewat" : `${sisa} hari lagi`}
          </p>
        )}
      </div>
    </div>
  );
};

const NilaiUjianCard = ({ rekap }) => {
  const pts = rekap.per_jenis?.pts ?? rekap.per_jenis?.uts ?? null;
  const pas = rekap.per_jenis?.uas ?? null;
  const avg = rekap.rata_rata;
  const kkm = rekap.kkm ?? 75;
  const lulus = avg >= kkm;
  const pct = Math.min(Math.round((avg / 100) * 100), 100);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{rekap.mapel}</p>
          <p className="text-xs text-gray-400">KKM {kkm}</p>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${lulus ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {lulus ? "Lulus" : "Belum Lulus"}
        </span>
      </div>
      {/* progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full transition-all ${lulus ? "bg-emerald-500" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 text-xs">
        {pts !== null && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">PTS</span>
            <span className="font-bold text-gray-700">{pts}</span>
          </div>
        )}
        {pas !== null && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">PAS</span>
            <span className="font-bold text-gray-700">{pas}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-gray-400">Rata</span>
          <span
            className={`font-bold ${lulus ? "text-emerald-600" : "text-red-500"}`}
          >
            {avg}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardSiswa = ({ data }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const siswa = data?.siswa;
  const namaKelas = siswa?.kelas?.nama_kelas ?? siswa?.kelas?.tingkat ?? "";
  const jadwal = data?.jadwal_hari_ini ?? [];
  const nilaiTerbaru = data?.nilai_terbaru ?? [];
  const rekapNilai = data?.rekap_nilai ?? [];
  const tugasTerdekat = data?.tugas_terdekat ?? [];
  const pengumuman = data?.pengumuman_terbaru ?? [];

  const rataNilai = data?.rata_nilai ? Number(data.rata_nilai).toFixed(1) : "—";
  const persenHadir = data?.persen_hadir
    ? `${Number(data.persen_hadir).toFixed(1)}%`
    : "—";
  const sisaTagihan = data?.sisa_tagihan ?? 0;
  const pembayaranPending = data?.pembayaran_pending ?? 0;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 right-12 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
            {user?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {namaKelas && (
              <span className="text-xs bg-white/20 text-indigo-100 px-3 py-1 rounded-full font-medium">
                📚 {namaKelas}
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

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Nilai Rata-rata"
          value={rataNilai}
          sub="Semester ini"
        />
        <SummaryCard
          icon={<ClipboardCheck className="w-5 h-5 text-emerald-600" />}
          bgIcon="bg-emerald-100"
          label="Kehadiran"
          value={persenHadir}
          sub="Bulan ini"
        />
        <SummaryCard
          icon={<DollarSign className="w-5 h-5 text-orange-500" />}
          bgIcon="bg-orange-100"
          label="Tagihan"
          value={pembayaranPending > 0 ? `${pembayaranPending}x` : "Lunas ✓"}
          sub={
            pembayaranPending > 0 ? rupiah(sisaTagihan) : "Tidak ada tunggakan"
          }
          accent={
            pembayaranPending > 0 ? "border-orange-200" : "border-gray-100"
          }
        />
      </div>

      {/* ── Jadwal + Tugas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="font-bold text-gray-800">Jadwal Hari Ini</h2>
            </div>
            <button
              onClick={() => navigate("/dashboard/jadwal")}
              className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
            >
              Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {jadwal.length > 0 ? (
            <div className="space-y-2">
              {jadwal.map((j) => (
                <JadwalCard key={j.id} jadwal={j} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-gray-400">Tidak ada jadwal hari ini</p>
            </div>
          )}
        </div>

        {/* Tugas & Tenggat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-bold text-gray-800">Tugas Terdekat</h2>
            </div>
            {tugasTerdekat.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {tugasTerdekat.length} tugas
              </span>
            )}
          </div>
          {tugasTerdekat.length > 0 ? (
            <div className="space-y-2">
              {tugasTerdekat.map((t) => (
                <TugasItem key={t.id} tugas={t} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              <p className="text-sm text-gray-400">
                Semua tugas sudah selesai 🎉
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Rekap Nilai PTS / PAS ── */}
      {rekapNilai.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">
                  Rekap Nilai PTS & PAS
                </h2>
                <p className="text-xs text-gray-400">Semester ini</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
            >
              Detail <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rekapNilai.map((r, i) => (
              <NilaiUjianCard key={i} rekap={r} />
            ))}
          </div>
        </div>
      )}

      {/* ── Nilai Terbaru (jika rekap belum ada) ── */}
      {rekapNilai.length === 0 && nilaiTerbaru.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-800">Nilai Terbaru</h2>
            </div>
            <button
              onClick={() => navigate("/dashboard/nilai")}
              className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
            >
              Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {nilaiTerbaru.map((n) => {
              const badge = badgeNilai(n.nilai);
              return (
                <div
                  key={n.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {n.mata_pelajaran?.nama_mapel ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {n.jenis_nilai === "pts"
                        ? "PTS"
                        : n.jenis_nilai === "uas"
                          ? "PAS"
                          : n.jenis_nilai}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-gray-900">
                      {n.nilai}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pembayaran Alert (jika ada tunggakan) ── */}
      {pembayaranPending > 0 && (
        <button
          onClick={() => navigate("/dashboard/pembayaran")}
          className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-orange-100 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">
              Terdapat {pembayaranPending} tagihan belum dibayar
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Total {rupiah(sisaTagihan)} — klik untuk lihat detail
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-400 flex-shrink-0" />
        </button>
      )}

      {/* ── Pengumuman ── */}
      {pengumuman.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800">Pengumuman</h2>
            </div>
            <button
              onClick={() => navigate("/dashboard/pengumuman")}
              className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
            >
              Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {pengumuman.map((p) => {
              const tipeStyle = {
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
              const s = tipeStyle[p.tipe] ?? tipeStyle.biasa;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 border-l-4 rounded-r-xl ${s.bar} ${s.bg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {p.judul}
                    </p>
                    {p.tipe !== "biasa" && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${s.badge}`}
                      >
                        {p.tipe}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.isi}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSiswa;
