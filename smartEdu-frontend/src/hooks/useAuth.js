import { useContext } from 'react';
import { AuthContext } from "../contexts/AuthContext";

/**
 * Custom hook untuk mengakses auth state dan actions.
 * Wrapper dari useAuthContext agar import lebih simpel:
 *
 * import { useAuth } from '../hooks/useAuth';
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  return AuthContext();
};

export default useAuth;
