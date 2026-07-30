import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function FlatFormModal({
  isOpen,
  onClose,
  mode = 'add',
  initialData = null,
  onSubmit,
  isSubmitting = false,
  error = '',
}) {
  const [formData, setFormData] = useState({
    flatNumber: '',
    wing: 'A',
    floor: '',
    type: 'TWO_BHK',
    status: 'OCCUPIED',
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        flatNumber: initialData.flatNumber || '',
        wing: initialData.wing || 'A',
        floor: initialData.floor || '',
        type: initialData.type || 'TWO_BHK',
        status: initialData.status || 'OCCUPIED',
      });
    } else {
      setFormData({
        flatNumber: '',
        wing: 'A',
        floor: '',
        type: 'TWO_BHK',
        status: 'OCCUPIED',
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isEdit = mode === 'edit';
  const modalTitle = isEdit ? 'Edit Flat Details' : 'Add New Flat';
  const submitButtonText = isEdit ? 'Update Flat' : 'Save Flat';

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // Send only the fields the backend expects
      onSubmit({
        flatNumber: formData.flatNumber.trim(),
        wing: formData.wing,
        floor: Number(formData.floor),
        type: formData.type,
        status: formData.status,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">{modalTitle}</h2>
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

            {/* API Error Banner */}
            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flat Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Flat Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-101"
                  value={formData.flatNumber}
                  onChange={(e) => handleChange('flatNumber', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                />
              </div>

              {/* Wing */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Wing *
                </label>
                <select
                  value={formData.wing}
                  onChange={(e) => handleChange('wing', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                >
                  <option value="A">Wing A</option>
                  <option value="B">Wing B</option>
                  <option value="C">Wing C</option>
                  <option value="D">Wing D</option>
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Floor *
                </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => handleChange("floor", Number(e.target.value))}
                  >
                    <option value="">Select Floor</option>
                    <option value={0}>Ground Floor</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                    <option value={4}>4th Floor</option>
                    <option value={5}>5th Floor</option>
                </select>

                </div>

              {/* Flat Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Flat Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                >
                  <option value="ONE_BHK">1 BHK</option>
                  <option value="TWO_BHK">2 BHK</option>
                  <option value="THREE_BHK">3 BHK</option>
                  <option value="FOUR_BHK">4 BHK</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
              >
                <option value="OCCUPIED">Occupied</option>
                <option value="VACANT">Vacant</option>
                <option value="BLOCKED">Blocked</option>
              </select>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
