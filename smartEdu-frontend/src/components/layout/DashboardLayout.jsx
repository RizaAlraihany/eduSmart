import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    // flex h-screen → sidebar & main sejajar horizontal, tidak turun ke bawah
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Mobile: fixed + translate, Desktop: static flex-shrink-0 */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Tombol tutup sidebar — mobile only */}
        <button
          className="absolute top-3 right-3 z-40 p-1 rounded-md text-gray-500 hover:text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <Sidebar />
      </div>

      {/* ── Main Area (header + content) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top Header ── */}
        <header className="flex-shrink-0 flex items-center h-16 bg-white border-b border-gray-200 px-4 gap-4">
          {/* Hamburger — mobile only */}
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Notifikasi */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {/* Badge notif — hapus jika tidak perlu */}
              <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar user */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
