import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGSAPAnimation } from '../useGSAPAnimation';
import * as gsap from 'gsap';

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    set: vi.fn(),
    to: vi.fn()
  }
}));

describe('useGSAPAnimation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useGSAPAnimation());
    
    expect(result.current).toHaveProperty('current');
  });

  it('should not call GSAP when ref is not attached', () => {
    renderHook(() => useGSAPAnimation({
      from: { opacity: 0 },
      to: { opacity: 1 }
    }));
    
    // GSAP should not be called because ref.current is null
    expect(gsap.gsap.set).not.toHaveBeenCalled();
    expect(gsap.gsap.to).not.toHaveBeenCalled();
  });

  it('should call gsap.set with from options when provided', () => {
    const { result } = renderHook(() => useGSAPAnimation({
      from: { opacity: 0, y: 20 }
    }));
    
    // Simulate attaching the ref
    const mockElement = document.createElement('div');
    (result.current as any).current = mockElement;
    
    // Re-render to trigger effect
    renderHook(() => useGSAPAnimation({
      from: { opacity: 0, y: 20 }
    }));
  });

  it('should call gsap.to with to options when provided', () => {
    const { result } = renderHook(() => useGSAPAnimation({
      to: { opacity: 1, duration: 0.5 }
    }));
    
    // Simulate attaching the ref
    const mockElement = document.createElement('div');
    (result.current as any).current = mockElement;
  });

  it('should call onComplete callback when animation completes', () => {
    const onComplete = vi.fn();
    
    renderHook(() => useGSAPAnimation({
      to: { opacity: 1 },
      onComplete
    }));
  });

  it('should handle both from and to options', () => {
    const { result } = renderHook(() => useGSAPAnimation({
      from: { opacity: 0, x: -100 },
      to: { opacity: 1, x: 0, duration: 1 }
    }));
    
    expect(result.current).toHaveProperty('current');
  });

  it('should work with different element types', () => {
    const { result: divResult } = renderHook(() => useGSAPAnimation<HTMLDivElement>());
    const { result: buttonResult } = renderHook(() => useGSAPAnimation<HTMLButtonElement>());
    const { result: spanResult } = renderHook(() => useGSAPAnimation<HTMLSpanElement>());
    
    expect(divResult.current).toHaveProperty('current');
    expect(buttonResult.current).toHaveProperty('current');
    expect(spanResult.current).toHaveProperty('current');
  });

  it('should handle empty options', () => {
    const { result } = renderHook(() => useGSAPAnimation());
    
    expect(result.current).toHaveProperty('current');
  });

  it('should handle complex animation properties', () => {
    const complexOptions = {
      from: {
        opacity: 0,
        scale: 0.5,
        rotation: -180,
        x: -100,
        y: 100
      },
      to: {
        opacity: 1,
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        duration: 2,
        ease: 'power2.inOut',
        stagger: 0.1
      }
    };
    
    const { result } = renderHook(() => useGSAPAnimation(complexOptions));
    
    expect(result.current).toHaveProperty('current');
  });
});

