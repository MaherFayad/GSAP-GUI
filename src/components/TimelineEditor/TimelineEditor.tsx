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
  const [maxTime, setMaxTime] = useState(10); // Timeline duration in seconds
  const canvasRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [elementDisplayNames, setElementDisplayNames] = useState<Map<string, string>>(new Map());

  // Format selector for display based on actual element data
  const formatSelector = (selector: string): string => {
    // Check if we have cached display name
    if (elementDisplayNames.has(selector)) {
      return elementDisplayNames.get(selector) || selector;
    }
    
    // Request element info from sandbox
    sendMessage('GET_ELEMENT_STYLES', { selector });
    
    // Return temporary display while waiting
    return selector;
  };

  // Listen for element metadata from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_STYLES' && event.data.payload.styles) {
        const { selector, styles } = event.data.payload;
        const { tagName, className } = styles;
        
        if (tagName) {
          const displayName = className 
            ? `${tagName} .${className.split(' ')[0]}` // Use first class if multiple
            : tagName;
          
          setElementDisplayNames(prev => new Map(prev).set(selector, displayName));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  // Handle clicking on the timeline canvas to jump to time
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDraggingPlayhead) return;
    if (!rulerRef.current) return;

    // Get position relative to the ruler (which starts after the sidebar)
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(maxTime, x / zoom));
    onTimeChange(Number(newTime.toFixed(2)));
  };

  // Handle clicking on a keyframe
  const handleKeyframeClick = (keyframeTime: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeChange(keyframeTime);
  };

  // Zoom presets
  const zoomPresets = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
    { label: '200%', value: 200 },
    { label: '400%', value: 400 },
  ];

  const handleZoomPreset = (value: number) => {
    setZoom(value);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(500, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(25, prev - 25));
  };

  const handleFitTimeline = () => {
    if (!canvasRef.current) return;
    const availableWidth = canvasRef.current.clientWidth - 160; // Subtract sidebar width
    const newZoom = Math.floor(availableWidth / maxTime);
    setZoom(Math.max(25, Math.min(500, newZoom)));
  };

  useEffect(() => {
    if (!isDraggingPlayhead || !rulerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(maxTime, x / zoom));
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
  }, [isDraggingPlayhead, zoom, onTimeChange, maxTime]);

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

  // Generate time ruler ticks based on zoom level
  const ticks: number[] = [];
  const tickInterval = zoom < 50 ? 2 : zoom < 100 ? 1 : 0.5; // Adaptive tick spacing
  for (let i = 0; i <= maxTime; i += tickInterval) {
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
              <div className="timeline-ruler" onClick={handleCanvasClick} ref={rulerRef}>
                {ticks.map((tick) => (
                  <div
                    key={tick}
                    className="timeline-ruler-tick"
                    style={{ left: `${tick * zoom}px` }}
                  >
                    <div className="timeline-ruler-tick-line" />
                    <div className="timeline-ruler-tick-label">
                      {tick % 1 === 0 ? `${tick}s` : `${tick.toFixed(1)}`}
                    </div>
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
                        <div className="timeline-track-selector">{formatSelector(selector)}</div>
                      </div>
                      <div className="timeline-track-content" onClick={handleCanvasClick}>
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
                            key={`${keyframe.id}-${idx}`}
                            className="timeline-keyframe"
                            style={{ left: `${(keyframe.time || 0) * zoom}px` }}
                            title={`Time: ${keyframe.time}s - Click to jump`}
                            onClick={(e) => handleKeyframeClick(keyframe.time || 0, e)}
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
        <div className="timeline-time-display">{currentTime.toFixed(2)}s / {maxTime}s</div>

        {/* Duration Control */}
        <div className="timeline-duration-control">
          <span className="timeline-control-label">Duration:</span>
          <input
            type="number"
            min="1"
            max="60"
            value={maxTime}
            aria-label="Timeline Duration in seconds"

            onChange={(e) => setMaxTime(Math.max(1, Number(e.target.value)))}
            className="timeline-duration-input"
          />
          <span className="timeline-control-label">s</span>
        </div>

        {/* Zoom Controls */}
        <div className="timeline-zoom-control">
          <button className="timeline-zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            -
          </button>
          <span className="timeline-zoom-label">{zoom}%</span>
          <button className="timeline-zoom-btn" onClick={handleZoomIn} title="Zoom In">
            +
          </button>
          <button className="timeline-zoom-btn" onClick={handleFitTimeline} title="Fit Timeline">
            Fit
          </button>
        </div>

        {/* Zoom Presets */}
        <div className="timeline-zoom-presets">
          {zoomPresets.map((preset) => (
            <button
              key={preset.value}
              className={`timeline-zoom-preset ${zoom === preset.value ? 'active' : ''}`}
              onClick={() => handleZoomPreset(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

