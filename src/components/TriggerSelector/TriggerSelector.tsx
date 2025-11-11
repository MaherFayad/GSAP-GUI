import { useState } from 'react';
import './TriggerSelector.css';

export interface TriggerConfig {
  type: 'click' | 'hover' | 'scroll' | 'load' | 'custom';
  scrollTrigger?: {
    trigger: string;
    start: string;
    end: string;
    scrub?: boolean;
    pin?: boolean;
    markers?: boolean;
  };
  plugins?: {
    svg?: {
      type: 'draw' | 'morph' | 'motion';
      drawSVG?: string;
      morphSVG?: string;
    };
    text?: {
      type: 'split' | 'scramble';
      splitType?: 'chars' | 'words' | 'lines';
    };
  };
  event?: string; // For custom events
}

interface TriggerSelectorProps {
  value: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
  onClose?: () => void;
}

export const TriggerSelector = ({ value, onChange, onClose }: TriggerSelectorProps) => {
  const [config, setConfig] = useState<TriggerConfig>(value);

  const updateConfig = (updates: Partial<TriggerConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateScrollTrigger = (updates: Partial<NonNullable<TriggerConfig['scrollTrigger']>>) => {
    const newConfig = {
      ...config,
      scrollTrigger: {
        ...config.scrollTrigger,
        ...updates,
      } as NonNullable<TriggerConfig['scrollTrigger']>
    };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updatePlugin = (
    pluginType: 'svg' | 'text',
    updates: any
  ) => {
    const newConfig = {
      ...config,
      plugins: {
        ...config.plugins,
        [pluginType]: {
          ...config.plugins?.[pluginType],
          ...updates,
        },
      },
    };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="trigger-selector">
      <div className="trigger-selector-header">
        <div className="trigger-selector-title">Configure Trigger</div>
        {onClose && (
          <button className="trigger-selector-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="trigger-selector-content">
        {/* Trigger Type */}
        <div className="trigger-section">
          <div className="trigger-section-title">Trigger Type</div>
          <div className="trigger-button-group">
            <button
              className={`trigger-type-btn ${config.type === 'click' ? 'active' : ''}`}
              onClick={() => updateConfig({ type: 'click' })}
            >
              Click
            </button>
            <button
              className={`trigger-type-btn ${config.type === 'hover' ? 'active' : ''}`}
              onClick={() => updateConfig({ type: 'hover' })}
            >
              Hover
            </button>
            <button
              className={`trigger-type-btn ${config.type === 'scroll' ? 'active' : ''}`}
              onClick={() => updateConfig({ type: 'scroll' })}
            >
              Scroll
            </button>
            <button
              className={`trigger-type-btn ${config.type === 'load' ? 'active' : ''}`}
              onClick={() => updateConfig({ type: 'load' })}
            >
              Page Load
            </button>
            <button
              className={`trigger-type-btn ${config.type === 'custom' ? 'active' : ''}`}
              onClick={() => updateConfig({ type: 'custom' })}
            >
              Custom
            </button>
          </div>
        </div>

        {/* ScrollTrigger Configuration */}
        {config.type === 'scroll' && (
          <div className="trigger-section">
            <div className="trigger-section-title">ScrollTrigger Settings</div>
            
            <div className="trigger-input-group">
              <label className="trigger-label">Trigger Element</label>
              <input
                type="text"
                className="trigger-input"
                placeholder=".element-selector"
                value={config.scrollTrigger?.trigger || ''}
                onChange={(e) => updateScrollTrigger({ trigger: e.target.value })}
              />
            </div>

            <div className="trigger-input-group">
              <label className="trigger-label">Start</label>
              <input
                type="text"
                className="trigger-input"
                placeholder="top center"
                value={config.scrollTrigger?.start || 'top center'}
                onChange={(e) => updateScrollTrigger({ start: e.target.value })}
              />
            </div>

            <div className="trigger-input-group">
              <label className="trigger-label">End</label>
              <input
                type="text"
                className="trigger-input"
                placeholder="bottom center"
                value={config.scrollTrigger?.end || 'bottom center'}
                onChange={(e) => updateScrollTrigger({ end: e.target.value })}
              />
            </div>

            <div className="trigger-checkbox-group">
              <label className="trigger-checkbox-label">
                <input
                  type="checkbox"
                  checked={config.scrollTrigger?.scrub || false}
                  onChange={(e) => updateScrollTrigger({ scrub: e.target.checked })}
                />
                <span>Scrub (Link to scroll position)</span>
              </label>

              <label className="trigger-checkbox-label">
                <input
                  type="checkbox"
                  checked={config.scrollTrigger?.pin || false}
                  onChange={(e) => updateScrollTrigger({ pin: e.target.checked })}
                />
                <span>Pin Element</span>
              </label>

              <label className="trigger-checkbox-label">
                <input
                  type="checkbox"
                  checked={config.scrollTrigger?.markers || false}
                  onChange={(e) => updateScrollTrigger({ markers: e.target.checked })}
                />
                <span>Show Markers (Debug)</span>
              </label>
            </div>
          </div>
        )}

        {/* Custom Event */}
        {config.type === 'custom' && (
          <div className="trigger-section">
            <div className="trigger-section-title">Custom Event</div>
            <div className="trigger-input-group">
              <label className="trigger-label">Event Name</label>
              <input
                type="text"
                className="trigger-input"
                placeholder="myCustomEvent"
                value={config.event || ''}
                onChange={(e) => updateConfig({ event: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* GSAP Plugins */}
        <div className="trigger-section">
          <div className="trigger-section-title">GSAP Plugins</div>

          {/* SVG Plugin */}
          <div className="trigger-plugin-group">
            <div className="trigger-plugin-header">
              <input
                type="checkbox"
                id="svg-plugin"
                checked={!!config.plugins?.svg}
                onChange={(e) => {
                  if (e.target.checked) {
                    updatePlugin('svg', { type: 'draw' });
                  } else {
                    const newConfig = { ...config };
                    if (newConfig.plugins) {
                      delete newConfig.plugins.svg;
                    }
                    setConfig(newConfig);
                    onChange(newConfig);
                  }
                }}
              />
              <label htmlFor="svg-plugin">SVG Effects</label>
            </div>

            {config.plugins?.svg && (
              <div className="trigger-plugin-options">
                <select
                  className="trigger-select"
                  value={config.plugins.svg.type}
                  onChange={(e) =>
                    updatePlugin('svg', { type: e.target.value as 'draw' | 'morph' | 'motion' })
                  }
                >
                  <option value="draw">Draw SVG</option>
                  <option value="morph">Morph SVG</option>
                  <option value="motion">Motion Path</option>
                </select>

                {config.plugins.svg.type === 'draw' && (
                  <input
                    type="text"
                    className="trigger-input"
                    placeholder="0% 100%"
                    value={config.plugins.svg.drawSVG || ''}
                    onChange={(e) => updatePlugin('svg', { drawSVG: e.target.value })}
                  />
                )}
              </div>
            )}
          </div>

          {/* Text Plugin */}
          <div className="trigger-plugin-group">
            <div className="trigger-plugin-header">
              <input
                type="checkbox"
                id="text-plugin"
                checked={!!config.plugins?.text}
                onChange={(e) => {
                  if (e.target.checked) {
                    updatePlugin('text', { type: 'split', splitType: 'chars' });
                  } else {
                    const newConfig = { ...config };
                    if (newConfig.plugins) {
                      delete newConfig.plugins.text;
                    }
                    setConfig(newConfig);
                    onChange(newConfig);
                  }
                }}
              />
              <label htmlFor="text-plugin">Text Effects</label>
            </div>

            {config.plugins?.text && (
              <div className="trigger-plugin-options">
                <select
                  className="trigger-select"
                  value={config.plugins.text.type}
                  onChange={(e) =>
                    updatePlugin('text', { type: e.target.value as 'split' | 'scramble' })
                  }
                >
                  <option value="split">Split Text</option>
                  <option value="scramble">Scramble Text</option>
                </select>

                {config.plugins.text.type === 'split' && (
                  <select
                    className="trigger-select"
                    value={config.plugins.text.splitType || 'chars'}
                    onChange={(e) =>
                      updatePlugin('text', {
                        splitType: e.target.value as 'chars' | 'words' | 'lines',
                      })
                    }
                  >
                    <option value="chars">Characters</option>
                    <option value="words">Words</option>
                    <option value="lines">Lines</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="trigger-info">
          <div className="trigger-info-title">💡 Tip</div>
          <div className="trigger-info-text">
            {config.type === 'scroll' && 'ScrollTrigger will animate your element based on scroll position.'}
            {config.type === 'click' && 'Animation will play when the element is clicked.'}
            {config.type === 'hover' && 'Animation will play on mouse hover.'}
            {config.type === 'load' && 'Animation will play when the page loads.'}
            {config.type === 'custom' && 'Use custom JavaScript events to trigger animations.'}
          </div>
        </div>
      </div>
    </div>
  );
};

