import { describe, it, expect } from 'vitest';
import { convertJsonToGsapString } from '../transpileToString';

describe('convertJsonToGsapString', () => {
  it('should create a basic timeline with empty settings', () => {
    const timelineData = {
      settings: {},
      tweens: []
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('const tl = gsap.timeline({});');
  });

  it('should create a timeline with settings', () => {
    const timelineData = {
      settings: {
        repeat: -1,
        yoyo: true
      },
      tweens: []
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('const tl = gsap.timeline(');
    expect(result).toContain('"repeat": -1');
    expect(result).toContain('"yoyo": true');
  });

  it('should handle a "to" tween', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100, opacity: 1 },
          parameters: { duration: 1, ease: 'power2.inOut' }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.to(".box"');
    expect(result).toContain('"x": 100');
    expect(result).toContain('"opacity": 1');
    expect(result).toContain('"duration": 1');
    expect(result).toContain('ease: "power2.inOut"');
  });

  it('should handle a "from" tween', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'from' as const,
          target_selector: '.circle',
          start_properties: { y: -100, opacity: 0 },
          parameters: { duration: 0.5 }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.from(".circle"');
    expect(result).toContain('"y": -100');
    expect(result).toContain('"opacity": 0');
    expect(result).toContain('"duration": 0.5');
  });

  it('should handle a "fromTo" tween', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'fromTo' as const,
          target_selector: '.box',
          start_properties: { x: 0, opacity: 0 },
          end_properties: { x: 100, opacity: 1 },
          parameters: { duration: 1, ease: 'power2.inOut' }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.fromTo(".box"');
    expect(result).toContain('"x": 0');
    expect(result).toContain('"x": 100');
    expect(result).toContain('"opacity": 0');
    expect(result).toContain('"opacity": 1');
    expect(result).toContain('ease: "power2.inOut"');
  });

  it('should handle a "set" tween', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'set' as const,
          target_selector: '.background',
          end_properties: { backgroundColor: '#ff0000' }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.set(".background"');
    expect(result).toContain('"backgroundColor": "#ff0000"');
  });

  it('should handle position parameter with string', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 },
          parameters: { duration: 1 },
          position: '+=0.5'
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain(', "+=0.5"');
  });

  it('should handle position parameter with number', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 },
          parameters: { duration: 1 },
          position: 0
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain(', 0');
  });

  it('should handle multiple tweens', () => {
    const timelineData = {
      settings: { repeat: 2 },
      tweens: [
        {
          method: 'fromTo' as const,
          target_selector: '.box',
          start_properties: { x: 0 },
          end_properties: { x: 100 },
          parameters: { duration: 1, ease: 'power2.inOut' },
          position: 0
        },
        {
          method: 'to' as const,
          target_selector: '.circle',
          end_properties: { rotation: 360 },
          parameters: { duration: 0.5, ease: 'bounce.out' },
          position: '+=0.2'
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.fromTo(".box"');
    expect(result).toContain('tl.to(".circle"');
    expect(result).toContain('"rotation": 360');
  });

  it('should throw error for invalid timeline data', () => {
    expect(() => convertJsonToGsapString(null as any)).toThrow('Invalid timeline data');
    expect(() => convertJsonToGsapString({} as any)).toThrow('Invalid timeline data');
    expect(() => convertJsonToGsapString({ tweens: null } as any)).toThrow('Invalid timeline data');
  });

  it('should handle timeline with no settings', () => {
    const timelineData = {
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('const tl = gsap.timeline({});');
    expect(result).toContain('tl.to(".box"');
  });

  it('should handle tweens with no parameters', () => {
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

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('tl.to(".box"');
    expect(result).toContain('"x": 100');
  });

  it('should handle ease property correctly', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 },
          parameters: { ease: 'elastic.out' }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('ease: "elastic.out"');
  });

  it('should handle complex properties with nested objects', () => {
    const timelineData = {
      settings: {},
      tweens: [
        {
          method: 'to' as const,
          target_selector: '.box',
          end_properties: { x: 100 },
          parameters: { 
            duration: 1,
            stagger: { 
              amount: 0.5, 
              from: 'center' 
            }
          }
        }
      ]
    };

    const result = convertJsonToGsapString(timelineData);
    expect(result).toContain('"stagger"');
    expect(result).toContain('"amount": 0.5');
    expect(result).toContain('"from": "center"');
  });
});

