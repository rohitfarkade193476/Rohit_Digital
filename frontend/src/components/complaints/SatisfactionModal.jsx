import React, { useState } from 'react';
import { ThumbsUp, RotateCcw, X, AlertCircle, Loader2 } from 'lucide-react';
import BeforeAfterImages from './BeforeAfterImages.jsx';

/**
 * Resident satisfaction confirmation. Shows the before/after resolution images
 * and asks whether the resident is satisfied. "No" hands off to the reopen flow.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object} props.complaint
 * @param {(note: string) => void} props.onSatisfied
 * @param {() => void} props.onReopen
 * @param {boolean} [props.isSubmitting]
 * @param {string} [props.error]
 */
export default function SatisfactionModal({
  isOpen,
  onClose,
  complaint,
  onSatisfied,
  onReopen,
  isSubmitting = false,
  error = '',
}) {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Resolution Confirmation
              </h3>
              <p className="text-xs text-slate-500">Are you satisfied with this resolution?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <BeforeAfterImages
            beforeImage={complaint.imageUrl}
            afterImage={complaint.afterImageUrl || complaint.resolutionImage}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comments (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add any feedback about the resolution..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-slate-400 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onReopen}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            No, Reopen Complaint
          </button>
          <button
            type="button"
            onClick={() => onSatisfied(note.trim())}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            {isSubmitting ? 'Recording…' : 'Yes, Satisfied'}
          </button>
        </div>
      </div>
    </div>
  );
}
