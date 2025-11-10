// Type definitions for the GSAP Editor

export interface Animation {
  id: string;
  name: string;
  duration: number;
  delay?: number;
  ease?: string;
}

export interface Timeline {
  id: string;
  name: string;
  animations: Animation[];
}

// Animation data structures for keyframes
export interface TweenProperties {
  // Transform
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  scale?: number;
  rotation?: number;
  rotationX?: number;
  rotationY?: number;
  skewX?: number;
  skewY?: number;
  
  // Layout
  width?: number;
  height?: number;
  
  // Style
  opacity?: number;
  backgroundColor?: string;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  
  // Text
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: string;
  
  // Effects
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  
  // Spacing
  padding?: number;
  margin?: number;
  
  // Other GSAP properties
  transformOrigin?: string;
  autoAlpha?: number;
  zIndex?: number;
}

export interface Keyframe {
  id: string;
  time: number;
  selector: string;
  properties: TweenProperties;
  duration?: number;
  ease?: string;
}

export interface TimelineData {
  id: string;
  name: string;
  keyframes: Keyframe[];
}

export interface AnimationData {
  timelines: {
    [key: string]: TimelineData;
  };
  activeTimelineId?: string;
}

// Add more types as needed

