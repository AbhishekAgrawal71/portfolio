import { useState, useEffect } from 'react';

/**
 * useScrollSpy – Tracks which section is currently visible in the viewport.
 *
 * @param {string[]} sectionIds - Array of DOM element IDs to observe.
 * @param {object}   [options]
 * @param {string}   [options.rootMargin='-20% 0px -60% 0px'] - IntersectionObserver rootMargin.
 * @returns {string} The ID of the currently active (most visible) section.
 */
export function useScrollSpy(sectionIds = [], options = {}) {
  const { rootMargin = '-20% 0px -60% 0px' } = options;
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

  useEffect(() => {
    if (!sectionIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sectionIds, rootMargin]);

  return activeSection;
}

export default useScrollSpy;
