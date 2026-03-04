/**
 * shared/pages/Unauthorized.jsx
 *
 * Halaman yang ditampilkan ketika user authenticated tapi tidak punya akses.
 * (HTTP 403 atau role check gagal di ProtectedRoute)
 */

import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 text-center px-4">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-black">!</span>
        </div>
      </div>

      {/* Text */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Akses Ditolak</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-sm">
          Halaman ini tidak bisa diakses dengan role{" "}
          <span className="font-semibold text-gray-700 capitalize">{user?.role ?? "Anda"}</span>.
          Hubungi administrator jika ini adalah kesalahan.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => navigate("/dashboard", { replace: true })}
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
