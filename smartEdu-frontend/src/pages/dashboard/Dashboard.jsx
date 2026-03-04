import { useAuth } from "../../hooks/useAuth";
import DashboardAdmin from "./DashboardAdmin";
import DashboardGuru from "./DashboardGuru";
import DashboardSiswa from "./DashboardSiswa";

// ─── Komponen utama ───────────────────────────────────────────────────────────
// Setiap role component mengurus fetch-nya sendiri via dedicated endpoint:
//   DashboardAdmin  → GET /api/dashboard/admin
//   DashboardGuru   → GET /api/dashboard/guru
//   DashboardSiswa  → GET /api/dashboard/siswa
//
// Dashboard.jsx hanya bertindak sebagai role-router — tidak ada fetch di sini.
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { isAdmin, isGuru, isSiswa } = useAuth();

  if (isAdmin) return <DashboardAdmin />;
  if (isGuru) return <DashboardGuru />;
  if (isSiswa) return <DashboardSiswa />;

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <p className="text-gray-400 text-sm">Role tidak dikenali.</p>
    </div>
  );
};

export default Dashboard;
