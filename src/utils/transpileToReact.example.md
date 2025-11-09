# generateReactComponent - Usage Examples

## Function Overview

The React AST transpiler converts timeline data (JSON) into complete React components with GSAP animations using Babel's AST manipulation.

## Two Versions Available

### 1. `generateReactComponent` - Basic Version
Simple React component that runs GSAP animations in `useLayoutEffect`

### 2. `generateReactComponentWithRef` - Advanced Version
Uses `useRef` and `gsap.context()` for better scoping and cleanup

---

## Basic Usage - `generateReactComponent`

```typescript
import { generateReactComponent } from './utils';

const timelineData = {
  settings: {
    repeat: -1,
    yoyo: true
  },
  tweens: [
    {
      method: 'to',
      target_selector: '.box',
      end_properties: { x: 100, rotation: 360 },
      parameters: { duration: 1, ease: 'power2.inOut' }
    }
  ]
};

const componentCode = generateReactComponent(timelineData);
console.log(componentCode);
```

### Output

```jsx
import { useLayoutEffect } from "react";
import gsap from "gsap";

export function MyAnimation() {
  useLayoutEffect(() => {
    const tl = gsap.timeline({
      "repeat": -1,
      "yoyo": true
    });
    tl.to(".box", {
      "x": 100,
      "rotation": 360,
      "duration": 1,
      ease: "power2.inOut"
    });
  }, []);
  
  return <div className="animation-container"></div>;
}
```

---

## Advanced Usage - `generateReactComponentWithRef`

```typescript
import { generateReactComponentWithRef } from './utils';

const timelineData = {
  settings: {
    repeat: 2,
    yoyo: true
  },
  tweens: [
    {
      method: 'fromTo',
      target_selector: '.box',
      start_properties: { x: 0, opacity: 0 },
      end_properties: { x: 200, opacity: 1 },
      parameters: { duration: 1.5, ease: 'elastic.out' }
    }
  ]
};

const componentCode = generateReactComponentWithRef(timelineData, {
  componentName: 'BouncingBox',
  containerSelector: '.animation-wrapper'
});
console.log(componentCode);
```

### Output

```jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function BouncingBox() {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        "repeat": 2,
        "yoyo": true
      });
      tl.fromTo(".box", {
        "x": 0,
        "opacity": 0
      }, {
        "x": 200,
        "opacity": 1,
        "duration": 1.5,
        ease: "elastic.out"
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);
  
  return <div ref={containerRef} className="animation-wrapper"></div>;
}
```

---

## Complete Example with Multiple Tweens

```typescript
const complexTimeline = {
  settings: {
    repeat: -1,
    yoyo: true,
    repeatDelay: 0.5
  },
  tweens: [
    {
      method: 'set',
      target_selector: '.container',
      end_properties: { autoAlpha: 1 }
    },
    {
      method: 'fromTo',
      target_selector: '.box',
      start_properties: { scale: 0, rotation: 0 },
      end_properties: { scale: 1, rotation: 360 },
      parameters: { duration: 1, ease: 'back.out' },
      position: 0
    },
    {
      method: 'to',
      target_selector: '.box',
      end_properties: { x: 200, y: 100 },
      parameters: { duration: 1.5, ease: 'power2.inOut' },
      position: '+=0.2'
    },
    {
      method: 'to',
      target_selector: '.box',
      end_properties: { scale: 0.5, opacity: 0.3 },
      parameters: { duration: 0.5 },
      position: '<'
    }
  ]
};

const code = generateReactComponentWithRef(complexTimeline, {
  componentName: 'ComplexAnimation',
  containerSelector: '.stage'
});
```

### Output

```jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function ComplexAnimation() {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        "repeat": -1,
        "yoyo": true,
        "repeatDelay": 0.5
      });
      
      tl.set(".container", {
        "autoAlpha": 1
      });
      
      tl.fromTo(".box", {
        "scale": 0,
        "rotation": 0
      }, {
        "scale": 1,
        "rotation": 360,
        "duration": 1,
        ease: "back.out"
      }, 0);
      
      tl.to(".box", {
        "x": 200,
        "y": 100,
        "duration": 1.5,
        ease: "power2.inOut"
      }, "+=0.2");
      
      tl.to(".box", {
        "scale": 0.5,
        "opacity": 0.3,
        "duration": 0.5
      }, "<");
    }, containerRef);
    
    return () => ctx.revert();
  }, []);
  
  return <div ref={containerRef} className="stage"></div>;
}
```

