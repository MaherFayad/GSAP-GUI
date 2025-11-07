interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface IframeRect {
  top: number;
  left: number;
}

interface HighlightOverlayProps {
  highlightBox: HighlightBox | null;
  iframeRect: IframeRect | null;
}

/**
 * HighlightOverlay Component
 * 
 * Displays a visual highlight box over the selected element in the iframe.
 * The box is positioned relative to the iframe's position in the parent window.
 */
export const HighlightOverlay = ({ highlightBox, iframeRect }: HighlightOverlayProps) => {
  // Don't render if we don't have both required props
  if (!highlightBox || !iframeRect) {
    return null;
  }

  // Calculate absolute position by combining iframe position and element position
  const top = iframeRect.top + highlightBox.top;
  const left = iframeRect.left + highlightBox.left;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${highlightBox.width}px`,
        height: `${highlightBox.height}px`,
        border: '2px solid #3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'all 0.1s ease-out',
        boxSizing: 'border-box'
      }}
    />
  );
};





