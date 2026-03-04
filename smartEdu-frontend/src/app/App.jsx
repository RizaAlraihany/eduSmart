/**
 * src/app/App.jsx
 *
 * DashboardLayout di-inject SEKALI di sini via nested route.
 * Child pages render lewat <Outlet /> — TIDAK boleh import DashboardLayout sendiri.
 */
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "../shared/hooks/useAuth";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import ProtectedRoute from "../shared/guards/ProtectedRoute";

// Pages (tidak lazy — dibutuhkan segera)
import Home from "../features/landing/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Unauthorized from "../shared/pages/Unauthorized";

// Lazy — Admin only
const SiswaPage = lazy(() => import("../features/siswa/pages/SiswaPage"));
const GuruPage = lazy(() => import("../features/guru/pages/GuruPage"));
const KelasPage = lazy(() => import("../features/kelas/pages/KelasPage"));
const MataPelajaranPage = lazy(
  () => import("../features/mata-pelajaran/pages/MataPelajaranPage"),
);
const PembayaranPage = lazy(
  () => import("../features/pembayaran/pages/PembayaranPage"),
);

// Lazy — Admin + Guru
const JadwalPage = lazy(() => import("../features/jadwal/pages/JadwalPage"));
const AbsensiPage = lazy(() => import("../features/absensi/pages/AbsensiPage"));
const NilaiPage = lazy(() => import("../features/nilai/pages/NilaiPage"));

// Lazy — Semua role
const PengumumanPage = lazy(
  () => import("../features/pengumuman/pages/PengumumanPage"),
);

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
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

    {/* Protected — DashboardLayout inject SEKALI */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* Admin only */}
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

      {/* Admin + Guru + Siswa */}
      <Route
        path="jadwal"
        element={
          <ProtectedRoute requiredRole={["admin", "guru", "siswa"]}>
            <Suspense fallback={<PageLoader />}>
              <JadwalPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="nilai"
        element={
          <ProtectedRoute requiredRole={["admin", "guru", "siswa"]}>
            <Suspense fallback={<PageLoader />}>
              <NilaiPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin + Guru */}
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

      {/* Admin + Siswa */}
      <Route
        path="pembayaran"
        element={
          <ProtectedRoute requiredRole={["admin", "siswa"]}>
            <Suspense fallback={<PageLoader />}>
              <PembayaranPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Semua role */}
      <Route
        path="pengumuman"
        element={
          <Suspense fallback={<PageLoader />}>
            <PengumumanPage />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
