/**
 * src/features/dashboard/pages/Dashboard.jsx
 * Role-router murni. TIDAK ada fetch di sini.
 * Setiap role component mengurus fetch-nya sendiri.
 */
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardAdmin from "@/features/dashboard/pages/DashboardAdmin";
import DashboardGuru from "@/features/dashboard/pages/DashboardGuru";
import DashboardSiswa from "@/features/dashboard/pages/DashboardSiswa";

const Dashboard = () => {
  const { isAdmin, isGuru, isSiswa } = useAuth();

  if (isAdmin) return <DashboardAdmin />;
  if (isGuru) return <DashboardGuru />;
  if (isSiswa) return <DashboardSiswa />;

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <p className="text-sm text-gray-400">Role tidak dikenali.</p>
    </div>
  );
};

export default Dashboard;
