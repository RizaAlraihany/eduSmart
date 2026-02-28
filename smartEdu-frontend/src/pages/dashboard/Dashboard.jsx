import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; 
import dataService from "../../services/dataService";
import StatCard from "../../components/dashboard/StatCard";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  Megaphone,
} from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin, isGuru, isSiswa } = useAuth(); // ✅ PERBAIKAN: useAuth bukan useAuthContext
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dataService.getDashboard();
      // Handle both response structures
      const dashboardData = response.data?.data || response.data;
      setData(dashboardData);
      console.log("Dashboard data loaded:", dashboardData);
    } catch (err) {
      setError("Gagal memuat data dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user?.name}</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Admin Dashboard */}
      {isAdmin && data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Siswa"
              value={data.total_siswa || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Total Guru"
              value={data.total_guru || 0}
              icon={GraduationCap}
              color="green"
            />
            <StatCard
              title="Total Kelas"
              value={data.total_kelas || 0}
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              title="Pembayaran Pending"
              value={data.pembayaran_pending || 0}
              icon={DollarSign}
              color="orange"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Absensi Hari Ini
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary-600">
                    {data.absensi_hari_ini || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Siswa hadir</div>
                </div>
                <ClipboardCheck className="w-12 h-12 text-primary-200" />
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mata Pelajaran
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary-600">
                    {data.total_mapel || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Mata pelajaran aktif
                  </div>
                </div>
                <BookOpen className="w-12 h-12 text-primary-200" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Guru Dashboard */}
      {isGuru && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Kelas yang Diampu"
              value={data.kelas_diampu || 0}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Jadwal Hari Ini"
              value={data.jadwal_hari_ini?.length || 0}
              icon={ClipboardCheck}
              color="green"
            />
          </div>

          {/* Today's Schedule */}
          {data.jadwal_hari_ini && data.jadwal_hari_ini.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Jadwal Mengajar Hari Ini
              </h3>
              <div className="space-y-3">
                {data.jadwal_hari_ini.map((jadwal) => (
                  <div
                    key={jadwal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {jadwal.mata_pelajaran?.nama_mapel}
                      </div>
                      <div className="text-sm text-gray-600">
                        Kelas {jadwal.kelas?.nama_kelas}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </div>
                      <div className="text-sm text-gray-600">
                        {jadwal.ruangan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Siswa Dashboard */}
      {isSiswa && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Nilai Rata-rata"
              value={data.rata_rata_nilai || 0}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Pembayaran Pending"
              value={data.pembayaran_pending || 0}
              icon={DollarSign}
              color="orange"
            />
          </div>

          {/* Today's Schedule */}
          {data.jadwal_hari_ini && data.jadwal_hari_ini.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Jadwal Pelajaran Hari Ini
              </h3>
              <div className="space-y-3">
                {data.jadwal_hari_ini.map((jadwal) => (
                  <div
                    key={jadwal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {jadwal.mata_pelajaran?.nama_mapel}
                      </div>
                      <div className="text-sm text-gray-600">
                        {jadwal.guru?.nama}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </div>
                      <div className="text-sm text-gray-600">
                        {jadwal.ruangan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Grades */}
          {data.nilai_terbaru && data.nilai_terbaru.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nilai Terbaru
              </h3>
              <div className="space-y-3">
                {data.nilai_terbaru.map((nilai) => (
                  <div
                    key={nilai.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {nilai.mata_pelajaran?.nama_mapel}
                      </div>
                      <div className="text-sm text-gray-600">
                        {nilai.guru?.nama}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${
                          nilai.nilai >= 75 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {nilai.nilai}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pengumuman untuk semua role */}
      {data?.pengumuman_terbaru && data.pengumuman_terbaru.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Megaphone className="w-6 h-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Pengumuman Terbaru
            </h3>
          </div>
          <div className="space-y-4">
            {data.pengumuman_terbaru.map((pengumuman) => (
              <div
                key={pengumuman.id}
                className={`p-4 rounded-lg border-l-4 ${
                  pengumuman.tipe === "urgent"
                    ? "bg-red-50 border-red-500"
                    : pengumuman.tipe === "penting"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {pengumuman.judul}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {pengumuman.isi}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(pengumuman.tanggal_mulai).toLocaleDateString(
                        "id-ID",
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pengumuman.tipe === "urgent"
                        ? "bg-red-100 text-red-800"
                        : pengumuman.tipe === "penting"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {pengumuman.tipe}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
