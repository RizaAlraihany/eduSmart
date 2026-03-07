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
  ClipboardList, // FIX: icon untuk Tugas
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
  { path: "/dashboard/tugas", icon: ClipboardList, label: "Tugas" },
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
  { path: "/dashboard/tugas", icon: ClipboardList, label: "Tugas" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

/**
 * FIX: Tambahkan menu Tugas untuk siswa.
 * GET /api/tugas tidak dibatasi role (semua authenticated user bisa akses).
 * Sebelumnya siswa bisa akses endpoint tapi tidak ada link di sidebar → UX buruk.
 */
const siswaMenu = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal Saya" },
  { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai Saya" },
  { path: "/dashboard/tugas", icon: ClipboardList, label: "Tugas Saya" }, // FIX: ditambahkan
  { path: "/dashboard/pembayaran", icon: DollarSign, label: "Pembayaran" },
  { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
];

const Sidebar = () => {
  const { user, isAdmin, isGuru, logout } = useAuth();

  const menu = isAdmin ? adminMenu : isGuru ? guruMenu : siswaMenu;

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">
            SmartEdu
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-600">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name ?? "—"}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={navClass}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
