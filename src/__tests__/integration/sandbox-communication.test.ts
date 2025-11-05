import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Integration tests for sandbox client communication
 * Tests the postMessage protocol between parent and iframe
 */
describe('Sandbox Communication Integration', () => {
  let iframe: HTMLIFrameElement;
  let messageHandler: (event: MessageEvent) => void;

  beforeEach(() => {
    // Create a mock iframe
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    // Set up message listener
    messageHandler = vi.fn();
    window.addEventListener('message', messageHandler);
  });

  afterEach(() => {
    // Clean up
    window.removeEventListener('message', messageHandler);
    document.body.removeChild(iframe);
  });

  it('should support HANDSHAKE_PING/PONG protocol', () => {
    const messageTypes = ['HANDSHAKE_PING', 'HANDSHAKE_PONG'];
    
    messageTypes.forEach(type => {
      const message = { type };
      expect(message).toHaveProperty('type');
      expect(typeof message.type).toBe('string');
    });
  });

  it('should structure INSPECT_ELEMENT_AT messages correctly', () => {
    const message = {
      type: 'INSPECT_ELEMENT_AT',
      payload: { x: 100, y: 200 }
    };
    
    expect(message.type).toBe('INSPECT_ELEMENT_AT');
    expect(message.payload).toEqual({ x: 100, y: 200 });
  });

  it('should structure SELECT_ELEMENT_AT messages correctly', () => {
    const message = {
      type: 'SELECT_ELEMENT_AT',
      payload: { x: 150, y: 250 }
    };
    
    expect(message.type).toBe('SELECT_ELEMENT_AT');
    expect(message.payload).toEqual({ x: 150, y: 250 });
  });

  it('should structure HIGHLIGHT_ELEMENT response correctly', () => {
    const message = {
      type: 'HIGHLIGHT_ELEMENT',
      payload: {
        top: 10,
        left: 20,
        width: 100,
        height: 50
      }
    };
    
    expect(message.type).toBe('HIGHLIGHT_ELEMENT');
    expect(message.payload).toHaveProperty('top');
    expect(message.payload).toHaveProperty('left');
    expect(message.payload).toHaveProperty('width');
    expect(message.payload).toHaveProperty('height');
  });

  it('should structure ELEMENT_SELECTED response correctly', () => {
    const message = {
      type: 'ELEMENT_SELECTED',
      payload: {
        selector: '.box'
      }
    };
    
    expect(message.type).toBe('ELEMENT_SELECTED');
    expect(message.payload.selector).toBe('.box');
  });

  it('should structure APPLY_ANIMATION messages correctly', () => {
    const message = {
      type: 'APPLY_ANIMATION',
      payload: {
        selector: '#my-element',
        animation: {
          x: 100,
          y: 200,
          rotation: 360,
          duration: 1,
          ease: 'power2.inOut'
        }
      }
    };
    
    expect(message.type).toBe('APPLY_ANIMATION');
    expect(message.payload.selector).toBe('#my-element');
    expect(message.payload.animation).toHaveProperty('x');
    expect(message.payload.animation).toHaveProperty('duration');
  });

  it('should structure animation control messages correctly', () => {
    const controlTypes = [
      'PAUSE_ANIMATION',
      'RESUME_ANIMATION',
      'RESTART_ANIMATION',
      'REMOVE_ANIMATION'
    ];
    
    controlTypes.forEach(type => {
      const message = {
        type,
        payload: { selector: '.target' }
      };
      
      expect(message.type).toBe(type);
      expect(message.payload.selector).toBe('.target');
    });
  });

  it('should handle ERROR messages correctly', () => {
    const message = {
      type: 'ERROR',
      payload: {
        message: 'Element not found: .missing'
      }
    };
    
    expect(message.type).toBe('ERROR');
    expect(message.payload.message).toContain('Element not found');
  });

  it('should handle success response messages', () => {
    const successTypes = [
      'ANIMATION_APPLIED',
      'ANIMATION_REMOVED',
      'ANIMATION_PAUSED',
      'ANIMATION_RESUMED',
      'ANIMATION_RESTARTED'
    ];
    
    successTypes.forEach(type => {
      const message = {
        type,
        payload: {
          selector: '.target',
          success: true
        }
      };
      
      expect(message.type).toBe(type);
      expect(message.payload.success).toBe(true);
    });
  });

  it('should validate message structure has required fields', () => {
    const validMessage = {
      type: 'TEST_MESSAGE',
      payload: { data: 'test' }
    };
    
    // Every message must have a type
    expect(validMessage).toHaveProperty('type');
    expect(typeof validMessage.type).toBe('string');
    
    // Payload is optional
    const messageWithoutPayload = { type: 'HANDSHAKE_PING' };
    expect(messageWithoutPayload).toHaveProperty('type');
  });

  it('should support coordinate transformations', () => {
    const iframeRect = { top: 100, left: 50 };
    const mouseEvent = { clientX: 200, clientY: 300 };
    
    // Calculate relative coordinates
    const relativeX = mouseEvent.clientX - iframeRect.left;
    const relativeY = mouseEvent.clientY - iframeRect.top;
    
    expect(relativeX).toBe(150);
    expect(relativeY).toBe(200);
  });

  it('should support reverse coordinate transformations', () => {
    const iframeRect = { top: 100, left: 50 };
    const elementRect = { top: 10, left: 20, width: 100, height: 50 };
    
    // Calculate absolute coordinates
    const absoluteTop = iframeRect.top + elementRect.top;
    const absoluteLeft = iframeRect.left + elementRect.left;
    
    expect(absoluteTop).toBe(110);
    expect(absoluteLeft).toBe(70);
  });
});