---

## Options

### `componentName` (optional)
- **Type:** `string`
- **Default:** `'MyAnimation'`
- **Description:** Name of the exported React component

### `containerSelector` (optional)
- **Type:** `string`
- **Default:** `'.animation-container'`
- **Description:** CSS class name for the container div (without the `.` prefix in output)

---

## Integration with Supabase

### Export Timeline as React Component

```typescript
import { supabase, generateReactComponentWithRef } from './utils';

async function exportTimelineAsReactComponent(timelineId: string) {
  // Fetch timeline from Supabase
  const { data, error } = await supabase
    .from('animation_timelines')
    .select('name, timeline_data')
    .eq('id', timelineId)
    .single();

  if (error) {
    console.error('Error fetching timeline:', error);
    return null;
  }

  // Generate React component
  const componentCode = generateReactComponentWithRef(
    data.timeline_data,
    {
      componentName: data.name.replace(/\s+/g, ''),
      containerSelector: '.gsap-animation'
    }
  );

  // Save to file or copy to clipboard
  return componentCode;
}
```

### Batch Export Multiple Timelines

```typescript
async function exportAllTimelinesAsComponents(projectId: string) {
  const { data: timelines, error } = await supabase
    .from('animation_timelines')
    .select('id, name, timeline_data')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching timelines:', error);
    return [];
  }

  const components = timelines.map(timeline => ({
    name: timeline.name,
    code: generateReactComponentWithRef(timeline.timeline_data, {
      componentName: timeline.name.replace(/\s+/g, ''),
      containerSelector: `.${timeline.name.toLowerCase().replace(/\s+/g, '-')}`
    })
  }));

  return components;
}
```

---

## Comparison: Basic vs Ref Version

### When to Use `generateReactComponent` (Basic)
✅ Simple animations  
✅ Targeting elements outside the component  
✅ Global selectors (e.g., `body`, `.app`)  
✅ Quick prototypes  

### When to Use `generateReactComponentWithRef` (Ref)
✅ Production applications  
✅ Better performance (scoped context)  
✅ Proper cleanup on unmount  
✅ Multiple instances of the same component  
✅ Animations scoped to component's children  

---

## Technical Details

### AST Construction
Both functions use Babel's AST manipulation via `@babel/types` to programmatically build:
- Import declarations
- Function declarations
- JSX elements
- Hook calls (useLayoutEffect, useRef)
- Arrow functions
- Variable declarations

### Code Generation
The final code is generated using `@babel/generator` which converts the AST back into readable JavaScript/JSX code.

### Integration with String Transpiler
Both functions internally use `convertJsonToGsapString()` to generate the GSAP code, then parse it into AST nodes that are embedded into the React component structure.

---

## Use Cases

1. **Code Export**: Export visual timelines as standalone React components
2. **Component Library**: Build a library of reusable animation components
3. **Documentation**: Auto-generate component docs from timeline data
4. **Code Sharing**: Share animations as copy-pasteable React code
5. **Migration**: Convert JSON animations to React components for production
6. **Version Control**: Track animation changes as readable JSX code
7. **Template Generation**: Create animation templates for teams

---

## Error Handling

```typescript
import { generateReactComponent } from './utils';

try {
  const componentCode = generateReactComponent(timelineData);
  console.log('✅ Component generated successfully');
  console.log(componentCode);
} catch (error) {
  console.error('❌ Failed to generate component:', error.message);
}
```

---

## Advanced: Custom HTML Content

If you need to add custom HTML inside the animation container, you can manually edit the generated code or extend the function:

```jsx
// Generated code can be modified:
export function MyAnimation() {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({});
      tl.to(".box", { x: 100, duration: 1 });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <div ref={containerRef} className="animation-container">
      {/* Add your custom content here */}
      <div className="box">Animate Me!</div>
      <div className="circle"></div>
    </div>
  );
}
```

