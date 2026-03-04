import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  AlertCircle,
  ClipboardCheck,
  Bell,
  UserPlus,
  DollarSign,
  Megaphone,
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Calendar,
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

const fmtLogTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const actionLabel = (action) => {
  const map = {
    login: { text: "Login", cls: "bg-blue-100 text-blue-700" },
    tambah_siswa: {
      text: "Tambah Siswa",
      cls: "bg-emerald-100 text-emerald-700",
    },
    tambah_guru: { text: "Tambah Guru", cls: "bg-green-100 text-green-700" },
    tambah_tugas: { text: "Tambah Tugas", cls: "bg-amber-100 text-amber-700" },
    update_tugas: { text: "Edit Tugas", cls: "bg-amber-100 text-amber-600" },
    hapus_tugas: { text: "Hapus Tugas", cls: "bg-red-100 text-red-700" },
    input_nilai: { text: "Input Nilai", cls: "bg-purple-100 text-purple-700" },
  };
  return map[action] ?? { text: action, cls: "bg-gray-100 text-gray-600" };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon, bgIcon, label, value, sub, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? 0}</p>
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
    <span className="text-xs font-semibold text-center leading-tight">
      {label}
    </span>
  </button>
);

// Grafik absensi 7 hari — pure CSS, tidak butuh library
const GrafikAbsensi = ({ grafik }) => {
  if (!grafik || Object.keys(grafik).length === 0) return null;

  const hari7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dataPerHari = hari7.map((tgl) => {
    const entries = grafik[tgl];
    if (!entries)
      return { tgl, hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 };
    const stat = {};
    entries.forEach((e) => {
      stat[e.status_kehadiran] = e.total;
    });
    const total =
      (stat.hadir ?? 0) +
      (stat.sakit ?? 0) +
      (stat.izin ?? 0) +
      (stat.alpa ?? 0);
    return {
      tgl,
      hadir: stat.hadir ?? 0,
      sakit: stat.sakit ?? 0,
      izin: stat.izin ?? 0,
      alpa: stat.alpa ?? 0,
      total,
    };
  });

  const maxVal = Math.max(...dataPerHari.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Grafik Kehadiran 7 Hari</h2>
          <p className="text-xs text-gray-400">Rekap absensi harian siswa</p>
        </div>
      </div>
      <div className="flex items-end gap-2 h-28">
        {dataPerHari.map(({ tgl, hadir, sakit, izin, alpa, total }) => {
          const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
          const height = Math.round((total / maxVal) * 100);
          const isToday = tgl === new Date().toISOString().split("T")[0];
          const dayLabel = new Date(tgl + "T00:00:00").toLocaleDateString(
            "id-ID",
            { weekday: "short" },
          );
          return (
            <div
              key={tgl}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                <p className="font-bold">
                  {new Date(tgl + "T00:00:00").toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p>
                  Hadir: {hadir} · Sakit: {sakit}
                </p>
                <p>
                  Izin: {izin} · Alpa: {alpa}
                </p>
                <p className="font-semibold mt-0.5">{pct}% hadir</p>
              </div>
              {/* Bar */}
              <div
                className="w-full bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-end"
                style={{ height: "80px" }}
              >
                {total > 0 && (
                  <div
                    className={`w-full rounded-lg transition-all ${isToday ? "bg-indigo-500" : "bg-teal-400"}`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                )}
              </div>
              <p
                className={`text-[10px] font-medium ${isToday ? "text-indigo-600" : "text-gray-400"}`}
              >
                {dayLabel}
              </p>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          <p className="text-xs text-gray-500">Hadir</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <p className="text-xs text-gray-500">Hari ini</p>
        </div>
      </div>
    </div>
  );
};

const LogAktivitasRow = ({ log }) => {
  const action = actionLabel(log.action);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${action.cls}`}
      >
        <Activity className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">
          {log.user?.name ?? "—"}
          <span
            className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-md ${action.cls}`}
          >
            {action.text}
          </span>
        </p>
        {log.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {log.description}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
        {fmtLogTime(log.created_at)}
      </p>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardAdmin = ({ data }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── field mapping sinkron DashboardController ──
  const totalSiswa = data?.total_siswa ?? 0;
  const totalGuru = data?.total_guru ?? 0;
  const totalKelas = data?.total_kelas ?? 0;
  const totalMapel = data?.total_mapel ?? 0;

  const pembayaranPending = data?.pembayaran_pending ?? 0;
  const pembayaranLunas = data?.pembayaran_lunas ?? 0;
  const pembayaranTerlambat = data?.pembayaran_terlambat ?? 0;
  const nominalPending = data?.nominal_pending ?? 0;

  const absensiTotal = data?.absensi_hari_ini ?? 0;
  const absensiHadir = data?.absensi_hadir_hari_ini ?? 0;
  const pctHadir =
    absensiTotal > 0 ? Math.round((absensiHadir / absensiTotal) * 100) : 0;

  const progres = data?.progres_input_nilai ?? {
    sudah: 0,
    total: 0,
    persen: 0,
  };
  const logAktivitas = data?.log_aktivitas ?? [];
  const pengumuman = data?.pengumuman_terbaru ?? [];
  const grafikAbsensi = data?.grafik_absensi_7hari ?? {};

  return (
    <div className="space-y-5 pb-8">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 right-20 w-36 h-36 bg-indigo-500/20 rounded-full" />
        <div className="relative">
          <p className="text-slate-300 text-sm font-medium">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
            {user?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-white/20 text-slate-200 px-3 py-1 rounded-full font-medium">
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
        </div>
      </div>

      {/* ── Stat cards utama ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgIcon="bg-blue-100"
          label="Total Siswa Aktif"
          value={totalSiswa}
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
          bgIcon="bg-emerald-100"
          label="Total Guru Aktif"
          value={totalGuru}
        />
        <StatCard
          icon={<School className="w-5 h-5 text-orange-500" />}
          bgIcon="bg-orange-100"
          label="Total Kelas"
          value={totalKelas}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-purple-600" />}
          bgIcon="bg-purple-100"
          label="Mata Pelajaran"
          value={totalMapel}
        />
      </div>

      {/* ── Kehadiran + Keuangan baris 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kehadiran hari ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Kehadiran Hari Ini
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">
                {absensiHadir}{" "}
                <span className="text-base font-normal text-gray-400">
                  / {absensiTotal}
                </span>
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1.5">
            <div
              className={`h-2.5 rounded-full transition-all ${pctHadir >= 80 ? "bg-emerald-500" : pctHadir >= 60 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${pctHadir}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{pctHadir}% hadir</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Tagihan Belum Dibayar
              </p>
              <p className="text-2xl font-bold text-red-600 leading-none mt-0.5">
                {pembayaranPending}
              </p>
            </div>
          </div>
          <p className="text-xs text-red-500 font-medium mb-3">
            {rupiah(nominalPending)} tertunggak
          </p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
              <p className="font-bold text-emerald-700">{pembayaranLunas}</p>
              <p className="text-gray-500 mt-0.5">Lunas</p>
            </div>
            <div className="flex-1 bg-orange-50 border border-orange-100 rounded-lg p-2.5 text-center">
              <p className="font-bold text-orange-600">{pembayaranTerlambat}</p>
              <p className="text-gray-500 mt-0.5">Terlambat</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progres Input Nilai ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">
                Progres Input Nilai Semester Ini
              </h2>
              <p className="text-xs text-gray-400">
                {progres.sudah} dari {progres.total} siswa sudah mendapatkan
                nilai
              </p>
            </div>
          </div>
          <span className="text-lg font-black text-purple-600">
            {progres.persen ?? 0}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${progres.persen ?? 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>
            Belum: {(progres.total ?? 0) - (progres.sudah ?? 0)} siswa
          </span>
          <span>Selesai: {progres.sudah ?? 0} siswa</span>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span> Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<UserPlus className="w-5 h-5 text-blue-600" />}
            label="Tambah Siswa Baru"
            color="bg-blue-50 text-blue-700 border border-blue-100"
            onClick={() => navigate("/dashboard/siswa")}
          />
          <QuickAction
            icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
            label="Tambah Guru"
            color="bg-emerald-50 text-emerald-700 border border-emerald-100"
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

      {/* ── Grafik Kehadiran 7 Hari ── */}
      <GrafikAbsensi grafik={grafikAbsensi} />

      {/* ── Log Aktivitas + Pengumuman ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Log Aktivitas */}
        {logAktivitas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="font-bold text-gray-800">Aktivitas Terbaru</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {logAktivitas.slice(0, 8).map((log) => (
                <LogAktivitasRow key={log.id} log={log} />
              ))}
            </div>
          </div>
        )}

        {/* Pengumuman Terbaru */}
        {pengumuman.length > 0 && (
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
                className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
              >
                Semua <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {pengumuman.map((p) => {
                const s =
                  {
                    urgent: "border-red-400 bg-red-50",
                    penting: "border-amber-400 bg-amber-50",
                    biasa: "border-blue-300 bg-blue-50",
                  }[p.tipe] ?? "border-blue-300 bg-blue-50";
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 border-l-4 rounded-r-xl ${s}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {p.judul}
                      </p>
                      {p.tipe === "urgent" && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                          urgent
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
    </div>
  );
};

export default DashboardAdmin;
