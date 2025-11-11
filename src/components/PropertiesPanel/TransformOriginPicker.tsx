import React from 'react';
import './TransformOriginPicker.css';

interface TransformOriginPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const ORIGIN_POINTS = [
  { value: 'top left', position: { x: 0, y: 0 }, label: 'TL' },
  { value: 'top center', position: { x: 50, y: 0 }, label: 'TC' },
  { value: 'top right', position: { x: 100, y: 0 }, label: 'TR' },
  { value: 'center left', position: { x: 0, y: 50 }, label: 'CL' },
  { value: 'center center', position: { x: 50, y: 50 }, label: 'C' },
  { value: 'center right', position: { x: 100, y: 50 }, label: 'CR' },
  { value: 'bottom left', position: { x: 0, y: 100 }, label: 'BL' },
  { value: 'bottom center', position: { x: 50, y: 100 }, label: 'BC' },
  { value: 'bottom right', position: { x: 100, y: 100 }, label: 'BR' },
];

export const TransformOriginPicker: React.FC<TransformOriginPickerProps> = ({ value, onChange }) => {
  const normalizedValue = value.toLowerCase().trim();

  return (
    <div className="transform-origin-picker">
      <div className="transform-origin-grid">
        {ORIGIN_POINTS.map((point) => (
          <button
            key={point.value}
            className={`transform-origin-point ${normalizedValue === point.value ? 'active' : ''}`}
            onClick={() => onChange(point.value)}
            title={point.value}
            aria-label={point.value}
          >
            <div className="transform-origin-dot" />
          </button>
        ))}
        <div className="transform-origin-box" />
      </div>
    </div>
  );
};

