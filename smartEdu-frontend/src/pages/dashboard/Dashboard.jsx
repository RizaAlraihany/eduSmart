import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Clock,
  Megaphone,
  Activity,
  Calendar,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import Card from "../../components/common/card";
import Badge from "../../components/common/Badge";
import Loading from "../../components/common/Loading";
import { AuthContext } from "../../contexts/AuthContext";
import {
  dashboardService,
  jadwalService,
  pengumumanService,
} from "../../services/dashboardService";

// Map tipe pengumuman dari backend ke warna UI
const tipeStyle = {
  urgent: { border: "border-red-400 bg-red-50/40", dot: "bg-red-500" },
  penting: {
    border: "border-orange-400 bg-orange-50/40",
    dot: "bg-orange-500",
  },
  biasa: { border: "border-blue-400 bg-blue-50/40", dot: "bg-blue-500" },
};

const Dashboard = () => {
  const { user } = useAuthContext();

  const [dashData, setDashData] = useState(null);
  const [jadwal, setJadwal] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard data (stats + pengumuman dari DashboardController)
      const data = await dashboardService.getDashboard();
      setDashData(data);

      // Pengumuman sudah ada di response dashboard
      setPengumuman(data?.pengumuman_terbaru ?? []);

      // Jadwal: kalau ada di dashboard (guru/siswa) pakai itu,
      // kalau admin fetch terpisah dari /api/jadwal
      if (data?.jadwal_hari_ini) {
        setJadwal(data.jadwal_hari_ini);
      } else {
        // admin: fetch jadwal hari ini dari endpoint /jadwal
        const jadwalData = await jadwalService.getJadwalHariIni();
        setJadwal(jadwalData);
      }
    } catch (err) {
      console.error(err);
      setError(
        "Gagal memuat data. Pastikan server Laravel berjalan di localhost:8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Build stat cards hanya untuk admin
  const statCards = dashData
    ? [
        {
          title: "Total Siswa",
          value: dashData.total_siswa?.toLocaleString("id-ID") ?? "—",
          icon: Users,
          trend: "+4.5%",
          trendDirection: "up",
          colorClass: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
          delay: 0,
        },
        {
          title: "Total Guru",
          value: dashData.total_guru?.toLocaleString("id-ID") ?? "—",
          icon: GraduationCap,
          trend: "+1.2%",
          trendDirection: "up",
          colorClass:
            "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
          delay: 100,
        },
        {
          title: "Kelas Aktif",
          value: dashData.total_kelas?.toLocaleString("id-ID") ?? "—",
          icon: BookOpen,
          trend: "0%",
          trendDirection: "neutral",
          colorClass:
            "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
          delay: 200,
        },
        {
          title: "Tagihan Pending",
          value: dashData.pembayaran_pending?.toLocaleString("id-ID") ?? "—",
          icon: CreditCard,
          trend: "",
          trendDirection: dashData.pembayaran_pending > 0 ? "down" : "up",
          colorClass:
            "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
          delay: 300,
        },
      ]
    : [];

  // ─── Kolom tabel jadwal
  const jadwalColumns = [
    { header: "Waktu", width: "22%" },
    { header: "Mata Pelajaran", width: "22%" },
    { header: "Kelas", width: "18%" },
    { header: "Guru", width: "28%" },
    { header: "Status", width: "10%" },
  ];

  // Tentukan status jadwal berdasarkan jam sekarang
  const getStatus = (jamMulai, jamSelesai) => {
    const now = new Date();
    const [hM, mM] = jamMulai.split(":").map(Number);
    const [hS, mS] = jamSelesai.split(":").map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const mulaiMin = hM * 60 + mM;
    const selesaiMin = hS * 60 + mS;
    if (nowMin >= mulaiMin && nowMin <= selesaiMin) return "ongoing";
    if (nowMin < mulaiMin) return "upcoming";
    return "done";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loading size="lg" text="Memuat data dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8 relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 font-display">
            Selamat Datang{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Ringkasan aktivitas eduSmart hari ini
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold flex-1">{error}</p>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 text-sm font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
          </button>
        </div>
      )}

      {/* Stat Cards — hanya tampil untuk admin */}
      {user?.role === "admin" && dashData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      {/* Stat Cards untuk Guru */}
      {user?.role === "guru" && dashData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Kelas Diampu"
            value={dashData.kelas_diampu ?? "—"}
            icon={BookOpen}
            trend=""
            trendDirection="neutral"
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            delay={0}
          />
          <StatCard
            title="Jadwal Hari Ini"
            value={jadwal.length}
            icon={Calendar}
            trend=""
            trendDirection="neutral"
            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
            delay={100}
          />
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jadwal Hari Ini */}
        <Card className="lg:col-span-2" padding="none" glass>
          <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 flex items-center font-display">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Jadwal Kelas Hari Ini
              </h2>
              <a
                href="/dashboard/jadwal"
                className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center group"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <DataTable
            columns={jadwalColumns}
            data={jadwal}
            emptyMessage="Tidak ada jadwal hari ini"
            renderRow={(item) => {
              const status = getStatus(item.jam_mulai, item.jam_selesai);
              return (
                <>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {item.jam_mulai} – {item.jam_selesai}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.mataPelajaran?.nama_mapel ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="primary">
                      {item.kelas?.nama_kelas ?? "—"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {item.guru?.nama ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {status === "ongoing" ? (
                      <Badge variant="success">
                        <Activity className="w-3 h-3 mr-1 inline animate-pulse" />
                        Live
                      </Badge>
                    ) : status === "done" ? (
                      <Badge variant="default">Selesai</Badge>
                    ) : (
                      <Badge variant="warning">Upcoming</Badge>
                    )}
                  </td>
                </>
              );
            }}
          />
        </Card>

        {/* Pengumuman */}
        <Card padding="none" glass>
          <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-orange-50/50 to-pink-50/50">
            <h2 className="text-xl font-black text-gray-900 flex items-center font-display">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              Pengumuman
            </h2>
          </div>

          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {pengumuman.length === 0 ? (
              <p className="text-sm text-center text-gray-400 py-8">
                Tidak ada pengumuman aktif
              </p>
            ) : (
              pengumuman.map((item, idx) => {
                const style = tipeStyle[item.tipe] ?? tipeStyle.biasa;
                // Format tanggal dari tanggal_mulai
                const tgl = item.tanggal_mulai
                  ? new Date(item.tanggal_mulai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <div
                    key={item.id}
                    className={`relative pl-4 border-l-4 rounded-r-2xl p-4 hover:shadow-md transition-all duration-300 animate-slide-in ${style.border}`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div
                      className={`absolute w-3 h-3 ${style.dot} rounded-full -left-[7px] top-5 ring-4 ring-white shadow`}
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {tgl}
                    </span>
                    <h3 className="text-sm font-black text-gray-900 mt-1 mb-1">
                      {item.judul}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {item.isi}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
