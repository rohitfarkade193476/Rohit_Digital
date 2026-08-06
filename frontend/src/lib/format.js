export const ASSIGNMENT_STATUS_LABELS = {
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const COMPLAINT_STATUS_LABELS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency',
};

/**
 * Format an ISO date string / Date into "25 Jul 2026".
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string / Date into "25 Jul 2026, 09:30 AM".
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Turn a backend-relative image path (e.g. "/uploads/complaints/xyz.jpg") into
 * an absolute URL the browser can load. Data URIs, blob URLs, and absolute
 * http(s) URLs pass through unchanged. Returns null for falsy input.
 * @param {string|null|undefined} src
 * @returns {string|null}
 */
export function resolveImageUrl(src) {
  if (!src) return null;
  if (/^(data:|blob:|https?:)/i.test(src)) return src;
  if (String(src).startsWith('/uploads/')) {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    return `${base}${src}`;
  }
  return src;
}
