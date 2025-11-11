import { useState, useEffect, useRef } from 'react';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { AnimationData, TweenProperties } from '../../types';
import { 
  NumberInput, 
  LinkedNumberInputs, 
  ColorPicker, 
  Select, 
  TextInput, 
  Checkbox,
  Slider 
} from './PropertyInputs';
import { PropertyRow, InlineProperty } from './PropertyGroups';
import { FigmaNumberInput, FigmaLinkedInputs, FigmaSelect, FigmaColorInput } from './FigmaStyleInputs';
import { TransformOriginPicker } from './TransformOriginPicker';
import { EasingCurveEditor } from './EasingCurveEditor';
import './PropertiesPanel.css';
import './FigmaStyleInputs.css';
import './TransformOriginPicker.css';
import './EasingCurveEditor.css';

interface PropertiesPanelProps {
  selectedElement: string | null;
  sendMessage: (type: string, payload?: any) => void;
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  currentTime?: number;
}

// Easing options for GSAP
const EASING_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Power1 In', value: 'power1.in' },
  { label: 'Power1 Out', value: 'power1.out' },
  { label: 'Power1 InOut', value: 'power1.inOut' },
  { label: 'Power2 In', value: 'power2.in' },
  { label: 'Power2 Out', value: 'power2.out' },
  { label: 'Power2 InOut', value: 'power2.inOut' },
  { label: 'Power3 In', value: 'power3.in' },
  { label: 'Power3 Out', value: 'power3.out' },
  { label: 'Power3 InOut', value: 'power3.inOut' },
  { label: 'Power4 In', value: 'power4.in' },
  { label: 'Power4 Out', value: 'power4.out' },
  { label: 'Power4 InOut', value: 'power4.inOut' },
  { label: 'Back In', value: 'back.in' },
  { label: 'Back Out', value: 'back.out' },
  { label: 'Back InOut', value: 'back.inOut' },
  { label: 'Elastic In', value: 'elastic.in' },
  { label: 'Elastic Out', value: 'elastic.out' },
  { label: 'Elastic InOut', value: 'elastic.inOut' },
  { label: 'Bounce In', value: 'bounce.in' },
  { label: 'Bounce Out', value: 'bounce.out' },
  { label: 'Bounce InOut', value: 'bounce.inOut' },
  { label: 'Circ In', value: 'circ.in' },
  { label: 'Circ Out', value: 'circ.out' },
  { label: 'Circ InOut', value: 'circ.inOut' },
  { label: 'Expo In', value: 'expo.in' },
  { label: 'Expo Out', value: 'expo.out' },
  { label: 'Expo InOut', value: 'expo.inOut' },
  { label: 'Sine In', value: 'sine.in' },
  { label: 'Sine Out', value: 'sine.out' },
  { label: 'Sine InOut', value: 'sine.inOut' }
];

const TEXT_ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' }
];

const FONT_WEIGHT_OPTIONS = [
  { label: 'Thin (100)', value: '100' },
  { label: 'Extra Light (200)', value: '200' },
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' }
];

const TRANSFORM_ORIGIN_OPTIONS = [
  { label: 'Center', value: 'center center' },
  { label: 'Top Left', value: 'top left' },
  { label: 'Top Center', value: 'top center' },
  { label: 'Top Right', value: 'top right' },
  { label: 'Center Left', value: 'center left' },
  { label: 'Center Right', value: 'center right' },
  { label: 'Bottom Left', value: 'bottom left' },
  { label: 'Bottom Center', value: 'bottom center' },
  { label: 'Bottom Right', value: 'bottom right' }
];

