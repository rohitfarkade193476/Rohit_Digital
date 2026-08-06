import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Loader2,
  FileCheck,
  Camera,
} from 'lucide-react';
import { resolveImageUrl } from '../../lib/format.js';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ResolveComplaintModal({
  isOpen,
  onClose,
  complaint,
  onResolve,
  isSubmitting = false,
  error = '',
}) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setValidationError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError('Please upload a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`Image file size must be ${MAX_FILE_SIZE_MB} MB or smaller.`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedFile) {
      setValidationError('Resolution evidence image is required.');
      return;
    }

    if (!resolutionNote.trim()) {
      setValidationError('Please provide a resolution note describing the work done.');
      return;
    }

    if (onResolve) {
      onResolve(complaint.id, {
        imageFile: selectedFile,
        imagePreviewUrl: imagePreview,
        afterImageUrl: imagePreview,
        resolutionNote: resolutionNote.trim(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Resolve Complaint</h2>
              <p className="text-xs text-slate-500 font-mono">
                {complaint.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {(error || validationError) && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error || validationError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
              <p className="font-bold text-slate-800">{complaint.title}</p>
              <p className="text-slate-500 mt-0.5">Category: {complaint.category}</p>
            </div>

            {/* Before Resolution Image (from the original complaint) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Before Resolution Image
              </label>
              {resolveImageUrl(complaint.imageUrl) ? (
                <img
                  src={resolveImageUrl(complaint.imageUrl)}
                  alt="Before resolution"
                  className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="flex items-center gap-2.5 px-4 py-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-xs text-slate-400">
                  <Camera className="w-4 h-4 shrink-0 text-slate-300" />
                  <span>No before image was attached to this complaint.</span>
                </div>
              )}
            </div>

            {/* After Resolution Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                After Resolution Image *
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Resolution preview"
                    className="max-h-48 rounded-lg object-cover shadow-sm border border-slate-200 mb-3"
                  />
                  <div className="flex items-center justify-between w-full text-xs text-slate-600 px-1">
                    <span className="truncate max-w-[200px] font-mono text-[11px]">
                      {selectedFile?.name} ({Math.round(selectedFile?.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload the after resolution image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, WebP or GIF up to {MAX_FILE_SIZE_MB}MB
                  </p>
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Resolution Note */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Resolution Details / Note *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the work done to resolve this complaint..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !resolutionNote.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Resolving…' : 'Mark as Resolved'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
