import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  School,
} from "lucide-react";

// ─── Menu per role ────────────────────────────────────────────────────────────
const adminMenuItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { path: "/dashboard/siswa", icon: Users, label: "Data Siswa" },
  { path: "/dashboard/guru", icon: GraduationCap, label: "Data Guru" },
  { path: "/dashboard/kelas", icon: School, label: "Data Kelas" },
  {
    path: "/dashboard/mata-pelajaran",
    icon: BookOpen,
    label: "Mata Pelajaran",
  },
  { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal" },
  { path: "/dashboard/absensi", icon: ClipboardCheck, label: "Absensi" },
  { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai" },
  { path: "/dashboard/pembayaran", icon: DollarSign, label: "Pembayaran" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

const guruMenuItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal" },
  { path: "/dashboard/absensi", icon: ClipboardCheck, label: "Absensi" },
  { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

const siswaMenuItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal Saya" },
  { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai Saya" },
  { path: "/dashboard/pembayaran", icon: DollarSign, label: "Pembayaran" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

// ─── Komponen ─────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user, isAdmin, isGuru, logout } = useAuth();

  const menuItems = isAdmin
    ? adminMenuItems
    : isGuru
      ? guruMenuItems
      : siswaMenuItems;

  // Kelas aktif / tidak aktif untuk NavLink
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* ── Logo ── */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
        <div className="bg-primary-600 p-2 rounded-lg mr-3">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-primary-600">SmartEdu</span>
      </div>

      {/* ── User Info ── */}
      <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact === true} // exact match hanya untuk item yang ditandai
            className={navClass}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-0.5 flex-shrink-0">
        <NavLink to="/dashboard/pengaturan" className={navClass}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>Pengaturan</span>
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
