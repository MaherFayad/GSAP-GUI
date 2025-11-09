import { useState, useEffect } from 'react';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { AnimationData, TweenProperties } from '../../types';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  selectedElement: string | null;
  sendMessage: (type: string, payload?: any) => void;
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  currentTime?: number;
}

interface Section {
  title: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  content: React.ReactNode;
}

export const PropertiesPanelNew = ({ 
  selectedElement, 
  sendMessage,
  animationData,
  setAnimationData,
  currentTime = 0
}: PropertiesPanelProps) => {
  // Property states
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#3498db');
  const [color, setColor] = useState('#000000');

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transform: true,
    style: true,
    animation: true
  });

  // Real-time "tweak" - send updates to sandbox
  useEffect(() => {
    if (!selectedElement) return;

    const values = {
      x, y, scale, rotation, opacity, backgroundColor, color
    };

    sendMessage('TWEAK_ANIMATION', {
      selector: selectedElement,
      properties: values
    });
  }, [x, y, scale, rotation, opacity, backgroundColor, color, selectedElement, sendMessage]);

  // Handle adding a keyframe
  const handleAddKeyframe = () => {
    if (!selectedElement) return;

    const activeTimelineId = animationData.activeTimelineId || 'default';
    
    const properties: TweenProperties = {
      x, y, scale, rotation, opacity, backgroundColor, color
    };

    const newKeyframe = {
      id: `keyframe-${Date.now()}`,
      time: currentTime,
      selector: selectedElement,
      properties,
      duration: 1,
      ease: 'power2.out'
    };

    setAnimationData(prevData => {
      const existingTimeline = prevData.timelines[activeTimelineId];
      
      if (existingTimeline) {
        return {
          ...prevData,
          timelines: {
            ...prevData.timelines,
            [activeTimelineId]: {
              ...existingTimeline,
              keyframes: [...existingTimeline.keyframes, newKeyframe]
            }
          }
        };
      } else {
        return {
          ...prevData,
          activeTimelineId,
          timelines: {
            ...prevData.timelines,
            [activeTimelineId]: {
              id: activeTimelineId,
              name: 'Main Timeline',
              keyframes: [newKeyframe]
            }
          }
        };
      }
    });

    console.log('[PropertiesPanel] Added keyframe:', newKeyframe);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!selectedElement) {
    return (
      <div className="ws-properties-panel">
        <div className="ws-properties-empty">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const sections: Section[] = [
    {
      title: 'Transform',
      defaultExpanded: true,
      content: (
        <div className="ws-properties-section-content">
          <div className="ws-properties-row">
            <label className="ws-properties-label">Position</label>
            <div className="ws-properties-input-group">
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  className="ws-properties-input"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  placeholder="X"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  className="ws-properties-input"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  placeholder="Y"
                />
              </div>
            </div>
          </div>

          <div className="ws-properties-row">
            <label className="ws-properties-label">Scale</label>
            <input
              type="number"
              className="ws-properties-input"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              step="0.01"
              min="0"
              max="3"
            />
          </div>

          <div className="ws-properties-row">
            <label className="ws-properties-label">Rotation</label>
            <div style={{ display: 'flex' }}>
              <input
                type="number"
                className="ws-properties-input"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                step="1"
                style={{ borderRadius: 'var(--ws-radius-2) 0 0 var(--ws-radius-2)' }}
              />
              <div className="ws-properties-unit">deg</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Style',
      defaultExpanded: true,
      content: (
        <div className="ws-properties-section-content">
          <div className="ws-properties-row">
            <label className="ws-properties-label">Opacity</label>
            <input
              type="number"
              className="ws-properties-input"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              step="0.01"
              min="0"
              max="1"
            />
          </div>

          <div className="ws-properties-row">
            <label className="ws-properties-label">Background</label>
            <div className="ws-properties-color-picker">
              <div className="ws-properties-color-swatch">
                <div 
                  className="ws-properties-color-swatch-inner"
                  style={{ background: backgroundColor }}
                />
              </div>
              <input
                type="text"
                className="ws-properties-input"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="ws-properties-row">
            <label className="ws-properties-label">Color</label>
            <div className="ws-properties-color-picker">
              <div className="ws-properties-color-swatch">
                <div 
                  className="ws-properties-color-swatch-inner"
                  style={{ background: color }}
                />
              </div>
              <input
                type="text"
                className="ws-properties-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Animation',
      defaultExpanded: true,
      content: (
        <div className="ws-properties-section-content">
          <button 
            className="ws-properties-button ws-properties-button-primary"
            onClick={handleAddKeyframe}
            style={{ width: '100%' }}
          >
            Add Keyframe at {currentTime}s
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="ws-properties-panel">
      <div className="ws-panel-content">
        {sections.map((section, index) => {
          const isExpanded = expandedSections[section.title.toLowerCase()];
          
          return (
            <div key={index} className="ws-properties-section">
              <div 
                className="ws-properties-section-header"
                onClick={() => toggleSection(section.title.toLowerCase())}
              >
                <div className="ws-properties-section-title">
                  <ChevronRightIcon 
                    className={`ws-properties-section-icon ${isExpanded ? 'expanded' : ''}`}
                  />
                  {section.title}
                </div>
              </div>
              
              {isExpanded && section.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

