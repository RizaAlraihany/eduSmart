import React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin, isGuru, logout } = useAuth();

  const adminMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/siswa", icon: Users, label: "Data Siswa" },
    { path: "/dashboard/guru", icon: GraduationCap, label: "Data Guru" },
    { path: "/dashboard/kelas", icon: BookOpen, label: "Data Kelas" },
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
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal" },
    { path: "/dashboard/absensi", icon: ClipboardCheck, label: "Absensi" },
    { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai" },
    { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
  ];

  const siswaMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/jadwal", icon: Calendar, label: "Jadwal Saya" },
    { path: "/dashboard/nilai", icon: TrendingUp, label: "Nilai Saya" },
    { path: "/dashboard/pembayaran", icon: DollarSign, label: "Pembayaran" },
    { path: "/dashboard/pengumuman", icon: Megaphone, label: "Pengumuman" },
  ];

  const menuItems = isAdmin
    ? adminMenuItems
    : isGuru
      ? guruMenuItems
      : siswaMenuItems;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-primary-600 p-2 rounded-lg mr-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary-600">SmartEdu</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                active
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 ${active ? "text-primary-600" : "text-gray-400"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-1">
        <Link
          to="/dashboard/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 mr-3 text-gray-400" />
          Pengaturan
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
