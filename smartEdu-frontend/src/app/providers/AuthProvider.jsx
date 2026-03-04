/**
 * src/app/providers/AuthProvider.jsx
 *
 * SECURITY FIX vs AuthContext.jsx lama:
 *   ❌ Lama: getStoredUser() dari localStorage → role bisa dispoofing DevTools
 *   ✅ Baru: user HANYA di memory, restore via GET /api/user (Sanctum httpOnly cookie)
 */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import authService from "../../features/auth/services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat app mount: cek sesi via server (bukan localStorage)
  useEffect(() => {
    const restore = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // 401 = tidak ada sesi → user = null, interceptor redirect ke /login
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Dengerin event dari api.js interceptor saat 401 terdeteksi
  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data?.data?.user ?? null);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    setUser(data?.data?.user ?? null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isGuru: user?.role === "guru",
    isSiswa: user?.role === "siswa",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook — import ini dari shared/hooks/useAuth.js, bukan langsung dari sini
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

export default AuthProvider;
