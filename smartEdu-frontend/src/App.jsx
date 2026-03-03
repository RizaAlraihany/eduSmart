import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Public Pages
import Home from "./pages/landing/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages — lazy load untuk performa
import Dashboard from "./pages/dashboard/Dashboard";
const Siswa = lazy(() => import("./pages/dashboard/Siswa"));
const Guru = lazy(() => import("./pages/dashboard/Guru"));
const Kelas = lazy(() => import("./pages/dashboard/Kelas"));
const MataPelajaran = lazy(() => import("./pages/dashboard/MataPelajaran"));
const Jadwal = lazy(() => import("./pages/dashboard/Jadwal"));
const Absensi = lazy(() => import("./pages/dashboard/Absensi"));
const Nilai = lazy(() => import("./pages/dashboard/Nilai"));
const Pembayaran = lazy(() => import("./pages/dashboard/Pembayaran"));
const Pengumuman = lazy(() => import("./pages/dashboard/Pengumuman"));

// Fallback loading saat lazy load
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

// Route hanya untuk user yang belum login
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Route hanya untuk user yang sudah login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
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

      {/* Protected — semua halaman dashboard di dalam DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="siswa"
          element={
            <Suspense fallback={<PageLoader />}>
              <Siswa />
            </Suspense>
          }
        />
        <Route
          path="guru"
          element={
            <Suspense fallback={<PageLoader />}>
              <Guru />
            </Suspense>
          }
        />
        <Route
          path="kelas"
          element={
            <Suspense fallback={<PageLoader />}>
              <Kelas />
            </Suspense>
          }
        />
        <Route
          path="mata-pelajaran"
          element={
            <Suspense fallback={<PageLoader />}>
              <MataPelajaran />
            </Suspense>
          }
        />
        <Route
          path="jadwal"
          element={
            <Suspense fallback={<PageLoader />}>
              <Jadwal />
            </Suspense>
          }
        />
        <Route
          path="absensi"
          element={
            <Suspense fallback={<PageLoader />}>
              <Absensi />
            </Suspense>
          }
        />
        <Route
          path="nilai"
          element={
            <Suspense fallback={<PageLoader />}>
              <Nilai />
            </Suspense>
          }
        />
        <Route
          path="pembayaran"
          element={
            <Suspense fallback={<PageLoader />}>
              <Pembayaran />
            </Suspense>
          }
        />
        <Route
          path="pengumuman"
          element={
            <Suspense fallback={<PageLoader />}>
              <Pengumuman />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback — semua path tidak dikenal redirect ke home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
