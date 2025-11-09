/**
 * Timeline Data Structure Interfaces
 */
interface TweenParameters {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number | object;
  [key: string]: any;
}

interface Tween {
  method: 'to' | 'from' | 'fromTo' | 'set';
  target_selector: string;
  start_properties?: Record<string, any>;
  end_properties?: Record<string, any>;
  parameters?: TweenParameters;
  position?: string | number;
}

interface TimelineSettings {
  repeat?: number;
  yoyo?: boolean;
  repeatDelay?: number;
  paused?: boolean;
  [key: string]: any;
}

interface TimelineData {
  settings?: TimelineSettings;
  tweens: Tween[];
}

/**
 * Converts a timeline data JSON object into a GSAP code string
 * @param timelineData - The timeline data object containing settings and tweens
 * @returns A string containing the executable GSAP timeline code
 */
export function convertJsonToGsapString(timelineData: TimelineData): string {
  if (!timelineData || !Array.isArray(timelineData.tweens)) {
    throw new Error('Invalid timeline data: must contain a tweens array');
  }

  let code = '';
  
  // Start with timeline creation
  const settingsStr = timelineData.settings && Object.keys(timelineData.settings).length > 0
    ? JSON.stringify(timelineData.settings, null, 2)
    : '{}';
  
  code += `const tl = gsap.timeline(${settingsStr});\n`;
  
  // Loop through all tweens and add them to the code string
  for (const tween of timelineData.tweens) {
    code += '\n';
    
    switch (tween.method) {
      case 'to':
        code += buildToMethod(tween);
        break;
        
      case 'from':
        code += buildFromMethod(tween);
        break;
        
      case 'fromTo':
        code += buildFromToMethod(tween);
        break;
        
      case 'set':
        code += buildSetMethod(tween);
        break;
        
      default:
        console.warn(`Unknown tween method: ${tween.method}`);
    }
  }
  
  return code;
}

/**
 * Builds a .to() method call string
 */
function buildToMethod(tween: Tween): string {
  const selector = JSON.stringify(tween.target_selector);
  const properties = mergePropertiesAndParameters(tween.end_properties || {}, tween.parameters);
  const propertiesStr = formatProperties(properties);
  const position = tween.position !== undefined ? `, ${formatPosition(tween.position)}` : '';
  
  return `tl.to(${selector}, ${propertiesStr}${position});\n`;
}

/**
 * Builds a .from() method call string
 */
function buildFromMethod(tween: Tween): string {
  const selector = JSON.stringify(tween.target_selector);
  const properties = mergePropertiesAndParameters(tween.start_properties || {}, tween.parameters);
  const propertiesStr = formatProperties(properties);
  const position = tween.position !== undefined ? `, ${formatPosition(tween.position)}` : '';
  
  return `tl.from(${selector}, ${propertiesStr}${position});\n`;
}

/**
 * Builds a .fromTo() method call string
 */
function buildFromToMethod(tween: Tween): string {
  const selector = JSON.stringify(tween.target_selector);
  const startProps = tween.start_properties || {};
  const endProps = mergePropertiesAndParameters(tween.end_properties || {}, tween.parameters);
  
  const startPropsStr = formatProperties(startProps);
  const endPropsStr = formatProperties(endProps);
  const position = tween.position !== undefined ? `, ${formatPosition(tween.position)}` : '';
  
  return `tl.fromTo(${selector}, ${startPropsStr}, ${endPropsStr}${position});\n`;
}

/**
 * Builds a .set() method call string
 */
function buildSetMethod(tween: Tween): string {
  const selector = JSON.stringify(tween.target_selector);
  const properties = tween.end_properties || {};
  const propertiesStr = formatProperties(properties);
  const position = tween.position !== undefined ? `, ${formatPosition(tween.position)}` : '';
  
  return `tl.set(${selector}, ${propertiesStr}${position});\n`;
}

/**
 * Merges end properties with parameters for GSAP method calls
 */
