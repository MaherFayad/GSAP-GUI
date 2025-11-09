import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';
import type { AnimationData, TweenProperties } from '../../types';

interface PropertiesPanelProps {
  selectedElement: string | null;
  sendMessage: (type: string, payload?: any) => void;
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  currentTime?: number; // Current playhead time from timeline (we'll pass this later)
}

export const PropertiesPanel = ({ 
  selectedElement, 
  sendMessage,
  animationData,
  setAnimationData,
  currentTime = 0
}: PropertiesPanelProps) => {
  // Show a message when no element is selected
  if (!selectedElement) {
    return (
      <div style={{
        padding: '20px',
        color: '#888',
        fontSize: '14px',
        fontFamily: 'sans-serif'
      }}>
        Select an element to edit its properties
      </div>
    );
  }

  // Initialize Leva controls with folders
  const [values] = useControls(() => ({
    Transform: folder({
      x: {
        value: 0,
        min: -1000,
        max: 1000,
        step: 1,
        label: 'X Position'
      },
      y: {
        value: 0,
        min: -1000,
        max: 1000,
        step: 1,
        label: 'Y Position'
      },
      scale: {
        value: 1,
        min: 0,
        max: 3,
        step: 0.01,
        label: 'Scale'
      },
      rotation: {
        value: 0,
        min: -360,
        max: 360,
        step: 1,
        label: 'Rotation'
      }
    }),
    Style: folder({
      opacity: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Opacity'
      },
      backgroundColor: {
        value: '#3498db',
        label: 'Background Color'
      },
      color: {
        value: '#000000',
        label: 'Text Color'
      }
    }),
    'Add Keyframe': button(() => handleAddKeyframe())
  }), [selectedElement]);

  // Real-time "tweak" handler - sends updates whenever values change
  useEffect(() => {
    if (!selectedElement) return;

    // Send the tweak animation properties to the sandbox
    sendMessage('TWEAK_ANIMATION', {
      selector: selectedElement,
      properties: values
    });
  }, [values, selectedElement, sendMessage]);

  // Handle adding a keyframe
  const handleAddKeyframe = () => {
    if (!selectedElement) return;

    // Get active timeline ID (or create default one)
    const activeTimelineId = animationData.activeTimelineId || 'default';
    
    // Create the tween properties from current control values
    const properties: TweenProperties = {
      x: values.x,
      y: values.y,
      scale: values.scale,
      rotation: values.rotation,
      opacity: values.opacity,
      backgroundColor: values.backgroundColor,
      color: values.color
    };

    // Create new keyframe
    const newKeyframe = {
      id: `keyframe-${Date.now()}`,
      time: currentTime,
      selector: selectedElement,
      properties,
      duration: 1, // Default 1 second duration
      ease: 'power2.out' // Default ease
    };

    setAnimationData(prevData => {
      // Get or create the active timeline
      const existingTimeline = prevData.timelines[activeTimelineId];
      
      if (existingTimeline) {
        // Add keyframe to existing timeline
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
        // Create new timeline with this keyframe
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

  // Leva will automatically render the controls panel
  return null;
};

