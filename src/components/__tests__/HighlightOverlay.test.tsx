import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HighlightOverlay } from '../HighlightOverlay/HighlightOverlay';

describe('HighlightOverlay Component', () => {
  it('should not render when highlightBox is null', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={null}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render when iframeRect is null', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={null}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render overlay when both props are provided', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 5, left: 15 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toBeTruthy();
  });

  it('should calculate correct absolute position', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 5, left: 15 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    // Expected: iframeRect.top + highlightBox.top = 5 + 10 = 15
    // Expected: iframeRect.left + highlightBox.left = 15 + 20 = 35
    expect(overlay.style.top).toBe('15px');
    expect(overlay.style.left).toBe('35px');
  });

  it('should apply correct dimensions', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 150, height: 200 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.width).toBe('150px');
    expect(overlay.style.height).toBe('200px');
  });

  it('should have pointer-events none to allow interaction with elements below', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.pointerEvents).toBe('none');
  });

  it('should have high z-index to appear above other elements', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.zIndex).toBe('9999');
  });

  it('should apply transition for smooth animation', () => {
    const { container } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.transition).toContain('0.1s');
  });

  it('should update position when highlightBox changes', () => {
    const { container, rerender } = render(
      <HighlightOverlay
        highlightBox={{ top: 10, left: 20, width: 100, height: 50 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    let overlay = container.firstChild as HTMLElement;
    expect(overlay.style.top).toBe('10px');
    expect(overlay.style.left).toBe('20px');
    
    rerender(
      <HighlightOverlay
        highlightBox={{ top: 30, left: 40, width: 100, height: 50 }}
        iframeRect={{ top: 0, left: 0 }}
      />
    );
    
    overlay = container.firstChild as HTMLElement;
    expect(overlay.style.top).toBe('30px');
    expect(overlay.style.left).toBe('40px');
  });
});

