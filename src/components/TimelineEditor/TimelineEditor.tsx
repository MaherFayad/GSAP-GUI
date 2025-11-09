import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PlusIcon } from '@radix-ui/react-icons';
import type { AnimationData } from '../../types';
import './TimelineEditor.css';

interface TimelineEditorProps {
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  sendMessage: (type: string, payload?: any) => void;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  animationData,
  setAnimationData,
  sendMessage,
  currentTime,
  onTimeChange,
}) => {
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100); // pixels per second
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  // Handle playhead dragging
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    if (!isDraggingPlayhead || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = Math.max(0, x / zoom);
      onTimeChange(Number(newTime.toFixed(2)));
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, zoom, onTimeChange]);

  const timelineIds = Object.keys(animationData.timelines);
  const selectedTimeline = selectedTimelineId
    ? animationData.timelines[selectedTimelineId]
    : null;

  // Group keyframes by selector
  const trackMap = new Map<string, any[]>();
  if (selectedTimeline) {
    selectedTimeline.keyframes?.forEach((keyframe) => {
      const selector = keyframe.selector || 'Unknown';
      if (!trackMap.has(selector)) {
        trackMap.set(selector, []);
      }
      trackMap.get(selector)!.push(keyframe);
    });
  }

  // Generate time ruler ticks
  const maxTime = 10; // seconds
  const ticks = [];
  for (let i = 0; i <= maxTime; i++) {
    ticks.push(i);
  }

  return (
    <div className="timeline-editor">
      {/* Timeline Header */}
      <div className="timeline-header">
        <span className="timeline-header-title">Timeline</span>
        <div className="timeline-header-actions">
          <button className="timeline-btn timeline-btn-primary" onClick={handleNewTimeline}>
            <PlusIcon />
            New Timeline
          </button>
          <button 
            className="timeline-btn" 
            onClick={handlePlayTimeline}
            disabled={!selectedTimelineId}
          >
            <PlayIcon />
            Play
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-content">
        {/* Timeline Sidebar */}
        <div className="timeline-sidebar">
          <div className="timeline-sidebar-header">Timelines</div>
          {timelineIds.length === 0 ? (
            <div className="timeline-list-empty">
              No timelines yet.
              <br />
              Create one to get started.
            </div>
          ) : (
            timelineIds.map((id) => {
              const timeline = animationData.timelines[id];
              if (!timeline) return null;
              const isSelected = id === selectedTimelineId;
              return (
                <div
                  key={id}
                  className={`timeline-list-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedTimelineId(id)}
                >
                  <span className="timeline-list-item-name">{timeline.name}</span>
                  <button
                    className="timeline-list-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTimeline(id);
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Timeline Canvas */}
        <div className="timeline-canvas" ref={canvasRef}>
          {selectedTimeline ? (
            <>
              {/* Time Ruler */}
              <div className="timeline-ruler">
                {ticks.map((tick) => (
                  <div
                    key={tick}
                    className="timeline-ruler-tick"
                    style={{ left: `${tick * zoom}px` }}
                  >
                    <div className="timeline-ruler-tick-line" />
                    <div className="timeline-ruler-tick-label">{tick}s</div>
                  </div>
                ))}
              </div>

              {/* Playhead */}
              <div
                className="timeline-playhead"
                style={{ left: `${currentTime * zoom}px` }}
              >
                <div
                  className="timeline-playhead-handle"
                  onMouseDown={handlePlayheadMouseDown}
                />
              </div>

              {/* Tracks */}
              <div className="timeline-tracks">
                {trackMap.size === 0 ? (
                  <div className="timeline-empty">
                    <div className="timeline-empty-title">No tracks yet</div>
                    <div className="timeline-empty-description">
                      Select an element and adjust its properties to automatically create keyframes
                    </div>
                  </div>
                ) : (
                  Array.from(trackMap.entries()).map(([selector, keyframes]) => (
                    <div key={selector} className="timeline-track">
                      <div className="timeline-track-label">
                        <div className="timeline-track-name">Element</div>
                        <div className="timeline-track-selector">{selector}</div>
                      </div>
                      <div className="timeline-track-content">
                        {/* Grid lines */}
                        <div className="timeline-grid">
                          {ticks.map((tick) => (
                            <div
                              key={tick}
                              className="timeline-grid-line"
                              style={{ left: `${tick * zoom}px` }}
                            />
                          ))}
                        </div>
                        
                        {/* Keyframes */}
                        {keyframes.map((keyframe, idx) => (
                          <div
                            key={idx}
                            className="timeline-keyframe"
                            style={{ left: `${(keyframe.time || 0) * zoom}px` }}
                            title={`Time: ${keyframe.time}s`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="timeline-empty">
              <div className="timeline-empty-title">No timeline selected</div>
              <div className="timeline-empty-description">
                Select a timeline from the list or create a new one to get started
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls">
        <div className="timeline-time-display">{currentTime.toFixed(2)}s</div>
        <div className="timeline-zoom-control">
          <span className="timeline-zoom-label">Zoom:</span>
          <input
            type="range"
            min="50"
            max="200"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100px' }}
          />
          <span className="timeline-zoom-label">{zoom}px/s</span>
        </div>
      </div>
    </div>
  );
};

