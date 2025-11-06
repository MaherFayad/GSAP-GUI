import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePostMessage } from '../usePostMessage';

describe('usePostMessage Hook', () => {
  let iframeRef: React.RefObject<HTMLIFrameElement>;
  let mockPostMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPostMessage = vi.fn();
    const mockIframe = {
      contentWindow: {
        postMessage: mockPostMessage
      }
    } as unknown as HTMLIFrameElement;

    iframeRef = { current: mockIframe };
  });

  it('should return a sendMessage function', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    
    expect(typeof result.current).toBe('function');
  });

  it('should send message with type only', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    const sendMessage = result.current;
    
    sendMessage('TEST_MESSAGE');
    
    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'TEST_MESSAGE' },
      '*'
    );
  });

  it('should send message with type and payload', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    const sendMessage = result.current;
    
    const payload = { data: 'test', value: 123 };
    sendMessage('TEST_MESSAGE', payload);
    
    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'TEST_MESSAGE', payload },
      '*'
    );
  });

  it('should not crash when iframeRef.current is null', () => {
    const nullRef = { current: null! };
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => usePostMessage(nullRef));
    const sendMessage = result.current;
    
    expect(() => sendMessage('TEST_MESSAGE')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[usePostMessage] iframe or contentWindow not available'
    );
    
    consoleSpy.mockRestore();
  });

  it('should not crash when contentWindow is null', () => {
    const noContentWindowRef = {
      current: {
        contentWindow: null
      } as unknown as HTMLIFrameElement
    };
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => usePostMessage(noContentWindowRef));
    const sendMessage = result.current;
    
    expect(() => sendMessage('TEST_MESSAGE')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[usePostMessage] iframe or contentWindow not available'
    );
    
    consoleSpy.mockRestore();
  });

  it('should return stable function reference', () => {
    const { result, rerender } = renderHook(() => usePostMessage(iframeRef));
    
    const firstFunc = result.current;
    rerender();
    const secondFunc = result.current;
    
    expect(firstFunc).toBe(secondFunc);
  });

  it('should handle different message types', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    const sendMessage = result.current;
    
    sendMessage('HANDSHAKE_PING');
    sendMessage('INSPECT_ELEMENT_AT', { x: 10, y: 20 });
    sendMessage('SELECT_ELEMENT_AT', { x: 30, y: 40 });
    sendMessage('APPLY_ANIMATION', { selector: '.box', animation: {} });
    
    expect(mockPostMessage).toHaveBeenCalledTimes(4);
  });

  it('should include falsy payload values', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    const sendMessage = result.current;

    sendMessage('UPDATE_PROGRESS', 0);
    sendMessage('TOGGLE_FLAG', false);
    sendMessage('SET_VALUE', '');

    expect(mockPostMessage).toHaveBeenNthCalledWith(1, { type: 'UPDATE_PROGRESS', payload: 0 }, '*');
    expect(mockPostMessage).toHaveBeenNthCalledWith(2, { type: 'TOGGLE_FLAG', payload: false }, '*');
    expect(mockPostMessage).toHaveBeenNthCalledWith(3, { type: 'SET_VALUE', payload: '' }, '*');
  });

  it('should handle complex payloads', () => {
    const { result } = renderHook(() => usePostMessage(iframeRef));
    const sendMessage = result.current;
    
    const complexPayload = {
      selector: '#my-element',
      animation: {
        duration: 1,
        ease: 'power2.inOut',
        x: 100,
        y: 200,
        rotation: 360
      },
      metadata: {
        timestamp: Date.now(),
        user: 'test-user'
      }
    };
    
    sendMessage('APPLY_ANIMATION', complexPayload);
    
    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'APPLY_ANIMATION', payload: complexPayload },
      '*'
    );
  });
});

