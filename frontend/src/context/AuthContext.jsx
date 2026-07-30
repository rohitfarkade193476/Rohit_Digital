
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signOut, getSession } from '../lib/authApi.js';

// ---------------------------------------------------------------------------
// Role → dashboard path mapping
// ---------------------------------------------------------------------------
export const ROLE_DASHBOARD_MAP = {
  SUPER_ADMIN:   '/super-admin/dashboard',
  SOCIETY_ADMIN: '/society-admin/dashboard',
  STAFF:         '/staff/dashboard',
  RESIDENT:      '/resident/dashboard',
  VENDOR:        '/vendor/dashboard',
};

// ---------------------------------------------------------------------------
// Context creation
// ---------------------------------------------------------------------------
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while booting
  const navigate                  = useNavigate();

  // ── On mount: restore session from backend cookie ──────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const data = await getSession();
        if (!cancelled) {
          setUser(data?.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // ── login() ─────────────────────────────────────────────────────────────
  /**
   * Calls the backend sign-in endpoint, updates context state, and navigates
   * to the role-specific dashboard.
   *
   * @param {{ email: string, password: string }} credentials
   * @throws {Error} re-throws any network / credential error for the caller to display
   */
  const login = useCallback(async ({ email, password }) => {
    const data = await signIn({ email, password });

    const loggedInUser = data?.user ?? null;
    setUser(loggedInUser);

    if (loggedInUser) {
      const role        = loggedInUser.role;
      const destination = ROLE_DASHBOARD_MAP[role] ?? '/';
      navigate(destination, { replace: true });
    }
  }, [navigate]);

  // ── logout() ─────────────────────────────────────────────────────────────
  /**
   * Invalidates the backend session, clears local state, and redirects to /login.
   */
  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // Ignore network errors during logout — we clear client state anyway.
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ── Context value ────────────────────────────────────────────────────────
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Custom hook — use inside any component that needs auth state
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
