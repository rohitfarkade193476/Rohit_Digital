import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Mail,
  Building2,
  Shield,
  User,
} from 'lucide-react';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import {
  getMyVendorProfile,
  updateMyVendorProfile,
} from '../../lib/vendorApi.js';
import { vendorProfileSchema } from '../../schemas/vendor/vendorProfileSchema.js';

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      phone: '',
      category: '',
      contractType: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isAvailable: true,
    },
  });

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getMyVendorProfile();
      const v = data.data;
      setProfile(v);
      reset({
        companyName: v.companyName || '',
        firstName: v.firstName || '',
        lastName: v.lastName || '',
        phone: v.phone || '',
        category: v.category || '',
        contractType: v.contractType || '',
        description: v.description || '',
        address: v.address || '',
        city: v.city || '',
        state: v.state || '',
        pincode: v.pincode || '',
        isAvailable: v.isAvailable,
      });
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load profile'
      );
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data) => {
    setSuccessMessage('');
    try {
      const result = await updateMyVendorProfile(data);
      const v = result.data;
      setProfile(v);
      setSuccessMessage('Vendor profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-950 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
          {profile?.firstName?.[0]?.toUpperCase() || 'V'}
        </div>
        <div className="text-center sm:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold border border-purple-500/40 uppercase tracking-wider">
              Contracted Vendor
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {profile?.status || 'Account Active'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {profile?.companyName || 'Vendor Account'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {profile?.email || 'vendor@company.com'}
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6"
      >
        {/* Account Info (read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Registration Status
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={profile?.status || '—'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
              />
              <Shield className="w-4 h-4 text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Business Details
            </h2>
            <p className="text-xs text-slate-500">
              Update your company and service information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            id="profile-company-name"
            label="Company / Business Name"
            placeholder="Apex Elevator Solutions"
            error={errors.companyName?.message}
            className="sm:col-span-2"
            {...register('companyName')}
          />
          <Input
            id="profile-category"
            label="Service Category"
            placeholder="Elevator Maintenance"
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            id="profile-contract-type"
            label="Contract Type"
            placeholder="Annual Maintenance (AMC)"
            error={errors.contractType?.message}
            {...register('contractType')}
          />
        </div>

        {/* Contact Person */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Contact Person
            </h2>
            <p className="text-xs text-slate-500">
              Who societies should contact for this business
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            id="profile-first-name"
            label="First Name"
            placeholder="Rajesh"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            id="profile-last-name"
            label="Last Name"
            placeholder="Kumar"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          <Input
            id="profile-phone"
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            id="profile-address"
            label="Street Address"
            placeholder="Plot 12, Industrial Area"
            error={errors.address?.message}
            className="sm:col-span-2"
            {...register('address')}
          />
          <Input
            id="profile-city"
            label="City"
            placeholder="Mumbai"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            id="profile-state"
            label="State"
            placeholder="Maharashtra"
            error={errors.state?.message}
            {...register('state')}
          />
          <Input
            id="profile-pincode"
            label="Pincode"
            placeholder="400053"
            error={errors.pincode?.message}
            {...register('pincode')}
          />
        </div>

        {/* About */}
        <div>
          <label
            htmlFor="profile-description"
            className="text-sm font-medium text-gray-700 block mb-1"
          >
            Description
          </label>
          <textarea
            id="profile-description"
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

        {/* Availability */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Available for work
            </p>
            <p className="text-xs text-slate-500">
              When enabled, societies can assign new work to you.
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('isAvailable')}
            />
            <span className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4" />
                Save Profile Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
