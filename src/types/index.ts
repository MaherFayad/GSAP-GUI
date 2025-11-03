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

// Add more types as needed

