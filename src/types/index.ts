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
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  backgroundColor?: string;
  color?: string;
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

