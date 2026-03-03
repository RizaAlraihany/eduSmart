import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute — Guard untuk halaman yang butuh autentikasi dan/atau role tertentu.
 *
 * Props:
 *   children     - komponen yang dilindungi
 *   requiredRole - string atau array string role yang diizinkan
 *                  null = semua role authenticated bisa akses
 *
 * Contoh:
 *   <ProtectedRoute>                          ← hanya butuh login
 *   <ProtectedRoute requiredRole="admin">     ← hanya admin
 *   <ProtectedRoute requiredRole={["admin","guru"]}>  ← admin atau guru
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Tunggu proses cek auth selesai
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Belum login → redirect ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ada role requirement → cek apakah user punya role yang sesuai
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowed.includes(user?.role)) {
      return <Navigate to="/dashboard/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
