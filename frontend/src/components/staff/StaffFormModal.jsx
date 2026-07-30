import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Phone, Mail, Briefcase, Building2, Calendar, ShieldCheck } from 'lucide-react';

export default function StaffFormModal({
  isOpen,
  onClose,
  mode = 'add',
  initialData = null,
  onSubmit,
  isSubmitting = false,
  error = '',
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Security',
    department: 'Security',
    joiningDate: '',
    status: 'ACTIVE',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        role: initialData.role || 'Security',
        department: initialData.department || 'Security',
        joiningDate: initialData.joiningDate || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: 'Security',
        department: 'Security',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      });
    }
    setValidationErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const modalTitle = isView
    ? 'Staff Member Details'
    : isEdit
    ? 'Edit Staff Details'
    : 'Add New Staff Member';

  const submitButtonText = isEdit ? 'Update Staff' : 'Save Staff';

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{7,12}$/.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid phone number (min 10 digits).';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.joiningDate) {
      errors.joiningDate = 'Joining date is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-set department based on role if default
      if (field === 'role') {
        if (value === 'Security') updated.department = 'Security';
        else if (value === 'Manager') updated.department = 'Management';
        else if (value === 'Cleaner') updated.department = 'Housekeeping';
        else if (value === 'Electrician' || value === 'Plumber') updated.department = 'Maintenance';
      }
      return updated;
    });

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) {
      onClose();
      return;
    }
    if (!validateForm()) {
      return;
    }
    if (onSubmit) {
      onSubmit({
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Global API / Error */}
            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={isSubmitting || isView}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${
                    validationErrors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 disabled:opacity-70`}
                />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-rose-500 mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Grid 2 Column: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98123 45678"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isSubmitting || isView}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${
                      validationErrors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 disabled:opacity-70`}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. ramesh@society.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={isSubmitting || isView}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${
                      validationErrors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 disabled:opacity-70`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {/* Grid 2 Column: Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Role *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    disabled={isSubmitting || isView}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 cursor-pointer"
                  >
                    <option value="Security">Security</option>
                    <option value="Manager">Manager</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    disabled={isSubmitting || isView}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 cursor-pointer"
                  >
                    <option value="Management">Management</option>
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid 2 Column: Joining Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Joining Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Joining Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => handleChange('joiningDate', e.target.value)}
                    disabled={isSubmitting || isView}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${
                      validationErrors.joiningDate ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 disabled:opacity-70`}
                  />
                </div>
                {validationErrors.joiningDate && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.joiningDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Status *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={isSubmitting || isView}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="INVITED">INVITED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Saving…' : submitButtonText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
