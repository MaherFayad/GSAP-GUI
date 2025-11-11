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
  const [isInputDragging, setIsInputDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Handle label drag
  const handleLabelMouseDown = (e: React.MouseEvent) => {
    if (e.target === labelRef.current) {
      setIsDragging(true);
      setDragStartValue(value);
      setDragStartX(e.clientX);
      setHasMoved(false);
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    }
  };

  // Handle input field drag
  const handleInputMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    // Only start dragging if clicking on the input field, not during text editing
    if (document.activeElement !== inputRef.current) {
      setIsInputDragging(true);
      setDragStartValue(value);
      setDragStartX(e.clientX);
      setHasMoved(false);
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    }
  };

  // Handle mouse move for both label and input dragging
  useEffect(() => {
    if (!isDragging && !isInputDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      
      // Track if mouse has moved significantly
      if (Math.abs(deltaX) > 2) {
        setHasMoved(true);
      }
      
      const sensitivity = e.shiftKey ? 0.1 : e.ctrlKey ? 0.01 : 1;
      const newValue = dragStartValue + (deltaX * step * sensitivity);
      
      let clampedValue = newValue;
      if (min !== undefined) clampedValue = Math.max(min, clampedValue);
      if (max !== undefined) clampedValue = Math.min(max, clampedValue);
      
      // Round to step precision
      const roundedValue = Math.round(clampedValue / step) * step;
      onChange(roundedValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // If input was being dragged but mouse didn't move much, focus for editing
      if (isInputDragging && !hasMoved) {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      
      setIsInputDragging(false);
      setHasMoved(false);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, isInputDragging, dragStartX, dragStartValue, onChange, step, min, max, hasMoved]);

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
            onMouseDown={handleLabelMouseDown}
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
          className={`properties-input ${isInputDragging ? 'dragging' : ''}`}
          value={value}
          onChange={handleInputChange}
          onMouseDown={handleInputMouseDown}
          min={min}
          max={max}
          step={step}
          aria-label={label || 'Number input'}
          title="Click and drag to scrub value, or click to edit"
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
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [activeInput, setActiveInput] = useState<1 | 2 | null>(null);
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);

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

  // Drag handlers for input 1
  const handleInput1MouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== input1Ref.current) {
      setIsDragging1(true);
      setActiveInput(1);
      setDragStartValue(value1);
      setDragStartX(e.clientX);
      setHasMoved(false);
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    }
  };

  // Drag handlers for input 2
  const handleInput2MouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== input2Ref.current) {
      setIsDragging2(true);
      setActiveInput(2);
      setDragStartValue(value2);
      setDragStartX(e.clientX);
      setHasMoved(false);
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    }
  };

  useEffect(() => {
    if (!isDragging1 && !isDragging2) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      
      if (Math.abs(deltaX) > 2) {
        setHasMoved(true);
      }
      
      const sensitivity = e.shiftKey ? 0.1 : e.ctrlKey ? 0.01 : 1;
      const newValue = dragStartValue + (deltaX * step * sensitivity);
      
      let clampedValue = newValue;
      if (min !== undefined) clampedValue = Math.max(min, clampedValue);
      if (max !== undefined) clampedValue = Math.min(max, clampedValue);
      
      const roundedValue = Math.round(clampedValue / step) * step;
      
      if (activeInput === 1) {
        handleChange1(roundedValue);
      } else if (activeInput === 2) {
        handleChange2(roundedValue);
      }
    };

    const handleMouseUp = () => {
      if (isDragging1 && !hasMoved) {
        input1Ref.current?.focus();
        input1Ref.current?.select();
      }
      if (isDragging2 && !hasMoved) {
        input2Ref.current?.focus();
        input2Ref.current?.select();
      }
      
      setIsDragging1(false);
      setIsDragging2(false);
      setActiveInput(null);
      setHasMoved(false);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging1, isDragging2, dragStartX, dragStartValue, step, min, max, activeInput, hasMoved]);

  return (
    <div className="property-linked-inputs">
      <div className="property-input-group">
        <div className="property-input-col">
          <div className="property-input-label">{label1}</div>
        <input
          ref={input1Ref}
          type="number"
          className={`properties-input ${isDragging1 ? 'dragging' : ''}`}
          value={value1}
          onChange={(e) => handleChange1(parseFloat(e.target.value) || 0)}
          onMouseDown={handleInput1MouseDown}
          min={min}
          max={max}
          step={step}
          aria-label={label1}
          title="Click and drag to scrub value, or click to edit"
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
            ref={input2Ref}
            type="number"
            className={`properties-input ${isDragging2 ? 'dragging' : ''}`}
            value={value2}
            onChange={(e) => handleChange2(parseFloat(e.target.value) || 0)}
            onMouseDown={handleInput2MouseDown}
            min={min}
            max={max}
            step={step}
            aria-label={label2}
            title="Click and drag to scrub value, or click to edit"
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

