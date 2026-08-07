import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paperclip, X, CheckCircle2, AlertCircle, Upload, Image } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { raiseComplaintSchema, COMPLAINT_CATEGORIES } from '../../schemas/resident/complaintSchema.js';
import { createComplaint, createComplaintWithImage } from '../../lib/complaintApi.js';
import { resolveImageUrl } from '../../lib/format.js';

const PRIORITIES = [
  { value: 'LOW', label: 'Low', description: 'Minor inconvenience, not time-sensitive' },
  { value: 'MEDIUM', label: 'Medium', description: 'Moderate impact, address within a few days' },
  { value: 'HIGH', label: 'High', description: 'Significant issue, requires prompt attention' },
];

const PRIORITY_SELECTED_STYLES = {
  LOW: 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50',
  MEDIUM: 'ring-2 ring-amber-400 border-amber-400 bg-amber-50',
  HIGH: 'ring-2 ring-red-400 border-red-400 bg-red-50',
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(raiseComplaintSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'MEDIUM',
    },
  });

  const watchedPriority = watch('priority');
  const watchedFields = watch(['title', 'description', 'category']);

  useEffect(() => {
    if (duplicate) setDuplicate(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFields.title, watchedFields.description, watchedFields.category]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPEG, PNG, and WEBP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be 5 MB or smaller.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(data) {
    setServerError('');
    setImageError('');
    setDuplicate(null);

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('priority', data.priority);
        formData.append('image', imageFile);
        await createComplaintWithImage(formData);
      } else {
        await createComplaint({
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          priority: data.priority,
        });
      }
      setSubmitted(true);
    } catch (err) {
      const duplicateInfo = err?.response?.data?.errors?.existingComplaint;
      if (err?.response?.status === 409 || duplicateInfo) {
        setDuplicate(duplicateInfo);
        setServerError('');
        return;
      }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Failed to submit complaint. Please try again.';
      setServerError(message);
    }
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
                removeImage();
                reset();
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

      {/* Server-level error banner */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Duplicate complaint warning */}
      {duplicate && (
        <div role="alert" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1.5 text-sm min-w-0">
              <p className="font-bold text-amber-900">Possible duplicate complaint</p>
              <p className="text-amber-800">
                <span className="font-semibold">"{duplicate.title}"</span> — Status:{' '}
                <span className="font-semibold">
                  {duplicate.status?.replace('_', ' ')}
                </span>
              </p>
              <p className="text-amber-700">
                A similar complaint is already in progress. Please check the existing complaint before submitting.
              </p>
              {duplicate.imageUrl && (
                <div className="pt-1">
                  <img
                    src={resolveImageUrl(duplicate.imageUrl)}
                    alt="Existing complaint"
                    className="h-24 w-32 object-cover rounded-lg border border-amber-200"
                  />
                </div>
              )}
              <div className="pt-1.5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    navigate(`/resident/complaints?complaint=${encodeURIComponent(duplicate.id)}`)
                  }
                >
                  View Existing Complaint
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDuplicate(null)}
                >
                  Continue Editing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

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
              {...register('category')}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-800 ${
                errors.category
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <option value="">Select a category</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Title */}
          <Input
            id="complaint-title"
            label="Complaint Title"
            type="text"
            placeholder="e.g. Water leakage in bathroom ceiling"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="complaint-description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="complaint-description"
              rows={5}
              placeholder="Describe the issue in detail — what is happening, when it started, and how it is affecting you…"
              {...register('description')}
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
                  {errors.description.message}
                </p>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Priority */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Priority Level
          </h3>
          <input type="hidden" {...register('priority')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = watchedPriority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue('priority', p.value, { shouldValidate: true })}
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
              {errors.priority.message}
            </p>
          )}
        </div>

        {/* Card 3: Image (Optional) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Image <span className="text-slate-400 font-normal normal-case text-xs ml-1">(Optional)</span>
          </h3>

          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Complaint preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{imageFile?.name}</span>
                <span>{imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Click to attach an image</span>
              <span className="text-xs">JPEG, PNG, or WEBP — max 5 MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
            aria-label="Upload complaint image"
          />

          {imageError && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {imageError}
            </p>
          )}
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
