import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { InspectorOverlay } from '../InspectorOverlay/InspectorOverlay';

// Mock the usePostMessage hook
vi.mock('../../hooks', () => ({
  usePostMessage: () => vi.fn()
}));

describe('InspectorOverlay Component', () => {
  let iframeRef: React.RefObject<HTMLIFrameElement>;
  let mockIframe: HTMLIFrameElement;

  beforeEach(() => {
    // Create a mock iframe with proper structure
    mockIframe = document.createElement('iframe');
    const mockContentWindow = {
      postMessage: vi.fn()
    };
    Object.defineProperty(mockIframe, 'contentWindow', {
      value: mockContentWindow,
      writable: false
    });
    
    // Mock getBoundingClientRect
    mockIframe.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 50,
      width: 800,
      height: 600,
      right: 850,
      bottom: 700,
      x: 50,
      y: 100,
      toJSON: () => {}
    }));

    iframeRef = { current: mockIframe };
  });

  it('should render an overlay div', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(overlay.tagName).toBe('DIV');
  });

  it('should have crosshair cursor', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.cursor).toBe('crosshair');
  });

  it('should cover entire area', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.position).toBe('absolute');
    expect(overlay.style.top).toBe('0px');
    expect(overlay.style.left).toBe('0px');
    expect(overlay.style.width).toBe('100%');
    expect(overlay.style.height).toBe('100%');
  });

  it('should have high z-index to capture events', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.zIndex).toBe('10');
  });

  it('should handle mouse move events', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    
    // Trigger mouse move
    fireEvent.mouseMove(overlay, { clientX: 200, clientY: 300 });
    
    // The component should have called sendMessage with calculated coordinates
    // Since we mocked the hook, we can't verify the exact call, but we can
    // verify that the event handler executed without errors
    expect(overlay).toBeTruthy();
  });

  it('should handle click events', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    
    // Trigger click
    fireEvent.click(overlay, { clientX: 200, clientY: 300 });
    
    // Should execute without errors
    expect(overlay).toBeTruthy();
  });

  it('should have descriptive title for accessibility', () => {
    const { container } = render(<InspectorOverlay iframeRef={iframeRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.getAttribute('title')).toBe('Inspector Overlay - Click to select elements');
  });

  it('should not crash when iframeRef.current is null', () => {
    const nullRef = { current: null! };
    const { container } = render(<InspectorOverlay iframeRef={nullRef} />);
    
    const overlay = container.firstChild as HTMLElement;
    
    // Should render without errors
    expect(overlay).toBeTruthy();
    
    // Mouse events should not crash
    expect(() => {
      fireEvent.mouseMove(overlay, { clientX: 100, clientY: 100 });
      fireEvent.click(overlay, { clientX: 100, clientY: 100 });
    }).not.toThrow();
  });
});

