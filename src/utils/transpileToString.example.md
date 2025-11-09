# convertJsonToGsapString - Usage Examples

## Function Overview

The `convertJsonToGsapString` function converts timeline data (JSON) into executable GSAP code strings.

## Basic Usage

```typescript
import { convertJsonToGsapString } from './utils';

const timelineData = {
  settings: {
    repeat: -1,
    yoyo: true
  },
  tweens: [
    {
      method: 'to',
      target_selector: '.box',
      end_properties: { x: 100, opacity: 1 },
      parameters: { duration: 1, ease: 'power2.inOut' }
    }
  ]
};

const gsapCode = convertJsonToGsapString(timelineData);
console.log(gsapCode);
```

## Output Example

```javascript
const tl = gsap.timeline({
  "repeat": -1,
  "yoyo": true
});

tl.to(".box", {
  "x": 100,
  "opacity": 1,
  "duration": 1,
  ease: "power2.inOut"
});
```

## Complete Example with All Methods

```typescript
const complexTimeline = {
  settings: {
    repeat: 2,
    yoyo: true,
    repeatDelay: 0.5
  },
  tweens: [
    // fromTo method
    {
      method: 'fromTo',
      target_selector: '.box',
      start_properties: { x: 0, opacity: 0 },
      end_properties: { x: 100, opacity: 1 },
      parameters: { duration: 1, ease: 'power2.inOut' },
      position: 0
    },
    // to method with position
    {
      method: 'to',
      target_selector: '.circle',
      end_properties: { rotation: 360, scale: 1.5 },
      parameters: { duration: 0.5, ease: 'bounce.out' },
      position: '+=0.2'
    },
    // from method
    {
      method: 'from',
      target_selector: '.text',
      start_properties: { y: -100, opacity: 0 },
      parameters: { duration: 0.8, ease: 'elastic.out' },
      position: '<'
    },
    // set method
    {
      method: 'set',
      target_selector: '.background',
      end_properties: { backgroundColor: '#ff0000' },
      position: 0
    }
  ]
};

const code = convertJsonToGsapString(complexTimeline);
```

## Output for Complex Example

```javascript
const tl = gsap.timeline({
  "repeat": 2,
  "yoyo": true,
  "repeatDelay": 0.5
});

tl.fromTo(".box", {
  "x": 0,
  "opacity": 0
}, {
  "x": 100,
  "opacity": 1,
  "duration": 1,
  ease: "power2.inOut"
}, 0);

tl.to(".circle", {
  "rotation": 360,
  "scale": 1.5,
  "duration": 0.5,
  ease: "bounce.out"
}, "+=0.2");

tl.from(".text", {
  "y": -100,
  "opacity": 0,
  "duration": 0.8,
  ease: "elastic.out"
}, "<");

tl.set(".background", {
  "backgroundColor": "#ff0000"
}, 0);
```

## Timeline Data Structure

```typescript
interface TimelineData {
  settings?: {
    repeat?: number;
    yoyo?: boolean;
    repeatDelay?: number;
    paused?: boolean;
    [key: string]: any;
  };
  tweens: Array<{
    method: 'to' | 'from' | 'fromTo' | 'set';
    target_selector: string;
    start_properties?: Record<string, any>;  // Used for 'from' and 'fromTo'
    end_properties?: Record<string, any>;    // Used for 'to', 'fromTo', and 'set'
    parameters?: {
      duration?: number;
      ease?: string;
      delay?: number;
      stagger?: number | object;
      [key: string]: any;
    };
    position?: string | number;  // e.g., 0, "+=0.5", "<", ">", "label"
  }>;
}
```

## Integration with Supabase

When fetching timeline data from Supabase:

```typescript
import { supabase, convertJsonToGsapString } from './utils';

async function loadAndTranspileTimeline(timelineId: string) {
  const { data, error } = await supabase
    .from('animation_timelines')
    .select('timeline_data')
    .eq('id', timelineId)
    .single();

  if (error) {
    console.error('Error fetching timeline:', error);
    return null;
  }

  const gsapCode = convertJsonToGsapString(data.timeline_data);
  return gsapCode;
}
```

## Use Cases

1. **Code Export**: Allow users to export their visual timeline as executable code
2. **Preview Generation**: Generate code snippets for preview/debugging
3. **Code Sharing**: Create shareable code snippets from saved timelines
4. **Documentation**: Auto-generate documentation from timeline data
5. **Version Control**: Store human-readable GSAP code alongside JSON data

