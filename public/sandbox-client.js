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

      case 'INIT':
        handleInit(message);
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

      default:
        console.warn('[Sandbox Client] Unknown message type:', message.type);
    }
  });

  /**
   * Inspect element at given coordinates
   */
  function handleInspectElementAt(message) {
    const { x, y } = message.payload;
    
    // Get the element at the given coordinates
    const el = document.elementFromPoint(x, y);
    
    // Check if we have a valid element and it's different from the current one
    if (el && el !== currentHoveredElement) {
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

  /**
   * Select element at given coordinates
   */
  function handleSelectElementAt(message) {
    const { x, y } = message.payload;
    
    // Get the element at the given coordinates
    const el = document.elementFromPoint(x, y);
    
    if (el) {
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
    }
  }

  /**
   * Generate a stable CSS selector for an element
   * Prioritizes ID, then class combinations, then tag with nth-child
   */
  function generateStableSelector(element) {
    // If element has an ID, use it (most stable)
    if (element.id) {
      return '#' + element.id;
    }

    // Try to build a selector using classes
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(function(cls) {
        // Filter out highlight class we added
        return cls && cls !== 'gsp-highlight';
      });
      
      if (classes.length > 0) {
        const classSelector = element.tagName.toLowerCase() + '.' + classes.join('.');
        // Check if this selector is unique
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
    }

    // Build a path using tag names and nth-child
    var path = [];
    var current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      var selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector = '#' + current.id;
        path.unshift(selector);
        break;
      } else {
        var sibling = current;
        var nth = 1;
        
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.tagName === current.tagName) {
            nth++;
          }
        }
        
        if (nth > 1 || current.nextElementSibling) {
          selector += ':nth-child(' + nth + ')';
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
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

