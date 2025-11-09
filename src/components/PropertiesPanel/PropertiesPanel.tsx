import { useControls } from 'leva';
import { useEffect } from 'react';

interface PropertiesPanelProps {
  selectedElement: string | null;
  sendMessage: (type: string, payload?: any) => void;
}

export const PropertiesPanel = ({ selectedElement, sendMessage }: PropertiesPanelProps) => {
  // Initialize Leva controls
  const [values] = useControls(() => ({
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
    opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Opacity'
    },
    scale: {
      value: 1,
      min: 0,
      max: 3,
      step: 0.01,
      label: 'Scale'
    }
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

  // Leva will automatically render the controls panel
  return null;
};

