import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Building2, CheckCircle2, Save, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SOCIETY_ADMIN: 'Society Admin',
  STAFF: 'Staff Member',
  RESIDENT: 'Resident',
  VENDOR: 'Contracted Vendor',
};

export default function Profile() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 98765 43210');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User Account';
  const fullName = user?.firstName
    ? `${user.firstName} ${user?.lastName || ''}`.trim()
    : 'Authenticated User';

  const handleSaveContact = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('Contact phone number updated successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
          {user?.firstName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-center sm:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40 uppercase tracking-wider">
              {roleLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Account Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{fullName}</h1>
          <p className="text-xs text-slate-300 mt-1">{user?.email || 'user@society.com'}</p>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Account Profile Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Your account identity details registered in the portal</p>
          </div>
        </div>

        <form onSubmit={handleSaveContact} className="space-y-5">
          {/* First & Last Name (Read-only System Fields) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.firstName || 'User'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.lastName || ''}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@society.com'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role & Society Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Assigned System Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={roleLabel}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold pr-10 cursor-not-allowed"
                />
                <Shield className="w-4 h-4 text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Housing Society
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.society?.name || 'Green Valley Housing Society'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium pr-10 cursor-not-allowed"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
