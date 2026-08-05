import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Users,
  XCircle,
  Mail,
} from 'lucide-react';
import {
  validateExcelFile,
  formatFileSize,
  downloadCsvTemplate,
} from '../../utils/excelFile.js';

// The API layer returns the full envelope ({ success, message, data }).
// Normalize to the inner payload so both envelope and bare-object callers work.
const unwrap = (response) => response?.data ?? response;

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Operation failed';

export default function ExcelImportModal({
  isOpen,
  onClose,
  title = 'Import via Excel',
  subtitle = 'Bulk import via Excel',
  description = '',
  itemNoun = 'record',
  itemNounPlural = 'records',
  columnsHint = '',
  templateCsv = '',
  templateFilename = 'import_template.csv',
  previewFunction,
  importFunction,
  previewExtraColumn,
  importLabel = 'Import',
  onSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const hasPreview = typeof previewFunction === 'function';

  const resetFile = () => {
    setSelectedFile(null);
    setFileError('');
    setPreview(null);
    setPreviewError('');
    setResult(null);
    setImportError('');
  };

  const handleClose = () => {
    resetFile();
    onClose();
  };

  const validateAndSetFile = (file) => {
    const validation = validateExcelFile(file);
    if (!validation.ok) {
      setFileError(validation.error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError('');
    setPreview(null);
    setPreviewError('');
    setResult(null);
    setImportError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleValidatePreview = async () => {
    if (!selectedFile || !previewFunction) return;
    setPreviewing(true);
    setPreviewError('');
    setPreview(null);
    try {
      const response = await previewFunction(selectedFile);
      setPreview(unwrap(response));
    } catch (err) {
      setPreviewError(getErrorMessage(err));
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !importFunction) return;
    setImporting(true);
    setImportError('');
    setResult(null);
    try {
      const response = await importFunction(selectedFile);
      setResult(unwrap(response));
    } catch (err) {
      setImportError(getErrorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  const handleDone = () => {
    if (result && onSuccess) {
      onSuccess(result, selectedFile?.name);
    }
    resetFile();
    onClose();
  };

  const hasPreviewErrors = preview && preview.invalid > 0;
  const canImport = !hasPreview || (preview && preview.valid > 0);
  const isStandardResult = result && typeof result.imported === 'number';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Intro + Template Download */}
          {(description || templateCsv) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
              {templateCsv && (
                <button
                  type="button"
                  onClick={() => downloadCsvTemplate(templateCsv, templateFilename)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template
                </button>
              )}
            </div>
          )}

          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-import-file-input"
            />
            <label htmlFor="excel-import-file-input" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-500 flex items-center justify-center mx-auto mb-3 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                Click to browse <span className="font-normal text-slate-500">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported: .xlsx, .xls (Max 5MB).
                {columnsHint && <span> Columns: {columnsHint}.</span>}
              </p>
            </label>
          </div>

          {/* File Selection / Validation Error */}
          {fileError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Preview / Import Error */}
          {previewError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{previewError}</span>
            </div>
          )}
          {importError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{importError}</span>
            </div>
          )}

          {/* File Selected Preview */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-emerald-600/70 shrink-0">({formatFileSize(selectedFile.size)})</span>
              </div>
              <button
                type="button"
                onClick={resetFile}
                disabled={importing}
                className="text-emerald-700 hover:text-emerald-900 font-semibold ml-2 shrink-0 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}

          {/* Validate / Preview Action */}
          {selectedFile && hasPreview && !preview && !result && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleValidatePreview}
                disabled={previewing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {previewing ? 'Validating…' : 'Validate / Preview'}
              </button>
            </div>
          )}

          {/* Preview Section */}
          {preview && !result && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-800">{title} Preview</h3>
                </div>
                <span className="text-xs text-slate-500">
                  Total Records: {preview.total} | Valid: {preview.valid} | Invalid: {preview.invalid}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-2.5 px-4">Row</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      {previewExtraColumn && (
                        <th className="py-2.5 px-4">{previewExtraColumn.label}</th>
                      )}
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {preview.rows.map((row) => (
                      <React.Fragment key={row.rowNumber}>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 text-xs text-slate-500">{row.rowNumber}</td>
                          <td className="py-2.5 px-4 font-medium">{row.name || '—'}</td>
                          <td className="py-2.5 px-4 text-xs">{row.email || '—'}</td>
                          {previewExtraColumn && (
                            <td className="py-2.5 px-4 text-xs">
                              {row[previewExtraColumn.accessor] || '—'}
                            </td>
                          )}
                          <td className="py-2.5 px-4">
                            {row.valid ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                                <XCircle className="w-4 h-4 text-rose-500" /> Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                        {!row.valid && row.errors.length > 0 && (
                          <tr>
                            <td
                              colSpan={4 + (previewExtraColumn ? 1 : 0)}
                              className="px-4 pb-2 text-xs text-rose-600"
                            >
                              <span className="font-semibold">Row {row.rowNumber}:</span>{' '}
                              {row.errors.join('; ')}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasPreviewErrors && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-t border-amber-200 text-xs font-medium text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                  {preview.invalid} invalid {preview.invalid === 1 ? 'record' : 'records'} will be skipped. Valid records will be imported.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleValidatePreview}
                  disabled={previewing}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {previewing ? 'Validating…' : 'Re-validate'}
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!canImport || importing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  {importing ? 'Importing…' : importLabel}
                </button>
              </div>
            </div>
          )}

          {/* Direct upload action (no preview endpoint) */}
          {selectedFile && !hasPreview && !preview && !result && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {importing ? 'Uploading…' : importLabel}
              </button>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="border border-emerald-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-900">
                    {isStandardResult ? `${title} Successful` : 'Upload Successful'}
                  </h3>
                </div>
              </div>

              {isStandardResult ? (
                <>
                  <div className="grid grid-cols-3 gap-3 p-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{result.total}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Created</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{result.imported}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skipped</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{result.failed}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-2 text-sm text-slate-600">
                    {result.imported > 0 &&
                      `${result.imported} ${result.imported === 1 ? itemNoun : itemNounPlural} imported successfully.`}
                    {result.failed > 0 &&
                      ` ${result.failed} ${result.failed === 1 ? 'record could' : 'records could'} not be imported.`}
                  </div>

                  {(result.invited > 0 || result.invitationFailed > 0) && (
                    <div className="px-4 py-2 flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Activation emails sent: {result.invited}
                        {result.invitationFailed > 0 && ` (${result.invitationFailed} failed to send)`}.
                        Imported {itemNounPlural} can activate their account through the emailed link.
                      </span>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="px-4 pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Skipped / Failed Rows
                      </p>
                      <div className="space-y-1.5">
                        {result.errors.map((error, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700"
                          >
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>
                              <span className="font-semibold">Row {error.row}:</span> {error.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-600">
                  {typeof result.count === 'number'
                    ? `${result.count} ${result.count === 1 ? itemNoun : itemNounPlural} uploaded successfully.`
                    : 'The file was uploaded successfully.'}
                </div>
              )}

              <div className="flex items-center justify-end px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleDone}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!result && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={importing}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
