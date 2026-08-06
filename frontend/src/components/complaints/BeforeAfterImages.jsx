import React from 'react';
import { Image as ImageIcon, Camera, CheckCircle2 } from 'lucide-react';
import { resolveImageUrl } from '../../lib/format.js';

function ImagePanel({ label, src, emptyText, icon: Icon, accent }) {
  const imageUrl = resolveImageUrl(src);

  const badgeClasses = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }[accent] || 'bg-slate-100 text-slate-600';

  return (
    <div className="flex flex-col bg-slate-50/60 rounded-xl border border-slate-200/70 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-200/70 bg-white">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${badgeClasses}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </span>
      </div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-52 sm:h-56 object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-white border border-dashed border-slate-300 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs font-semibold text-slate-400">{emptyText}</p>
          <p className="text-[11px] text-slate-300">No image was uploaded for this stage</p>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable "Before Resolution | After Resolution" image comparison.
 * Renders clean empty states when an image is missing.
 *
 * @param {object} props
 * @param {string|null|undefined} [props.beforeImage] - complaint.imageUrl (resident's before image)
 * @param {string|null|undefined} [props.afterImage] - after resolution image (data URI or URL)
 * @param {string} [props.className]
 */
export default function BeforeAfterImages({ beforeImage, afterImage, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <ImagePanel
        label="Before Resolution"
        src={beforeImage}
        emptyText="No before image"
        icon={Camera}
        accent="indigo"
      />
      <ImagePanel
        label="After Resolution"
        src={afterImage}
        emptyText="No after image"
        icon={CheckCircle2}
        accent="emerald"
      />
    </div>
  );
}
