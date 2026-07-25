/**
 * authApi.js
 * Thin wrapper around the backend better-auth HTTP endpoints.
 *
 * Better-auth exposes these REST routes automatically:
 *   POST  /api/auth/sign-in/email   → login
 *   GET   /api/auth/get-session     → check active session + user
 *   POST  /api/auth/sign-out        → logout (clears the cookie)
 *
 * All calls use withCredentials (set globally on axiosInstance) so the
 * browser sends and receives the session cookie transparently.
 */
import axiosInstance from './axiosInstance.js';

/**
 * Sign in with email + password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, session: object }>}
 */
export async function signIn({ email, password }) {
  const response = await axiosInstance.post('/api/auth/sign-in/email', {
    email,
    password,
  });
  return response.data;
}

/**
 * Fetch the currently active session from the backend.
 * Returns null if there is no valid session (cookie missing / expired).
 * @returns {Promise<{ user: object, session: object } | null>}
 */
export async function getSession() {
  try {
    const response = await axiosInstance.get('/api/auth/get-session');
    // better-auth returns { user, session } when a session exists,
    // or an empty object / 401 when it does not.
    return response.data?.user ? response.data : null;
  } catch {
    return null;
  }
}

/**
 * Sign out — invalidates the server-side session and clears the cookie.
 * @returns {Promise<void>}
 */
export async function signOut() {
  await axiosInstance.post('/api/auth/sign-out');
}
