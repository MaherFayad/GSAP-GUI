import { useState } from 'react';
import type { AnimationData } from '../../types';

interface TimelineEditorProps {
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  sendMessage: (type: string, payload?: any) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  animationData,
  setAnimationData,
  sendMessage,
}) => {
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);

  const handleNewTimeline = () => {
    const newId = `timeline_${Date.now()}`;
    setAnimationData((prev) => ({
      ...prev,
      timelines: {
        ...prev.timelines,
        [newId]: {
          id: newId,
          name: `Timeline ${Object.keys(prev.timelines).length + 1}`,
          keyframes: [],
        },
      },
    }));
    setSelectedTimelineId(newId);
  };

  const handlePlayTimeline = () => {
    if (!selectedTimelineId) {
      alert('Please select a timeline first');
      return;
    }

    const timeline = animationData.timelines[selectedTimelineId];
    if (!timeline) {
      alert('Timeline not found');
      return;
    }

    console.log('[TimelineEditor] Playing timeline:', timeline);
    sendMessage('PLAY_TIMELINE', timeline);
  };

  const handleDeleteTimeline = (timelineId: string) => {
    const { [timelineId]: removed, ...rest } = animationData.timelines;
    setAnimationData((prev) => ({
      ...prev,
      timelines: rest,
    }));
    if (selectedTimelineId === timelineId) {
      setSelectedTimelineId(null);
    }
  };

  const timelineIds = Object.keys(animationData.timelines);
  const selectedTimeline = selectedTimelineId
    ? animationData.timelines[selectedTimelineId]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '10px',
          background: '#1e1e1e',
          borderBottom: '1px solid #444',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleNewTimeline}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          + New Timeline
        </button>
        <button
          onClick={handlePlayTimeline}
          disabled={!selectedTimelineId}
          style={{
            padding: '8px 16px',
            background: selectedTimelineId ? '#27ae60' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedTimelineId ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          ▶ Play
        </button>
        {selectedTimeline && (
          <span style={{ fontSize: '13px', color: '#888', marginLeft: '10px' }}>
            Selected: <strong style={{ color: '#3498db' }}>{selectedTimeline.name}</strong>
          </span>
        )}
      </div>

      {/* Timeline List and Editor */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Timeline List */}
        <div
          style={{
            width: '200px',
            background: '#252525',
            borderRight: '1px solid #444',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px',
              fontSize: '12px',
              color: '#888',
              fontWeight: 'bold',
              borderBottom: '1px solid #444',
            }}
          >
            TIMELINES
          </div>
          {timelineIds.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              No timelines yet.
              <br />
              Click "New Timeline" to create one.
            </div>
          ) : (
            <div style={{ padding: '5px' }}>
              {timelineIds.map((id) => {
                const timeline = animationData.timelines[id];
                if (!timeline) return null;
                const isSelected = id === selectedTimelineId;
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedTimelineId(id)}
                    style={{
                      padding: '8px 10px',
                      margin: '2px 0',
                      background: isSelected ? '#3498db' : 'transparent',
                      color: isSelected ? '#fff' : '#ccc',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{timeline.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTimeline(id);
                      }}
                      style={{
                        padding: '2px 6px',
                        background: 'transparent',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline Editor Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {selectedTimeline ? (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#fff' }}>
                {selectedTimeline.name}
              </h3>
              
              {/* Timeline Visualization */}
              <div
                style={{
                  background: '#1e1e1e',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '20px',
                  minHeight: '100px',
                }}
              >
                {selectedTimeline.keyframes && selectedTimeline.keyframes.length > 0 ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                      Keyframes ({selectedTimeline.keyframes.length}):
                    </div>
                    {selectedTimeline.keyframes.map((keyframe, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px',
                          margin: '5px 0',
                          background: '#2a2a2a',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ color: '#3498db', fontWeight: 'bold' }}>
                          {keyframe.selector || 'No selector'}
                        </div>
                        <div style={{ color: '#888', marginTop: '5px' }}>
                          Time: {keyframe.time || 0}s | Duration: {keyframe.duration || 0}s
                        </div>
                        {keyframe.properties && (
                          <div style={{ color: '#888', marginTop: '5px' }}>
                            Properties: {Object.keys(keyframe.properties).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    <p>No keyframes in this timeline yet.</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>
                      Use the Properties Panel to add keyframes to elements.
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline Info */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#1e1e1e',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#888',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#fff' }}>Timeline ID:</strong> {selectedTimeline.id}
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Total Keyframes:</strong>{' '}
                  {selectedTimeline.keyframes?.length || 0}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              <p>Select a timeline from the list or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

