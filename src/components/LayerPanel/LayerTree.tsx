import React, { useState } from 'react';
import { ChevronRightIcon, ComponentInstanceIcon, CodeIcon } from '@radix-ui/react-icons';
import './LayerPanel.css';

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
  selectedSelector?: string | null;
  depth?: number;
}

/**
 * Recursive component to display the DOM tree structure
 */
export const LayerTree: React.FC<LayerTreeProps> = ({ 
  node, 
  onSelect, 
  selectedSelector = null,
  depth = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedSelector === node.stableSelector;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.stableSelector);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Get icon based on tag type
  const getIcon = () => {
    if (['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav'].includes(node.tagName.toLowerCase())) {
      return <ComponentInstanceIcon />;
    }
    return <CodeIcon />;
  };

  return (
    <li className="layer-item">
      <div 
        className={`layer-item-content ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        {hasChildren ? (
          <div 
            className={`layer-item-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={handleToggle}
          >
            <ChevronRightIcon />
          </div>
        ) : (
          <div style={{ width: '16px' }} />
        )}
        
        <div className="layer-item-icon">
          {getIcon()}
        </div>
        
        <div className="layer-item-label">
          <span className="layer-item-tag">{node.tagName}</span>
          {node.id && (
            <span className="layer-item-id"> #{node.id}</span>
          )}
          {node.classes && (
            <span className="layer-item-id"> .{node.classes.split(' ')[0]}</span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <ul className="layer-children">
          {node.children.map((child, index) => (
            <LayerTree 
              key={`${child.stableSelector}-${index}`}
              node={child} 
              onSelect={onSelect}
              selectedSelector={selectedSelector}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Root LayerPanel component with search and wrapper
 */
interface LayerPanelProps {
  node: SerializedNode | null;
  onSelect: (selector: string) => void;
  selectedSelector?: string | null;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ node, onSelect, selectedSelector }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!node) {
    return (
      <div className="layer-panel">
        <div className="layer-empty">
          <p>Loading DOM tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layer-panel">
      <div className="layer-search">
        <input
          type="text"
          className="layer-search-input"
          placeholder="Search layers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="panel-content">
        <ul className="layer-tree">
          <LayerTree 
            node={node} 
            onSelect={onSelect}
            selectedSelector={selectedSelector}
            depth={0}
          />
        </ul>
      </div>
    </div>
  );
};
