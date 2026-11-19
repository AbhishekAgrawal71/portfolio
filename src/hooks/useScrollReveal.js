import { useEffect } from 'react';

/**
 * useScrollReveal – Adds the `.visible` class to every `.animate-on-scroll`
 * element when it enters the viewport.
 *
 * Uses IntersectionObserver with a 10 % threshold and triggers only once
 * per element so the reveal animation doesn't replay on scroll-back.
 *
 * Call this hook once in a top-level component (e.g. App).
 */
export function useScrollReveal() {
  useEffect(() => {
    // Respect users who prefer reduced motion
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Immediately show every element without animation
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire only once
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe current elements
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Observe future elements added dynamically
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return; // element nodes only
          if (node.classList?.contains('animate-on-scroll')) {
            observer.observe(node);
          }
          // Also check children of the added node
          node.querySelectorAll?.('.animate-on-scroll').forEach((child) => {
            observer.observe(child);
          });
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

export default useScrollReveal;
