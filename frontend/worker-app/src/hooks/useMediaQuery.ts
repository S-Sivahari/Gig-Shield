import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive viewport detection using matchMedia API
 * @param query - Media query string (e.g., '(min-width: 769px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      console.warn('matchMedia not supported, defaulting to mobile layout');
      return false; // Default to mobile
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia(query);

    // Debounced listener to prevent excessive re-renders
    let timeoutId: number;
    const listener = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setMatches(e.matches);
      }, 100);
    };

    media.addEventListener('change', listener);

    return () => {
      clearTimeout(timeoutId);
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
