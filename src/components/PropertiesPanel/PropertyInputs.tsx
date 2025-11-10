import { useState, useRef, useEffect } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ResetIcon,
  LockClosedIcon,
  LockOpen1Icon,
  CopyIcon
} from '@radix-ui/react-icons';

// ===== NUMBER INPUT WITH SCRUBBING =====
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  onReset?: () => void;
  defaultValue?: number;
}

export const NumberInput = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit,
  label,
  onReset,
  defaultValue
}: NumberInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === labelRef.current) {
      setIsDragging(true);
      setDragStartValue(value);
      setDragStartX(e.clientX);
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const sensitivity = e.shiftKey ? 0.1 : 1;
      const newValue = dragStartValue + (deltaX * step * sensitivity);
      
      let clampedValue = newValue;
      if (min !== undefined) clampedValue = Math.max(min, clampedValue);
      if (max !== undefined) clampedValue = Math.min(max, clampedValue);
      
      onChange(Math.round(clampedValue / step) * step);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartValue, onChange, step, min, max]);

  const handleIncrement = () => {
    let newValue = value + step;
    if (max !== undefined) newValue = Math.min(max, newValue);
    onChange(newValue);
  };

  const handleDecrement = () => {
    let newValue = value - step;
    if (min !== undefined) newValue = Math.max(min, newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const canReset = defaultValue !== undefined && value !== defaultValue;

  return (
    <div className="property-number-input">
      {label && (
        <div className="property-input-header">
          <div 
            ref={labelRef}
            className={`property-label ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            title="Drag to scrub value"
          >
            {label}
          </div>
          {canReset && onReset && (
            <button 
              className="property-reset-btn"
              onClick={onReset}
              title="Reset to default"
            >
              <ResetIcon />
            </button>
          )}
        </div>
      )}
      <div className="property-input-wrapper">
        <input
          ref={inputRef}
          type="number"
          className="properties-input"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          aria-label={label || 'Number input'}
        />
        {unit && <div className="properties-unit">{unit}</div>}
        <div className="property-stepper">
          <button 
            className="property-stepper-btn" 
            onClick={handleIncrement}
            aria-label="Increment value"
            title="Increment"
          >
            <ChevronUpIcon />
          </button>
          <button 
            className="property-stepper-btn" 
            onClick={handleDecrement}
            aria-label="Decrement value"
            title="Decrement"
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== LINKED NUMBER INPUTS (for X/Y, Width/Height) =====
interface LinkedNumberInputsProps {
  value1: number;
  value2: number;
  onChange1: (value: number) => void;
  onChange2: (value: number) => void;
  label1: string;
  label2: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  linkable?: boolean;
}

export const LinkedNumberInputs = ({
  value1,
  value2,
  onChange1,
  onChange2,
  label1,
  label2,
  min,
  max,
  step = 1,
  unit,
  linkable = true
}: LinkedNumberInputsProps) => {
  const [isLinked, setIsLinked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (value2 !== 0) {
      setAspectRatio(value1 / value2);
    }
  }, []);

  const handleChange1 = (newValue: number) => {
    onChange1(newValue);
    if (isLinked && value2 !== 0) {
      onChange2(newValue / aspectRatio);
    }
  };

  const handleChange2 = (newValue: number) => {
    onChange2(newValue);
    if (isLinked && newValue !== 0) {
      onChange1(newValue * aspectRatio);
    }
  };

  const toggleLink = () => {
    if (!isLinked && value2 !== 0) {
      setAspectRatio(value1 / value2);
    }
    setIsLinked(!isLinked);
  };

  return (
    <div className="property-linked-inputs">
      <div className="property-input-group">
        <div className="property-input-col">
          <div className="property-input-label">{label1}</div>
        <input
          type="number"
          className="properties-input"
          value={value1}
          onChange={(e) => handleChange1(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          aria-label={label1}
        />
        </div>
        
        {linkable && (
        <button 
          className={`property-link-btn ${isLinked ? 'linked' : ''}`}
          onClick={toggleLink}
          title={isLinked ? 'Unlink values' : 'Link values'}
          aria-label={isLinked ? 'Unlink values' : 'Link values'}
        >
          {isLinked ? <LockClosedIcon /> : <LockOpen1Icon />}
        </button>
        )}
        
        <div className="property-input-col">
          <div className="property-input-label">{label2}</div>
          <input
            type="number"
            className="properties-input"
            value={value2}
            onChange={(e) => handleChange2(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            aria-label={label2}
          />
        </div>
      </div>
      {unit && <div className="property-unit-label">{unit}</div>}
    </div>
  );
};

// ===== COLOR PICKER =====
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  onCopy?: () => void;
}

export const ColorPicker = ({ value, onChange, label, onCopy }: ColorPickerProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    if (onCopy) onCopy();
  };

  return (
    <div className="property-color-picker">
      {label && <div className="property-label">{label}</div>}
      <div className="property-color-wrapper">
        <div className="properties-color-swatch" onClick={() => colorInputRef.current?.click()}>
          <div 
            className="properties-color-swatch-inner"
            style={{ background: value }}
          />
        </div>
        <input
          type="text"
          className="properties-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          aria-label={label || 'Color value'}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ display: 'none' }}
          aria-label="Color picker"
        />
        <button 
          className="property-icon-btn"
          onClick={handleCopy}
          title="Copy color"
          aria-label="Copy color"
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
};

// ===== SELECT DROPDOWN =====
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  label?: string;
}

export const Select = ({ value, onChange, options, label }: SelectProps) => {
  return (
    <div className="property-select">
      {label && <div className="property-label">{label}</div>}
      <select
        className="properties-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label || 'Select option'}
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

// ===== TEXT INPUT =====
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
}

export const TextInput = ({ value, onChange, label, placeholder, multiline }: TextInputProps) => {
  return (
    <div className="property-text-input">
      {label && <div className="property-label">{label}</div>}
      {multiline ? (
        <textarea
          className="properties-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          aria-label={label || placeholder || 'Text area input'}
        />
      ) : (
        <input
          type="text"
          className="properties-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label || placeholder || 'Text input'}
        />
      )}
    </div>
  );
};

// ===== CHECKBOX =====
interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export const Checkbox = ({ value, onChange, label }: CheckboxProps) => {
  return (
    <label className="property-checkbox">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="property-checkbox-label">{label}</span>
    </label>
  );
};

// ===== SLIDER =====
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  showValue?: boolean;
}

export const Slider = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 0.01, 
  label,
  showValue = true 
}: SliderProps) => {
  return (
    <div className="property-slider">
      {label && <div className="property-label">{label}</div>}
      <div className="property-slider-wrapper">
        <input
          type="range"
          className="properties-range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          aria-label={label || 'Slider'}
        />
        {showValue && (
          <input
            type="number"
            className="properties-input properties-input-small"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            aria-label={`${label || 'Slider'} value`}
          />
        )}
      </div>
    </div>
  );
};

