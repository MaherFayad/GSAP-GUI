import { useControls, folder } from 'leva';
import { useEffect, useRef } from 'react';
import type { AnimationData, TweenProperties } from '../../types';

interface PropertiesPanelProps {
  selectedElement: string | null;
  sendMessage: (type: string, payload?: any) => void;
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  currentTime?: number; // Current playhead time from timeline
  activeTimelineId?: string | null; // Active timeline to add keyframes to
}

export const PropertiesPanel = ({ 
  selectedElement, 
  sendMessage,
  animationData,
  setAnimationData,
  currentTime = 0,
  activeTimelineId
}: PropertiesPanelProps) => {
  const previousValuesRef = useRef<any>(null);

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

  // Initialize Leva controls with folders (NO ADD KEYFRAME BUTTON)
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
    })
  }), [selectedElement]);

  // Auto-create keyframes when values change
  useEffect(() => {
    if (!selectedElement) return;
    if (!activeTimelineId) return; // Only auto-create if timeline is active

    // Skip on initial render
    if (previousValuesRef.current === null) {
      previousValuesRef.current = values;
      return;
    }

    // Check if values actually changed
    const hasChanged = JSON.stringify(previousValuesRef.current) !== JSON.stringify(values);
    if (!hasChanged) return;

    previousValuesRef.current = values;

    // Send real-time tweak to sandbox
    sendMessage('TWEAK_ANIMATION', {
      selector: selectedElement,
      properties: values
    });

    // Auto-create keyframe at current time
    const properties: TweenProperties = {
      x: values.x,
      y: values.y,
      scale: values.scale,
      rotation: values.rotation,
      opacity: values.opacity,
      backgroundColor: values.backgroundColor,
      color: values.color
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
        // Check if keyframe already exists at this exact time for this element
        const existingKeyframeIndex = existingTimeline.keyframes.findIndex(
          kf => kf.time === currentTime && kf.selector === selectedElement
        );

        if (existingKeyframeIndex >= 0) {
          // Update existing keyframe
          const updatedKeyframes = [...existingTimeline.keyframes];
          updatedKeyframes[existingKeyframeIndex] = {
            ...updatedKeyframes[existingKeyframeIndex],
            properties
          };

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
          // Add new keyframe
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
        }
      } else {
        // Create new timeline with this keyframe
        return {
          ...prevData,
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
  }, [values, selectedElement, sendMessage, currentTime, activeTimelineId, setAnimationData]);

  // Leva will automatically render the controls panel
  return null;
};

