import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MailCheck, ShieldCheck } from 'lucide-react';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { registerVendorSchema } from '../../schemas/vendor/registerVendorSchema.js';
import { registerVendor } from '../../lib/vendorApi.js';

/**
 * RegisterVendor.jsx
 * Public vendor self-registration page.
 *
 * Submits to POST /api/vendors/register. The backend creates the vendor
 * account and emails an activation link (?token=...) which reuses the shared
 * /activate-account page to set the vendor's password.
 */

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

function SectionCard({ title, step, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function RegisterVendor() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerVendorSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      category: '',
      contractType: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  async function onSubmit(data) {
    setServerError('');
    try {
      const response = await registerVendor(data);
      setRegisteredEmail(response.data?.email || data.email);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.';
      setServerError(message);
    }
  }

  // ── Success state: activation email sent ────────────────────────────────
  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">
              Housing Portal
            </span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Registration Successful
          </h2>
          <p className="text-sm text-slate-500 mb-2">
            Your vendor account for{' '}
            <span className="font-semibold text-slate-700">{registeredEmail}</span>{' '}
            has been created.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            An activation email has been sent to your inbox. Use the link in the
            email to set your password and activate your account before you can
            sign in.
          </p>

          <Button
            type="button"
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">
              Housing Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Registration</h1>
          <p className="text-sm text-gray-500 mt-2">
            Register your business to receive and manage service assignments
            from housing societies.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <ErrorBanner message={serverError} />

          {/* ── Section 1: Business Information ── */}
          <SectionCard title="Business Information" step="1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="vendor-company-name"
                label="Company / Business Name"
                placeholder="Apex Elevator Solutions"
                error={errors.companyName?.message}
                required
                className="sm:col-span-2"
                {...register('companyName')}
              />
              <Input
                id="vendor-category"
                label="Service Category"
                placeholder="Elevator Maintenance"
                error={errors.category?.message}
                required
                {...register('category')}
              />
              <Input
                id="vendor-contract-type"
                label="Contract Type (optional)"
                placeholder="Annual Maintenance (AMC)"
                error={errors.contractType?.message}
                {...register('contractType')}
              />
            </div>
          </SectionCard>

          {/* ── Section 2: Contact Person ── */}
          <SectionCard title="Contact Person" step="2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="vendor-first-name"
                label="First Name"
                placeholder="Rajesh"
                error={errors.firstName?.message}
                required
                {...register('firstName')}
              />
              <Input
                id="vendor-last-name"
                label="Last Name"
                placeholder="Kumar"
                error={errors.lastName?.message}
                required
                {...register('lastName')}
              />
              <Input
                id="vendor-phone"
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                error={errors.phone?.message}
                required
                {...register('phone')}
              />
              <Input
                id="vendor-email"
                label="Email Address"
                type="email"
                placeholder="contact@apexelevators.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
            </div>
          </SectionCard>

          {/* ── Section 3: Business Address (optional) ── */}
          <SectionCard title="Business Address (optional)" step="3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="vendor-address"
                label="Street Address"
                placeholder="Plot 12, Industrial Area, Andheri West"
                error={errors.address?.message}
                className="sm:col-span-2"
                {...register('address')}
              />
              <Input
                id="vendor-city"
                label="City"
                placeholder="Mumbai"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                id="vendor-state"
                label="State"
                placeholder="Maharashtra"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                id="vendor-pincode"
                label="Pincode"
                placeholder="400053"
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>
          </SectionCard>

          {/* ── Section 4: About the Service ── */}
          <SectionCard title="About the Service" step="4">
            <div>
              <label
                htmlFor="vendor-description"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Description{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="vendor-description"
                rows={3}
                placeholder="Describe the services your business provides..."
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description
                    ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.description.message}
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              You will receive an activation email to set your password.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register as Vendor'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500 pb-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
