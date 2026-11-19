import { useState, useEffect, useCallback } from 'react';

/**
 * useTheme – Manages dark / light theme preference.
 *
 * - Reads the saved theme from `localStorage` (key: "theme").
 * - Falls back to "dark" when nothing is saved.
 * - Sets `data-theme` on <html> so CSS custom-property overrides apply.
 *
 * @returns {{ theme: string, toggleTheme: () => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync the attribute and localStorage whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // localStorage unavailable (private browsing, quota, etc.)
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}

export default useTheme;
