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

  useEffect(() => {
    if (!elementRef.current) return;

    const { from, to, onComplete } = options;

    if (from) {
      gsap.set(elementRef.current, from);
    }

    if (to) {
      gsap.to(elementRef.current, {
        ...to,
        onComplete,
      });
    }
  }, [options]);

  return elementRef;
};

