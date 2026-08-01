
import axiosInstance from './axiosInstance.js';

/**
 * Sign in with email and password.
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


export async function registerSociety(data) {
  const response = await axiosInstance.post(
    "/api/society/register",
    data
  );

  return response.data;
}

/**
 * Set a new password using a reset/activation token.
 * @param {string} token - Token from the activation link (?token=...)
 * @param {string} newPassword
 * @returns {Promise<{ status: boolean }>}
 */
export async function resetPassword(token, newPassword) {
  const response = await axiosInstance.post('/api/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
}