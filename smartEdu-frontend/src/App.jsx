import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// ProtectedRoute — support requiredRole
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/landing/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard utama (router ke per-role component)
import Dashboard from "./pages/dashboard/Dashboard";

// Lazy load halaman — hanya admin
const Siswa = lazy(() => import("./pages/dashboard/Siswa"));
const Guru = lazy(() => import("./pages/dashboard/Guru"));
const Kelas = lazy(() => import("./pages/dashboard/Kelas"));
const MataPelajaran = lazy(() => import("./pages/dashboard/MataPelajaran"));
const Pembayaran = lazy(() => import("./pages/dashboard/Pembayaran"));

// Lazy load halaman — admin + guru
const Jadwal = lazy(() => import("./pages/dashboard/Jadwal"));
const Absensi = lazy(() => import("./pages/dashboard/Absensi"));
const Nilai = lazy(() => import("./pages/dashboard/Nilai"));

// Lazy load halaman — semua role
const Pengumuman = lazy(() => import("./pages/dashboard/Pengumuman"));

// ─── Fallback loader ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
  </div>
);

// ─── Halaman Unauthorized ─────────────────────────────────────────────────────
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
      <span className="text-3xl">🚫</span>
    </div>
    <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
    <p className="text-gray-500 text-sm">
      Anda tidak memiliki izin untuk mengakses halaman ini.
    </p>
    <a
      href="/dashboard"
      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Kembali ke Dashboard
    </a>
  </div>
);

// ─── Route hanya untuk guest (belum login) ────────────────────────────────────
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ─── Semua routes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Home />} />

      {/* ── Guest only ── */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* ── Protected Dashboard — semua harus login ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard utama — filter per role di dalam komponen */}
        <Route index element={<Dashboard />} />

        {/* Unauthorized page */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* ── ADMIN ONLY ── */}
        <Route
          path="siswa"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <Siswa />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="guru"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <Guru />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="kelas"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <Kelas />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="mata-pelajaran"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <MataPelajaran />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="pembayaran"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <Pembayaran />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN + GURU ── */}
        <Route
          path="jadwal"
          element={
            <ProtectedRoute requiredRole={["admin", "guru"]}>
              <Suspense fallback={<PageLoader />}>
                <Jadwal />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="absensi"
          element={
            <ProtectedRoute requiredRole={["admin", "guru"]}>
              <Suspense fallback={<PageLoader />}>
                <Absensi />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="nilai"
          element={
            <ProtectedRoute requiredRole={["admin", "guru"]}>
              <Suspense fallback={<PageLoader />}>
                <Nilai />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ── SEMUA ROLE ── */}
        <Route
          path="pengumuman"
          element={
            <Suspense fallback={<PageLoader />}>
              <Pengumuman />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