export const PropertiesPanelComprehensive = ({ 
  selectedElement, 
  sendMessage,
  animationData,
  setAnimationData,
  currentTime = 0
}: PropertiesPanelProps) => {
  // ===== TRANSFORM PROPERTIES =====
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  
  // Track previous property values to detect actual changes
  const previousPropertiesRef = useRef<string | null>(null);
  const [scaleY, setScaleY] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [transformOrigin, setTransformOrigin] = useState('center center');

  // ===== LAYOUT PROPERTIES =====
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  // ===== STYLE PROPERTIES =====
  const [opacity, setOpacity] = useState(1);
  const [autoAlpha, setAutoAlpha] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#3498db');
  const [color, setColor] = useState('#000000');
  const [borderRadius, setBorderRadius] = useState(0);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#000000');
  const [zIndex, setZIndex] = useState(0);

  // ===== TEXT PROPERTIES =====
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState('400');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState('left');

  // ===== EFFECTS =====
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);

  // ===== SPACING =====
  const [padding, setPadding] = useState(0);
  const [margin, setMargin] = useState(0);

  // ===== ANIMATION PROPERTIES =====
  const [duration, setDuration] = useState(1);
  const [delay, setDelay] = useState(0);
  const [ease, setEase] = useState('power2.out');
  const [repeat, setRepeat] = useState(0);
  const [yoyo, setYoyo] = useState(false);
  const [showEasingEditor, setShowEasingEditor] = useState(false);

  // ===== UI STATE =====
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transform: true,
    layout: false,
    style: true,
    text: false,
    effects: false,
    spacing: false,
    animation: true
  });

  const [autoRecord, setAutoRecord] = useState(true);
  const isInitializingRef = useRef(false);

  // Fetch current styles from selected element
  useEffect(() => {
    if (!selectedElement) return;

    isInitializingRef.current = true;
    previousPropertiesRef.current = null; // Reset to allow first update

    // Request current styles from the element
    sendMessage('GET_ELEMENT_STYLES', { selector: selectedElement });
  }, [selectedElement, sendMessage]);

  // Listen for style updates from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_STYLES' && event.data.payload.selector === selectedElement) {
        const styles = event.data.payload.styles;
        
        // Update all state values with current element styles
        if (styles.x !== undefined) setX(parseFloat(styles.x) || 0);
        if (styles.y !== undefined) setY(parseFloat(styles.y) || 0);
        if (styles.scaleX !== undefined) setScaleX(parseFloat(styles.scaleX) || 1);
        if (styles.scaleY !== undefined) setScaleY(parseFloat(styles.scaleY) || 1);
        if (styles.rotation !== undefined) setRotation(parseFloat(styles.rotation) || 0);
        if (styles.rotationX !== undefined) setRotationX(parseFloat(styles.rotationX) || 0);
        if (styles.rotationY !== undefined) setRotationY(parseFloat(styles.rotationY) || 0);
        if (styles.skewX !== undefined) setSkewX(parseFloat(styles.skewX) || 0);
        if (styles.skewY !== undefined) setSkewY(parseFloat(styles.skewY) || 0);
        if (styles.width !== undefined) setWidth(parseFloat(styles.width) || 100);
        if (styles.height !== undefined) setHeight(parseFloat(styles.height) || 100);
        if (styles.opacity !== undefined) setOpacity(parseFloat(styles.opacity) || 1);
        if (styles.backgroundColor) setBackgroundColor(styles.backgroundColor);
        if (styles.color) setColor(styles.color);
        if (styles.borderRadius !== undefined) setBorderRadius(parseFloat(styles.borderRadius) || 0);
        if (styles.borderWidth !== undefined) setBorderWidth(parseFloat(styles.borderWidth) || 0);
        if (styles.borderColor) setBorderColor(styles.borderColor);
        if (styles.fontSize !== undefined) setFontSize(parseFloat(styles.fontSize) || 16);
        if (styles.fontWeight) setFontWeight(styles.fontWeight);
        if (styles.lineHeight !== undefined) setLineHeight(parseFloat(styles.lineHeight) || 1.5);
        if (styles.letterSpacing !== undefined) setLetterSpacing(parseFloat(styles.letterSpacing) || 0);
        if (styles.textAlign) setTextAlign(styles.textAlign);
        if (styles.transformOrigin) setTransformOrigin(styles.transformOrigin);
        if (styles.zIndex !== undefined) setZIndex(parseInt(styles.zIndex) || 0);
        
        // Mark initialization complete
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedElement]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Gather all current property values
  const getCurrentProperties = (): TweenProperties => {
    return {
      x, y,
      scaleX, scaleY,
      rotation, rotationX, rotationY,
      skewX, skewY,
      width, height,
      opacity, autoAlpha,
      backgroundColor, color,
      borderRadius, borderWidth, borderColor,
      fontSize, fontWeight, lineHeight, letterSpacing, textAlign,
      blur, brightness, contrast, saturate,
      padding, margin,
      transformOrigin,
      zIndex
    };
  };

  // Real-time "tweak" handler - sends updates to sandbox
  useEffect(() => {
    if (!selectedElement) return;
    if (isInitializingRef.current) return; // Don't apply during initialization

    const properties = getCurrentProperties();
    const propertiesString = JSON.stringify(properties);

    // Send immediate visual update to sandbox
    sendMessage('TWEAK_ANIMATION', {
      selector: selectedElement,
      properties
    });

    // Auto-record keyframe if enabled AND properties actually changed
    if (autoRecord && previousPropertiesRef.current !== null && previousPropertiesRef.current !== propertiesString) {
      const activeTimelineId = animationData.activeTimelineId || 'default';
      
      const newKeyframe = {
        id: `keyframe-${Date.now()}-${Math.random()}`,
        time: currentTime,
        selector: selectedElement,
        properties,
        duration,
        ease
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
    }

    // Update the reference for next comparison
    previousPropertiesRef.current = propertiesString;
  }, [
    x, y, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY,
    width, height, opacity, autoAlpha, backgroundColor, color,
    borderRadius, borderWidth, borderColor, fontSize, fontWeight,
    lineHeight, letterSpacing, textAlign, blur, brightness, contrast,
    saturate, padding, margin, transformOrigin, zIndex,
    selectedElement, sendMessage, animationData.activeTimelineId,
    setAnimationData, autoRecord, duration, ease
  ]);

  // Manual keyframe addition removed - auto-record handles this

  // Reset all properties to defaults
  const handleResetAll = () => {
    setX(0);
    setY(0);
    setScaleX(1);
    setScaleY(1);
    setRotation(0);
    setRotationX(0);
    setRotationY(0);
    setSkewX(0);
    setSkewY(0);
    setWidth(100);
    setHeight(100);
    setOpacity(1);
    setAutoAlpha(1);
    setBackgroundColor('#3498db');
    setColor('#000000');
    setBorderRadius(0);
    setBorderWidth(0);
    setBorderColor('#000000');
    setFontSize(16);
    setFontWeight('400');
    setLineHeight(1.5);
    setLetterSpacing(0);
    setTextAlign('left');
    setBlur(0);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setPadding(0);
    setMargin(0);
    setTransformOrigin('center center');
    setZIndex(0);
    setDuration(1);
    setDelay(0);
    setEase('power2.out');
    setRepeat(0);
    setYoyo(false);
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

  return (
    <div className="properties-panel">
      {/* Header with controls */}
      <div className="properties-header">
        <div className="properties-header-title">Properties</div>
        <div className="properties-header-actions">
          <Checkbox 
            value={autoRecord}
            onChange={setAutoRecord}
            label="Auto Record"
          />
          <button 
            className="properties-button properties-button-small"
            onClick={handleResetAll}
            title="Reset all properties"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* ===== TRANSFORM SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('transform')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.transform ? 'expanded' : ''}`}
              />
              Transform
            </div>
          </div>
          
          {expandedSections.transform && (
            <div className="properties-section-content">
              {/* Position */}
              <PropertyRow label="Position">
                <InlineProperty label="X">
                  <input
                    type="number"
                    className="properties-input"
                    value={x}
                    onChange={(e) => setX(parseFloat(e.target.value) || 0)}
                    step={1}
                    aria-label="X Position"
                  />
                </InlineProperty>
                <InlineProperty label="Y">
                  <input
                    type="number"
                    className="properties-input"
                    value={y}
                    onChange={(e) => setY(parseFloat(e.target.value) || 0)}
                    step={1}
                    aria-label="Y Position"
                  />
                </InlineProperty>
              </PropertyRow>

              {/* Scale */}
              <LinkedNumberInputs
                value1={scaleX}
                value2={scaleY}
                onChange1={setScaleX}
                onChange2={setScaleY}
                label1="Scale X"
                label2="Scale Y"
                min={0}
                max={10}
                step={0.01}
                linkable={true}
              />

              {/* Rotation */}
              <PropertyRow label="Rotation" columns={3}>
                <InlineProperty label="Z">
                  <input
                    type="number"
                    className="properties-input"
                    value={rotation}
                    onChange={(e) => setRotation(parseFloat(e.target.value) || 0)}
                    step={1}
                    aria-label="Rotation Z"
                  />
                </InlineProperty>
                <InlineProperty label="X">
                  <input
                    type="number"
                    className="properties-input"
                    value={rotationX}
                    onChange={(e) => setRotationX(parseFloat(e.target.value) || 0)}
                    step={1}
                    aria-label="Rotation X"
                  />
                </InlineProperty>
                <InlineProperty label="Y">
                  <input
                    type="number"
                    className="properties-input"
                    value={rotationY}
                    onChange={(e) => setRotationY(parseFloat(e.target.value) || 0)}
                    step={1}
                    aria-label="Rotation Y"
                  />
                </InlineProperty>
              </PropertyRow>

              {/* Skew */}
              <PropertyRow label="Skew">
                <InlineProperty label="X">
                  <input
                    type="number"
                    className="properties-input"
                    value={skewX}
                    onChange={(e) => setSkewX(parseFloat(e.target.value) || 0)}
                    step={1}
                    min={-90}
                    max={90}
                    aria-label="Skew X"
                  />
                </InlineProperty>
                <InlineProperty label="Y">
                  <input
                    type="number"
                    className="properties-input"
                    value={skewY}
                    onChange={(e) => setSkewY(parseFloat(e.target.value) || 0)}
                    step={1}
                    min={-90}
                    max={90}
                    aria-label="Skew Y"
                  />
                </InlineProperty>
              </PropertyRow>

              <PropertyRow label="Transform Origin">
                <TransformOriginPicker
                  value={transformOrigin}
                  onChange={setTransformOrigin}
                />
              </PropertyRow>
            </div>
          )}
        </div>

        {/* ===== LAYOUT SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('layout')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.layout ? 'expanded' : ''}`}
              />
              Layout
            </div>
          </div>
          
          {expandedSections.layout && (
            <div className="properties-section-content">
              <LinkedNumberInputs
                value1={width}
                value2={height}
                onChange1={setWidth}
                onChange2={setHeight}
                label1="Width"
                label2="Height"
                min={0}
                max={10000}
                step={1}
                unit="px"
                linkable={true}
              />

              <NumberInput
                label="Z-Index"
                value={zIndex}
                onChange={setZIndex}
                min={-1000}
                max={1000}
                step={1}
                defaultValue={0}
                onReset={() => setZIndex(0)}
              />
            </div>
          )}
        </div>

        {/* ===== STYLE SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('style')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.style ? 'expanded' : ''}`}
              />
              Style
            </div>
          </div>
          
          {expandedSections.style && (
            <div className="properties-section-content">
              <Slider
                label="Opacity"
                value={opacity}
                onChange={setOpacity}
                min={0}
                max={1}
                step={0.01}
              />

              <Slider
                label="Auto Alpha"
                value={autoAlpha}
                onChange={setAutoAlpha}
                min={0}
                max={1}
                step={0.01}
              />

              <ColorPicker
                label="Background"
                value={backgroundColor}
                onChange={setBackgroundColor}
              />

              <ColorPicker
                label="Color"
                value={color}
                onChange={setColor}
              />

              <NumberInput
                label="Border Radius"
                value={borderRadius}
                onChange={setBorderRadius}
                min={0}
                max={1000}
                step={1}
                unit="px"
                defaultValue={0}
                onReset={() => setBorderRadius(0)}
              />

              <NumberInput
                label="Border Width"
                value={borderWidth}
                onChange={setBorderWidth}
                min={0}
                max={100}
                step={1}
                unit="px"
                defaultValue={0}
                onReset={() => setBorderWidth(0)}
              />

              <ColorPicker
                label="Border Color"
                value={borderColor}
                onChange={setBorderColor}
              />
            </div>
          )}
        </div>

        {/* ===== TEXT SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('text')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.text ? 'expanded' : ''}`}
              />
              Text
            </div>
          </div>
          
          {expandedSections.text && (
            <div className="properties-section-content">
              <NumberInput
                label="Font Size"
                value={fontSize}
                onChange={setFontSize}
                min={1}
                max={200}
                step={1}
                unit="px"
                defaultValue={16}
                onReset={() => setFontSize(16)}
              />

              <Select
                label="Font Weight"
                value={fontWeight}
                onChange={setFontWeight}
                options={FONT_WEIGHT_OPTIONS}
              />

              <NumberInput
                label="Line Height"
                value={lineHeight}
                onChange={setLineHeight}
                min={0}
                max={10}
                step={0.1}
                defaultValue={1.5}
                onReset={() => setLineHeight(1.5)}
              />

              <NumberInput
                label="Letter Spacing"
                value={letterSpacing}
                onChange={setLetterSpacing}
                min={-10}
                max={10}
                step={0.1}
                unit="px"
                defaultValue={0}
                onReset={() => setLetterSpacing(0)}
              />

              <Select
                label="Text Align"
                value={textAlign}
                onChange={setTextAlign}
                options={TEXT_ALIGN_OPTIONS}
              />
            </div>
          )}
        </div>

        {/* ===== EFFECTS SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('effects')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.effects ? 'expanded' : ''}`}
              />
              Effects
            </div>
          </div>
          
          {expandedSections.effects && (
            <div className="properties-section-content">
              <Slider
                label="Blur"
                value={blur}
                onChange={setBlur}
                min={0}
                max={50}
                step={0.1}
              />

              <Slider
                label="Brightness"
                value={brightness}
                onChange={setBrightness}
                min={0}
                max={200}
                step={1}
              />

              <Slider
                label="Contrast"
                value={contrast}
                onChange={setContrast}
                min={0}
                max={200}
                step={1}
              />

              <Slider
                label="Saturate"
                value={saturate}
                onChange={setSaturate}
                min={0}
                max={200}
                step={1}
              />
            </div>
          )}
        </div>

        {/* ===== SPACING SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('spacing')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.spacing ? 'expanded' : ''}`}
              />
              Spacing
            </div>
          </div>
          
          {expandedSections.spacing && (
            <div className="properties-section-content">
              <NumberInput
                label="Padding"
                value={padding}
                onChange={setPadding}
                min={0}
                max={200}
                step={1}
                unit="px"
                defaultValue={0}
                onReset={() => setPadding(0)}
              />

              <NumberInput
                label="Margin"
                value={margin}
                onChange={setMargin}
                min={-200}
                max={200}
                step={1}
                unit="px"
                defaultValue={0}
                onReset={() => setMargin(0)}
              />
            </div>
          )}
        </div>

        {/* ===== ANIMATION SECTION ===== */}
        <div className="properties-section">
          <div 
            className="properties-section-header"
            onClick={() => toggleSection('animation')}
          >
            <div className="properties-section-title">
              <ChevronRightIcon 
                className={`properties-section-icon ${expandedSections.animation ? 'expanded' : ''}`}
              />
              Animation
            </div>
          </div>
          
          {expandedSections.animation && (
            <div className="properties-section-content">
              <NumberInput
                label="Duration"
                value={duration}
                onChange={setDuration}
                min={0}
                max={60}
                step={0.1}
                unit="s"
                defaultValue={1}
                onReset={() => setDuration(1)}
              />

              <NumberInput
                label="Delay"
                value={delay}
                onChange={setDelay}
                min={0}
                max={60}
                step={0.1}
                unit="s"
                defaultValue={0}
                onReset={() => setDelay(0)}
              />

              <div className="property-row-with-button">
                <Select
                  label="Easing"
                  value={ease}
                  onChange={setEase}
                  options={EASING_OPTIONS}
                />
                <button
                  className="easing-custom-btn"
                  onClick={() => setShowEasingEditor(true)}
                  title="Custom Easing Curve"
                >
                  ⚙
                </button>
              </div>

              <NumberInput
                label="Repeat"
                value={repeat}
                onChange={setRepeat}
                min={-1}
                max={100}
                step={1}
                defaultValue={0}
                onReset={() => setRepeat(0)}
              />

              <Checkbox
                value={yoyo}
                onChange={setYoyo}
                label="Yoyo (Reverse on repeat)"
              />
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Easing Curve Editor Modal */}
      {showEasingEditor && (
        <EasingCurveEditor
          value={ease}
          onChange={(newEase) => {
            setEase(newEase);
            setShowEasingEditor(false);
          }}
          onClose={() => setShowEasingEditor(false)}
        />
      )}
    </>
  );
};

