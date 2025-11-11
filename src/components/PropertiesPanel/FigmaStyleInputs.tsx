import React, { useState, useRef, useEffect } from 'react';
import './FigmaStyleInputs.css';

interface FigmaNumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: React.ReactNode;
}

export const FigmaNumberInput: React.FC<FigmaNumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  icon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartValue = useRef<number>(0);

  const handleLabelMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartValue.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const delta = dragStartY.current - e.clientY;
    const newValue = dragStartValue.current + delta * step;
    const clampedValue = min !== undefined && max !== undefined 
      ? Math.max(min, Math.min(max, newValue))
      : newValue;
    onChange(Number(clampedValue.toFixed(2)));
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleValueClick = () => {
    setIsEditing(true);
    setTempValue(value.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      const clampedValue = min !== undefined && max !== undefined 
        ? Math.max(min, Math.min(max, numValue))
        : numValue;
      onChange(clampedValue);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value.toString());
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="figma-input-row">
      <label 
        className="figma-input-label"
        onMouseDown={handleLabelMouseDown}
        title="Click and drag to adjust"
      >
        {icon && <span className="figma-input-icon">{icon}</span>}
        {label}
      </label>
      <div className="figma-input-value-container">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="figma-input-field"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
          />
        ) : (
          <div className="figma-input-value" onClick={handleValueClick}>
            <span className="figma-input-number">{value}</span>
            {unit && <span className="figma-input-unit">{unit}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

interface FigmaLinkedInputsProps {
  label: string;
  values: [number, number] | [number, number, number, number];
  onChange: (values: number[]) => void;
  labels?: string[];
  icon?: React.ReactNode;
}

export const FigmaLinkedInputs: React.FC<FigmaLinkedInputsProps> = ({
  label,
  values,
  onChange,
  labels,
  icon
}) => {
  const [isLinked, setIsLinked] = useState(true);

  const handleValueChange = (index: number, newValue: number) => {
    if (isLinked) {
      // Update all values
      onChange(values.map(() => newValue));
    } else {
      // Update single value
      const newValues = [...values];
      newValues[index] = newValue;
      onChange(newValues);
    }
  };

  return (
    <div className="figma-linked-inputs">
      <div className="figma-input-header">
        <label className="figma-input-label">
          {icon && <span className="figma-input-icon">{icon}</span>}
          {label}
        </label>
        <button
          className={`figma-link-btn ${isLinked ? 'linked' : ''}`}
          onClick={() => setIsLinked(!isLinked)}
          title={isLinked ? 'Unlink values' : 'Link values'}
        >
          {isLinked ? '🔗' : '🔓'}
        </button>
      </div>
      <div className="figma-input-grid">
        {values.map((val, index) => (
          <FigmaNumberInput
            key={index}
            label={labels?.[index] || ''}
            value={val}
            onChange={(newVal) => handleValueChange(index, newVal)}
          />
        ))}
      </div>
    </div>
  );
};

interface FigmaSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export const FigmaSelect: React.FC<FigmaSelectProps> = ({
  label,
  value,
  options,
  onChange,
  icon
}) => {
  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className="figma-input-row">
      <label className="figma-input-label">
        {icon && <span className="figma-input-icon">{icon}</span>}
        {label}
      </label>
      <select
        className="figma-select-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface FigmaColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export const FigmaColorInput: React.FC<FigmaColorInputProps> = ({
  label,
  value,
  onChange,
  icon
}) => {
  return (
    <div className="figma-input-row">
      <label className="figma-input-label">
        {icon && <span className="figma-input-icon">{icon}</span>}
        {label}
      </label>
      <div className="figma-color-input-container">
        <input
          type="color"
          className="figma-color-swatch"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="figma-color-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

