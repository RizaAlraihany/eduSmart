import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import authService from "@/features/auth/services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flag untuk cegah race condition
  const isLoggedInRef = useRef(false);

  // Restore sesi saat app mount 
  useEffect(() => {
    const restore = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!isLoggedInRef.current) {
          setUser(currentUser);
        }
      } catch {
        if (!isLoggedInRef.current) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Listen event auth:logout dari api.js interceptor 
  useEffect(() => {
    const handleForceLogout = () => {
      isLoggedInRef.current = false;
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  // Auth actions 
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const loggedUser = data?.data?.user ?? null;
    // Tandai bahwa user sudah login via action — cegah restore() override.
    isLoggedInRef.current = !!loggedUser;
    setUser(loggedUser);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    const loggedUser = data?.data?.user ?? null;
    isLoggedInRef.current = !!loggedUser;
    setUser(loggedUser);
    return data;
  }, []);

  const logout = useCallback(async () => {
    isLoggedInRef.current = false;
    await authService.logout();
    setUser(null);
  }, []);

  // Context value 
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

export default AuthProvider;
