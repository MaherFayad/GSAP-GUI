/**
 * Sandbox Client - Agent Script
 * 
 * This script is injected into the user's site to enable communication
 * with the GSAP GUI Editor. It listens for messages from the editor
 * and executes GSAP animations accordingly.
 */

(function() {
  'use strict';

  // Track the currently hovered/highlighted element
  let currentHoveredElement = null;
  
  // Track inspector mode
  let inspectorModeActive = false;
  let inspectorStyleElement = null;
  let savedStyles = new Map();

  // Listen for messages from the editor
  window.addEventListener('message', function(event) {
    // TODO: Add origin validation for security
    // if (event.origin !== 'expected-origin') return;

    const message = event.data;

    // Handle different message types
    switch (message.type) {
      case 'HANDSHAKE_PING':
        // Respond to handshake immediately
        window.parent.postMessage({ type: 'HANDSHAKE_PONG' }, '*');
        break;

      case 'INSPECT_ELEMENT_AT':
        handleInspectElementAt(message);
        break;

      case 'SELECT_ELEMENT_AT':
        handleSelectElementAt(message);
        break;
      
      case 'SET_INSPECTOR_MODE':
        handleSetInspectorMode(message);
        break;

      case 'INIT':
        handleInit(message);
        break;

      case 'PLAY_ANIMATION':
        playTimeline(message.payload);
        break;

      case 'APPLY_ANIMATION':
        handleApplyAnimation(message);
        break;

      case 'REMOVE_ANIMATION':
        handleRemoveAnimation(message);
        break;

      case 'PAUSE_ANIMATION':
        handlePauseAnimation(message);
        break;

      case 'RESUME_ANIMATION':
        handleResumeAnimation(message);
        break;

      case 'RESTART_ANIMATION':
        handleRestartAnimation(message);
        break;

      case 'TWEAK_ANIMATION':
        handleTweakAnimation(message);
        break;

      default:
        console.warn('[Sandbox Client] Unknown message type:', message.type);
    }
  });

  /**
   * Inspect element at given coordinates
   */
  function handleInspectElementAt(message) {
    const { x, y } = message.payload;
    
    // Validate coordinates are within viewport
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
      return;
    }
    
    // Temporarily disable pointer events on the current highlighted element
    // to avoid selecting the highlight overlay itself
    let tempDisabled = null;
    if (currentHoveredElement) {
      tempDisabled = currentHoveredElement;
      tempDisabled.style.pointerEvents = 'none';
    }
    
    // Get the element at the given coordinates
    const el = document.elementFromPoint(x, y);
    
    // Re-enable pointer events
    if (tempDisabled) {
      tempDisabled.style.pointerEvents = '';
    }
    
    // Check if we have a valid element and it's different from the current one
    // Also filter out html, body, and script tags
    if (el && 
        el !== currentHoveredElement && 
        el !== document.documentElement && 
        el !== document.body &&
        el.tagName.toLowerCase() !== 'script') {
      
      // Remove highlight from the previous element
      if (currentHoveredElement) {
        currentHoveredElement.classList.remove('gsp-highlight');
      }
      
      // Add highlight to the new element
      el.classList.add('gsp-highlight');
      
      // Update the current hovered element
      currentHoveredElement = el;
      
      // Get the element's bounding box
      const rect = el.getBoundingClientRect();
      
      // Only send if element is actually visible in viewport
      if (rect.width > 0 && rect.height > 0) {
        // Send the rect back to the parent
        window.parent.postMessage({
          type: 'HIGHLIGHT_ELEMENT',
          payload: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        }, '*');
      }
    }
  }

  /**
   * Select element at given coordinates
   */
  function handleSelectElementAt(message) {
    const { x, y } = message.payload;
    
    // Validate coordinates are within viewport
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
      console.warn('[Sandbox Client] Coordinates out of viewport bounds');
      return;
    }
    
    // Temporarily disable pointer events on the current highlighted element
    let tempDisabled = null;
    if (currentHoveredElement) {
      tempDisabled = currentHoveredElement;
      tempDisabled.style.pointerEvents = 'none';
    }
    
    // Get the element at the given coordinates
    const el = document.elementFromPoint(x, y);
    
    // Re-enable pointer events
    if (tempDisabled) {
      tempDisabled.style.pointerEvents = '';
    }
    
    // Filter out invalid elements
    if (el && 
        el !== document.documentElement && 
        el !== document.body &&
        el.tagName.toLowerCase() !== 'script') {
      
      // Generate a stable CSS selector for this element
      const selector = generateStableSelector(el);
      
      console.log('[Sandbox Client] Element selected:', selector);
      
      // Send the selector back to the parent
      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        payload: {
          selector: selector
        }
      }, '*');
    } else {
      console.warn('[Sandbox Client] Invalid element at coordinates');
    }
  }

  /**
   * Enable or disable inspector mode
   */
  function handleSetInspectorMode(message) {
    const { enabled } = message.payload;
    inspectorModeActive = enabled;
    
    if (enabled) {
      console.log('[Sandbox Client] Enabling inspector mode - disabling hover effects');
      
      // Inject CSS to disable hover effects and prevent layout shifts
      if (!inspectorStyleElement) {
        inspectorStyleElement = document.createElement('style');
        inspectorStyleElement.id = 'gsap-inspector-styles';
        inspectorStyleElement.textContent = `
          /* Disable ALL hover effects and animations during inspection */
          .gsp-inspector-active,
          .gsp-inspector-active * {
            pointer-events: auto !important;
          }
          
          /* Force disable transitions and animations */
          .gsp-inspector-active * {
            transition: none !important;
            animation: none !important;
          }
          
          /* Override all hover transforms and scales with maximum specificity */
          .gsp-inspector-active *:hover {
            transform: none !important;
            scale: 1 !important;
            -webkit-transform: none !important;
          }
          
          /* Keep highlight visible */
          .gsp-inspector-active .gsp-highlight {
            outline: 2px solid #ff6b6b !important;
            outline-offset: 2px;
          }
        `;
        document.head.appendChild(inspectorStyleElement);
      }
      
      document.body.classList.add('gsp-inspector-active');
      
      // Freeze all elements to prevent layout changes
      freezeLayout();
      
    } else {
      console.log('[Sandbox Client] Disabling inspector mode - restoring hover effects');
      
      // Remove inspector styles
      if (inspectorStyleElement) {
        inspectorStyleElement.remove();
        inspectorStyleElement = null;
      }
      
      document.body.classList.remove('gsp-inspector-active');
      
      // Restore layout
      unfreezeLayout();
      
      // Clear any remaining highlights
      if (currentHoveredElement) {
        currentHoveredElement.classList.remove('gsp-highlight');
        currentHoveredElement = null;
      }
    }
  }
  
  /**
   * Freeze layout to prevent hover-induced changes
   */
  function freezeLayout() {
    // Get all elements that might have hover effects
    var allElements = document.querySelectorAll('*');
    
    allElements.forEach(function(el) {
      // Save current computed transform
      var computedStyle = window.getComputedStyle(el);
      var currentTransform = computedStyle.transform;
      
      if (currentTransform && currentTransform !== 'none') {
        savedStyles.set(el, {
          transform: el.style.transform,
          transition: el.style.transition
        });
      }
      
      // Force disable transitions
      el.style.transition = 'none';
      
      // Add mouseenter/mouseleave listeners to prevent hover effects
      el.addEventListener('mouseenter', preventHoverEffect, true);
      el.addEventListener('mouseover', preventHoverEffect, true);
    });
  }
  
  /**
   * Unfreeze layout and restore styles
   */
  function unfreezeLayout() {
    var allElements = document.querySelectorAll('*');
    
    allElements.forEach(function(el) {
      // Restore saved styles
      var saved = savedStyles.get(el);
      if (saved) {
        el.style.transform = saved.transform;
        el.style.transition = saved.transition;
      } else {
        el.style.transition = '';
      }
      
      // Remove event listeners
      el.removeEventListener('mouseenter', preventHoverEffect, true);
      el.removeEventListener('mouseover', preventHoverEffect, true);
    });
    
    savedStyles.clear();
  }
  
  /**
   * Prevent hover effects from applying
   */
  function preventHoverEffect(e) {
    if (inspectorModeActive) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
  
  /**
   * Generate a stable CSS selector for an element
   * Priority-based strategy:
   * 1. Custom data attributes (data-gsap-id, data-animation-id)
   * 2. Unique ID
   * 3. DOM path traversal with nth-child
   */
  function generateStableSelector(el) {
    // Priority 1: Check for custom data attributes
    if (el.dataset.gsapId) {
      return '[data-gsap-id="' + el.dataset.gsapId + '"]';
    }
    
    if (el.dataset.animationId) {
      return '[data-animation-id="' + el.dataset.animationId + '"]';
    }
    
    // Priority 2: Check for unique ID
    if (el.id) {
      // Verify the ID is unique in the document
      const idSelector = '#' + el.id;
      if (document.querySelectorAll(idSelector).length === 1) {
        return idSelector;
      }
    }
    
    // Priority 3: Fall back to DOM path traversal
    var path = [];
    var current = el;
    
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      var selector = current.tagName.toLowerCase();
      
      // Calculate nth-child index
      var sibling = current;
      var nth = 1;
      
      // Count previous siblings with the same tag name
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        nth++;
      }
      
      // Add nth-child to make selector more specific
      selector += ':nth-child(' + nth + ')';
      
      // Prepend to path array
      path.unshift(selector);
      
      // Move up to parent
      current = current.parentElement;
      
      // Stop at body to keep selectors manageable
      if (current === document.body) {
        path.unshift('body');
        break;
      }
    }
    
    // Join the path with direct child combinator
    return path.join(' > ');
  }

  /**
   * Ensure GSAP is loaded from CDN
   * Returns a promise that resolves with the gsap object
   */
  async function ensureGsapIsLoaded() {
    // Check if GSAP is already loaded
    if (window.gsap) {
      return window.gsap;
    }
    
    // Create and load the GSAP script from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    document.head.appendChild(script);
    
    // Return a promise that resolves when the script loads
    return new Promise((resolve) => {
      script.onload = () => resolve(window.gsap);
    });
  }

  /**
   * Play a GSAP timeline with the given data
   * @param {Object} timelineData - The timeline configuration
   * @param {Object} timelineData.settings - Timeline settings (e.g., repeat, yoyo, etc.)
   * @param {Array} timelineData.tweens - Array of tween objects
   * @returns {Promise<gsap.core.Timeline>} The created timeline
   */
  async function playTimeline(timelineData) {
    // Ensure GSAP is loaded
    const gsap = await ensureGsapIsLoaded();
    
    // Create the timeline with provided settings
    const tl = gsap.timeline(timelineData.settings);
    
    // Loop through all tweens and add them to the timeline
    for (const tween of timelineData.tweens) {
      // Parse the ease string back into a GSAP ease function
      if (tween.parameters && tween.parameters.ease) {
        tween.parameters.ease = gsap.parseEase(tween.parameters.ease);
      }
      
      // Reconstruct the GSAP method call based on the tween method
      switch (tween.method) {
        case 'to':
          tl.to(
            tween.target_selector,
            {
              ...tween.end_properties,
              ...tween.parameters
            },
            tween.position
          );
          break;
          
        case 'from':
          tl.from(
            tween.target_selector,
            {
              ...tween.start_properties,
              ...tween.parameters
            },
            tween.position
          );
          break;
          
        case 'fromTo':
          tl.fromTo(
            tween.target_selector,
            tween.start_properties,
            {
              ...tween.end_properties,
              ...tween.parameters
            },
            tween.position
          );
          break;
          
        case 'set':
          tl.set(
            tween.target_selector,
            tween.end_properties,
            tween.position
          );
          break;
          
        default:
          console.warn('[Sandbox Client] Unknown tween method:', tween.method);
      }
    }
    
    return tl;
  }

  /**
   * Initialize the sandbox client
   */
  function handleInit(message) {
    console.log('[Sandbox Client] Initialized');
    
    // Send acknowledgment back to editor
    sendMessage({
      type: 'INIT_ACK',
      payload: {
        ready: true,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Apply GSAP animation to an element
   */
  function handleApplyAnimation(message) {
    const { selector, animation } = message.payload;
    
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: `Element not found: ${selector}`
          }
        });
        return;
      }

      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: 'GSAP library not found'
          }
        });
        return;
      }

      // Apply the animation
      const timeline = gsap.to(element, animation);
      
      sendMessage({
        type: 'ANIMATION_APPLIED',
        payload: {
          selector,
          success: true
        }
      });
    } catch (error) {
      sendMessage({
        type: 'ERROR',
        payload: {
          message: error.message
        }
      });
    }
  }

  /**
   * Remove animation from an element
   */
  function handleRemoveAnimation(message) {
    const { selector } = message.payload;
    
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: `Element not found: ${selector}`
          }
        });
        return;
      }

      // Kill all GSAP animations on this element
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(element);
      }
      
      sendMessage({
        type: 'ANIMATION_REMOVED',
        payload: {
          selector,
          success: true
        }
      });
    } catch (error) {
      sendMessage({
        type: 'ERROR',
        payload: {
          message: error.message
        }
      });
    }
  }

  /**
   * Pause animation on an element
   */
  function handlePauseAnimation(message) {
    const { selector } = message.payload;
    
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: `Element not found: ${selector}`
          }
        });
        return;
      }

      if (typeof gsap !== 'undefined') {
        gsap.getTweensOf(element).forEach(tween => tween.pause());
      }
      
      sendMessage({
        type: 'ANIMATION_PAUSED',
        payload: {
          selector,
          success: true
        }
      });
    } catch (error) {
      sendMessage({
        type: 'ERROR',
        payload: {
          message: error.message
        }
      });
    }
  }

  /**
   * Resume animation on an element
   */
  function handleResumeAnimation(message) {
    const { selector } = message.payload;
    
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: `Element not found: ${selector}`
          }
        });
        return;
      }

      if (typeof gsap !== 'undefined') {
        gsap.getTweensOf(element).forEach(tween => tween.resume());
      }
      
      sendMessage({
        type: 'ANIMATION_RESUMED',
        payload: {
          selector,
          success: true
        }
      });
    } catch (error) {
      sendMessage({
        type: 'ERROR',
        payload: {
          message: error.message
        }
      });
    }
  }

  /**
   * Restart animation on an element
   */
  function handleRestartAnimation(message) {
    const { selector } = message.payload;
    
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        sendMessage({
          type: 'ERROR',
          payload: {
            message: `Element not found: ${selector}`
          }
        });
        return;
      }

      if (typeof gsap !== 'undefined') {
        gsap.getTweensOf(element).forEach(tween => tween.restart());
      }
      
      sendMessage({
        type: 'ANIMATION_RESTARTED',
        payload: {
          selector,
          success: true
        }
      });
    } catch (error) {
      sendMessage({
        type: 'ERROR',
        payload: {
          message: error.message
        }
      });
    }
  }

  /**
   * Handle real-time property tweaking from the properties panel
   * Uses gsap.set() to instantly apply changes as the user adjusts sliders
   */
  async function handleTweakAnimation(message) {
    const { selector, properties } = message.payload;
    
    try {
      // Ensure GSAP is loaded
      const gsap = await ensureGsapIsLoaded();
      
      // Instantly apply the property changes
      gsap.set(selector, properties);
    } catch (error) {
      console.error('[Sandbox Client] Error tweaking animation:', error);
    }
  }

  /**
   * Send a message back to the editor
   */
  function sendMessage(message) {
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }

  // Auto-initialize when script loads
  console.log('[Sandbox Client] Loaded and ready');
})();

