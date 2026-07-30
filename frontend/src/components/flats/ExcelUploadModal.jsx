import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { uploadFlatsExcel } from '../../lib/flatsApi';
import { uploadResidentsExcel } from "../../lib/residentApi";
export default function ExcelUploadModal({ isOpen, onClose, onUploadSuccess,
  uploadFunction,
  title = "Upload Excel",}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");

      const response = await uploadFunction(selectedFile);

      alert(response?.message || "Upload successful!");

      if (onUploadSuccess) {
        onUploadSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800"> {title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUploadSubmit}>
          <div className="p-6 space-y-4">
            {/* Drag & Drop Box */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-500 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                  Click to browse <span className="font-normal text-slate-500">or drag and drop</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Accepted formats: .xlsx, .xls (Max 5MB)</p>
              </label>
            </div>

            {/* File Selected Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-emerald-700 hover:text-emerald-900 ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="px-6 pb-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
