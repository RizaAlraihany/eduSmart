import {
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Bell,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

// ─── Helper ───────────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};

const rupiah = (n) => (n ? `Rp ${Number(n).toLocaleString("id-ID")}` : "Rp 0");

const badgeNilai = (n) => {
  if (n >= 90)
    return { text: "Sangat Baik", cls: "bg-green-100 text-green-700" };
  if (n >= 75) return { text: "Baik", cls: "bg-blue-100 text-blue-700" };
  if (n >= 60) return { text: "Cukup", cls: "bg-yellow-100 text-yellow-700" };
  return { text: "Perlu Bimbingan", cls: "bg-red-100 text-red-700" };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SummaryCard = ({ icon, bgIcon, label, value, sub, color = "indigo" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
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
  <div className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-2 h-8 bg-indigo-400 rounded-full flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
        </p>
        <p className="text-xs text-gray-500">{jadwal.ruangan ?? "—"}</p>
      </div>
    </div>
    <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
      {jadwal.jam_mulai?.slice(0, 5)} – {jadwal.jam_selesai?.slice(0, 5)}
    </span>
  </div>
);

const NilaiRow = ({ nilai }) => {
  const badge = badgeNilai(nilai.nilai);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {nilai.mata_pelajaran?.nama_mapel ?? "—"}
        </p>
        <p className="text-xs text-gray-500 capitalize">{nilai.jenis_nilai}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-900">{nilai.nilai}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}
        >
          {badge.text}
        </span>
      </div>
    </div>
  );
};

// ─── Komponen utama ───────────────────────────────────────────────────────────
const DashboardSiswa = ({ data }) => {
  const { user } = useAuth();
  const siswa = data?.siswa;
  const namaKelas = siswa?.kelas?.nama_kelas ?? "";

  return (
    <div className="space-y-6">
      {/* ── Hero / Sapaan ── */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
        {/* dekorasi circle */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-2 w-24 h-24 bg-white/5 rounded-full" />

        <p className="text-indigo-200 text-sm font-medium">{greeting()},</p>
        <h1 className="text-2xl font-black mt-0.5 leading-tight">
          {user?.name}
        </h1>
        {namaKelas && (
          <span className="inline-block mt-2 text-xs bg-white/20 text-indigo-100 px-3 py-1 rounded-full font-medium">
            📚 {namaKelas}
          </span>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Nilai Rata-rata"
          value={data?.rata_nilai ? Number(data.rata_nilai).toFixed(1) : "—"}
          sub="Semester ini"
        />
        <SummaryCard
          icon={<ClipboardCheck className="w-5 h-5 text-green-600" />}
          bgIcon="bg-green-100"
          label="Kehadiran"
          value={data?.persen_hadir ? `${data.persen_hadir}%` : "—"}
          sub="Bulan ini"
        />
        <SummaryCard
          icon={<DollarSign className="w-5 h-5 text-orange-500" />}
          bgIcon="bg-orange-100"
          label="Tagihan SPP"
          value={
            data?.pembayaran_pending
              ? `${data.pembayaran_pending} tagihan`
              : "Lunas ✓"
          }
          sub="Belum dibayar"
        />
      </div>

      {/* ── 2 kolom: Jadwal + Nilai terbaru ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-800">Jadwal Hari Ini</h2>
          </div>

          {data?.jadwal_hari_ini?.length ? (
            <div className="space-y-2">
              {data.jadwal_hari_ini.map((j) => (
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

        {/* Nilai Terbaru */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-800">Nilai Terbaru</h2>
          </div>

          {data?.nilai_terbaru?.length ? (
            <div>
              {data.nilai_terbaru.map((n) => (
                <NilaiRow key={n.id} nilai={n} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <BookOpen className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">Belum ada data nilai</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pengumuman ── */}
      {data?.pengumuman_terbaru?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="font-bold text-gray-800">Pengumuman</h2>
          </div>

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
                  className={`p-4 border-l-4 rounded-r-xl ${tipeColor[p.tipe] ?? tipeColor.biasa}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {p.judul}
                    </p>
                    {p.tipe === "urgent" && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                        URGENT
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
