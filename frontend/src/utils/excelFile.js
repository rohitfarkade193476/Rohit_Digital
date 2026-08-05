// Shared client-side validation for Excel bulk-import files.
// Used by the shared ExcelImportModal so every upload surface applies the
// same file type / size rules and template download behavior.

export const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export const MAX_EXCEL_FILE_SIZE = 5 * 1024 * 1024;

export const isExcelFile = (file) =>
  EXCEL_MIME_TYPES.includes(file.type) ||
  file.name.toLowerCase().endsWith('.xlsx') ||
  file.name.toLowerCase().endsWith('.xls');

export const validateExcelFile = (file) => {
  if (!isExcelFile(file)) {
    return {
      ok: false,
      error: 'Invalid file format. Please upload a valid .xlsx or .xls Excel file.',
    };
  }

  if (file.size > MAX_EXCEL_FILE_SIZE) {
    return { ok: false, error: 'File size exceeds 5MB limit.' };
  }

  return { ok: true, error: '' };
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const downloadCsvTemplate = (csvContent, filename) => {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
