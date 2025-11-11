import React, { useState, useRef, useEffect } from 'react';
import './EasingCurveEditor.css';

interface EasingCurveEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

interface BezierPoint {
  x: number;
  y: number;
}

export const EasingCurveEditor: React.FC<EasingCurveEditorProps> = ({ value, onChange, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  
  // Parse cubic-bezier values or use defaults
  const parseBezier = (val: string): [BezierPoint, BezierPoint] => {
    const match = val.match(/cubic-bezier\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
    if (match) {
      return [
        { x: parseFloat(match[1]), y: parseFloat(match[2]) },
        { x: parseFloat(match[3]), y: parseFloat(match[4]) }
      ];
    }
    // Default ease
    return [{ x: 0.25, y: 0.1 }, { x: 0.25, y: 1 }];
  };

  const [controlPoints, setControlPoints] = useState<[BezierPoint, BezierPoint]>(() => parseBezier(value));

  const CANVAS_SIZE = 200;
  const PADDING = 20;
  const CURVE_SIZE = CANVAS_SIZE - 2 * PADDING;

  const drawCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const pos = PADDING + (i * CURVE_SIZE) / 4;
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, PADDING + CURVE_SIZE);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(PADDING + CURVE_SIZE, pos);
      ctx.stroke();
    }

    // Draw curve
    ctx.strokeStyle = '#3B9EFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + CURVE_SIZE);
    
    const p1x = PADDING + controlPoints[0].x * CURVE_SIZE;
    const p1y = PADDING + CURVE_SIZE - controlPoints[0].y * CURVE_SIZE;
    const p2x = PADDING + controlPoints[1].x * CURVE_SIZE;
    const p2y = PADDING + CURVE_SIZE - controlPoints[1].y * CURVE_SIZE;
    
    ctx.bezierCurveTo(
      p1x, p1y,
      p2x, p2y,
      PADDING + CURVE_SIZE, PADDING
    );
    ctx.stroke();

    // Draw control lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + CURVE_SIZE);
    ctx.lineTo(p1x, p1y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PADDING + CURVE_SIZE, PADDING);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw control points
    [p1x, p2x].forEach((x, i) => {
      const y = i === 0 ? p1y : p2y;
      ctx.fillStyle = '#3B9EFF';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(() => {
    drawCurve();
  }, [controlPoints]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>, pointIndex: number) => {
    setIsDragging(pointIndex);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to 0-1 range
    let normalizedX = Math.max(0, Math.min(1, (x - PADDING) / CURVE_SIZE));
    let normalizedY = Math.max(0, Math.min(1, 1 - (y - PADDING) / CURVE_SIZE));

    const newPoints: [BezierPoint, BezierPoint] = [...controlPoints];
    newPoints[isDragging] = { x: normalizedX, y: normalizedY };
    setControlPoints(newPoints);
  };

  const handleMouseUp = () => {
    if (isDragging !== null) {
      // Update the ease value
      const [p1, p2] = controlPoints;
      const bezierString = `cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)})`;
      onChange(bezierString);
    }
    setIsDragging(null);
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near control points
    const [p1, p2] = controlPoints;
    const p1x = PADDING + p1.x * CURVE_SIZE;
    const p1y = PADDING + CURVE_SIZE - p1.y * CURVE_SIZE;
    const p2x = PADDING + p2.x * CURVE_SIZE;
    const p2y = PADDING + CURVE_SIZE - p2.y * CURVE_SIZE;

    const dist1 = Math.hypot(x - p1x, y - p1y);
    const dist2 = Math.hypot(x - p2x, y - p2y);

    if (dist1 < 10) {
      handleMouseDown(e, 0);
    } else if (dist2 < 10) {
      handleMouseDown(e, 1);
    }
  };

  const presets = [
    { label: 'Linear', value: 'cubic-bezier(0.00, 0.00, 1.00, 1.00)' },
    { label: 'Ease', value: 'cubic-bezier(0.25, 0.10, 0.25, 1.00)' },
    { label: 'Ease In', value: 'cubic-bezier(0.42, 0.00, 1.00, 1.00)' },
    { label: 'Ease Out', value: 'cubic-bezier(0.00, 0.00, 0.58, 1.00)' },
    { label: 'Ease In Out', value: 'cubic-bezier(0.42, 0.00, 0.58, 1.00)' },
  ];

  const applyPreset = (preset: string) => {
    setControlPoints(parseBezier(preset));
    onChange(preset);
  };

  return (
    <div className="easing-curve-editor-overlay" onClick={onClose}>
      <div className="easing-curve-editor" onClick={(e) => e.stopPropagation()}>
        <div className="easing-curve-header">
          <div className="easing-curve-title">Custom Easing Curve</div>
          <button className="easing-curve-close" onClick={onClose}>×</button>
        </div>

        <div className="easing-curve-body">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="easing-curve-canvas"
            onMouseDown={handleCanvasInteraction}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          <div className="easing-curve-presets">
            <div className="easing-curve-presets-title">Presets</div>
            <div className="easing-curve-presets-list">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  className="easing-curve-preset-btn"
                  onClick={() => applyPreset(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="easing-curve-values">
            <div className="easing-curve-value-label">
              cubic-bezier({controlPoints[0].x.toFixed(2)}, {controlPoints[0].y.toFixed(2)}, {controlPoints[1].x.toFixed(2)}, {controlPoints[1].y.toFixed(2)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

