import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import ProtectedRoute from "@/shared/guards/ProtectedRoute";

import Home from "@/features/landing/pages/Home";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import Unauthorized from "@/shared/pages/Unauthorized";

// Lazy imports

// Admin only
const SiswaPage = lazy(() => import("@/features/siswa/pages/SiswaPage"));
const GuruPage = lazy(() => import("@/features/guru/pages/GuruPage"));
const KelasPage = lazy(() => import("@/features/kelas/pages/KelasPage"));
const MataPelajaranPage = lazy(
  () => import("@/features/mata-pelajaran/pages/MataPelajaranPage"),
);

// Admin + Guru only (input/kelola data)
const AbsensiPage = lazy(() => import("@/features/absensi/pages/AbsensiPage"));

// Semua role: admin, guru, siswa
const JadwalPage = lazy(() => import("@/features/jadwal/pages/JadwalPage"));
const NilaiPage = lazy(() => import("@/features/nilai/pages/NilaiPage"));
const TugasPage = lazy(() => import("@/features/tugas/pages/TugasPage"));
const PembayaranPage = lazy(
  () => import("@/features/pembayaran/pages/PembayaranPage"),
);
const PengumumanPage = lazy(
  () => import("@/features/pengumuman/pages/PengumumanPage"),
);

// Loader fallback

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// GuestRoute

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// AppRoutes

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleForbidden = () => {
      navigate("/dashboard/unauthorized", { replace: true });
    };
    window.addEventListener("auth:forbidden", handleForbidden);
    return () => window.removeEventListener("auth:forbidden", handleForbidden);
  }, [navigate]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Guest only */}
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

      {/* Protected — semua authenticated user */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Index — semua role */}
        <Route index element={<Dashboard />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* ADMIN ONLY */}
        <Route
          path="siswa"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <SiswaPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="guru"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <GuruPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="kelas"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <KelasPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="mata-pelajaran"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <MataPelajaranPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ADMIN + GURU ONLY */}
        <Route
          path="absensi"
          element={
            <ProtectedRoute requiredRole={["admin", "guru"]}>
              <Suspense fallback={<PageLoader />}>
                <AbsensiPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* SEMUA ROLE: admin, guru, siswa */}
        <Route
          path="jadwal"
          element={
            <Suspense fallback={<PageLoader />}>
              <JadwalPage />
            </Suspense>
          }
        />
        <Route
          path="nilai"
          element={
            <Suspense fallback={<PageLoader />}>
              <NilaiPage />
            </Suspense>
          }
        />
        <Route
          path="tugas"
          element={
            <Suspense fallback={<PageLoader />}>
              <TugasPage />
            </Suspense>
          }
        />
        <Route
          path="pembayaran"
          element={
            <Suspense fallback={<PageLoader />}>
              <PembayaranPage />
            </Suspense>
          }
        />
        <Route
          path="pengumuman"
          element={
            <Suspense fallback={<PageLoader />}>
              <PengumumanPage />
            </Suspense>
          }
        />

        {/* Catch-all dalam dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all global */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
