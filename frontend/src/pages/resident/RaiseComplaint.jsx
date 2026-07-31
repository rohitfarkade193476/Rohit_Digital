/**
 * RaiseComplaint.jsx
 * Route: /resident/complaints/new
 *
 * Frontend-only form. No API calls.
 * Backend integration point: replace handleSubmit's success simulation
 * with an API call to POST /api/resident/complaints
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Security',
  'Lift',
  'Parking',
  'Water Supply',
  'Other',
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', description: 'Minor inconvenience, not time-sensitive' },
  { value: 'MEDIUM', label: 'Medium', description: 'Moderate impact, address within a few days' },
  { value: 'HIGH', label: 'High', description: 'Significant issue, requires prompt attention' },
];

const PRIORITY_STYLES = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  HIGH: 'border-red-200 bg-red-50 text-red-700',
};

const PRIORITY_SELECTED_STYLES = {
  LOW: 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50',
  MEDIUM: 'ring-2 ring-amber-400 border-amber-400 bg-amber-50',
  HIGH: 'ring-2 ring-red-400 border-red-400 bg-red-50',
};

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [attachedFile, setAttachedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  }

  function removeFile() {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate() {
    const newErrors = {};
    if (!form.category) newErrors.category = 'Please select a category.';
    if (!form.title.trim()) {
      newErrors.title = 'Complaint title is required.';
    } else if (form.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters.';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Please describe the issue.';
    } else if (form.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.';
    }
    if (!form.priority) newErrors.priority = 'Please select a priority.';
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // ── Backend integration point ──────────────────────────────────────────
    // Replace this timeout with an actual API call:
    //
    // const formData = new FormData();
    // formData.append('category', form.category);
    // formData.append('title', form.title);
    // formData.append('description', form.description);
    // formData.append('priority', form.priority);
    // if (attachedFile) formData.append('attachment', attachedFile);
    // await residentComplaintsApi.create(formData);
    // ─────────────────────────────────────────────────────────────────────

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  }

  // ── Success State ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Complaint Submitted Successfully</h2>
          <p className="text-sm text-slate-500 mb-1">
            Your complaint has been received and will be reviewed shortly.
          </p>
          <p className="text-xs text-slate-400 mb-7">
            You will be notified when a staff member is assigned.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({ category: '', title: '', description: '', priority: 'MEDIUM' });
                setAttachedFile(null);
              }}
            >
              Raise Another
            </Button>
            <Button onClick={() => navigate('/resident/complaints')}>
              View My Complaints
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Raise a Complaint</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Describe your issue and we'll get it resolved as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Card 1: Complaint Details */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">
            Complaint Details
          </h3>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label htmlFor="complaint-category" className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="complaint-category"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-800 ${
                errors.category
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Title */}
          <Input
            id="complaint-title"
            label="Complaint Title"
            type="text"
            placeholder="e.g. Water leakage in bathroom ceiling"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            required
          />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="complaint-description" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="complaint-description"
              rows={5}
              placeholder="Describe the issue in detail — what is happening, when it started, and how it is affecting you…"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.description
                  ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
              }`}
            />
            <div className="flex items-center justify-between mt-0.5">
              {errors.description ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {form.description.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Priority */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Priority Level
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = form.priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleChange('priority', p.value)}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? PRIORITY_SELECTED_STYLES[p.value]
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? '' : 'text-slate-700'}`}>
                      {p.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-current shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs leading-snug ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.priority && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.priority}
            </p>
          )}
        </div>

        {/* Card 3: Attachment */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Attachment <span className="text-slate-400 font-normal normal-case text-xs ml-1">(Optional)</span>
          </h3>

          {attachedFile ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-2.5 min-w-0">
                <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-indigo-700 truncate">{attachedFile.name}</p>
                  <p className="text-xs text-indigo-400">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-indigo-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Click to attach a file</span>
              <span className="text-xs">Supports images, PDF, or documents</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            aria-label="File attachment"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/resident/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
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
                Submitting…
              </span>
            ) : (
              'Submit Complaint'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
