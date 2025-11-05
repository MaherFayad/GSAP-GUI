import { type RefObject } from 'react';
import { usePostMessage } from '../../hooks';

interface InspectorOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement>;
}

/**
 * InspectorOverlay Component
 * 
 * Provides an interactive overlay on top of the sandbox iframe that captures
 * mouse events for element inspection and selection.
 */
export const InspectorOverlay = ({ iframeRef }: InspectorOverlayProps) => {
  const sendMessage = usePostMessage(iframeRef);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if iframe ref is available
    if (!iframeRef.current) {
      return;
    }

    // Get the iframe's bounding box
    const rect = iframeRef.current.getBoundingClientRect();
    
    // Calculate the mouse coordinates relative to the iframe
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Send mouse position to sandbox for element highlighting
    sendMessage('INSPECT_ELEMENT_AT', { x, y });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Check if iframe ref is available
    if (!iframeRef.current) {
      return;
    }

    // Get the iframe's bounding box
    const rect = iframeRef.current.getBoundingClientRect();
    
    // Calculate the click coordinates relative to the iframe
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('[InspectorOverlay] Selecting element at:', { x, y });

    // Send click position to sandbox for element selection
    sendMessage('SELECT_ELEMENT_AT', { x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        cursor: 'crosshair',
        // Note: NO pointer-events: none - we want to capture events
      }}
      title="Inspector Overlay - Click to select elements"
    />
  );
};

