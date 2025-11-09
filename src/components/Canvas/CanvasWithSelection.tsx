import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from '@radix-ui/react-icons';
import './Canvas.css';

interface CanvasWithSelectionProps {
  children: React.ReactNode;
  highlightBox?: { top: number; left: number; width: number; height: number } | null;
  isInspectorActive?: boolean;
  onInspectorMove?: (coords: { x: number; y: number }) => void;
  onInspectorClick?: (coords: { x: number; y: number }) => void;
}

export interface CanvasHandle {
  getZoom: () => number;
  getPan: () => { x: number; y: number };
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
}

/**
 * Canvas component with built-in zoom, pan, and selection support
 * Inspired by Webstudio's canvas implementation
 */
export const CanvasWithSelection = forwardRef<CanvasHandle, CanvasWithSelectionProps>(({
  children,
  highlightBox,
  isInspectorActive = false,
  onInspectorMove,
  onInspectorClick
}, ref) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getZoom: () => zoom,
    getPan: () => pan,
    setZoom: (newZoom: number) => setZoom(newZoom),
    setPan: (newPan: { x: number; y: number }) => setPan(newPan)
  }));

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
      setZoom(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan with middle mouse or space+drag (not when inspector is active)
    if (e.button === 1 || (e.button === 0 && e.shiftKey && !isInspectorActive)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isInspectorActive && onInspectorMove && contentRef.current) {
      // Calculate coordinates within the transformed canvas
      const rect = contentRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      onInspectorMove({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isInspectorActive && onInspectorClick && contentRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = contentRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      onInspectorClick({ x, y });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.1, prev - 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomToFit = () => {
    if (!canvasRef.current || !contentRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    const scaleX = canvasRect.width / contentRect.width;
    const scaleY = canvasRect.height / contentRect.height;
    const newZoom = Math.min(scaleX, scaleY, 1) * 0.9;
    
    setZoom(newZoom);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="ws-canvas-container" ref={canvasRef}>
      {/* Canvas Grid Background */}
      <div className="ws-canvas-grid" />
      
      {/* Canvas Viewport */}
      <div
        className={`ws-canvas-viewport ${isPanning ? 'panning' : ''} ${isInspectorActive ? 'inspector-active' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{
          cursor: isInspectorActive ? 'crosshair' : isPanning ? 'grabbing' : 'grab'
        }}
      >
        <div
          ref={contentRef}
          className="ws-canvas-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {children}
          
          {/* Highlight overlay - renders in the same coordinate space as the artboard */}
          {highlightBox && (
            <div
              className="ws-canvas-highlight"
              style={{
                position: 'absolute',
                top: `${highlightBox.top}px`,
                left: `${highlightBox.left}px`,
                width: `${highlightBox.width}px`,
                height: `${highlightBox.height}px`,
                border: '2px solid var(--ws-highlight-border)',
                backgroundColor: 'var(--ws-highlight-overlay)',
                pointerEvents: 'none',
                zIndex: 10000,
                transition: 'all 0.1s ease-out',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>
      </div>
      
      {/* Canvas Controls */}
      <div className="ws-canvas-controls">
        <div className="ws-canvas-controls-group">
          <button
            className="ws-canvas-control-button"
            onClick={handleZoomOut}
            title="Zoom Out (Ctrl + -)"
          >
            <ZoomOutIcon />
          </button>
          
          <button
            className="ws-canvas-control-button ws-canvas-zoom-display"
            onClick={handleReset}
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            className="ws-canvas-control-button"
            onClick={handleZoomIn}
            title="Zoom In (Ctrl + +)"
          >
            <ZoomInIcon />
          </button>
        </div>
        
        <div className="ws-canvas-controls-divider" />
        
        <div className="ws-canvas-controls-group">
          <button
            className="ws-canvas-control-button"
            onClick={handleZoomToFit}
            title="Zoom to Fit"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
      
      {/* Canvas Info */}
      <div className="ws-canvas-info">
        <span className="ws-canvas-info-item">
          Zoom: {Math.round(zoom * 100)}%
        </span>
        <span className="ws-canvas-info-divider">•</span>
        <span className="ws-canvas-info-item">
          Pan: {Math.round(pan.x)}, {Math.round(pan.y)}
        </span>
        <span className="ws-canvas-info-divider">•</span>
        <span className="ws-canvas-info-item">
          {isInspectorActive ? 'Inspector Mode: Click to select' : 'Hold Shift to pan'}
        </span>
      </div>
    </div>
  );
});

CanvasWithSelection.displayName = 'CanvasWithSelection';

