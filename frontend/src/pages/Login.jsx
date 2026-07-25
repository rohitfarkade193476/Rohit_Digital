import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth/loginSchema.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Login.jsx
 * Public login page — all roles.
 *
 * Validation : React Hook Form + Zod (loginSchema)
 * Auth       : calls AuthContext.login() → backend /api/auth/sign-in/email
 *              backend determines role → AuthContext redirects to dashboard
 */
export default function Login() {
  const { login, isAuthenticated, user } = useAuth();

  // Backend / network-level error message (separate from field validation)
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ── If the user is already authenticated, they should never see this page.
  //    App.jsx renders <GuestRoute> around /login which handles this redirect,
  //    but we keep a safety fallback here too — the AuthContext redirects on login().

  async function onSubmit(data) {
    setServerError('');
    try {
      await login({ email: data.email, password: data.password });
      // On success, AuthContext.login() navigates away — no more work needed here.
    } catch (err) {
      // better-auth returns error details in err.response.data
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setServerError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Server-level error banner */}
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {/* Error icon */}
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <div className="flex items-center justify-end">
            <a
              href="#"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                {/* Inline spinner */}
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Managing a new society?{' '}
          <Link
            to="/register-society"
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
