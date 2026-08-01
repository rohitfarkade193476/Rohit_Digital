import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Briefcase } from 'lucide-react';
import Button from '../Button.jsx';

const CATEGORIES = [
  'Plumbing Services',
  'Electrical Works',
  'Elevator Maintenance',
  'Security Systems',
  'Pest Control',
  'Waste Management',
  'Landscaping & Gardening',
  'Civil & Painting',
];

export default function VendorFormModal({
  isOpen,
  onClose,
  mode = 'add', // 'add' | 'edit' | 'view'
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) {
  const isView = mode === 'view';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: CATEGORIES[0],
      phone: '',
      email: '',
      status: 'INVITED',
      contractType: 'Annual Maintenance (AMC)',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || CATEGORIES[0],
        phone: initialData.phone || '',
        email: initialData.email || '',
        status: initialData.status || 'INVITED',
        contractType: initialData.contractType || 'Annual Maintenance (AMC)',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        category: CATEGORIES[0],
        phone: '',
        email: '',
        status: 'INVITED',
        contractType: 'Annual Maintenance (AMC)',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'add' ? 'Add / Invite Vendor' : mode === 'edit' ? 'Edit Vendor Details' : 'Vendor Information'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'add'
                  ? 'Send invitation link and register a new vendor'
                  : 'Manage contract and contact details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Vendor Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Vendor / Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={isView}
              {...register('name', { required: 'Vendor name is required' })}
              placeholder="e.g. Apex Elevator Solutions Pvt Ltd"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Category & Contract Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                disabled={isView}
                {...register('category', { required: true })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contract Type
              </label>
              <select
                disabled={isView}
                {...register('contractType')}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              >
                <option value="Annual Maintenance (AMC)">Annual Maintenance (AMC)</option>
                <option value="On-Call Service">On-Call Service</option>
                <option value="Project Contract">Project Contract</option>
              </select>
            </div>
          </div>

          {/* Contact Details: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isView}
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+91 98123 45678"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                disabled={isView}
                {...register('email', { required: 'Email address is required' })}
                placeholder="vendor@company.com"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Account Status
            </label>
            <select
              disabled={isView}
              {...register('status')}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value="ACTIVE">ACTIVE — Full Access</option>
              <option value="INVITED">INVITED — Pending Activation</option>
              <option value="INACTIVE">INACTIVE — Suspended</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Service Notes & SLA
            </label>
            <textarea
              rows={3}
              disabled={isView}
              {...register('notes')}
              placeholder="e.g. Emergency 24/7 response time under 2 hours."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'add'
                  ? 'Add & Send Invite'
                  : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
