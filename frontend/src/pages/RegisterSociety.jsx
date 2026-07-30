import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSocietySchema } from '../schemas/auth/registerSocietySchema.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { registerSociety } from "../lib/authApi";

export default function RegisterSociety() {
  const navigate = useNavigate();
  // Logo is a File — handled outside RHF because Zod can't run in the browser on File objects cleanly
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSocietySchema),
    defaultValues: {
      societyName: '',
      registrationNumber: '',
      totalFlats: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactEmail: '',
      contactPhone: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false,
    },
  });

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data) {
    const payload = {
    societyName: data.societyName,
    registrationNumber: data.registrationNumber,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,

    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    password: data.password,

    // logo: null, 
  };

     try {
    const response = await registerSociety(payload);
    console.log('Society registered successfully:', response);
    navigate('/login'); // Redirect to login page after successful registration
     } catch (error) {
    console.error(error.response?.data || error.message);
    // Handle error (e.g., show a notification to the user)
     }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-3xl">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register your Society</h1>
          <p className="text-sm text-gray-500 mt-2">
            Fill in the details below to set up your housing society on the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

          {/* ── Section 1: Society Information ── */}
          <SectionCard title="Society Information" step="1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="society-name"
                label="Society Name"
                placeholder="Sunrise Residency"
                error={errors.societyName?.message}
                required
                className="sm:col-span-2"
                {...register('societyName')}
              />
              <Input
                id="registration-number"
                label="Registration Number"
                placeholder="MH/2024/12345"
                error={errors.registrationNumber?.message}
                required
                {...register('registrationNumber')}
              />
              <Input
                id="total-flats"
                label="Total Flats / Units"
                type="number"
                placeholder="120"
                error={errors.totalFlats?.message}
                required
                {...register('totalFlats')}
              />
            </div>
          </SectionCard>

          {/* ── Section 2: Address ── */}
          <SectionCard title="Address" step="2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="address"
                label="Street Address"
                placeholder="Plot 12, Sector 4, Andheri West"
                error={errors.address?.message}
                required
                className="sm:col-span-2"
                {...register('address')}
              />
              <Input
                id="city"
                label="City"
                placeholder="Mumbai"
                error={errors.city?.message}
                required
                {...register('city')}
              />
              <Input
                id="state"
                label="State"
                placeholder="Maharashtra"
                error={errors.state?.message}
                required
                {...register('state')}
              />
              <Input
                id="pincode"
                label="Pincode"
                placeholder="400053"
                error={errors.pincode?.message}
                required
                {...register('pincode')}
              />
            </div>
          </SectionCard>

          {/* ── Section 3: Society Contact ── */}
          <SectionCard title="Society Contact" step="3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="contact-email"
                label="Contact Email"
                type="email"
                placeholder="contact@sunriseresidency.com"
                error={errors.contactEmail?.message}
                required
                {...register('contactEmail')}
              />
              <Input
                id="contact-phone"
                label="Contact Phone"
                type="tel"
                placeholder="9876543210"
                error={errors.contactPhone?.message}
                required
                {...register('contactPhone')}
              />

              {/* Logo Upload — outside RHF, handled via local state */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Society Logo{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Upload trigger */}
                  <div>
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Section 4: Society Admin ── */}
          <SectionCard title="Society Admin" step="4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="admin-first-name"
                label="First Name"
                placeholder="Rajesh"
                error={errors.firstName?.message}
                required
                {...register('firstName')}
              />
              <Input
                id="admin-last-name"
                label="Last Name"
                placeholder="Kumar"
                error={errors.lastName?.message}
                required
                {...register('lastName')}
              />
              <Input
                id="admin-phone"
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                error={errors.phone?.message}
                required
                {...register('phone')}
              />
              <Input
                id="admin-email"
                label="Email Address"
                type="email"
                placeholder="rajesh@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Input
                id="admin-password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                required
                {...register('password')}
              />
              <Input
                id="admin-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />
            </div>
          </SectionCard>

          {/* ── Section 5: Terms & Conditions ── */}
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="terms-checkbox"
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                {...register('agreedToTerms')}
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a
                  href="#"
                  className="text-indigo-600 font-medium hover:text-indigo-800 underline underline-offset-2 transition-colors"
                >
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-indigo-600 font-medium hover:text-indigo-800 underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.agreedToTerms && (
              <p className="text-xs text-red-500 ml-7">{errors.agreedToTerms.message}</p>
            )}
          </div>

          {/* ── Submit ── */}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Registering…' : 'Register Society'}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500 pb-6">
          Already registered?{' '}
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

/* ─────────────────────────────────────────
   SectionCard — local helper component
   Renders a titled card wrapping a form section.
   Not exported; only used within this page.
───────────────────────────────────────── */
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
