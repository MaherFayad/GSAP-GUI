import { useCallback, type RefObject } from 'react';

/**
 * Custom hook for sending messages to an iframe via postMessage API
 * 
 * @param iframeRef - Reference to the iframe element
 * @returns sendMessage function to communicate with the iframe
 */
export function usePostMessage(iframeRef: RefObject<HTMLIFrameElement>) {
  const sendMessage = useCallback((type: string, payload?: any) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      console.warn('[usePostMessage] iframe or contentWindow not available');
      return;
    }

    const message = {
      type,
      ...(payload && { payload })
    };

    iframeRef.current.contentWindow.postMessage(message, '*');
  }, [iframeRef]);

  return sendMessage;
}



