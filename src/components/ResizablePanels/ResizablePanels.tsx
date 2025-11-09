import React, { useState, useRef, useEffect } from 'react';
import './ResizablePanels.css';

interface ResizablePanelsProps {
  children: React.ReactNode;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children }) => {
  return <div className="resizable-container">{children}</div>;
};

interface PanelProps {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  defaultSize,
  minSize = 200,
  maxSize = 600,
  children,
  className = '',
}) => {
  const [size] = useState(defaultSize);
  
  return (
    <div 
      className={`panel ${className}`}
      style={{ 
        width: size ? `${size}px` : 'auto',
        minWidth: `${minSize}px`,
        maxWidth: `${maxSize}px`,
        flex: size ? '0 0 auto' : '1 1 auto'
      }}
      data-size={size}
    >
      {children}
    </div>
  );
};

interface PanelResizerProps {
  onResize?: (delta: number) => void;
  direction?: 'horizontal' | 'vertical';
}

export const PanelResizer: React.FC<PanelResizerProps> = ({ 
  onResize,
  direction = 'horizontal' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      
      if (onResize) {
        onResize(delta);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);
  
  const ariaOrientation = direction === 'horizontal' ? 'horizontal' : 'vertical';
  
  return (
    <div 
      className={`panel-resizer panel-resizer-${direction} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={ariaOrientation}
    >
      <div className="panel-resizer-handle" />
    </div>
  );
};

interface EditorLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  canvas: React.ReactNode;
  header?: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  leftPanel,
  rightPanel,
  bottomPanel,
  canvas,
  header,
}) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  
  const handleLeftResize = (delta: number) => {
    setLeftPanelWidth(prev => Math.max(200, Math.min(600, prev + delta)));
  };
  
  const handleRightResize = (delta: number) => {
    setRightPanelWidth(prev => Math.max(200, Math.min(600, prev - delta)));
  };
  
  const handleBottomResize = (delta: number) => {
    setBottomPanelHeight(prev => Math.max(150, Math.min(500, prev - delta)));
  };
  
  return (
    <div className="editor-layout">
      {header && <div className="editor-header">{header}</div>}
      
      <div className="editor-main">
        {/* Left Panel */}
        {leftPanel && (
          <>
            <div 
              className="panel panel-left" 
              style={{ width: `${leftPanelWidth}px` }}
            >
              {leftPanel}
            </div>
            <PanelResizer direction="horizontal" onResize={handleLeftResize} />
          </>
        )}
        
        {/* Center Area (Canvas + Bottom Panel) */}
        <div className="editor-center">
          <div className="editor-canvas-area">
            {canvas}
          </div>
          
          {bottomPanel && (
            <>
              <PanelResizer direction="vertical" onResize={handleBottomResize} />
              <div 
                className="panel panel-bottom"
                style={{ height: `${bottomPanelHeight}px` }}
              >
                {bottomPanel}
              </div>
            </>
          )}
        </div>
        
        {/* Right Panel */}
        {rightPanel && (
          <>
            <PanelResizer direction="horizontal" onResize={handleRightResize} />
            <div 
              className="panel panel-right"
              style={{ width: `${rightPanelWidth}px` }}
            >
              {rightPanel}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

