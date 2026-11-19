/**
 * Utility helpers for the portfolio site.
 */

/**
 * Smoothly scroll to a section by its DOM id.
 *
 * @param {string} id - The id attribute of the target element (without '#').
 */
export function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Resolve an image path.
 * - Absolute URLs and data URIs are returned as-is.
 * - Relative paths are prefixed so Vite's public-dir resolution works.
 *
 * @param {string} path
 * @returns {string}
 */
export function getImageUrl(path) {
  if (!path) return '';
  // Already absolute or data URI
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  // Ensure leading slash so Vite resolves from /public
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Format an ISO date string into a human-readable form.
 *
 * @param {string} dateString - e.g. "2025-06-01" or "June 2025"
 * @param {object} [options]  - Intl.DateTimeFormat options override
 * @returns {string}          - e.g. "June 2025"
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';

  // If the string is already a readable label like "June 2025", return as-is
  if (!/^\d{4}/.test(dateString)) return dateString;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      ...options,
    });
  } catch {
    return dateString;
  }
}

/**
 * Check whether a URL points to an external domain.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isExternalUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}
