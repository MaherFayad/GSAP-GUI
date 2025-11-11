import { ReactNode, useState, useRef, useEffect, cloneElement, isValidElement } from 'react';
import './PropertiesPanel.css';

// ===== PROPERTY ROW (Horizontal grouping like Rive) =====
interface PropertyRowProps {
  label?: string;
  children: ReactNode;
  columns?: number;
}

export const PropertyRow = ({ label, children, columns = 2 }: PropertyRowProps) => {
  return (
    <div className="property-row-group">
      {label && <div className="property-row-label">{label}</div>}
      <div 
        className="property-row-inline" 
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '4px'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ===== INLINE PROPERTY INPUT (for horizontal layouts with drag support) =====
interface InlinePropertyProps {
  label: string;
  children: ReactNode;
}

export const InlineProperty = ({ label, children }: InlinePropertyProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract input element and its props
  const inputElement = isValidElement(children) && children.type === 'input' ? children : null;
  
  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    
    // Only start dragging if not already focused (editing)
    if (document.activeElement !== target && target.type === 'number') {
      const currentValue = parseFloat(target.value) || 0;
      setIsDragging(true);
      setDragStartValue(currentValue);
      setDragStartX(e.clientX);
      setHasMoved(false);
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      
      if (Math.abs(deltaX) > 2) {
        setHasMoved(true);
      }

      const input = inputRef.current;
      if (!input) return;

      const step = parseFloat(input.step) || 1;
      const min = input.min ? parseFloat(input.min) : undefined;
      const max = input.max ? parseFloat(input.max) : undefined;
      const sensitivity = e.shiftKey ? 0.1 : e.ctrlKey ? 0.01 : 1;
      
      const newValue = dragStartValue + (deltaX * step * sensitivity);
      
      let clampedValue = newValue;
      if (min !== undefined) clampedValue = Math.max(min, clampedValue);
      if (max !== undefined) clampedValue = Math.min(max, clampedValue);
      
      const roundedValue = Math.round(clampedValue / step) * step;
      
      // Trigger onChange event
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      input.value = roundedValue.toString();
      input.dispatchEvent(event);
      
      // Also trigger React's onChange
      if (inputElement && typeof (inputElement.props as any).onChange === 'function') {
        (inputElement.props as any).onChange({ target: input, currentTarget: input } as any);
      }
    };

    const handleMouseUp = () => {
      const input = inputRef.current;
      
      if (!hasMoved && input) {
        input.focus();
        input.select();
      }
      
      setIsDragging(false);
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
  }, [isDragging, dragStartX, dragStartValue, hasMoved, inputElement]);

  // Clone child element and add drag handlers
  const enhancedChildren = inputElement ? cloneElement(inputElement, {
    ...inputElement.props,
    ref: inputRef,
    onMouseDown: handleMouseDown,
    className: `${inputElement.props.className || ''} ${isDragging ? 'dragging' : ''}`.trim(),
    title: 'Click and drag to scrub value, or click to edit'
  } as any) : children;

  return (
    <div className="inline-property">
      <div className="inline-property-label">{label}</div>
      {enhancedChildren}
    </div>
  );
};

// ===== PROPERTY GROUP (Section within a section) =====
interface PropertyGroupProps {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}

export const PropertyGroup = ({ title, children, compact = false }: PropertyGroupProps) => {
  return (
    <div className={`property-group ${compact ? 'property-group-compact' : ''}`}>
      {title && <div className="property-group-title">{title}</div>}
      <div className="property-group-content">
        {children}
      </div>
    </div>
  );
};

