// Utility functions for the GSAP Editor

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Clamps a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Export Supabase client
export { supabase } from './supabaseClient';

// Export transpilers
export { convertJsonToGsapString } from './transpileToString';
export { generateReactComponent, generateReactComponentWithRef } from './transpileToReact';

// Add more utility functions as needed

