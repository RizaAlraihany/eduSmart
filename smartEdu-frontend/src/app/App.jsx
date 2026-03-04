import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "../shared/hooks/useAuth";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import ProtectedRoute from "../shared/guards/ProtectedRoute";

// ── Non-lazy: dibutuhkan segera saat app load ─────────────────────────────────
import Home from "../features/landing/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Unauthorized from "../shared/pages/Unauthorized";

// ── Lazy — Admin only ─────────────────────────────────────────────────────────
const SiswaPage = lazy(() => import("../features/siswa/pages/SiswaPage"));
const GuruPage = lazy(() => import("../features/guru/pages/GuruPage"));
const KelasPage = lazy(() => import("../features/kelas/pages/KelasPage"));
const MataPelajaranPage = lazy(
  () => import("../features/mata-pelajaran/pages/MataPelajaranPage"),
);
const PembayaranPage = lazy(
  () => import("../features/pembayaran/pages/PembayaranPage"),
);

// ── Lazy — Admin + Guru ───────────────────────────────────────────────────────
const JadwalPage = lazy(() => import("../features/jadwal/pages/JadwalPage"));
const AbsensiPage = lazy(() => import("../features/absensi/pages/AbsensiPage"));
const NilaiPage = lazy(() => import("../features/nilai/pages/NilaiPage"));
const TugasPage = lazy(() => import("../features/tugas/pages/TugasPage"));

// ── Lazy — Semua role ─────────────────────────────────────────────────────────
const PengumumanPage = lazy(
  () => import("../features/pengumuman/pages/PengumumanPage"),
);

// ── Loader fallback ───────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── GuestRoute: redirect ke /dashboard jika sudah login ──────────────────────
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ── Route tree ────────────────────────────────────────────────────────────────
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

    {/* Protected — DashboardLayout sebagai shell */}
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

      {/* 403 page */}
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* ── Admin only ── */}
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
      <Route
        path="pembayaran"
        element={
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <PembayaranPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ── Admin + Guru ── */}
      <Route
        path="jadwal"
        element={
          <ProtectedRoute requiredRole={["admin", "guru"]}>
            <Suspense fallback={<PageLoader />}>
              <JadwalPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
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
      <Route
        path="nilai"
        element={
          <ProtectedRoute requiredRole={["admin", "guru"]}>
            <Suspense fallback={<PageLoader />}>
              <NilaiPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="tugas"
        element={
          <ProtectedRoute requiredRole={["admin", "guru"]}>
            <Suspense fallback={<PageLoader />}>
              <TugasPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ── Semua role ── */}
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

// ── App root ──────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
