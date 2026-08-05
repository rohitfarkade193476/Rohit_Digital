import XLSX from "xlsx";
import fs from "fs";

/**
 * Shared helpers for parsing and validating Excel bulk-import files.
 * Used by the staff and resident import modules so validation rules and
 * timezone-safe date handling stay in exactly one place.
 */

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const pad2 = (n) => String(n).padStart(2, "0");

export const normalizeText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

// Deliberately permissive: accepts any "a@b.c" style address, including
// test@example.com. No domain is hardcoded or blocked.
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 12;
};

const toDateLabel = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

// Excel stores dates as serial days since 1899-12-30. Reading them back
// through a JS Date + toISOString() shifts the calendar day in some timezones,
// so the calendar date is recovered from the (floored) serial in UTC instead.
const serialToDateLabel = (serial) => {
  const date = new Date(EXCEL_EPOCH_MS + Math.floor(serial) * 86400000);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
};

/**
 * Parses a joining/move-in style date column value (Excel serial number or a
 * string) into a YYYY-MM-DD label.
 * Returns { ok: boolean, label: string }.
 */
export const parseExcelDate = (raw) => {
  if (raw === undefined || raw === null) return { ok: true, label: "" };
  if (typeof raw === "number" && isFinite(raw)) {
    return { ok: true, label: serialToDateLabel(raw) };
  }
  const str = String(raw).trim();
  if (!str) return { ok: true, label: "" };
  const iso = str.match(ISO_DATE_RE);
  if (iso) {
    const [, y, m, d] = iso;
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
      return { ok: true, label: `${y}-${m}-${d}` };
    }
    return { ok: false, label: "" };
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return { ok: false, label: "" };
  return { ok: true, label: toDateLabel(date) };
};

/**
 * Reads the first sheet of an Excel file into an array of plain objects,
 * keyed by the header row.
 */
export const readExcelRows = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

export const removeUploadedFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to remove uploaded file ${filePath}:`, error);
  }
};
