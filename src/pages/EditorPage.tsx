import { useRef, useState, useEffect } from 'react';
import { Sandbox, HighlightOverlay, InspectorOverlay } from '../components';
import { usePostMessage } from '../hooks';

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const EditorPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
  const [isInspectorActive, setIsInspectorActive] = useState(true); // Inspector active by default
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const sendMessage = usePostMessage(iframeRef);
  const intervalRef = useRef<number | null>(null);

  // Handle iframe load - start handshake
  const onLoad = () => {
    console.log('[EditorPage] Sandbox loaded, starting handshake...');
    
    // Start sending HANDSHAKE_PING repeatedly
    intervalRef.current = window.setInterval(() => {
      sendMessage('HANDSHAKE_PING');
    }, 100);
  };
  
  // Send inspector mode state to sandbox whenever it changes
  useEffect(() => {
    if (isSandboxReady) {
      sendMessage('SET_INSPECTOR_MODE', { enabled: isInspectorActive });
    }
  }, [isInspectorActive, isSandboxReady, sendMessage]);

  // Listen for messages from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // SECURITY FIX: Validate origin - only accept messages from same origin
      // For srcDoc iframes, the origin is the same as the parent window
      if (event.origin !== window.location.origin) {
        console.warn('[EditorPage] Rejected message from unauthorized origin:', event.origin);
        return;
      }
      
      if (event.data.type === 'HANDSHAKE_PONG') {
        console.log('[EditorPage] Received HANDSHAKE_PONG - sandbox ready!');
        
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Mark sandbox as ready
        setIsSandboxReady(true);
      } else if (event.data.type === 'HIGHLIGHT_ELEMENT') {
        // Update highlight box with element's bounding rect
        setHighlightBox(event.data.payload);
      } else if (event.data.type === 'ELEMENT_SELECTED') {
        // Store the selected element's CSS selector
        console.log('[EditorPage] Element selected:', event.data.payload.selector);
        setSelectedSelector(event.data.payload.selector);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      
      // Clear interval if component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sample HTML with sandbox client script
  const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sandbox Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: sans-serif;
      background: #f5f5f5;
    }
    .box {
      width: 100px;
      height: 100px;
      background: #3498db;
      margin: 20px;
    }
    /* Highlight style for inspector */
    .gsp-highlight {
      outline: 2px solid #ff6b6b !important;
      outline-offset: 2px;
      background-color: rgba(255, 107, 107, 0.1) !important;
    }
  </style>
</head>
<body>
  <h1>GSAP Sandbox</h1>
  <p>Click on any element below to select it!</p>
  
  <div class="box"></div>
  <div class="box" style="background: #e74c3c;"></div>
  <div class="box" style="background: #f39c12;"></div>
  
  <button id="my-button" style="padding: 10px 20px; margin: 20px; cursor: pointer;">Click Me!</button>
  
  <div style="margin: 20px;">
    <h3>Sample Elements</h3>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>
  
  <!-- Inject the sandbox client script -->
  <script src="/sandbox-client.js"></script>
  
  <!-- GSAP library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>
  `.trim();

  // Get iframe rect for positioning the highlight overlay
  const iframeRect = iframeRef.current ? {
    top: iframeRef.current.getBoundingClientRect().top,
    left: iframeRef.current.getBoundingClientRect().left
  } : null;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>GSAP Editor</h2>
          <p style={{ margin: '5px 0' }}>
            Sandbox Status: {isSandboxReady ? '✅ Ready' : '⏳ Connecting...'}
          </p>
          {selectedSelector && (
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#3498db' }}>
              Selected: <code style={{ background: '#444', padding: '2px 6px', borderRadius: '3px' }}>{selectedSelector}</code>
            </p>
          )}
        </div>
        <button
          onClick={() => setIsInspectorActive(!isInspectorActive)}
          style={{
            padding: '10px 20px',
            background: isInspectorActive ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isInspectorActive ? '🔍 Inspector ON' : '🔍 Inspector OFF'}
        </button>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Sandbox 
          ref={iframeRef}
          srcDoc={sampleHTML}
          onLoad={onLoad}
        />
        
        {/* Inspector overlay to capture mouse events */}
        {isInspectorActive && isSandboxReady && (
          <InspectorOverlay iframeRef={iframeRef} />
        )}
        
        {/* Highlight overlay to show selected element */}
        <HighlightOverlay 
          highlightBox={highlightBox}
          iframeRect={iframeRect}
        />
      </div>
    </div>
  );
};

