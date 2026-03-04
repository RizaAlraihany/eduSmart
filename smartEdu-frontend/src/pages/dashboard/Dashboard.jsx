import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dataService"; // ✅ named import
import DashboardAdmin from "./DashboardAdmin";
import DashboardGuru from "./DashboardGuru";
import DashboardSiswa from "./DashboardSiswa";

// ─── Full-screen loader ───────────────────────────────────────────────────────
const Loader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Memuat dashboard...</p>
    </div>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-2xl">
      ⚠️
    </div>
    <p className="text-gray-600 text-sm">Gagal memuat data dashboard.</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Coba Lagi
    </button>
  </div>
);

// ─── Komponen utama ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { isAdmin, isGuru, isSiswa } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      // ✅ dashboardService.getStats() → GET /api/dashboard → return r.data
      // r.data sudah berupa { success, message, data: {...} }
      // maka kita drill ke .data untuk dapat payload dashboard
      const res = await dashboardService.getStats();
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState onRetry={fetchDashboard} />;

  // Routing ke dashboard per role
  if (isAdmin) return <DashboardAdmin data={data} />;
  if (isGuru) return <DashboardGuru data={data} />;
  if (isSiswa) return <DashboardSiswa data={data} />;

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <p className="text-gray-400 text-sm">Role tidak dikenali.</p>
    </div>
  );
};

export default Dashboard;
