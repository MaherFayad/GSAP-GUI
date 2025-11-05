import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import Sandbox from '../Sandbox/Sandbox';

describe('Sandbox Component', () => {
  it('should render an iframe with srcDoc', () => {
    const srcDoc = '<h1>Test Content</h1>';
    const { container } = render(<Sandbox srcDoc={srcDoc} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('srcdoc')).toBe(srcDoc);
  });

  it('should have sandbox attribute set to allow-scripts', () => {
    const { container } = render(<Sandbox srcDoc="<div>Test</div>" />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('should call onLoad when iframe loads', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <Sandbox srcDoc="<div>Test</div>" onLoad={onLoad} />
    );
    
    const iframe = container.querySelector('iframe');
    iframe?.dispatchEvent(new Event('load'));
    
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it('should forward ref correctly', () => {
    const ref = createRef<HTMLIFrameElement>();
    render(<Sandbox ref={ref} srcDoc="<div>Test</div>" />);
    
    expect(ref.current).toBeTruthy();
    expect(ref.current?.tagName).toBe('IFRAME');
  });

  it('should have correct styles', () => {
    const { container } = render(<Sandbox srcDoc="<div>Test</div>" />);
    
    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.style.width).toBe('100%');
    expect(iframe.style.height).toBe('100%');
    // Check that border-related styles are set (React may render 'none' differently)
    expect(iframe.style.borderWidth || iframe.style.border).toBeTruthy();
  });

  it('should have proper title attribute for accessibility', () => {
    const { container } = render(<Sandbox srcDoc="<div>Test</div>" />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('Sandbox Preview');
  });

  it('should update srcDoc when prop changes', () => {
    const { container, rerender } = render(<Sandbox srcDoc="<div>First</div>" />);
    
    let iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('srcdoc')).toBe('<div>First</div>');
    
    rerender(<Sandbox srcDoc="<div>Second</div>" />);
    
    iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('srcdoc')).toBe('<div>Second</div>');
  });
});

