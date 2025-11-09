import React from 'react';

/**
 * Interface for the serialized DOM node
 */
interface SerializedNode {
  tagName: string;
  id: string;
  classes: string;
  stableSelector: string;
  children: SerializedNode[];
}

/**
 * Props for the LayerTree component
 */
interface LayerTreeProps {
  node: SerializedNode;
  onSelect: (selector: string) => void;
}

/**
 * Recursive component to display the DOM tree structure
 * Each node is clickable and will trigger the onSelect callback
 */
export const LayerTree: React.FC<LayerTreeProps> = ({ node, onSelect }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.stableSelector);
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        style={{ 
          cursor: 'pointer',
          padding: '4px 8px',
          userSelect: 'none'
        }}
      >
        {node.tagName}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div style={{ paddingLeft: '20px' }}>
          {node.children.map((child, index) => (
            <LayerTree 
              key={`${child.stableSelector}-${index}`}
              node={child} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

