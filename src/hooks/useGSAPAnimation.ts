import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Custom hook for GSAP animations
 * @example
 * const elementRef = useGSAPAnimation<HTMLDivElement>({
 *   from: { opacity: 0, y: 20 },
 *   to: { opacity: 1, y: 0, duration: 0.5 }
 * });
 */
export const useGSAPAnimation = <T extends HTMLElement>(
  options: {
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    onComplete?: () => void;
  } = {}
) => {
  const elementRef = useRef<T>(null);
  // PERFORMANCE FIX: Store options in a ref to prevent re-running effect
  // when the options object reference changes but values are the same
  const optionsRef = useRef(options);
  
  // Update the ref when options change
  optionsRef.current = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const { from, to, onComplete } = optionsRef.current;

    if (from) {
      gsap.set(elementRef.current, from);
    }

    if (to) {
      gsap.to(elementRef.current, {
        ...to,
        onComplete,
      });
    }
    // Empty dependency array - only run once on mount
    // The animation uses optionsRef.current which always has the latest values
  }, []);

  return elementRef;
};

