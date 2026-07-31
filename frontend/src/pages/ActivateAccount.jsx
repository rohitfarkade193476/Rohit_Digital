import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck, Link2Off } from 'lucide-react';
import Button from '../components/Button.jsx';
import { activationSchema } from '../schemas/auth/activationSchema.js';
import { resetPassword } from '../lib/authApi.js';

/**
 * ActivateAccount.jsx
 * Public page — reachable from the invitation link sent by a society admin.
 *
 * The link carries a Better Auth reset token (?token=...). Submitting the form
 * calls POST /api/auth/reset-password, which sets the resident's password,
 * marks their email verified, and consumes the token.
 */

function PasswordRequirement({ met, label }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
      )}
      <span className={met ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
    </li>
  );
}

function PasswordInput({ id, label, registration, show, onToggleShow, error, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            error
              ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
          }`}
          {...registration}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
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
      <span>{message}</span>
    </div>
  );
}

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Reset token from the invitation link (?token=...)
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [activated, setActivated] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(activationSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Live password requirement checks
  const password = watch('password') || '';
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  async function onSubmit(data) {
    setServerError('');
    try {
      await resetPassword(token, data.password);
      setActivated(true);
    } catch (err) {
      const errorData = err?.response?.data;
      const code = errorData?.error?.code || errorData?.code;
      const friendlyMessages = {
        INVALID_TOKEN:
          'This activation link is invalid or has expired. Please contact your society admin to resend the invitation.',
        PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
        PASSWORD_TOO_LONG: 'Password must be at most 128 characters long.',
      };
      setServerError(
        friendlyMessages[code] ||
          errorData?.error?.message ||
          errorData?.message ||
          'Something went wrong. Please try again.'
      );
    }
  }

  // ── Missing / invalid token state ────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">Housing Portal</span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <Link2Off className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid or Missing Link</h2>
          <p className="text-sm text-slate-500 mb-6">
            This activation link is invalid or incomplete. Please use the link from your invitation
            email, or contact your society admin to resend it.
          </p>

          <Button type="button" fullWidth onClick={() => navigate('/login', { replace: true })}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // ── Success State ────────────────────────────────────────────────────────
  if (activated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">Housing Portal</span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">Account Activation Successful</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your password has been set and your account is ready. You can now sign in to your
            society portal.
          </p>

          <Button
            type="button"
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Continue to Login
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Activation Form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">Housing Portal</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Society Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set a password to activate your account and access your society dashboard.
          </p>
        </div>

        <ErrorBanner message={serverError} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-5">
          <PasswordInput
            id="activate-password"
            label="Create Password"
            registration={register('password')}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            error={errors.password?.message}
            placeholder="Create a strong password"
            required
          />

          <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Password Requirements
            </p>
            <ul className="space-y-1.5">
              <PasswordRequirement met={reqs.length} label="Minimum 8 characters" />
              <PasswordRequirement met={reqs.uppercase} label="At least one uppercase letter" />
              <PasswordRequirement met={reqs.lowercase} label="At least one lowercase letter" />
              <PasswordRequirement met={reqs.number} label="At least one number" />
            </ul>
          </div>

          <PasswordInput
            id="activate-confirm-password"
            label="Confirm Password"
            registration={register('confirmPassword')}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            error={errors.confirmPassword?.message}
            placeholder="Re-enter your password"
            required
          />

          <Button type="submit" fullWidth disabled={isSubmitting} className="mt-2">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Activating…
              </span>
            ) : (
              'Activate Account'
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
