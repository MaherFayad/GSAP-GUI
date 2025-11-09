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
    style: true
  });

  // Real-time "tweak" - send updates to sandbox AND auto-record keyframe
  useEffect(() => {
    if (!selectedElement) return;

    const values = {
      x, y, scale, rotation, opacity, backgroundColor, color
    };

    // Send immediate visual update to sandbox
    sendMessage('TWEAK_ANIMATION', {
      selector: selectedElement,
      properties: values
    });

    // Auto-record keyframe when properties change
    const activeTimelineId = animationData.activeTimelineId || 'default';
    
    const properties: TweenProperties = values;

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
        // Check if a keyframe already exists at this time for this element
        const existingKeyframeIndex = existingTimeline.keyframes.findIndex(
          kf => kf.time === currentTime && kf.selector === selectedElement
        );

        const updatedKeyframes = existingKeyframeIndex >= 0
          ? existingTimeline.keyframes.map((kf, idx) => 
              idx === existingKeyframeIndex ? newKeyframe : kf
            )
          : [...existingTimeline.keyframes, newKeyframe];

        return {
          ...prevData,
          timelines: {
            ...prevData.timelines,
            [activeTimelineId]: {
              ...existingTimeline,
              keyframes: updatedKeyframes
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
  }, [x, y, scale, rotation, opacity, backgroundColor, color, selectedElement, sendMessage, currentTime, animationData.activeTimelineId, setAnimationData]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!selectedElement) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
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
        <div className="properties-section-content">
          <div className="properties-row">
            <label className="properties-label">Position</label>
            <div className="properties-input-group">
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  className="properties-input"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  placeholder="X"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  className="properties-input"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  placeholder="Y"
                />
              </div>
            </div>
          </div>

          <div className="properties-row">
            <label className="properties-label">Scale</label>
            <input
              type="number"
              className="properties-input"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              step="0.01"
              min="0"
              max="3"
              aria-label="Scale"
            />
          </div>

          <div className="properties-row">
            <label className="properties-label">Rotation</label>
            <div style={{ display: 'flex' }}>
              <input
                type="number"
                className="properties-input"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                step="1"
                style={{ borderRadius: 'var(--radius-2) 0 0 var(--radius-2)' }}
                aria-label="Rotation"
              />
              <div className="properties-unit">deg</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Style',
      defaultExpanded: true,
      content: (
        <div className="properties-section-content">
          <div className="properties-row">
            <label className="properties-label">Opacity</label>
            <input
              type="number"
              className="properties-input"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              step="0.01"
              min="0"
              max="1"
              aria-label="Opacity"
            />
          </div>

          <div className="properties-row">
            <label className="properties-label">Background</label>
            <div className="properties-color-picker">
              <div className="properties-color-swatch">
                <div 
                  className="properties-color-swatch-inner"
                  style={{ background: backgroundColor }}
                />
              </div>
              <input
                type="text"
                className="properties-input"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="properties-row">
            <label className="properties-label">Color</label>
            <div className="properties-color-picker">
              <div className="properties-color-swatch">
                <div 
                  className="properties-color-swatch-inner"
                  style={{ background: color }}
                />
              </div>
              <input
                type="text"
                className="properties-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="properties-panel">
      <div className="panel-content">
        {sections.map((section, index) => {
          const isExpanded = expandedSections[section.title.toLowerCase()];
          
          return (
            <div key={index} className="properties-section">
              <div 
                className="properties-section-header"
                onClick={() => toggleSection(section.title.toLowerCase())}
              >
                <div className="properties-section-title">
                  <ChevronRightIcon 
                    className={`properties-section-icon ${isExpanded ? 'expanded' : ''}`}
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

