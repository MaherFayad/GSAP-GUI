import { ReactNode } from 'react';
import './PropertiesPanel.css';

// ===== PROPERTY ROW (Horizontal grouping like ) =====
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

// ===== INLINE PROPERTY INPUT (for horizontal layouts) =====
interface InlinePropertyProps {
  label: string;
  children: ReactNode;
}

export const InlineProperty = ({ label, children }: InlinePropertyProps) => {
  return (
    <div className="inline-property">
      <div className="inline-property-label">{label}</div>
      {children}
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