function mergePropertiesAndParameters(
  properties: Record<string, any>,
  parameters?: TweenParameters
): Record<string, any> {
  if (!parameters) {
    return properties;
  }
  
  return {
    ...properties,
    ...parameters
  };
}

/**
 * Formats properties object as a string with proper ease handling
 */
function formatProperties(properties: Record<string, any>): string {
  if (Object.keys(properties).length === 0) {
    return '{}';
  }
  
  // Create a copy to avoid mutating the original
  const props = { ...properties };
  
  // Convert ease to a proper string format if it exists
  if (props.ease && typeof props.ease === 'string') {
    const ease = props.ease;
    delete props.ease;
    
    const propsStr = JSON.stringify(props, null, 2);
    
    // If there are other properties, inject ease into the object
    if (Object.keys(props).length > 0) {
      // Remove the closing brace and add ease
      const withoutClosingBrace = propsStr.slice(0, -1);
      return `${withoutClosingBrace},\n  ease: "${ease}"\n}`;
    } else {
      // If ease is the only property
      return `{ ease: "${ease}" }`;
    }
  }
  
  return JSON.stringify(properties, null, 2);
}

/**
 * Formats position value (can be a string like "+=1" or a number)
 */
function formatPosition(position: string | number): string {
  if (typeof position === 'string') {
    return JSON.stringify(position);
  }
  return String(position);
}

/**
 * Generates a complete JavaScript module that can be loaded via CDN
 * @param timelines - Array of timeline objects with id, name, and timeline_data
 * @param projectId - The project ID for reference
 * @returns A complete JavaScript module string
 */
export function generateAnimationModule(
  timelines: Array<{ id: string; name: string; timeline_data: TimelineData }>,
  projectId: string
): string {
  let code = `// GSAP Animation Module for Project: ${projectId}\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// Total Timelines: ${timelines.length}\n\n`;
  
  code += `(function(window) {\n`;
  code += `  'use strict';\n\n`;
  
  code += `  // Check if GSAP is loaded\n`;
  code += `  if (typeof gsap === 'undefined') {\n`;
  code += `    console.error('[GSAP Animation Module] GSAP is not loaded. Please include GSAP before this script.');\n`;
  code += `    return;\n`;
  code += `  }\n\n`;
  
  code += `  const animations = {};\n\n`;
  
  // Generate a function for each timeline
  for (const timeline of timelines) {
    const functionName = timeline.name
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&');
    
    code += `  // Animation: ${timeline.name} (${timeline.id})\n`;
    code += `  animations.${functionName} = function() {\n`;
    
    try {
      const gsapCode = convertJsonToGsapString(timeline.timeline_data);
      // Indent the GSAP code
      const indentedCode = gsapCode.split('\n').map(line => 
        line ? `    ${line}` : ''
      ).join('\n');
      
      code += indentedCode;
      code += `    return tl;\n`;
    } catch (error) {
      code += `    console.error('Failed to generate animation: ${timeline.name}', ${JSON.stringify(error.message)});\n`;
      code += `    return null;\n`;
    }
    
    code += `  };\n\n`;
  }
  
  // Add utility methods
  code += `  // Utility: Play animation by name\n`;
  code += `  animations.play = function(name) {\n`;
  code += `    const functionName = name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');\n`;
  code += `    if (animations[functionName]) {\n`;
  code += `      return animations[functionName]();\n`;
  code += `    } else {\n`;
  code += `      console.error('[GSAP Animation Module] Animation not found:', name);\n`;
  code += `      return null;\n`;
  code += `    }\n`;
  code += `  };\n\n`;
  
  code += `  // Utility: List all available animations\n`;
  code += `  animations.list = function() {\n`;
  code += `    return ${JSON.stringify(timelines.map(t => ({ id: t.id, name: t.name })), null, 4)};\n`;
  code += `  };\n\n`;
  
  code += `  // Export to window\n`;
  code += `  window.GSAPAnimations = animations;\n\n`;
  
  code += `  console.log('[GSAP Animation Module] Loaded ${timelines.length} animation(s) for project ${projectId}');\n`;
  code += `})(window);\n`;
  
  return code;
}

