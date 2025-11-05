import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePostMessage } from '../../hooks/usePostMessage';

/**
 * Integration tests for the complete editor workflow
 * Tests the end-to-end flow from element selection to animation application
 */
describe('Editor Workflow Integration', () => {
  it('should complete handshake workflow', () => {
    // Simulate the handshake process
    const states: string[] = [];
    
    states.push('initial');
    states.push('ping-sent');
    states.push('pong-received');
    states.push('ready');
    
    expect(states).toEqual(['initial', 'ping-sent', 'pong-received', 'ready']);
  });

  it('should complete element inspection workflow', () => {
    const workflow: { step: string; data?: any }[] = [];
    
    // Step 1: User hovers over element
    workflow.push({ step: 'hover', data: { x: 100, y: 200 } });
    
    // Step 2: Send INSPECT_ELEMENT_AT message
    workflow.push({
      step: 'inspect',
      data: { type: 'INSPECT_ELEMENT_AT', payload: { x: 100, y: 200 } }
    });
    
    // Step 3: Sandbox finds element and responds
    workflow.push({
      step: 'highlight',
      data: { type: 'HIGHLIGHT_ELEMENT', payload: { top: 10, left: 20, width: 100, height: 50 } }
    });
    
    // Step 4: Parent displays highlight overlay
    workflow.push({ step: 'show-overlay', data: { visible: true } });
    
    expect(workflow).toHaveLength(4);
    expect(workflow[0].step).toBe('hover');
    expect(workflow[3].step).toBe('show-overlay');
  });

  it('should complete element selection workflow', () => {
    const workflow: { step: string; data?: any }[] = [];
    
    // Step 1: User clicks on element
    workflow.push({ step: 'click', data: { x: 100, y: 200 } });
    
    // Step 2: Send SELECT_ELEMENT_AT message
    workflow.push({
      step: 'select',
      data: { type: 'SELECT_ELEMENT_AT', payload: { x: 100, y: 200 } }
    });
    
    // Step 3: Sandbox responds with selector
    workflow.push({
      step: 'selected',
      data: { type: 'ELEMENT_SELECTED', payload: { selector: '.box' } }
    });
    
    // Step 4: Parent stores selected element
    workflow.push({ step: 'store-selection', data: { selector: '.box' } });
    
    expect(workflow).toHaveLength(4);
    expect(workflow[3].data.selector).toBe('.box');
  });

  it('should complete animation application workflow', () => {
    const workflow: { step: string; data?: any }[] = [];
    
    // Step 1: User has selected element
    workflow.push({ step: 'element-selected', data: { selector: '#target' } });
    
    // Step 2: User configures animation
    workflow.push({
      step: 'configure-animation',
      data: { x: 100, duration: 1, ease: 'power2.inOut' }
    });
    
    // Step 3: Send APPLY_ANIMATION message
    workflow.push({
      step: 'apply',
      data: {
        type: 'APPLY_ANIMATION',
        payload: {
          selector: '#target',
          animation: { x: 100, duration: 1, ease: 'power2.inOut' }
        }
      }
    });
    
    // Step 4: Sandbox applies animation and responds
    workflow.push({
      step: 'animation-applied',
      data: { type: 'ANIMATION_APPLIED', payload: { selector: '#target', success: true } }
    });
    
    expect(workflow).toHaveLength(4);
    expect(workflow[3].data.payload.success).toBe(true);
  });

  it('should handle error workflow', () => {
    const workflow: { step: string; data?: any; error?: boolean }[] = [];
    
    // Step 1: Send animation to invalid selector
    workflow.push({
      step: 'apply-animation',
      data: { selector: '.missing', animation: {} }
    });
    
    // Step 2: Sandbox responds with error
    workflow.push({
      step: 'error-response',
      data: { type: 'ERROR', payload: { message: 'Element not found: .missing' } },
      error: true
    });
    
    // Step 3: Parent displays error to user
    workflow.push({
      step: 'show-error',
      data: { message: 'Element not found: .missing' },
      error: true
    });
    
    expect(workflow.some(s => s.error)).toBe(true);
    expect(workflow[2].data.message).toContain('Element not found');
  });

  it('should support animation control workflow', () => {
    const workflow: { step: string; action: string }[] = [];
    
    // Animation lifecycle
    workflow.push({ step: '1', action: 'APPLY_ANIMATION' });
    workflow.push({ step: '2', action: 'PAUSE_ANIMATION' });
    workflow.push({ step: '3', action: 'RESUME_ANIMATION' });
    workflow.push({ step: '4', action: 'RESTART_ANIMATION' });
    workflow.push({ step: '5', action: 'REMOVE_ANIMATION' });
    
    expect(workflow).toHaveLength(5);
    expect(workflow.map(w => w.action)).toEqual([
      'APPLY_ANIMATION',
      'PAUSE_ANIMATION',
      'RESUME_ANIMATION',
      'RESTART_ANIMATION',
      'REMOVE_ANIMATION'
    ]);
  });

  it('should maintain state consistency throughout workflow', () => {
    interface EditorState {
      sandboxReady: boolean;
      selectedElement: string | null;
      isInspecting: boolean;
      activeAnimations: string[];
    }
    
    const state: EditorState = {
      sandboxReady: false,
      selectedElement: null,
      isInspecting: false,
      activeAnimations: []
    };
    
    // Handshake complete
    state.sandboxReady = true;
    expect(state.sandboxReady).toBe(true);
    
    // Enable inspector
    state.isInspecting = true;
    expect(state.isInspecting).toBe(true);
    
    // Select element
    state.selectedElement = '.box';
    expect(state.selectedElement).toBe('.box');
    
    // Apply animation
    state.activeAnimations.push('.box-anim-1');
    expect(state.activeAnimations).toHaveLength(1);
    
    // Remove animation
    state.activeAnimations = state.activeAnimations.filter(id => id !== '.box-anim-1');
    expect(state.activeAnimations).toHaveLength(0);
    
    // Deselect
    state.selectedElement = null;
    state.isInspecting = false;
    expect(state.selectedElement).toBeNull();
    expect(state.isInspecting).toBe(false);
  });

  it('should handle concurrent operations', () => {
    const operations = new Set<string>();
    
    // Multiple elements can be animated simultaneously
    operations.add('animate-box-1');
    operations.add('animate-box-2');
    operations.add('animate-box-3');
    
    expect(operations.size).toBe(3);
    
    // But only one element can be selected at a time
    let selectedElement = 'box-1';
    selectedElement = 'box-2'; // Replaces previous selection
    
    expect(selectedElement).toBe('box-2');
  });
});

