import { NavLink } from "react-router-dom";
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
  School,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";

const adminMenu = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { path: "/dashboard/siswa", icon: Users, label: "Data Siswa" },
  { path: "/dashboard/guru", icon: GraduationCap, label: "Data Guru" },
  { path: "/dashboard/kelas", icon: School, label: "Data Kelas" },
  { path: "/dashboard/mata-pelajaran", icon: BookOpen, label: "Mata Pelajaran"},
  { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal" },
  { path: "/dashboard/absensi", icon: ClipboardCheck, label: "Absensi" },
  { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai" },
  { path: "/dashboard/pembayaran", icon: DollarSign, label: "Pembayaran" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

const guruMenu = [
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

const siswaMenu = [
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

const Sidebar = () => {
  const { user, isAdmin, isGuru, logout } = useAuth();

  const menu = isAdmin ? adminMenu : isGuru ? guruMenu : siswaMenu;

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="w-64 flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <School className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-black text-gray-900">SmartEdu</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={navClass}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
