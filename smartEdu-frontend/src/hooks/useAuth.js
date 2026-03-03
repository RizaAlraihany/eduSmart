import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Custom hook untuk mengakses auth state dan actions.
 *
 * Usage:
 *   const { user, isAuthenticated, isAdmin, isGuru, isSiswa, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }

  return context;
};

export default useAuth;
