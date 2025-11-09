import React, { useState, useRef } from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from '@radix-ui/react-icons';
import './Canvas.css';

interface CanvasProps {
  children: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
      setZoom(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse button or Shift + Left mouse button
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
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
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
    const newZoom = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add padding
    
    setZoom(newZoom);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="canvas-container" ref={canvasRef}>
      {/* Canvas Grid Background */}
      <div className="canvas-grid" />
      
      {/* Canvas Content */}
      <div
        className={`canvas-viewport ${isPanning ? 'panning' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          className="canvas-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Canvas Controls */}
      <div className="canvas-controls">
        <div className="canvas-controls-group">
          <button
            className="canvas-control-button"
            onClick={handleZoomOut}
            title="Zoom Out (Ctrl + -)"
          >
            <ZoomOutIcon />
          </button>
          
          <button
            className="canvas-control-button canvas-zoom-display"
            onClick={handleReset}
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            className="canvas-control-button"
            onClick={handleZoomIn}
            title="Zoom In (Ctrl + +)"
          >
            <ZoomInIcon />
          </button>
        </div>
        
        <div className="canvas-controls-divider" />
        
        <div className="canvas-controls-group">
          <button
            className="canvas-control-button"
            onClick={handleZoomToFit}
            title="Zoom to Fit"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
      
      {/* Canvas Info */}
      <div className="canvas-info">
        <span className="canvas-info-item">
          Pan: {Math.round(pan.x)}, {Math.round(pan.y)}
        </span>
        <span className="canvas-info-divider">•</span>
        <span className="canvas-info-item">
          Hold Shift or middle-click to pan
        </span>
        <span className="canvas-info-divider">•</span>
        <span className="canvas-info-item">
          Ctrl + Scroll to zoom
        </span>
      </div>
    </div>
  );
};

export default Canvas;

