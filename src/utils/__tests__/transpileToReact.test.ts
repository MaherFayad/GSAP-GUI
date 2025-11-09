import { describe, it, expect } from 'vitest';
import { generateReactComponent, generateReactComponentWithRef } from '../transpileToReact';

describe('generateReactComponent', () => {
  it('should generate a basic React component with imports', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 },
          parameters: { duration: 1 }
        }
      ]
    };

    const result = generateReactComponent(timelineData);
    
    // Check for imports (Babel uses double quotes)
    expect(result).toContain('import { useLayoutEffect } from "react"');
    expect(result).toContain('import gsap from "gsap"');
  });

  it('should generate an exported function with custom component name', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponent(timelineData, {
      componentName: 'CustomAnimation'
    });
    
    expect(result).toContain('export function CustomAnimation()');
  });

  it('should include useLayoutEffect hook', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 }
        }
      ]
    };

    const result = generateReactComponent(timelineData);
    
    expect(result).toContain('useLayoutEffect');
    expect(result).toContain('() =>');
  });

  it('should include GSAP timeline code inside useLayoutEffect', () => {
    const timelineData = {
      settings: { repeat: -1 },
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100, opacity: 1 },
          parameters: { duration: 1, ease: 'power2.inOut' }
        }
      ]
    };

    const result = generateReactComponent(timelineData);
    
    expect(result).toContain('gsap.timeline');
    expect(result).toContain('tl.to');
    expect(result).toContain('"repeat": -1');
  });

  it('should return JSX with container div', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponent(timelineData);
    
    expect(result).toContain('return');
    expect(result).toContain('<div');
    expect(result).toContain('className="animation-container"');
    expect(result).toContain('</div>');
  });

  it('should use custom container selector', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponent(timelineData, {
      containerSelector: '.my-custom-container'
    });
    
    expect(result).toContain('className="my-custom-container"');
  });

  it('should handle multiple tweens in the component', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'fromTo' as const,
          target_selector: '.box',
          start_properties: { x: 0 },
          end_properties: { x: 100 },
          parameters: { duration: 1 }
        },
        {
          method: 'to' as const,
          target_selector: '.circle',
          end_properties: { rotation: 360 },
          parameters: { duration: 0.5 }
        }
      ]
    };

    const result = generateReactComponent(timelineData);
    
    expect(result).toContain('tl.fromTo');
    expect(result).toContain('tl.to');
    expect(result).toContain('.box');
    expect(result).toContain('.circle');
  });

  it('should generate valid JavaScript code', () => {
    const timelineData = {
      settings: { repeat: 2, yoyo: true },
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.element',
          end_properties: { x: 100, y: 50, opacity: 0.5 },
          parameters: { duration: 1, ease: 'elastic.out' }
        }
      ]
    };

    const result = generateReactComponent(timelineData);
    
    // Basic syntax checks (Babel uses double quotes)
    expect(result).toMatch(/import.*from "react"/);
    expect(result).toMatch(/export function/);
    expect(result).toMatch(/useLayoutEffect\(/);
    expect(result).toMatch(/return/);
    
    // Should not have obvious syntax errors
    expect(result).not.toContain('undefined');
    expect(result).not.toContain('[object Object]');
  });
});

describe('generateReactComponentWithRef', () => {
  it('should generate a React component with useRef import', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 }
        }
      ]
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('import { useLayoutEffect, useRef } from "react"');
  });

  it('should create a containerRef with useRef', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('const containerRef = useRef(null)');
  });

  it('should use gsap.context with containerRef', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 }
        }
      ]
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('gsap.context');
    expect(result).toContain('containerRef');
  });

  it('should include cleanup function with ctx.revert()', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('ctx.revert');
  });

  it('should attach ref to the returned JSX element', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('ref={containerRef}');
    expect(result).toContain('<div');
    expect(result).toContain('</div>');
  });

  it('should work with custom component name', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = generateReactComponentWithRef(timelineData, {
      componentName: 'AdvancedAnimation'
    });
    
    expect(result).toContain('export function AdvancedAnimation()');
  });

  it('should handle complex timeline with multiple tweens', () => {
    const timelineData = {
      settings: { repeat: -1, yoyo: true },
      tweens: [
        {
          method: 'fromTo' as const,
          target_selector: '.box',
          start_properties: { x: 0, scale: 0 },
          end_properties: { x: 200, scale: 1 },
          parameters: { duration: 1, ease: 'power2.inOut' }
        },
        {
          method: 'to' as const,
          target_selector: '.circle',
          end_properties: { rotation: 720 },
          parameters: { duration: 2 },
          position: '+=0.5'
        }
      ]
    };

    const result = generateReactComponentWithRef(timelineData);
    
    expect(result).toContain('gsap.context');
    expect(result).toContain('tl.fromTo');
    expect(result).toContain('tl.to');
    expect(result).toContain('ctx.revert');
  });

  it('should generate valid React component structure', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.element',
          end_properties: { x: 100 }
        }
      ]
    };

    const result = generateReactComponentWithRef(timelineData);
    
    // Should have proper structure (Babel uses double quotes)
    expect(result).toMatch(/import.*from "react"/);
    expect(result).toMatch(/import.*from "gsap"/);
    expect(result).toMatch(/export function/);
    expect(result).toMatch(/const containerRef = useRef/);
    expect(result).toMatch(/useLayoutEffect/);
    expect(result).toMatch(/return.*<div/);
  });
});

describe('generateReactComponent vs generateReactComponentWithRef', () => {
  it('should generate different code for ref and non-ref versions', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 }
        }
      ]
    };

    const basicComponent = generateReactComponent(timelineData);
    const refComponent = generateReactComponentWithRef(timelineData);
    
    // Basic version should not have ref
    expect(basicComponent).not.toContain('useRef');
    expect(basicComponent).not.toContain('containerRef');
    expect(basicComponent).not.toContain('gsap.context');
    
    // Ref version should have ref
    expect(refComponent).toContain('useRef');
    expect(refComponent).toContain('containerRef');
    expect(refComponent).toContain('gsap.context');
  });

  it('both should produce valid components with same timeline data', () => {
    const timelineData = {
      settings: { repeat: 2 },
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.element',
          end_properties: { x: 100, y: 50 },
          parameters: { duration: 1, ease: 'power2.out' }
        }
      ]
    };

    const basicComponent = generateReactComponent(timelineData);
    const refComponent = generateReactComponentWithRef(timelineData);
    
    // Both should have core elements
    expect(basicComponent).toContain('export function MyAnimation()');
    expect(refComponent).toContain('export function MyAnimation()');
    
    expect(basicComponent).toContain('useLayoutEffect');
    expect(refComponent).toContain('useLayoutEffect');
    
    expect(basicComponent).toContain('gsap.timeline');
    expect(refComponent).toContain('gsap.timeline');
    
    expect(basicComponent).toContain('return');
    expect(refComponent).toContain('return');
  });
});

